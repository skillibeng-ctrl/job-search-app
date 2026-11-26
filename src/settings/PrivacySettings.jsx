import { useState } from "react";
import { toast } from "sonner";
import { Shield, Eye, EyeOff, FileText, ShieldAlert, Trash2 } from "lucide-react";

export default function PrivacySettings() {
  const [settings, setSettings] = useState({
    profileVisibility: "employers", // public, employers, hidden
    resumeVisibility: "applied", // all, applied, hidden
    shareData: true,
  });

  const [blockedCompanies, setBlockedCompanies] = useState("");

  const handleToggle = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
    toast.success("Privacy preference updated");
  };

  const handleSave = () => {
    // In a real app, this would POST to your backend
    localStorage.setItem("jobflow_privacy", JSON.stringify(settings));
    toast.success("Privacy settings saved successfully!");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.")) {
      toast.error("Account deletion requested. (Not actually wired to backend yet)");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-600" /> Privacy Settings
        </h1>
        <p className="text-gray-500 mb-8">Control who can see your profile, resume, and personal data.</p>

        {/* Profile Visibility */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Profile Visibility</h3>
          <p className="text-sm text-gray-500 mb-4">Choose who can view your profile and contact you.</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { id: "public", label: "Public", desc: "Anyone can view your profile", icon: Eye },
              { id: "employers", label: "Employers Only", desc: "Only verified employers", icon: Shield },
              { id: "hidden", label: "Hidden", desc: "No one can see your profile", icon: EyeOff }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setSettings({ ...settings, profileVisibility: option.id })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  settings.profileVisibility === option.id
                    ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <option.icon className={`h-5 w-5 mb-2 ${settings.profileVisibility === option.id ? "text-emerald-600" : "text-gray-400"}`} />
                <p className={`font-semibold ${settings.profileVisibility === option.id ? "text-emerald-900" : "text-gray-900"}`}>{option.label}</p>
                <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Resume Visibility */}
        <div className="mb-8 pt-8 border-t border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Resume Visibility</h3>
          <p className="text-sm text-gray-500 mb-4">Control who can search and download your uploaded resume.</p>
          
          <select
            value={settings.resumeVisibility}
            onChange={(e) => setSettings({ ...settings, resumeVisibility: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">Visible to all verified employers</option>
            <option value="applied">Only visible when I apply for a job</option>
            <option value="hidden">Hidden completely</option>
          </select>
        </div>

        {/* Blocked Companies */}
        <div className="mb-8 pt-8 border-t border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Blocked Companies</h3>
          <p className="text-sm text-gray-500 mb-4">Hide your profile from specific companies (e.g., your current employer).</p>
          
          <input
            type="text"
            placeholder="Enter company names separated by commas (e.g. Acme Inc, Google)"
            value={blockedCompanies}
            onChange={(e) => setBlockedCompanies(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Data Sharing Toggle */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Data Sharing</h3>
            <p className="text-sm text-gray-500">Allow JobFlow to share anonymous usage data to improve recommendations.</p>
          </div>
          <button 
            onClick={() => handleToggle('shareData')}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${settings.shareData ? 'bg-emerald-500' : 'bg-gray-200'}`}
            aria-label="Toggle data sharing"
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${settings.shareData ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-100">
          <button onClick={handleSave} className="w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm">
            Save changes
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-rose-200 p-8">
        <h2 className="text-xl font-bold text-rose-600 mb-2 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6" /> Danger Zone
        </h2>
        <p className="text-gray-500 mb-6">
          Once you delete your account, there is no going back. All your saved jobs, applications, and resume data will be permanently deleted.
        </p>
        <button 
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-6 py-3 rounded-xl font-bold transition"
        >
          <Trash2 className="h-5 w-5" /> Delete Account
        </button>
      </div>
    </div>
  );
}