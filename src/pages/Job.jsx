import { useEffect, useState } from "react";
import { useJobFilters } from "../hooks/useJobFilters";
import JobCard from "../component/JobCard";
import FilterSidebar from "../component/FilterSidebar";
import { JobCardSkeleton, EmptyState, ErrorState } from "../component/States";
import { MOCK_JOBS } from "../data/jobs";
import { toast } from "sonner";
import { SlidersHorizontal, X } from "lucide-react"; // Make sure you have lucide-react installed

// ... (keep your fetchJobs function exactly as it is) ...

export default function Jobs() {
  const { filters, setFilters } = useJobFilters();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  
  // 🔥 New state for mobile filters
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
    window.dispatchEvent(new Event("jobsUpdated"));
    if (isSaved) toast("Job removed from saved");
    else toast.success("Job saved successfully");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-16">
      
      {/* Search bar (Keep exactly as is) */}
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
        {/* Desktop Sidebar (Hidden on mobile) */}
        <aside className="hidden lg:block">
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </aside>

        <main>
          {/* Mobile Filter Button & Results Count */}
          <div className="mb-4 flex items-center justify-between">
            {status === "success" && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{data.total}</span> jobs
                {filters.q && <> for “{filters.q}”</>}
              </p>
            )}
            
            {/* 🔥 The Mobile Filter Button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* States (Keep exactly as is) */}
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
                <JobCard key={job.id} job={job} saved={saved.includes(job.id)} onSave={toggleSave} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* 🔥 MOBILE FILTER DRAWER (Only visible on small screens when open) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileFiltersOpen(false)} 
          />
          
          {/* Slide-over panel */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
            <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-4 mt-6 flex-1">
              <FilterSidebar filters={filters} setFilters={setFilters} />
            </div>

            {/* Apply button for mobile */}
            <div className="mt-6 border-t border-gray-100 px-4 pt-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}