import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Zap } from "lucide-react";

export default function Employers() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 mb-6">
            <Zap className="h-4 w-4" /> Hire faster with JobFlow
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Find the perfect <span className="text-emerald-600">candidate</span> today.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Post your job to thousands of qualified, active job seekers. No spam, no wasted time. Just great hires.
          </p>
          <Link
            to="/employers/post"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-base font-bold text-white transition hover:bg-black hover:-translate-y-0.5"
          >
            Post a Job <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
            <p className="text-4xl font-extrabold text-gray-900 mb-6">$0<span className="text-base font-medium text-gray-500">/mo</span></p>
            <ul className="space-y-3 mb-8">
              {["1 active job post", "Basic candidate matching", "Standard listing visibility"].map(f => (
                <li key={f} className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <button className="w-full rounded-xl border-2 border-gray-200 py-3 font-semibold text-gray-900 hover:bg-gray-50">Start Free</button>
          </div>

          <div className="rounded-2xl border-2 border-emerald-500 p-8 shadow-lg relative bg-white">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
            <p className="text-4xl font-extrabold text-gray-900 mb-6">$99<span className="text-base font-medium text-gray-500">/mo</span></p>
            <ul className="space-y-3 mb-8">
              {["5 active job posts", "Priority candidate matching", "Featured employer badge", "Access to AI resume filters"].map(f => (
                <li key={f} className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <button className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 shadow-md">Upgrade to Pro</button>
          </div>
        </div>
      </section>
    </div>
  );
}