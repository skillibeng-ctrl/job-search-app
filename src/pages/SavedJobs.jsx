import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MOCK_JOBS } from "../data/jobs";
import JobCard from "../component/JobCard";
import { JobCardSkeleton } from "../component/States"; // Import skeleton
import { toast } from "sonner";
import { Bookmark, ArrowRight, Trash2 } from "lucide-react";

// 🔥 BACKEND READY: 
// When you connect your database, replace this with a real fetch:
// const res = await fetch('/api/saved-jobs'); return res.json();
async function fetchSavedJobs() {
  await new Promise((resolve) => setTimeout(resolve, 400)); // Simulate network
  const storedIds = JSON.parse(localStorage.getItem("savedJobs") || "[]");
  return MOCK_JOBS.filter((job) => storedIds.includes(job.id));
}

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data
  const loadSavedJobs = () => {
    fetchSavedJobs().then((data) => {
      setJobs(data);
      setLoading(false);
    });
  };

  // Run on mount & listen for global updates
  useEffect(() => {
    loadSavedJobs();

    // Listen for saves/un-saves happening on other pages or tabs
    const handleUpdate = () => loadSavedJobs();
    window.addEventListener("jobsUpdated", handleUpdate);
    return () => window.removeEventListener("jobsUpdated", handleUpdate);
  }, []);

  const removeSave = (id) => {
    // 1. Update localStorage
    const storedIds = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    const next = storedIds.filter((savedId) => savedId !== id);
    localStorage.setItem("savedJobs", JSON.stringify(next));
    
    // 2. Update local state
    setJobs((prev) => prev.filter((job) => job.id !== id));
    
    // 3. Notify NavBar to update the badge
    window.dispatchEvent(new Event("jobsUpdated"));
    
    toast("Job removed from saved");
  };

  const clearAll = () => {
    localStorage.setItem("savedJobs", JSON.stringify([]));
    setJobs([]);
    window.dispatchEvent(new Event("jobsUpdated"));
    toast.success("All saved jobs cleared");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 mt-16 min-h-[70vh]">
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Keep track of roles you want to apply for later.
          </p>
        </div>
        
        {!loading && jobs.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
            </span>
            <button 
              onClick={clearAll}
              className="flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Bookmark className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No saved jobs yet</h3>
          <p className="mt-2 text-sm text-gray-600 max-w-sm">
            When you see a job you like, click the bookmark icon to save it for later. It will show up right here.
          </p>
          <Link
            to="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition"
          >
            Browse jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
      {!loading && jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => (
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