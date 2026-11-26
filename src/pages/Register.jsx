import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { 
  User, Mail, Lock, Building2, Eye, EyeOff, 
  Briefcase, Search, ArrowRight, Loader2, ShieldCheck 
} from "lucide-react";
import { toast } from "sonner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FOCUS = "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";
const safeNext = (next) => (next && next.startsWith("/") ? next : null);

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-gray-50 px-4 py-12 mt-16">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200/50">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>
        {children}
        {footer && <div className="text-center text-sm text-gray-600">{footer}</div>}
      </div>
    </div>
  );
}

function Field({ id, label, icon: Icon, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-900">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />}
        <input
          id={id}
          className={`w-full rounded-xl border border-gray-300 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors ${Icon ? "pl-10 pr-4" : "px-4"} ${FOCUS} ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500" : ""}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function PasswordField({ id, label, error, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-900">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          id={id}
          type={show ? "text" : "password"}
          className={`w-full rounded-xl border border-gray-300 py-3 pl-10 pr-12 text-sm text-gray-900 placeholder-gray-400 transition-colors ${FOCUS} ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500" : ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

const ROLES = [
  { id: "seeker", label: "I'm looking for a job", icon: Search },
  { id: "employer", label: "I'm hiring", icon: Briefcase },
];

export default function Register({ setUser }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));

  const [role, setRole] = useState(params.get("role") === "employer" ? "employer" : "seeker");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // CAPTCHA State
  const [num1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2] = useState(Math.floor(Math.random() * 10) + 1);
  const [captchaInput, setCaptchaInput] = useState("");

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // After signup, send to preferences for seekers, or employers dashboard
  const home = (u) => {
    if (u.role === "employer") return "/employers"; 
    if (next) return next; 
    return "/preferences"; // 👈 Force them to complete their profile
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!name.trim()) found.name = "Enter your name.";
    if (role === "employer" && !companyName.trim()) found.companyName = "Enter your company name.";
    if (!EMAIL_RE.test(email.trim())) found.email = "Enter a valid email address.";
    if (password.length < 8) found.password = "Use at least 8 characters.";
    
    // CAPTCHA Validation
    if (parseInt(captchaInput) !== num1 + num2) {
      found.captcha = "Incorrect answer. Please try again.";
    }
    
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const payload = { 
        name: name.trim(), 
        email: email.trim(), 
        role, 
        initials: name.trim().substring(0, 2).toUpperCase(),
        ...(role === "employer" ? { companyName: companyName.trim() } : {}) 
      };
      
      localStorage.setItem("jobflow_user", JSON.stringify(payload));
      if (setUser) setUser(payload);
      
      toast.success("Account created! Let's set up your preferences.");
      navigate(home(payload), { replace: true });
      
    } catch (err) {
      setFormError("We couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle={role === "employer" ? "Set up your company and start hiring." : "Free for job seekers. No credit card required."}
      footer={<>Already have an account? <Link to={next ? `/signin?next=${encodeURIComponent(next)}` : "/signin"} className={`rounded font-semibold text-emerald-700 hover:underline ${FOCUS}`}>Sign in</Link></>}
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        
        {formError && (
          <div className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700 border border-rose-200">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const active = role === r.id;
            return (
              <label 
                key={r.id} 
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 cursor-pointer transition-all ${
                  active 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20" 
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input type="radio" name="role" value={r.id} checked={active} onChange={() => setRole(r.id)} className="sr-only" />
                <Icon className={`h-6 w-6 ${active ? "text-emerald-600" : "text-gray-400"}`} />
                <span className="text-sm font-semibold">{r.label}</span>
              </label>
            );
          })}
        </div>

        <button type="button" className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Sign up with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or continue with email</span></div>
        </div>

        <Field id="reg-name" label="Full name" icon={User} autoComplete="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        
        {role === "employer" && (
          <Field id="reg-company" label="Company name" icon={Building2} autoComplete="organization" placeholder="Acme Inc." value={companyName} onChange={(e) => setCompanyName(e.target.value)} error={errors.companyName} />
        )}
        
        <Field id="reg-email" label={role === "employer" ? "Work email" : "Email address"} icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        
        <PasswordField id="reg-password" label="Password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />

        {/* 🔥 CAPTCHA SECTION */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> 
            Security Check: What is {num1} + {num2}?
          </label>
          <input 
            type="number" 
            required
            value={captchaInput} 
            onChange={(e) => setCaptchaInput(e.target.value)}
            placeholder="Enter the answer" 
            className={`w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${errors.captcha ? "border-rose-300" : ""}`} 
          />
          {errors.captcha && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.captcha}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (role === "employer" ? "Create company account" : "Create free account")}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
        <p className="text-center text-xs text-gray-500 leading-relaxed">
          By creating an account you agree to our{" "}
          <Link to="/terms" className={`underline ${FOCUS}`}>Terms</Link> and{" "}
          <Link to="/privacy" className={`underline ${FOCUS}`}>Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}