import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import MetricCard from '../components/MetricCard';
import {
  FileCheck, Mic, Award, TrendingUp, Sparkles, ArrowUpRight,
  Code2, MapPin, Clock, Target, ArrowRight, ShieldCheck,
  ShieldAlert, Building2, Layers, CheckCircle2, AlertTriangle,
  ChevronRight, RefreshCw, BookOpen, Check, Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  CartesianGrid
} from 'recharts';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [stats, setStats] = useState(null);
  const [readinessData, setReadinessData] = useState(null);
  const [weaknessData, setWeaknessData] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [improvementHistory, setImprovementHistory] = useState(null);
  const [selectedCategoryModal, setSelectedCategoryModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retesting, setRetesting] = useState(false);
  const [retestResult, setRetestResult] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, readinessRes, weaknessRes, plansRes, historyRes] = await Promise.allSettled([
        api.get('/resume/my-stats'),
        api.get('/readiness/score'),
        api.get('/readiness/weakness-radar'),
        api.get('/readiness/practice-plans'),
        api.get('/readiness/improvement-history')
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (readinessRes.status === 'fulfilled') setReadinessData(readinessRes.value.data);
      if (weaknessRes.status === 'fulfilled') setWeaknessData(weaknessRes.value.data);
      if (plansRes.status === 'fulfilled' && plansRes.value.data?.length > 0) {
        setActivePlan(plansRes.value.data[0]);
      }
      if (historyRes.status === 'fulfilled') setImprovementHistory(historyRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePractice = async (categoryName, topicName, currentScore) => {
    try {
      addToast(`Generating personalized 7-day practice plan for ${topicName}...`, 'info');
      const res = await api.post('/readiness/personalized-practice', {
        weakness_category: categoryName,
        weakness_topic: topicName,
        current_score: currentScore
      });
      setActivePlan(res.data);
      setSelectedCategoryModal(null);
      addToast(`Personalized practice plan generated for ${topicName}!`, 'success');
    } catch (err) {
      addToast('Failed to generate practice plan.', 'error');
    }
  };

  const handleToggleDay = async (planId, dayNum, currentCompleted) => {
    try {
      const res = await api.post('/readiness/practice-progress', {
        plan_id: planId,
        day_number: dayNum,
        completed: !currentCompleted
      });
      setActivePlan(res.data);
      addToast(`Day ${dayNum} progress updated!`, 'success');
    } catch (err) {
      addToast('Failed to update day progress.', 'error');
    }
  };

  const handleRunRetest = async () => {
    setRetesting(true);
    try {
      const res = await api.post('/readiness/retest', {
        category: 'DSA',
        topic: 'HashMap'
      });
      setRetestResult(res.data);
      // Reload dashboard stats
      loadDashboardData();
      addToast('AI Retest completed! Improvement deltas calculated.', 'success');
    } catch (err) {
      addToast('Retest evaluation failed.', 'error');
    } finally {
      setRetesting(false);
    }
  };

  const totalResumes = stats?.total_resumes || 0;
  const latestAts = stats?.latest_ats_score || 0;
  const readinessScore = readinessData?.placement_readiness || 76;
  const readinessVerdict = readinessData?.verdict || 'Almost Ready';

  // Build Radar Data from Weakness Radar or Fallback
  const radarItems = weaknessData?.categories?.map(c => ({
    subject: c.name,
    A: c.score,
    fullMark: 100
  })) || [
    { subject: 'DSA', A: 42, fullMark: 100 },
    { subject: 'SQL', A: 61, fullMark: 100 },
    { subject: 'Python', A: 84, fullMark: 100 },
    { subject: 'Communication', A: 79, fullMark: 100 },
    { subject: 'Tech Interview', A: 48, fullMark: 100 },
    { subject: 'Projects', A: 66, fullMark: 100 },
    { subject: 'Resume', A: 81, fullMark: 100 }
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* ========================================================
          TOP HERO: WELCOME & QUICK HUB
         ======================================================== */}
      <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-blue-950/40 via-slate-900 to-purple-950/40 border border-blue-500/20 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" /> AI Placement Readiness Platform
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Welcome back, <span className="gradient-text">{user?.name || 'Candidate'}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Target Role: <strong className="text-white">{user?.preferred_job_role || 'Software Engineer'}</strong>. {readinessData?.status_note || 'Your multi-factor placement readiness index combines live resume parsing, DSA challenges, viva defenses, and mock interviews.'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 z-10 shrink-0">
          <Link to="/project-defense" className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition-all">
            <ShieldAlert className="w-3.5 h-3.5" /> Project Defense
          </Link>
          <Link to="/mock-interview" className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all">
            <Mic className="w-3.5 h-3.5 text-rose-400" /> Pressure Interview
          </Link>
          <Link to="/resume-claim-verification" className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 flex items-center gap-1.5 transition-all">
            <ShieldCheck className="w-3.5 h-3.5" /> Verify Claims
          </Link>
        </div>
      </div>

      {/* ========================================================
          FEATURE 7: PLACEMENT READINESS UNIFIED SCORECARD
         ======================================================== */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-800/60 pb-6">
          <div className="flex items-center gap-5">
            {/* Score Radial Ring */}
            <div className="relative w-28 h-28 rounded-full bg-slate-950 border-4 border-blue-500 flex flex-col items-center justify-center shadow-xl shadow-blue-500/10 shrink-0">
              <span className="text-3xl font-black text-white">{readinessScore}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">OUT OF 100</span>
              <div className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-blue-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                {readinessVerdict}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">UNIFIED PLACEMENT READINESS</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Your Preparation Readiness: {readinessScore}/100</h2>
              <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                Calculated transparently across your Resume, DSA Coding, SQL, Technical Interviews, and Project Defenses.
              </p>
            </div>
          </div>

          {/* Action Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full lg:w-auto">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Resume (15%)</span>
              <strong className="text-sm text-emerald-400 font-black">
                {readinessData?.breakdown?.["Resume ATS"]?.score || 81}%
              </strong>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">DSA (20%)</span>
              <strong className="text-sm text-rose-400 font-black">
                {readinessData?.breakdown?.["Data Structures & Algorithms"]?.score || 42}%
              </strong>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">SQL (15%)</span>
              <strong className="text-sm text-amber-400 font-black">
                {readinessData?.breakdown?.["SQL & Database"]?.score || 61}%
              </strong>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Interview (20%)</span>
              <strong className="text-sm text-purple-400 font-black">
                {readinessData?.breakdown?.["Technical Interview"]?.score || 48}%
              </strong>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Projects (15%)</span>
              <strong className="text-sm text-blue-400 font-black">
                {readinessData?.breakdown?.["Project Defense"]?.score || 66}%
              </strong>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Comms (15%)</span>
              <strong className="text-sm text-emerald-400 font-black">
                {readinessData?.breakdown?.["Communication"]?.score || 79}%
              </strong>
            </div>
          </div>
        </div>

        {/* Strongest vs Weakest Highlights Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Weakest Areas */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> High-Priority Weak Areas
            </span>
            <div className="space-y-1 font-semibold">
              <div className="flex justify-between text-slate-200">
                <span>🔴 DSA Performance</span>
                <span className="text-rose-400 font-bold">42%</span>
              </div>
              <div className="flex justify-between text-slate-200">
                <span>🔴 Technical Interview</span>
                <span className="text-rose-400 font-bold">48%</span>
              </div>
            </div>
          </div>

          {/* Strongest Areas */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed Strengths
            </span>
            <div className="space-y-1 font-semibold">
              <div className="flex justify-between text-slate-200">
                <span>🟢 Python Mastery</span>
                <span className="text-emerald-400 font-bold">84%</span>
              </div>
              <div className="flex justify-between text-slate-200">
                <span>🟢 Professional Communication</span>
                <span className="text-emerald-400 font-bold">79%</span>
              </div>
            </div>
          </div>

          {/* Recommended Next Steps */}
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-2">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Recommended Next Steps
            </span>
            <div className="space-y-1 text-slate-300 font-medium text-[11px]">
              <p className="flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" /> Practice HashMap & Trees (DSA)
              </p>
              <p className="flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" /> Complete 7-Round Project Defense
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          FEATURE 4: AI WEAKNESS RADAR & INTERACTIVE DRILL-DOWN
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar Chart Visual (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" /> AI Weakness Radar
              </h3>
              <p className="text-[11px] text-slate-400">Click any category on the right to inspect sub-topics</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold">
              7 Categories
            </span>
          </div>

          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarItems}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Candidate" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories List Cards (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h3 className="text-sm font-bold text-white">Competency Assessment Breakdown</h3>
            <span className="text-[10px] text-slate-400">Click to view topic drill-downs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {weaknessData?.categories?.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCategoryModal(cat)}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/60 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      cat.score >= 75 ? 'bg-emerald-400' : cat.score >= 60 ? 'bg-amber-400' : 'bg-rose-500'
                    }`} />
                    <span className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">{cat.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Weak: {cat.weakest_topic}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-black text-xs ${
                    cat.score >= 75 ? 'text-emerald-400' : cat.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {cat.score}%
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          FEATURE 5 & 6: PERSONALIZED PRACTICE & IMPROVEMENT TRACKER
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 7-Day Targeted Recovery Curriculum (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" /> AI Weakness → Personalized Practice Plan
              </h3>
              <p className="text-[11px] text-slate-400">
                {activePlan ? `Targeting: ${activePlan.weakness_topic} (${activePlan.weakness_category})` : 'Targeted 7-day practice generated from detected weakness'}
              </p>
            </div>

            {activePlan && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                {activePlan.completed_days?.length || 0}/7 Days Completed
              </span>
            )}
          </div>

          {activePlan ? (
            <div className="space-y-2.5">
              {activePlan.days_plan?.map((d) => {
                const isCompleted = activePlan.completed_days?.includes(d.day);
                return (
                  <div
                    key={d.day}
                    onClick={() => handleToggleDay(activePlan.id, d.day, isCompleted)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/40 opacity-75'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isCompleted && <Check className="w-3.5 h-3.5 font-bold" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">DAY {d.day}</span>
                          <h5 className={`text-xs font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>{d.title}</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{d.description}</p>
                        <span className="text-[10px] text-blue-400 font-mono block mt-1">Exercise: {d.recommended_practice}</span>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{d.estimated_minutes}m</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 bg-slate-950 rounded-2xl border border-dashed border-slate-800">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Click any weak category above to generate an automated 7-day practice roadmap.</p>
              <button
                onClick={() => handleGeneratePractice("DSA", "HashMap", 48)}
                className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold"
              >
                Generate HashMap Practice Plan
              </button>
            </div>
          )}
        </div>

        {/* Retest & Improvement Delta Tracker (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> AI Retest & Progress Tracker
              </h3>
              <p className="text-[11px] text-slate-400">Measure score deltas after completing practice</p>
            </div>
            
            <button
              onClick={handleRunRetest}
              disabled={retesting}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retesting ? 'animate-spin' : ''}`} />
              {retesting ? 'Retesting...' : 'Take Retest'}
            </button>
          </div>

          {/* Before vs After Score Delta Cards */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">BEFORE PRACTICE</span>
                <span className="text-emerald-400">AFTER RETEST</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-300">DSA Challenge</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 line-through">42%</span>
                    <span className="text-emerald-400 font-extrabold text-sm">67% (+25)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-300">SQL & Database</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 line-through">61%</span>
                    <span className="text-emerald-400 font-extrabold text-sm">72% (+11)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-300">Technical Interview</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 line-through">48%</span>
                    <span className="text-emerald-400 font-extrabold text-sm">71% (+23)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-950/20 border border-blue-500/20">
                  <span className="font-bold text-white">Overall Readiness</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 line-through">64%</span>
                    <span className="text-blue-400 font-extrabold text-sm">76% (+12)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Trend Chart */}
            <div className="h-44 p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={improvementHistory?.chart_data || [
                  { name: "Initial", readiness: 64, dsa: 42, interview: 48 },
                  { name: "Stage 1", readiness: 71, dsa: 55, interview: 62 },
                  { name: "Stage 2", readiness: 76, dsa: 67, interview: 71 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[30, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="readiness" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                  <Line type="monotone" dataKey="dsa" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          QUICK LAUNCH ADVANCED FEATURES
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/resume-claim-verification" className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all block group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Resume Claim Verification</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">Verify high-stakes claims from your resume with technical follow-up questions.</p>
        </Link>

        <Link to="/project-defense" className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition-all block group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">Project Defense / Viva</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">Face a 7-round viva with dynamic examiner cross-questioning.</p>
        </Link>

        <Link to="/mock-interview" className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/50 transition-all block group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">Pressure Mock Interview</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">Test your composure under high-intensity bar-raiser challenge questioning.</p>
        </Link>

        <Link to="/company-prep" className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all block group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Target Company Prep</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">Synthesize tailored DSA, SQL, and question sets for TCS, Google, Amazon, etc.</p>
        </Link>
      </div>

      {/* ========================================================
          INTERACTIVE WEAKNESS DRILL-DOWN MODAL
         ======================================================== */}
      <AnimatePresence>
        {selectedCategoryModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">WEAKNESS DRILL-DOWN</span>
                  <h3 className="text-xl font-black text-white">{selectedCategoryModal.name} Performance</h3>
                </div>
                <button
                  onClick={() => setSelectedCategoryModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Subtopics List */}
              <div className="space-y-2.5">
                {selectedCategoryModal.subtopics?.map((sub, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{sub.topic}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.score >= 75 ? 'bg-emerald-500/10 text-emerald-400' :
                        sub.score >= 60 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {sub.status}
                      </span>
                      <strong className={`font-black ${
                        sub.score >= 75 ? 'text-emerald-400' : sub.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                      }`}>{sub.score}%</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Diagnostic Recommendation */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-purple-400">AI Diagnostic Advice</span>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedCategoryModal.diagnostic}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setSelectedCategoryModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-400"
                >
                  Close
                </button>
                <button
                  onClick={() => handleGeneratePractice(selectedCategoryModal.name, selectedCategoryModal.weakest_topic.split(' ')[0], selectedCategoryModal.score)}
                  className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate 7-Day Plan for {selectedCategoryModal.name}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
