import { createContext, useContext, useEffect, useMemo, useState } from "react";

/* =====================================================================
   BACKEND CONTRACT (when you build your own API)

   POST /api/auth/register  { name, email, password, role: "seeker"|"employer", companyName? }
                            -> 201 { user }
   POST /api/auth/login     { email, password }            -> { user }
   POST /api/auth/logout                                   -> 204
   GET  /api/me                                            -> { user }  (401 if not signed in)

   user = { id, name, email, role: "seeker" | "employer", initials?, avatarUrl? }

   Errors: JSON { message, errors?: { fieldName: "message" } } with a status:
   400/422 validation, 401 wrong credentials, 409 email already used, 429 too many tries.

   The server should set the session as an httpOnly, Secure, SameSite cookie.
   Never keep tokens in localStorage.
   ===================================================================== */

const USE_MOCK = true;   // MUST be false in production
const API_BASE = "";     // e.g. "https://api.yoursite.com"

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || "Something went wrong.");
    this.status = status;
    this.fieldErrors = body?.errors || null;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let body = null;
  try { body = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw new ApiError(res.status, body);
  return body;
}

/* ---------- mock mode: lets you click through the flow before a backend exists ----------
   DEV ONLY. Passwords are stored in plain text in the browser here. Never ship this. */
const USERS_KEY = "jobflow:mock-users";
const SESSION_KEY = "jobflow:mock-session";
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const mockUsers = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; } };
const initialsOf = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("") || "?";
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, initials: initialsOf(u.name) });

const authApi = {
  async me() {
    if (USE_MOCK) {
      await delay(150);
      const id = localStorage.getItem(SESSION_KEY);
      const u = id && mockUsers().find((x) => x.id === id);
      return u ? publicUser(u) : null;
    }
    try {
      return (await request("/api/me")).user;
    } catch (e) {
      if (e.status === 401) return null;
      throw e;
    }
  },
  async login(email, password) {
    if (USE_MOCK) {
      await delay();
      const u = mockUsers().find((x) => x.email === email.toLowerCase() && x.password === password);
      if (!u) throw new ApiError(401, { message: "Incorrect email or password." });
      localStorage.setItem(SESSION_KEY, u.id);
      return publicUser(u);
    }
    return (await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })).user;
  },
  async register(data) {
    if (USE_MOCK) {
      await delay();
      const users = mockUsers();
      if (users.some((x) => x.email === data.email.toLowerCase())) {
        throw new ApiError(409, { message: "That email is already registered.", errors: { email: "An account with this email already exists." } });
      }
      const u = { id: String(Date.now()), ...data, email: data.email.toLowerCase() };
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, u]));
      localStorage.setItem(SESSION_KEY, u.id);
      return publicUser(u);
    }
    return (await request("/api/auth/register", { method: "POST", body: JSON.stringify(data) })).user;
  },
  async logout() {
    if (USE_MOCK) { localStorage.removeItem(SESSION_KEY); return; }
    await request("/api/auth/logout", { method: "POST" });
  },
};

/* ============================= context ============================= */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authApi.me()
      .then((u) => { if (!cancelled) setUser(u); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email, password) { const u = await authApi.login(email, password); setUser(u); return u; },
      async register(data) { const u = await authApi.register(data); setUser(u); return u; },
      async logout() { try { await authApi.logout(); } finally { setUser(null); } },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}