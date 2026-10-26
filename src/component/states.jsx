// src/components/States.jsx
export function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex gap-3">
        <div className="h-11 w-11 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-100" />
          <div className="h-3 w-1/3 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ filters, setFilters }) {
  const hint = filters.minSalary
    ? "Try removing the salary floor — it may be excluding roles that pay slightly less."
    : filters.postedWithin
    ? "Try widening the date range. New jobs are added every day."
    : "Try a broader keyword or a different location.";

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
      <h3 className="text-lg font-semibold text-gray-900">No jobs match this search</h3>
      <p className="mt-1 text-sm text-gray-600">{hint}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {filters.minSalary && (
          <button onClick={() => setFilters({ minSalary: "" })} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Remove salary filter
          </button>
        )}
        <button
          onClick={() => setFilters({ q: "", loc: "", remote: "", seniority: "", minSalary: "", postedWithin: "" })}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}

export function ErrorState({ onRetry }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
      <h3 className="text-lg font-semibold text-rose-900">Couldn't load jobs</h3>
      <p className="mt-1 text-sm text-rose-700">This is usually temporary. Your filters are still saved.</p>
      <button onClick={onRetry} className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
        Try again
      </button>
    </div>
  );
}