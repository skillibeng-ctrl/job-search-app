import { useState } from "react";
import { toast } from "sonner";
import { Bell, Briefcase, FileText, MessageSquare, Megaphone, Mail, Smartphone } from "lucide-react";

const NOTIFICATION_SECTIONS = [
  {
    id: "jobs",
    title: "Job Recommendations",
    icon: Briefcase,
    description: "Get alerted when new jobs match your preferences.",
    options: [
      { id: "newMatches", label: "New job matches", desc: "Instant alerts for highly matched roles." },
      { id: "weeklyDigest", label: "Weekly digest", desc: "A summary of the top jobs every Monday." },
    ]
  },
  {
    id: "applications",
    title: "Application Updates",
    icon: FileText,
    description: "Stay updated on the status of your applications.",
    options: [
      { id: "statusChanges", label: "Status changes", desc: "When a company views your resume or moves you to the next stage." },
      { id: "interviews", label: "Interview invites", desc: "When a company schedules an interview with you." },
    ]
  },
  {
    id: "messages",
    title: "Messages",
    icon: MessageSquare,
    description: "Alerts for new messages from recruiters.",
    options: [
      { id: "directMessages", label: "Direct messages", desc: "When a recruiter sends you a message." },
    ]
  },
  {
    id: "marketing",
    title: "JobFlow Updates",
    icon: Megaphone,
    description: "News, tips, and product updates from the JobFlow team.",
    options: [
      { id: "newsletter", label: "Career advice & newsletter", desc: "Weekly tips on interviews, resumes, and salary." },
      { id: "productUpdates", label: "Product updates", desc: "New features and improvements to JobFlow." },
    ]
  }
];

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    newMatches: true,
    weeklyDigest: true,
    statusChanges: true,
    interviews: true,
    directMessages: true,
    newsletter: false,
    productUpdates: false,
  });

  const handleToggle = (id) => {
    setSettings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    // In a real app, this would POST to the backend
    localStorage.setItem("jobflow_notifications", JSON.stringify(settings));
    toast.success("Notification preferences saved!");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Bell className="h-6 w-6 text-emerald-600" /> Notifications
        </h1>
        <p className="text-gray-500">Choose what you want to be notified about and how you receive them.</p>
      </div>

      <div className="space-y-10">
        
        {/* Delivery Channels */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Delivery Channels</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Email</p>
                  <p className="text-xs text-gray-500">Sent to your inbox</p>
                </div>
              </div>
              <div className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">Active</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">SMS / WhatsApp</p>
                  <p className="text-xs text-gray-500">Add phone number in Profile</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Setup</button>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Notification Categories */}
        <div className="space-y-8">
          {NOTIFICATION_SECTIONS.map((section) => (
            <div key={section.id}>
              <div className="flex items-start gap-3 mb-4">
                <div className="mt-0.5 p-2 bg-gray-50 rounded-lg text-gray-600">
                  <section.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>

              <div className="space-y-4 pl-12">
                {section.options.map((option) => (
                  <div key={option.id} className="flex items-center justify-between">
                    <div className="pr-4">
                      <p className="font-medium text-gray-900 text-sm">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </div>
                    <button 
                      onClick={() => handleToggle(option.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${settings[option.id] ? 'bg-emerald-500' : 'bg-gray-200'}`}
                      aria-label={`Toggle ${option.label}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings[option.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="pt-8 border-t border-gray-100">
          <button onClick={handleSave} className="w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm">
            Save preferences
          </button>
        </div>

      </div>
    </div>
  );
}