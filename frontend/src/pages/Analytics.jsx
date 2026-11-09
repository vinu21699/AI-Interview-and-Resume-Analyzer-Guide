import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Award, Activity, FileCheck, ArrowRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import api from '../services/api';

export default function Analytics() {
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

  const categoryScoreData = stats ? [
    { name: 'ATS Keywords', score: stats.keywords_score || 0 },
    { name: 'Formatting', score: stats.formatting_score || 0 },
    { name: 'Technical Skills', score: stats.skills_score || 0 },
    { name: 'Experience', score: stats.experience_score || 0 },
    { name: 'Projects', score: stats.projects_score || 0 },
    { name: 'Education', score: stats.education_score || 0 },
  ] : [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Candidate Metrics</span>
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Career analytics</h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Historical score trajectories, formatting benchmarks, and technical proficiency trends derived from your audits.
        </p>
      </div>

      {loading ? (
        <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
          <span>Loading analytics data...</span>
        </div>
      ) : totalResumes === 0 ? (
        /* Empty State */
        <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-10 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-10 h-10 rounded-lg bg-[#232325] border border-white/[0.08] text-slate-400 mx-auto flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-medium text-white">No evaluation data found</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Upload your resume in the Resume Analyzer to generate your initial ATS score progression and technical skill matrix.
            </p>
          </div>
          <Link
            to="/resume-analyzer"
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Analyze first resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        /* Real Analytics */
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Uploaded resumes</span>
              <div className="text-2xl font-mono font-semibold text-white tabular-nums">{stats.total_resumes}</div>
              <span className="text-[10px] text-slate-500">Total revisions parsed</span>
            </div>

            <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Latest ATS score</span>
              <div className="text-2xl font-mono font-semibold text-emerald-400 tabular-nums">{stats.latest_ats_score}%</div>
              <span className="text-[10px] text-slate-500">Most recent upload</span>
            </div>

            <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Average ATS score</span>
              <div className="text-2xl font-mono font-semibold text-white tabular-nums">{stats.avg_ats_score}%</div>
              <span className="text-[10px] text-slate-500">Across all audits</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real ATS Line Chart */}
            <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Score trajectory</span>
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232325" />
                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                    <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#141415', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Performance Bar Chart */}
            <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Component breakdown</span>
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryScoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232325" />
                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#141415', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                    <Bar dataKey="score" fill="#232325" stroke="rgba(255,255,255,0.15)" strokeWidth={1} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Latest evaluation summary</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] flex justify-between items-center">
                <span className="text-slate-400">Formatting score</span>
                <span className="font-mono text-emerald-400 tabular-nums font-medium">{stats.formatting_score} / 100</span>
              </div>
              <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] flex justify-between items-center">
                <span className="text-slate-400">ATS keyword score</span>
                <span className="font-mono text-white tabular-nums font-medium">{stats.keywords_score} / 100</span>
              </div>
              <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] flex justify-between items-center">
                <span className="text-slate-400">Technical skills score</span>
                <span className="font-mono text-white tabular-nums font-medium">{stats.skills_score} / 100</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
