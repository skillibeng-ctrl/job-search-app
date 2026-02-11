/* Resources.jsx  –  plain JSX, zero TypeScript */
import { useState, useEffect } from "react";
import NavBar from "../component/NavBar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "../body/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "lucide-react";
import { Button } from "../components/ui/button"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  BookOpen, FileText, Video, Download, TrendingUp, Users, Briefcase, GraduationCap,
  Search, Filter, Clock, Star, Bookmark, BookmarkCheck, Share2, ExternalLink,
  ThumbsUp, Eye, BookOpenCheck, Loader2, Sun, Moon
} from "lucide-react";
import App from "./Career";

/* ---------- static data ---------- */
const categories = [
  { name: "All Resources", count: 48, icon: BookOpen },
  { name: "Career Guides", count: 12, icon: Briefcase },
  { name: "Resume Tips", count: 8, icon: FileText },
  { name: "Interview Prep", count: 15, icon: Users },
  { name: "Salary Insights", count: 7, icon: TrendingUp },
  { name: "Skills Development", count: 6, icon: GraduationCap },
];

const resourceTypes = [
  { value: "all", label: "All Types" },
  { value: "guide", label: "Guides" },
  { value: "video", label: "Videos" },
  { value: "course", label: "Courses" },
  { value: "template", label: "Templates" },
  { value: "checklist", label: "Checklists" },
];

const initialResources = [
  {
    id: 1, title: "Complete Guide to Writing a Winning Resume",
    description: "Learn how to craft a resume that gets you noticed by recruiters and hiring managers in 2024 with ATS optimization tips.",
    category: "Resume Tips", type: "guide", icon: FileText, readTime: "10 min",
    gradient: "from-purple-500 to-pink-500", tags: ["ATS", "Formatting", "Keywords", "Achievements"],
    views: 1243, likes: 89, bookmarked: true, featured: true, difficulty: "Beginner",
    lastUpdated: "2024-01-15", downloadUrl: "/templates/resume-template.pdf", completionPercentage: 75,
  },
  {
    id: 2, title: "Mastering the Technical Interview",
    description: "Comprehensive guide covering algorithms, system design, and behavioural questions for tech interviews.",
    category: "Interview Prep", type: "course", icon: Video, readTime: "2 hours",
    gradient: "from-blue-500 to-cyan-500", tags: ["Algorithms", "System Design", "Behavioural", "Coding"],
    views: 2876, likes: 156, bookmarked: false, featured: true, difficulty: "Advanced",
    lastUpdated: "2024-01-20", externalUrl: "https://platform.tech-interviews.com/masterclass", completionPercentage: 30,
  },
  {
    id: 3, title: "2024 Salary Negotiation Tactics",
    description: "Expert strategies to negotiate better compensation packages and understand your market value.",
    category: "Salary Insights", type: "guide", icon: TrendingUp, readTime: "8 min",
    gradient: "from-green-500 to-emerald-500", tags: ["Negotiation", "Compensation", "Benefits", "Market Research"],
    views: 1987, likes: 102, bookmarked: true, featured: false, difficulty: "Intermediate",
    lastUpdated: "2024-01-10",
  },
  {
    id: 4, title: "Career Change Roadmap",
    description: "Step-by-step guide for successfully transitioning to a new career path with confidence.",
    category: "Career Guides", type: "guide", icon: Briefcase, readTime: "15 min",
    gradient: "from-orange-500 to-red-500", tags: ["Transition", "Planning", "Skills", "Networking"],
    views: 1543, likes: 78, bookmarked: false, featured: false, difficulty: "Intermediate",
    lastUpdated: "2024-01-05",
  },
  {
    id: 5, title: "LinkedIn Profile Optimisation",
    description: "Transform your LinkedIn profile to attract recruiters and expand your professional network.",
    category: "Career Guides", type: "checklist", icon: Users, readTime: "6 min",
    gradient: "from-indigo-500 to-purple-500", tags: ["LinkedIn", "Networking", "Profile", "Recruiters"],
    views: 3245, likes: 201, bookmarked: false, featured: true, difficulty: "Beginner",
    lastUpdated: "2024-01-18", downloadUrl: "/templates/linkedin-checklist.pdf",
  },
  {
    id: 6, title: "Top In-Demand Skills for 2024",
    description: "Discover the most valuable skills employers are looking for and how to develop them.",
    category: "Skills Development", type: "report", icon: GraduationCap, readTime: "12 min",
    gradient: "from-pink-500 to-rose-500", tags: ["Skills", "Trends", "Development", "Learning"],
    views: 2765, likes: 145, bookmarked: true, featured: false, difficulty: "Beginner",
    lastUpdated: "2024-01-12", downloadUrl: "/reports/skills-2024.pdf",
  },
  {
    id: 7, title: "Behavioural Interview Question Bank",
    description: "Comprehensive list of 50+ behavioural questions with model answers and STAR method examples.",
    category: "Interview Prep", type: "template", icon: FileText, readTime: "20 min",
    gradient: "from-amber-500 to-yellow-500", tags: ["Behavioural", "STAR Method", "Examples", "Preparation"],
    views: 1876, likes: 94, bookmarked: false, featured: false, difficulty: "Intermediate",
    lastUpdated: "2024-01-08", downloadUrl: "/templates/behavioural-questions.pdf",
  },
  {
    id: 8, title: "Remote Work Success Guide",
    description: "Best practices for thriving in remote roles and building visibility in virtual teams.",
    category: "Career Guides", type: "guide", icon: Users, readTime: "14 min",
    gradient: "from-teal-500 to-blue-500", tags: ["Remote Work", "Productivity", "Communication", "Work-Life Balance"],
    views: 2134, likes: 112, bookmarked: false, featured: false, difficulty: "Beginner",
    lastUpdated: "2024-01-14",
  },
];

/* ---------- helpers ---------- */
const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const getDifficultyColor = (d) => {
  switch (d) {
    case "Beginner": return "bg-green-100 text-green-800 border-green-200";
    case "Intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Advanced": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

/* ---------- component ---------- */
export default function Resources() {
  /* ---- state ---- */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Resources");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("recent"); // recent | popular | trending
  const [resources, setResources] = useState(initialResources);
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [viewedResources, setViewedResources] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null); // per-card loader
  const [progress, setProgress] = useState(0);
  const [dark, setDark] = useState(false);

  /* ---- dark-mode ---- */
  useEffect(() => {
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefers);
    if (prefers) document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    dark
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
  }, [dark]);

  /* ---- progress bar ---- */
  useEffect(() => {
    const featuredCount = resources.filter((r) => r.featured).length;
    const percentage = featuredCount ? (viewedResources.length / featuredCount) * 100 : 0;
    setProgress(Math.min(percentage, 100));
  }, [viewedResources, resources]);

  /* ---- filter / sort ---- */
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
      return new Date(b.lastUpdated) - new Date(a.lastUpdated); // recent
    });

  /* ---- handlers ---- */
  const handleBookmark = (id) => {
    const next = bookmarkedResources.includes(id)
      ? bookmarkedResources.filter((i) => i !== id)
      : [...bookmarkedResources, id];
    setBookmarkedResources(next);
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, bookmarked: !r.bookmarked } : r))
    );
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

  /* ---- render ---- */
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <NavBar /> */}

      {/* hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-background pointer-events-none" />
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)}>
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            <div>
              {/* <Badge className="m-6 gradient-primary text-white border-0 px-4 py-1.5">
                Career Resources
              </Badge> */}
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                Level Up Your Career
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Expert guides, templates, and insights to help you land your dream job. Track your progress and master essential skills.
              </p>
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span>Your Learning Progress</span>
                  <span className="text-muted-foreground">{viewedResources.length} of {resources.filter((r) => r.featured).length} featured viewed</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Resources Viewed</span><span className="font-semibold">{viewedResources.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bookmarked</span><span className="font-semibold">{bookmarkedResources.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Completion Rate</span><span className="font-semibold">{Math.round(progress)}%</span></div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setViewedResources(resources.map((r) => r.id))}>
                  <BookOpenCheck className="w-4 h-4 mr-2" /> Mark All as Viewed
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* filters */}
      <section className="py-6 px-4 sm:px-6 border-y border-border/50 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search resources by title, description, or tags…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" /> <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resourceTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* category pills */}
      <section className="py-6 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Button
                  key={c.name}
                  variant={selectedCategory === c.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(c.name)}
                >
                  <Icon className="w-4 h-4 mr-2" /> {c.name}
                  <Badge variant="secondary" className="ml-2">{c.count}</Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* grid */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center text-muted-foreground">No resources match your filters.</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">
                  {selectedCategory === "All Resources" ? "All Resources" : selectedCategory}
                  <span className="text-muted-foreground ml-2">({filtered.length})</span>
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" /> Sorted by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((res) => {
                  const Icon = res.icon;
                  const viewed = viewedResources.includes(res.id);
                  const bookmarked = res.bookmarked;
                  const downloading = downloadingId === res.id;
                  return (
                    <Card key={res.id} className={cn("group hover:shadow-lg transition-shadow", res.featured && "border-2 border-primary/20", viewed && "opacity-90")}>
                      {res.featured && (
                        <Badge className="absolute -top-2 -right-2 gradient-primary text-white px-3 py-1">
                          <Star className="w-3 h-3 mr-1 fill-white" /> Featured
                        </Badge>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${res.gradient} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleBookmark(res.id)}>
                            {bookmarked ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <Badge variant="secondary" className="capitalize">{res.type}</Badge>
                          <Badge variant="outline" className={getDifficultyColor(res.difficulty)}>{res.difficulty}</Badge>
                          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1"><Clock className="w-3 h-3" />{res.readTime}</span>
                        </div>
                        <CardTitle className="text-xl line-clamp-2">{res.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{res.description}</CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {res.tags.slice(0, 3).map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                          {res.tags.length > 3 && <Badge variant="outline" className="text-xs">+{res.tags.length - 3}</Badge>}
                        </div>
                        {res.completionPercentage != null && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Your progress</span><span>{res.completionPercentage}%</span></div>
                            <Progress value={res.completionPercentage} className="h-2" />
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{res.views.toLocaleString()}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleLike(res.id)}><ThumbsUp className="w-4 h-4 mr-1" />{res.likes}</Button>
                          </div>
                          <span className="text-xs">Updated {formatDate(res.lastUpdated)}</span>
                        </div>
                      </CardContent>

                      <CardFooter className="gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => {
                            handleView(res.id);
                            if (res.externalUrl) window.open(res.externalUrl, "_blank");
                            else if (res.downloadUrl) handleDownload(res);
                          }}
                          disabled={downloading}
                        >
                          {downloading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          {res.externalUrl ? <><ExternalLink className="w-4 h-4 mr-2" />View Course</> : res.downloadUrl ? <><Download className="w-4 h-4 mr-2" />Download</> : <><BookOpen className="w-4 h-4 mr-2" />Read Guide</>}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleShare(res)}><Share2 className="w-4 h-4" /></Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-600/10 to-primary/10" />
        <div className="container mx-auto relative">
          <Card className="max-w-4xl mx-auto text-center p-8 md:p-12 border-border/50 shadow-xl">
            <CardHeader>
              <Badge className="mx-auto mb-4 gradient-primary text-white">Premium Resource</Badge>
              <CardTitle className="text-3xl md:text-4xl mb-4">Download Our Complete Career Success Kit</CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">Get instant access to all premium resources: resume templates, interview scripts, salary calculators, and a personalised career roadmap.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-primary/5 rounded-lg"><div className="text-2xl font-bold text-primary">12+</div><div className="text-sm text-muted-foreground">Templates</div></div>
                <div className="p-4 bg-primary/5 rounded-lg"><div className="text-2xl font-bold text-primary">50+</div><div className="text-sm text-muted-foreground">Examples</div></div>
                <div className="p-4 bg-primary/5 rounded-lg"><div className="text-2xl font-bold text-primary">8</div><div className="text-sm text-muted-foreground">Video Guides</div></div>
                <div className="p-4 bg-primary/5 rounded-lg"><div className="text-2xl font-bold text-primary">24/7</div><div className="text-sm text-muted-foreground">Updates</div></div>
              </div>
              <Button
                size="lg"
                className="gradient-primary px-8"
                onClick={() => {
                  toast.success("Career Success Kit downloaded!");
                }}
              >
                <Download className="w-5 h-5 mr-2" /> Download Free Kit
              </Button>
              <p className="text-sm text-muted-foreground">Join 10,000+ professionals who accelerated their careers</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}