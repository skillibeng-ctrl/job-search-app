import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const NavBar = () => {
  const [open, setOpen] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 50
    });
  }, []);

  const links = [
    { name: "Find Jobs", href: "/" },
    { name: "Companies", href: "/companies" },
    { name: "Resources", href: "/resources" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav 
      className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm"
      data-aos="fade-down"
      data-aos-delay="100"
      data-aos-duration="800"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-3xl font-semibold text-gray-800 font-[Poppins]"
            data-aos="fade-right"
            data-aos-delay="200"
            data-aos-duration="600"
          >
            JobFlow
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link, index) => (
              <Link
                key={link.name}
                to={link.href}
                className="relative text-gray-600 hover:text-black transition duration-200 after:content-[''] after:absolute after:w-0 after:h-[2px] after:left-0 after:-bottom-1 after:bg-emerald-500 after:transition-all after:duration-300 hover:after:w-full text-2x1"
                data-aos="fade-down"
                data-aos-delay={300 + (index * 100)}
                data-aos-duration="600"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/signin"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition"
              data-aos="fade-left"
              data-aos-delay="500"
              data-aos-duration="600"
            >
              Sign In
            </Link>
            <Link
              to="/get-started"
              className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition font-medium"
              data-aos="fade-left"
              data-aos-delay="600"
              data-aos-duration="600"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            data-aos="fade-left"
            data-aos-delay="400"
            data-aos-duration="600"
          >
            {open ? (
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div 
          className="md:hidden bg-white border-t border-gray-100"
          data-aos="fade-down"
          data-aos-duration="500"
        >
          <div className="space-y-2 px-4 py-3">
            {links.map((link, index) => (
              <Link
                key={link.name}
                to={link.href}
                className="block text-gray-700 hover:text-black py-2 border-b border-transparent hover:border-emerald-500 transition"
                onClick={() => setOpen(false)}
                data-aos="fade-right"
                data-aos-delay={index * 100}
                data-aos-duration="400"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                to="/signin"
                className="w-full border border-gray-300 text-center text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                onClick={() => setOpen(false)}
                data-aos="fade-up"
                data-aos-delay="300"
                data-aos-duration="400"
              >
                Sign In
              </Link>
              <Link
                to="/get-started"
                className="w-full bg-emerald-500 text-white text-center px-4 py-2 rounded-md hover:bg-emerald-600 font-medium"
                onClick={() => setOpen(false)}
                data-aos="fade-up"
                data-aos-delay="400"
                data-aos-duration="400"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;