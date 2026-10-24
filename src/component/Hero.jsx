import { useEffect, useRef, useState } from "react";

/* ----------------------------- icons ----------------------------- */

const SearchIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
  </svg>
);

const PinIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <circle cx="12" cy="11" r="2.5" />
  </svg>
);

const CheckIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Spinner = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.7s" repeatCount="indefinite" />
    </path>
  </svg>
);

/* ----------------------------- data ----------------------------- */

const POPULAR_SEARCHES = ["Frontend Developer", "Product Designer", "Data Analyst", "Remote"];

const DEMO_MATCH = {
  company: "Vantage",
  companyInitial: "V",
  title: "Senior Frontend Engineer",
  meta: "Remote · Full-time · Posted 2h ago",
  salary: "$120k – $160k",
  fit: 94,
  skills: ["React", "TypeScript", "Design systems"],
  reasons: ["React + TypeScript match", "Within your salary range"],
};

/* ----------------------------- component ----------------------------- */

export default function Hero({
  onSearch,           // ({ role, location }) => Promise<void> | void
  stats,              // { jobs, companies, seekers } — pass null to hide
  badge = null,       // override the top badge text
}) {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef(null);

  /* ⌘K / Ctrl+K focuses the role input (nice power-user touch) */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        firstInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runSearch = async (nextRole, nextLocation) => {
    if (!nextRole.trim() && !nextLocation.trim()) {
      firstInputRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      await onSearch?.({ role: nextRole.trim(), location: nextLocation.trim() });
    } finally {
      setLoading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    runSearch(role, location);
  };

  const chipSearch = (term) => {
    setRole(term);
    runSearch(term, location);
  };

  const hasStats = stats && stats.jobs > 0;

  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* soft background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="absolute -left-40 top-40 h-[26rem] w-[26rem] rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0),white_70%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* ============ LEFT: copy + search ============ */}
          <div className="lg:col-span-7">
            {/* Badge — honest, specific, one signal only */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {badge ?? (hasStats ? `${stats.jobs.toLocaleString()} open roles right now` : "Now live in Lagos & remote")}
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Find the job that{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                actually fits
              </span>{" "}
              you.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Curated openings matched to your skills. No dead listings, no spam, no endless scrolling.
            </p>

            {/* ============ SEARCH — the actual CTA ============ */}
            <form
              onSubmit={submit}
              role="search"
              aria-label="Job search"
              className="mt-8 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-200/50 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 sm:flex sm:items-center sm:gap-1"
            >
              <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 sm:py-3 focus-within:bg-gray-50">
                <SearchIcon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                <label htmlFor="hero-role" className="sr-only">Job title, skill, or company</label>
                <input
                  id="hero-role"
                  ref={firstInputRef}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  type="search"
                  enterKeyHint="search"
                  placeholder="Job title, skill, or company"
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                />
              </div>

              <div className="hidden h-8 w-px bg-gray-200 sm:block" aria-hidden />

              <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 sm:py-3 focus-within:bg-gray-50">
                <PinIcon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                <label htmlFor="hero-location" className="sr-only">City or remote</label>
                <input
                  id="hero-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  type="text"
                  enterKeyHint="search"
                  placeholder="City or “Remote”"
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Searching…
                  </>
                ) : (
                  "Search jobs"
                )}
              </button>
            </form>

            {/* Popular chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500">Popular:</span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => chipSearch(term)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Employer entry — the B2B escape hatch, subtle */}
            <p className="mt-6 text-sm text-gray-500">
              Hiring?{" "}
              <a href="/employers/post" className="font-medium text-emerald-600 underline-offset-4 hover:underline">
                Post a job in 3 minutes →
              </a>
            </p>

            {/* Trust stats — only render if real numbers are provided */}
            {hasStats && (
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-gray-100 pt-6">
                {[
                  [stats.jobs.toLocaleString() + "+", "Open roles"],
                  [stats.companies.toLocaleString(), "Hiring companies"],
                  [stats.seekers.toLocaleString(), "Job seekers"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="text-2xl font-bold text-gray-900">{value}</dt>
                    <dd className="text-xs text-gray-500">{label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* ============ RIGHT: live product preview ============ */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="relative mx-auto max-w-md">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl shadow-gray-300/30">
                {/* header */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Top match for you
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {DEMO_MATCH.fit}% fit
                  </span>
                </div>

                {/* job */}
                <div className="mt-4 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 font-bold text-white">
                    {DEMO_MATCH.companyInitial}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">{DEMO_MATCH.title}</h3>
                    <p className="text-sm text-gray-500">
                      {DEMO_MATCH.company} · {DEMO_MATCH.meta}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{DEMO_MATCH.salary}</p>
                  </div>
                </div>

                {/* skills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {DEMO_MATCH.skills.map((s) => (
                    <span key={s} className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {s}
                    </span>
                  ))}
                </div>

                {/* match reasons — honest, concrete */}
                <div className="mt-4 space-y-1.5 rounded-xl bg-emerald-50/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                    Why this fits you
                  </p>
                  {DEMO_MATCH.reasons.map((r) => (
                    <p key={r} className="flex items-center gap-2 text-xs text-emerald-900">
                      <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                      {r}
                    </p>
                  ))}
                </div>

                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">
                  View job
                  <ArrowIcon className="h-4 w-4" />
                </button>
              </div>

              {/* floating alert card */}
              <div className="absolute -bottom-6 -left-4 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
                <p className="text-xs font-semibold text-gray-900">3 new matches</p>
                <p className="text-[11px] text-gray-500">Sent to your inbox</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}