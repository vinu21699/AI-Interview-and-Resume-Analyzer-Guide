import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    addToast(`Signed in as ${userData.name}.`, 'success');
    if (userData.is_admin || userData.email?.includes('admin')) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(email, password);
      handleLoginSuccess(userData);
    } catch (err) {
      addToast(err.response?.data?.detail || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickAdminLogin = async () => {
    setEmail('admin@nexhire.ai');
    setPassword('admin123');
    setLoading(true);
    try {
      const userData = await login('admin@nexhire.ai', 'admin123');
      handleLoginSuccess(userData);
    } catch (err) {
      addToast('Failed to sign in as admin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickUserLogin = async () => {
    setEmail('user@nexhire.ai');
    setPassword('user123');
    setLoading(true);
    try {
      const userData = await login('user@nexhire.ai', 'user123');
      handleLoginSuccess(userData);
    } catch (err) {
      addToast('Failed to sign in as candidate.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#19191b] border border-white/[0.08] rounded-xl max-w-sm w-full p-6 space-y-5"
      >
        <div className="space-y-1 text-center">
          <div className="w-9 h-9 rounded-lg bg-[#232325] border border-white/[0.08] text-emerald-400 mx-auto flex items-center justify-center mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-medium text-white">Sign in</h2>
          <p className="text-xs text-slate-400">Access your placement preparation workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400">Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#141415] border border-white/[0.08] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-medium text-slate-400">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#141415] border border-white/[0.08] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors mt-4"
          >
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <span className="block text-[10px] font-mono text-slate-500 text-center uppercase tracking-wider">Demo accounts</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={quickUserLogin}
              className="py-1.5 px-2 rounded-md bg-[#232325] hover:bg-[#2c2c30] text-slate-300 text-[11px] font-mono border border-white/[0.08] transition-colors"
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={quickAdminLogin}
              className="py-1.5 px-2 rounded-md bg-[#232325] hover:bg-[#2c2c30] text-slate-300 text-[11px] font-mono border border-white/[0.08] transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline">
            Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
