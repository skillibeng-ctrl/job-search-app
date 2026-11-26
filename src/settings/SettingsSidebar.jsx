import { NavLink } from "react-router-dom";
import { User, Settings as SettingsIcon, Bell, Briefcase, Shield, Lock, CreditCard } from "lucide-react";

const TABS = [
  { path: "/settings/profile", label: "Profile", icon: User },
  { path: "/settings/account", label: "Account", icon: SettingsIcon },
  { path: "/settings/notifications", label: "Notifications", icon: Bell },
  { path: "/settings/preferences", label: "Job preferences", icon: Briefcase },
  { path: "/settings/privacy", label: "Privacy", icon: Shield },
  { path: "/settings/security", label: "Security", icon: Lock },
  { path: "/settings/billing", label: "Billing", icon: CreditCard },
];

export default function SettingsSidebar() {
  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
      <h2 className="text-xl font-bold text-gray-900 mb-6 px-3">Settings</h2>
      <nav className="space-y-1">
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => 
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}