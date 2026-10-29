import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MOCK_JOBS } from "../data/jobs";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";

export default function Applications() {
  const [apps, setApps] = useState([]);

  // Load applications on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("appliedJobs") || "[]");
      setApps(stored);
    } catch {
      setApps([]);
    }
  }, []);

  // Update the status (Applied -> Interviewing, etc.)
  const updateStatus = (jobId, newStatus) => {
    const next = apps.map((app) => 
      app.jobId === jobId ? { ...app, status: newStatus } : app
    );
    setApps(next);
    localStorage.setItem("appliedJobs", JSON.stringify(next));
    toast.success("Status updated");
  };

  // Remove application
  const removeApplication = (jobId) => {
    const next = apps.filter((app) => app.jobId !== jobId);
    setApps(next);
    localStorage.setItem("appliedJobs", JSON.stringify(next));
    
    // Tell the NavBar to update the badge count
    window.dispatchEvent(new Event("jobsUpdated"));
    toast("Application removed");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 mt-16 min-h-[70vh]">
      
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your progress and never lose an opportunity.
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">No applications yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            When you apply for a job, it will show up here so you can track the status.
          </p>
          <Link 
            to="/jobs" 
            className="mt-6 inline-block rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition"
          >
            Find a job
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-200">
            {apps.map((app) => {
              // Find the job details from the mock data
              const job = MOCK_JOBS.find((j) => j.id === app.jobId);
              if (!job) return null;

              return (
                <li key={app.jobId} className="p-4 sm:p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Job Info */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-lg font-bold text-white">
                        {job.company_name.slice(0, 1)}
                      </div>
                      <div>
                        <Link 
                          to={`/jobs/${job.id}`} 
                          className="text-lg font-semibold text-gray-900 hover:text-emerald-600 transition"
                        >
                          {job.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {job.company_name} · {job.location}
                        </p>
                      </div>
                    </div>

                    {/* Status Dropdown & Actions */}
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:block text-xs font-medium text-gray-500">
                        Applied {new Date(app.date).toLocaleDateString()}
                      </span>
                      
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.jobId, e.target.value)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none cursor-pointer ${
                          app.status === 'applied' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                          app.status === 'interview' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                          app.status === 'offer' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                          'border-gray-200 bg-gray-100 text-gray-600'
                        }`}
                      >
                        <option value="applied">Applied</option>
                        <option value="interview">Interviewing</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <button 
                        onClick={() => removeApplication(app.jobId)}
                        className="p-2 text-gray-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
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