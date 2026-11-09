import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isAdmin = user?.is_admin || user?.email?.includes('admin');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#141415]/90 backdrop-blur-md border-b border-white/[0.08] px-6 py-3 flex items-center justify-between h-14">
      <div className="flex items-center gap-4">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#232325] border border-white/[0.08] flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-[#ededed]">
              NexHire
            </span>
            <span className="text-xs text-[#85858b] font-mono">
              {isAdmin ? 'admin' : 'workspace'}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin ? (
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-[#232325] border border-white/[0.08] text-xs text-[#a1a1a6] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> admin mode
          </div>
        ) : (
          user?.preferred_job_role && (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-[#232325] border border-white/[0.08] text-xs text-[#a1a1a6] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {user.preferred_job_role}
            </div>
          )
        )}

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-[#232325] hover:bg-[#2b2b2f] border border-white/[0.08] text-[#85858b] hover:text-[#ededed] transition-colors"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-white/[0.08]">
            <Link to="/profile" className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity">
              <div className="w-7 h-7 rounded-lg bg-[#232325] border border-white/[0.08] flex items-center justify-center font-medium text-xs text-[#ededed]">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block">
                <span className="block text-xs font-medium text-[#ededed] leading-tight">{user.name}</span>
                <span className="block text-[11px] text-[#85858b] font-mono leading-tight">{user.email}</span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-[#232325] hover:bg-[#2b2b2f] border border-white/[0.08] text-[#85858b] hover:text-rose-400 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#a1a1a6] hover:text-[#ededed] transition-colors">
              Log in
            </Link>
            <Link to="/register" className="btn-primary text-xs py-1.5">
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
