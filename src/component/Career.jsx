import React from "react";
import { Link } from "react-router-dom";
import { Trophy, ShieldCheck, Zap, CheckCircle2, Star, ArrowRight, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-hidden">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* ================= LEFT COLUMN (Text & CTA) ================= */}
          <div className="max-w-2xl relative z-10">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Over 2,500+ active roles right now
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-gray-900">
              Skip the noise. <br />
              Find the role <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                that actually fits.
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
              Stop sifting through dead listings and spam. Discover verified, curated roles that match your skills, salary expectations, and lifestyle.
            </p>

            {/* CTA Button */}
            <div className="mt-8">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-gray-900/20 transition-all hover:-translate-y-1 hover:bg-black w-full sm:w-auto"
              >
                Browse Open Roles
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Modern Checklist Box */}
            <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
              <ul className="space-y-5">
                <li className="flex items-center gap-4 text-gray-700 font-medium text-base">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  Hand-screened, verified companies only
                </li>
                <li className="flex items-center gap-4 text-gray-700 font-medium text-base">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>
                  Direct application links. No middlemen.
                </li>
                <li className="flex items-center gap-4 text-gray-700 font-medium text-base">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                    <Target className="h-4 w-4 text-orange-600" />
                  </div>
                  Transparent salaries and real benefits
                </li>
              </ul>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (Image & Badges) ================= */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none flex justify-center mt-12 lg:mt-0">
            
            {/* Organic Gradient Blob Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-emerald-100 via-teal-50 to-blue-50 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] -z-10 animate-[spin_20s_linear_infinite]"></div>

            {/* Main Image Container (Arch Shape) */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md overflow-hidden rounded-t-[10rem] rounded-b-3xl border-8 border-white shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Professional smiling"
                className="w-full h-[500px] object-cover"
              />
              {/* Subtle overlay to make text pop if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating Badge 1: Top Left (Trophy) */}
            <div className="absolute left-0 top-16 z-20 flex items-center gap-3 rounded-2xl bg-white/90 p-3 pr-5 shadow-2xl backdrop-blur-md border border-white/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-inner">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">Top Rated</p>
                <p className="text-xs text-gray-500 font-medium">Job platform in 2024</p>
              </div>
            </div>

            {/* Floating Badge 2: Bottom Right (Trust) */}
            <div className="absolute -right-4 bottom-24 z-20 flex items-center gap-3 rounded-2xl bg-white/90 p-3 pr-5 shadow-2xl backdrop-blur-md border border-white/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-inner">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Trusted by</p>
                <p className="text-sm font-extrabold text-gray-900">10k+ Seekers</p>
              </div>
            </div>

            {/* Floating Badge 3: Bottom Left (Volume) */}
            <div className="absolute -left-6 bottom-8 z-20 flex items-center gap-3 rounded-2xl bg-white/90 p-3 pr-5 shadow-2xl backdrop-blur-md border border-white/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-inner">
                <Star className="h-5 w-5 fill-white" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-gray-900 leading-none">99%</p>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Scam-free listings</p>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}