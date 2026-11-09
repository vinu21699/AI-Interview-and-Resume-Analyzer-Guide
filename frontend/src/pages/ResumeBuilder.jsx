import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Download, Plus, Briefcase, FileText, Check
} from 'lucide-react';
import { downloadAtsPdfFromBuilderData } from '../utils/atsPdfGenerator';

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
    'Software Engineer with 4+ years of experience architecting high-throughput REST APIs, leading cross-functional engineering initiatives, and optimizing scalable cloud services using Python, React, Docker, and PostgreSQL.'
  );

  // Technical Skills Categorized
  const [skills, setSkills] = useState({
    languages: ['Python', 'JavaScript (ES6+)', 'TypeScript', 'SQL'],
    frameworks: ['React', 'FastAPI', 'Node.js', 'Tailwind CSS'],
    databases: ['PostgreSQL', 'Redis', 'MongoDB'],
    tools: ['Docker', 'Kubernetes', 'AWS', 'Git']
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
      desc: 'Full-stack platform automating candidate resume parsing, job matching, and real-time skill analytics.'
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
      addToast('ATS PDF exported.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export PDF: ' + err.message, 'error');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 print:p-0 print:max-w-none">
      {/* Page Header */}
      <div className="space-y-1.5 print:hidden">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <FileText className="w-3.5 h-3.5" />
          <span>ATS Document Generator</span>
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Structured resume builder</h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Author an ATS-compliant resume with structured metadata fields and real-time linear document preview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block">
        {/* Editor Form */}
        <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-5 print:hidden max-h-[850px] overflow-y-auto pr-3">
          <h2 className="text-xs font-medium text-white uppercase tracking-wider border-b border-white/[0.06] pb-3 flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Document content</span>
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

        {/* Live Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
            <h2 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standard A4 preview</span>
            </h2>

            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          <div
            id="ats-builder-resume-document"
            style={{ fontFamily: 'Arial, Calibri, Helvetica, sans-serif' }}
            className="bg-white text-slate-950 p-8 sm:p-10 rounded-lg min-h-[720px] border border-slate-300 text-left"
          >
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-3">
              <h1 className="text-xl font-bold uppercase text-slate-950 tracking-tight">{name}</h1>
              <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider mt-0.5">{targetRole}</p>

              <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-700 mt-1.5">
                {email && <span>Email: {email}</span>}
                {phone && <span>| Phone: {phone}</span>}
                {location && <span>| Location: {location}</span>}
                {linkedin && <span>| LinkedIn: {linkedin}</span>}
                {github && <span>| GitHub: {github}</span>}
                {portfolio && <span>| Portfolio: {portfolio}</span>}
              </div>
            </div>

            {/* Summary */}
            {summary && (
              <div className="mb-3">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-900 pb-0.5 mb-1.5">
                  Professional summary
                </h2>
                <p className="text-[11px] text-slate-800 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Technical Skills */}
            <div className="mb-3">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-900 pb-0.5 mb-1.5">
                Technical skills
              </h2>
              <div className="space-y-0.5 text-[11px] text-slate-800">
                {skills.languages.length > 0 && <div><strong>Languages:</strong> {skills.languages.join(', ')}</div>}
                {skills.frameworks.length > 0 && <div><strong>Frameworks:</strong> {skills.frameworks.join(', ')}</div>}
                {skills.databases.length > 0 && <div><strong>Databases:</strong> {skills.databases.join(', ')}</div>}
                {skills.tools.length > 0 && <div><strong>Tools:</strong> {skills.tools.join(', ')}</div>}
              </div>
            </div>

            {/* Experience */}
            {experience.length > 0 && (
              <div className="mb-3">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-900 pb-0.5 mb-1.5">
                  Professional experience
                </h2>
                {experience.map((exp, idx) => (
                  <div key={idx} className="mb-2 text-[11px]">
                    <div className="flex justify-between items-baseline font-semibold text-slate-950">
                      <span>{exp.role} | {exp.company}</span>
                      <span className="text-slate-700 text-[10.5px] font-normal">{exp.dates} | {exp.location}</span>
                    </div>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-800 leading-relaxed">
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
              <div className="mb-3">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-900 pb-0.5 mb-1.5">
                  Projects
                </h2>
                {projects.map((p, idx) => (
                  <div key={idx} className="mb-1.5 text-[11px]">
                    <div className="flex justify-between items-baseline font-semibold text-slate-950">
                      <span>{p.name}</span>
                      <span className="text-slate-700 text-[10px] font-normal">{p.link}</span>
                    </div>
                    <div className="text-slate-700 text-[10.5px]"><em>Stack:</em> {p.tech}</div>
                    <p className="text-slate-800 mt-0.5">{p.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Education & Certifications */}
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-900 pb-0.5 mb-1.5">
                Education & certifications
              </h2>
              {education.map((edu, idx) => (
                <div key={idx} className="text-[11px] flex justify-between text-slate-900 mb-0.5">
                  <span><strong>{edu.degree}</strong> — {edu.school}</span>
                  <span className="text-slate-700">{edu.year}</span>
                </div>
              ))}
              {certifications.map((c, idx) => (
                <div key={idx} className="text-[10.5px] text-slate-800">• {c}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
