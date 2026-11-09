import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  FileCheck, Mic, Award, TrendingUp, ArrowUpRight,
  Code2, Target, ArrowRight, ShieldCheck,
  ShieldAlert, Building2, AlertTriangle,
  ChevronRight, RefreshCw, BookOpen, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  CartesianGrid
} from 'recharts';
import api from '../services/api';

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
      addToast(`Generating 7-day practice plan for ${topicName}...`, 'info');
      const res = await api.post('/readiness/personalized-practice', {
        weakness_category: categoryName,
        weakness_topic: topicName,
        current_score: currentScore
      });
      setActivePlan(res.data);
      setSelectedCategoryModal(null);
      addToast(`Practice plan ready for ${topicName}.`, 'success');
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
      addToast(`Day ${dayNum} progress updated.`, 'success');
    } catch (err) {
      addToast('Failed to update progress.', 'error');
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
      loadDashboardData();
      addToast('Retest complete. Improvement deltas updated.', 'success');
    } catch (err) {
      addToast('Retest evaluation failed.', 'error');
    } finally {
      setRetesting(false);
    }
  };

  const readinessScore = readinessData?.placement_readiness || 76;
  const readinessVerdict = readinessData?.verdict || 'Almost ready';

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
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Context Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#85858b]">
            <span>Placement readiness dashboard</span>
            <span>•</span>
            <span className="text-emerald-400">Target: {user?.preferred_job_role || 'Software Engineer'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[#ededed]">
            Candidate assessment overview
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Link to="/project-defense" className="btn-secondary text-xs py-1.5 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" /> Project defense
          </Link>
          <Link to="/mock-interview" className="btn-secondary text-xs py-1.5 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-rose-400" /> Pressure interview
          </Link>
          <Link to="/resume-claim-verification" className="btn-secondary text-xs py-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verify claims
          </Link>
        </div>
      </div>

      {/* Placement Readiness Unified Scorecard */}
      <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-5">
            {/* Clean Monospace Numerical Display */}
            <div className="w-24 h-24 rounded-lg bg-[#232325] border border-white/[0.08] flex flex-col items-center justify-center shrink-0">
              <span className="text-3xl font-medium text-[#ededed] font-mono tabular-nums leading-none">
                {readinessScore}
              </span>
              <span className="text-[10px] text-[#85858b] font-mono mt-1">/ 100</span>
              <span className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-400">
                {readinessVerdict}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-[#85858b] uppercase tracking-wider">Placement readiness index</span>
              <h2 className="text-lg font-medium text-[#ededed]">Preparation readiness: {readinessScore}/100</h2>
              <p className="text-xs text-[#a1a1a6] max-w-lg leading-relaxed">
                Calculated across Resume, DSA coding, SQL queries, technical interviews, and project defense vivas.
              </p>
            </div>
          </div>

          {/* Transparent Category Weighting Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full lg:w-auto">
            <div className="bg-[#232325] border border-white/[0.08] p-2.5 rounded-lg text-center">
              <span className="text-[11px] text-[#85858b] block font-mono">Resume 15%</span>
              <strong className="text-sm text-emerald-400 font-mono tabular-nums">
                {readinessData?.breakdown?.["Resume ATS"]?.score || 81}%
              </strong>
            </div>
            <div className="bg-[#232325] border border-white/[0.08] p-2.5 rounded-lg text-center">
              <span className="text-[11px] text-[#85858b] block font-mono">DSA 20%</span>
              <strong className="text-sm text-rose-400 font-mono tabular-nums">
                {readinessData?.breakdown?.["Data Structures & Algorithms"]?.score || 42}%
              </strong>
            </div>
            <div className="bg-[#232325] border border-white/[0.08] p-2.5 rounded-lg text-center">
              <span className="text-[11px] text-[#85858b] block font-mono">SQL 15%</span>
              <strong className="text-sm text-amber-400 font-mono tabular-nums">
                {readinessData?.breakdown?.["SQL & Database"]?.score || 61}%
              </strong>
            </div>
            <div className="bg-[#232325] border border-white/[0.08] p-2.5 rounded-lg text-center">
              <span className="text-[11px] text-[#85858b] block font-mono">Interview 20%</span>
              <strong className="text-sm text-rose-400 font-mono tabular-nums">
                {readinessData?.breakdown?.["Technical Interview"]?.score || 48}%
              </strong>
            </div>
            <div className="bg-[#232325] border border-white/[0.08] p-2.5 rounded-lg text-center">
              <span className="text-[11px] text-[#85858b] block font-mono">Projects 15%</span>
              <strong className="text-sm text-[#ededed] font-mono tabular-nums">
                {readinessData?.breakdown?.["Project Defense"]?.score || 66}%
              </strong>
            </div>
            <div className="bg-[#232325] border border-white/[0.08] p-2.5 rounded-lg text-center">
              <span className="text-[11px] text-[#85858b] block font-mono">Comms 15%</span>
              <strong className="text-sm text-emerald-400 font-mono tabular-nums">
                {readinessData?.breakdown?.["Communication"]?.score || 79}%
              </strong>
            </div>
          </div>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1.5">
            <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              High-priority weak areas
            </span>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-[#a1a1a6]">
                <span>DSA performance</span>
                <span className="text-rose-400">42%</span>
              </div>
              <div className="flex justify-between text-[#a1a1a6]">
                <span>Technical interview</span>
                <span className="text-rose-400">48%</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1.5">
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Confirmed strengths
            </span>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-[#a1a1a6]">
                <span>Python fundamentals</span>
                <span className="text-emerald-400">84%</span>
              </div>
              <div className="flex justify-between text-[#a1a1a6]">
                <span>Communication</span>
                <span className="text-emerald-400">79%</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1.5">
            <span className="text-[11px] font-mono text-[#ededed] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Recommended next step
            </span>
            <div className="space-y-1 text-[#a1a1a6] text-[11px]">
              <p className="flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" /> Practice HashMap & Trees
              </p>
              <p className="flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" /> Complete 7-round project defense
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weakness Radar & Topic Drill-Down */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm font-medium text-[#ededed] flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" /> AI weakness radar
              </h3>
              <p className="text-[11px] text-[#85858b]">Select a category to inspect sub-topics</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#232325] border border-white/[0.08] text-[#85858b] font-mono">
              7 dimensions
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarItems}>
                <PolarGrid stroke="#2c2c30" />
                <PolarAngleAxis dataKey="subject" stroke="#85858b" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2c2c30" />
                <Radar name="Candidate" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="text-sm font-medium text-[#ededed]">Competency breakdown</h3>
            <span className="text-[11px] text-[#85858b] font-mono">Click to inspect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {weaknessData?.categories?.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCategoryModal(cat)}
                className="p-3 rounded-lg bg-[#232325] border border-white/[0.08] hover:border-white/[0.16] cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      cat.score >= 75 ? 'bg-emerald-400' : cat.score >= 60 ? 'bg-amber-400' : 'bg-rose-500'
                    }`} />
                    <span className="text-xs font-medium text-[#ededed] group-hover:text-emerald-400 transition-colors">{cat.name}</span>
                  </div>
                  <span className="text-[11px] text-[#85858b] font-mono block">
                    Weak: {cat.weakest_topic}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className={cat.score >= 75 ? 'text-emerald-400' : cat.score >= 60 ? 'text-amber-400' : 'text-rose-400'}>
                    {cat.score}%
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#85858b]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Targeted Recovery Curriculum & Retest Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-7 bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm font-medium text-[#ededed] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" /> 7-day personalized practice plan
              </h3>
              <p className="text-[11px] text-[#85858b] font-mono">
                {activePlan ? `Targeting: ${activePlan.weakness_topic} (${activePlan.weakness_category})` : 'Curriculum generated from detected weaknesses'}
              </p>
            </div>

            {activePlan && (
              <span className="px-2 py-0.5 rounded bg-[#232325] border border-white/[0.08] text-emerald-400 text-[11px] font-mono">
                {activePlan.completed_days?.length || 0}/7 completed
              </span>
            )}
          </div>

          {activePlan ? (
            <div className="space-y-2">
              {activePlan.days_plan?.map((d) => {
                const isCompleted = activePlan.completed_days?.includes(d.day);
                return (
                  <div
                    key={d.day}
                    onClick={() => handleToggleDay(activePlan.id, d.day, isCompleted)}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                      isCompleted
                        ? 'bg-[#19191b] border-emerald-500/30 opacity-70'
                        : 'bg-[#232325] border-white/[0.08] hover:border-white/[0.16]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted ? 'bg-emerald-500 border-emerald-500 text-[#0f0f10]' : 'border-white/[0.2] bg-[#19191b]'
                      }`}>
                        {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#85858b]">Day {d.day}</span>
                          <h5 className={`text-xs font-medium ${isCompleted ? 'line-through text-[#85858b]' : 'text-[#ededed]'}`}>{d.title}</h5>
                        </div>
                        <p className="text-[11px] text-[#a1a1a6] leading-relaxed">{d.description}</p>
                        <span className="text-[10px] text-emerald-400/90 font-mono block mt-0.5">Exercise: {d.recommended_practice}</span>
                      </div>
                    </div>

                    <span className="text-[10px] text-[#85858b] font-mono shrink-0">{d.estimated_minutes}m</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 bg-[#232325] rounded-lg border border-dashed border-white/[0.08]">
              <BookOpen className="w-6 h-6 text-[#85858b] mx-auto" />
              <p className="text-xs text-[#a1a1a6]">Select any weak category above to generate an automated 7-day practice roadmap.</p>
              <button
                onClick={() => handleGeneratePractice("DSA", "HashMap", 48)}
                className="btn-primary text-xs"
              >
                Generate HashMap practice plan
              </button>
            </div>
          )}
        </div>

        {/* Retest & Score Delta Comparison */}
        <div className="lg:col-span-5 bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm font-medium text-[#ededed] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> AI retest & progress tracker
              </h3>
              <p className="text-[11px] text-[#85858b]">Historical deltas after targeted practice</p>
            </div>
            
            <button
              onClick={handleRunRetest}
              disabled={retesting}
              className="btn-secondary text-xs py-1 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retesting ? 'animate-spin' : ''}`} />
              {retesting ? 'Evaluating...' : 'Retest now'}
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-[#85858b]">
                <span>Category</span>
                <div className="flex gap-4">
                  <span>Initial</span>
                  <span>Retest</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 rounded bg-[#19191b]">
                  <span className="text-[#a1a1a6]">DSA challenge</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#85858b] line-through">42%</span>
                    <span className="text-emerald-400 font-medium">67% (+25)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded bg-[#19191b]">
                  <span className="text-[#a1a1a6]">SQL & database</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#85858b] line-through">61%</span>
                    <span className="text-emerald-400 font-medium">72% (+11)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded bg-[#19191b]">
                  <span className="text-[#a1a1a6]">Technical interview</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#85858b] line-through">48%</span>
                    <span className="text-emerald-400 font-medium">71% (+23)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded bg-[#19191b] border border-white/[0.08]">
                  <span className="text-[#ededed] font-medium">Overall readiness</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#85858b] line-through">64%</span>
                    <span className="text-[#ededed] font-medium">76% (+12)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-40 p-2 bg-[#232325] rounded-lg border border-white/[0.08]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={improvementHistory?.chart_data || [
                  { name: "Initial", readiness: 64, dsa: 42, interview: 48 },
                  { name: "Stage 1", readiness: 71, dsa: 55, interview: 62 },
                  { name: "Stage 2", readiness: 76, dsa: 67, interview: 71 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c2c30" />
                  <XAxis dataKey="name" stroke="#85858b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[30, 100]} stroke="#85858b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#19191b', borderColor: 'rgba(237,237,237,0.08)', borderRadius: '8px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="readiness" stroke="#ededed" strokeWidth={1.5} dot={{ fill: '#ededed', r: 3 }} />
                  <Line type="monotone" dataKey="dsa" stroke="#10b981" strokeWidth={1.5} dot={{ fill: '#10b981', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/resume-claim-verification" className="p-4 rounded-xl bg-[#19191b] border border-white/[0.08] hover:border-white/[0.16] transition-colors block group">
          <div className="flex items-center justify-between mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <ArrowUpRight className="w-3.5 h-3.5 text-[#85858b] group-hover:text-[#ededed] transition-colors" />
          </div>
          <h4 className="text-xs font-medium text-[#ededed] group-hover:text-emerald-400 transition-colors">Resume claim verification</h4>
          <p className="text-[11px] text-[#85858b] mt-0.5 leading-snug">4-question technical examination of claims in experience bullets.</p>
        </Link>

        <Link to="/project-defense" className="p-4 rounded-xl bg-[#19191b] border border-white/[0.08] hover:border-white/[0.16] transition-colors block group">
          <div className="flex items-center justify-between mb-2">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <ArrowUpRight className="w-3.5 h-3.5 text-[#85858b] group-hover:text-[#ededed] transition-colors" />
          </div>
          <h4 className="text-xs font-medium text-[#ededed] group-hover:text-purple-400 transition-colors">Project defense viva</h4>
          <p className="text-[11px] text-[#85858b] mt-0.5 leading-snug">7-round viva testing architecture, trade-offs, and failure recovery.</p>
        </Link>

        <Link to="/mock-interview" className="p-4 rounded-xl bg-[#19191b] border border-white/[0.08] hover:border-white/[0.16] transition-colors block group">
          <div className="flex items-center justify-between mb-2">
            <Mic className="w-4 h-4 text-rose-400" />
            <ArrowUpRight className="w-3.5 h-3.5 text-[#85858b] group-hover:text-[#ededed] transition-colors" />
          </div>
          <h4 className="text-xs font-medium text-[#ededed] group-hover:text-rose-400 transition-colors">Pressure mock interview</h4>
          <p className="text-[11px] text-[#85858b] mt-0.5 leading-snug">Adversarial bar-raiser challenges testing composure and depth.</p>
        </Link>

        <Link to="/company-prep" className="p-4 rounded-xl bg-[#19191b] border border-white/[0.08] hover:border-white/[0.16] transition-colors block group">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <ArrowUpRight className="w-3.5 h-3.5 text-[#85858b] group-hover:text-[#ededed] transition-colors" />
          </div>
          <h4 className="text-xs font-medium text-[#ededed] group-hover:text-blue-400 transition-colors">Target company prep</h4>
          <p className="text-[11px] text-[#85858b] mt-0.5 leading-snug">Curated roadmaps and high-yield questions for TCS, Google, etc.</p>
        </Link>
      </div>

      {/* Drill-Down Modal */}
      {selectedCategoryModal && (
        <div className="fixed inset-0 z-50 bg-[#0f0f10]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#19191b] border border-white/[0.08] rounded-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[11px] font-mono text-[#85858b] uppercase tracking-wider">Topic drill-down</span>
                <h3 className="text-base font-medium text-[#ededed]">{selectedCategoryModal.name} performance</h3>
              </div>
              <button
                onClick={() => setSelectedCategoryModal(null)}
                className="w-7 h-7 rounded bg-[#232325] hover:bg-[#2c2c30] text-[#85858b] hover:text-[#ededed] flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {selectedCategoryModal.subtopics?.map((sub, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#232325] border border-white/[0.08] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#a1a1a6]">{sub.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${
                      sub.score >= 75 ? 'text-emerald-400' :
                      sub.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {sub.status}
                    </span>
                    <strong className="text-[#ededed]">{sub.score}%</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-[#85858b] uppercase">Diagnostic evaluation</span>
              <p className="text-xs text-[#a1a1a6] leading-relaxed">{selectedCategoryModal.diagnostic}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setSelectedCategoryModal(null)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleGeneratePractice(selectedCategoryModal.name, selectedCategoryModal.weakest_topic.split(' ')[0], selectedCategoryModal.score)}
                className="btn-primary text-xs"
              >
                Generate 7-day plan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
