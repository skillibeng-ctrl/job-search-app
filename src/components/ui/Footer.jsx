import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github, Mail, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#0a0f1c] text-white pt-20 pb-10 overflow-hidden">
      {/* Subtle Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column (Spans 2 columns on large screens) */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm">
                J
              </span>
              <span className="text-xl font-bold tracking-tight">JobFlow</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              Connecting the world's most innovative companies with top talent. Find your next role, track your applications, and get hired faster.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Github, href: "#", label: "GitHub" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 transition-all hover:bg-emerald-500 hover:border-emerald-500 hover:text-white hover:-translate-y-1"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="font-semibold text-sm tracking-wider uppercase text-gray-300 mb-6">For Job Seekers</h4>
            <ul className="space-y-4">
              <li><Link to="/jobs" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Browse Jobs</Link></li>
              <li><Link to="/companies" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Browse Companies</Link></li>
              <li><Link to="/resources" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Career Resources</Link></li>
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">How It Works</Link></li>
              <li><Link to="/salaries" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Salary Guide</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="font-semibold text-sm tracking-wider uppercase text-gray-300 mb-6">For Employers</h4>
            <ul className="space-y-4">
              <li><Link to="/employers" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Post a Job</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Employer Branding</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Recruiting Solutions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Pricing</a></li>
            </ul>
          </div>

          {/* Newsletter / Company */}
          <div>
            <h4 className="font-semibold text-sm tracking-wider uppercase text-gray-300 mb-6">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-4">Get the latest job alerts directly to your inbox.</p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-emerald-500 focus:bg-white/10"
                />
              </div>
              <button className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400">
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2026 JobFlow. All rights reserved.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>

          <button
            onClick={scrollToTop}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition"
            aria-label="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}