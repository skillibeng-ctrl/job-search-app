import { SearchX, AlertCircle, RefreshCw, Briefcase } from "lucide-react";

/* ========================================================= */
/* 1. LOADING SKELETON                                       */
/* ========================================================= */
export function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 sm:p-5" role="status" aria-label="Loading job...">
      <div className="flex gap-4">
        {/* Company Logo Placeholder */}
        <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-200" />
        
        {/* Text Content Placeholder */}
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 w-2/3 rounded-md bg-gray-200" />
          <div className="h-3 w-1/2 rounded-md bg-gray-100" />
          <div className="h-3 w-1/3 rounded-md bg-gray-100" />
          
          {/* Tag Placeholders */}
          <div className="flex gap-2 pt-1">
            <div className="h-5 w-16 rounded-md bg-gray-100" />
            <div className="h-5 w-20 rounded-md bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* 2. EMPTY STATE                                            */
/* ========================================================= */
export function EmptyState({ filters, setFilters }) {
  // Figure out the best advice based on active filters
  const hint = filters.minSalary
    ? "Try removing the salary floor — it may be excluding roles that pay slightly less."
    : filters.postedWithin
    ? "Try widening the date range. New jobs are added every day."
    : "Try a broader keyword, a different location, or clearing all filters.";

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-10 text-center sm:p-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <SearchX className="h-8 w-8 text-emerald-600" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900">No jobs match your search</h3>
      <p className="mt-2 max-w-md text-sm text-gray-600 leading-relaxed">
        {hint}
      </p>
      
      {hasActiveFilters && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {filters.minSalary && (
            <button 
              onClick={() => setFilters({ minSalary: "" })} 
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
            >
              Remove salary filter
            </button>
          )}
          <button
            onClick={() => setFilters({ q: "", loc: "", remote: "", seniority: "", minSalary: "", postedWithin: "" })}
            className="rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Clear all filters
          </button>
        </div>
      )}

      {!hasActiveFilters && (
        <div className="mt-6 text-sm text-gray-500">
          Check back later, we add new roles every day!
        </div>
      )}
    </div>
  );
}

export function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center sm:p-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
        <AlertCircle className="h-8 w-8 text-rose-600" />
      </div>
      
      <h3 className="text-xl font-bold text-rose-900">Couldn't load jobs</h3>
      <p className="mt-2 max-w-md text-sm text-rose-700 leading-relaxed">
        This is usually temporary. Check your internet connection and try again. Your filters are still saved.
      </p>
      <button 
        onClick={onRetry} 
        className="mt-6 flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}