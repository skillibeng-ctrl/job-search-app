import { useMemo, useState } from "react";
import { Link } from "react-router-dom"; // not using React Router? swap <Link to> for <a href>
import { MapPin, Search, TrendingUp, X } from "lucide-react";

/* ============================= data ============================= */

// SAMPLE DATA ONLY. Replace with figures you can stand behind (your own listings
// or a cited survey) and pass them in with the `data` prop.
// Amounts are numbers, per year, so they can be sorted and drawn as bars.
const SAMPLE_DATA = [
  { id: "fe-lagos", role: "Senior Frontend Engineer", location: "Lagos, Nigeria", currency: "NGN", min: 12_000_000, max: 18_000_000, type: "Remote" },
  { id: "pd-abuja", role: "Product Designer", location: "Abuja, Nigeria", currency: "NGN", min: 8_000_000, max: 14_000_000, type: "Hybrid" },
  { id: "da-lagos", role: "Data Analyst", location: "Lagos, Nigeria", currency: "NGN", min: 5_000_000, max: 9_000_000, type: "On-site" },
  { id: "be-global", role: "Backend Developer", location: "Remote (Global)", currency: "USD", min: 80_000, max: 120_000, type: "Remote" },
  { id: "pm-lagos", role: "Product Manager", location: "Lagos, Nigeria", currency: "NGN", min: 15_000_000, max: 25_000_000, type: "Hybrid" },
  { id: "ux-global", role: "UI/UX Designer", location: "Remote (Global)", currency: "USD", min: 60_000, max: 95_000, type: "Remote" },
];

const CURRENCY_LABEL = { NGN: "₦ Naira", USD: "$ US dollars" };
const SYMBOL = { NGN: "₦", USD: "$" };

/* ============================= helpers ============================= */

function formatMoney(n, currency) {
  const sym = SYMBOL[currency] ?? "";
  const trim = (v) => String(Math.round(v * 10) / 10);
  if (n >= 1_000_000) return `${sym}${trim(n / 1_000_000)}M`;
  if (n >= 1_000) return `${sym}${trim(n / 1_000)}k`;
  return `${sym}${n}`;
}

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${FOCUS} ${
        active
          ? "border-emerald-700 bg-emerald-700 text-white"
          : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
      }`}
    >
      {children}
    </button>
  );
}

/* ============================= main ============================= */

export default function Salaries({
  data = SAMPLE_DATA,
  period = "year",            // shown on every card: "year" | "month"
  updatedAt = null,           // e.g. "October 2026"
  source = null,              // e.g. "Based on salaries in JobFlow listings"
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [currency, setCurrency] = useState("All");
  const [sort, setSort] = useState("role");

  const usingSample = data === SAMPLE_DATA;

  const types = useMemo(() => ["All", ...new Set(data.map((d) => d.type))], [data]);
  const currencies = useMemo(() => ["All", ...new Set(data.map((d) => d.currency))], [data]);

  // Bars are scaled against the biggest salary in the same currency, so they don't jump while filtering.
  const scale = useMemo(() => {
    const out = {};
    data.forEach((d) => { out[d.currency] = Math.max(out[d.currency] ?? 0, d.max); });
    return out;
  }, [data]);

  // Pay can't be sorted fairly across ₦ and $, so it needs a single currency.
  const effectiveSort = sort === "pay" && currency !== "All" ? "pay" : "role";

  const results = useMemo(() => {
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
    const list = data.filter(
      (d) =>
        (type === "All" || d.type === type) &&
        (currency === "All" || d.currency === currency) &&
        terms.every((t) => `${d.role} ${d.location}`.toLowerCase().includes(t))
    );
    return list.sort((a, b) => (effectiveSort === "pay" ? b.max - a.max : a.role.localeCompare(b.role)));
  }, [data, search, type, currency, effectiveSort]);

  const filtersActive = search || type !== "All" || currency !== "All";
  const clearAll = () => { setSearch(""); setType("All"); setCurrency("All"); setSort("role"); };

  return (
    <main id="main" className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* ============ header ============ */}
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-700">Salary guide</p>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Know your worth before you apply</h1>
          <p className="text-lg text-gray-600">
            Explore typical salary ranges for top roles in Nigeria and around the world.
          </p>
          {(source || updatedAt) && (
            <p className="mt-3 text-sm text-gray-600">
              {source}
              {source && updatedAt && " · "}
              {updatedAt && `Updated ${updatedAt}`}
            </p>
          )}
        </header>

        {usingSample && (
          <p role="note" className="mx-auto mb-8 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
            Sample data. Replace it with real figures before launch.
          </p>
        )}

        {/* ============ search + filters ============ */}
        <div className="mx-auto mb-8 max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" aria-hidden />
            <label htmlFor="salary-search" className="sr-only">Search by job title or location</label>
            <input
              id="salary-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title or location"
              autoComplete="off"
              className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-gray-900 shadow-sm outline-none placeholder:text-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className={`absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 ${FOCUS}`}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Work type">
            {types.map((t) => (
              <Chip key={t} active={type === t} onClick={() => setType(t)}>{t === "All" ? "All work types" : t}</Chip>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Currency">
              {currencies.map((c) => (
                <Chip key={c} active={currency === c} onClick={() => setCurrency(c)}>
                  {c === "All" ? "All currencies" : CURRENCY_LABEL[c] ?? c}
                </Chip>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="salary-sort" className="text-gray-600">Sort by</label>
              <select
                id="salary-sort"
                value={effectiveSort}
                onChange={(e) => setSort(e.target.value)}
                className={`rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 ${FOCUS}`}
              >
                <option value="role">Job title (A–Z)</option>
                <option value="pay" disabled={currency === "All"}>
                  {currency === "All" ? "Highest pay (pick a currency)" : "Highest pay"}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <p aria-live="polite">
            {results.length} {results.length === 1 ? "role" : "roles"}
          </p>
          {filtersActive && (
            <button type="button" onClick={clearAll} className={`rounded font-medium text-emerald-800 hover:underline ${FOCUS}`}>
              Clear filters
            </button>
          )}
        </div>

        {/* ============ cards ============ */}
        {results.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {results.map((item) => {
              const top = scale[item.currency] || item.max;
              const left = (item.min / top) * 100;
              const width = ((item.max - item.min) / top) * 100;
              return (
                <li key={item.id}>
                  <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-gray-900">{item.role}</h2>
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {item.location}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">{item.type}</span>
                    </div>

                    <div className="mt-auto border-t border-gray-100 pt-4">
                      <p className="mb-1 text-xs font-medium text-gray-600">Typical range per {period}</p>
                      <div className="flex items-end justify-between gap-3">
                        <p className="flex items-baseline gap-2 text-2xl font-extrabold">
                          <span className="text-emerald-700">{formatMoney(item.min, item.currency)}</span>
                          <span className="text-gray-400" aria-hidden>–</span>
                          <span className="sr-only">to</span>
                          <span className="text-gray-900">{formatMoney(item.max, item.currency)}</span>
                        </p>
                        <TrendingUp className="h-7 w-7 text-emerald-200" aria-hidden />
                      </div>

                      {/* range bar: decorative, the numbers above carry the meaning */}
                      <div className="relative mt-3 h-2 rounded-full bg-gray-100" aria-hidden>
                        <div
                          className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-700"
                          style={{ left: `${left}%`, width: `${width}%` }}
                        />
                      </div>

                      <Link
                        to={`/jobs?q=${encodeURIComponent(item.role)}`}
                        className={`mt-4 inline-block rounded text-sm font-semibold text-emerald-800 hover:underline ${FOCUS}`}
                      >
                        See open {item.role} jobs →
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <p className="text-gray-900">
              No salary data found{search ? <> for “{search}”</> : null}.
            </p>
            <p className="mt-1 text-sm text-gray-600">Try a different title or location, or remove a filter.</p>
            <button
              type="button"
              onClick={clearAll}
              className={`mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black ${FOCUS}`}
            >
              Clear filters
            </button>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-gray-600">
          Ranges are estimates and vary by experience, company and location. Use them as a guide, not a guarantee.
        </p>
      </div>
    </main>
  );
}