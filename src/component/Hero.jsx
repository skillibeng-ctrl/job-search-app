import React, { useState, useEffect } from 'react';

const TestimonialCard = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Software Engineer",
      initials: "SM",
      quote: "This platform transformed my career journey with perfect opportunities.",
      color: "emerald"
    },
    {
      name: "James Rodriguez",
      role: "Product Manager",
      initials: "JR", 
      quote: "The matching system connected me with perfect companies for my skills.",
      color: "blue"
    },
    {
      name: "Priya Patel",
      role: "Data Scientist",
      initials: "PP",
      quote: "Landed my dream role faster than I ever thought possible.",
      color: "purple"
    }
  ];
  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => 
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const current = testimonials[currentTestimonial];
  
  const getColorClasses = (color) => {
    const colorMap = {
      emerald: {
        gradient: 'from-emerald-500 to-green-600',
        text: 'text-emerald-600'
      },
      blue: {
        gradient: 'from-blue-500 to-cyan-600', 
        text: 'text-blue-600'
      },
      purple: {
        gradient: 'from-purple-500 to-indigo-600',
        text: 'text-purple-600'
      }
    };
    return colorMap[color] || colorMap.emerald;
  };

  const colors = getColorClasses(current.color);

  return (
    <div className="flex justify-center items-center p-4">
      {/* Card with prominent shadow */}
      <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-3xl border border-gray-100">
        
        {/* Profile Section */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Avatar with strong shadow */}
          <div className={`bg-gradient-to-br ${colors.gradient} text-white font-bold w-12 h-12 flex items-center justify-center rounded-full shadow-lg`}>
            {current.initials}
          </div>
          
          {/* Name and Role */}
          <div className="text-left">
            <h3 className="font-semibold text-gray-800 text-lg">{current.name}</h3>
            <p className={`${colors.text} text-sm`}>{current.role}</p>
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="mb-4">
          <p className="text-gray-600 text-center leading-snug px-2 text-sm">
            "{current.quote}"
          </p>
        </div>

        {/* Navigation Arrows - Enhanced shadows */}
        <div className="flex justify-between items-center mb-3">
          <button 
            onClick={prevTestimonial}
            className="bg-white text-gray-600 w-8 h-8 flex items-center justify-center rounded-full shadow-lg border border-gray-200 hover:shadow-xl hover:bg-gray-50 transition-all text-lg"
          >
            ‹
          </button>
          
          {/* Progress Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentTestimonial 
                    ? `bg-gradient-to-r ${colors.gradient} scale-110 shadow-md` 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button 
            onClick={nextTestimonial}
            className="bg-white text-gray-600 w-8 h-8 flex items-center justify-center rounded-full shadow-lg border border-gray-200 hover:shadow-xl hover:bg-gray-50 transition-all text-lg"
          >
            ›
          </button>
        </div>

        
        {/* <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            Auto-rotates every 5s
          </div>
        </div> */}

        {/* CTA Button with strong shadow */}
        <button className={`w-full bg-gradient-to-r ${colors.gradient} shadow-lg hover:shadow-2xl text-white font-medium py-2 px-4 rounded-lg transition-all text-sm transform hover:-translate-y-0.5`}>
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

export default TestimonialCard;