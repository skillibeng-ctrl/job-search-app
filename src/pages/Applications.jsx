import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MOCK_JOBS } from "../data/jobs";
import { toast } from "sonner";
import { ExternalLink, Trash2, Briefcase, Clock, CheckCircle2, XCircle } from "lucide-react";

// 🔥 BACKEND READY: 
// When you connect your database, replace this with a real fetch:
// const res = await fetch('/api/applications'); return res.json();
async function fetchApplications() {
  await new Promise((resolve) => setTimeout(resolve, 400)); // Simulate network
  const stored = JSON.parse(localStorage.getItem("appliedJobs") || "[]");
  return stored;
}

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data function (reusable)
  const loadApplications = () => {
    fetchApplications().then((data) => {
      setApps(data);
      setLoading(false);
    });
  };

  // Run on mount & listen for global updates
  useEffect(() => {
    loadApplications();
    
    // If a user applies for a job on another page, sync this page
    const handleUpdate = () => loadApplications();
    window.addEventListener("jobsUpdated", handleUpdate);
    return () => window.removeEventListener("jobsUpdated", handleUpdate);
  }, []);

  // Update the status (Applied -> Interviewing, etc.)
  const updateStatus = (jobId, newStatus) => {
    const next = apps.map((app) => 
      app.jobId === jobId ? { ...app, status: newStatus } : app
    );
    setApps(next);
    localStorage.setItem("appliedJobs", JSON.stringify(next));
    window.dispatchEvent(new Event("jobsUpdated")); // Sync NavBar
    toast.success(`Status updated to ${newStatus}`);
  };

  // Remove application
  const removeApplication = (jobId) => {
    const next = apps.filter((app) => app.jobId !== jobId);
    setApps(next);
    localStorage.setItem("appliedJobs", JSON.stringify(next));
    window.dispatchEvent(new Event("jobsUpdated")); // Sync NavBar
    toast("Application removed");
  };

  // Helper to format date nicely
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 mt-16 min-h-[70vh]">
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your progress and never lose an opportunity.
          </p>
        </div>
        {!loading && apps.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
            <Briefcase className="h-4 w-4" />
            {apps.length} Active {apps.length === 1 ? "Application" : "Applications"}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 h-20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-48 rounded bg-gray-200" />
                  <div className="h-3 w-32 rounded bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && apps.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Briefcase className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No applications yet</h3>
          <p className="mt-2 text-sm text-gray-600 max-w-sm">
            When you apply for a job, it will show up here so you can track the status of your interviews and offers.
          </p>
          <Link 
            to="/jobs" 
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition"
          >
            Find a job <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Populated State */}
      {!loading && apps.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-200">
            {apps.map((app) => {
              const job = MOCK_JOBS.find((j) => j.id === app.jobId);
              if (!job) return null; // In case job was deleted from mock data

              return (
                <li key={app.jobId} className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Job Info */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-lg font-bold text-white shadow-inner">
                        {job.company_name.slice(0, 1)}
                      </div>
                      <div>
                        <Link 
                          to={`/jobs/${job.id}`} 
                          className="text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors"
                        >
                          {job.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {job.company_name} · {job.location}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-gray-500">
                        <Clock className="h-3 w-3" /> Applied {formatDate(app.date)}
                      </span>
                      
                      {/* Status Dropdown */}
                      <div className="relative">
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.jobId, e.target.value)}
                          className={`appearance-none rounded-lg border px-4 py-2 pr-8 text-sm font-semibold outline-none cursor-pointer transition-colors ${
                            app.status === 'applied' ? 'border-blue-200 bg-blue-50 text-blue-700 focus:ring-2 focus:ring-blue-500/20' :
                            app.status === 'interview' ? 'border-amber-200 bg-amber-50 text-amber-700 focus:ring-2 focus:ring-amber-500/20' :
                            app.status === 'offer' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 focus:ring-2 focus:ring-emerald-500/20' :
                            'border-gray-200 bg-gray-100 text-gray-600 focus:ring-2 focus:ring-gray-500/20'
                          }`}
                        >
                          <option value="applied">Applied</option>
                          <option value="interview">Interviewing</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeApplication(app.jobId)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove application"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}