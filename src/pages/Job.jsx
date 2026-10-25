// src/pages/Jobs.jsx
import { useEffect, useState } from "react";
import { useJobFilters } from "../hooks/useJobFilters";
import JobCard from "@/component/JobCard";
import FilterSidebar from "@/component/FilterSidebar";
import { JobCardSkeleton, EmptyState, ErrorState } from "@/component/states";
import { MOCK_JOBS } from "../data/Jobs";

// ─────────────────────────────────────────────────────────────
// TODO: when /api/jobs is live, replace this with:
//   const res = await fetch(`/api/jobs?${params}`);
//   return res.json();
// ─────────────────────────────────────────────────────────────
async function fetchJobs(filters) {
  await new Promise((r) => setTimeout(r, 400)); // simulate network
  let results = [...MOCK_JOBS];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company_name.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
    );
  }
  if (filters.loc) {
    results = results.filter((j) =>
      j.location.toLowerCase().includes(filters.loc.toLowerCase())
    );
  }
  if (filters.remote === true) results = results.filter((j) => j.remote);
  if (filters.remote === false) results = results.filter((j) => !j.remote);
  if (filters.seniority) results = results.filter((j) => j.experience_level === filters.seniority);
  if (filters.postedWithin) {
    const cutoff = Date.now() - parseInt(filters.postedWithin) * 8.64e7;
    results = results.filter((j) => new Date(j.posted_at).getTime() >= cutoff);
  }
  if (filters.minSalary) {
    results = results.filter((j) => (j.salary_max ?? 0) >= parseInt(filters.minSalary));
  }

  return { jobs: results, total: results.length };
}

export default function Jobs() {
  const { filters, setFilters } = useJobFilters();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("savedJobs") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchJobs(filters)
      .then((json) => { if (!cancelled) { setData(json); setStatus("success"); } })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [filters]);

  const toggleSave = (id) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("savedJobs", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* search bar */}
      <SearchBar filters={filters} setFilters={setFilters} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </aside>

        <main>
          <ActiveChips filters={filters} setFilters={setFilters} />

          {status === "success" && (
            <p className="mb-4 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{data.total}</span> jobs
              {filters.q && <> for “{filters.q}”</>}
              {filters.loc && <> in {filters.loc}</>}
            </p>
          )}

          {status === "loading" && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          )}

          {status === "error" && <ErrorState onRetry={() => setFilters({ page: filters.page })} />}

          {status === "success" && data.jobs.length === 0 && (
            <EmptyState filters={filters} setFilters={setFilters} />
          )}

          {status === "success" && data.jobs.length > 0 && (
            <div className="space-y-3">
              {data.jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  saved={saved.includes(job.id)}
                  onSave={toggleSave}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SearchBar({ filters, setFilters }) {
  const [q, setQ] = useState(filters.q);
  const [loc, setLoc] = useState(filters.loc);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setFilters({ q, loc }); }}
      className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm sm:flex sm:gap-1"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Job title, skill, or company"
        className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
      />
      <div className="hidden h-8 w-px self-center bg-gray-200 sm:block" />
      <input
        value={loc}
        onChange={(e) => setLoc(e.target.value)}
        placeholder="City or “Remote”"
        className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
      />
      <button type="submit" className="mt-2 w-full rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 sm:mt-0 sm:w-auto">
        Search
      </button>
    </form>
  );
}

function ActiveChips({ filters, setFilters }) {
  const chips = [
    filters.q && { label: filters.q, clear: () => setFilters({ q: "" }) },
    filters.loc && { label: filters.loc, clear: () => setFilters({ loc: "" }) },
    filters.remote === true && { label: "Remote", clear: () => setFilters({ remote: "" }) },
    filters.seniority && { label: filters.seniority, clear: () => setFilters({ seniority: "" }) },
    filters.postedWithin && { label: `Last ${filters.postedWithin}d`, clear: () => setFilters({ postedWithin: "" }) },
    filters.minSalary && { label: `$${parseInt(filters.minSalary).toLocaleString()}+`, clear: () => setFilters({ minSalary: "" }) },
  ].filter(Boolean);

  if (!chips.length) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((c, i) => (
        <button key={i} onClick={c.clear} className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
          {c.label}
          <span className="text-emerald-600">×</span>
        </button>
      ))}
      <button onClick={() => setFilters({ q: "", loc: "", remote: "", seniority: "", minSalary: "", postedWithin: "" })} className="text-xs text-gray-500 underline-offset-2 hover:underline">
        Clear all
      </button>
    </div>
  );
}