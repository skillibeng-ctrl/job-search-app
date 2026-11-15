// Loads your existing mock jobs (src/data/jobs.js) into the database so you can see real API responses.
// DEV ONLY: it marks the sample companies "verified" so they show up. In real life, only YOU verify a company.
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { db } from "./Db.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const jobsFile = process.argv[2] || path.resolve(here, "../src/data/jobs.js");

let jobs;
try {
  const mod = await import(pathToFileURL(jobsFile).href);
  jobs = mod.MOCK_JOBS ?? mod.default;
  if (!Array.isArray(jobs)) throw new Error("no MOCK_JOBS array exported");
} catch (err) {
  console.error(`Couldn't load ${jobsFile}: ${err.message}\nUsage: npm run seed -- path/to/jobs.js`);
  process.exit(1);
}

const CITIES = {
  Lagos: ["Nigeria", 6.5244, 3.3792], Abuja: ["Nigeria", 9.0765, 7.3986], "Port Harcourt": ["Nigeria", 4.8156, 7.0498],
  Nairobi: ["Kenya", -1.2921, 36.8219], London: ["UK", 51.5072, -0.1276], Berlin: ["Germany", 52.52, 13.405],
  "New York": ["USA", 40.7128, -74.006], "San Francisco": ["USA", 37.7749, -122.4194], Toronto: ["Canada", 43.6532, -79.3832],
  Dubai: ["UAE", 25.2048, 55.2708], Singapore: ["Singapore", 1.3521, 103.8198],
};

const insertCity = db.prepare("INSERT OR IGNORE INTO cities (name, country, lat, lng) VALUES (?, ?, ?, ?)");
for (const [name, [country, lat, lng]] of Object.entries(CITIES)) insertCity.run(name, country, lat, lng);
const cityId = (location = "") => {
  const hit = Object.keys(CITIES).find((c) => location.toLowerCase().includes(c.toLowerCase()));
  return hit ? db.prepare("SELECT id FROM cities WHERE name = ?").get(hit).id : null;
};

const nowIso = new Date().toISOString();
const inDays = (d) => new Date(Date.now() + d * 864e5).toISOString();

const upsertCompany = db.prepare(
  "INSERT INTO companies (name, verified, verified_at) VALUES (?, 1, ?) ON CONFLICT(name) DO UPDATE SET name = excluded.name RETURNING id"
);
const insertJob = db.prepare(`
  INSERT INTO jobs (id, company_id, city_id, title, description, location, remote, job_type, experience_level,
                    salary_disclosed, salary_min, salary_max, salary_currency, status, posted_at, expires_at)
  VALUES (@id, @company_id, @city_id, @title, @description, @location, @remote, @job_type, @experience_level,
          @salary_disclosed, @salary_min, @salary_max, @salary_currency, 'published', @posted_at, @expires_at)
  ON CONFLICT(id) DO UPDATE SET title = excluded.title`);

db.transaction(() => {
  for (const j of jobs) {
    const id = Number.isInteger(Number(j.id)) ? Number(j.id) : null;
    const { id: company_id } = upsertCompany.get(j.company_name, nowIso);
    insertJob.run({
      id,
      company_id,
      city_id: cityId(j.location),
      title: j.title,
      description: j.description ?? "",
      location: j.location ?? "",
      remote: j.remote ? 1 : 0,
      job_type: j.job_type ?? null,
      experience_level: j.experience_level ?? null,
      salary_disclosed: (j.salary_disclosed ?? j.salary_min != null) ? 1 : 0,
      salary_min: j.salary_min ?? null,
      salary_max: j.salary_max ?? null,
      salary_currency: j.salary_currency ?? null,
      posted_at: j.posted_at ?? nowIso,
      expires_at: inDays(60),
    });
  }
})();

console.log(`Seeded ${jobs.length} jobs from ${jobsFile}`);