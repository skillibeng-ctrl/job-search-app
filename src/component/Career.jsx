import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";

function App() {
  const [searchForm, setSearchForm] = useState({
    jobTitle: "",
    location: ""
  });

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log("Search submitted:", searchForm);
  };

  const isSubmitDisabled = searchForm.jobTitle.trim() === "" && searchForm.location.trim() === "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f9f7] to-[#e8f5f2] font-sans">
      {/* Hero Section */}
      <main>
        <section className="flex flex-col lg:flex-row items-center justify-between px-2 sm:px-6 py-12 lg:py-20 gap-8 lg:gap-12">
          <div className="max-w-lg lg:max-w-2xl text-center lg:text-left">
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Find Your Perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700 block lg:inline">
                Career Match
              </span>
            </h1>
            <p 
              className="text-lg text-gray-600 mt-6 leading-relaxed max-w-2xl"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              Connect with top employers and discover opportunities that align
              with your skills, values, and career goals. Your next career move
              starts here.
            </p>

            {/* Search Box */}
            <div 
              className="bg-white p-6 rounded-2xl shadow-lg mt-8 border border-gray-100"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full" data-aos="fade-right" data-aos-delay="500">
                  <label htmlFor="jobTitle" className="text-sm font-semibold text-gray-700 mb-2 block">
                    What job are you looking for?
                  </label>
                  <input
                    id="jobTitle"
                    name="jobTitle"
                    type="search"
                    value={searchForm.jobTitle}
                    onChange={handleInputChange}
                    placeholder="Job title, keywords, or company"
                    autoComplete="job-title"
                    enterKeyHint="search"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                  />
                </div>
                <div className="flex-1 w-full" data-aos="fade-right" data-aos-delay="600">
                  <label htmlFor="location" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={searchForm.location}
                    onChange={handleInputChange}
                    placeholder="City, state, or remote"
                    autoComplete="address-level2"
                    enterKeyHint="search"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`${
                    isSubmitDisabled
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white px-8 py-3 rounded-lg w-full md:w-auto font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
                  // data-aos="fade-left"
                  data-aos-delay="700"
                >
                  Search Jobs
                </button>
              </form>
            </div>
          </div>
          {/* Hero Image */}
          <div className="relative mt-8 lg:mt-0" data-aos="fade-left" data-aos-delay="500">
            <div className="relative">
              <img
                src="images/image.png"
                alt="Diverse professionals collaborating in a modern workspace"
                className="rounded-2xl shadow-2xl w-full max-w-x2 lg:max-w-3x" 
                style={{height: '400px', objectFit: "cover", width: '800px'}}
              />
              {/* Floating elements */}
              <div 
                className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg"
                data-aos="zoom-in"
                data-aos-delay="1000"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">Live Jobs</span>
                </div>
              </div> 
            </div>
          </div>
        </section>
        {/* Stats Section */}
        <div 
          className="flex flex-wrap gap-6 justify-between px-7 bg-gradient-to-bl to-green-200 p-8 shadow-amber-950"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          {[
            { number: "50K+", label: "Active Job Listings" },
            { number: "10K+", label: "Companies Hiring" },
            { number: "85%", label: "Successful Placements" },
            { number: "95%", label: "Satisfaction Rate" }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="text-center"
              data-aos="zoom-in"
              data-aos-delay={400 + (index * 100)}
            >
              <div className="text-4xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div> 

        {/* Featured Opportunities Header */}
        <div className="px-4 sm:px-6 w-full mt-3 py-12 text-center ">
          <div className="max-w-4xl mx-auto">
            {/* Main Heading */}
            <div className="mb-6" data-aos="fade-up" data-aos-delay="200">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                Featured Opportunities
              </h1>
              
              {/* Decorative Element */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
              </div>
            </div>

            {/* Subheading */}
            <div className="max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="300">
              <h3 className="text-xl sm:text-2xl text-gray-600 font-light leading-relaxed">
                Discover <span className="font-semibold text-gray-800">top-rated positions</span> from leading companies across various industries
              </h3>
            </div>

            {/* Stats or Additional Info */}
            <div 
              className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-500"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              {[
                { color: "bg-green-400", text: "Updated daily" },
                { color: "bg-blue-400", text: "100+ companies" },
                { color: "bg-purple-400", text: "Curated selection" }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-2"
                  data-aos="fade-up"
                  data-aos-delay={500 + (index * 100)}
                >
                  <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Job Cards */}
        <div className="flex justify-between p-8 flex-wrap">
          {[1, 2, 3].map((card, index) => (
            <div 
              key={index}
              className="max-w-sm w-full bg-white border border-gray-100 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out group mb-6"
              data-aos="fade-up"
              data-aos-delay={300 + (index * 200)}
            >
              {/* Header with Logo and Featured Badge */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-14 h-14 flex items-center justify-center rounded-xl text-gray-700 font-bold shadow-inner group-hover:shadow-md transition-shadow">
                    TC
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">TECH</span>
                  </div>
                </div>
                <span className="text-xs bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 rounded-full font-semibold shadow-sm">
                  ⭐ Featured
                </span>
              </div>

              {/* Job Title & Company */}
              <h2 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors">Senior Software Engineer</h2>
              <p className="text-sm text-gray-600 font-medium mb-4">TechCorp Inc.</p>

              {/* Location & Salary */}
              <div className="flex flex-col space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-blue-500">📍</span>
                  </div>
                  <span>San Francisco, CA • Remote Friendly</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <span className="text-green-600">💰</span>
                  </div>
                  <span className="font-semibold text-gray-900">$120k - $180k • Equity</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", content: "🚀 Full-time" },
                  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", content: "🌍 Remote" },
                  { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", content: "⚡ Senior" }
                ].map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className={`${tag.bg} ${tag.text} ${tag.border} text-xs font-semibold px-3 py-1.5 rounded-lg border`}
                    data-aos="zoom-in"
                    data-aos-delay={tagIndex * 100}
                  >
                    {tag.content}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 leading-relaxed font-light">
                Join our innovative team to build cutting-edge solutions using modern technologies like React, Node.js, and cloud infrastructure.
              </p>

              {/* Footer Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <span>👥 50+ applicants</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⏰ Posted 2 days ago</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button className="flex-1 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg border border-emerald-600 cursor-pointer">
                  Apply Now ↗
                </button>
                <button className="w-12 h-12 border-2 border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md">
                  <span className="text-lg">♡</span>
                </button>
              </div>

              {/* Quick Apply Hint */}
              <div className="mt-3 text-xs text-gray-400 text-center">
                ⚡ Quick apply • 3-step process
              </div>
            </div>
          ))}
        </div>

        {/* View All Jobs Button */}
        <div className="p-5 w-full justify-center ">
          <h1 
            className="font-bold cursor-pointer p-2 rounded-sm border-2 border-gray-300 hover:border-gray-800 w-fit text-center m-auto hover:-translate-y-1 transition-all hover:shadow-lg"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            View All Jobs
          </h1>
        </div>
      </main>

      {/* How It Works Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white text-center overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-50 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-60" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-50 rounded-full translate-x-1/3 translate-y-1/3 opacity-40" />
        
        <div className="relative max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="mb-16" data-aos="fade-up" data-aos-delay="200">
            <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4 shadow-lg">
              🚀 Simple Process
            </span>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get started in three simple steps and accelerate your journey to landing that perfect role
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-green-200 to-emerald-200 transform -translate-y-1/2 z-0" />
            
            {/* Step 1 */}
            <div 
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 z-10"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-2xl w-20 h-20 flex items-center justify-center rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 mx-auto">
                  <span className="group-hover:scale-110 transition-transform duration-300">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-gray-900 transition-colors">
                Create Your Profile
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                Build a stunning profile that highlights your unique skills, experience, and career aspirations. Stand out from the crowd.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="inline-flex items-center text-sm text-green-600 font-semibold">
                  Get Started
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div 
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 z-10"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-bold text-2xl w-20 h-20 flex items-center justify-center rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 mx-auto">
                  <span className="group-hover:scale-110 transition-transform duration-300">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-gray-900 transition-colors">
                Discover Opportunities
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                Explore personalized job matches and connect with innovative companies actively seeking your talent.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="inline-flex items-center text-sm text-blue-600 font-semibold">
                  Explore Jobs
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>   
            {/* Step 3 */}
            <div 
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 z-10"
              data-aos="fade-up"
              data-aos-delay="500"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-purple-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-2xl w-20 h-20 flex items-center justify-center rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 mx-auto">
                  <span className="group-hover:scale-110 transition-transform duration-300">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-gray-900 transition-colors">
                Get Hired
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                Apply seamlessly, track your progress, and land interviews with your dream companies faster than ever.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="inline-flex items-center text-sm text-purple-600 font-semibold">
                  Start Applying
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div 
            className="mt-16 pt-8 border-t border-gray-200"
            data-aos="fade-up"
            data-aos-delay="600">
            <p className="text-gray-600 mb-6">Ready to start your journey?</p>
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
          
    </div>  
  );
}

export default App;