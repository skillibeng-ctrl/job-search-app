import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../component/AuthContext";
import { AuthShell, EMAIL_RE, Field, FOCUS, FormError, PasswordField, SubmitButton, safeNext } from "../component/AuthUI";
const ROLES = [
  { id: "seeker", label: "I'm looking for a job" },
  { id: "employer", label: "I'm hiring" },
];

export default function Register() {
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));

  const [role, setRole] = useState(params.get("role") === "employer" ? "employer" : "seeker");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const home = (u) => (u.role === "employer" ? "/employer" : next ?? "/jobs");

  if (!authLoading && user) return <Navigate to={home(user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!name.trim()) found.name = "Enter your name.";
    if (role === "employer" && !companyName.trim()) found.companyName = "Enter your company name.";
    if (!EMAIL_RE.test(email.trim())) found.email = "Enter a valid email address.";
    if (password.length < 8) found.password = "Use at least 8 characters.";
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const payload = { name: name.trim(), email: email.trim(), password, role, ...(role === "employer" ? { companyName: companyName.trim() } : {}) };
      const u = await register(payload);
      navigate(home(u), { replace: true });
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      if (err.status === 409) setFormError("");
      else if (err.status === 429) setFormError("Too many attempts. Please wait a few minutes and try again.");
      else if (!err.fieldErrors) setFormError("We couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle={role === "employer" ? "Set up your company and start hiring." : "Free for job seekers. No credit card required."}
      footer={<>Already have an account? <Link to={next ? `/signin?next=${encodeURIComponent(next)}` : "/signin"} className={`rounded font-semibold text-emerald-800 hover:underline ${FOCUS}`}>Sign in</Link></>}
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <FormError>{formError}</FormError>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-gray-900">I am…</legend>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
            {ROLES.map((r) => (
              <label key={r.id} className={`cursor-pointer rounded-lg px-3 py-2.5 text-center text-sm font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-emerald-600 ${role === r.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                <input type="radio" name="role" value={r.id} checked={role === r.id} onChange={() => setRole(r.id)} className="sr-only" />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field id="reg-name" label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        {role === "employer" && (
          <Field id="reg-company" label="Company name" autoComplete="organization" value={companyName} onChange={(e) => setCompanyName(e.target.value)} error={errors.companyName} hint="We review every company before its jobs go live." />
        )}
        <Field id="reg-email" label={role === "employer" ? "Work email" : "Email"} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <PasswordField id="reg-password" label="Password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint="At least 8 characters." />

        <SubmitButton loading={loading}>{role === "employer" ? "Create company account" : "Create account"}</SubmitButton>

        <p className="text-center text-xs text-gray-600">
          By creating an account you agree to our{" "}
          <Link to="/terms" className={`rounded underline ${FOCUS}`}>Terms</Link> and{" "}
          <Link to="/privacy" className={`rounded underline ${FOCUS}`}>Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}