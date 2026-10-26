// src/components/JobCard.jsx
import { Link } from "react-router-dom";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3.6e6);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function formatSalary(job) {
  if (!job.salary_disclosed || job.salary_min == null) return null;
  const fmt = (n) =>
    job.salary_currency === "NGN"
      ? `₦${(n / 1e6).toFixed(1)}M`
      : `$${(n / 1000).toFixed(0)}k`;
  return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}`;
}

export default function JobCard({ job, onSave, saved = false }) {
  const salary = formatSalary(job);

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-md">
      <Link to={`/jobs/${job.id}`} className="block">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white">
            {job.company_name.slice(0, 1).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-gray-900">
                  {job.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {job.company_name}
                  {job.location && <> · {job.location}</>}
                  {job.remote && (
                    <span className="ml-1.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                      Remote
                    </span>
                  )}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-400">
                {timeAgo(job.posted_at)}
              </span>
            </div>

            <p className={`mt-1 text-sm font-medium ${salary ? "text-gray-800" : "text-gray-400"}`}>
              {salary ?? "Salary not disclosed"}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.job_type && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">
                  {job.job_type.replace("-", " ")}
                </span>
              )}
              {job.experience_level && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">
                  {job.experience_level}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {onSave && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onSave(job.id);
          }}
          aria-label={saved ? "Unsave job" : "Save job"}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg transition ${
            saved
              ? "bg-emerald-50 text-emerald-600"
              : "text-gray-400 opacity-0 hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      )}
    </div>
  );
}