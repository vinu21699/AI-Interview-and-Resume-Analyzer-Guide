import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import {
  FileCheck,
  Mic,
  Award,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Code2,
  MapPin,
  Clock,
  Target,
  ArrowRight
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/resume/my-stats')
      .then((res) => {
        setStats(res.data);
      })
      .catch(() => {
        setStats({ total_resumes: 0, trajectory: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const totalResumes = stats?.total_resumes || 0;
  const latestAts = stats?.latest_ats_score || 0;
  const avgAts = stats?.avg_ats_score || 0;

  // Build Competency Radar from actual resume scores or zero
  const skillRadarData = totalResumes > 0 ? [
    { subject: 'Formatting', A: stats.formatting_score || 0, fullMark: 100 },
    { subject: 'ATS Keywords', A: stats.keywords_score || 0, fullMark: 100 },
    { subject: 'Technical Skills', A: stats.skills_score || 0, fullMark: 100 },
    { subject: 'Experience', A: stats.experience_score || 0, fullMark: 100 },
    { subject: 'Projects', A: stats.projects_score || 0, fullMark: 100 },
    { subject: 'Education', A: stats.education_score || 0, fullMark: 100 },
  ] : [
    { subject: 'Formatting', A: 0, fullMark: 100 },
    { subject: 'ATS Keywords', A: 0, fullMark: 100 },
    { subject: 'Technical Skills', A: 0, fullMark: 100 },
    { subject: 'Experience', A: 0, fullMark: 100 },
    { subject: 'Projects', A: 0, fullMark: 100 },
    { subject: 'Education', A: 0, fullMark: 100 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="glass-card p-8 bg-gradient-to-r from-blue-950/60 via-slate-900 to-purple-950/40 border border-blue-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" /> AI Employability Workspace
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="gradient-text">{user?.name || 'Candidate'}</span>!
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Target Role: <strong className="text-white">{user?.preferred_job_role || 'Software Engineer'}</strong>. {totalResumes > 0 ? `You have analyzed ${totalResumes} resume iterations.` : 'Upload your first resume to calculate your ATS match & employability index.'}
          </p>
        </div>

        <div className="flex items-center gap-4 z-10 shrink-0">
          <Link to="/resume-analyzer" className="gradient-btn px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
            <FileCheck className="w-4 h-4" /> Analyze Resume
          </Link>
          <Link to="/mock-interview" className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white hover:bg-slate-800 transition-colors flex items-center gap-2">
            <Mic className="w-4 h-4 text-purple-400" /> Start Mock Session
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Overall Employability"
          value={totalResumes > 0 ? `${latestAts}%` : '0%'}
          subtext={totalResumes > 0 ? `Based on ${totalResumes} resume analysis` : 'Upload resume to calculate'}
          icon={Award}
          color="emerald"
          trend={totalResumes > 0 ? 'Live Index' : 'No data yet'}
        />
        <MetricCard
          title="ATS Resume Score"
          value={totalResumes > 0 ? `${latestAts}/100` : '0/100'}
          subtext={`${totalResumes} resume${totalResumes === 1 ? '' : 's'} analyzed`}
          icon={FileCheck}
          color="blue"
          trend={totalResumes > 0 ? `Avg score: ${avgAts}%` : 'Upload resume'}
        />
        <MetricCard
          title="Interview Prep Score"
          value={totalResumes > 0 ? `${stats?.skills_score || 0}%` : '0%'}
          subtext={totalResumes > 0 ? 'Technical evaluation active' : '0 sessions completed'}
          icon={Mic}
          color="purple"
          trend={totalResumes > 0 ? 'Active' : 'No data yet'}
        />
        <MetricCard
          title="Skills Acquired"
          value={totalResumes > 0 ? `${stats?.keywords_score || 0}%` : '0%'}
          subtext={totalResumes > 0 ? 'ATS Keyword Density' : '0 target skills evaluated'}
          icon={TrendingUp}
          color="amber"
          trend={totalResumes > 0 ? 'Matched' : 'Pending upload'}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATS Score Improvement Chart */}
        <div className="glass-card p-6 border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> ATS Resume Score Progression
              </h3>
              <p className="text-xs text-slate-400">Historical performance over recent resume iterations</p>
            </div>
            {totalResumes > 0 && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                {totalResumes} iteration{totalResumes === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <div className="h-64">
            {totalResumes === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                <FileCheck className="w-8 h-8 text-slate-600" />
                <div>
                  <h4 className="text-sm font-bold text-white">No Progression Data Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm">Upload your resume in the Resume Analyzer to track your ATS score trajectory over time.</p>
                </div>
                <Link to="/resume-analyzer" className="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 mt-2">
                  Upload Resume <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.trajectory || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis domain={[0, 100]} stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Skill Breakdown Radar Chart */}
        <div className="glass-card p-6 border border-slate-800">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" /> Competency Radar
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            {totalResumes > 0 ? 'Evaluated from latest resume upload' : 'Upload resume to evaluate competencies'}
          </p>
          <div className="h-60">
            {totalResumes === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                <Target className="w-6 h-6 text-slate-600" />
                <p className="text-xs text-slate-400">Competency radar will populate once your resume is analyzed.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillRadarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar name="Candidate" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Quick Launch Features & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-slate-800 lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Recommended Action Plan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/resume-analyzer" className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-colors block">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-400 uppercase">Step 1</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </div>
              <h4 className="text-sm font-semibold text-white">ATS Resume Analyzer</h4>
              <p className="text-xs text-slate-400 mt-1">Upload resume to get ATS score & keyword feedback.</p>
            </Link>

            <Link to="/job-match" className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-colors block">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-400 uppercase">Step 2</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </div>
              <h4 className="text-sm font-semibold text-white">Job Description Matcher</h4>
              <p className="text-xs text-slate-400 mt-1">Compare your resume against specific target job posts.</p>
            </Link>

            <Link to="/mock-interview" className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-colors block">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase">Step 3</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </div>
              <h4 className="text-sm font-semibold text-white">AI Mock Interview</h4>
              <p className="text-xs text-slate-400 mt-1">Practice role-specific technical & STAR interview questions.</p>
            </Link>
          </div>
        </div>

        <div className="glass-card p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Preparation Checklist
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-slate-300">
              <span>Resume Upload Status</span>
              <strong className={totalResumes > 0 ? "text-emerald-400" : "text-amber-400"}>
                {totalResumes > 0 ? `${totalResumes} Uploaded` : 'Pending Upload'}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-slate-300">
              <span>ATS Score Evaluation</span>
              <strong className={latestAts > 0 ? "text-blue-400" : "text-slate-500"}>
                {latestAts > 0 ? `${latestAts}/100` : 'Not Evaluated'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
