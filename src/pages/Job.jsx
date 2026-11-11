import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useJobFilters } from "../hooks/useJobFilters";
import JobCard from "../component/JobCard";
import FilterSidebar from "../component/FilterSidebar";
import { JobCardSkeleton, EmptyState, ErrorState } from "../component/States";
import { MOCK_JOBS } from "../data/jobs";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal, X } from "lucide-react";

/* =====================================================================
   BACKEND CONTRACT (when you're ready)

   GET    /api/jobs?q=&loc=&remote=&seniority=&postedWithin=&minSalary=
                   &sort=recent|salary&page=1&pageSize=10
          -> { jobs: Job[], total: number }      (total = ALL matches, not just this page)
   PUT    /api/jobs/:id/save   (DELETE to unsave)
   ===================================================================== */

/* ============================= api layer ============================= */

const USE_MOCK = true;  // flip to false when your endpoints exist
const API_BASE = "";    // e.g. "https://api.yoursite.com"
const PAGE_SIZE = 10;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

// Mirrors what the real backend should do: filter, sort, then slice one page.
function searchMock(filters, sort, page) {
  let results = [...MOCK_JOBS];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter((j) => j.title.toLowerCase().includes(q) || j.company_name.toLowerCase().includes(q));
  }
  if (filters.loc) results = results.filter((j) => j.location.toLowerCase().includes(filters.loc.toLowerCase()));
  if (filters.remote === true) results = results.filter((j) => j.remote);
  if (filters.remote === false) results = results.filter((j) => !j.remote);
  if (filters.seniority) results = results.filter((j) => j.experience_level === filters.seniority);
  if (filters.postedWithin) {
    const cutoff = Date.now() - parseInt(filters.postedWithin, 10) * 8.64e7;
    results = results.filter((j) => new Date(j.posted_at).getTime() >= cutoff);
  }
  if (filters.minSalary) results = results.filter((j) => (j.salary_max ?? 0) >= parseInt(filters.minSalary, 10));

  results.sort((a, b) =>
    sort === "salary"
      ? (b.salary_max ?? 0) - (a.salary_max ?? 0)
      : new Date(b.posted_at) - new Date(a.posted_at)
  );

  const start = (page - 1) * PAGE_SIZE;
  return { jobs: results.slice(start, start + PAGE_SIZE), total: results.length };
}

const jobsApi = {
  async search(filters, { sort, page, signal }) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return searchMock(filters, sort, page);
    }
    const qs = new URLSearchParams();
    Object.entries({ ...filters, sort, page, pageSize: PAGE_SIZE }).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    return request(`/api/jobs?${qs}`, { signal });
  },
  async setSaved(id, on) {
    if (!USE_MOCK) await request(`/api/jobs/${id}/save`, { method: on ? "PUT" : "DELETE" });
  },
};

/* ============================= helpers ============================= */

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

const CSS = `
@keyframes jb-slide { from { transform: translateX(100%); } to { transform: none; } }
.jb-slide { animation: jb-slide .2s ease-out; }
@media (prefers-reduced-motion: reduce) { .jb-slide { animation: none; } }
`;

function readSaved() {
  try {
    const v = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Saved jobs: localStorage today, API call ready for when users have accounts.
function useSavedJobs() {
  const [saved, setSaved] = useState(readSaved);

  useEffect(() => {
    const sync = () => setSaved(readSaved()); // changes made in another tab
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const persist = (next) => {
    setSaved(next);
    try { localStorage.setItem("savedJobs", JSON.stringify(next)); } catch { /* storage blocked */ }
    window.dispatchEvent(new Event("jobsUpdated")); // keeps the navbar badge in sync
  };

  const toggle = async (id) => {
    const on = !saved.includes(id);
    const before = saved;
    persist(on ? [...saved, id] : saved.filter((x) => x !== id));
    try {
      await jobsApi.setSaved(id, on);
      if (on) toast.success("Job saved"); else toast("Job removed from saved");
    } catch {
      persist(before);
      toast.error("Couldn't update saved jobs. Please try again.");
    }
  };

  return [saved, toggle];
}

/* ============================= small components ============================= */

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, page + 2);
  const numbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const btn = `flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition ${FOCUS}`;

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} className={`${btn} border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40`} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
      {from > 1 && <span className="px-1 text-gray-500" aria-hidden>…</span>}
      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          aria-label={`Page ${n}`}
          className={`${btn} ${n === page ? "border-emerald-700 bg-emerald-700 text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          {n}
        </button>
      ))}
      {to < totalPages && <span className="px-1 text-gray-500" aria-hidden>…</span>}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages} className={`${btn} border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40`} aria-label="Next page">
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}

function FilterDrawer({ open, onClose, returnFocusRef, resultCount, onClear, activeCount, children }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = [...panelRef.current.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')];
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    const trigger = returnFocusRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex lg:hidden">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="filters-title" className="jb-slide relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <h2 id="filters-title" className="text-lg font-bold text-gray-900">Filters</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close filters" className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 ${FOCUS}`}>
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">{children}</div>
        <div className="flex gap-3 border-t border-gray-100 px-4 py-4">
          {activeCount > 0 && (
            <button type="button" onClick={onClear} className={`rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 ${FOCUS}`}>Clear</button>
          )}
          <button type="button" onClick={onClose} className={`flex-1 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 ${FOCUS}`}>
            {resultCount != null ? `Show ${resultCount.toLocaleString()} ${resultCount === 1 ? "job" : "jobs"}` : "Show results"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================= page ============================= */

export default function Jobs() {
  const { filters, setFilters } = useJobFilters();
  const page = Math.max(1, parseInt(filters.page, 10) || 1);

  const [sort, setSort] = useState("recent"); // move into useJobFilters to put it in the URL
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [reloadKey, setReloadKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // search inputs follow the URL, so Back, "clear" and shared links update them
  const [q, setQ] = useState(filters.q ?? "");
  const [loc, setLoc] = useState(filters.loc ?? "");
  useEffect(() => { setQ(filters.q ?? ""); setLoc(filters.loc ?? ""); }, [filters.q, filters.loc]);

  const [saved, toggleSave] = useSavedJobs();
  const filterButtonRef = useRef(null);
  const resultsRef = useRef(null);

  // any filter change returns to page 1
  const updateFilters = useCallback(
    (patch) => setFilters("page" in patch ? patch : { ...patch, page: 1 }),
    [setFilters]
  );

  useEffect(() => { document.title = "Find jobs | JobFlow"; }, []);

  /* ---- load ---- */
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setStatus("loading");
    jobsApi.search(filters, { sort, page, signal: controller.signal })
      .then((json) => { if (!cancelled) { setData(json); setStatus("success"); } })
      .catch((err) => { if (!cancelled && err?.name !== "AbortError") setStatus("error"); });
    return () => { cancelled = true; controller.abort(); };
  }, [filters, sort, page, reloadKey]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // if filters shrink the results below the current page, go back to the last page
  useEffect(() => {
    if (status === "success" && page > totalPages) updateFilters({ page: totalPages });
  }, [status, page, totalPages, updateFilters]);

  /* ---- applied sidebar filters as removable chips ---- */
  const chips = useMemo(() => {
    const out = [];
    if (filters.remote === true) out.push({ key: "remote", label: "Remote", clear: { remote: undefined } });
    if (filters.remote === false) out.push({ key: "onsite", label: "On-site", clear: { remote: undefined } });
    if (filters.seniority) out.push({ key: "seniority", label: filters.seniority, clear: { seniority: "" } });
    if (filters.postedWithin) out.push({ key: "posted", label: `Last ${filters.postedWithin} days`, clear: { postedWithin: "" } });
    if (filters.minSalary) out.push({ key: "salary", label: `Min ${Number(filters.minSalary).toLocaleString()}`, clear: { minSalary: "" } });
    return out;
  }, [filters]);

  const clearFilters = () =>
    updateFilters({ remote: undefined, seniority: "", postedWithin: "", minSalary: "" });

  const goToPage = (p) => {
    updateFilters({ page: p });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    updateFilters({ q: q.trim(), loc: loc.trim() });
  };

  const firstLoad = !data && status === "loading";
  const refetching = Boolean(data) && status === "loading";
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <style>{CSS}</style>
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-gray-900">Find jobs</h1>

      {/* ============ search ============ */}
      <form role="search" onSubmit={submitSearch} className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 sm:flex-row sm:items-center sm:gap-1">
        <label htmlFor="job-q" className="sr-only">Job title, skill or company</label>
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-50 px-4 sm:bg-transparent">
          <Search className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
          <input id="job-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, skill, or company" autoComplete="off" className="w-full bg-transparent py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-500" />
        </div>
        <div className="hidden h-8 w-px bg-gray-200 sm:block" aria-hidden />
        <label htmlFor="job-loc" className="sr-only">City or remote</label>
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-50 px-4 sm:bg-transparent">
          <MapPin className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
          <input id="job-loc" value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="City or “Remote”" autoComplete="off" className="w-full bg-transparent py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-500" />
        </div>
        <button type="submit" className={`mt-2 w-full rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 sm:mt-0 sm:w-auto ${FOCUS}`}>Search</button>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* ============ desktop sidebar ============ */}
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
            <FilterSidebar filters={filters} setFilters={updateFilters} />
          </div>
        </aside>

        {/* ============ results ============ */}
        <section ref={resultsRef} aria-labelledby="results-heading" className="scroll-mt-24">
          <h2 id="results-heading" className="sr-only">Search results</h2>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600" aria-live="polite">
              {data && status !== "error" && (
                total === 0 ? (
                  "No jobs found"
                ) : (
                  <>
                    Showing <span className="font-semibold text-gray-900">{from}–{to}</span> of{" "}
                    <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> {total === 1 ? "job" : "jobs"}
                    {filters.q && <> for “{filters.q}”</>}
                  </>
                )
              )}
            </p>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <span className="hidden sm:inline">Sort by</span>
                <span className="sr-only sm:hidden">Sort by</span>
                <select value={sort} onChange={(e) => { setSort(e.target.value); updateFilters({ page: 1 }); }} className={`rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ${FOCUS}`}>
                  <option value="recent">Most recent</option>
                  <option value="salary">Highest salary</option>
                </select>
              </label>

              <button
                ref={filterButtonRef}
                type="button"
                onClick={() => setDrawerOpen(true)}
                className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden ${FOCUS}`}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                Filters
                {chips.length > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 text-xs font-bold text-white">{chips.length}</span>}
              </button>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mb-4 flex flex-wrap items-center gap-2" aria-label="Applied filters">
              {chips.map((c) => (
                <li key={c.key}>
                  <button type="button" onClick={() => updateFilters(c.clear)} aria-label={`Remove filter: ${c.label}`} className={`flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 py-1 pl-3 pr-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100 ${FOCUS}`}>
                    {c.label}<X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={clearFilters} className={`rounded text-sm font-medium text-gray-700 underline-offset-2 hover:underline ${FOCUS}`}>Clear all</button>
              </li>
            </ul>
          )}

          {firstLoad && (
            <div className="space-y-3" role="status" aria-label="Loading jobs">
              {Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          )}

          {status === "error" && <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />}

          {data && status !== "error" && total === 0 && !refetching && (
            <EmptyState filters={filters} setFilters={updateFilters} />
          )}

          {data && status !== "error" && data.jobs.length > 0 && (
            <>
              <ul aria-busy={refetching} className={`space-y-3 transition-opacity ${refetching ? "opacity-60" : ""}`}>
                {data.jobs.map((job) => (
                  <li key={job.id}>
                    <JobCard job={job} saved={saved.includes(job.id)} onSave={toggleSave} />
                  </li>
                ))}
              </ul>
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
            </>
          )}
        </section>
      </div>

      {/* ============ mobile filter drawer ============ */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        returnFocusRef={filterButtonRef}
        resultCount={data ? total : null}
        activeCount={chips.length}
        onClear={clearFilters}
      >
        <FilterSidebar filters={filters} setFilters={updateFilters} />
      </FilterDrawer>
    </main>
  );
}