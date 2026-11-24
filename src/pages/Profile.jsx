import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, FileText, ArrowRight } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState({ name: "Alex Johnson", email: "alex@example.com", role: "Job Seeker" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("jobflow_user") || "{}");
    if (storedUser.name) setUser(storedUser);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">
              {user.name ? user.name.charAt(0) : "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="h-5 w-5 text-gray-400" /> {user.email}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" /> My Resume
            </h3>
          </div>
          <p className="text-gray-600 mb-6">Keep your resume up to date to get matched with the best jobs. You can download it as a PDF anytime.</p>
          <Link to="/resume-builder" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition">
            Open Resume Builder <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}