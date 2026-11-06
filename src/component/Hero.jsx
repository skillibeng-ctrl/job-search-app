import { lazy, Suspense } from "react";
import { Link } from "react-router-dom"; // not using React Router? swap <Link to> for <a href>
import { ArrowRight, ShieldCheck, Zap, Target, MapPin, Globe } from "lucide-react";
import { SAMPLE_LOCATIONS } from "./JobMap";

// Leaflet is heavy, so it loads after the headline and button are already on screen.
const JobMap = lazy(() => import("./JobMap"));

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: "Hand-screened, verified companies only", tone: "bg-emerald-100 text-emerald-700" },
  { icon: Zap, text: "Direct application links. No middlemen.", tone: "bg-blue-100 text-blue-700" },
  { icon: Target, text: "Transparent salaries and real benefits", tone: "bg-orange-100 text-orange-700" },
];

function MapSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading map"
      className="flex h-full w-full items-center justify-center bg-emerald-50 text-sm text-emerald-800 motion-safe:animate-pulse"
    >
      Loading map…
    </div>
  );
}

export default function Hero({
  locations = SAMPLE_LOCATIONS, // SAMPLE DATA: pass real { city, lat, lng, count }
  remoteCount = null,           // number of remote roles (no pin on a map)
  activeRoles = "2,500+",
  browseHref = "/jobs",
  tileUrl,                      // optional: your tile provider
  attribution,
}) {
  const topCities = [...locations].sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* ============ LEFT ============ */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" aria-hidden />
              {activeRoles} active roles right now
            </div>

            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-6xl">
              Skip the noise.
              <br />
              Find the role
              <br />
              <span className="text-emerald-700">that actually fits.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Stop sifting through dead listings and spam. Discover verified, curated roles that match your skills, salary expectations and lifestyle, in your city or anywhere in the world.
            </p>

            <div className="mt-8">
              <Link
                to={browseHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 motion-safe:hover:-translate-y-1 sm:w-auto"
              >
                Browse open roles
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </div>

            <ul className="mt-10 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              {HIGHLIGHTS.map(({ icon: Icon, text, tone }) => (
                <li key={text} className="flex items-center gap-4 text-sm font-medium text-gray-700">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* ============ RIGHT: map card ============ */}
          <div className="mx-auto w-full max-w-xl">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Globe className="h-4 w-4 text-emerald-700" aria-hidden />
                  Where the roles are
                </p>
                <span className="text-xs font-medium text-gray-600">Tap a pin to explore</span>
              </div>

              <div className="h-[380px] w-full">
                <Suspense fallback={<MapSkeleton />}>
                  <JobMap locations={locations} tileUrl={tileUrl} attribution={attribution} />
                </Suspense>
              </div>

              {/* text alternative to the map: also quick links */}
              <ul className="flex flex-wrap gap-2 px-5 py-4">
                {topCities.map((c) => (
                  <li key={c.city}>
                    <Link
                      to={`/jobs?location=${encodeURIComponent(c.city)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                    >
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {c.city}
                      <span className="text-gray-600">· {c.count.toLocaleString()}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/jobs?location=Remote"
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                  >
                    <Globe className="h-3.5 w-3.5" aria-hidden />
                    Remote
                    {remoteCount != null && <span className="text-gray-600">· {remoteCount.toLocaleString()}</span>}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}