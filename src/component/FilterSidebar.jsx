// src/components/FilterSidebar.jsx
export default function FilterSidebar({ filters, setFilters }) {
  return (
    <div className="sticky top-20 space-y-6">
      <Group title="Work arrangement">
        {[
          ["Remote", filters.remote === true, () => setFilters({ remote: filters.remote === true ? "" : true })],
          ["On-site / Hybrid", filters.remote === false, () => setFilters({ remote: filters.remote === false ? "" : false })],
        ].map(([label, checked, onClick]) => (
          <Checkbox key={label} label={label} checked={checked} onClick={onClick} />
        ))}
      </Group>

      <Group title="Posted">
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

      <Group title="Seniority">
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

      <Group title="Minimum salary">
        <input
          type="range" min="0" max="200000" step="10000"
          value={filters.minSalary || 0}
          onChange={(e) => setFilters({ minSalary: e.target.value === "0" ? "" : e.target.value })}
          className="w-full accent-emerald-600"
        />
        <p className="mt-1 text-xs text-gray-500">
          {filters.minSalary ? `$${parseInt(filters.minSalary).toLocaleString()}+` : "Any salary"}
        </p>
      </Group>
    </div>
  );
}

const Group = ({ title, children }) => (
  <div>
    <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const Checkbox = ({ label, checked, onClick }) => (
  <button onClick={onClick} className="flex w-full items-center gap-2 text-left text-sm text-gray-700">
    <span className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>
      {checked && (
        <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>
    {label}
  </button>
);

const Radio = ({ label, checked, onChange }) => (
  <button onClick={onChange} className="flex w-full items-center gap-2 text-left text-sm text-gray-700">
    <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${checked ? "border-emerald-500" : "border-gray-300"}`}>
      {checked && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
    </span>
    {label}
  </button>
);