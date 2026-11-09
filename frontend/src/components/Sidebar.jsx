import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  Building2,
  FileCheck,
  Briefcase,
  Mic,
  Code2,
  Map,
  Bot,
  FileText,
  BarChart3,
  User,
  Users,
  Activity,
  Database
} from 'lucide-react';

const candidateNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/resume-claim-verification', label: 'Claim verification', icon: ShieldCheck },
  { path: '/project-defense', label: 'Project defense', icon: ShieldAlert },
  { path: '/company-prep', label: 'Company prep', icon: Building2 },
  { path: '/resume-analyzer', label: 'Resume analyzer', icon: FileCheck },
  { path: '/job-match', label: 'Job match', icon: Briefcase },
  { path: '/mock-interview', label: 'Mock interview', icon: Mic },
  { path: '/coding-interview', label: 'Coding sandbox', icon: Code2 },
  { path: '/career-roadmap', label: 'Career roadmap', icon: Map },
  { path: '/learning-assistant', label: 'AI assistant', icon: Bot },
  { path: '/resume-builder', label: 'Resume builder', icon: FileText },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
];

const adminNavItems = [
  { path: '/admin?tab=overview', tab: 'overview', label: 'Admin control center', icon: ShieldCheck },
  { path: '/admin?tab=users', tab: 'users', label: 'User directory', icon: Users },
  { path: '/admin?tab=analytics', tab: 'analytics', label: 'System analytics', icon: Activity },
  { path: '/admin?tab=logs', tab: 'logs', label: 'Audit logs', icon: Database },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'overview';
  const isAdmin = user?.is_admin || user?.email?.includes('admin');

  if (isAdmin) {
    return (
      <aside className="w-60 bg-[#0f0f10] border-r border-white/[0.08] p-3 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-56px)] select-none">
        <div className="space-y-4">
          <div>
            <div className="px-2.5 py-1.5 text-[11px] font-mono text-[#85858b] tracking-wider uppercase mb-1">
              System governance
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isTabActive = activeTab === item.tab;
                return (
                  <NavLink
                    key={item.tab}
                    to={item.path}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium h-9 transition-colors ${
                      isTabActive
                        ? 'bg-[#232325] text-[#ededed] border border-white/[0.08]'
                        : 'text-[#a1a1a6] hover:text-[#ededed] hover:bg-[#19191b]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-[#85858b]" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#19191b] border border-white/[0.08] text-[11px] text-[#85858b] font-mono">
          <div className="flex items-center gap-2 text-[#ededed] font-medium mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Admin session
          </div>
          Full system authority
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-[#0f0f10] border-r border-white/[0.08] p-3 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-56px)] select-none">
      <div className="space-y-4">
        <div>
          <div className="px-2.5 py-1 text-[11px] font-mono text-[#85858b] tracking-wider uppercase mb-1">
            Workspace
          </div>
          <nav className="space-y-0.5">
            {candidateNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium h-9 transition-colors ${
                      isActive
                        ? 'bg-[#232325] text-[#ededed] border border-white/[0.08]'
                        : 'text-[#a1a1a6] hover:text-[#ededed] hover:bg-[#19191b]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#85858b]" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-[#19191b] border border-white/[0.08] text-[11px] text-[#85858b]">
        <div className="flex items-center gap-2 text-[#ededed] font-medium mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Placement ready
        </div>
        Target: {user?.preferred_job_role || 'Software Engineer'}
      </div>
    </aside>
  );
}
