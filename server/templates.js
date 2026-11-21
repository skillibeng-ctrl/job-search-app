// Resume templates: list + protected downloads.
// In index.js add:   import templatesRouter from "./templates.js";   and   app.use(templatesRouter);
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js"; // ✅ Correct

const FILES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "template-files");

db.exec(`
CREATE TABLE IF NOT EXISTS templates (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  layout      TEXT NOT NULL,                 -- single | two-column | creative | minimal
  accent      TEXT NOT NULL DEFAULT '#047857',
  is_premium  INTEGER NOT NULL DEFAULT 0,
  tags        TEXT NOT NULL DEFAULT '[]',    -- JSON array
  sort_order  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS template_files (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL REFERENCES templates(id),
  label       TEXT NOT NULL,                 -- shown on the button, e.g. "Word"
  filename    TEXT NOT NULL,                 -- file inside server/template-files
  UNIQUE (template_id, label)
);
CREATE TABLE IF NOT EXISTS template_downloads (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id   INTEGER NOT NULL,
  label         TEXT NOT NULL,
  downloaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

// Starter catalogue. Edit freely, or add more rows later through an admin screen.
const SEED = [
  { slug: "modern-tech", title: "The Modern Tech", description: "A single column with a soft tinted header and skill chips.", layout: "single", accent: "#047857", premium: 0, tags: ["Single column", "Clean", "Skill chips"], file: "modern-tech.docx" },
  { slug: "minimalist", title: "The Minimalist", description: "Plain and refined, with dates in the margin and no graphics.", layout: "minimal", accent: "#1d4ed8", premium: 0, tags: ["ATS-friendly", "Simple", "Entry-level"], file: "minimalist.docx" },
  { slug: "executive", title: "The Executive", description: "A navy sidebar with a photo spot, skill levels and gold accents.", layout: "two-column", accent: "#0f172a", premium: 1, tags: ["Two column", "Photo spot", "Skill levels"], file: "executive.docx" },
  { slug: "creative", title: "The Creative", description: "A bold colour header, photo spot and a tinted side column.", layout: "creative", accent: "#7e22ce", premium: 1, tags: ["Colourful", "Photo spot", "Skill levels"], file: "creative.docx" },
];

// Upsert: editing the catalogue above and restarting updates existing rows (but never touches is_premium or published).
const insertT = db.prepare(
  `INSERT INTO templates (slug, title, description, layout, accent, is_premium, tags, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
   ON CONFLICT(slug) DO UPDATE SET title = excluded.title, description = excluded.description, layout = excluded.layout,
     accent = excluded.accent, tags = excluded.tags, sort_order = excluded.sort_order`
);
const insertF = db.prepare("INSERT OR IGNORE INTO template_files (template_id, label, filename) VALUES (?, ?, ?)");
SEED.forEach((t, i) => {
  insertT.run(t.slug, t.title, t.description, t.layout, t.accent, t.premium, JSON.stringify(t.tags), i);
  const id = db.prepare("SELECT id FROM templates WHERE slug = ?").get(t.slug).id;
  insertF.run(id, "Word", t.file);
});

// Payments don't exist yet, so nobody has Pro. Later: look up the signed-in user's plan here.
const canUsePro = (_req) => false;

const onDisk = (filename) => fs.existsSync(path.join(FILES_DIR, filename));

const router = express.Router();

router.get("/api/resume-templates", (_req, res) => {
  const templates = db.prepare("SELECT * FROM templates WHERE published = 1 ORDER BY is_premium ASC, sort_order ASC, id ASC").all();
  const files = db.prepare("SELECT label, filename FROM template_files WHERE template_id = ? ORDER BY id");

  const out = templates
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      isPremium: !!t.is_premium,
      accent: t.accent,
      layout: t.layout,
      tags: JSON.parse(t.tags),
      // only formats whose file really exists, so the page never shows a broken button
      files: files.all(t.id).filter((f) => onDisk(f.filename)).map((f) => ({ label: f.label, url: `/api/resume-templates/${t.id}/download/${encodeURIComponent(f.label)}` })),
    }))
    .filter((t) => t.files.length > 0);

  res.json({ templates: out });
});

router.get("/api/resume-templates/:id/download/:label", (req, res) => {
  const row = db
    .prepare(
      `SELECT t.id, t.slug, t.is_premium, f.label, f.filename
       FROM templates t JOIN template_files f ON f.template_id = t.id
       WHERE t.id = ? AND f.label = ? AND t.published = 1`
    )
    .get(parseInt(req.params.id, 10) || -1, req.params.label);

  if (!row) return res.status(404).json({ message: "Template not found." });
  if (row.is_premium && !canUsePro(req)) return res.status(403).json({ message: "This template is part of Pro." });

  const full = path.join(FILES_DIR, row.filename); // filename comes from the database, never from the request
  if (!full.startsWith(FILES_DIR) || !fs.existsSync(full)) return res.status(404).json({ message: "File not found." });

  db.prepare("INSERT INTO template_downloads (template_id, label) VALUES (?, ?)").run(row.id, row.label);
  res.download(full, `${row.slug}-resume-template${path.extname(row.filename)}`);
});

export default router;