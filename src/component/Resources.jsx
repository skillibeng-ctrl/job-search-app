import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  BookOpen, FileText, Video, Download, TrendingUp, Users, Briefcase, GraduationCap,
  Search, Filter, Clock, Star, Bookmark, BookmarkCheck, Share2, ExternalLink,
  ThumbsUp, Eye, BookOpenCheck, Loader2
} from "lucide-react";

/* ---------- static data (Will be replaced by Backend) ---------- */
const MOCK_RESOURCES = [
  {
    id: 1, title: "Complete Guide to Writing a Winning Resume",
    description: "Learn how to craft a resume that gets you noticed by recruiters and hiring managers in 2026 with ATS optimization tips.",
    category: "Resume Tips", type: "guide", icon: FileText, readTime: "10 min",
    gradient: "from-emerald-500 to-teal-600", tags: ["ATS", "Formatting", "Keywords"],
    views: 1243, likes: 89, featured: true, difficulty: "Beginner",
    lastUpdated: "2026-02-15", downloadUrl: "/templates/resume-template.pdf", completionPercentage: 75,
  },
  {
    id: 2, title: "Mastering the Technical Interview",
    description: "Comprehensive guide covering algorithms, system design, and behavioural questions for tech interviews.",
    category: "Interview Prep", type: "course", icon: Video, readTime: "2 hours",
    gradient: "from-blue-500 to-cyan-600", tags: ["Algorithms", "System Design", "Behavioural"],
    views: 2876, likes: 156, featured: true, difficulty: "Advanced",
    lastUpdated: "2026-03-20", externalUrl: "https://example.com/masterclass", completionPercentage: 30,
  },
  {
    id: 3, title: "2026 Salary Negotiation Tactics",
    description: "Expert strategies to negotiate better compensation packages and understand your market value.",
    category: "Salary Insights", type: "guide", icon: TrendingUp, readTime: "8 min",
    gradient: "from-amber-500 to-orange-600", tags: ["Negotiation", "Compensation", "Market Research"],
    views: 1987, likes: 102, featured: false, difficulty: "Intermediate",
    lastUpdated: "2026-04-10",
  },
  {
    id: 4, title: "Career Change Roadmap",
    description: "Step-by-step guide for successfully transitioning to a new career path with confidence.",
    category: "Career Guides", type: "guide", icon: Briefcase, readTime: "15 min",
    gradient: "from-indigo-500 to-blue-600", tags: ["Transition", "Planning", "Networking"],
    views: 1543, likes: 78, featured: false, difficulty: "Intermediate",
    lastUpdated: "2026-04-05",
  },
  {
    id: 5, title: "LinkedIn Profile Optimisation Checklist",
    description: "Transform your LinkedIn profile to attract recruiters and expand your professional network.",
    category: "Career Guides", type: "checklist", icon: Users, readTime: "6 min",
    gradient: "from-sky-500 to-blue-600", tags: ["LinkedIn", "Networking", "Profile"],
    views: 3245, likes: 201, featured: true, difficulty: "Beginner",
    lastUpdated: "2026-04-18", downloadUrl: "/templates/linkedin-checklist.pdf",
  },
  {
    id: 6, title: "Top In-Demand Skills for 2026",
    description: "Discover the most valuable skills employers are looking for and how to develop them.",
    category: "Skills Development", type: "report", icon: GraduationCap, readTime: "12 min",
    gradient: "from-pink-500 to-rose-600", tags: ["Skills", "Trends", "Learning"],
    views: 2765, likes: 145, featured: false, difficulty: "Beginner",
    lastUpdated: "2026-01-12", downloadUrl: "/reports/skills-2026.pdf",
  },
  {
    id: 7, title: "Behavioural Interview Question Bank",
    description: "Comprehensive list of 50+ behavioural questions with model answers and STAR method examples.",
    category: "Interview Prep", type: "template", icon: FileText, readTime: "20 min",
    gradient: "from-purple-500 to-indigo-600", tags: ["STAR Method", "Examples", "Preparation"],
    views: 1876, likes: 94, featured: false, difficulty: "Intermediate",
    lastUpdated: "2026-05-08", downloadUrl: "/templates/behavioural-questions.pdf",
  },
  {
    id: 8, title: "Remote Work Success Guide",
    description: "Best practices for thriving in remote roles and building visibility in virtual teams.",
    category: "Career Guides", type: "guide", icon: Users, readTime: "14 min",
    gradient: "from-teal-500 to-emerald-600", tags: ["Remote Work", "Productivity", "Communication"],
    views: 2134, likes: 112, featured: false, difficulty: "Beginner",
    lastUpdated: "2026-05-14",
  },
];

/* ---------- BACKEND MOCK FUNCTION ---------- */
async function fetchResources() {
  await new Promise((resolve) => setTimeout(resolve, 600)); 
  return MOCK_RESOURCES;
}

/* ---------- helpers ---------- */
const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const getDifficultyColor = (d) => {
  switch (d) {
    case "Beginner": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Intermediate": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Advanced": return "bg-rose-50 text-rose-700 border-rose-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

/* ---------- component ---------- */
export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Resources");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("recent"); 
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [viewedResources, setViewedResources] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchResources().then((data) => {
      if (!cancelled) {
        const formattedData = data.map((r) => ({
          ...r,
          icon: r.type === 'guide' ? FileText : r.type === 'course' ? Video : r.type === 'checklist' ? Users : BookOpen
        }));
        setResources(formattedData);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const featuredCount = resources.filter((r) => r.featured).length;
  const progress = featuredCount ? Math.min((viewedResources.length / featuredCount) * 100, 100) : 0;

  const filtered = resources
    .filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All Resources" || r.category === selectedCategory;
      const matchesType = selectedType === "all" || r.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.views - a.views;
      if (sortBy === "trending") return b.likes - a.likes;
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });

  const handleBookmark = (id) => {
    const next = bookmarkedResources.includes(id)
      ? bookmarkedResources.filter((i) => i !== id)
      : [...bookmarkedResources, id];
    setBookmarkedResources(next);
    toast.success(bookmarkedResources.includes(id) ? "Removed from bookmarks" : "Added to bookmarks");
  };

  const handleView = (id) => {
    if (!viewedResources.includes(id)) setViewedResources((p) => [...p, id]);
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, views: r.views + 1 } : r)));
  };

  const handleLike = (id) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r)));
    toast.success("Resource liked!");
  };

  const handleShare = (res) => {
    const url = `${window.location.origin}/resources/${res.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleDownload = (res) => {
    setDownloadingId(res.id);
    setTimeout(() => {
      toast.success(`Downloading “${res.title}”`);
      setDownloadingId(null);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden border-b border-gray-100">
        <div className="container mx-auto relative max-w-7xl">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
                Level Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Career</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Expert guides, templates, and insights to help you land your dream job. Track your progress and master essential skills.
              </p>
              <div>
                <div className="flex items-center justify-between mb-2 text-sm font-medium">
                  <span className="text-gray-900">Your Learning Progress</span>
                  <span className="text-gray-500">{viewedResources.length} of {featuredCount} featured viewed</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            {/* FIXED: Quick Stats Card */}
            <Card className="border-gray-200 shadow-sm bg-white text-gray-900">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Resources Viewed</span>
                  <span className="font-semibold text-gray-900">{viewedResources.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bookmarked</span>
                  <span className="font-semibold text-gray-900">{bookmarkedResources.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Completion Rate</span>
                  <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900" 
                  onClick={() => setViewedResources(resources.map((r) => r.id))}
                >
                  <BookOpenCheck className="w-4 h-4 mr-2" /> Mark All as Viewed
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-4 sm:px-6 border-b border-gray-100 bg-white/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search resources by title, description, or tags…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white text-gray-900 border-gray-200 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[160px] bg-white text-gray-900 border-gray-200">
                <Filter className="w-4 h-4 mr-2 text-gray-500" /> <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="course">Courses</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] bg-white text-gray-900 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-6 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { name: "All Resources", icon: BookOpen },
              { name: "Career Guides", icon: Briefcase },
              { name: "Resume Tips", icon: FileText },
              { name: "Interview Prep", icon: Users },
              { name: "Salary Insights", icon: TrendingUp },
              { name: "Skills Development", icon: GraduationCap },
            ].map((c) => {
              const Icon = c.icon;
              const isActive = selectedCategory === c.name;
              const count = c.name === "All Resources" ? resources.length : resources.filter(r => r.category === c.name).length;
              
              return (
                <button
                  key={c.name}
                  onClick={() => setSelectedCategory(c.name)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                    isActive 
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" 
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-4 h-4" /> 
                  {c.name}
                  <span className={cn(
                    "ml-1 px-2 py-0.5 rounded-full text-xs",
                    isActive ? "bg-emerald-600/50 text-white" : "bg-gray-100 text-gray-600"
                  )}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-8 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 h-80">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6 mb-8"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No resources match your filters.</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === "All Resources" ? "All Resources" : selectedCategory}
                  <span className="text-gray-400 ml-2">({filtered.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((res) => {
                  const Icon = res.icon;
                  const viewed = viewedResources.includes(res.id);
                  const bookmarked = bookmarkedResources.includes(res.id);
                  const downloading = downloadingId === res.id;
                  return (
                    <Card key={res.id} className={cn(
                      "group flex flex-col hover:shadow-lg transition-all duration-300 border-gray-200 bg-white text-gray-900 relative overflow-hidden", 
                      res.featured && "border-emerald-200 shadow-sm",
                      viewed && "opacity-80"
                    )}>
                      {res.featured && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                          <Star className="w-3 h-3 fill-white" /> FEATURED
                        </div>
                      )}
                      
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${res.gradient} flex items-center justify-center shadow-inner`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <Button variant="ghost" size="icon" className="-mt-2 -mr-2 text-gray-400 hover:text-gray-900" onClick={() => handleBookmark(res.id)}>
                            {bookmarked ? <BookmarkCheck className="w-5 h-5 text-emerald-500" /> : <Bookmark className="w-5 h-5" />}
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 capitalize">
                            {res.type}
                          </span>
                          <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", getDifficultyColor(res.difficulty))}>
                            {res.difficulty}
                          </span>
                          <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
                            <Clock className="w-3 h-3" />{res.readTime}
                          </span>
                        </div>

                        <CardTitle className="text-xl leading-tight text-gray-900 group-hover:text-emerald-600 transition-colors cursor-pointer">
                          {res.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-2 text-gray-500">
                          {res.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1 pb-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {res.tags.slice(0, 3).map((t) => (
                            <span key={t} className="px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs text-gray-600">
                              {t}
                            </span>
                          ))}
                        </div>
                        
                        {res.completionPercentage != null && (
                          <div className="mb-2">
                            <div className="flex justify-between text-xs font-medium mb-1">
                              <span className="text-gray-500">Your progress</span>
                              <span className="text-emerald-600">{res.completionPercentage}%</span>
                            </div>
                            <Progress value={res.completionPercentage} className="h-1.5" />
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{res.views.toLocaleString()}</span>
                          <button onClick={() => handleLike(res.id)} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" />{res.likes}
                          </button>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(res.lastUpdated)}</span>
                      </CardFooter>

                      <div className="p-4 pt-0 flex gap-2">
                        <Button
                          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                          onClick={() => {
                            handleView(res.id);
                            if (res.externalUrl) window.open(res.externalUrl, "_blank");
                            else if (res.downloadUrl) handleDownload(res);
                            else toast("Opening guide...");
                          }}
                          disabled={downloading}
                        >
                          {downloading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          {res.externalUrl ? <><ExternalLink className="w-4 h-4 mr-2" />View</> : res.downloadUrl ? <><Download className="w-4 h-4 mr-2" />Download</> : <><BookOpen className="w-4 h-4 mr-2" />Read</>}
                        </Button>
                        <Button variant="outline" size="icon" className="text-gray-500 border-gray-200 hover:text-gray-900" onClick={() => handleShare(res)}>
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="container mx-auto max-w-5xl relative">
          <Card className="text-center p-8 md:p-12 border-0 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
            
            <CardHeader className="relative z-10">
              <div className="mx-auto mb-4 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
                <Star className="w-4 h-4 mr-2" /> Premium Resource
              </div>
              <CardTitle className="text-3xl md:text-4xl mb-4 text-white">Download Our Complete Career Success Kit</CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto text-gray-300">
                Get instant access to all premium resources: resume templates, interview scripts, salary calculators, and a personalised career roadmap.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto my-8">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm"><div className="text-2xl font-bold text-white">12+</div><div className="text-sm text-gray-400">Templates</div></div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm"><div className="text-2xl font-bold text-white">50+</div><div className="text-sm text-gray-400">Examples</div></div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm"><div className="text-2xl font-bold text-white">8</div><div className="text-sm text-gray-400">Videos</div></div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm"><div className="text-2xl font-bold text-white">24/7</div><div className="text-sm text-gray-400">Updates</div></div>
              </div>
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20"
                onClick={() => toast.success("Career Success Kit downloaded!")}
              >
                <Download className="w-5 h-5 mr-2" /> Download Free Kit
              </Button>
              <p className="text-sm text-gray-400 mt-4">Join 10,000+ professionals who accelerated their careers</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}