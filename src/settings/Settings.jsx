import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  UserRound,
  Settings as SettingsIcon,
  Bell,
  BriefcaseBusiness,
  ShieldCheck,
  Lock,
  CreditCard,
  Camera,
  Save,
  RotateCcw,
  ChevronRight,
  AlertCircle,
  Laptop,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

const SETTINGS_KEY = "jobflow_settings";
const USER_KEY = "jobflow_user";
const PREFERENCES_KEY = "jobflow_preferences";

const DEFAULT_SETTINGS = {
  profile: {
    name: "",
    email: "",
    headline: "",
    location: "",
    bio: "",
    website: "",
    avatar: "",
  },
  preferences: {
    workStyle: "Remote",
    employmentType: "Full-time",
    experience: "Entry level",
    salaryMin: "",
    salaryMax: "",
    jobLocations: [],
    currency: "NGN",
    jobAlerts: true,
  },
  notifications: {
    emailAlerts: true,
    jobRecommendations: true,
    applicationUpdates: true,
    weeklyDigest: true,
    marketingEmails: false,
    browserNotifications: false,
  },
  privacy: {
    publicProfile: true,
    allowRecruiters: true,
    showLocation: true,
    showEmail: false,
  },
};

const TABS = [
  { id: "profile", label: "Profile", description: "Manage your personal information.", icon: UserRound },
  { id: "account", label: "Account", description: "Review your account information.", icon: SettingsIcon },
  { id: "notifications", label: "Notifications", description: "Choose which updates you receive.", icon: Bell },
  { id: "preferences", label: "Job preferences", description: "Personalize your job search.", icon: BriefcaseBusiness },
  { id: "privacy", label: "Privacy", description: "Control how your profile is shared.", icon: ShieldCheck },
  { id: "security", label: "Security", description: "Review account security options.", icon: Lock },
  { id: "billing", label: "Billing", description: "Review your plan and payment options.", icon: CreditCard },
];

function safeRead(key) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return {};
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function createInitialSettings() {
  const saved = safeRead(SETTINGS_KEY);
  const user = safeRead(USER_KEY);
  const oldPrefs = safeRead(PREFERENCES_KEY);

  const oldWorkStyle = String(oldPrefs.workStyle || "").toLowerCase();
  const workStyle =
    oldWorkStyle === "remote" ? "Remote" :
    oldWorkStyle === "hybrid" ? "Hybrid" :
    oldWorkStyle === "on-site" || oldWorkStyle === "onsite" ? "On-site" :
    DEFAULT_SETTINGS.preferences.workStyle;

  const oldJobTypes = Array.isArray(oldPrefs.jobTypes) ? oldPrefs.jobTypes : [];

  return {
    profile: {
      ...DEFAULT_SETTINGS.profile,
      ...(saved.profile || {}),
      name: saved.profile?.name || user.name || DEFAULT_SETTINGS.profile.name,
      email: saved.profile?.email || user.email || DEFAULT_SETTINGS.profile.email,
      location: saved.profile?.location || oldPrefs.location || DEFAULT_SETTINGS.profile.location,
    },
    preferences: {
      ...DEFAULT_SETTINGS.preferences,
      ...(saved.preferences || {}),
      workStyle: saved.preferences?.workStyle || workStyle,
      employmentType:
        saved.preferences?.employmentType ||
        oldJobTypes[0] ||
        DEFAULT_SETTINGS.preferences.employmentType,
      jobLocations: Array.isArray(saved.preferences?.jobLocations)
        ? saved.preferences.jobLocations
        : oldPrefs.location
          ? [oldPrefs.location]
          : [],
    },
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...(saved.notifications || {}),
    },
    privacy: {
      ...DEFAULT_SETTINGS.privacy,
      ...(saved.privacy || {}),
    },
  };
}

function SectionHeading({ title, description }) {
  return (
    <div className="mb-7">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="min-w-0 space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {children}
      {hint ? <p className="text-xs leading-5 text-gray-500">{hint}</p> : null}
    </div>
  );
}

function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
    />
  );
}

function SelectInput({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
    >
      {children}
    </select>
  );
}

function Toggle({ label, description, checked, onChange, disabled = false }) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-gray-100 py-4 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-emerald-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function Notice({ children, tone = "amber" }) {
  const styles = tone === "blue"
    ? "border-blue-100 bg-blue-50 text-blue-900"
    : "border-amber-100 bg-amber-50 text-amber-900";

  return (
    <div className={`flex gap-3 rounded-xl border p-4 text-sm ${styles}`}>
      <AlertCircle className="mt-0.5 shrink-0" size={18} />
      <div className="leading-6">{children}</div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState(createInitialSettings);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(createInitialSettings()));
  const [saving, setSaving] = useState(false);

  const activeTabInfo = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const profile = settings.profile;
  const preferences = settings.preferences;

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== savedSnapshot,
    [settings, savedSnapshot]
  );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const updateSection = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const validateSettings = () => {
    if (!profile.name.trim()) {
      toast.error("Please enter your full name.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(profile.email.trim())) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (
      preferences.salaryMin !== "" &&
      preferences.salaryMax !== "" &&
      Number(preferences.salaryMin) > Number(preferences.salaryMax)
    ) {
      toast.error("Minimum salary cannot be greater than maximum salary.");
      return false;
    }

    if (
      (preferences.salaryMin !== "" && Number(preferences.salaryMin) < 0) ||
      (preferences.salaryMax !== "" && Number(preferences.salaryMax) < 0)
    ) {
      toast.error("Salary values cannot be negative.");
      return false;
    }

    if (profile.website.trim()) {
      try {
        const url = new URL(profile.website);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid protocol");
      } catch {
        toast.error("Enter a valid website URL beginning with https://.");
        return false;
      }
    }

    return true;
  };

  const saveSettings = () => {
    if (saving || !validateSettings()) return;

    setSaving(true);
    try {
      const normalized = {
        ...settings,
        profile: {
          ...settings.profile,
          name: settings.profile.name.trim(),
          email: settings.profile.email.trim().toLowerCase(),
          headline: settings.profile.headline.trim(),
          location: settings.profile.location.trim(),
          website: settings.profile.website.trim(),
          bio: settings.profile.bio.trim(),
        },
        preferences: {
          ...settings.preferences,
          jobLocations: settings.preferences.jobLocations
            .map((location) => location.trim())
            .filter(Boolean),
        },
      };

      // Save the complete settings record.
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));

      // Preserve existing application data while keeping legacy keys in sync.
      const existingUser = safeRead(USER_KEY);
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({
          ...existingUser,
          name: normalized.profile.name,
          email: normalized.profile.email,
        })
      );

      const existingPreferences = safeRead(PREFERENCES_KEY);
      localStorage.setItem(
        PREFERENCES_KEY,
        JSON.stringify({
          ...existingPreferences,
          location: normalized.preferences.jobLocations[0] || normalized.profile.location,
          workStyle: normalized.preferences.workStyle.toLowerCase(),
          jobTypes: [normalized.preferences.employmentType],
          experience: normalized.preferences.experience,
          salaryMin: normalized.preferences.salaryMin,
          salaryMax: normalized.preferences.salaryMax,
          currency: normalized.preferences.currency,
          jobAlerts: normalized.preferences.jobAlerts,
        })
      );

      setSettings(normalized);
      setSavedSnapshot(JSON.stringify(normalized));
      toast.success("Your settings have been saved.");
    } catch (error) {
      console.error("Unable to save JobFlow settings:", error);
      toast.error("Could not save settings. Your browser storage may be full.");
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (!window.confirm("Reset all settings to their defaults? This cannot be undone.")) return;

    try {
      // Keep the current account identity; reset configurable preferences.
      const current = createInitialSettings();
      const reset = {
        ...DEFAULT_SETTINGS,
        profile: {
          ...DEFAULT_SETTINGS.profile,
          name: current.profile.name,
          email: current.profile.email,
        },
      };

      localStorage.setItem(SETTINGS_KEY, JSON.stringify(reset));
      setSettings(reset);
      setSavedSnapshot(JSON.stringify(reset));
      toast.success("Settings have been reset.");
    } catch (error) {
      console.error("Unable to reset settings:", error);
      toast.error("Could not reset settings.");
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choose a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 300 * 1024) {
      toast.error("Choose an image smaller than 300KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateSection("profile", "avatar", reader.result);
        toast.success("Photo preview updated. Save to keep the change.");
      }
    };
    reader.onerror = () => toast.error("The selected image could not be read.");
    reader.readAsDataURL(file);
  };

  const changeTab = (tabId) => {
    if (tabId === activeTab) return;
    if (isDirty && !window.confirm("You have unsaved changes. Leave this section without saving?")) return;
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-emerald-700">
            ACCOUNT MANAGEMENT
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950">Settings</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your profile, job preferences and account settings.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-gray-100 px-2 pb-5 pt-2">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="text-emerald-700" size={23} />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {profile.name || "Your profile"}
                </p>
                <p className="truncate text-xs text-gray-500">{profile.email || "Add your email"}</p>
              </div>
            </div>

            <nav aria-label="Settings sections" className="space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => changeTab(tab.id)}
                    aria-current={selected ? "page" : undefined}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                      selected
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} className={selected ? "text-emerald-700" : "text-gray-400"} />
                      {tab.label}
                    </span>
                    {selected ? <ChevronRight size={16} /> : null}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 rounded-xl bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-950">Need help?</p>
              <p className="mt-1 text-xs leading-5 text-emerald-800">
                Contact the JobFlow support team if you need help with your account.
              </p>
              <a
                href="mailto:support@jobflow.com"
                className="mt-3 inline-block text-xs font-bold text-emerald-800 underline-offset-4 hover:underline"
              >
                Contact support
              </a>
            </div>
          </aside>

          <main className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-950">{activeTabInfo.label}</h2>
                  <p className="mt-1 text-sm text-gray-500">{activeTabInfo.description}</p>
                </div>
                {isDirty ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    Unsaved changes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <CheckCircle2 size={15} /> All changes saved
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === "profile" && (
                <div>
                  <SectionHeading
                    title="Personal information"
                    description="Keep your professional profile accurate and up to date."
                  />

                  <div className="mb-8 flex flex-wrap items-center gap-5 border-b border-gray-100 pb-7">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-emerald-50">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        <UserRound size={34} className="text-emerald-700" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Profile photo</p>
                      <p className="mt-1 text-xs text-gray-500">JPG, PNG or WebP. Maximum 300KB.</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                          <Camera size={16} /> Upload photo
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            onChange={handleAvatarChange}
                          />
                        </label>
                        {profile.avatar ? (
                          <button
                            type="button"
                            onClick={() => updateSection("profile", "avatar", "")}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Remove photo
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name">
                      <TextInput
                        value={profile.name}
                        onChange={(event) => updateSection("profile", "name", event.target.value)}
                        placeholder="Your full name"
                        autoComplete="name"
                        maxLength={100}
                      />
                    </Field>
                    <Field label="Email address" hint="Changing your sign-in email should be verified by your backend once authentication is connected.">
                      <TextInput
                        type="email"
                        value={profile.email}
                        onChange={(event) => updateSection("profile", "email", event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        maxLength={254}
                      />
                    </Field>
                    <Field label="Professional headline">
                      <TextInput
                        value={profile.headline}
                        onChange={(event) => updateSection("profile", "headline", event.target.value)}
                        placeholder="e.g. Frontend Developer"
                        maxLength={120}
                      />
                    </Field>
                    <Field label="Location">
                      <TextInput
                        value={profile.location}
                        onChange={(event) => updateSection("profile", "location", event.target.value)}
                        placeholder="City, Country"
                        maxLength={120}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Portfolio or website" hint="Include the full URL, for example https://example.com.">
                        <TextInput
                          type="url"
                          value={profile.website}
                          onChange={(event) => updateSection("profile", "website", event.target.value)}
                          placeholder="https://yourportfolio.com"
                          maxLength={300}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="About you" hint={`${profile.bio.length}/500 characters`}>
                        <textarea
                          rows={5}
                          maxLength={500}
                          value={profile.bio}
                          onChange={(event) => updateSection("profile", "bio", event.target.value)}
                          placeholder="Write a short professional introduction..."
                          className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-6">
                  <SectionHeading title="Account information" description="Review the basic information associated with this JobFlow account." />
                  <Field label="Account email">
                    <TextInput value={profile.email} disabled readOnly />
                    <p className="text-xs text-gray-500">Email changes and verification will be managed through your authenticated API.</p>
                  </Field>
                  <Field label="Account type">
                    <TextInput value="Job seeker" disabled readOnly />
                  </Field>
                  <Field label="Language">
                    <SelectInput value="English" disabled>
                      <option value="English">English</option>
                    </SelectInput>
                  </Field>
                  <Notice>Account email changes, account deletion and identity verification are intentionally not simulated here. They need secure server-side workflows.</Notice>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <SectionHeading title="Notification preferences" description="Choose the types of updates you want JobFlow to send." />
                  <h4 className="mb-1 text-sm font-bold text-gray-900">Email preferences</h4>
                  <Toggle label="Important email notifications" description="Receive important account and service messages." checked={settings.notifications.emailAlerts} onChange={(value) => updateSection("notifications", "emailAlerts", value)} />
                  <Toggle label="Job recommendations" description="Receive recommendations based on your job preferences." checked={settings.notifications.jobRecommendations} onChange={(value) => updateSection("notifications", "jobRecommendations", value)} />
                  <Toggle label="Application updates" description="Receive updates about the jobs you have applied for." checked={settings.notifications.applicationUpdates} onChange={(value) => updateSection("notifications", "applicationUpdates", value)} />
                  <Toggle label="Weekly digest" description="Receive a weekly summary of relevant opportunities." checked={settings.notifications.weeklyDigest} onChange={(value) => updateSection("notifications", "weeklyDigest", value)} />
                  <Toggle label="Product news and offers" description="Receive optional product announcements and promotions." checked={settings.notifications.marketingEmails} onChange={(value) => updateSection("notifications", "marketingEmails", value)} />
                  <div className="mt-7 border-t border-gray-100 pt-5">
                    <h4 className="text-sm font-bold text-gray-900">Browser notifications</h4>
                    <p className="mt-1 text-xs leading-5 text-gray-500">This stores your preference only. Actual push notifications require browser permission and a notification service.</p>
                    <Toggle label="Browser notification preference" description="Save whether you would like browser notifications." checked={settings.notifications.browserNotifications} onChange={(value) => updateSection("notifications", "browserNotifications", value)} />
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div>
                  <SectionHeading title="Job preferences" description="Set the types of opportunities you want to discover." />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Work arrangement">
                      <SelectInput value={preferences.workStyle} onChange={(event) => updateSection("preferences", "workStyle", event.target.value)}>
                        <option>Remote</option><option>Hybrid</option><option>On-site</option><option>Any</option>
                      </SelectInput>
                    </Field>
                    <Field label="Employment type">
                      <SelectInput value={preferences.employmentType} onChange={(event) => updateSection("preferences", "employmentType", event.target.value)}>
                        <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Freelance</option>
                      </SelectInput>
                    </Field>
                    <Field label="Experience level">
                      <SelectInput value={preferences.experience} onChange={(event) => updateSection("preferences", "experience", event.target.value)}>
                        <option>Entry level</option><option>Junior</option><option>Mid-level</option><option>Senior</option><option>Lead</option>
                      </SelectInput>
                    </Field>
                    <Field label="Preferred locations" hint="Separate multiple locations with commas.">
                      <TextInput
                        value={preferences.jobLocations.join(", ")}
                        onChange={(event) => updateSection("preferences", "jobLocations", event.target.value.split(",").map((value) => value.trimStart()))}
                        placeholder="Lagos, Abuja, Remote"
                      />
                    </Field>
                    <Field label="Minimum salary">
                      <TextInput type="number" min="0" step="any" value={preferences.salaryMin} onChange={(event) => updateSection("preferences", "salaryMin", event.target.value)} placeholder="e.g. 150000" />
                    </Field>
                    <Field label="Maximum salary">
                      <TextInput type="number" min="0" step="any" value={preferences.salaryMax} onChange={(event) => updateSection("preferences", "salaryMax", event.target.value)} placeholder="e.g. 500000" />
                    </Field>
                    <Field label="Salary currency">
                      <SelectInput value={preferences.currency} onChange={(event) => updateSection("preferences", "currency", event.target.value)}>
                        <option value="NGN">NGN — Nigerian naira</option>
                        <option value="USD">USD — US dollar</option>
                        <option value="GBP">GBP — British pound</option>
                        <option value="EUR">EUR — Euro</option>
                      </SelectInput>
                    </Field>
                  </div>
                  <div className="mt-6 border-t border-gray-100 pt-3">
                    <Toggle label="Job alerts" description="Save your preference to receive alerts for matching opportunities." checked={preferences.jobAlerts} onChange={(value) => updateSection("preferences", "jobAlerts", value)} />
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div>
                  <SectionHeading title="Privacy controls" description="Choose how your profile should be discoverable. These are saved preferences; server enforcement is required." />
                  <Toggle label="Public profile" description="Allow your profile to be visible to people who visit your public profile." checked={settings.privacy.publicProfile} onChange={(value) => updateSection("privacy", "publicProfile", value)} />
                  <Toggle label="Recruiter discovery" description="Allow recruiters to find your profile in candidate searches." checked={settings.privacy.allowRecruiters} onChange={(value) => updateSection("privacy", "allowRecruiters", value)} />
                  <Toggle label="Display location" description="Show your location on your public profile." checked={settings.privacy.showLocation} onChange={(value) => updateSection("privacy", "showLocation", value)} />
                  <Toggle label="Display email address" description="Allow your email address to be displayed on your public profile." checked={settings.privacy.showEmail} onChange={(value) => updateSection("privacy", "showEmail", value)} />
                  <div className="mt-6"><Notice tone="blue">Saving these options does not hide information by itself. When you connect the API, your backend must check these preferences before returning profile data.</Notice></div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-5">
                  <SectionHeading title="Security and access" description="Security actions must be performed by your authentication server." />
                  <div className="flex gap-4 rounded-xl border border-gray-200 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50"><Lock className="text-emerald-700" size={20} /></div>
                    <div><p className="text-sm font-bold text-gray-900">Password management</p><p className="mt-1 text-xs leading-5 text-gray-500">Password changes require the authenticated password-change endpoint.</p><span className="mt-2 inline-block text-xs font-semibold text-amber-700">Backend connection required</span></div>
                  </div>
                  <div className="flex gap-4 rounded-xl border border-gray-200 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50"><ShieldCheck className="text-blue-700" size={20} /></div>
                    <div><p className="text-sm font-bold text-gray-900">Two-factor authentication</p><p className="mt-1 text-xs leading-5 text-gray-500">Add a second verification step after your authentication provider supports it.</p><span className="mt-2 inline-block text-xs font-semibold text-amber-700">Not configured</span></div>
                  </div>
                  <div className="flex gap-4 rounded-xl border border-gray-200 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50"><Laptop className="text-purple-700" size={20} /></div>
                    <div><p className="text-sm font-bold text-gray-900">Active sessions</p><p className="mt-1 text-xs leading-5 text-gray-500">View and revoke signed-in devices after session management is implemented.</p><span className="mt-2 inline-block text-xs font-semibold text-amber-700">Backend connection required</span></div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 text-xs text-gray-600"><Smartphone size={17} /> Never store passwords or authentication tokens in this settings record.</div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-5">
                  <SectionHeading title="Plan and billing" description="Review your current JobFlow plan." />
                  <div className="rounded-2xl bg-gray-950 p-7 text-white">
                    <p className="text-sm text-gray-300">Current plan</p>
                    <h3 className="mt-2 text-3xl font-bold">Free</h3>
                    <p className="mt-2 text-sm text-gray-300">No paid subscription is connected to this prototype.</p>
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300"><CheckCircle2 size={14} /> Active local plan</span>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-5">
                    <p className="text-sm font-bold text-gray-900">Payment methods</p>
                    <p className="mt-2 text-sm text-gray-500">No payment provider is connected.</p>
                  </div>
                  <Notice>Do not collect or store card details in this React component. Use a payment provider's secure checkout and server-side billing webhooks when you add paid plans.</Notice>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/70 px-6 py-5 sm:flex-row sm:px-8">
              <button
                type="button"
                onClick={resetSettings}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-red-600"
              >
                <RotateCcw size={16} /> Reset settings
              </button>
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving || !isDirty}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Save size={17} /> {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
