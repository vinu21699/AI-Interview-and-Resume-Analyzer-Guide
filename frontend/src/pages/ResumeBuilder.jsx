import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  FileText, Download, Sparkles, Plus, Trash2, Layout, Check, Copy,
  Globe, Linkedin, Github, Phone, Mail, MapPin, Briefcase, GraduationCap, Code2, Award, Wand2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResumeBuilder() {
  const { user } = useAuth();
  const { addToast } = useNotification();

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
    'Results-driven Software Engineer with 4+ years of experience architecting high-throughput REST APIs, leading cross-functional engineering initiatives, and optimizing scalable cloud services using Python, React, Docker, and PostgreSQL.'
  );

  // Technical Skills Categorized
  const [skills, setSkills] = useState({
    languages: ['Python', 'JavaScript (ES6+)', 'TypeScript', 'SQL', 'HTML5/CSS3'],
    frameworks: ['React.js', 'FastAPI', 'Node.js', 'Express', 'Tailwind CSS'],
    databases: ['PostgreSQL', 'Redis', 'MongoDB', 'SQLite'],
    tools: ['Docker', 'Kubernetes', 'AWS (S3, EC2)', 'Git', 'GitHub Actions']
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
      name: 'AI Resume & ATS Optimization Engine',
      tech: 'Python, FastAPI, React, PostgreSQL, Docker',
      link: 'github.com/alexjohnson/ai-resume-analyzer',
      desc: 'Developed full-stack SaaS platform automating candidate resume parsing, job matching, and real-time skill analytics.'
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

  // Direct System PDF Export via html2pdf.js
  const handleDownloadPDF = () => {
    const el = document.getElementById('ats-builder-resume-document');
    if (!el) {
      addToast('Resume document ready for download', 'error');
      return;
    }

    if (window.html2pdf) {
      addToast(`Downloading ${name.replace(/\s+/g, '_')}_ATS_Resume.pdf directly to your system...`, 'info');
      const opt = {
        margin:       [10, 12, 10, 12],
        filename:     `${name.replace(/\s+/g, '_')}_ATS_Resume.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(el).save();
    } else {
      window.print();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 print:p-0 print:max-w-none">
      {/* Page Header (Hidden during PDF print) */}
      <div className="space-y-2 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
          <Sparkles className="w-3.5 h-3.5" /> 100% ATS-Friendly Resume Builder
        </div>
        <h1 className="text-3xl font-extrabold text-white">Create 100% ATS Resume From Scratch</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Build a fully parsed ATS resume with complete fields for GitHub, LinkedIn, Portfolio, Contact Number, Projects, and Experience with live A4 preview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
        {/* Editor Form (Hidden during PDF print) */}
        <div className="glass-card p-6 border border-slate-800 space-y-6 print:hidden max-h-[850px] overflow-y-auto pr-3">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" /> Resume Information & Content
          </h2>

          {/* Contact Information Inputs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">1. Contact & Header Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Professional Role</label>
                <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Contact Phone Number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Location (City, State/Country)</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-blue-400 mb-1">LinkedIn Profile URL</label>
                <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-purple-400 mb-1">GitHub Profile URL</label>
                <input type="text" value={github} onChange={(e) => setGithub(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-emerald-400 mb-1">Portfolio / Website URL</label>
                <input type="text" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">2. Professional Summary</h3>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed"
            />
          </div>

          {/* Technical Skills Categorized */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">3. Technical Skills Matrix</h3>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <select
                value={activeSkillCategory}
                onChange={(e) => setActiveSkillCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-300 text-xs"
              >
                <option value="languages">Languages</option>
                <option value="frameworks">Frameworks & Libraries</option>
                <option value="databases">Databases & Cloud</option>
                <option value="tools">DevOps & Tools</option>
              </select>

              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add skill (e.g. PyTorch)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
              />
              <button onClick={handleAddSkill} className="gradient-btn px-3 py-2 rounded-xl text-xs font-bold">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {Object.entries(skills).map(([cat, list]) => (
                <div key={cat} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{cat}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-[11px] text-blue-300 flex items-center gap-1">
                        {sk}
                        <button onClick={() => handleRemoveSkill(cat, sk)} className="text-slate-500 hover:text-rose-400">×</button>
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
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">4. Professional Work Experience</h3>
              <button onClick={handleAddExp} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {experience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Experience #{idx + 1}</span>
                  <button onClick={() => handleRemoveExp(idx)} className="text-rose-400 hover:text-rose-300 text-xs">Remove</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.role}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].role = e.target.value;
                      setExperience(updated);
                    }}
                    className="bg-slate-900 border border-slate-800 rounded p-1.5 text-white font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].company = e.target.value;
                      setExperience(updated);
                    }}
                    className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Dates (e.g. 2022 - Present)"
                    value={exp.dates}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].dates = e.target.value;
                      setExperience(updated);
                    }}
                    className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400"
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
                    className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Portfolio Projects */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">5. Key Portfolio Projects</h3>
              <button onClick={handleAddProject} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {projects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Project #{idx + 1}</span>
                  <button onClick={() => handleRemoveProject(idx)} className="text-rose-400 hover:text-rose-300 text-xs">Remove</button>
                </div>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={proj.name}
                  onChange={(e) => {
                    const updated = [...projects];
                    updated[idx].name = e.target.value;
                    setProjects(updated);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white font-bold"
                />
                <input
                  type="text"
                  placeholder="Tech Stack Used"
                  value={proj.tech}
                  onChange={(e) => {
                    const updated = [...projects];
                    updated[idx].tech = e.target.value;
                    setProjects(updated);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300"
                />
                <input
                  type="text"
                  placeholder="GitHub / Live URL"
                  value={proj.link}
                  onChange={(e) => {
                    const updated = [...projects];
                    updated[idx].link = e.target.value;
                    setProjects(updated);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live 100% ATS Resume Preview & Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> 100% ATS Format Preview
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>

          {/* Standard A4 100% ATS Document Card */}
          <div
            id="ats-builder-resume-document"
            style={{ fontFamily: 'Arial, Calibri, Helvetica, sans-serif' }}
            className="bg-white text-slate-950 p-10 rounded-2xl shadow-2xl min-h-[750px] border border-slate-300 text-left"
          >
            {/* ATS Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
              <h1 className="text-2xl font-black uppercase text-slate-950 tracking-tight">{name}</h1>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-0.5">{targetRole}</p>

              {/* Complete Contact Details Bar */}
              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[11px] text-slate-700 mt-2 font-medium">
                {email && <span>Email: {email}</span>}
                {phone && <span>| Phone: {phone}</span>}
                {location && <span>| Location: {location}</span>}
                {linkedin && <span>| LinkedIn: {linkedin}</span>}
                {github && <span>| GitHub: {github}</span>}
                {portfolio && <span>| Portfolio: {portfolio}</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-900 pb-1 mb-2">
                  Professional Summary
                </h2>
                <p className="text-[11.5px] text-slate-800 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Technical Skills */}
            <div className="mb-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-900 pb-1 mb-2">
                Technical Skills
              </h2>
              <div className="space-y-1 text-[11.5px] text-slate-800">
                {skills.languages.length > 0 && <div><strong>Programming Languages:</strong> {skills.languages.join(', ')}</div>}
                {skills.frameworks.length > 0 && <div><strong>Frameworks & Libraries:</strong> {skills.frameworks.join(', ')}</div>}
                {skills.databases.length > 0 && <div><strong>Databases & Cloud:</strong> {skills.databases.join(', ')}</div>}
                {skills.tools.length > 0 && <div><strong>DevOps & Tools:</strong> {skills.tools.join(', ')}</div>}
              </div>
            </div>

            {/* Professional Experience */}
            {experience.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-900 pb-1 mb-2">
                  Professional Experience
                </h2>
                {experience.map((exp, idx) => (
                  <div key={idx} className="mb-3 text-[11.5px]">
                    <div className="flex justify-between items-baseline font-bold text-slate-950">
                      <span>{exp.role} | {exp.company}</span>
                      <span className="text-slate-700 text-[11px] font-normal">{exp.dates} | {exp.location}</span>
                    </div>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-800 leading-relaxed">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Portfolio Projects */}
            {projects.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-900 pb-1 mb-2">
                  Key Portfolio Projects
                </h2>
                {projects.map((p, idx) => (
                  <div key={idx} className="mb-2 text-[11.5px]">
                    <div className="flex justify-between items-baseline font-bold text-slate-950">
                      <span>{p.name}</span>
                      <span className="text-slate-700 text-[10.5px] font-normal">{p.link}</span>
                    </div>
                    <div className="text-slate-700 text-[11px]"><em>Tech Stack:</em> {p.tech}</div>
                    <p className="text-slate-800 mt-0.5">{p.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Education & Certifications */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-900 pb-1 mb-2">
                Education & Certifications
              </h2>
              {education.map((edu, idx) => (
                <div key={idx} className="text-[11.5px] flex justify-between text-slate-900 mb-1">
                  <span><strong>{edu.degree}</strong> — {edu.school}</span>
                  <span className="text-slate-700">{edu.year}</span>
                </div>
              ))}
              {certifications.map((c, idx) => (
                <div key={idx} className="text-[11px] text-slate-800">• {c}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

