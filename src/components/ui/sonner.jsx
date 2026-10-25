import { useEffect, useState } from "react";
import { useJobFilters } from "../hooks/useJobFilters";
import JobCard from "../componet/JobCard";
import FilterSidebar from "../componet/FilterSidebar";
import { JobCardSkeleton, EmptyState, ErrorState } from "../componet/States";
import { MOCK_JOBS } from "../data/jobs";
import { toast } from "sonner"; // Using your shadcn sonner

// Mock API
async function fetchJobs(filters) {
  await new Promise((r) => setTimeout(r, 400));
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
    const cutoff = Date.now() - parseInt(filters.postedWithin) * 8.64e7;
    results = results.filter((j) => new Date(j.posted_at).getTime() >= cutoff);
  }
  if (filters.minSalary) results = results.filter((j) => (j.salary_max ?? 0) >= parseInt(filters.minSalary));

  return { jobs: results, total: results.length };
}

export default function Jobs() {
  const { filters, setFilters } = useJobFilters();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  
  // Load saved jobs from localStorage
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
    const isSaved = saved.includes(id);
    const next = isSaved ? saved.filter((x) => x !== id) : [...saved, id];
    setSaved(next);
    localStorage.setItem("savedJobs", JSON.stringify(next));
    
    // Show toast
    if (isSaved) {
      toast("Job removed from saved");
    } else {
      toast.success("Job saved successfully");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-16">
      {/* Search bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFilters({ q: e.target.elements.q.value, loc: e.target.elements.loc.value });
        }}
        className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm flex flex-col sm:flex-row gap-2 sm:gap-1"
      >
        <input name="q" defaultValue={filters.q} placeholder="Job title, skill, or company" className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 sm:bg-transparent" />
        <div className="hidden h-8 w-px self-center bg-gray-200 sm:block" />
        <input name="loc" defaultValue={filters.loc} placeholder="City or “Remote”" className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 sm:bg-transparent" />
        <button type="submit" className="mt-2 w-full rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 sm:mt-0 sm:w-auto">
          Search
        </button>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </aside>

        <main>
          {status === "success" && (
            <p className="mb-4 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{data.total}</span> jobs
              {filters.q && <> for “{filters.q}”</>}
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