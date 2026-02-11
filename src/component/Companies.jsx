import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building, 
  Users, 
  TrendingUp, 
  Filter, 
  Star, 
  Globe, 
  Award, 
  Clock,
  Heart,
  ExternalLink,
  CheckCircle,
  ChevronDown,
  Loader2,
  Sparkles,
  X,
  Building2,
  Target,
  Zap,
  Crown,
  Rocket,
  Shield,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Check,
  Home,
  Phone,
  Mail
} from "lucide-react";
import { Link } from "react-router-dom";

const Companies = () => {
  // State Management
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedCompanies, setSavedCompanies] = useState(new Set([1, 3, 6]));
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    industry: "all",
    size: "all",
    fundingStage: "all",
    locationType: "all",
    sortBy: "rating"
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [stats, setStats] = useState({
    totalCompanies: 0,
    hiringNow: 0,
    remoteCompanies: 0,
    avgRating: 0
  });

  // Industries
  const industries = [
    "All Industries",
    "Technology",
    "Fintech",
    "Productivity",
    "Design",
    "AI",
    "Infrastructure",
    "Security",
    "HR Tech",
    "Developer Tools",
    "Healthcare",
    "E-commerce",
    "Education",
    "Clean Energy"
  ];

  // Company sizes
  const companySizes = [
    { value: "all", label: "All Sizes" },
    { value: "Small", label: "Small (1-200)" },
    { value: "Medium", label: "Medium (201-1000)" },
    { value: "Large", label: "Large (1000+)" }
  ];

  // Funding stages
  const fundingStages = [
    { value: "all", label: "All Stages" },
    { value: "Seed", label: "Seed" },
    { value: "Series A", label: "Series A" },
    { value: "Series B", label: "Series B" },
    { value: "Series C", label: "Series C" },
    { value: "Series D+", label: "Series D+" },
    { value: "Private", label: "Private" },
    { value: "Acquired", label: "Acquired" },
    { value: "IPO", label: "Public (IPO)" }
  ];

  // Location types
  const locationTypes = [
    { value: "all", label: "All Locations" },
    { value: "Remote", label: "Remote Only" },
    { value: "Hybrid", label: "Hybrid" },
    { value: "On-site", label: "On-site" }
  ];

  // Sort options
  const sortOptions = [
    { value: "rating", label: "Highest Rated" },
    { value: "growth", label: "Fastest Growing" },
    { value: "openPositions", label: "Most Openings" },
    { value: "size", label: "Largest Companies" },
    { value: "newest", label: "Recently Added" },
    { value: "featured", label: "Featured First" }
  ];

  // Calculate statistics
  useEffect(() => {
    const total = companies.length;
    const hiringNow = companies.filter(c => c.hiringNow).length;
    const remoteCompanies = companies.filter(c => c.locationType === "Remote").length;
    const avgRating = companies.reduce((sum, c) => sum + c.rating, 0) / total;
    
    setStats({
      totalCompanies: total,
      hiringNow,
      remoteCompanies,
      avgRating: parseFloat(avgRating.toFixed(1))
    });
  }, []);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(company =>
        company.name.toLowerCase().includes(searchLower) ||
        company.description.toLowerCase().includes(searchLower) ||
        company.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        company.industry.toLowerCase().includes(searchLower)
      );
    }

    // Apply location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      result = result.filter(company =>
        company.location.toLowerCase().includes(locationLower)
      );
    }

    // Apply industry filter
    if (filters.industry !== "all") {
      result = result.filter(company => company.industry === filters.industry);
    }

    // Apply size filter
    if (filters.size !== "all") {
      result = result.filter(company => company.size === filters.size);
    }

    // Apply funding stage filter
    if (filters.fundingStage !== "all") {
      result = result.filter(company => {
        if (filters.fundingStage === "Series D+") {
          return company.fundingStage === "Series D" || 
                 company.fundingStage === "Series E" || 
                 company.fundingStage === "Series I";
        }
        return company.fundingStage === filters.fundingStage;
      });
    }

    // Apply location type filter
    if (filters.locationType !== "all") {
      result = result.filter(company => company.locationType === filters.locationType);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "growth":
          return parseFloat(b.growth) - parseFloat(a.growth);
        case "openPositions":
          return b.openPositions - a.openPositions;
        case "size":
          return b.employeeCount - a.employeeCount;
        case "newest":
          return b.founded - a.founded;
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case "rating":
        default:
          return b.rating - a.rating;
      }
    });

    return result;
  }, [filters]);

  // Pagination
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCompanies, currentPage]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  // Toggle save company
  const toggleSaveCompany = (companyId) => {
    const newSaved = new Set(savedCompanies);
    if (newSaved.has(companyId)) {
      newSaved.delete(companyId);
    } else {
      newSaved.add(companyId);
    }
    setSavedCompanies(newSaved);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      location: "",
      industry: "all",
      size: "all",
      fundingStage: "all",
      locationType: "all",
      sortBy: "rating"
    });
  };

  // Format employee count
  const formatEmployeeCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} ({rating > 1000 ? `${(rating/1000).toFixed(1)}k` : rating})
        </span>
      </div>
    );
  };

  // Loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading amazing companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-gradient-to-br from-green-50 to-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Discover 12,000+ Companies
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Find Your Next
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Dream Company
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Explore innovative companies with amazing culture, competitive benefits, and opportunities for growth.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/jobs"
                className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Browse 45,000+ Jobs
              </Link>
              
              <button className="inline-flex items-center border-2 border-gray-300 hover:border-gray-800 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg">
                <Building2 className="w-5 h-5 mr-2" />
                For Employers
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.totalCompanies}+</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.hiringNow}</div>
              <div className="text-gray-600">Hiring Now</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.remoteCompanies}</div>
              <div className="text-gray-600">Remote-First</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.avgRating}</div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Location */}
            <div className="lg:col-span-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Industry */}
            <div className="lg:col-span-2">
              <select
                value={filters.industry}
                onChange={(e) => handleFilterChange("industry", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
              >
                {industries.map(industry => (
                  <option key={industry} value={industry === "All Industries" ? "all" : industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="lg:col-span-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="lg:col-span-1">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Reset */}
            <div className="lg:col-span-2">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  value={filters.size}
                  onChange={(e) => handleFilterChange("size", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {companySizes.map(size => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Stage
                </label>
                <select
                  value={filters.fundingStage}
                  onChange={(e) => handleFilterChange("fundingStage", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {fundingStages.map(stage => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Location
                </label>
                <select
                  value={filters.locationType}
                  onChange={(e) => handleFilterChange("locationType", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {locationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredCompanies.length} Companies
            </h2>
            <p className="text-gray-600">
              {filters.industry !== "all" && `in ${filters.industry} • `}
              {filters.location && `in ${filters.location} • `}
              Sorted by {sortOptions.find(o => o.value === filters.sortBy)?.label}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Company Header */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border border-gray-200">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/48";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                          <Building className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-600">{company.industry}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleSaveCompany(company.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        savedCompanies.has(company.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>

                {/* Featured Badge */}
                {company.featured && (
                  <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mb-3 border border-amber-200">
                    <Crown className="w-3 h-3" />
                    Featured Company
                  </div>
                )}

                {/* Rating and Growth */}
                <div className="flex items-center justify-between mb-4">
                  {renderStars(company.rating)}
                  <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    {company.growth} growth
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {company.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {company.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                  {company.tags.length > 3 && (
                    <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-lg text-xs font-medium border border-gray-200">
                      +{company.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{company.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{formatEmployeeCount(company.employeeCount)} employees</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Zap className="w-4 h-4 text-gray-400" />
                    <span>{company.locationType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span>{company.fundingStage}</span>
                  </div>
                </div>

                {/* Tech Stack Preview */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Tech Stack</div>
                  <div className="flex flex-wrap gap-1">
                    {company.techStack.slice(0, 4).map((tech, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                    {company.techStack.length > 4 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                        +{company.techStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Open Positions */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {company.openPositions}
                      </div>
                      <div className="text-sm text-gray-600">Open positions</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        to={`/companies/${company.id}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/companies/${company.id}/jobs`}
                        className="inline-flex items-center px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Jobs
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* No Results */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No companies found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12 border border-green-100">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Looking for your next opportunity?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who found their dream job through our platform. 
              Get personalized job recommendations and connect directly with hiring managers.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Free Account
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center px-6 py-3 border-2 border-gray-800 text-gray-800 font-semibold rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Browse All Jobs
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold">JobFlow</span>
              </div>
              <p className="text-gray-400 mb-6">
                Connecting the world's most innovative companies with top talent.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  LinkedIn
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  GitHub
                </a>
              </div>
            </div>

            {/* For Job Seekers */}
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/jobs" className="text-gray-400 hover:text-white transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/companies" className="text-gray-400 hover:text-white transition-colors">
                    Browse Companies
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Career Resources
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Salary Calculator
                  </a>
                </li>
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Post a Job
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Employer Branding
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Recruiting Solutions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 JobFlow. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Companies;