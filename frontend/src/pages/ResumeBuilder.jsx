import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Download, Plus, Briefcase, FileText, Check, Layout, Palette
} from 'lucide-react';
import { downloadAtsPdfFromBuilderData } from '../utils/atsPdfGenerator';

export default function ResumeBuilder() {
  const { user } = useAuth();
  const { addToast } = useNotification();

  // Template & Accent Customization
  const [selectedTemplate, setSelectedTemplate] = useState('modern'); // 'modern' | 'executive' | 'split' | 'minimalist'
  const [accentColor, setAccentColor] = useState('#0f172a'); // default slate-900

  // Contact & Header Details
  const [name, setName] = useState(user?.name || 'Alex Johnson');
  const [targetRole, setTargetRole] = useState(user?.preferred_job_role || 'Senior Software Engineer');
  const [email, setEmail] = useState(user?.email || 'alex.johnson@example.com');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [location, setLocation] = useState('San Francisco, CA');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/alexjohnson');
  const [github, setGithub] = useState('github.com/alexjohnson');
  const [portfolio, setPortfolio] = useState('alexjohnson.dev');

  // Professional Summary
  const [summary, setSummary] = useState(
    'Software Engineer with 4+ years of experience architecting high-throughput REST APIs, leading cross-functional engineering initiatives, and optimizing scalable cloud services using Python, React, Docker, and PostgreSQL.'
  );

  // Technical Skills Categorized
  const [skills, setSkills] = useState({
    languages: ['Python', 'JavaScript (ES6+)', 'TypeScript', 'SQL', 'Go'],
    frameworks: ['React', 'FastAPI', 'Node.js', 'Next.js', 'Tailwind CSS'],
    databases: ['PostgreSQL', 'Redis', 'MongoDB', 'SQLite'],
    tools: ['Docker', 'Kubernetes', 'AWS', 'Git', 'Linux']
  });

  const [newSkillInput, setNewSkillInput] = useState('');
  const [activeSkillCategory, setActiveSkillCategory] = useState('languages');

  // Work Experience
  const [experience, setExperience] = useState([
    {
      role: 'Senior Software Engineer',
      company: 'TechCorp Solutions',
      dates: 'Jan 2023 – Present',
      location: 'San Francisco, CA',
      bullets: [
        'Spearheaded development of high-throughput RESTful API services handling over 2M daily requests with 99.99% uptime.',
        'Engineered automated CI/CD deployment pipelines reducing production deployment time by 45%.',
        'Optimized database queries and indexing, lowering average API latency by 38% across core microservices.'
      ]
    },
    {
      role: 'Software Engineer',
      company: 'InnovateTech Systems',
      dates: 'Jun 2021 – Dec 2022',
      location: 'San Jose, CA',
      bullets: [
        'Architected dynamic frontend components in React & TypeScript, boosting user engagement metrics by 28%.',
        'Integrated secure JWT authentication and role-based access control (RBAC) middleware across enterprise portals.'
      ]
    }
  ]);

  // Projects
  const [projects, setProjects] = useState([
    {
      name: 'AI Resume & Placement Engine',
      tech: 'Python, FastAPI, React, PostgreSQL, Docker',
      link: 'github.com/alexjohnson/ai-resume-analyzer',
      desc: 'Full-stack platform automating candidate resume parsing, job matching, and real-time skill analytics.'
    },
    {
      name: 'Distributed Task Queue',
      tech: 'Go, Redis, gRPC, Docker',
      link: 'github.com/alexjohnson/distributed-task-queue',
      desc: 'High-throughput async job processor processing 10,000+ jobs/sec with graceful worker recovery.'
    }
  ]);

  // Education & Certifications
  const [education, setEducation] = useState([
    {
      degree: 'B.S. in Computer Science',
      school: 'California State University',
      year: '2017 – 2021'
    }
  ]);

  const [certifications, setCertifications] = useState([
    'AWS Certified Solutions Architect – Associate (2023)',
    'Meta Professional Front-End Developer Certificate (2022)'
  ]);

  // State Helpers
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const cat = activeSkillCategory;
    if (!skills[cat].includes(newSkillInput.trim())) {
      setSkills({ ...skills, [cat]: [...skills[cat], newSkillInput.trim()] });
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (category, skillToRemove) => {
    setSkills({
      ...skills,
      [category]: skills[category].filter((s) => s !== skillToRemove)
    });
  };

  const handleAddExp = () => {
    setExperience([
      ...experience,
      {
        role: 'Software Developer',
        company: 'Company Name',
        dates: '2022 – 2023',
        location: 'City, State',
        bullets: ['Implemented key feature modules...', 'Improved system performance by 20%...']
      }
    ]);
  };

  const handleRemoveExp = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        name: 'New Portfolio Project',
        tech: 'React, Node.js, MongoDB',
        link: 'github.com/alexjohnson/project',
        desc: 'Built real-time web application with modern features...'
      }
    ]);
  };

  const handleRemoveProject = (idx) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handleDownloadPDF = () => {
    try {
      downloadAtsPdfFromBuilderData({
        name,
        targetRole,
        email,
        phone,
        location,
        linkedin,
        github,
        portfolio,
        summary,
        skills,
        experience,
        projects,
        education,
        certifications
      }, `${name.replace(/\s+/g, '_')}_ats_resume.pdf`);
      addToast('ATS-compliant PDF exported successfully.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export PDF: ' + err.message, 'error');
    }
  };

  const templates = [
    { id: 'modern', name: 'Modern Tech', desc: 'Silicon Valley clean sans-serif with metadata hierarchy' },
    { id: 'executive', name: 'Executive Serif', desc: 'Formal centered layout with classic serif typography' },
    { id: 'split', name: 'Split Rail (2-Col)', desc: 'Left column skills & bio, right column experience' },
    { id: 'minimalist', name: 'Silicon Valley Mono', desc: 'Monospace engineering format with high data density' },
  ];

  const colorPalettes = [
    { label: 'Obsidian', hex: '#0f172a' },
    { label: 'Emerald', hex: '#065f46' },
    { label: 'Navy', hex: '#1e3a8a' },
    { label: 'Burgundy', hex: '#701a75' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 print:p-0 print:max-w-none">
      
      {/* Header & Template Selector */}
      <div className="space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Layout className="w-3.5 h-3.5" />
              <span>Resume Studio</span>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Professional resume builder</h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Choose from 4 proven ATS-compliant templates, personalize your technical profile, and export clean vector PDF documents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 text-xs font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export vector PDF</span>
            </button>
          </div>
        </div>

        {/* Template Selector Cards */}
        <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layout className="w-3 h-3 text-emerald-400" /> Select layout template:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-mono">Accent color:</span>
              <div className="flex items-center gap-1.5">
                {colorPalettes.map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setAccentColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-4 h-4 rounded-full border transition-transform ${
                      accentColor === c.hex ? 'scale-125 border-white ring-2 ring-emerald-500/30' : 'border-white/20'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {templates.map(tmpl => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`p-3 rounded-lg border text-left transition-colors space-y-1 ${
                  selectedTemplate === tmpl.id
                    ? 'bg-[#232325] border-emerald-500/50 text-white'
                    : 'bg-[#141415] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white">{tmpl.name}</span>
                  {selectedTemplate === tmpl.id && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
                <p className="text-[10.5px] text-slate-500 line-clamp-1">{tmpl.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block items-start">
        
        {/* Editor Form (5 Columns) */}
        <div className="lg:col-span-5 bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-5 print:hidden max-h-[850px] overflow-y-auto pr-3">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider border-b border-white/[0.06] pb-3 flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Document content editor</span>
          </h2>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">1. Contact & header</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-2 text-white text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Target role</label>
                <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-2 text-white text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-2 text-white text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-2 text-white text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-2 text-white text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">LinkedIn</label>
                <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-2 text-white text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">GitHub</label>
                <input type="text" value={github} onChange={(e) => setGithub(e.target.value)} className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-2 text-white text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Portfolio</label>
                <input type="text" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-2 text-white text-xs focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">2. Professional summary</h3>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white leading-relaxed focus:outline-none"
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">3. Technical skills</h3>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <select
                value={activeSkillCategory}
                onChange={(e) => setActiveSkillCategory(e.target.value)}
                className="bg-[#141415] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none font-mono"
              >
                <option value="languages">Languages</option>
                <option value="frameworks">Frameworks</option>
                <option value="databases">Databases</option>
                <option value="tools">DevOps & Tools</option>
              </select>

              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add skill..."
                className="flex-1 bg-[#141415] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
              <button onClick={handleAddSkill} className="px-3 py-1.5 rounded-lg bg-[#232325] hover:bg-[#2c2c30] text-slate-300 border border-white/[0.08] text-xs font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              {Object.entries(skills).map(([cat, list]) => (
                <div key={cat} className="p-2.5 rounded-lg bg-[#141415] border border-white/[0.08]">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">{cat}</span>
                  <div className="flex flex-wrap gap-1">
                    {list.map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded bg-[#232325] border border-white/[0.08] text-[11px] font-mono text-slate-300 flex items-center gap-1">
                        {sk}
                        <button onClick={() => handleRemoveSkill(cat, sk)} className="text-slate-500 hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">4. Work experience</h3>
              <button onClick={handleAddExp} className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                <Plus className="w-3 h-3" /> Add role
              </button>
            </div>

            {experience.map((exp, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">Experience #{idx + 1}</span>
                  <button onClick={() => handleRemoveExp(idx)} className="text-slate-500 hover:text-white text-[11px] font-mono">Remove</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Role title"
                    value={exp.role}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].role = e.target.value;
                      setExperience(updated);
                    }}
                    className="bg-[#19191b] border border-white/[0.08] rounded p-1.5 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].company = e.target.value;
                      setExperience(updated);
                    }}
                    className="bg-[#19191b] border border-white/[0.08] rounded p-1.5 text-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Dates"
                    value={exp.dates}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].dates = e.target.value;
                      setExperience(updated);
                    }}
                    className="bg-[#19191b] border border-white/[0.08] rounded p-1.5 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={exp.location}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].location = e.target.value;
                      setExperience(updated);
                    }}
                    className="bg-[#19191b] border border-white/[0.08] rounded p-1.5 text-slate-400"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">5. Portfolio projects</h3>
              <button onClick={handleAddProject} className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                <Plus className="w-3 h-3" /> Add project
              </button>
            </div>

            {projects.map((proj, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">Project #{idx + 1}</span>
                  <button onClick={() => handleRemoveProject(idx)} className="text-slate-500 hover:text-white text-[11px] font-mono">Remove</button>
                </div>
                <input
                  type="text"
                  placeholder="Project name"
                  value={proj.name}
                  onChange={(e) => {
                    const updated = [...projects];
                    updated[idx].name = e.target.value;
                    setProjects(updated);
                  }}
                  className="w-full bg-[#19191b] border border-white/[0.08] rounded p-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Tech stack"
                  value={proj.tech}
                  onChange={(e) => {
                    const updated = [...projects];
                    updated[idx].tech = e.target.value;
                    setProjects(updated);
                  }}
                  className="w-full bg-[#19191b] border border-white/[0.08] rounded p-1.5 text-slate-300"
                />
                <input
                  type="text"
                  placeholder="GitHub / URL"
                  value={proj.link}
                  onChange={(e) => {
                    const updated = [...projects];
                    updated[idx].link = e.target.value;
                    setProjects(updated);
                  }}
                  className="w-full bg-[#19191b] border border-white/[0.08] rounded p-1.5 text-slate-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live Multi-Template Preview (7 Columns) */}
        <div className="lg:col-span-7 space-y-3 lg:sticky lg:top-20">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-mono text-[11px]">Preview: {templates.find(t => t.id === selectedTemplate)?.name}</span>
            <span className="text-[11px] text-emerald-400 font-mono">100% ATS Vector Compatible</span>
          </div>

          {/* TEMPLATE 1: MODERN TECH MINIMALIST */}
          {selectedTemplate === 'modern' && (
            <div
              id="ats-builder-resume-document"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              className="bg-white text-slate-900 p-8 sm:p-10 rounded-lg resume-paper-shadow min-h-[760px] text-left text-xs space-y-4"
            >
              {/* Header */}
              <div className="border-b-2 pb-4 space-y-1.5" style={{ borderColor: accentColor }}>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h1 className="text-2xl font-bold uppercase tracking-tight" style={{ color: accentColor }}>{name}</h1>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{targetRole}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 pt-1">
                  {email && <span>{email}</span>}
                  {phone && <span>• {phone}</span>}
                  {location && <span>• {location}</span>}
                  {linkedin && <span>• {linkedin}</span>}
                  {github && <span>• {github}</span>}
                  {portfolio && <span>• {portfolio}</span>}
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <div className="space-y-1">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                    Professional Summary
                  </h2>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{summary}</p>
                </div>
              )}

              {/* Technical Skills */}
              <div className="space-y-1.5">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Technical Competencies
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-700">
                  {skills.languages.length > 0 && <div><strong className="text-slate-900">Languages:</strong> {skills.languages.join(', ')}</div>}
                  {skills.frameworks.length > 0 && <div><strong className="text-slate-900">Frameworks:</strong> {skills.frameworks.join(', ')}</div>}
                  {skills.databases.length > 0 && <div><strong className="text-slate-900">Databases:</strong> {skills.databases.join(', ')}</div>}
                  {skills.tools.length > 0 && <div><strong className="text-slate-900">Tools & Cloud:</strong> {skills.tools.join(', ')}</div>}
                </div>
              </div>

              {/* Experience */}
              {experience.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                    Work Experience
                  </h2>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1 text-[11px]">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">{exp.role} <span className="font-normal text-slate-600">at {exp.company}</span></span>
                        <span className="text-[10.5px] text-slate-500 font-mono">{exp.dates} | {exp.location}</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700 leading-relaxed">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                    Key Projects
                  </h2>
                  {projects.map((p, idx) => (
                    <div key={idx} className="space-y-0.5 text-[11px]">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{p.name} <span className="text-[10px] font-normal text-slate-500">({p.tech})</span></span>
                        <span className="text-[10px] font-normal text-slate-600">{p.link}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              <div className="space-y-1">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Education & Certifications
                </h2>
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-slate-800">
                    <span><strong>{edu.degree}</strong> — {edu.school}</span>
                    <span className="text-slate-500 font-mono">{edu.year}</span>
                  </div>
                ))}
                {certifications.map((c, idx) => (
                  <div key={idx} className="text-[10.5px] text-slate-700">• {c}</div>
                ))}
              </div>
            </div>
          )}

          {/* TEMPLATE 2: EXECUTIVE SERIF */}
          {selectedTemplate === 'executive' && (
            <div
              id="ats-builder-resume-document"
              style={{ fontFamily: 'Georgia, Cambria, serif' }}
              className="bg-[#fafafa] text-slate-900 p-8 sm:p-10 rounded-lg resume-paper-shadow min-h-[760px] text-left text-xs space-y-4"
            >
              {/* Centered Formal Header */}
              <div className="text-center border-b pb-4 space-y-1" style={{ borderColor: accentColor }}>
                <h1 className="text-2xl font-normal tracking-wide" style={{ color: accentColor }}>{name}</h1>
                <p className="text-xs uppercase tracking-widest text-slate-600 italic font-sans">{targetRole}</p>
                <div className="flex flex-wrap justify-center items-center gap-x-2 text-[11px] text-slate-600 pt-1 font-sans">
                  {email && <span>{email}</span>}
                  {phone && <span>| {phone}</span>}
                  {location && <span>| {location}</span>}
                  {linkedin && <span>| {linkedin}</span>}
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5" style={{ color: accentColor }}>
                    Executive Summary
                  </h2>
                  <p className="text-[11.5px] text-slate-800 leading-relaxed italic">{summary}</p>
                </div>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <div className="space-y-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5" style={{ color: accentColor }}>
                    Professional Background
                  </h2>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1 text-[11px]">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-950 text-xs">{exp.role} — <em>{exp.company}</em></span>
                        <span className="text-[10.5px] text-slate-600 font-sans">{exp.dates}</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-800 leading-relaxed">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              <div className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5" style={{ color: accentColor }}>
                  Core Competencies
                </h2>
                <div className="text-[11px] text-slate-800 space-y-0.5 font-sans">
                  {skills.languages.length > 0 && <div><strong>Programming & Data:</strong> {skills.languages.join(' • ')}</div>}
                  {skills.frameworks.length > 0 && <div><strong>Frameworks & Cloud:</strong> {skills.frameworks.join(' • ')}</div>}
                  {skills.databases.length > 0 && <div><strong>Systems & Storage:</strong> {skills.databases.join(' • ')}</div>}
                </div>
              </div>

              {/* Projects */}
              {projects.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5" style={{ color: accentColor }}>
                    Selected Initiatives
                  </h2>
                  {projects.map((p, idx) => (
                    <div key={idx} className="space-y-0.5 text-[11px]">
                      <div className="font-bold text-slate-950">{p.name} <span className="font-normal text-slate-600 italic">({p.tech})</span></div>
                      <p className="text-slate-800 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5" style={{ color: accentColor }}>
                  Academic Credentials
                </h2>
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-slate-800 font-sans">
                    <span><strong>{edu.degree}</strong>, {edu.school}</span>
                    <span>{edu.year}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEMPLATE 3: SPLIT RAIL TWO-COLUMN */}
          {selectedTemplate === 'split' && (
            <div
              id="ats-builder-resume-document"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              className="bg-white text-slate-900 rounded-lg resume-paper-shadow min-h-[760px] text-left text-xs grid grid-cols-12 overflow-hidden"
            >
              {/* Left Column Rail (35%) */}
              <div className="col-span-4 bg-slate-100/80 p-6 border-r border-slate-200 space-y-5">
                <div className="space-y-1">
                  <h1 className="text-lg font-bold leading-tight" style={{ color: accentColor }}>{name}</h1>
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{targetRole}</p>
                </div>

                {/* Contact */}
                <div className="space-y-1.5 text-[10.5px] text-slate-700">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-900 block border-b border-slate-300 pb-0.5">Contact</span>
                  {email && <div className="break-all">{email}</div>}
                  {phone && <div>{phone}</div>}
                  {location && <div>{location}</div>}
                  {linkedin && <div className="break-all">{linkedin}</div>}
                  {github && <div className="break-all">{github}</div>}
                </div>

                {/* Skills */}
                <div className="space-y-1.5 text-[10.5px]">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-900 block border-b border-slate-300 pb-0.5">Skills</span>
                  <div className="space-y-1">
                    <div>
                      <span className="font-semibold text-slate-800 block text-[10px]">Languages:</span>
                      <span className="text-slate-600">{skills.languages.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block text-[10px]">Frameworks:</span>
                      <span className="text-slate-600">{skills.frameworks.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block text-[10px]">Databases:</span>
                      <span className="text-slate-600">{skills.databases.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block text-[10px]">Tools:</span>
                      <span className="text-slate-600">{skills.tools.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-1 text-[10.5px]">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-900 block border-b border-slate-300 pb-0.5">Education</span>
                  {education.map((edu, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-slate-600">{edu.school}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{edu.year}</div>
                    </div>
                  ))}
                </div>

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div className="space-y-1 text-[10.5px]">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-900 block border-b border-slate-300 pb-0.5">Certifications</span>
                    {certifications.map((c, idx) => (
                      <div key={idx} className="text-slate-700 leading-snug">• {c}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column Main (65%) */}
              <div className="col-span-8 p-6 space-y-4">
                {/* Summary */}
                {summary && (
                  <div className="space-y-1">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                      About
                    </h2>
                    <p className="text-[11px] text-slate-700 leading-relaxed">{summary}</p>
                  </div>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                  <div className="space-y-2.5">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                      Experience
                    </h2>
                    {experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1 text-[11px]">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900">{exp.role}</span>
                          <span className="text-[10px] font-mono text-slate-500">{exp.dates}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-600 italic">{exp.company} • {exp.location}</div>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700 leading-relaxed">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                      Projects
                    </h2>
                    {projects.map((p, idx) => (
                      <div key={idx} className="space-y-0.5 text-[11px]">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{p.name}</span>
                          <span className="text-[10px] font-normal text-slate-500">{p.link}</span>
                        </div>
                        <div className="text-[10px] text-slate-600"><em>Tech:</em> {p.tech}</div>
                        <p className="text-slate-700 leading-relaxed">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TEMPLATE 4: SILICON VALLEY MONO */}
          {selectedTemplate === 'minimalist' && (
            <div
              id="ats-builder-resume-document"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
              className="bg-white text-slate-900 p-8 sm:p-10 rounded-lg resume-paper-shadow min-h-[760px] text-left text-[11px] space-y-4"
            >
              {/* Terminal-inspired Header */}
              <div className="border-b-2 border-slate-900 pb-3 space-y-1">
                <div className="flex justify-between items-baseline">
                  <h1 className="text-xl font-bold tracking-tight text-slate-950">{name}</h1>
                  <span className="text-[10px] text-slate-600 font-semibold">{targetRole}</span>
                </div>
                <div className="text-[10px] text-slate-600">
                  {email} | {phone} | {location} | {github}
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <div className="space-y-1">
                  <div className="font-bold text-[10px] text-slate-900 uppercase">// 01_SUMMARY</div>
                  <p className="text-[10.5px] text-slate-800 leading-relaxed pl-3 border-l-2 border-slate-300">{summary}</p>
                </div>
              )}

              {/* Skills */}
              <div className="space-y-1">
                <div className="font-bold text-[10px] text-slate-900 uppercase">// 02_TECH_STACK</div>
                <div className="text-[10.5px] text-slate-800 pl-3 border-l-2 border-slate-300 space-y-0.5">
                  <div><span className="text-slate-500">$languages:</span> [{skills.languages.join(', ')}]</div>
                  <div><span className="text-slate-500">$frameworks:</span> [{skills.frameworks.join(', ')}]</div>
                  <div><span className="text-slate-500">$databases:</span> [{skills.databases.join(', ')}]</div>
                  <div><span className="text-slate-500">$devops:</span> [{skills.tools.join(', ')}]</div>
                </div>
              </div>

              {/* Experience */}
              {experience.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-[10px] text-slate-900 uppercase">// 03_WORK_HISTORY</div>
                  <div className="space-y-2 pl-3 border-l-2 border-slate-300">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline font-bold text-slate-950">
                          <span>{exp.role} @ {exp.company}</span>
                          <span className="text-[10px] text-slate-500">{exp.dates}</span>
                        </div>
                        <ul className="space-y-0.5 text-slate-700">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>* {b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[10px] text-slate-900 uppercase">// 04_PROJECTS</div>
                  <div className="space-y-1.5 pl-3 border-l-2 border-slate-300">
                    {projects.map((p, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="font-bold text-slate-950">{p.name} [{p.tech}]</div>
                        <p className="text-slate-700">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              <div className="space-y-1">
                <div className="font-bold text-[10px] text-slate-900 uppercase">// 05_ACADEMICS</div>
                <div className="pl-3 border-l-2 border-slate-300 text-slate-800">
                  {education.map((edu, idx) => (
                    <div key={idx}>{edu.degree} — {edu.school} ({edu.year})</div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
