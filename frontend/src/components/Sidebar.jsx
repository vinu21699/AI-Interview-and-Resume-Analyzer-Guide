import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileCheck,
  Briefcase,
  Mic,
  Code2,
  Map,
  Bot,
  FileText,
  BarChart3,
  ShieldCheck,
  User,
  Sparkles,
  Users,
  Database,
  Activity
} from 'lucide-react';

const candidateNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/resume-analyzer', label: 'Resume Analyzer', icon: FileCheck },
  { path: '/job-match', label: 'Job Matching', icon: Briefcase },
  { path: '/mock-interview', label: 'AI Mock Interview', icon: Mic },
  { path: '/coding-interview', label: 'Coding Interview', icon: Code2 },
  { path: '/career-roadmap', label: 'Career Roadmap', icon: Map },
  { path: '/learning-assistant', label: 'AI Assistant', icon: Bot },
  { path: '/resume-builder', label: 'Resume Builder', icon: FileText },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
];

const adminNavItems = [
  { path: '/admin?tab=overview', tab: 'overview', label: 'Admin Control Center', icon: ShieldCheck },
  { path: '/admin?tab=users', tab: 'users', label: 'User Directory & Roles', icon: Users },
  { path: '/admin?tab=analytics', tab: 'analytics', label: 'System Analytics', icon: Activity },
  { path: '/admin?tab=logs', tab: 'logs', label: 'Database Audit Logs', icon: Database },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'overview';
  const isAdmin = user?.is_admin || user?.email?.includes('admin');

  if (isAdmin) {
    return (
      <aside className="w-64 bg-slate-950/80 backdrop-blur-xl border-r border-rose-900/30 p-4 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-61px)]">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs mb-4">
              <ShieldCheck className="w-4 h-4 shrink-0" /> Administrator Portal
            </div>
            <p className="text-[11px] font-bold tracking-wider text-rose-400/80 uppercase px-3 mb-2">System Controls</p>
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isTabActive = activeTab === item.tab;
                return (
                  <NavLink
                    key={item.tab}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isTabActive
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                        : 'text-slate-400 hover:text-rose-300 hover:bg-rose-950/30'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900/60 to-purple-950/40 border border-rose-500/20 text-center space-y-2 mt-4">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-rose-200">Admin Mode Active</h4>
          <p className="text-[11px] text-slate-400">Full system governance & database management.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-slate-950/60 backdrop-blur-xl border-r border-slate-800/60 p-4 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-61px)]">
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase px-3 mb-2">Candidate Workspace</p>
          <div className="space-y-1">
            {candidateNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/20 text-center space-y-2 mt-4">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-semibold text-slate-200">Gemini AI Active</h4>
        <p className="text-[11px] text-slate-400">Powered by Google GenAI models for career analysis.</p>
      </div>
    </aside>
  );
}


