import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // 🔥 Make sure useNavigate is imported
import { toast } from "sonner";
import { ArrowRight, Download, LayoutTemplate, Lock, Star, FileText, CheckCircle2 } from "lucide-react";

/* =====================================================================
   BACKEND CONTRACT
   ===================================================================== */
const USE_MOCK = true; 
const API_BASE = "";    

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

/* ============================= mock data ============================= */

const MOCK_TEMPLATES = [
  { 
    id: 1, 
    title: "The Modern Tech", 
    description: "A clean single-column layout with clear section headings.", 
    isPremium: false, 
    layout: "single", 
    tags: ["ATS-friendly", "Clean", "Single column"], 
    files: [{ label: "PDF", url: "/templates/modern-tech.pdf" }, { label: "Word", url: "/templates/modern-tech.docx" }] 
  },
  { 
    id: 2, 
    title: "The Executive", 
    description: "Two columns that fit more experience while keeping skills easy to scan.", 
    isPremium: true, 
    layout: "two-column", 
    tags: ["Two column", "Professional", "Leadership"], 
    files: [{ label: "PDF", url: "/templates/executive.pdf" }, { label: "Word", url: "/templates/executive.docx" }] 
  },
  { 
    id: 3, 
    title: "The Creative", 
    description: "A bold header and visual blocks for design and portfolio-led roles.", 
    isPremium: true, 
    layout: "creative", 
    tags: ["Design", "Visual", "Portfolio"], 
    files: [{ label: "PDF", url: "/templates/creative.pdf" }, { label: "Figma", url: "/templates/creative.fig" }] 
  },
  { 
    id: 4, 
    title: "The Minimalist", 
    description: "Plain and simple, with the focus on education, projects and skills.", 
    isPremium: false, 
    layout: "minimal", 
    tags: ["ATS-friendly", "Simple", "Entry-level"], 
    files: [{ label: "PDF", url: "/templates/minimalist.pdf" }, { label: "Word", url: "/templates/minimalist.docx" }] 
  },
];

const api = {
  async list({ signal } = {}) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_TEMPLATES;
    }
    const data = await request("/api/resume-templates", { signal });
    return data.templates;
  },
};

/* ============================= content ============================= */

const LAYOUT_LABEL = { single: "Single column", "two-column": "Two column", creative: "Creative", minimal: "Minimal" };

const GUIDE = [
  { when: "Applying through online job portals", pick: "Single column", why: "A simple structure with standard headings is the safest choice when software reads your resume before a person does." },
  { when: "Going for a senior or leadership role", pick: "Two column", why: "Fits more experience on the page while keeping skills and key details easy to scan." },
  { when: "Design, marketing or other visual roles", pick: "Creative", why: "Shows your style. Keep a plain version too for online application forms." },
  { when: "First job or a short work history", pick: "Minimal", why: "Keeps attention on your education, projects and skills." },
];

const STEPS = [
  { title: "Download and open", text: "Open the Word file in Word, Google Docs or LibreOffice, then fill in your details." },
  { title: "Replace the sample text", text: "Swap in your own details. Keep headings simple and results specific, with numbers where you can." },
  { title: "Export and name it clearly", text: "Save as PDF with a clear name like FirstName-LastName-Resume.pdf before you send it." },
];

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

/* ============================= 🎨 REALISTIC MOCKUPS ============================= */

const ResumePreview = ({ layout }) => {
  if (layout === "single") {
    return (
      <div className="w-full h-full bg-white p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="h-2.5 w-24 bg-gray-800 rounded mb-1" />
            <div className="h-1.5 w-16 bg-gray-400 rounded" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-12 bg-emerald-500 rounded mb-1" />
          <div className="h-1 w-full bg-gray-200 rounded" />
          <div className="h-1 w-full bg-gray-200 rounded" />
          <div className="h-1 w-4/5 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }
  if (layout === "two-column") {
    return (
      <div className="w-full h-full bg-white flex">
        <div className="w-1/3 bg-gray-900 p-3 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-700 mx-auto" />
          <div className="space-y-1.5">
            <div className="h-1 w-full bg-gray-600 rounded" />
            <div className="h-1 w-5/6 bg-gray-600 rounded" />
          </div>
        </div>
        <div className="w-2/3 p-4 space-y-4">
          <div>
            <div className="h-2.5 w-20 bg-gray-800 rounded mb-2" />
            <div className="h-1.5 w-12 bg-gray-400 rounded" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1 w-full bg-gray-200 rounded" />
            <div className="h-1 w-4/5 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }
  if (layout === "creative") {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <div className="h-16 bg-purple-500 w-full relative">
          <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-purple-200" />
          </div>
        </div>
        <div className="p-4 pt-8 space-y-3 flex-1">
          <div>
            <div className="h-2.5 w-28 bg-gray-800 rounded mb-1" />
            <div className="h-1.5 w-16 bg-purple-400 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-4 w-12 bg-purple-50 border border-purple-100 rounded-full" />
            <div className="h-16 w-full bg-purple-50 border border-purple-100 rounded-full mt-2" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full bg-white p-5 border-t-4 border-blue-500 flex flex-col gap-4">
      <div className="text-center pb-2 border-b border-gray-100">
        <div className="h-3 w-32 bg-gray-900 rounded mx-auto mb-2" />
        <div className="h-1.5 w-20 bg-gray-400 rounded mx-auto" />
      </div>
      <div className="space-y-2">
        <div className="h-2 w-14 bg-blue-600 rounded" />
        <div className="h-1 w-full bg-gray-200 rounded" />
        <div className="h-1 w-5/6 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${FOCUS} ${
        active ? "border-emerald-700 bg-emerald-700 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
      }`}
    >
      {children}
    </button>
  );
}

/* ============================= card ============================= */

function TemplateCard({ t, canDownload, proEnabled, upgradeHref, onDownload }) {
  const locked = t.isPremium && !canDownload;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-xl">
      <div className="relative flex h-72 justify-center overflow-hidden border-b border-gray-100 bg-gray-100 p-6">
        <div className="h-full w-48 rounded-t-md bg-white shadow-md motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:scale-105">
          <ResumePreview layout={t.layout} />
        </div>
        {t.isPremium && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900 shadow-sm z-10">
            <Star className="h-3 w-3 fill-amber-700 text-amber-700" aria-hidden /> Pro
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-1 text-lg font-bold text-gray-900">{t.title}</h3>
        <p className="mb-1 text-sm font-medium text-gray-700">{t.files.map((f) => f.label).join(" + ")}</p>
        {t.description && <p className="mb-4 text-sm text-gray-600">{t.description}</p>}

        <ul className="mb-6 flex flex-wrap gap-1.5">
          {t.tags.map((tag) => (
            <li key={tag} className="rounded bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">{tag}</li>
          ))}
        </ul>

        <div className="mt-auto flex gap-2">
          {locked && !proEnabled ? (
            <p className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 py-2.5 text-sm font-semibold text-amber-900">
              <Lock className="h-4 w-4" aria-hidden /> Pro · coming soon
            </p>
          ) : locked ? (
            <Link to={upgradeHref} className={`flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-amber-400 ${FOCUS}`}>
              <Lock className="h-4 w-4" aria-hidden /> Unlock with Pro
            </Link>
          ) : (
            t.files.map((f, i) => (
              <button
                key={f.label}
                onClick={() => onDownload(t, f)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${FOCUS} ${
                  i === 0 ? "bg-gray-900 text-white hover:bg-black" : "border border-gray-300 text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Download className="h-4 w-4" aria-hidden /> {f.label}
              </button>
            ))
          )}
        </div>
      </div>
    </article>
  );
}

/* ============================= page ============================= */

export default function ResumeTemplates({ isPro = false, proEnabled = false, upgradeHref = "/pricing" }) {
  // 🔥 HOOKS MUST BE INSIDE THE COMPONENT FUNCTION
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState("loading");
  const [price, setPrice] = useState("all");
  const [layout, setLayout] = useState("all");

  const load = useCallback(() => {
    const controller = new AbortController();
    setStatus("loading");
    api.list({ signal: controller.signal })
      .then((data) => { setTemplates(data); setStatus("ready"); })
      .catch((err) => { if (err?.name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, []);
  
  useEffect(() => load(), [load]);

  const freeCount = templates.filter((t) => !t.isPremium).length;
  const proCount = templates.length - freeCount;
  const layouts = useMemo(() => [...new Set(templates.map((t) => t.layout))], [templates]);

  const filtered = templates.filter(
    (t) =>
      (price === "all" || (price === "free" ? !t.isPremium : t.isPremium)) &&
      (layout === "all" || t.layout === layout)
  );

  // 🔥 THIS SENDS THEM TO THE BUILDER
  const handleDownload = (t, file) => {
    toast.success(`Loading ${t.title} template...`);
    navigate(`/resume-builder?template=${t.layout}`);
  };

  const clearFilters = () => { setPrice("all"); setLayout("all"); };

  return (
    <main id="main" className="min-h-screen bg-gray-50 py-16 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
            <LayoutTemplate className="h-4 w-4" aria-hidden />
            {status === "ready" ? (proCount > 0 && !proEnabled ? `${freeCount} free · Pro coming soon` : `${freeCount} free · ${proCount} Pro`) : "Resume templates"}
          </p>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Resume templates, <span className="text-emerald-700">ready to fill in.</span>
          </h1>
          <p className="text-lg text-gray-600">
            Skip the formatting fight. Pick a layout, replace the sample text with your own details, and download an editable Word file.
          </p>
        </header>

        {status === "ready" && (
          <div className="mb-8 space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Price">
              <Chip active={price === "all"} onClick={() => setPrice("all")}>All templates</Chip>
              <Chip active={price === "free"} onClick={() => setPrice("free")}>Free</Chip>
              <Chip active={price === "pro"} onClick={() => setPrice("pro")}>Pro</Chip>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Layout">
              <Chip active={layout === "all"} onClick={() => setLayout("all")}>Any layout</Chip>
              {layouts.map((l) => (
                <Chip key={l} active={layout === l} onClick={() => setLayout(l)}>{LAYOUT_LABEL[l] ?? l}</Chip>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "template" : "templates"}
              {(price !== "all" || layout !== "all") && (
                <> · <button type="button" onClick={clearFilters} className={`rounded font-medium text-emerald-800 hover:underline ${FOCUS}`}>Clear filters</button></>
              )}
            </p>
          </div>
        )}

        {status === "loading" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Loading templates">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[28rem] rounded-2xl border border-gray-200 bg-white motion-safe:animate-pulse">
                <div className="h-72 rounded-t-2xl bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center" role="alert">
            <p className="font-medium text-gray-900">We couldn't load the templates.</p>
            <button type="button" onClick={load} className={`mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black ${FOCUS}`}>Try again</button>
          </div>
        )}

        {status === "ready" && (filtered.length > 0 ? (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filtered.map((t) => (
              <li key={t.id}>
                <TemplateCard t={t} canDownload={isPro} proEnabled={proEnabled} upgradeHref={upgradeHref} onDownload={handleDownload} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <p className="font-medium text-gray-900">No templates match those filters.</p>
            <button type="button" onClick={clearFilters} className={`mt-4 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black ${FOCUS}`}>Clear filters</button>
          </div>
        ))}

        <section aria-labelledby="pick-title" className="mx-auto mt-24 max-w-4xl">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-700">Not sure?</p>
          <h2 id="pick-title" className="text-3xl font-extrabold tracking-tight text-gray-900">Which template should you pick?</h2>
          <dl className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
            {GUIDE.map((g) => (
              <div key={g.when} className="grid gap-2 py-5 md:grid-cols-5 md:gap-6">
                <dt className="font-semibold text-gray-900 md:col-span-2">{g.when}</dt>
                <dd className="md:col-span-3">
                  <span className="font-semibold text-emerald-800">{g.pick}.</span>{" "}
                  <span className="text-gray-600">{g.why}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="use-title" className="mx-auto mt-20 max-w-4xl">
          <h2 id="use-title" className="text-3xl font-extrabold tracking-tight text-gray-900">Using a template well</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-gray-900 pt-4">
                <p className="mb-1 text-sm font-bold text-emerald-700">Step {i + 1}</p>
                <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-gray-600">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-gray-700">
            Need help with what to write?{" "}
            <Link to="/resources" className={`inline-flex items-center gap-1 rounded font-semibold text-emerald-800 hover:underline ${FOCUS}`}>
              Read our resume guides <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}