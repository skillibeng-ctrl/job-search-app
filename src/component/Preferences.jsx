import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Phone, Linkedin, Briefcase, MapPin, DollarSign, Clock, CheckCircle2 } from "lucide-react";

const JOB_CATEGORIES = ["Engineering", "Design", "Data", "Product", "Marketing", "Customer Success", "Sales", "Finance"];

export default function Preferences() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [prefs, setPrefs] = useState({
    phone: "",
    linkedin: "",
    skills: "",
    roles: "",
    location: "",
    workStyle: "remote", 
    expectedSalary: "",
    jobTypes: ["full-time"],
    categories: []
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    localStorage.setItem("jobflow_preferences", JSON.stringify(prefs));
    
    setTimeout(() => {
      setLoading(false);
      toast.success("Profile setup complete! Welcome to JobFlow.");
      navigate("/"); // 🔥 Takes them to the Home Page!
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-2xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Let's build your profile</h1>
          <p className="text-gray-600">Tell us about yourself so we can match you with the perfect roles.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
          
          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <Phone className="h-4 w-4 text-emerald-600" /> Phone Number
              </label>
              <input 
                type="tel"
                name="phone" 
                value={prefs.phone} 
                onChange={handleChange} 
                placeholder="+234 800 000 0000" 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <Linkedin className="h-4 w-4 text-emerald-600" /> LinkedIn URL
              </label>
              <input 
                type="url"
                name="linkedin" 
                value={prefs.linkedin} 
                onChange={handleChange} 
                placeholder="linkedin.com/in/yourname" 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
              <User className="h-4 w-4 text-emerald-600" /> Top Skills
            </label>
            <input 
              name="skills" 
              value={prefs.skills} 
              onChange={handleChange} 
              placeholder="e.g. React, Node.js, Project Management" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
            <p className="text-xs text-gray-500 mt-2">Separate skills with commas.</p>
          </div>

          <hr className="border-gray-100" />

          {/* Roles */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
              <Briefcase className="h-4 w-4 text-emerald-600" /> What job titles are you looking for?
            </label>
            <input 
              required 
              name="roles" 
              value={prefs.roles} 
              onChange={handleChange} 
              placeholder="e.g. Frontend Developer, Product Manager" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <MapPin className="h-4 w-4 text-emerald-600" /> Preferred Location
              </label>
              <input 
                required 
                name="location" 
                value={prefs.location} 
                onChange={handleChange} 
                placeholder="e.g. Lagos, Nigeria" 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 mb-3 block">Work Style</label>
              <select 
                name="workStyle" 
                value={prefs.workStyle} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="remote">Fully Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
              <DollarSign className="h-4 w-4 text-emerald-600" /> Expected Monthly Salary
            </label>
            <input 
              type="number" 
              name="expectedSalary" 
              value={prefs.expectedSalary} 
              onChange={handleChange} 
              placeholder="e.g. 500000" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>

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
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
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

          <div className="pt-6 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-70"
            >
              {loading ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}