import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle2 } from "lucide-react";

const JOB_CATEGORIES = [
  "Engineering", "Design", "Data", "Product", 
  "Marketing", "Customer Success", "Sales", "Finance"
];

const EMPLOYMENT_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" }
];

export default function JobPreferences() {
  const [prefs, setPrefs] = useState({
    roles: "",
    location: "",
    workStyle: "remote", // remote, hybrid, onsite
    expectedSalary: "",
    jobTypes: ["full-time"],
    categories: []
  });

  // Load existing preferences
  useEffect(() => {
    const saved = localStorage.getItem("jobflow_preferences");
    if (saved) {
      try { setPrefs(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrefs(prev => ({ ...prev, [name]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setPrefs(prev => {
      const current = prev[field];
      const updated = current.includes(item) 
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem("jobflow_preferences", JSON.stringify(prefs));
    toast.success("Job preferences updated successfully!");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Job Preferences</h1>
        <p className="text-gray-500">Tell us what you're looking for so we can match you with the best roles.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Job Titles */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <Briefcase className="h-4 w-4 text-emerald-600" /> Desired Job Titles
          </label>
          <input 
            name="roles" 
            value={prefs.roles} 
            onChange={handleChange} 
            placeholder="e.g. Frontend Developer, Product Manager" 
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
          />
          <p className="text-xs text-gray-500 mt-2">Separate multiple titles with commas.</p>
        </div>

        {/* Location & Work Style */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
              <MapPin className="h-4 w-4 text-emerald-600" /> Preferred Location
            </label>
            <input 
              name="location" 
              value={prefs.location} 
              onChange={handleChange} 
              placeholder="e.g. Lagos, Nigeria" 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900 mb-3 block">Work Arrangement</label>
            <div className="flex gap-2">
              {[
                { id: "remote", label: "Remote" },
                { id: "hybrid", label: "Hybrid" },
                { id: "onsite", label: "On-site" }
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, workStyle: style.id })}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border transition ${
                    prefs.workStyle === style.id 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Salary & Employment Type */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
              <DollarSign className="h-4 w-4 text-emerald-600" /> Expected Minimum Salary
            </label>
            <input 
              type="number" 
              name="expectedSalary" 
              value={prefs.expectedSalary} 
              onChange={handleChange} 
              placeholder="e.g. 500000" 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>
          <div>
             <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
              <Clock className="h-4 w-4 text-emerald-600" /> Employment Type
            </label>
            <div className="flex flex-wrap gap-2">
              {EMPLOYMENT_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleArrayItem("jobTypes", type.id)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                    prefs.jobTypes.includes(type.id) 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Job Categories */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Job Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {JOB_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleArrayItem("categories", cat)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  prefs.categories.includes(cat) 
                    ? "bg-gray-900 border-gray-900 text-white" 
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-8 border-t border-gray-100">
          <button 
            type="submit" 
            className="w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}