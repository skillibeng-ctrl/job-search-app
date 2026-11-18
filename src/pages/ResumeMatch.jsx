import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom"; // not using React Router? swap <Link to> for <a href>
import { MOCK_JOBS as SITE_JOBS } from "../data/jobs"; // mock mode only: lets ?job=ID show your real job titles. Remove when USE_MOCK is false.
import { toast } from "sonner";
import { AlertTriangle, ArrowRight, Check, FileText, Loader2, Trash2, Upload } from "lucide-react";

/* =====================================================================
   BACKEND CONTRACT (see backend/matchRoute.js for a working sketch)

   GET    /api/resume                -> { resume: { id, filename, uploadedAt } | null }
   POST   /api/resume                multipart "file" (pdf/docx/txt, max 5 MB) OR JSON { text }
                                     -> { resume }
   DELETE /api/resume                -> 204
   GET    /api/me/jobs               -> { jobs: [{ id, title, company, status: "applied"|"saved" }] }
   GET    /api/jobs/:id              -> { job: { id, title, company_name } }   (for /match?job=ID)
   POST   /api/match                 { resumeId, jobIds: string[] (max 10) }
                                     -> { results: [{ jobId, score, matched: [{skill, evidence}],
                                          missing: [{skill, importance: "required"|"preferred"}],
                                          experience: { required, found, ok }, suggestions: string[] }] }

   Errors: 413 too large, 415 wrong type, 422 couldn't read text, 429 limit reached.
   ===================================================================== */

const USE_MOCK = false;
const API_BASE = "http://localhost:4000";
const MAX_BYTES = 5 * 1024 * 1024;
const OK_EXT = [".pdf", ".docx", ".txt"];

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", ...options });
  if (!res.ok) {
    let msg = "";
    try { msg = (await res.json()).message; } catch { /* no body */ }
    throw new ApiError(res.status, msg);
  }
  return res.status === 204 ? null : res.json();
}

/* ---------- mock mode: canned SAMPLE results so you can see the screen. Not real analysis. ---------- */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const MOCK_JOBS = [
  { id: "j1", title: "Senior Frontend Engineer", company: "Vantage", status: "applied" },
  { id: "j2", title: "Product Designer", company: "Northwind", status: "applied" },
  { id: "j3", title: "Data Analyst", company: "Lumen", status: "saved" },
];
const MOCK_RESULTS = {
  j1: { score: 82, matched: [{ skill: "React", evidence: "Built dashboards in React and TypeScript" }, { skill: "TypeScript", evidence: "React and TypeScript" }, { skill: "Design systems", evidence: "Maintained a shared component library" }, { skill: "REST APIs", evidence: "Integrated REST APIs for billing" }], missing: [{ skill: "GraphQL", importance: "required" }, { skill: "Jest testing", importance: "preferred" }], experience: { required: 5, found: 4, ok: false }, suggestions: ["Add numbers to your two latest roles, such as users, speed gains or revenue.", "If you have used GraphQL even in a side project, add it with a one-line result."] },
  j2: { score: 61, matched: [{ skill: "Figma", evidence: "Designed flows in Figma" }, { skill: "User research", evidence: "Ran 12 user interviews" }], missing: [{ skill: "Prototyping", importance: "required" }, { skill: "Design systems", importance: "preferred" }], experience: { required: 3, found: 3, ok: true }, suggestions: ["Link a portfolio case study that shows your process from research to result."] },
  j3: { score: 38, matched: [{ skill: "Excel", evidence: "Built Excel reports for finance" }], missing: [{ skill: "SQL", importance: "required" }, { skill: "Power BI", importance: "required" }, { skill: "Statistics", importance: "preferred" }], experience: { required: 2, found: 1, ok: false }, suggestions: ["Add any SQL or dashboard work, including courses or personal projects, under a Projects heading."] },
};

const api = {
  async getResume() {
    if (USE_MOCK) { try { return JSON.parse(localStorage.getItem("jobflow:mock-resume")); } catch { return null; } }
    return (await request("/api/resume")).resume;
  },
  async saveResume({ file, text }) {
    if (USE_MOCK) {
      await delay(700);
      const r = { id: "mock", filename: file?.name ?? "Pasted resume", uploadedAt: new Date().toISOString() };
      try { localStorage.setItem("jobflow:mock-resume", JSON.stringify(r)); } catch { /* ignore */ }
      return r;
    }
    if (file) {
      const body = new FormData();
      body.append("file", file);
      return (await request("/api/resume", { method: "POST", body })).resume;
    }
    return (await request("/api/resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) })).resume;
  },
  async deleteResume() {
    if (USE_MOCK) { localStorage.removeItem("jobflow:mock-resume"); return; }
    await request("/api/resume", { method: "DELETE" });
  },
  async listJobs() {
    if (USE_MOCK) { await delay(300); return MOCK_JOBS; }
    return (await request("/api/me/jobs")).jobs;
  },
  async getJob(id) {
    if (USE_MOCK) {
      const j = SITE_JOBS.find((x) => String(x.id) === String(id));
      if (!j) throw new ApiError(404, "Job not found");
      return { id: String(j.id), title: j.title, company: j.company_name, status: "viewing" };
    }
    const j = (await request(`/api/jobs/${encodeURIComponent(id)}`)).job;
    return { id: String(j.id), title: j.title, company: j.company_name ?? j.company, status: "viewing" };
  },
  async match(resumeId, jobIds) {
    if (USE_MOCK) {
      await delay(1500);
      const pool = Object.values(MOCK_RESULTS); // sample results; real jobs get a stable sample
      const pick = (id) => MOCK_RESULTS[id] ?? pool[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % pool.length];
      return jobIds.map((id) => ({ jobId: id, ...pick(id) }));
    }
    return (await request("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId, jobIds }) })).results;
  },
};

/* ============================= helpers ============================= */

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

// Labels, not a "perfect" claim: a percentage is an estimate.
function verdict(score) {
  if (score >= 80) return { label: "Strong match", ring: "#047857", text: "text-emerald-800", bg: "bg-emerald-50" };
  if (score >= 60) return { label: "Good match", ring: "#0f766e", text: "text-teal-800", bg: "bg-teal-50" };
  if (score >= 40) return { label: "Partial match", ring: "#b45309", text: "text-amber-900", bg: "bg-amber-50" };
  return { label: "Low match", ring: "#be123c", text: "text-rose-800", bg: "bg-rose-50" };
}

function errorMessage(err, fallback) {
  if (err.status === 413) return "That file is too large. The limit is 5 MB.";
  if (err.status === 415) return "We can read PDF, DOCX and TXT files.";
  if (err.status === 422) return err.message || "We couldn't read any text in that file. If it's a scanned image, paste the text instead.";
  if (err.status === 429) return "You've reached the limit for now. Please try again later.";
  return fallback;
}

function Ring({ score }) {
  const v = verdict(score);
  const C = 2 * Math.PI * 28;
  return (
    <div className="relative h-16 w-16 shrink-0" role="img" aria-label={`${score} percent match`}>
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r="28" fill="none" stroke="#E5E7EB" strokeWidth="6" />
        <circle cx="32" cy="32" r="28" fill="none" stroke={v.ring} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(score / 100) * C} ${C}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900" aria-hidden>{score}%</span>
    </div>
  );
}

/* ============================= page ============================= */

export default function ResumeMatch() {
  const [resume, setResume] = useState(undefined); // undefined = loading, null = none
  const [jobs, setJobs] = useState(null);
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const resultsRef = useRef(null);

  const [params] = useSearchParams();
  const focusJob = params.get("job"); // set by the "Check my match" button on a job card

  useEffect(() => {
    api.getResume().then(setResume).catch(() => setResume(null));
    (async () => {
      let list = [];
      try { list = (await api.listJobs()).map((j) => ({ ...j, id: String(j.id) })); } catch { /* none yet */ }
      let pick = list.filter((x) => x.status === "applied").map((x) => x.id);
      if (focusJob) {
        pick = [focusJob]; // coming from a job card: just that job
        if (!list.some((x) => x.id === focusJob)) {
          try { list = [await api.getJob(focusJob), ...list]; } catch { /* job not found */ }
        }
      }
      setJobs(list);
      setSelected(pick.filter((id) => list.some((x) => x.id === id)));
    })();
  }, [focusJob]);

  const jobById = useMemo(() => Object.fromEntries((jobs ?? []).map((j) => [j.id, j])), [jobs]);

  const saveResume = async (input) => {
    setError("");
    if (input.file) {
      const ext = input.file.name.slice(input.file.name.lastIndexOf(".")).toLowerCase();
      if (!OK_EXT.includes(ext)) { setError("We can read PDF, DOCX and TXT files."); return; }
      if (input.file.size > MAX_BYTES) { setError("That file is too large. The limit is 5 MB."); return; }
    }
    setUploading(true);
    try {
      setResume(await api.saveResume(input));
      setResults(null);
      setPasting(false);
      setPasted("");
    } catch (err) {
      setError(errorMessage(err, "We couldn't save your resume. Please try again."));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeResume = async () => {
    try { await api.deleteResume(); setResume(null); setResults(null); toast.success("Resume deleted"); }
    catch { toast.error("Couldn't delete your resume. Please try again."); }
  };

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 10 ? s : [...s, id]));

  const compare = async () => {
    setBusy(true);
    setError("");
    try {
      const out = await api.match(resume.id, selected);
      setResults([...out].sort((a, b) => b.score - a.score));
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
    } catch (err) {
      setError(errorMessage(err, "We couldn't compare your resume right now. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const ready = Boolean(resume) && selected.length > 0;

  return (
    <main id="main" className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-700">Resume match</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">See how your resume fits your jobs</h1>
          <p className="mt-3 text-lg text-gray-600">Compare your resume with jobs you've applied to or saved. You'll see what already fits, what's missing, and where to learn it.</p>
          {USE_MOCK && <p role="note" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Sample results. Nothing is analysed until your backend is connected.</p>}
        </header>

        {error && <p role="alert" className="mb-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{error}</p>}

        {/* ============ 1. resume ============ */}
        <section aria-labelledby="s1" className="mb-10">
          <h2 id="s1" className="mb-3 text-xl font-bold text-gray-900">1. Your resume</h2>

          {resume === undefined ? (
            <div className="h-24 rounded-2xl bg-white motion-safe:animate-pulse" role="status" aria-label="Loading" />
          ) : resume ? (
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
              <FileText className="h-8 w-8 shrink-0 text-emerald-700" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{resume.filename}</p>
                <p className="text-sm text-gray-600">Added {new Date(resume.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <label className={`cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus-within:outline focus-within:outline-2 focus-within:outline-emerald-600`}>
                Replace
                <input ref={fileRef} type="file" accept={OK_EXT.join(",")} className="sr-only" onChange={(e) => e.target.files[0] && saveResume({ file: e.target.files[0] })} />
              </label>
              <button type="button" onClick={removeResume} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 ${FOCUS}`}><Trash2 className="h-4 w-4" aria-hidden />Delete</button>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
              {uploading ? (
                <p className="flex items-center justify-center gap-2 text-gray-700" role="status"><Loader2 className="h-5 w-5 animate-spin" aria-hidden />Reading your resume…</p>
              ) : pasting ? (
                <div className="text-left">
                  <label htmlFor="paste" className="mb-2 block text-sm font-medium text-gray-900">Paste your resume text</label>
                  <textarea id="paste" value={pasted} onChange={(e) => setPasted(e.target.value)} rows={10} className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
                  <div className="mt-3 flex gap-3">
                    <button type="button" disabled={pasted.trim().length < 200} onClick={() => saveResume({ text: pasted })} className={`rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 ${FOCUS}`}>Save resume</button>
                    <button type="button" onClick={() => setPasting(false)} className={`rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 ${FOCUS}`}>Cancel</button>
                  </div>
                  {pasted.trim().length > 0 && pasted.trim().length < 200 && <p className="mt-2 text-sm text-gray-600">Add a little more text so we have enough to compare.</p>}
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-3 h-8 w-8 text-gray-500" aria-hidden />
                  <label className={`inline-block cursor-pointer rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-emerald-600`}>
                    Upload resume
                    <input ref={fileRef} type="file" accept={OK_EXT.join(",")} className="sr-only" onChange={(e) => e.target.files[0] && saveResume({ file: e.target.files[0] })} />
                  </label>
                  <p className="mt-3 text-sm text-gray-600">PDF, DOCX or TXT, up to 5 MB. Or <button type="button" onClick={() => setPasting(true)} className={`rounded font-medium text-emerald-800 underline ${FOCUS}`}>paste the text</button>.</p>
                </>
              )}
            </div>
          )}
          <p className="mt-3 text-sm text-gray-600">We use your resume only to compare it with jobs, and you can delete it at any time.</p>
        </section>

        {/* ============ 2. jobs ============ */}
        <section aria-labelledby="s2" className="mb-8">
          <h2 id="s2" className="mb-3 text-xl font-bold text-gray-900">2. Choose jobs to compare</h2>
          {jobs === null ? (
            <div className="h-24 rounded-2xl bg-white motion-safe:animate-pulse" role="status" aria-label="Loading jobs" />
          ) : jobs.length === 0 ? (
            <p className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700">You haven't applied to or saved any jobs yet. <Link to="/jobs" className={`rounded font-semibold text-emerald-800 hover:underline ${FOCUS}`}>Browse jobs</Link></p>
          ) : (
            <fieldset>
              <legend className="sr-only">Jobs to compare (up to 10)</legend>
              <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
                {jobs.map((j) => (
                  <li key={j.id}>
                    <label className="flex cursor-pointer items-center gap-4 px-5 py-4 hover:bg-gray-50">
                      <input type="checkbox" checked={selected.includes(j.id)} onChange={() => toggle(j.id)} className="h-5 w-5 accent-emerald-700" />
                      <span className="min-w-0 flex-1"><span className="block truncate font-medium text-gray-900">{j.title}</span><span className="block truncate text-sm text-gray-600">{j.company}</span></span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-gray-700">{j.status}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
        </section>

        <button type="button" onClick={compare} disabled={!ready || busy} aria-busy={busy} className={`flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}>
          {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
          {busy ? "Comparing…" : `Compare with ${selected.length} ${selected.length === 1 ? "job" : "jobs"}`}
        </button>
        {!resume && resume !== undefined && <p className="mt-2 text-center text-sm text-gray-600">Add your resume first.</p>}

        {/* ============ results ============ */}
        {results && (
          <section ref={resultsRef} aria-labelledby="rs" className="mt-14 scroll-mt-24">
            <h2 id="rs" className="mb-2 text-2xl font-extrabold tracking-tight text-gray-900">Your results</h2>
            <p className="mb-6 text-gray-600">Best first. Open a result to see what matches and what's missing.</p>
            <ul className="space-y-4">
              {results.map((r, i) => {
                const job = jobById[r.jobId];
                const v = verdict(r.score);
                return (
                  <li key={r.jobId}>
                    <details className="group rounded-2xl border border-gray-200 bg-white" open={i === 0}>
                      <summary className={`flex cursor-pointer list-none items-center gap-4 rounded-2xl p-5 ${FOCUS}`}>
                        <Ring score={r.score} />
                        <div className="min-w-0 flex-1">
                          {i === 0 && <span className="mb-1 inline-block rounded bg-emerald-700 px-2 py-0.5 text-xs font-bold text-white">{r.score >= 80 ? "Best match" : "Closest match"}</span>}
                          <p className="truncate text-lg font-bold text-gray-900">{job?.title ?? "Job"}</p>
                          <p className="truncate text-sm text-gray-600">{job?.company}</p>
                        </div>
                        <span className={`hidden rounded-full px-3 py-1 text-sm font-semibold sm:inline ${v.bg} ${v.text}`}>{v.label}</span>
                        <ArrowRight className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-open:rotate-90" aria-hidden />
                      </summary>

                      <div className="space-y-6 border-t border-gray-100 p-5">
                        <p className={`inline-block rounded-full px-3 py-1 text-sm font-semibold sm:hidden ${v.bg} ${v.text}`}>{v.label}</p>

                        <div>
                          <h3 className="mb-2 font-semibold text-gray-900">What matches ({r.matched.length})</h3>
                          {r.matched.length === 0 ? <p className="text-sm text-gray-600">No clear matches found.</p> : (
                            <ul className="space-y-2">
                              {r.matched.map((m) => (
                                <li key={m.skill} className="flex items-start gap-2 text-sm">
                                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
                                  <span><span className="font-medium text-gray-900">{m.skill}</span>{m.evidence && <span className="text-gray-600"> · from your resume: “{m.evidence}”</span>}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <h3 className="mb-2 font-semibold text-gray-900">What's missing ({r.missing.length})</h3>
                          {r.missing.length === 0 ? <p className="text-sm text-gray-600">Nothing important is missing.</p> : (
                            <ul className="space-y-2">
                              {r.missing.map((m) => (
                                <li key={m.skill} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                  <span className="font-medium text-gray-900">{m.skill}</span>
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.importance === "required" ? "bg-amber-100 text-amber-900" : "bg-gray-100 text-gray-700"}`}>{m.importance === "required" ? "Required" : "Nice to have"}</span>
                                  <Link to={`/resources?q=${encodeURIComponent(m.skill)}`} className={`inline-flex items-center gap-1 rounded font-semibold text-emerald-800 hover:underline ${FOCUS}`}>Find a guide <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {r.experience?.required > 0 && (
                          <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">Experience:</span> the job asks for about {r.experience.required} years; your resume shows about {r.experience.found}. {r.experience.ok ? "That fits." : "That's a gap, so show your strongest results."}</p>
                        )}

                        {r.suggestions?.length > 0 && (
                          <div>
                            <h3 className="mb-2 font-semibold text-gray-900">Ways to strengthen your resume</h3>
                            <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-700">{r.suggestions.map((s) => <li key={s}>{s}</li>)}</ul>
                          </div>
                        )}

                        <Link to={`/jobs/${r.jobId}`} className={`inline-flex items-center gap-1 rounded font-semibold text-emerald-800 hover:underline ${FOCUS}`}>View this job <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-sm text-gray-600">These are AI estimates based on the text of your resume and each job post. They can be wrong. Use them as a guide, not a verdict, and only add skills you really have.</p>
          </section>
        )}
      </div>
    </main>
  );
}