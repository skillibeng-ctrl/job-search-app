import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { db } from "./db.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

/* THE rule that makes "verified, no spam" true. Every public query uses it, so the jobs list,
   the map and the stats can never disagree with each other. */
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

const like = (s) => `%${String(s).replace(/[\\%_]/g, "\\$&")}%`; // user text can't act as a wildcard
const int = (v, fallback) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : fallback);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

/* GET /api/jobs?q=&loc=&remote=&seniority=&postedWithin=&minSalary=&sort=recent|salary&page=&pageSize= */
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

/* Map data: real counts per city, plus remote roles (which have no pin). Same rule as the list. */
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

/* Real numbers for the trust section. Show them only when they are worth showing. */
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

app.use("/api", (_req, res) => res.status(404).json({ message: "Not found." }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong." });
});

app.listen(PORT, () => console.log(`JobFlow API running at http://localhost:${PORT}`));