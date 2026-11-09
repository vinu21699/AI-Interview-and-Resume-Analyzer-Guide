import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Building2, Briefcase, Calendar,
  Code2, Database, HelpCircle, Layers,
  Clock, FileText, CheckCircle2
} from 'lucide-react';

export default function CompanyPrep() {
  const [popularCompanies, setPopularCompanies] = useState([]);
  const [popularRoles, setPopularRoles] = useState([]);
  const [targetCompany, setTargetCompany] = useState('TCS');
  const [customCompany, setCustomCompany] = useState('');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [timelineDays, setTimelineDays] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [prepPlan, setPrepPlan] = useState(null);

  const { addToast } = useNotification();

  useEffect(() => {
    api.get('/company/popular')
      .then(res => {
        setPopularCompanies(res.data.popular_companies || []);
        setPopularRoles(res.data.popular_roles || []);
      })
      .catch(() => {});
  }, []);

  const handleGeneratePlan = async () => {
    const finalCompany = targetCompany === 'Other' ? customCompany.trim() : targetCompany;
    if (!finalCompany) {
      addToast('Please specify a target company.', 'warning');
      return;
    }

    setGenerating(true);
    setPrepPlan(null);
    try {
      const res = await api.post('/company/generate', {
        target_company: finalCompany,
        target_role: targetRole,
        timeline_days: timelineDays
      });
      setPrepPlan(res.data);
      addToast(`Personalized ${finalCompany} preparation plan generated.`, 'success');
    } catch (err) {
      addToast('Failed to generate target company preparation plan.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Header Context Bar */}
      <div className="border-b border-white/[0.08] pb-5 space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#85858b]">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Company alignment</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[#ededed]">
          Target company preparation
        </h1>
        <p className="text-xs text-[#a1a1a6] max-w-xl leading-relaxed">
          Configure your target company, role, and timeline to receive personalized interview questions, priority DSA & SQL topics, and a structured milestone schedule.
        </p>
      </div>

      {/* Configuration Form Card */}
      <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xs text-[#85858b] font-mono flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Target company
            </label>
            <select
              value={targetCompany}
              onChange={e => setTargetCompany(e.target.value)}
              className="w-full bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-2.5 text-xs text-[#ededed] focus:outline-none"
            >
              {popularCompanies.map((c, idx) => (
                <option key={idx} value={c.name}>{c.name} ({c.category})</option>
              ))}
              <option value="Other">Other / Custom</option>
            </select>

            {targetCompany === 'Other' && (
              <input
                type="text"
                placeholder="Enter company name..."
                value={customCompany}
                onChange={e => setCustomCompany(e.target.value)}
                className="w-full mt-2 bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-2.5 text-xs text-[#ededed] focus:outline-none"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#85858b] font-mono flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Target role
            </label>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-2.5 text-xs text-[#ededed] focus:outline-none"
            >
              {popularRoles.map((r, idx) => (
                <option key={idx} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#85858b] font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Timeline
            </label>
            <select
              value={timelineDays}
              onChange={e => setTimelineDays(Number(e.target.value))}
              className="w-full bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-2.5 text-xs text-[#ededed] focus:outline-none"
            >
              <option value={7}>7 days (Sprint)</option>
              <option value={15}>15 days (Accelerated)</option>
              <option value={30}>30 days (Standard)</option>
              <option value={60}>60 days (Comprehensive)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="btn-primary text-xs"
          >
            {generating ? 'Synthesizing...' : 'Generate preparation plan'}
          </button>
        </div>
      </div>

      {/* Generated Blueprint View */}
      {prepPlan && (
        <div className="space-y-6">
          
          <div className="p-5 rounded-xl bg-[#19191b] border border-white/[0.08] space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#ededed] font-medium">{prepPlan.company} preparation</span>
                <span className="text-[#85858b]">• {prepPlan.role}</span>
              </div>
              <span className="text-[#85858b]">
                {prepPlan.timeline_days} days horizon
              </span>
            </div>

            <h3 className="text-sm font-medium text-[#ededed]">
              Hiring profile: <span className="text-blue-400">{prepPlan.company_archetype}</span>
            </h3>
            
            <p className="text-[11px] text-[#85858b] font-mono">
              {prepPlan.ai_disclaimer}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            <div className="bg-[#19191b] border border-white/[0.08] p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Priority DSA topics
              </h4>
              <ul className="space-y-1.5 text-xs text-[#a1a1a6]">
                {prepPlan.focus_dsa?.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#19191b] border border-white/[0.08] p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-mono text-blue-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Core SQL & database
              </h4>
              <ul className="space-y-1.5 text-xs text-[#a1a1a6]">
                {prepPlan.focus_sql?.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-400">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#19191b] border border-white/[0.08] p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-mono text-purple-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Engineering concepts
              </h4>
              <ul className="space-y-1.5 text-xs text-[#a1a1a6]">
                {prepPlan.technical_topics?.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-purple-400">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#19191b] border border-white/[0.08] p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-medium text-[#ededed] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> High-yield interview questions for {prepPlan.company}
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              {prepPlan.interview_questions?.map((q, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#232325] border border-white/[0.08] text-[#a1a1a6] flex items-start gap-2.5">
                  <span className="text-amber-400 font-bold shrink-0">Q{idx + 1}</span>
                  <p className="leading-relaxed font-sans">{q}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#19191b] border border-white/[0.08] p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-mono text-purple-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Project viva prompts
              </h4>
              <ul className="space-y-1.5 text-[#a1a1a6]">
                {prepPlan.project_viva_prompts?.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-purple-400">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#19191b] border border-white/[0.08] p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resume tailoring tips
              </h4>
              <ul className="space-y-1.5 text-[#a1a1a6]">
                {prepPlan.resume_tailoring_tips?.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#19191b] border border-white/[0.08] p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-medium text-[#ededed] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Weekly milestones schedule
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {prepPlan.weekly_schedule?.map((w, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1">
                  <span className="text-[10px] font-mono text-blue-400">Week {w.week_number}</span>
                  <h5 className="text-xs font-medium text-[#ededed]">{w.focus_theme}</h5>
                  <p className="text-[11px] text-[#85858b] leading-relaxed">{w.milestone_goal}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
