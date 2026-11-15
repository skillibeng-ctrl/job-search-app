import { Link } from "react-router-dom";
import { Bookmark, FileSearch } from "lucide-react";

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
    job.salary_currency === "NGN" ? `₦${(n / 1e6).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}k`;
  return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}`;
}

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

export default function JobCard({ job, onSave, saved = false, showMatch = true }) {
  const salary = formatSalary(job);
  const company = job.company_name ?? "";

  return (
    <article className="rounded-xl border border-gray-200 bg-white transition hover:border-emerald-300 hover:shadow-md">
      <Link to={`/jobs/${job.id}`} className={`block rounded-t-xl p-4 ${FOCUS}`}>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white" aria-hidden>
            {(company.slice(0, 1) || "?").toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-gray-900">{job.title}</h2>
                <p className="text-sm text-gray-600">
                  {company}
                  {job.location && <> · {job.location}</>}
                  {job.remote && (
                    <span className="ml-1.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800">Remote</span>
                  )}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-500">{timeAgo(job.posted_at)}</span>
            </div>

            <p className={`mt-1 text-sm font-medium ${salary ? "text-gray-800" : "text-gray-500"}`}>
              {salary ?? "Salary not disclosed"}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.job_type && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-700">{job.job_type.replace("-", " ")}</span>
              )}
              {job.experience_level && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-700">{job.experience_level}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Actions sit outside the link (a button inside a link is invalid HTML) and are always visible, so phones can use them too. */}
      {(showMatch || onSave) && (
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-2.5">
          {showMatch ? (
            <Link to={`/match?job=${encodeURIComponent(job.id)}`} className={`inline-flex items-center gap-1.5 rounded text-sm font-semibold text-emerald-800 hover:underline ${FOCUS}`}>
              <FileSearch className="h-4 w-4" aria-hidden />
              Check my match
            </Link>
          ) : <span />}

          {onSave && (
            <button
              type="button"
              onClick={() => onSave(job.id)}
              aria-pressed={saved}
              aria-label={`${saved ? "Unsave" : "Save"} ${job.title}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${FOCUS} ${saved ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
