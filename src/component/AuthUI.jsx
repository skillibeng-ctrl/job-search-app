import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

export const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

// Only allow redirects to pages on this site (blocks "?next=https://evil.com").
export function safeNext(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export const EMAIL_RE = /^\S+@\S+\.\S+$/;

const POINTS = [
  "Hand-screened, verified companies only",
  "Direct application links. No middlemen.",
  "Transparent salaries and real benefits",
];

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main id="main" className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-gradient-to-br from-emerald-800 to-teal-900 p-12 text-white lg:flex">
        <Link to="/" className={`flex w-fit items-center gap-2 rounded-lg ${FOCUS}`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-sm font-bold">J</span>
          <span className="text-lg font-semibold">JobFlow</span>
        </Link>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Skip the noise.<br />Find the role that fits.</h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-emerald-50">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden />{p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-emerald-100">© {new Date().getFullYear()} JobFlow</p>
      </aside>

      <section className="flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-gray-600">{footer}</p>}
        </div>
      </section>
    </main>
  );
}

export function Field({ id, label, error, hint, className = "", ...input }) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-900">{label}</label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:ring-4 ${
          error ? "border-rose-500 focus:ring-rose-500/10" : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/10"
        }`}
        {...input}
      />
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-600">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1.5 text-sm text-rose-700">{error}</p>}
    </div>
  );
}

export function PasswordField({ id, label, error, hint, ...input }) {
  const [show, setShow] = useState(false);
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-900">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full rounded-xl border bg-white py-3 pl-4 pr-12 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:ring-4 ${
            error ? "border-rose-500 focus:ring-rose-500/10" : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/10"
          }`}
          {...input}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 ${FOCUS}`}
        >
          {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-600">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1.5 text-sm text-rose-700">{error}</p>}
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{children}</p>;
}

export function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70 ${FOCUS}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}