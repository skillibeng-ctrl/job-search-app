import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, Bookmark, BookmarkCheck, Briefcase, CheckSquare, Clock, Download, ExternalLink, Eye,
  FileText, Filter, GraduationCap, Loader2, RotateCcw, Search, Share2, Star, ThumbsUp, TrendingUp,
  Users, Video,
} from "lucide-react";

/* =====================================================================
   BACKEND CONTRACT (what your API needs to return when you're ready)

   GET    /api/resources                -> { resources: Resource[] }
   PUT    /api/resources/:id/bookmark   (DELETE to remove)
   PUT    /api/resources/:id/like       (DELETE to remove)
   POST   /api/resources/:id/view

   Resource = {
     id, slug?, title, description, category, type, readTime, tags: string[],
     views, likes, featured, difficulty, lastUpdated (ISO date),
     downloadUrl?, externalUrl?, progress? (0-100, per user)
   }
   Icons and colours are chosen here from `type` / `category`, so the
   backend only sends plain JSON.
   ===================================================================== */

/* ============================= api layer ============================= */

const USE_MOCK = true;   // flip to false when your endpoints exist
const API_BASE = "";     // e.g. "https://api.yoursite.com"

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

const api = {
  async list({ signal } = {}) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_RESOURCES;
    }
    const data = await request("/api/resources", { signal });
    return data.resources;
  },
  async setBookmark(id, on) {
    if (!USE_MOCK) await request(`/api/resources/${id}/bookmark`, { method: on ? "PUT" : "DELETE" });
  },
  async setLike(id, on) {
    if (!USE_MOCK) await request(`/api/resources/${id}/like`, { method: on ? "PUT" : "DELETE" });
  },
  async trackView(id) {
    if (!USE_MOCK) await request(`/api/resources/${id}/view`, { method: "POST" });
  },
};

/* ============================= mock data ============================= */

// SAMPLE DATA ONLY. Delete once USE_MOCK is false.
const MOCK_RESOURCES = [
  { id: 1, title: "Complete Guide to Writing a Winning Resume", description: "Learn how to craft a resume that gets you noticed by recruiters and hiring managers in 2026 with ATS optimization tips.", category: "Resume Tips", type: "guide", readTime: "10 min", tags: ["ATS", "Formatting", "Keywords"], views: 1243, likes: 89, featured: true, difficulty: "Beginner", lastUpdated: "2026-02-15", downloadUrl: "/templates/resume-template.pdf", progress: 75 },
  { id: 2, title: "Mastering the Technical Interview", description: "Comprehensive guide covering algorithms, system design, and behavioural questions for tech interviews.", category: "Interview Prep", type: "course", readTime: "2 hours", tags: ["Algorithms", "System Design", "Behavioural"], views: 2876, likes: 156, featured: true, difficulty: "Advanced", lastUpdated: "2026-03-20", externalUrl: "https://example.com/masterclass", progress: 30 },
  { id: 3, title: "2026 Salary Negotiation Tactics", description: "Expert strategies to negotiate better compensation packages and understand your market value.", category: "Salary Insights", type: "guide", readTime: "8 min", tags: ["Negotiation", "Compensation", "Market Research"], views: 1987, likes: 102, featured: false, difficulty: "Intermediate", lastUpdated: "2026-04-10" },
  { id: 4, title: "Career Change Roadmap", description: "Step-by-step guide for successfully transitioning to a new career path with confidence.", category: "Career Guides", type: "guide", readTime: "15 min", tags: ["Transition", "Planning", "Networking"], views: 1543, likes: 78, featured: false, difficulty: "Intermediate", lastUpdated: "2026-04-05" },
  { id: 5, title: "LinkedIn Profile Optimisation Checklist", description: "Transform your LinkedIn profile to attract recruiters and expand your professional network.", category: "Career Guides", type: "checklist", readTime: "6 min", tags: ["LinkedIn", "Networking", "Profile"], views: 3245, likes: 201, featured: true, difficulty: "Beginner", lastUpdated: "2026-04-18", downloadUrl: "/templates/linkedin-checklist.pdf" },
  { id: 6, title: "Top In-Demand Skills for 2026", description: "Discover the most valuable skills employers are looking for and how to develop them.", category: "Skills Development", type: "report", readTime: "12 min", tags: ["Skills", "Trends", "Learning"], views: 2765, likes: 145, featured: false, difficulty: "Beginner", lastUpdated: "2026-01-12", downloadUrl: "/reports/skills-2026.pdf" },
  { id: 7, title: "Behavioural Interview Question Bank", description: "Comprehensive list of 50+ behavioural questions with model answers and STAR method examples.", category: "Interview Prep", type: "template", readTime: "20 min", tags: ["STAR Method", "Examples", "Preparation"], views: 1876, likes: 94, featured: false, difficulty: "Intermediate", lastUpdated: "2026-05-08", downloadUrl: "/templates/behavioural-questions.pdf" },
  { id: 8, title: "Remote Work Success Guide", description: "Best practices for thriving in remote roles and building visibility in virtual teams.", category: "Career Guides", type: "guide", readTime: "14 min", tags: ["Remote Work", "Productivity", "Communication"], views: 2134, likes: 112, featured: false, difficulty: "Beginner", lastUpdated: "2026-05-14" },
];

/* ============================= presentation maps ============================= */

const TYPE_ICON = { guide: FileText, course: Video, video: Video, checklist: CheckSquare, report: TrendingUp, template: FileText };
const TYPE_LABEL = { guide: "Guide", course: "Course", video: "Video", checklist: "Checklist", report: "Report", template: "Template" };

const CATEGORY_STYLE = {
  "Resume Tips": { icon: FileText, gradient: "from-emerald-600 to-teal-700" },
  "Interview Prep": { icon: Users, gradient: "from-indigo-600 to-blue-700" },
  "Salary Insights": { icon: TrendingUp, gradient: "from-amber-600 to-orange-700" },
  "Career Guides": { icon: Briefcase, gradient: "from-sky-600 to-blue-700" },
  "Skills Development": { icon: GraduationCap, gradient: "from-pink-600 to-rose-700" },
};
const DEFAULT_STYLE = { icon: BookOpen, gradient: "from-gray-600 to-gray-800" };

const DIFFICULTY_STYLE = {
  Beginner: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-900 border-amber-200",
  Advanced: "bg-rose-50 text-rose-800 border-rose-200",
};

// Old links such as /resources?tab=resume-templates still land somewhere sensible.
const TAB_ALIASES = { "resume-templates": "Resume Tips" };

const ALL = "All Resources";
const PAGE_SIZE = 9;
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

/* ============================= helpers & hooks ============================= */

const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const compact = (n) => new Intl.NumberFormat("en", { notation: "compact" }).format(n);

function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

// A list kept in localStorage. Swap for server state once users can sign in.
function useStoredList(key) {
  const [list, setList] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  });
  const update = useCallback(
    (updater) => {
      setList((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage blocked */ }
        return next;
      });
    },
    [key]
  );
  return [list, update];
}

/* ============================= card ============================= */

function ResourceCard({ res, viewed, bookmarked, liked, onOpen, onBookmark, onLike, onShare }) {
  const style = CATEGORY_STYLE[res.category] ?? DEFAULT_STYLE;
  const Icon = TYPE_ICON[res.type] ?? style.icon;
  const detailHref = `/resources/${res.slug ?? res.id}`;
  const likeCount = res.likes + (liked ? 1 : 0); // replace with the server's count + likedByMe when ready

  const ctaClass = cn(buttonVariants(), "flex-1 bg-gray-900 text-white hover:bg-gray-800", FOCUS);

  return (
    <Card className={cn("group relative flex h-full flex-col overflow-hidden border-gray-200 bg-white text-gray-900 transition-shadow hover:shadow-lg", res.featured && "border-emerald-200")}>
      {res.featured && (
        <div className="absolute right-0 top-0 z-10 flex items-center gap-1 rounded-bl-lg bg-emerald-700 px-3 py-1 text-xs font-bold text-white">
          <Star className="h-3 w-3 fill-white" aria-hidden /> Featured
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="mb-4 flex items-start justify-between">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner", style.gradient)}>
            <Icon className="h-6 w-6 text-white" aria-hidden />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn("-mr-2 -mt-2 text-gray-600 hover:text-gray-900", res.featured && "mt-5")}
            onClick={() => onBookmark(res)}
            aria-pressed={bookmarked}
            aria-label={`${bookmarked ? "Remove bookmark for" : "Bookmark"} ${res.title}`}
          >
            {bookmarked ? <BookmarkCheck className="h-5 w-5 text-emerald-700" aria-hidden /> : <Bookmark className="h-5 w-5" aria-hidden />}
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">{TYPE_LABEL[res.type] ?? res.type}</span>
          <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", DIFFICULTY_STYLE[res.difficulty] ?? "bg-gray-50 text-gray-700 border-gray-200")}>{res.difficulty}</span>
          <span className="ml-auto flex items-center gap-1 text-xs text-gray-600"><Clock className="h-3 w-3" aria-hidden />{res.readTime}</span>
        </div>

        <CardTitle className="text-xl leading-tight">
          <Link to={detailHref} onClick={() => onOpen(res)} className={cn("rounded transition-colors hover:text-emerald-700", FOCUS)}>
            {res.title}
          </Link>
        </CardTitle>
        <CardDescription className="mt-2 line-clamp-2 text-gray-600">{res.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <ul className="mb-4 flex flex-wrap gap-2">
          {res.tags.slice(0, 3).map((t) => (
            <li key={t} className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-xs text-gray-700">{t}</li>
          ))}
        </ul>
        {res.progress != null && (
          <div>
            <div className="mb-1 flex justify-between text-xs font-medium">
              <span className="text-gray-600">Your progress</span>
              <span className="text-emerald-800">{res.progress}%</span>
            </div>
            <Progress value={res.progress} className="h-1.5" aria-label={`Your progress on ${res.title}`} />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-medium text-gray-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Eye className="h-4 w-4" aria-hidden /><span className="sr-only">Views: </span>{compact(res.views)}</span>
          <button
            type="button"
            onClick={() => onLike(res)}
            aria-pressed={liked}
            aria-label={`${liked ? "Unlike" : "Like"} ${res.title}, ${likeCount} likes`}
            className={cn("flex items-center gap-1 rounded transition-colors hover:text-emerald-700", liked && "text-emerald-800", FOCUS)}
          >
            <ThumbsUp className={cn("h-4 w-4", liked && "fill-emerald-100")} aria-hidden />{likeCount}
          </button>
        </div>
        <span>{formatDate(res.lastUpdated)}</span>
      </CardFooter>

      <div className="flex gap-2 p-4 pt-0">
        {res.externalUrl ? (
          <a href={res.externalUrl} target="_blank" rel="noopener noreferrer" onClick={() => onOpen(res)} className={ctaClass}>
            <ExternalLink className="mr-2 h-4 w-4" aria-hidden />View<span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : res.downloadUrl ? (
          <a href={res.downloadUrl} download onClick={() => onOpen(res)} className={ctaClass}>
            <Download className="mr-2 h-4 w-4" aria-hidden />Download
          </a>
        ) : (
          <Link to={detailHref} onClick={() => onOpen(res)} className={ctaClass}>
            <BookOpen className="mr-2 h-4 w-4" aria-hidden />Read
          </Link>
        )}
        <Button variant="outline" size="icon" className="border-gray-200 text-gray-600 hover:text-gray-900" onClick={() => onShare(res)} aria-label={`Share ${res.title}`}>
          <Share2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </Card>
  );
}

/* ============================= page ============================= */

export default function Resources() {
  const [params, setParams] = useSearchParams();

  // filters live in the URL, so they can be shared and the back button works
  const category = params.get("category") ?? TAB_ALIASES[params.get("tab")] ?? ALL;
  const type = params.get("type") ?? "all";
  const sort = params.get("sort") ?? "recent";

  const [query, setQuery] = useState(params.get("q") ?? "");
  const debouncedQuery = useDebounced(query);

  const [resources, setResources] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [visible, setVisible] = useState(PAGE_SIZE);

  const [bookmarked, setBookmarked] = useStoredList("jobflow:resources:bookmarked");
  const [liked, setLiked] = useStoredList("jobflow:resources:liked");
  const [viewed, setViewed] = useStoredList("jobflow:resources:viewed");

  const setParam = useCallback(
    (key, value, def) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!value || value === def) next.delete(key);
          else next.set(key, value);
          if (key === "category") next.delete("tab");
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  useEffect(() => { setParam("q", debouncedQuery.trim(), ""); }, [debouncedQuery, setParam]);

  /* ---- load ---- */
  const load = useCallback(() => {
    const controller = new AbortController();
    setStatus("loading");
    api.list({ signal: controller.signal })
      .then((data) => { setResources(data); setStatus("ready"); })
      .catch((err) => { if (err?.name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, []);
  useEffect(() => load(), [load]);

  /* ---- derived data ---- */
  const categories = useMemo(() => [ALL, ...new Set(resources.map((r) => r.category))], [resources]);
  const types = useMemo(() => [...new Set(resources.map((r) => r.type))], [resources]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return resources
      .filter((r) => {
        const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q));
        return matchesSearch && (category === ALL || r.category === category) && (type === "all" || r.type === type);
      })
      .sort((a, b) => {
        if (sort === "popular") return b.views - a.views;
        if (sort === "liked") return b.likes - a.likes;
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      });
  }, [resources, debouncedQuery, category, type, sort]);

  useEffect(() => { setVisible(PAGE_SIZE); }, [debouncedQuery, category, type, sort]);

  // progress counts only featured resources the reader actually opened
  const featuredIds = useMemo(() => new Set(resources.filter((r) => r.featured).map((r) => r.id)), [resources]);
  const featuredViewed = viewed.filter((id) => featuredIds.has(id)).length;
  const progress = featuredIds.size ? Math.round((featuredViewed / featuredIds.size) * 100) : 0;

  const filtersActive = Boolean(query || category !== ALL || type !== "all" || sort !== "recent");
  const clearFilters = () => { setQuery(""); setParams({}, { replace: true }); };

  /* ---- actions (optimistic, with rollback) ---- */
  const openResource = (res) => {
    setViewed((prev) => (prev.includes(res.id) ? prev : [...prev, res.id]));
    api.trackView(res.id).catch(() => {});
  };

  const toggleBookmark = async (res) => {
    const on = !bookmarked.includes(res.id);
    setBookmarked((prev) => (on ? [...prev, res.id] : prev.filter((i) => i !== res.id)));
    try {
      await api.setBookmark(res.id, on);
      toast.success(on ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      setBookmarked((prev) => (on ? prev.filter((i) => i !== res.id) : [...prev, res.id]));
      toast.error("Couldn't update your bookmark. Please try again.");
    }
  };

  const toggleLike = async (res) => {
    const on = !liked.includes(res.id);
    setLiked((prev) => (on ? [...prev, res.id] : prev.filter((i) => i !== res.id)));
    try {
      await api.setLike(res.id, on);
    } catch {
      setLiked((prev) => (on ? prev.filter((i) => i !== res.id) : [...prev, res.id]));
      toast.error("Couldn't update your like. Please try again.");
    }
  };

  const shareResource = async (res) => {
    const url = `${window.location.origin}/resources/${res.slug ?? res.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: res.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      if (err?.name !== "AbortError") toast.error("Couldn't share this link.");
    }
  };

  const shown = filtered.slice(0, visible);

  return (
    <main id="main" className="min-h-screen bg-white font-sans text-gray-900">
      {/* ============ hero ============ */}
      <section className="border-b border-gray-100 px-4 pb-16 pt-20 sm:px-6">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-700">Resources</p>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              Level up your <span className="text-emerald-700">career</span>
            </h1>
            <p className="text-lg text-gray-600">
              Guides, templates and insights to help you land the right role. Read at your own pace and pick up where you left off.
            </p>
          </div>

          <Card className="border-gray-200 bg-white text-gray-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Your progress</CardTitle>
              <CardDescription className="text-gray-600">{featuredViewed} of {featuredIds.size} featured resources opened</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="h-2" aria-label="Featured resources opened" />
              <dl className="grid grid-cols-3 gap-2 text-center">
                <div><dt className="text-xs text-gray-600">Opened</dt><dd className="text-xl font-bold">{viewed.length}</dd></div>
                <div><dt className="text-xs text-gray-600">Bookmarked</dt><dd className="text-xl font-bold">{bookmarked.length}</dd></div>
                <div><dt className="text-xs text-gray-600">Featured done</dt><dd className="text-xl font-bold">{progress}%</dd></div>
              </dl>
            </CardContent>
            {viewed.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setViewed([])}>
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden /> Reset progress
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </section>

      {/* ============ filters (sits under the 4rem navbar) ============ */}
      <section aria-label="Search and filter" className="sticky top-16 z-20 border-b border-gray-100 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-2xl flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" aria-hidden />
            <label htmlFor="resource-search" className="sr-only">Search resources</label>
            <Input
              id="resource-search"
              type="search"
              placeholder="Search by title, description or tag"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-gray-200 bg-white pl-10 text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={type} onValueChange={(v) => setParam("type", v, "all")}>
              <SelectTrigger aria-label="Filter by type" className="w-[160px] border-gray-200 bg-white text-gray-900">
                <Filter className="mr-2 h-4 w-4 text-gray-600" aria-hidden /><SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {types.map((t) => <SelectItem key={t} value={t}>{TYPE_LABEL[t] ?? t}s</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setParam("sort", v, "recent")}>
              <SelectTrigger aria-label="Sort resources" className="w-[160px] border-gray-200 bg-white text-gray-900"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="popular">Most viewed</SelectItem>
                <SelectItem value="liked">Most liked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ============ categories ============ */}
      <section aria-label="Categories" className="px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2">
          {categories.map((name) => {
            const Icon = (CATEGORY_STYLE[name] ?? DEFAULT_STYLE).icon;
            const active = category === name;
            const count = name === ALL ? resources.length : resources.filter((r) => r.category === name).length;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setParam("category", name, ALL)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors", FOCUS,
                  active ? "border-emerald-700 bg-emerald-700 text-white shadow-sm" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {name}
                <span className={cn("ml-1 rounded-full px-2 py-0.5 text-xs", active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700")}>{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============ results ============ */}
      <section className="px-4 pb-16 pt-2 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {status === "loading" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading resources">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl border border-gray-100 bg-white p-5 motion-safe:animate-pulse">
                  <div className="mb-4 h-12 w-12 rounded-xl bg-gray-200" />
                  <div className="mb-3 h-6 w-3/4 rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-full rounded bg-gray-100" />
                  <div className="h-4 w-5/6 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center" role="alert">
              <p className="font-medium text-gray-900">We couldn't load the resources.</p>
              <p className="mt-1 text-sm text-gray-600">Check your connection and try again.</p>
              <Button className="mt-5 bg-gray-900 text-white hover:bg-gray-800" onClick={load}>Try again</Button>
            </div>
          )}

          {status === "ready" && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {category}
                  <span className="ml-2 text-gray-600" aria-live="polite">({filtered.length})</span>
                </h2>
                {filtersActive && (
                  <button type="button" onClick={clearFilters} className={cn("rounded text-sm font-medium text-emerald-800 hover:underline", FOCUS)}>Clear filters</button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center">
                  <p className="font-medium text-gray-900">No resources match your filters.</p>
                  <p className="mt-1 text-sm text-gray-600">Try a different search or remove a filter.</p>
                  <Button className="mt-5 bg-gray-900 text-white hover:bg-gray-800" onClick={clearFilters}>Clear filters</Button>
                </div>
              ) : (
                <>
                  <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {shown.map((res) => (
                      <li key={res.id}>
                        <ResourceCard
                          res={res}
                          viewed={viewed.includes(res.id)}
                          bookmarked={bookmarked.includes(res.id)}
                          liked={liked.includes(res.id)}
                          onOpen={openResource}
                          onBookmark={toggleBookmark}
                          onLike={toggleLike}
                          onShare={shareResource}
                        />
                      </li>
                    ))}
                  </ul>
                  {visible < filtered.length && (
                    <div className="mt-10 text-center">
                      <Button variant="outline" className="border-gray-300 px-8" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                        Show more ({filtered.length - visible} left)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* quiet next steps instead of a big banner */}
      <p className="px-4 pb-16 text-center text-sm text-gray-600">
        Ready for the next step?{" "}
        <Link to="/jobs" className={cn("rounded font-semibold text-emerald-800 hover:underline", FOCUS)}>Browse jobs</Link>
        {" · "}
        <Link to="/salaries" className={cn("rounded font-semibold text-emerald-800 hover:underline", FOCUS)}>See salary ranges</Link>
      </p>
    </main>
  );
}