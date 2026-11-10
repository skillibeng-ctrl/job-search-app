import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Bell, ChevronDown, Globe, Heart, MapPin, Menu, Search, X } from "lucide-react";

/* ============================= config ============================= */

const CATEGORIES = ["Engineering", "Design", "Data", "Product", "Marketing"];
const DEFAULT_CITIES = ["Lagos", "Abuja", "Nairobi", "London", "New York"];
const POPULAR_SEARCHES = ["Frontend Developer", "Product Designer", "Data Analyst"];

const RESOURCE_ITEMS = [
  { name: "Career Advice", to: "/resources" },
{ name: "Resume Templates", to: "/resume-templates" },
  { name: "Salary Guide", to: "/salaries" },
];

const EMPLOYER_LINKS = [
  { name: "Dashboard", to: "/employer", end: true },
  { name: "My Jobs", to: "/employer/jobs" },
  { name: "Candidates", to: "/employer/candidates" },
];

const EMPLOYER_MENU = [
  { name: "Company profile", to: "/employer/profile" }, // adjust to your routes
  { name: "Billing", to: "/employer/billing" },
  { name: "Settings", to: "/settings", divider: true },
  { name: "Help", to: "/help" },
];

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

const linkClass = ({ isActive }) =>
  [
    "relative py-1 text-sm font-medium transition-colors",
    "after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-emerald-500 after:transition-all after:duration-300",
    FOCUS,
    isActive ? "text-gray-900 after:w-full" : "text-gray-600 hover:text-gray-900 after:w-0 hover:after:w-full",
  ].join(" ");

const mobileLinkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${FOCUS} ${
    isActive ? "bg-emerald-50 text-emerald-800" : "text-gray-700 hover:bg-gray-50"
  }`;

const menuItemClass =
  "block rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-800 " + FOCUS;

const CSS = `
@keyframes nb-pop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.nb-pop { animation: nb-pop .15s ease-out; }
@media (prefers-reduced-motion: reduce) { .nb-pop { animation: none; } }
`;

/* ============================= helpers ============================= */

function readCount(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v.length : 0;
  } catch {
    return 0;
  }
}

function getInitials(user) {
  if (user?.initials) return user.initials;
  const src = user?.name || user?.email || "";
  return (
    src.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("") || "?"
  );
}

// Arrow / Home / End navigation inside an open menu panel.
function onMenuKeyDown(e) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
  const items = [...e.currentTarget.querySelectorAll("a[href], button:not([disabled])")];
  if (!items.length) return;
  e.preventDefault();
  const i = items.indexOf(document.activeElement);
  const next =
    e.key === "Home" ? 0
    : e.key === "End" ? items.length - 1
    : e.key === "ArrowDown" ? (i + 1) % items.length
    : (i - 1 + items.length) % items.length;
  items[next].focus();
}

/* ============================= search dialog ============================= */

function SearchDialog({ open, onClose, onSubmit }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  const returnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    returnRef.current = document.activeElement;
    setQ("");
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = (term) => {
    const value = (term ?? q).trim();
    if (value) onSubmit(value);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-gray-900/40 px-4 pt-[15vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search jobs"
        onMouseDown={(e) => e.stopPropagation()}
        className="nb-pop w-full max-w-xl rounded-2xl bg-white p-4 shadow-2xl"
      >
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10"
        >
          <Search className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
          <label htmlFor="nav-search" className="sr-only">Job title, skill or company</label>
          <input
            id="nav-search"
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Job title, skill or company"
            autoComplete="off"
            className="h-12 w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
          />
          <button type="submit" className={`rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 ${FOCUS}`}>
            Search
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-600">Popular:</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => submit(term)}
              className={`rounded-full border border-gray-200 px-3 py-1 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 ${FOCUS}`}
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================= main ============================= */

export default function NavBar({
  user = null,
  unread = 0,
  onLogout,
  notifications = [],     // [{ id, title, body?, to?, read?, time? }]
  onMarkAllRead,          // () => void
  cities = DEFAULT_CITIES,
}) {
  const [menu, setMenu] = useState(null); // 'find' | 'resources' | 'notifications' | 'account' | 'mobile' | null
  const [mobileResources, setMobileResources] = useState(false);
  const [mobileNotifs, setMobileNotifs] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const role = user?.role ?? "guest";
  const isEmployer = role === "employer";
  const showSearch = !isEmployer && (pathname !== "/" || pastHero);
  const unreadCount = unread || notifications.filter((n) => !n.read).length;

  const toggle = (name) => setMenu((m) => (m === name ? null : name));
  const closeAll = () => { setMenu(null); setMobileResources(false); setMobileNotifs(false); };

  /* ---- saved / applied badges (same tab + other tabs) ---- */
  useEffect(() => {
    const update = () => { setSavedCount(readCount("savedJobs")); setAppliedCount(readCount("appliedJobs")); };
    update();
    window.addEventListener("jobsUpdated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("jobsUpdated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  /* ---- close on route change ---- */
  useEffect(() => { closeAll(); }, [pathname]);

  /* ---- scroll state (fixed header height: only the shadow changes) ---- */
  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 8); setPastHero(window.scrollY > 320); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setIsMac(/Mac|iPhone|iPad/i.test(navigator.userAgent)); }, []);

  /* ---- Escape + outside click for menus ---- */
  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      const trigger = document.querySelector(`[data-menu-trigger="${menu}"]`);
      closeAll();
      trigger?.focus();
    };
    const onDown = (e) => {
      if (!e.target.closest(`[data-menu="${menu}"]`)) closeAll();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [menu]);

  /* ---- scroll lock for mobile menu / search ---- */
  useEffect(() => {
    if (menu !== "mobile" && !searchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menu, searchOpen]);

  /* ---- Ctrl/Cmd + K (on the homepage hero, the hero's own search handles it) ---- */
  useEffect(() => {
    if (!showSearch) return;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        closeAll();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSearch]);

  const openFromKey = (name) => (e) => {
    if (e.key !== "ArrowDown") return;
    e.preventDefault();
    setMenu(name);
    requestAnimationFrame(() =>
      document.querySelector(`[data-panel="${name}"] a, [data-panel="${name}"] button`)?.focus()
    );
  };

  const runSearch = (value) => {
    setSearchOpen(false);
    navigate(`/jobs?q=${encodeURIComponent(value)}`);
  };

  const handleLogout = () => { closeAll(); onLogout?.(); };

  const seekerMenu = [
    { name: "My Applications", to: "/applications", badge: appliedCount },
    { name: "Saved Jobs", to: "/saved", badge: savedCount },
    { name: "Profile", to: "/profile", divider: true },
    { name: "Settings", to: "/settings" },
    { name: "Help", to: "/help" },
  ];
  const menuItems = isEmployer ? EMPLOYER_MENU : seekerMenu;

  const resourcesActive = pathname.startsWith("/resources") || pathname.startsWith("/salaries");

  /* ---- shared bits ---- */
  const triggerProps = (name, label) => ({
    "data-menu-trigger": name,
    "aria-expanded": menu === name,
    "aria-haspopup": "true",
    "aria-label": label,
    onKeyDown: openFromKey(name),
  });

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-shadow duration-300 ${
        scrolled || menu === "mobile" ? "border-gray-200 bg-white/90 shadow-sm backdrop-blur-md" : "border-transparent bg-white"
      }`}
    >
      <style>{CSS}</style>

      <a
        href="#main"
        className="sr-only rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[70]"
      >
        Skip to content
      </a>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className={`flex shrink-0 items-center gap-2 rounded-lg ${FOCUS}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-sm font-bold text-white shadow-sm">J</span>
            <span className="text-lg font-semibold tracking-tight text-gray-900">JobFlow</span>
          </Link>

          {/* ============ Desktop nav ============ */}
          <nav aria-label="Main" className="hidden items-center gap-5 lg:flex xl:gap-7">
            {isEmployer ? (
              EMPLOYER_LINKS.map((l) => (
                <NavLink key={l.name} to={l.to} end={l.end} className={linkClass}>{l.name}</NavLink>
              ))
            ) : (
              <>
                {/* Find Jobs: link + mega-menu toggle */}
                <div className="relative flex items-center gap-0.5" data-menu="find">
                  <NavLink to="/jobs" className={linkClass}>Find Jobs</NavLink>
                  <button
                    type="button"
                    onClick={() => toggle("find")}
                    {...triggerProps("find", "Browse jobs by category and city")}
                    className={`rounded-md p-1 text-gray-600 hover:text-gray-900 ${FOCUS}`}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${menu === "find" ? "rotate-180" : ""}`} aria-hidden />
                  </button>

                  {menu === "find" && (
                    <div
                      data-panel="find"
                      onKeyDown={onMenuKeyDown}
                      className="nb-pop absolute left-0 top-full mt-3 w-[30rem] rounded-2xl border border-gray-100 bg-white p-5 shadow-xl shadow-gray-200/60"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">By field</p>
                          {CATEGORIES.map((c) => (
                            <Link key={c} to={`/jobs?category=${encodeURIComponent(c)}`} className={menuItemClass}>{c}</Link>
                          ))}
                        </div>
                        <div>
                          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">By place</p>
                          {cities.map((c) => (
                            <Link key={c} to={`/jobs?location=${encodeURIComponent(c)}`} className={`${menuItemClass} flex items-center gap-2`}>
                              <MapPin className="h-3.5 w-3.5 text-gray-500" aria-hidden />{c}
                            </Link>
                          ))}
                          <Link to="/jobs?location=Remote" className={`${menuItemClass} flex items-center gap-2`}>
                            <Globe className="h-3.5 w-3.5 text-gray-500" aria-hidden />Remote
                          </Link>
                        </div>
                      </div>
                      <Link to="/jobs" className={`mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-emerald-50 ${FOCUS}`}>
                        Browse all jobs
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  )}
                </div>

                <NavLink to="/companies" className={linkClass}>Companies</NavLink>

                {/* Resources */}
                <div className="relative" data-menu="resources">
                  <button
                    type="button"
                    onClick={() => toggle("resources")}
                    {...triggerProps("resources", "Resources")}
                    aria-label={undefined}
                    className={`flex items-center gap-1 rounded-md py-1 text-sm font-medium transition-colors ${FOCUS} ${
                      menu === "resources" || resourcesActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Resources
                    <ChevronDown className={`h-4 w-4 transition-transform ${menu === "resources" ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {menu === "resources" && (
                    <div
                      data-panel="resources"
                      onKeyDown={onMenuKeyDown}
                      className="nb-pop absolute left-0 top-full mt-3 w-52 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-gray-200/60"
                    >
                      {RESOURCE_ITEMS.map((item) => (
                        <Link key={item.name} to={item.to} className={menuItemClass}>{item.name}</Link>
                      ))}
                    </div>
                  )}
                </div>

                <NavLink to="/how-it-works" className={linkClass}>How It Works</NavLink>
              </>
            )}
          </nav>

          {/* ============ Right side ============ */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* search trigger (appears after the hero, or on inner pages) */}
            {showSearch && (
              <button
                type="button"
                onClick={() => { closeAll(); setSearchOpen(true); }}
                aria-label="Search jobs"
                className={`flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-600 hover:border-emerald-300 hover:text-gray-900 ${FOCUS}`}
              >
                <Search className="h-4 w-4" aria-hidden />
                <span className="hidden xl:inline">Search jobs</span>
                <kbd className="hidden rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600 xl:inline">
                  {isMac ? "⌘K" : "Ctrl K"}
                </kbd>
              </button>
            )}

            {/* guests */}
            {role === "guest" && (
              <div className="hidden items-center gap-2 lg:flex xl:gap-3">
                <NavLink to="/saved" aria-label="Saved jobs" className={`flex items-center gap-1.5 rounded-lg p-2 text-sm font-medium text-gray-600 hover:text-gray-900 ${FOCUS}`}>
                  <Heart className="h-5 w-5 xl:hidden" aria-hidden />
                  <span className="hidden xl:inline">Saved Jobs</span>
                  {savedCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-100 px-1.5 text-[11px] font-bold text-emerald-800">{savedCount}</span>
                  )}
                </NavLink>
                <span className="hidden h-5 w-px bg-gray-200 xl:block" aria-hidden />
                <Link to="/employers" className={`text-sm font-medium text-gray-600 hover:text-gray-900 ${FOCUS}`}>For Employers</Link>
                <span className="hidden h-5 w-px bg-gray-200 xl:block" aria-hidden />
                <Link to="/signin" className={`text-sm font-medium text-gray-700 hover:text-gray-900 ${FOCUS}`}>Sign in</Link>
                <Link to="/register" className={`rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 ${FOCUS}`}>
                  Get started
                </Link>
              </div>
            )}

            {/* signed in */}
            {role !== "guest" && (
              <div className="hidden items-center gap-2 lg:flex">
                {isEmployer && (
                  <Link to="/employer/jobs/new" className={`mr-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 ${FOCUS}`}>
                    Post a job
                  </Link>
                )}

                {/* notifications */}
                <div className="relative" data-menu="notifications">
                  <button
                    type="button"
                    onClick={() => toggle("notifications")}
                    {...triggerProps("notifications", unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications")}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 ${FOCUS}`}
                  >
                    <Bell className="h-5 w-5" aria-hidden />
                    {unreadCount > 0 && (
                      <span aria-hidden className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {menu === "notifications" && (
                    <div data-panel="notifications" onKeyDown={onMenuKeyDown} className="nb-pop absolute right-0 mt-3 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60">
                      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">Notifications</p>
                        {onMarkAllRead && unreadCount > 0 && (
                          <button type="button" onClick={onMarkAllRead} className={`rounded text-xs font-medium text-emerald-800 hover:underline ${FOCUS}`}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-gray-600">You're all caught up.</p>
                      ) : (
                        <ul className="max-h-80 overflow-y-auto py-1">
                          {notifications.map((n) => (
                            <li key={n.id}>
                              <Link to={n.to || "#"} className={`flex gap-3 px-4 py-3 text-sm hover:bg-gray-50 ${FOCUS}`}>
                                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-emerald-600"}`} aria-hidden />
                                <span className="min-w-0">
                                  <span className="block font-medium text-gray-900">{n.title}</span>
                                  {n.body && <span className="block truncate text-gray-600">{n.body}</span>}
                                  {n.time && <span className="block text-xs text-gray-500">{n.time}</span>}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* account */}
                <div className="relative" data-menu="account">
                  <button
                    type="button"
                    onClick={() => toggle("account")}
                    {...triggerProps("account", "Account menu")}
                    className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-xs font-semibold text-white ring-2 ring-white transition hover:ring-emerald-200 ${FOCUS}`}
                  >
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : getInitials(user)}
                  </button>
                  {menu === "account" && (
                    <div data-panel="account" onKeyDown={onMenuKeyDown} className="nb-pop absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="truncate text-xs text-gray-600">{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        {menuItems.map((item) => (
                          <div key={item.name}>
                            {item.divider && <div className="my-1 h-px bg-gray-100" />}
                            <Link to={item.to} className={`${menuItemClass} flex items-center justify-between`}>
                              {item.name}
                              {item.badge > 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">{item.badge}</span>}
                            </Link>
                          </div>
                        ))}
                        <div className="my-1 h-px bg-gray-100" />
                        <button type="button" onClick={handleLogout} className={`w-full rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50 ${FOCUS}`}>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* mobile toggle */}
            <button
              type="button"
              data-menu="mobile"
              data-menu-trigger="mobile"
              onClick={() => toggle("mobile")}
              aria-expanded={menu === "mobile"}
              aria-controls="mobile-menu"
              aria-label={menu === "mobile" ? "Close menu" : "Open menu"}
              className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden ${FOCUS}`}
            >
              {menu === "mobile" ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
              {role !== "guest" && unreadCount > 0 && menu !== "mobile" && (
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-600 ring-2 ring-white" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============ Mobile menu ============ */}
      {menu === "mobile" && (
        <div
          id="mobile-menu"
          data-menu="mobile"
          className="nb-pop fixed inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-gray-200 bg-white shadow-lg md:left-auto md:right-4 md:top-[4.5rem] md:max-h-[calc(100dvh-5.5rem)] md:w-96 md:rounded-2xl md:border md:shadow-2xl lg:hidden"
        >
          <nav aria-label="Mobile" className="space-y-1 px-4 py-4">
            {!isEmployer && (
              <button
                type="button"
                onClick={() => { closeAll(); setSearchOpen(true); }}
                className={`mb-2 flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 ${FOCUS}`}
              >
                <Search className="h-4 w-4" aria-hidden />
                Search jobs
              </button>
            )}

            {isEmployer ? (
              EMPLOYER_LINKS.map((l) => (
                <NavLink key={l.name} to={l.to} end={l.end} className={mobileLinkClass}>{l.name}</NavLink>
              ))
            ) : (
              <>
                <NavLink to="/jobs" className={mobileLinkClass}>Find Jobs</NavLink>
                <NavLink to="/companies" className={mobileLinkClass}>Companies</NavLink>
                <div>
                  <button
                    type="button"
                    onClick={() => setMobileResources((v) => !v)}
                    aria-expanded={mobileResources}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 ${FOCUS}`}
                  >
                    Resources
                    <ChevronDown className={`h-4 w-4 transition-transform ${mobileResources ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {mobileResources && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-emerald-100 pl-2">
                      {RESOURCE_ITEMS.map((item) => (
                        <Link key={item.name} to={item.to} className={`block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 ${FOCUS}`}>{item.name}</Link>
                      ))}
                    </div>
                  )}
                </div>
                <NavLink to="/how-it-works" className={mobileLinkClass}>How It Works</NavLink>
              </>
            )}
          </nav>

          <div className="space-y-2 border-t border-gray-100 px-4 py-4">
            {role === "guest" ? (
              <>
                <Link to="/saved" className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 ${FOCUS}`}>
                  Saved Jobs
                  {savedCount > 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">{savedCount}</span>}
                </Link>
                <Link to="/employers" className={`block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 ${FOCUS}`}>For Employers</Link>
                <Link to="/signin" className={`block rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 ${FOCUS}`}>Sign in</Link>
                <Link to="/register" className={`block rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-800 ${FOCUS}`}>Get started</Link>
              </>
            ) : (
              <>
                <div>
                  <button
                    type="button"
                    onClick={() => setMobileNotifs((v) => !v)}
                    aria-expanded={mobileNotifs}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 ${FOCUS}`}
                  >
                    Notifications
                    <span className="flex items-center gap-2">
                      {unreadCount > 0 && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileNotifs ? "rotate-180" : ""}`} aria-hidden />
                    </span>
                  </button>
                  {mobileNotifs && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-emerald-100 pl-2">
                      {notifications.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-gray-600">You're all caught up.</p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <Link key={n.id} to={n.to || "#"} className={`block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 ${FOCUS}`}>
                            <span className="block font-medium text-gray-900">{n.title}</span>
                            {n.time && <span className="block text-xs text-gray-500">{n.time}</span>}
                          </Link>
                        ))
                      )}
                      {onMarkAllRead && unreadCount > 0 && (
                        <button type="button" onClick={onMarkAllRead} className={`px-3 py-2 text-xs font-medium text-emerald-800 hover:underline ${FOCUS}`}>Mark all read</button>
                      )}
                    </div>
                  )}
                </div>
                {isEmployer && (
                  <Link to="/employer/jobs/new" className={`block rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-800 ${FOCUS}`}>Post a job</Link>
                )}
                {menuItems.map((item) => (
                  <Link key={item.name} to={item.to} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 ${FOCUS}`}>
                    {item.name}
                    {item.badge > 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">{item.badge}</span>}
                  </Link>
                ))}
                <button type="button" onClick={handleLogout} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-700 hover:bg-rose-50 ${FOCUS}`}>Sign out</button>
              </>
            )}
          </div>
        </div>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onSubmit={runSearch} />
    </header>
  );
}