import { useEffect, useId, useMemo, useRef, useState } from "react";

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

const POPULAR = ["Frontend Developer", "Product Designer", "Data Analyst", "Remote"];

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

/* ============================= hook ============================= */

const RECENT_KEY = "jobflow:recent-searches";

function useRecentSearches() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
    catch { return []; }
  });

  const add = (entry) => {
    setItems((prev) => {
      const filtered = prev.filter(
        (p) => !(p.role.toLowerCase() === entry.role.toLowerCase() &&
                 p.location.toLowerCase() === entry.location.toLowerCase())
      );
      const next = [entry, ...filtered].slice(0, 5);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return [items, add];
}

/* ============================= subcomponent ============================= */

function SuggestionDropdown({ id, label, items, activeIndex, onSelect, kind }) {
  if (!items.length) return null;
  return (
    <div
      id={id}
      role="listbox"
      aria-label={label}
      className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-auto rounded-xl border border-gray-100 bg-white py-1 shadow-xl shadow-gray-200/60"
    >
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {kind === "recent" ? "Recent" : kind === "location" ? "Locations" : "Suggestions"}
      </p>
      {items.map((item, i) => {
        const text = typeof item === "string" ? item : item.role;
        const isRecent = kind === "recent";
        return (
          <button
            key={typeof item === "string" ? item : `${item.role}|${item.location}`}
            type="button"
            role="option"
            aria-selected={i === activeIndex}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(item)}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
              i === activeIndex ? "bg-emerald-50 text-emerald-900" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {isRecent ? (
              <ClockIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            ) : kind === "location" ? (
              <PinIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            ) : (
              <SearchIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            )}
            <span className="truncate">{text}</span>
            {isRecent && typeof item !== "string" && item.location && (
              <span className="ml-auto truncate text-xs text-gray-400">{item.location}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ============================= main ============================= */

export default function Hero({
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

  /* ---- suggestions ---- */

  const roleMatches = useMemo(() => {
    const q = role.trim().toLowerCase();
    if (!q) {
      const recentRoles = recent.map((r) => r.role);
      return [...new Set([...recentRoles, ...ROLE_SUGGESTIONS])].slice(0, 6);
    }
    return ROLE_SUGGESTIONS.filter((r) => r.toLowerCase().includes(q)).slice(0, 6);
  }, [role, recent]);

  const locationMatches = useMemo(() => {
    const q = location.trim().toLowerCase();
    if (!q) return LOCATION_SUGGESTIONS.slice(0, 6);
    return LOCATION_SUGGESTIONS.filter((l) => l.toLowerCase().includes(q)).slice(0, 6);
  }, [location]);

  const showRecent = activeField === "role" && !role.trim() && recent.length > 0;

  /* ---- ⌘K / Ctrl+K focus ---- */
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

  /* ---- reset active index when list changes ---- */
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
    // If a suggestion is highlighted, use it
    if (activeField === "role" && activeIndex >= 0 && roleMatches[activeIndex]) {
      const pick = roleMatches[activeIndex];
      const value = typeof pick === "string" ? pick : pick.role;
      setRole(value);
      runSearch(value, location);
      return;
    }
    if (activeField === "location" && activeIndex >= 0 && locationMatches[activeIndex]) {
      const pick = locationMatches[activeIndex];
      setLocation(pick);
      runSearch(role, pick);
      return;
    }
    runSearch(role, location);
  };

  const chipSearch = (term) => {
    setRole(term);
    runSearch(term, location);
  };

  /* ---- keyboard nav per field ---- */

  const handleKey = (field, list, currentValue, setValue) => (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveField(field);
      setActiveIndex((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setActiveField(null);
      setActiveIndex(-1);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const pick = list[activeIndex];
      const value = typeof pick === "string" ? pick : pick.role;
      setValue(value);
      setActiveField(null);
      setActiveIndex(-1);
    }
  };

  /* ---- select from dropdown ---- */

  const pickRole = (item) => {
    const value = typeof item === "string" ? item : item.role;
    setRole(value);
    if (typeof item !== "string" && item.location) {
      setLocation(item.location);
    }
    setActiveField(null);
    setActiveIndex(-1);
    locationInputRef.current?.focus();
  };

  const pickLocation = (value) => {
    setLocation(value);
    setActiveField(null);
    setActiveIndex(-1);
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
          {/* ============ LEFT ============ */}
          <div className="lg:col-span-7">
            {/* badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {badge ?? (hasStats ? `${stats.jobs.toLocaleString()} open roles right now` : "Now live in Lagos & remote")}
            </div>

            {/* headline */}
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

            {/* ============ SEARCH ============ */}
            <div ref={containerRef} className="relative">
              <form
                onSubmit={submit}
                role="search"
                aria-label="Job search"
                className="mt-8 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-200/50 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 sm:flex sm:items-center sm:gap-1"
              >
                {/* ROLE field */}
                <div className="relative flex-1">
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 focus-within:bg-gray-50 sm:py-3">
                    <SearchIcon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                    <label htmlFor="hero-role" className="sr-only">Job title, skill, or company</label>
                    <input
                      id="hero-role"
                      ref={roleInputRef}
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      onFocus={() => setActiveField("role")}
                      onKeyDown={handleKey("role", roleMatches, role, setRole)}
                      type="search"
                      enterKeyHint="search"
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={activeField === "role"}
                      aria-controls={roleListId}
                      aria-autocomplete="list"
                      aria-activedescendant={
                        activeField === "role" && activeIndex >= 0 ? `${roleListId}-${activeIndex}` : undefined
                      }
                      placeholder="Job title, skill, or company"
                      className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                    />
                  </div>
                  {activeField === "role" && (
                    <SuggestionDropdown
                      id={roleListId}
                      label="Job suggestions"
                      items={roleMatches}
                      activeIndex={activeIndex}
                      onSelect={pickRole}
                      kind={showRecent ? "recent" : "role"}
                    />
                  )}
                </div>

                <div className="hidden h-8 w-px bg-gray-200 sm:block" aria-hidden />

                {/* LOCATION field */}
                <div className="relative flex-1">
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 focus-within:bg-gray-50 sm:py-3">
                    <PinIcon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                    <label htmlFor="hero-location" className="sr-only">City or remote</label>
                    <input
                      id="hero-location"
                      ref={locationInputRef}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onFocus={() => setActiveField("location")}
                      onKeyDown={handleKey("location", locationMatches, location, setLocation)}
                      type="text"
                      enterKeyHint="search"
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={activeField === "location"}
                      aria-controls={locationListId}
                      aria-autocomplete="list"
                      aria-activedescendant={
                        activeField === "location" && activeIndex >= 0
                          ? `${locationListId}-${activeIndex}`
                          : undefined
                      }
                      placeholder="City or “Remote”"
                      className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                    />
                  </div>
                  {activeField === "location" && (
                    <SuggestionDropdown
                      id={locationListId}
                      label="Location suggestions"
                      items={locationMatches}
                      activeIndex={activeIndex}
                      onSelect={pickLocation}
                      kind="location"
                    />
                  )}
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
            </div>

            {/* popular chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500">Popular:</span>
              {POPULAR.map((term) => (
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

            {/* employer link */}
            <p className="mt-6 text-sm text-gray-500">
              Hiring?{" "}
              <a href="/employers/post" className="font-medium text-emerald-600 underline-offset-4 hover:underline">
                Post a job in 3 minutes →
              </a>
            </p>

            {/* trusted-by strip */}
            {trustedBy && trustedBy.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-100 pt-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Trusted by teams at
                </span>
                {trustedBy.map((name) => (
                  <span key={name} className="text-sm font-semibold text-gray-400 transition hover:text-gray-600">
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

          {/* ============ RIGHT: product preview ============ */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="relative mx-auto max-w-md pb-8">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl shadow-gray-300/30">
                {/* header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white">
                      {preview.candidateInitials}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Top match for you
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {preview.fit}% fit
                  </span>
                </div>

                {/* job */}
                <div className="mt-4 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 font-bold text-white">
                    {preview.companyInitial}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">{preview.title}</h3>
                    <p className="text-sm text-gray-500">
                      {preview.company} · {preview.meta}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{preview.salary}</p>
                  </div>
                </div>

                {/* skills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {preview.skills.map((s) => (
                    <span key={s} className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {s}
                    </span>
                  ))}
                </div>

                {/* match reasons */}
                <div className="mt-4 space-y-1.5 rounded-xl bg-emerald-50/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                    Why this fits you
                  </p>
                  {preview.reasons.map((r) => (
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

              {/* floating match ping — positioned so it doesn't collide with anything */}
              <div className="absolute -bottom-1 right-4 rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">3 new matches</p>
                    <p className="text-[11px] text-gray-500">Sent to your inbox</p>
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