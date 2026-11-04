import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const DreamJobSection = () => {
  return (
    <section className="bg-emerald-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-emerald-100">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Ready to find your <span className="text-emerald-600">dream job?</span>
        </h2>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join 50,000+ professionals who have transformed their careers with JobFlow. 
          Your next opportunity is just a click away.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-emerald-600 px-8 py-3.5 text-base font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-lg"
          >
            Create Free Profile
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/jobs"
            className="flex w-full sm:w-auto items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-8 py-3.5 text-base font-bold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
          >
            Browse Jobs
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 pt-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free forever</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card required</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Verified jobs only</span>
        </div>

      </div>
    </section>
  );
};

export default DreamJobSection;