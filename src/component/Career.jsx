import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom"; // not using React Router? swap <Link to> for <a href>
import {
  ArrowRight, Briefcase, CheckCircle2, Code, Globe,
  LineChart, Megaphone, PenTool, ShieldCheck,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion"; // shadcn/ui: npx shadcn@latest add accordion

/* ============================= icons ============================= */

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

const ClockIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
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

/* ============================= data ============================= */

const ROLE_SUGGESTIONS = [
  "Frontend Developer", "React Developer", "Backend Developer",
  "Full Stack Developer", "Mobile Developer", "DevOps Engineer",
  "QA Engineer", "Product Designer", "UX Designer", "UI Designer",
  "Data Analyst", "Data Scientist", "Product Manager",
  "Marketing Manager", "Content Writer", "Customer Success",
];

const LOCATION_SUGGESTIONS = [
  "Remote", "Lagos, Nigeria", "Abuja, Nigeria", "Port Harcourt, Nigeria",
  "London, UK", "Berlin, Germany", "New York, USA", "San Francisco, USA",
  "Toronto, Canada", "Dubai, UAE",
];

// "Remote" is a location, not a job title, so chips declare what they fill in.
const POPULAR = [
  { label: "Frontend Developer", field: "role" },
  { label: "Product Designer", field: "role" },
  { label: "Data Analyst", field: "role" },
  { label: "Remote", field: "location" },
];

const DEFAULT_PREVIEW = {
  candidateInitials: "AO",
  fit: 94,
  title: "Senior Frontend Engineer",
  company: "Vantage",
  companyInitial: "V",
  meta: "Remote · Full-time · 2h ago",
  salary: "$120k – $160k",
  skills: ["React", "TypeScript", "Design systems"],
  reasons: ["React + TypeScript match", "Within your salary range"],
};

/* ============================= recent searches ============================= */

const RECENT_KEY = "jobflow:recent-searches";
const MAX_RECENT = 5;

function loadRecent() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((p) => p && (p.role || p.location)) : [];
  } catch {
    return []; // storage blocked, SSR, or corrupt JSON
  }
}

function useRecentSearches() {
  const [items, setItems] = useState(loadRecent);

  const add = (entry) => {
    const same = (a, b) =>
      a.role.toLowerCase() === b.role.toLowerCase() &&
      a.location.toLowerCase() === b.location.toLowerCase();
    const next = [entry, ...items.filter((p) => !same(p, entry))].slice(0, MAX_RECENT);
    setItems(next);
    // Side effects live here, not inside a state updater (which React may run twice).
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  return [items, add];
}

/* ============================= dropdown ============================= */

function SuggestionDropdown({ id, label, heading, options, activeIndex, onSelect }) {
  if (!options.length) return null;
  return (
    <div
      id={id}
      role="listbox"
      aria-label={label}
      className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-auto rounded-xl border border-gray-100 bg-white py-1 shadow-xl shadow-gray-200/60"
    >
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {heading}
      </p>
      {options.map((opt, i) => {
        const Icon = opt.kind === "recent" ? ClockIcon : opt.kind === "location" ? PinIcon : SearchIcon;
        return (
          <button
            key={opt.key}
            id={`${id}-${i}`}
            type="button"
            role="option"
            aria-selected={i === activeIndex}
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()} // keep input focus
            onClick={() => onSelect(opt)}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
              i === activeIndex ? "bg-emerald-50 text-emerald-900" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <span className="truncate">{opt.label}</span>
            {opt.sub && <span className="ml-auto truncate text-xs text-gray-500">{opt.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ============================= main ============================= */

function Hero({
  onSearch,                // ({ role, location }) => Promise<void> | void
  stats = null,            // { jobs, companies, seekers } | null
  trustedBy = null,        // string[] | null
  preview = DEFAULT_PREVIEW,
  badge = null,
}) {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState(null); // 'role' | 'location' | null
  const [activeIndex, setActiveIndex] = useState(-1);

  const [recent, addRecent] = useRecentSearches();

  const containerRef = useRef(null);
  const roleInputRef = useRef(null);
  const locationInputRef = useRef(null);

  const uid = useId();
  const roleListId = `${uid}-role-list`;
  const locationListId = `${uid}-location-list`;

  /* ---- options ---- */

  const roleOptions = useMemo(() => {
    const q = role.trim().toLowerCase();
    const suggestions = ROLE_SUGGESTIONS
      .filter((r) => !q || r.toLowerCase().includes(q))
      .map((r) => ({ key: `s|${r}`, kind: "role", label: r, role: r, location: "" }));

    if (q) return suggestions.slice(0, 6);

    const recents = recent.map((r) => ({
      key: `r|${r.role}|${r.location}`,
      kind: "recent",
      label: r.role || r.location,
      sub: r.role ? r.location : "",
      role: r.role,
      location: r.location,
    }));
    return [...recents, ...suggestions].slice(0, 6);
  }, [role, recent]);

  const locationOptions = useMemo(() => {
    const q = location.trim().toLowerCase();
    return LOCATION_SUGGESTIONS
      .filter((l) => !q || l.toLowerCase().includes(q))
      .slice(0, 6)
      .map((l) => ({ key: `l|${l}`, kind: "location", label: l, location: l }));
  }, [location]);

  const roleHeading = !role.trim() && recent.length > 0 ? "Recent & suggested" : "Suggestions";

  /* ---- ⌘K / Ctrl+K focuses search ---- */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        roleInputRef.current?.focus();
        setActiveField("role");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---- click outside closes dropdowns ---- */
  useEffect(() => {
    if (!activeField) return;
    const onDown = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setActiveField(null);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [activeField]);

  /* ---- reset highlight whenever the list changes ---- */
  useEffect(() => { setActiveIndex(-1); }, [role, location, activeField]);

  /* ---- search ---- */

  const runSearch = async (nextRole, nextLocation) => {
    const r = nextRole.trim();
    const l = nextLocation.trim();
    if (!r && !l) {
      roleInputRef.current?.focus();
      setActiveField("role");
      return;
    }
    setActiveField(null);
    setLoading(true);
    addRecent({ role: r, location: l, at: Date.now() });
    try {
      await onSearch?.({ role: r, location: l });
    } finally {
      setLoading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (loading) return;
    runSearch(role, location);
  };

  const chipSearch = ({ label, field }) => {
    if (loading) return;
    if (field === "location") {
      setLocation(label);
      runSearch(role, label);
    } else {
      setRole(label);
      runSearch(label, location);
    }
  };

  /* ---- selecting from dropdowns ---- */

  const closeDropdown = () => {
    setActiveField(null);
    setActiveIndex(-1);
  };

  const pickRole = (opt) => {
    setRole(opt.role);
    if (opt.location) setLocation(opt.location); // recent entries restore both fields
    closeDropdown();
    locationInputRef.current?.focus();
  };

  const pickLocation = (opt) => {
    setLocation(opt.location);
    closeDropdown();
  };

  /* ---- keyboard nav (shared by both inputs) ---- */

  const handleKey = (field, options, onPick) => (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (activeField !== field) {
        setActiveField(field);
        setActiveIndex(0);
      } else {
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      closeDropdown();
    } else if (e.key === "Enter" && activeField === field && activeIndex >= 0 && options[activeIndex]) {
      e.preventDefault(); // choose the highlighted option instead of submitting
      onPick(options[activeIndex]);
    }
  };

  const hasStats = stats && stats.jobs > 0;

  const inputWrap =
    "flex items-center gap-2 rounded-xl px-3 py-2.5 focus-within:bg-gray-50 sm:py-3";

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
          {/* ============ LEFT ============ */}
          <div className="lg:col-span-7">
            {/* badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {badge ?? (hasStats ? `${stats.jobs.toLocaleString()} open roles right now` : "Now live in Lagos & remote")}
            </div>

            {/* headline */}
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Find the job that{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                actually fits
              </span>{" "}
              you.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Curated openings matched to your skills. No dead listings, no spam, no endless scrolling.
            </p>

            {/* ============ SEARCH ============ */}
            <div ref={containerRef} className="relative">
              <form
                onSubmit={submit}
                role="search"
                aria-label="Job search"
                className="mt-8 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-200/50 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 sm:flex sm:items-center sm:gap-1"
              >
                {/* ROLE */}
                <div className="relative flex-1">
                  <div className={inputWrap}>
                    <SearchIcon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                    <label htmlFor={`${uid}-role`} className="sr-only">Job title, skill, or company</label>
                    <input
                      id={`${uid}-role`}
                      ref={roleInputRef}
                      value={role}
                      onChange={(e) => { setRole(e.target.value); setActiveField("role"); }}
                      onFocus={() => setActiveField("role")}
                      onKeyDown={handleKey("role", roleOptions, pickRole)}
                      type="text"
                      enterKeyHint="search"
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={activeField === "role" && roleOptions.length > 0}
                      aria-controls={roleListId}
                      aria-autocomplete="list"
                      aria-activedescendant={
                        activeField === "role" && activeIndex >= 0 ? `${roleListId}-${activeIndex}` : undefined
                      }
                      placeholder="Job title, skill, or company"
                      className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                    />
                  </div>
                  {activeField === "role" && (
                    <SuggestionDropdown
                      id={roleListId}
                      label="Job suggestions"
                      heading={roleHeading}
                      options={roleOptions}
                      activeIndex={activeIndex}
                      onSelect={pickRole}
                    />
                  )}
                </div>

                <div className="hidden h-8 w-px bg-gray-200 sm:block" aria-hidden />

                {/* LOCATION */}
                <div className="relative flex-1">
                  <div className={inputWrap}>
                    <PinIcon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                    <label htmlFor={`${uid}-location`} className="sr-only">City or remote</label>
                    <input
                      id={`${uid}-location`}
                      ref={locationInputRef}
                      value={location}
                      onChange={(e) => { setLocation(e.target.value); setActiveField("location"); }}
                      onFocus={() => setActiveField("location")}
                      onKeyDown={handleKey("location", locationOptions, pickLocation)}
                      type="text"
                      enterKeyHint="search"
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={activeField === "location" && locationOptions.length > 0}
                      aria-controls={locationListId}
                      aria-autocomplete="list"
                      aria-activedescendant={
                        activeField === "location" && activeIndex >= 0 ? `${locationListId}-${activeIndex}` : undefined
                      }
                      placeholder="City or “Remote”"
                      className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                    />
                  </div>
                  {activeField === "location" && (
                    <SuggestionDropdown
                      id={locationListId}
                      label="Location suggestions"
                      heading="Locations"
                      options={locationOptions}
                      activeIndex={activeIndex}
                      onSelect={pickLocation}
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg hover:shadow-emerald-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 motion-safe:hover:-translate-y-0.5 sm:mt-0 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Spinner className="h-4 w-4" aria-hidden />
                      Searching…
                    </>
                  ) : (
                    "Search jobs"
                  )}
                </button>
              </form>
            </div>

            {/* popular chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-600">Popular:</span>
              {POPULAR.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => chipSearch(chip)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* employer link */}
            <p className="mt-6 text-sm text-gray-600">
              Hiring?{" "}
              <a href="/employers/post" className="font-medium text-emerald-700 underline-offset-4 hover:underline">
                Post a job in 3 minutes →
              </a>
            </p>

            {/* trusted-by strip */}
            {trustedBy && trustedBy.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-100 pt-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Trusted by teams at
                </span>
                {trustedBy.map((name) => (
                  <span key={name} className="text-sm font-semibold text-gray-500">
                    {name}
                  </span>
                ))}
              </div>
            )}

            {/* stats */}
            {hasStats && (
              <dl className="mt-8 grid max-w-lg grid-cols-3 gap-6 border-t border-gray-100 pt-6">
                {[
                  [stats.jobs.toLocaleString() + "+", "Open roles"],
                  [(stats.companies ?? 0).toLocaleString(), "Hiring companies"],
                  [(stats.seekers ?? 0).toLocaleString(), "Job seekers"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="text-2xl font-bold text-gray-900">{value}</dt>
                    <dd className="text-xs text-gray-600">{label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* ============ RIGHT: product preview ============ */}
          <div className="hidden lg:col-span-5 lg:block" aria-hidden>
            <div className="relative mx-auto max-w-md pb-8">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl shadow-gray-300/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-[10px] font-bold text-white">
                      {preview.candidateInitials}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Top match for you
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {preview.fit}% fit
                  </span>
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 font-bold text-white">
                    {preview.companyInitial}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">{preview.title}</h3>
                    <p className="text-sm text-gray-600">
                      {preview.company} · {preview.meta}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{preview.salary}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {preview.skills.map((s) => (
                    <span key={s} className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-1.5 rounded-xl bg-emerald-50/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-900">
                    Why this fits you
                  </p>
                  {preview.reasons.map((r) => (
                    <p key={r} className="flex items-center gap-2 text-xs text-emerald-900">
                      <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      {r}
                    </p>
                  ))}
                </div>

                {/* decorative preview: not focusable */}
                <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white">
                  View job
                  <ArrowIcon className="h-4 w-4" />
                </div>
              </div>

              <div className="absolute -bottom-1 right-4 rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">3 new matches</p>
                    <p className="text-[11px] text-gray-600">Sent to your inbox</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================= CAREER SECTIONS ============================= */

/* ============================= content ============================= */

const CATEGORIES = [
  { name: "Engineering", desc: "Frontend, backend, mobile and DevOps.", icon: Code },
  { name: "Design", desc: "Product, UX research and brand design.", icon: PenTool },
  { name: "Data", desc: "Analytics, data science and engineering.", icon: LineChart },
  { name: "Product", desc: "Product management and strategy.", icon: Briefcase },
  { name: "Marketing", desc: "Growth, content and communications.", icon: Megaphone },
  { name: "Remote", desc: "Work from anywhere, any field.", icon: Globe },
];

const BENEFITS = [
  { title: "Verified companies only", desc: "Every employer is hand-screened before a role goes live.", icon: ShieldCheck },
  { title: "Direct applications", desc: "Apply straight to the employer. No middlemen.", icon: ArrowRight },
  { title: "Transparent pay", desc: "Salary ranges and real benefits show up front.", icon: CheckCircle2 },
];

const STEPS = [
  { title: "Build your profile", desc: "Add your skills, experience, salary expectations and whether you want remote or on-site work. It takes a few minutes and you only do it once." },
  { title: "Get matched roles", desc: "We compare your profile with verified openings and show a fit score with the reasons, such as matching skills and a salary within your range." },
  { title: "Apply directly", desc: "Every listing links straight to the employer's application. No recruiters in between and no reposted duplicates." },
];

const CHECKS = [
  "Company identity confirmed",
  "Salary range disclosed",
  "Direct application link checked",
  "Expired listings removed",
];

// Review these answers: they describe your business model and vetting process.
const FAQ = [
  { q: "Is JobFlow really free for job seekers?", a: "Yes. We never charge job seekers to search, save or apply for jobs. We earn money by charging employers to post their roles." },
  { q: "How does the fit score work?", a: "When you complete your profile, we compare your skills and experience with each job's requirements. The percentage shows how closely you match, and the reasons are listed so you can judge it yourself." },
  { q: "Do you list jobs in Lagos?", a: "Yes. We list roles worldwide, with a strong focus on Nigerian and African tech markets, including Lagos, Abuja and remote roles." },
  { q: "How do you keep out scams?", a: "Every job is manually reviewed. We check the company domain, verify the application link, and remove any listing that asks candidates for payment." },
];

/* ============================= small pieces ============================= */

function SectionHeading({ eyebrow, title, children, center = true }) {
  return (
    <div className={center ? "mx-auto mb-12 max-w-2xl text-center" : ""}>
      {eyebrow && (
        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-700">{eyebrow}</p>
      )}
      <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-gray-600">{children}</p>}
    </div>
  );
}

/* ============================= main ============================= */

function Career() {
  return (
    <div className="bg-white">
      {/* ================= WHY SWITCH ================= */}
      <section aria-labelledby="why-heading" className="border-y border-gray-200 bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 id="why-heading" className="mb-12 text-center text-3xl font-bold text-gray-900">
            Why people switch to JobFlow
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {BENEFITS.map(({ title, desc, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-700" aria-hidden />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionHeading eyebrow="How it works" title="From profile to offer in three steps">
          No endless scrolling. Tell us what you want once, and we do the filtering.
        </SectionHeading>
        <ol className="grid gap-12 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white" aria-hidden>
                {i + 1}
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ================= TRUST & SAFETY ================= */}
      <section className="border-y border-gray-200 bg-gray-50 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 md:grid-cols-2">
          <div className="rounded-2xl bg-[#0a1f1c] p-8 text-white shadow-2xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Before a role goes live
            </p>
            <ul className="space-y-4">
              {CHECKS.map((text) => (
                <li key={text} className="flex items-center gap-3 text-sm font-medium text-gray-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">Trust &amp; safety</p>
            <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">Real jobs, real employers, no spam</h2>
            <p className="mb-6 leading-relaxed text-gray-600">
              Most job boards are crowded with expired posts, reposts and scams. We screen every company by hand and check each listing before it appears, so what you see is open and legitimate.
            </p>
            <p className="leading-relaxed text-gray-600">
              Salary is shown up front, so you can decide whether a role is worth your time before you apply.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionHeading eyebrow="Browse by field" title="Explore roles in your field">
          Start with a category, then narrow by location, salary and work style.
        </SectionHeading>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {CATEGORIES.map(({ name, desc, icon: Icon }) => (
            <Link
              key={name}
              to={`/jobs?category=${encodeURIComponent(name)}`}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-emerald-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <div className="mb-3 flex items-center gap-3">
                <Icon className="h-5 w-5 text-gray-400 transition-colors group-hover:text-emerald-600" aria-hidden />
                <h3 className="font-bold text-gray-900">{name}</h3>
              </div>
              <p className="text-sm text-gray-600">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= FOR EMPLOYERS ================= */}
      <section className="border-y border-gray-200 bg-gray-50 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">For employers</p>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Hiring? Post a job in 3 minutes</h2>
            <p className="mb-8 leading-relaxed text-gray-600">
              Reach candidates who already match your requirements. Describe the role, set the salary range, and we show it to people whose skills fit.
            </p>
            <Link
              to="/employers/post"
              className="inline-block rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Post a job
            </Link>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-bold text-gray-900">Qualified applicants</h3>
              <p className="text-sm text-gray-600">Matching means fewer irrelevant applications to sort through.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-bold text-gray-900">Your brand, front and centre</h3>
              <p className="text-sm text-gray-600">A company page that shows culture, benefits and open roles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900 md:text-4xl">Questions, answered</h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQ.map(({ q, a }, i) => (
            <AccordionItem key={q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-semibold hover:text-emerald-700">{q}</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-gray-600">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}


/* ============================= page ============================= */

// Default export renders Hero, then Career. Any props (onSearch, stats, trustedBy,
// preview, badge) are passed straight to Hero. Hero and Career are also named exports.
export { Hero, Career };

export default function Landing(heroProps) {
  return (
    <>
      <Hero {...heroProps} />
      <Career />
    </>
  );
}