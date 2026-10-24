import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

/* ---------------- config ---------------- */

const GUEST_LINKS = [
  { name: "Find Jobs", to: "/jobs" },
  { name: "Companies", to: "/companies" },
  { name: "Salaries", to: "/salaries" },
  { name: "Career Advice", to: "/advice" },
];

const SEEKER_LINKS = GUEST_LINKS;

const EMPLOYER_LINKS = [
  { name: "Dashboard", to: "/employer" , end: true },
  { name: "My Jobs", to: "/employer/jobs" },
  { name: "Candidates", to: "/employer/candidates" },
  { name: "Messages", to: "/employer/messages" },
];

const seekerMenu = [
  { name: "View profile", to: "/profile" },
  { name: "My resume", to: "/resume" },
  { name: "Saved jobs", to: "/saved", badge: 3 },
  { name: "Applications", to: "/applications", badge: 12 },
  { name: "Job alerts", to: "/alerts" },
  { name: "Settings", to: "/settings", divider: true },
  { name: "Help", to: "/help" },
];

const employerMenu = [
  { name: "Company profile", to: "/employer/company" },
  { name: "Team & permissions", to: "/employer/team" },
  { name: "Billing & invoices", to: "/employer/billing", divider: true },
  { name: "Switch to job seeker", to: "/switch-to-seeker" },
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
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const menuRef = useRef(null);
  const { pathname } = useLocation();

  const role = user?.role ?? "guest";
  const links =
    role === "employer" ? EMPLOYER_LINKS : role === "seeker" ? SEEKER_LINKS : GUEST_LINKS;
  const menuItems = role === "employer" ? employerMenu : seekerMenu;

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

  /* escape + scroll lock while a panel is open */
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

  /* close on desktop resize */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => e.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      {/* skip link — first focusable element on the page */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gray-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={[
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled || open
            ? "border-gray-200 bg-white/90 shadow-sm backdrop-blur-md"
            : "border-transparent bg-white",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? "h-14" : "h-16"
            }`}
          >
            {/* Logo */}
            <Link to="/" aria-label="JobFlow home" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm">
                J
              </span>
              <span className="text-lg font-semibold tracking-tight text-gray-900">
                JobFlow
              </span>
            </Link>

            {/* Desktop links */}
            <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
              {links.map((l) => (
                <NavLink key={l.name} to={l.to} end={l.end} className={linkClass}>
                  {l.name}
                </NavLink>
              ))}
            </nav>

            {/* Desktop right */}
            <div className="hidden items-center gap-3 md:flex">
              {role === "guest" && (
                <>
                  <Link
                    to="/employers"
                    className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                  >
                    For Employers
                  </Link>
                  <span className="h-5 w-px bg-gray-200" aria-hidden />
                  <Link
                    to="/signin"
                    className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 transition hover:bg-emerald-600 hover:shadow-md"
                  >
                    Get started
                  </Link>
                </>
              )}

              {role !== "guest" && (
                <>
                  {role === "employer" && (
                    <Link
                      to="/employer/post"
                      className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 transition hover:bg-emerald-600"
                    >
                      Post a job
                    </Link>
                  )}

                  {/* Notification bell */}
                  <button
                    type="button"
                    aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
                    className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unread > 0 && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </button>

                  {/* Avatar menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      type="button"
                      onClick={() => setMenuOpen((v) => !v)}
                      aria-expanded={menuOpen}
                      aria-haspopup="menu"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white ring-2 ring-white transition hover:ring-emerald-200"
                    >
                      {user.initials}
                    </button>

                    {menuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60"
                      >
                        <div className="border-b border-gray-100 px-4 py-3">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="py-1">
                          {menuItems.map((item) => (
                            <div key={item.name}>
                              {item.divider && <div className="my-1 h-px bg-gray-100" />}
                              <Link
                                to={item.to}
                                role="menuitem"
                                className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                              >
                                {item.name}
                                {item.badge != null && (
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            </div>
                          ))}
                          <div className="my-1 h-px bg-gray-100" />
                          <button
                            type="button"
                            role="menuitem"
                            className="w-full px-4 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 md:hidden"
            >
              {open ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        {open && (
          <div
            id="mobile-menu"
            ref={panelRef}
            className="border-t border-gray-200 bg-white md:hidden"
          >
            <nav className="space-y-1 px-4 py-4" aria-label="Mobile">
              {links.map((l) => (
                <NavLink key={l.name} to={l.to} end={l.end} className={mobileLinkClass}>
                  {l.name}
                </NavLink>
              ))}
            </nav>

            <div className="space-y-2 border-t border-gray-100 px-4 py-4">
              {role === "guest" ? (
                <>
                  <Link
                    to="/employers"
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    For Employers
                  </Link>
                  <Link
                    to="/signin"
                    className="block rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="block rounded-lg bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-600"
                  >
                    Get started
                  </Link>
                </>
              ) : (
                <>
                  {role === "employer" && (
                    <Link
                      to="/employer/post"
                      className="block rounded-lg bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-600"
                    >
                      Post a job
                    </Link>
                  )}
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.to}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {item.name}
                      {item.badge != null && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}