import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Building2, Briefcase, Calendar, Sparkles, CheckCircle2,
  BookOpen, Code2, Database, HelpCircle, Layers, ArrowRight,
  Clock, ShieldAlert, Award, FileText, Check
} from 'lucide-react';
import { motion } from 'framer-motion';

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
      addToast(`Personalized ${finalCompany} preparation plan generated!`, 'success');
    } catch (err) {
      addToast('Failed to generate target company preparation plan.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/20 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400">
            <Building2 className="w-3.5 h-3.5" /> Target Company Preparation
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Target Company <span className="text-blue-400">Readiness Blueprint</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Configure your target company, role, and timeline to receive personalized interview questions, priority DSA & SQL topics, project viva prompts, and a day-by-day practice roadmap.
          </p>
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Company Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-blue-400" /> Target Company
            </label>
            <select
              value={targetCompany}
              onChange={e => setTargetCompany(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white"
            >
              {popularCompanies.map((c, idx) => (
                <option key={idx} value={c.name}>{c.name} ({c.category})</option>
              ))}
              <option value="Other">Other / Custom Company</option>
            </select>

            {targetCompany === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom company name..."
                value={customCompany}
                onChange={e => setCustomCompany(e.target.value)}
                className="w-full mt-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white"
              />
            )}
          </div>

          {/* Role Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Target Job Role
            </label>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white"
            >
              {popularRoles.map((r, idx) => (
                <option key={idx} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Timeline Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Preparation Timeline
            </label>
            <select
              value={timelineDays}
              onChange={e => setTimelineDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white"
            >
              <option value={7}>7 Days (Rapid Sprint)</option>
              <option value={15}>15 Days (Accelerated Preparation)</option>
              <option value={30}>30 Days (Standard Recommended)</option>
              <option value={60}>60 Days (Comprehensive Mastery)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="gradient-btn px-8 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            {generating ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Synthesizing Blueprint...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Company Preparation Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Blueprint View */}
      {prepPlan && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 relative">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400">
                  {prepPlan.company} Preparation
                </span>
                <span className="text-xs text-slate-400">• {prepPlan.role}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {prepPlan.timeline_days} Days Horizon
              </span>
            </div>

            <h3 className="text-lg font-bold text-white pt-1">
              Hiring Profile: <span className="text-blue-400">{prepPlan.company_archetype}</span>
            </h3>
            
            <p className="text-[11px] text-slate-400 italic">
              {prepPlan.ai_disclaimer}
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Priority DSA */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Code2 className="w-4 h-4" /> Priority DSA Topics
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {prepPlan.focus_dsa?.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SQL & Database */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Database className="w-4 h-4" /> Core SQL & Database Focus
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {prepPlan.focus_sql?.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Tech */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Engineering Concepts
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {prepPlan.technical_topics?.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* High-Frequency Interview Questions */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" /> High-Yield Interview Questions for {prepPlan.company}
            </h4>
            <div className="space-y-2">
              {prepPlan.interview_questions?.map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                  <span className="font-mono text-amber-400 font-bold">Q{idx + 1}</span>
                  <p className="leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Project Viva Prompts & Resume Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold uppercase text-purple-400 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Project Viva Defense Prompts
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {prepPlan.project_viva_prompts?.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Resume Tailoring Recommendations
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {prepPlan.resume_tailoring_tips?.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Structured Multi-Week Calendar */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Structured Timeline & Weekly Milestones
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {prepPlan.weekly_schedule?.map((w, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-400">
                    <span>WEEK {w.week_number}</span>
                  </div>
                  <h5 className="text-xs font-bold text-white">{w.focus_theme}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{w.milestone_goal}</p>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}

    </div>
  );
}
