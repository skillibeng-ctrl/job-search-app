import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  User, Settings as SettingsIcon, Bell, Briefcase, Shield, 
  Lock, CreditCard, Camera
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: SettingsIcon },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Job preferences", icon: Briefcase },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "security", label: "Security", icon: Lock },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Load initial data from localStorage
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    role: "Job seeker",
    location: "Lagos, Nigeria",
    workStyle: "Remote",
    employmentType: "Full-time"
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("jobflow_user") || "{}");
    const storedPrefs = JSON.parse(localStorage.getItem("jobflow_preferences") || "{}");
    
    setProfile(prev => ({
      ...prev,
      name: storedUser.name || prev.name,
      email: storedUser.email || prev.email,
      location: storedPrefs.location || prev.location,
      workStyle: storedPrefs.workStyle === "remote" ? "Remote" : storedPrefs.workStyle === "hybrid" ? "Hybrid" : "On-site",
      employmentType: storedPrefs.jobTypes?.[0] || prev.employmentType
    }));
  }, []);

  const handleSave = () => {
    // Save back to localStorage
    const currentUser = JSON.parse(localStorage.getItem("jobflow_user") || "{}");
    localStorage.setItem("jobflow_user", JSON.stringify({ ...currentUser, name: profile.name, email: profile.email }));
    
    const currentPrefs = JSON.parse(localStorage.getItem("jobflow_preferences") || "{}");
    localStorage.setItem("jobflow_preferences", JSON.stringify({ 
      ...currentPrefs, 
      location: profile.location, 
      workStyle: profile.workStyle.toLowerCase() 
    }));

    toast.success("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-[260px_1fr] gap-8">
        
        {/* ================= SIDEBAR ================= */}
        <aside className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-6 px-3">Settings</h2>
          <nav className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="space-y-6">
          
          {/* --- PROFILE TAB --- */}
          {activeTab === "profile" && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
                <p className="text-gray-500 mb-8">Manage your personal information</p>

                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center">
                    <User className="h-10 w-10 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{profile.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{profile.role}</p>
                    <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      <Camera className="h-4 w-4" /> Edit photo
                    </button>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <input 
                      type="email" 
                      value={profile.email} 
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                  <div className="pt-4">
                    <button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm">
                      Save changes
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Preferences (Also shown on profile tab in screenshot) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Job preferences</h1>
                <p className="text-gray-500 mb-8">Customize your job recommendations</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred location</label>
                    <input 
                      type="text" 
                      value={profile.location} 
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Work arrangement</label>
                    <div className="flex gap-3">
                      {["Remote", "Hybrid", "On-site"].map((style) => (
                        <button
                          key={style}
                          onClick={() => setProfile({ ...profile, workStyle: style })}
                          className={`px-5 py-2 rounded-xl text-sm font-medium border transition ${
                            profile.workStyle === style 
                              ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Employment type</label>
                    <select 
                      value={profile.employmentType}
                      onChange={(e) => setProfile({ ...profile, employmentType: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* --- OTHER TABS (Placeholders) --- */}
          {activeTab !== "profile" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                {TABS.find(t => t.id === activeTab)?.icon && (
                  <div className="text-gray-400">
                     {/* Render the active icon dynamically */}
                     {(() => {
                        const Icon = TABS.find(t => t.id === activeTab).icon;
                        return <Icon className="h-8 w-8" />;
                     })()}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 capitalize mb-2">{activeTab} Settings</h2>
              <p className="text-gray-500 max-w-sm">These settings are coming soon. We're working hard to bring you the best experience possible.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}