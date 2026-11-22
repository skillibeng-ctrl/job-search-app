import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { createRequire } from "module";

// 🔥 THE FIX: Load pdf-parse as a CommonJS module
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

import OpenAI from "openai";
import { db } from "./db.js";
import templatesRouter from "./templates.js";
const app = express();
const PORT = process.env.PORT || 4000;

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

app.use(helmet());
// 🔥 Fix CORS to allow both 5173 and 5174 (since Vite auto-increments ports)
app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:5174"], 
  credentials: true 
}));
// 🔥 Increased limit to 5mb to allow pasted resume text
app.use(express.json({ limit: "5mb" })); 

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

const VISIBLE = "c.verified = 1 AND j.status = 'published' AND (j.expires_at IS NULL OR j.expires_at > ?)";
const now = () => new Date().toISOString();

const toApi = (r, withDescription = false) => ({
  id: String(r.id),
  title: r.title,
  company_name: r.company_name,
  location: r.location,
  remote: !!r.remote,
  job_type: r.job_type,
  experience_level: r.experience_level,
  posted_at: r.posted_at,
  salary_disclosed: !!r.salary_disclosed,
  salary_min: r.salary_min,
  salary_max: r.salary_max,
  salary_currency: r.salary_currency,
  ...(withDescription ? { description: r.description } : {}),
});

const like = (s) => `%${String(s).replace(/[\\%_]/g, "\\$&")}%`;
const int = (v, fallback) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : fallback);

/* ========================================================= */
/* EXISTING ROUTES                                           */
/* ========================================================= */

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/jobs", (req, res) => {
  const { q, loc, remote, seniority, postedWithin, minSalary, sort } = req.query;
  const where = [VISIBLE];
  const params = [now()];

  if (q) { where.push("(j.title LIKE ? ESCAPE '\\' OR c.name LIKE ? ESCAPE '\\')"); params.push(like(q), like(q)); }
  if (loc) { where.push("j.location LIKE ? ESCAPE '\\'"); params.push(like(loc)); }
  if (remote === "true") where.push("j.remote = 1");
  if (remote === "false") where.push("j.remote = 0");
  if (seniority) { where.push("j.experience_level = ?"); params.push(String(seniority)); }
  if (postedWithin) { where.push("j.posted_at >= ?"); params.push(new Date(Date.now() - int(postedWithin, 30) * 864e5).toISOString()); }
  if (minSalary) { where.push("COALESCE(j.salary_max, 0) >= ?"); params.push(int(minSalary, 0)); }

  const pageSize = Math.min(50, Math.max(1, int(req.query.pageSize, 10)));
  const page = Math.max(1, int(req.query.page, 1));
  const order = sort === "salary" ? "COALESCE(j.salary_max, 0) DESC, j.posted_at DESC" : "j.posted_at DESC";
  const from = `FROM jobs j JOIN companies c ON c.id = j.company_id WHERE ${where.join(" AND ")}`;

  const total = db.prepare(`SELECT COUNT(*) AS n ${from}`).get(...params).n;
  const rows = db
    .prepare(`SELECT j.*, c.name AS company_name ${from} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(...params, pageSize, (page - 1) * pageSize);

  res.json({ jobs: rows.map((r) => toApi(r)), total });
});

app.get("/api/jobs/locations", (_req, res) => {
  const t = now();
  const locations = db
    .prepare(
      `SELECT ci.name AS city, ci.lat, ci.lng, COUNT(*) AS count
       FROM jobs j JOIN companies c ON c.id = j.company_id JOIN cities ci ON ci.id = j.city_id
       WHERE ${VISIBLE} GROUP BY ci.id ORDER BY count DESC`
    )
    .all(t);
  const remoteCount = db
    .prepare(`SELECT COUNT(*) AS n FROM jobs j JOIN companies c ON c.id = j.company_id WHERE ${VISIBLE} AND j.remote = 1`)
    .get(t).n;
  res.set("Cache-Control", "public, max-age=300");
  res.json({ locations, remoteCount });
});

app.get("/api/stats", (_req, res) => {
  const t = now();
  const openRoles = db.prepare(`SELECT COUNT(*) AS n FROM jobs j JOIN companies c ON c.id = j.company_id WHERE ${VISIBLE}`).get(t).n;
  const verifiedCompanies = db.prepare("SELECT COUNT(*) AS n FROM companies WHERE verified = 1").get().n;
  res.set("Cache-Control", "public, max-age=300");
  res.json({ openRoles, verifiedCompanies });
});

app.get("/api/jobs/:id", (req, res) => {
  const row = db
    .prepare(`SELECT j.*, c.name AS company_name FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.id = ? AND ${VISIBLE}`)
    .get(int(req.params.id, -1), now());
  if (!row) return res.status(404).json({ message: "Job not found." });
  res.json({ job: toApi(row, true) });
});

// Resume Builder (Save/Load from DB)
db.exec(`
CREATE TABLE IF NOT EXISTS resumes (
  user_id    TEXT PRIMARY KEY,
  data       TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

app.get("/api/resume-builder", (req, res) => {
  const userId = String(req.query.userId || "test-user");
  const row = db.prepare("SELECT data FROM resumes WHERE user_id = ?").get(userId);
  if (!row) return res.json({ resume: null });
  try { res.json({ resume: JSON.parse(row.data) }); } catch { res.json({ resume: null }); }
});

app.post("/api/resume-builder", (req, res) => {
  const userId = String(req.body?.userId || "test-user");
  const resumeData = req.body?.resume;
  if (!resumeData || typeof resumeData !== "object") return res.status(400).json({ message: "Missing resume data." });

  db.prepare(
    `INSERT INTO resumes (user_id, data) VALUES (?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`
  ).run(userId, JSON.stringify(resumeData));

  res.json({ success: true });
});

app.use(templatesRouter);

/* ========================================================= */
/* 🔥 NEW AI & RESUME MATCH ROUTES                           */
/* ========================================================= */

const resumes = new Map(); // Temporary memory storage

// 1. The frontend calls this on load to see if a resume exists
app.get("/api/resume", (req, res) => {
  res.json({ resume: null }); // Always return null for now so the upload box shows
});

// 2. The frontend calls this to get the list of jobs to compare against
app.get("/api/me/jobs", (req, res) => {
  try {
    // Fetch 3 real jobs from your database
    const jobs = db.prepare("SELECT id, title FROM jobs LIMIT 3").all();
    const formatted = jobs.map(j => ({
      id: String(j.id),
      title: j.title,
      company: "JobFlow Partner",
      status: "applied"
    }));
    res.json({ jobs: formatted });
  } catch {
    res.json({ jobs: [] });
  }
});

// 3. Upload & Parse Resume
app.post("/api/resume", upload.single("file"), async (req, res) => {
  try {
    console.log("File received:", req.file ? req.file.originalname : "No file"); // 🔥 DEBUG LOG

    let resumeText = "";
    
    if (req.file) {
      if (req.file.mimetype === "application/pdf") {
        const data = await pdf(req.file.buffer);
        resumeText = data.text;
      } else {
        resumeText = req.file.buffer.toString("utf-8");
      }
    } else if (req.body.text) {
      resumeText = req.body.text;
    } else {
      return res.status(400).json({ message: "No file or text provided." });
    }

    const resumeId = "res_" + Date.now();
    resumes.set(resumeId, resumeText); 

    res.json({ 
      resume: { 
        id: resumeId, 
        filename: req.file ? req.file.originalname : "Pasted Resume", 
        uploadedAt: new Date().toISOString() 
      } 
    });
  } catch (err) {
    console.error("Upload error:", err); // 🔥 Check terminal for this!
    res.status(500).json({ message: "Failed to read the resume." });
  }
});
// 4. AI Matching Engine
app.post("/api/match", async (req, res) => {
  const { resumeId, jobIds } = req.body;

  const resumeText = resumes.get(resumeId);
  if (!resumeText) {
    return res.status(400).json({ message: "Resume not found. Please upload again." });
  }

  try {
    const results = await Promise.all(jobIds.map(async (id) => {
      const row = db
        .prepare(`SELECT j.*, c.name AS company_name FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.id = ?`)
        .get(int(id, -1));
      
      if (!row) throw new Error(`Job ${id} not found`);

      const prompt = `
        You are an expert tech recruiter. Compare the following resume to the job description.
        
        RESUME: ${resumeText.substring(0, 3000)}
        
        JOB TITLE: ${row.title}
        JOB DESCRIPTION: ${row.description || "No description provided."}
        
        You must return a valid JSON object with EXACTLY this structure:
        {
          "score": (number 0-100),
          "matched": [{"skill": "Skill Name", "evidence": "Quote from resume"}],
          "missing": [{"skill": "Skill Name", "importance": "required" or "preferred"}],
          "experience": {"required": (number), "found": (number), "ok": (boolean)},
          "suggestions": ["Tip to improve resume for this role"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }]
      });

// ... the rest of your AI matching code ...
      return { jobId: id, ...JSON.parse(response.choices[0].message.content) };
    }));

    res.json({ results });
  
  // 🔥 REPLACE THE CATCH BLOCK HERE
  } catch (err) {
    console.error("🔥 AI MATCH ERROR:", err); 
    res.status(500).json({ message: "AI analysis failed.", error: err.message || err.toString() }); 
  }
});

/* ========================================================= */

app.use("/api", (_req, res) => res.status(404).json({ message: "Not found." }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong." });
});

app.listen(PORT, () => console.log(`JobFlow API running at http://localhost:${PORT}`));