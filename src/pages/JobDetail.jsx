import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Briefcase, Clock, ExternalLink, ShieldAlert } from "lucide-react";
import { MOCK_JOBS } from "../data/Jobs";
import JobCard from "../component/JobCard";

// Helpers (copied from JobCard to keep it simple)
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3.6e6);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatSalary(job) {
  if (!job.salary_disclosed || job.salary_min == null) return "Salary not disclosed";
  const fmt = (n) =>
    job.salary_currency === "NGN" ? `₦${(n / 1e6).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}k`;
  return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}`;
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the job in our mock data
  const job = MOCK_JOBS.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Job not found</h1>
        <p className="mt-2 text-gray-500">This job may have been filled or removed.</p>
        <button onClick={() => navigate("/jobs")} className="mt-6 rounded-lg bg-gray-900 px-4 py-2 text-white">
          Back to jobs
        </button>
      </div>
    );
  }

  // Get 3 similar jobs for the bottom of the page
  const similarJobs = MOCK_JOBS.filter(
    (j) => j.id !== job.id && j.experience_level === job.experience_level
  ).slice(0, 3);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Back to search
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        {/* Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-2xl font-bold text-white">
                {job.company_name.slice(0, 1)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{job.title}</h1>
                <p className="mt-1 text-lg text-gray-600">{job.company_name}</p>
              </div>
            </div>
            
            {/* Apply button (desktop) */}
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 sm:flex"
            >
              Apply now <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-gray-100 pt-6 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> {job.location}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gray-400" /> {job.job_type}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" /> Posted {timeAgo(job.posted_at)}</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
             <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
               {formatSalary(job)}
             </span>
             <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium capitalize text-gray-700">
               {job.experience_level} level
             </span>
             {job.remote && (
               <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                 Remote
               </span>
             )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900">About the role</h2>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-600">
            {job.description}
            {"\n\n"}
            We are looking for a talented {job.title} to join our team at {job.company_name}. 
            You will work closely with product and engineering to build world-class experiences.
            {"\n\n"}
            Responsibilities:
            {"\n"}• Build and maintain high-quality features.
            {"\n"}• Collaborate with cross-functional teams.
            {"\n"}• Write clean, testable code.
            {"\n\n"}
            Requirements:
            {"\n"}• {job.experience_level === 'entry' ? '0-2' : job.experience_level === 'mid' ? '2-5' : '5+'} years of experience.
            {"\n"}• Strong communication skills.
            {"\n"}• Based in or willing to relocate to {job.location}.
          </p>
        </div>

        {/* Scam Warning */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Protect yourself from scams</p>
            <p className="text-xs text-amber-700 mt-1">Never send money, pay a fee, or share bank details to get a job. Legitimate employers never ask for this.</p>
          </div>
        </div>
        
        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Similar jobs</h2>
            <div className="space-y-3">
              {similarJobs.map(j => <JobCard key={j.id} job={j} />)}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Apply Button (Mobile only) */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] sm:hidden">
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600"
        >
          Apply for this job <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}