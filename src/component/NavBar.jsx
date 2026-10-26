import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

/* ---------------- config ---------------- */

// 4 links only. Saved Jobs moves to the right side.
const GUEST_LINKS = [
  { name: "Find Jobs", to: "/jobs" },
  { name: "Companies", to: "/companies" },
  { name: "Resources", to: "/resources" }, // Changed from /advice to match your App.jsx
  { name: "Salaries", to: "/salaries" },
];

const SEEKER_LINKS = GUEST_LINKS;

const EMPLOYER_LINKS = [
  { name: "Dashboard", to: "/employer", end: true },
  { name: "My Jobs", to: "/employer/jobs" },
  { name: "Candidates", to: "/employer/candidates" },
];

const linkClass = ({ isActive }) =>
  [
    "relative py-1 text-sm font-medium transition-colors",
    "after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-emerald-500",
    "after:transition-all after:duration-300",
    isActive
      ? "text-gray-900 after:w-full"
      : "text-gray-600 hover:text-gray-900 after:w-0 hover:after:w-full",
  ].join(" ");

const mobileLinkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50"
  }`;

/* ---------------- component ---------------- */

export default function NavBar({ user = null, unread = 0 }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // 🔥 Dynamic Badges State
  const [savedCount, setSavedCount] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);

  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const menuRef = useRef(null);
  const { pathname } = useLocation();

  const role = user?.role ?? "guest";
  const links = role === "employer" ? EMPLOYER_LINKS : role === "seeker" ? SEEKER_LINKS : GUEST_LINKS;

  /* ---- 🔥 Read LocalStorage for Badges ---- */
  useEffect(() => {
    const updateCounts = () => {
      try {
        setSavedCount(JSON.parse(localStorage.getItem("savedJobs") || "[]").length);
        setAppliedCount(JSON.parse(localStorage.getItem("appliedJobs") || "[]").length);
      } catch {
        // ignore
      }
    };
    updateCounts();
    window.addEventListener("jobsUpdated", updateCounts);
    return () => window.removeEventListener("jobsUpdated", updateCounts);
  }, []);

  /* ---- Dynamic Seeker Menu ---- */
  const seekerMenu = [
    { name: "My Applications", to: "/applications", badge: appliedCount },
    { name: "Saved Jobs", to: "/saved", badge: savedCount },
    { name: "Profile", to: "/profile", divider: true },
    { name: "Settings", to: "/settings" },
    { name: "Help", to: "/help" },
  ];

  const menuItems = role === "employer" ? EMPLOYER_LINKS : seekerMenu;

  /* close everything on route change */
  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  /* scroll state */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* escape + scroll lock */
  useEffect(() => {
    if (!open && !menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, menuOpen]);

  /* outside click */
  useEffect(() => {
    if (!open && !menuOpen) return;
    const onDown = (e) => {
      if (open && !panelRef.current?.contains(e.target) && !toggleRef.current?.contains(e.target)) {
        setOpen(false);
      }
      if (menuOpen && !menuRef.current?.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, menuOpen]);

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
      scrolled || open ? "border-gray-200 bg-white/90 shadow-sm backdrop-blur-md" : "border-transparent bg-white"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm">J</span>
            <span className="text-lg font-semibold tracking-tight text-gray-900">JobFlow</span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <NavLink key={l.name} to={l.to} end={l.end} className={linkClass}>
                {l.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden items-center gap-3 md:flex">
            
            {/* If Guest: Show Saved Jobs + Auth Buttons */}
            {role === "guest" && (
              <>
                <NavLink to="/saved" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mr-2">
                  Saved Jobs
                  {savedCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-100 px-1.5 text-[11px] font-bold text-emerald-700">
                      {savedCount}
                    </span>
                  )}
                </NavLink>

                <span className="h-5 w-px bg-gray-200" aria-hidden />
                
                <Link to="/signin" className="text-sm font-medium text-gray-700 hover:text-gray-900">Sign in</Link>
                <Link to="/register" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition">
                  Get started
                </Link>
              </>
            )}

            {/* If Logged In: Show Bell + Avatar */}
            {role !== "guest" && (
              <>
                <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white ring-2 ring-white hover:ring-emerald-200 transition"
                  >
                    {user.initials}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {menuItems.map((item) => (
                          <div key={item.name}>
                            {item.divider && <div className="my-1 h-px bg-gray-100" />}
                            <Link to={item.to} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                              {item.name}
                              {item.badge > 0 && (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </div>
                        ))}
                        <div className="my-1 h-px bg-gray-100" />
                        <button className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 transition">Sign out</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            ref={toggleRef}
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 md:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div id="mobile-menu" ref={panelRef} className="border-t border-gray-200 bg-white md:hidden">
          <nav className="space-y-1 px-4 py-4">
            {links.map((l) => (
              <NavLink key={l.name} to={l.to} end={l.end} className={mobileLinkClass}>
                {l.name}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-2 border-t border-gray-100 px-4 py-4">
            {role === "guest" ? (
              <>
                <Link to="/saved" className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Saved Jobs
                  {savedCount > 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{savedCount}</span>}
                </Link>
                <Link to="/signin" className="block rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">Sign in</Link>
                <Link to="/register" className="block rounded-lg bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-600">Get started</Link>
              </>
            ) : (
              <>
                {menuItems.map((item) => (
                  <Link key={item.name} to={item.to} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    {item.name}
                    {item.badge > 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">{item.badge}</span>}
                  </Link>
                ))}
                <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50">Sign out</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}