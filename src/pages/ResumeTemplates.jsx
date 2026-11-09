import { Download, FileText, CheckCircle2, Star, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = [
  {
    id: 1,
    title: "The Modern Tech",
    format: "PDF + Word",
    isPremium: false,
    color: "bg-emerald-500",
    tags: ["ATS-Friendly", "Clean", "Single Column"],
  },
  {
    id: 2,
    title: "The Executive",
    format: "PDF + Word",
    isPremium: true,
    color: "bg-gray-900",
    tags: ["Two Column", "Professional", "Leadership"],
  },
  {
    id: 3,
    title: "The Creative",
    format: "PDF + Figma",
    isPremium: true,
    color: "bg-purple-500",
    tags: ["Design", "Visual", "Portfolio"],
  },
  {
    id: 4,
    title: "The Minimalist",
    format: "PDF + Word",
    isPremium: false,
    color: "bg-blue-500",
    tags: ["ATS-Friendly", "Simple", "Entry-Level"],
  }
];

export default function ResumeTemplates() {
  const handleDownload = (title) => {
    toast.success(`Downloading ${title} template...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 mb-6">
            <LayoutTemplate className="h-4 w-4" />
            Free Downloadable Resources
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            Resume Templates that <span className="text-emerald-600">get you hired.</span>
          </h1>
          <p className="text-lg text-gray-600">
            Stop fighting with formatting in Microsoft Word. Download our ATS-optimized, professionally designed templates and just fill in your details.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map((template) => (
            <div key={template.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
              
              {/* Mockup Preview Area */}
              <div className="relative h-64 bg-gray-100 p-6 flex justify-center overflow-hidden border-b border-gray-100">
                {/* Abstract Resume Shape */}
                <div className="w-40 bg-white shadow-md h-full rounded-t-md p-3 transform group-hover:-translate-y-2 transition-transform duration-300">
                  <div className={`w-8 h-8 rounded-full ${template.color} mb-3`}></div>
                  <div className="h-2 w-3/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 w-1/2 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-gray-100 rounded"></div>
                    <div className="h-1.5 w-full bg-gray-100 rounded"></div>
                    <div className="h-1.5 w-5/6 bg-gray-100 rounded"></div>
                    <div className="h-1.5 w-full bg-gray-100 rounded"></div>
                  </div>
                </div>
                {template.isPremium && (
                  <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                    <Star className="h-3 w-3 fill-amber-700" /> PRO
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{template.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{template.format}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {template.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto">
                  <button 
                    onClick={() => handleDownload(template.title)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why use our templates */}
        <div className="mt-20 bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">ATS-Optimized</h3>
              <p className="text-sm text-gray-600">Our layouts are tested against Applicant Tracking Systems to ensure your resume gets read by humans.</p>
            </div>
            <div>
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Easy to Edit</h3>
              <p className="text-sm text-gray-600">Download in PDF for applying, or Word/Figma to customize the design to match your personal brand.</p>
            </div>
            <div>
              <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Recruiter Approved</h3>
              <p className="text-sm text-gray-600">Designed in collaboration with tech recruiters to highlight the exact things hiring managers look for.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}