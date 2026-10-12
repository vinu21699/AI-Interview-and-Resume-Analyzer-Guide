import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Sun, Moon, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight gradient-text">Antigravity AI</span>
            <span className="text-xs block text-slate-400 font-medium -mt-1">
              {isAdmin ? 'System Admin Portal' : 'Career & Interview Suite'}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin ? (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Platform Administrator
          </div>
        ) : (
          user?.preferred_job_role && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-blue-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Target: {user.preferred_job_role}
            </div>
          )
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white shadow-md">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-slate-200">{user.name}</span>
                <span className="block text-[10px] text-slate-400">{user.email}</span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white">
              Log In
            </Link>
            <Link to="/register" className="gradient-btn px-4 py-2 rounded-xl text-sm font-medium">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

