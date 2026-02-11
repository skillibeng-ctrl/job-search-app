import React, { useEffect } from "react";
import { ArrowRight, Users, TrendingUp, Award } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const DreamJobSection = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100
    });
  }, []);

  const stats = [
    { icon: Users, number: "50K+", label: "Active Job Seekers" },
    { icon: TrendingUp, number: "85%", label: "Success Rate" },
    { icon: Award, number: "10K+", label: "Companies Hiring" },
  ];

  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Content */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 
              className="text-4xl sm:text-5xl font-bold text-gray-900"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Ready to Find Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                Dream Job?
              </span>
            </h2>
            
            <p 
              className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              Join thousands of professionals who have transformed their careers with JobFlow. 
              Your next opportunity is just a click away.
            </p>
          </div>

          {/* CTA Button */}
          <button 
            className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-lg py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-md flex items-center space-x-3 mx-auto"
            data-aos="fade-up"
            data-aos-delay="400"
            data-aos-anchor-placement="top-bottom"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 max-w-md mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center"
                data-aos="fade-up"
                data-aos-delay={500 + (index * 100)}
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <stat.icon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamJobSection;