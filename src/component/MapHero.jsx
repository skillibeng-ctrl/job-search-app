import { lazy, Suspense, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // not using React Router? swap <Link to> for <a href>
import { ArrowRight, Globe, MapPin, Search, ShieldCheck, Target, Zap } from "lucide-react";
import { SAMPLE_LOCATIONS } from "./sampleLocations"; // tiny file, so it doesn't pull in the map library

// The map library is heavy, so it loads after the headline and search are already on screen.
const JobMap = lazy(() => import("./JobMap"));

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: "Hand-screened, verified companies only", tone: "bg-emerald-100 text-emerald-800" },
  { icon: Zap, text: "Direct application links. No middlemen.", tone: "bg-blue-100 text-blue-800" },
  { icon: Target, text: "Transparent salaries and real benefits", tone: "bg-orange-100 text-orange-800" },
];

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
const CHIP = `inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 ${FOCUS}`;

/* ============================= pieces ============================= */

function HeroSearch({ onSearch }) {
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => { e.preventDefault(); onSearch({ role: q.trim(), location: loc.trim() }); }}
      className="mt-6 flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-200/50 focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 sm:flex-row sm:items-center sm:gap-1"
    >
      <label htmlFor="hero-q" className="sr-only">Job title, skill or company</label>
      <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-50 px-3 sm:bg-transparent">
        <Search className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
        <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, skill, or company" autoComplete="off" className="w-full bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-500" />
      </div>
      <div className="hidden h-8 w-px bg-gray-200 sm:block" aria-hidden />
      <label htmlFor="hero-loc" className="sr-only">City or remote</label>
      <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-50 px-3 sm:bg-transparent">
        <MapPin className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
        <input id="hero-loc" value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="City or “Remote”" autoComplete="off" className="w-full bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-500" />
      </div>
      <button type="submit" className={`w-full rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-auto ${FOCUS}`}>
        Search jobs
      </button>
    </form>
  );
}

function MapSkeleton() {
  return (
    <div role="status" aria-label="Loading map" className="flex h-full w-full items-center justify-center bg-emerald-50 text-sm text-emerald-800 motion-safe:animate-pulse">
      Loading map…
    </div>
  );
}

function MapEmpty({ browseHref }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-emerald-50 px-6 text-center">
      <Globe className="h-8 w-8 text-emerald-700" aria-hidden />
      <p className="text-sm text-gray-700">Roles will appear on the map as employers post them.</p>
      <Link to={browseHref} className={`rounded text-sm font-semibold text-emerald-800 hover:underline ${FOCUS}`}>Browse all jobs</Link>
    </div>
  );
}

/* ============================= main ============================= */

export default function Hero({
  locations = SAMPLE_LOCATIONS, // SAMPLE DATA: pass real [{ city, lat, lng, count }]
  remoteCount = null,           // number of remote roles (they have no pin)
  loading = false,              // true while your API request is in flight
  activeRoles = "2,500+",       // pass your real number, or null to hide the badge
  browseHref = "/jobs",
  onSearch,                     // optional: ({ role, location }) => void
  tileUrl,                      // optional: your tile provider
  attribution,
}) {
  const navigate = useNavigate();
  const usingSample = locations === SAMPLE_LOCATIONS;
  const topCities = [...locations].sort((a, b) => b.count - a.count).slice(0, 3);

  // The Jobs page reads ?q= (keyword) and ?loc= (place).
  const goSearch =
    onSearch ??
    (({ role, location }) => {
      const params = new URLSearchParams();
      if (role) params.set("q", role);
      if (location) params.set("loc", location);
      navigate(`${browseHref}${params.toString() ? `?${params}` : ""}`);
    });

  return (
    <section className="relative overflow-hidden bg-white pb-14 pt-10 lg:pb-16 lg:pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* ============ LEFT ============ */}
          <div className="flex max-w-xl flex-col justify-center">
            {activeRoles && (
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" aria-hidden />
                {activeRoles} active roles right now
              </div>
            )}

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Skip the noise.
              <br />
              Find the role
              <br />
              <span className="text-emerald-700">that actually fits.</span>
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Discover verified, curated roles that match your skills, salary expectations and lifestyle, in your city or anywhere in the world.
            </p>

            <HeroSearch onSearch={goSearch} />

            <p className="mt-4 text-sm text-gray-600">
              Or{" "}
              <Link to={browseHref} className={`inline-flex items-center gap-1 rounded font-semibold text-emerald-800 hover:underline ${FOCUS}`}>
                browse all open roles <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <span className="mx-2" aria-hidden>·</span>
              Hiring?{" "}
              <Link to="/register?role=employer" className={`rounded font-semibold text-emerald-800 hover:underline ${FOCUS}`}>Post a job</Link>
            </p>

            <ul className="mt-8 space-y-3">
              {HIGHLIGHTS.map(({ icon: Icon, text, tone }) => (
                <li key={text} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* ============ RIGHT: map card (stretches to match the left column) ============ */}
          <section aria-labelledby="map-title" className="flex">
            <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <h2 id="map-title" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Globe className="h-4 w-4 text-emerald-700" aria-hidden />
                  Where the roles are
                </h2>
                <span className="text-xs font-medium text-gray-600">Click or tap a pin to explore</span>
              </div>

              {/* absolute child gives the map a guaranteed size inside the flexible area */}
              <div className="relative min-h-[320px] flex-1 sm:min-h-[380px]">
                <div className="absolute inset-0">
                  {loading ? (
                    <MapSkeleton />
                  ) : locations.length === 0 ? (
                    <MapEmpty browseHref={browseHref} />
                  ) : (
                    <Suspense fallback={<MapSkeleton />}>
                      <JobMap locations={locations} tileUrl={tileUrl} attribution={attribution} />
                    </Suspense>
                  )}
                </div>
              </div>

              {/* text alternative to the map, and quick links */}
              <ul className="flex flex-wrap gap-2 px-5 py-4">
                {topCities.map((c) => (
                  <li key={c.city}>
                    <Link to={`/jobs?loc=${encodeURIComponent(c.city)}`} className={CHIP}>
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {c.city}
                      <span className="text-gray-600">· {c.count.toLocaleString()}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/jobs?loc=Remote" className={CHIP}>
                    <Globe className="h-3.5 w-3.5" aria-hidden />
                    Remote
                    {remoteCount != null && <span className="text-gray-600">· {remoteCount.toLocaleString()}</span>}
                  </Link>
                </li>
              </ul>

              {usingSample && (
                <p role="note" className="border-t border-amber-200 bg-amber-50 px-5 py-2 text-xs text-amber-900">
                  Sample data. Pass real locations before launch.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}