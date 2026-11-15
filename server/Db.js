import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const file = process.env.DB_FILE || "./data/jobflow.db";
fs.mkdirSync(path.dirname(file), { recursive: true });

export const db = new Database(file);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// SQLite for now. This SQL is plain and portable, so moving to PostgreSQL later is mostly a driver swap.
db.exec(`
CREATE TABLE IF NOT EXISTS companies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  website     TEXT,
  verified    INTEGER NOT NULL DEFAULT 0,      -- 0 = pending/rejected, 1 = verified by you
  verified_at TEXT,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT NOT NULL UNIQUE,
  country TEXT,
  lat     REAL NOT NULL,
  lng     REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id       INTEGER NOT NULL REFERENCES companies(id),
  city_id          INTEGER REFERENCES cities(id),   -- NULL for remote-only roles
  title            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  location         TEXT NOT NULL DEFAULT '',
  remote           INTEGER NOT NULL DEFAULT 0,
  job_type         TEXT,
  experience_level TEXT,
  salary_disclosed INTEGER NOT NULL DEFAULT 0,
  salary_min       INTEGER,
  salary_max       INTEGER,
  salary_currency  TEXT,
  status           TEXT NOT NULL DEFAULT 'pending_review', -- draft | pending_review | published | closed
  posted_at        TEXT NOT NULL,
  expires_at       TEXT
);
CREATE INDEX IF NOT EXISTS idx_jobs_status_posted ON jobs(status, posted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON jobs(city_id);
`);