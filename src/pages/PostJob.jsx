import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Building2, MapPin, DollarSign, ArrowLeft } from "lucide-react";

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    location: "",
    remote: false,
    job_type: "full-time",
    experience_level: "mid",
    salary_min: "",
    salary_max: "",
    description: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // IN THE FUTURE: Connect this to your Express backend
      // await fetch("http://localhost:4000/api/jobs", { 
      //   method: "POST", 
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData) 
      // });
      
      // Simulating network request
      await new Promise(r => setTimeout(r, 800)); 
      toast.success("Job posted successfully! It is now live.");
      navigate("/employers");
    } catch (err) {
      toast.error("Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-3xl mx-auto">
        
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-900 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
            <p className="text-gray-400 mt-1">Reach thousands of qualified candidates instantly.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Frontend Engineer" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input required name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g. Acme Inc." className="w-full pl-10 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input required name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Lagos, Nigeria" className="w-full pl-10 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select name="job_type" value={formData.job_type} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <select name="experience_level" value={formData.experience_level} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead / Manager</option>
                </select>
              </div>

              <div className="col-span-2 flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <input type="checkbox" name="remote" checked={formData.remote} onChange={handleChange} id="remote" className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                <label htmlFor="remote" className="text-sm font-medium text-gray-900">This is a remote position</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} placeholder="e.g. 5000000" className="w-full pl-10 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Salary</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} placeholder="e.g. 8000000" className="w-full pl-10 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Describe the role, responsibilities, and requirements..." className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-70">
                {loading ? "Publishing..." : "Publish Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}