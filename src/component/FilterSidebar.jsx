// src/component/FilterSidebar.jsx
export default function FilterSidebar({ filters, setFilters }) {
  
  // Helper to clear all filters at once
  const clearAll = () => {
    setFilters({
      remote: "",
      postedWithin: "",
      seniority: "",
      minSalary: "",
    });
  };

  const hasActiveFilters = 
    filters.remote !== "" || 
    filters.postedWithin !== "" || 
    filters.seniority !== "" || 
    filters.minSalary !== "";

  return (
    <div className="sticky top-20 space-y-6">
      
      {/* Header with Clear All */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Filters</h2>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Work Arrangement */}
      <Group title="Work arrangement">
        {/* Changed to Radio buttons because Remote and On-site are mutually exclusive */}
        {[
          ["All", filters.remote === ""],
          ["Remote", filters.remote === true],
          ["On-site / Hybrid", filters.remote === false],
        ].map(([label, checked]) => (
          <Radio
            key={label}
            name="remote"
            label={label}
            checked={checked}
            onChange={() => {
              if (label === "All") setFilters({ remote: "" });
              else setFilters({ remote: label === "Remote" });
            }}
          />
        ))}
      </Group>

      {/* Posted */}
      <Group title="Date posted">
        {[["24 hours", "1"], ["3 days", "3"], ["7 days", "7"], ["30 days", "30"]].map(([label, value]) => (
          <Radio
            key={value}
            name="postedWithin"
            label={label}
            checked={filters.postedWithin === value}
            onChange={() => setFilters({ postedWithin: filters.postedWithin === value ? "" : value })}
          />
        ))}
      </Group>

      {/* Seniority */}
      <Group title="Experience level">
        {["entry", "mid", "senior", "lead"].map((level) => (
          <Radio
            key={level}
            name="seniority"
            label={level.charAt(0).toUpperCase() + level.slice(1)}
            checked={filters.seniority === level}
            onChange={() => setFilters({ seniority: filters.seniority === level ? "" : level })}
          />
        ))}
      </Group>

      {/* Salary */}
      <Group title="Minimum salary">
        <input
          type="range" 
          min="0" 
          max="20000000" // Set high enough to cover Naira (e.g., ₦20M)
          step="500000"
          value={filters.minSalary || 0}
          onChange={(e) => setFilters({ minSalary: e.target.value === "0" ? "" : e.target.value })}
          className="w-full accent-emerald-600"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>Any</span>
          <span className="rounded bg-gray-100 px-2 py-1 text-gray-700">
            {/* Format logic: If it's over 1,000,000 assume Naira, else Dollars */}
            {!filters.minSalary ? "Any" : 
             parseInt(filters.minSalary) >= 1000000 
               ? `₦${(parseInt(filters.minSalary) / 1000000).toFixed(1)}M+`
               : `$${(parseInt(filters.minSalary) / 1000).toFixed(0)}k+`
            }
          </span>
        </div>
      </Group>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

const Group = ({ title, children }) => (
  <fieldset className="border-none p-0 m-0">
    <legend className="mb-3 text-sm font-semibold text-gray-900">{title}</legend>
    <div className="space-y-2.5">{children}</div>
  </fieldset>
);

const Radio = ({ name, label, checked, onChange }) => (
  <label className="group flex cursor-pointer items-center gap-2.5">
    {/* Native input, hidden visually but accessible to keyboard/screen readers */}
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      className="peer sr-only"
    />
    {/* Custom visually styled radio */}
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gray-300 transition-colors peer-checked:border-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/50 peer-focus-visible:ring-offset-1 group-hover:border-emerald-400">
      {checked && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
    </span>
    <span className="text-sm text-gray-700 transition-colors group-hover:text-gray-900">
      {label}
    </span>
  </label>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="group flex cursor-pointer items-center gap-2.5">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="peer sr-only"
    />
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-300 transition-colors peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/50 peer-focus-visible:ring-offset-1 group-hover:border-emerald-400">
      {checked && (
        <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>
    <span className="text-sm text-gray-700 transition-colors group-hover:text-gray-900">
      {label}
    </span>
  </label>
);