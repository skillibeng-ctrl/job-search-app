/* Footer.jsx  –  plain JSX, ready to import anywhere */
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold">JobFlow</span>
            </div>
            <p className="text-gray-400 mb-6">
              Connecting the world's most innovative companies with top talent.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-3">
              <li><Link to="/jobs" className="text-gray-400 hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="/companies" className="text-gray-400 hover:text-white transition-colors">Browse Companies</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Career Resources</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Salary Calculator</a></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="font-semibold mb-4">For Employers</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Post a Job</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Employer Branding</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Recruiting Solutions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        {/* Bottom line */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© 2026 JobFlow. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}