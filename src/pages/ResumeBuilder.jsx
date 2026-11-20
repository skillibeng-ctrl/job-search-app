import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Download, Save, Plus, Trash2, ArrowLeft, Mail, Phone, MapPin, 
  Linkedin, Globe, Briefcase, GraduationCap, Code 
} from "lucide-react";

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  // The Resume State
  const [resume, setResume] = useState({
    name: "Alex Johnson",
    title: "Senior Frontend Engineer",
    email: "alex@example.com",
    phone: "+234 800 000 0000",
    location: "Lagos, Nigeria",
    website: "alexj.dev",
    linkedin: "linkedin.com/in/alexj",
    summary: "Passionate software engineer with 5+ years of experience building scalable web applications. Expert in React, TypeScript, and modern UI/UX design.",
    experience: [
      { id: 1, role: "Senior Frontend Engineer", company: "Vantage", dates: "Jan 2022 - Present", desc: "Led a team of 4 to rebuild the core dashboard, improving load times by 40%.\nImplemented design system used across 3 products." }
    ],
    education: [
      { id: 1, degree: "BSc Computer Science", school: "University of Lagos", dates: "2015 - 2019", desc: "First Class Honours" }
    ],
    skills: "React, TypeScript, Next.js, Tailwind CSS, Node.js, GraphQL, Figma"
  });

  // Load from localStorage on mount (Simulating DB)
  useEffect(() => {
    const saved = localStorage.getItem("jobflow_resume");
    if (saved) {
      try { setResume(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleChange = (e) => setResume({ ...resume, [e.target.name]: e.target.value });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("jobflow_resume", JSON.stringify(resume));
      setSaving(false);
      toast.success("Resume saved to your profile!");
    }, 600);
  };

  // --- Experience Handlers ---
  const addExp = () => setResume({ ...resume, experience: [...resume.experience, { id: Date.now(), role: "", company: "", dates: "", desc: "" }] });
  const updateExp = (id, field, val) => setResume({ ...resume, experience: resume.experience.map(e => e.id === id ? { ...e, [field]: val } : e) });
  const removeExp = (id) => setResume({ ...resume, experience: resume.experience.filter(e => e.id !== id) });

  // --- Education Handlers ---
  const addEdu = () => setResume({ ...resume, education: [...resume.education, { id: Date.now(), degree: "", school: "", dates: "", desc: "" }] });
  const updateEdu = (id, field, val) => setResume({ ...resume, education: resume.education.map(e => e.id === id ? { ...e, [field]: val } : e) });
  const removeEdu = (id) => setResume({ ...resume, education: resume.education.filter(e => e.id !== id) });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-gray-100 pt-16">
      
      {/* ================= LEFT: EDITOR ================= */}
      <div className="w-1/2 h-full overflow-y-auto bg-white border-r border-gray-200 p-8 print:hidden custom-scrollbar">
        <div className="max-w-xl mx-auto space-y-8 pb-20">
          
          {/* Header Actions */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
              <p className="text-sm text-gray-500">Create a stunning, ATS-friendly resume.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition">
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </div>
          </div>

          {/* Personal Details */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Briefcase className="h-5 w-5 text-emerald-600" /> Personal Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <input name="name" value={resume.name} onChange={handleChange} placeholder="Full Name" className="col-span-2 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              <input name="title" value={resume.title} onChange={handleChange} placeholder="Target Job Title" className="col-span-2 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              <input name="email" value={resume.email} onChange={handleChange} placeholder="Email" className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              <input name="phone" value={resume.phone} onChange={handleChange} placeholder="Phone" className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              <input name="location" value={resume.location} onChange={handleChange} placeholder="Location (e.g. Lagos, NG)" className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              <input name="website" value={resume.website} onChange={handleChange} placeholder="Portfolio Website" className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              <input name="linkedin" value={resume.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="col-span-2 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </section>

          {/* Summary */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Professional Summary</h2>
            <textarea name="summary" value={resume.summary} onChange={handleChange} rows={4} placeholder="A brief 2-3 sentence summary of your expertise..." className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
          </section>

          {/* Experience */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Briefcase className="h-5 w-5 text-emerald-600" /> Experience</h2>
              <button onClick={addExp} className="text-emerald-600 text-sm font-semibold flex items-center gap-1 hover:underline"><Plus className="h-4 w-4" /> Add Role</button>
            </div>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50 relative group">
                <button onClick={() => removeExp(exp.id)} className="absolute top-4 right-4 text-gray-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input value={exp.role} onChange={(e) => updateExp(exp.id, 'role', e.target.value)} placeholder="Job Title" className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium" />
                  <input value={exp.company} onChange={(e) => updateExp(exp.id, 'company', e.target.value)} placeholder="Company" className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium" />
                  <input value={exp.dates} onChange={(e) => updateExp(exp.id, 'dates', e.target.value)} placeholder="Dates (e.g. Jan 2020 - Present)" className="col-span-2 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                </div>
                <textarea value={exp.desc} onChange={(e) => updateExp(exp.id, 'desc', e.target.value)} placeholder="Describe your achievements (one per line)..." rows={3} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
              </div>
            ))}
          </section>

          {/* Education */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-emerald-600" /> Education</h2>
              <button onClick={addEdu} className="text-emerald-600 text-sm font-semibold flex items-center gap-1 hover:underline"><Plus className="h-4 w-4" /> Add Degree</button>
            </div>
            {resume.education.map((edu) => (
              <div key={edu.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50 relative group">
                <button onClick={() => removeEdu(edu.id)} className="absolute top-4 right-4 text-gray-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input value={edu.degree} onChange={(e) => updateEdu(edu.id, 'degree', e.target.value)} placeholder="Degree (e.g. BSc Computer Science)" className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium" />
                  <input value={edu.school} onChange={(e) => updateEdu(edu.id, 'school', e.target.value)} placeholder="School / University" className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium" />
                  <input value={edu.dates} onChange={(e) => updateEdu(edu.id, 'dates', e.target.value)} placeholder="Dates (e.g. 2015 - 2019)" className="col-span-2 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                </div>
                <input value={edu.desc} onChange={(e) => updateEdu(edu.id, 'desc', e.target.value)} placeholder="Grade / Achievements" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
              </div>
            ))}
          </section>

          {/* Skills */}
          <section className="space-y-4 pb-10">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Code className="h-5 w-5 text-emerald-600" /> Skills</h2>
            <input name="skills" value={resume.skills} onChange={handleChange} placeholder="React, TypeScript, Node.js..." className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            <p className="text-xs text-gray-500">Separate skills with commas.</p>
          </section>

        </div>
      </div>

      {/* ================= RIGHT: LIVE PREVIEW ================= */}
      {/* THE print-container class is crucial for printing only this area */}
      <div className="w-1/2 h-full overflow-y-auto bg-gray-200 p-8 flex justify-center custom-scrollbar print:w-full print:h-auto print:p-0 print:bg-white print:overflow-visible">
        
        {/* A4 Paper Mockup */}
        <div className="print-container bg-white w-[210mm] min-h-[297mm] shadow-2xl p-12 text-gray-900 flex flex-col">
          
          {/* Header */}
          <div className="border-b-2 border-emerald-600 pb-6 mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{resume.name}</h1>
            <p className="text-xl text-emerald-700 font-semibold mt-1">{resume.title}</p>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-gray-600 font-medium">
              {resume.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {resume.email}</span>}
              {resume.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {resume.phone}</span>}
              {resume.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {resume.location}</span>}
              {resume.website && <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {resume.website}</span>}
              {resume.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-3.5 w-3.5" /> {resume.linkedin}</span>}
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-6 flex-1">
            
            {/* Summary */}
            {resume.summary && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-2">Professional Summary</h2>
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{resume.summary}</p>
              </section>
            )}

            {/* Experience */}
            {resume.experience.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-3">Experience</h2>
                <div className="space-y-4">
                  {resume.experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-gray-900 text-base">{exp.role}</h3>
                        <span className="text-sm font-medium text-gray-500">{exp.dates}</span>
                      </div>
                      <p className="text-sm font-semibold text-emerald-600 mb-1.5">{exp.company}</p>
                      <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                        {exp.desc.split('\n').filter(Boolean).map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-3">Education</h2>
                <div className="space-y-3">
                  {resume.education.map(edu => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-gray-900 text-base">{edu.degree}</h3>
                        <span className="text-sm font-medium text-gray-500">{edu.dates}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{edu.school}</p>
                      {edu.desc && <p className="text-sm text-gray-600 mt-1">{edu.desc}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {resume.skills && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.split(',').map(skill => skill.trim()).filter(Boolean).map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-md border border-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}