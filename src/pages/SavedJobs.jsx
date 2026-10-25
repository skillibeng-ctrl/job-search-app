import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MOCK_JOBS } from "../data/Jobs";
import JobCard from "../component/JobCard";
import { toast } from "sonner";

export default function SavedJobs() {
  const [savedIds, setSavedIds] = useState([]);

  // Load saved IDs when the page loads
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      setSavedIds(stored);
    } catch {
      setSavedIds([]);
    }
  }, []);

  // Filter the mock jobs to only show the saved ones
  const savedJobs = MOCK_JOBS.filter((job) => savedIds.includes(job.id));

  const removeSave = (id) => {
    const next = savedIds.filter((savedId) => savedId !== id);
    setSavedIds(next);
    localStorage.setItem("savedJobs", JSON.stringify(next));
    toast("Job removed from saved");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 mt-16 min-h-[60vh]">
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <span className="text-sm font-medium text-gray-500">
          {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"}
        </span>
      </div>

      {savedJobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">No saved jobs yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            When you see a job you like, click the bookmark icon to save it for later.
          </p>
          <Link
            to="/jobs"
            className="mt-6 inline-block rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={true}
              onSave={removeSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}