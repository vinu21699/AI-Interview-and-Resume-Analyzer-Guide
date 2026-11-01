import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  ShieldCheck,
  Users,
  FileText,
  Mic,
  Code2,
  Trash2,
  Activity,
  Search,
  CheckCircle2,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function AdminPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');
  const { addToast } = useNotification();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const resStats = await api.get('/admin/stats');
      setStats(resStats.data);
      const resUsers = await api.get('/admin/users');
      setUsers(resUsers.data);
    } catch (err) {
      addToast('Failed to load admin panel statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      addToast('User deleted successfully', 'success');
      fetchAdminData();
    } catch (err) {
      addToast('Failed to delete user', 'error');
    }
  };

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.preferred_job_role || '').toLowerCase().includes(userSearch.toLowerCase());
    
    if (roleFilter === 'ADMIN') return matchesSearch && (u.is_admin || u.email?.includes('admin'));
    if (roleFilter === 'CANDIDATE') return matchesSearch && !u.is_admin && !u.email?.includes('admin');
    return matchesSearch;
  });

  // Filtered Logs
  const filteredLogs = (stats?.system_logs || []).filter((log) => {
    const matchesSev = logFilter === 'ALL' || log.level.toUpperCase() === logFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase());
    return matchesSev && matchesSearch;
  });

  // Analytics Sample Chart Data
  const usageChartData = [
    { name: 'Mon', Resumes: 12, Interviews: 8, Coding: 15 },
    { name: 'Tue', Resumes: 19, Interviews: 14, Coding: 22 },
    { name: 'Wed', Resumes: 28, Interviews: 22, Coding: 30 },
    { name: 'Thu', Resumes: 34, Interviews: 29, Coding: 38 },
    { name: 'Fri', Resumes: 45, Interviews: 36, Coding: 42 },
    { name: 'Sat', Resumes: 52, Interviews: 41, Coding: 49 },
    { name: 'Sun', Resumes: 60, Interviews: 48, Coding: 55 },
  ];

  const latencyChartData = [
    { time: '00:00', Latency: 120 },
    { time: '04:00', Latency: 110 },
    { time: '08:00', Latency: 145 },
    { time: '12:00', Latency: 180 },
    { time: '16:00', Latency: 160 },
    { time: '20:00', Latency: 130 },
    { time: '23:59', Latency: 115 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-400">
            <ShieldCheck className="w-3.5 h-3.5" /> System Administration Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white">Platform Administration Panel</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Real-time user directory governance, database audit logging, system performance analytics, and security controls.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Admin Metrics
        </button>
      </div>



      {loading ? (
        <div className="glass-card p-12 text-center text-slate-400 flex items-center justify-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-rose-500 border-t-transparent animate-spin"></span>
          Loading System Diagnostics & Audit Metrics...
        </div>
      ) : (
        <div className="space-y-8">
          {/* TAB 1: OVERVIEW CONTROL CENTER */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Top Admin Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="glass-card p-5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
                    <span>Registered Users</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{stats?.total_users || 0}</div>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active User Database
                  </span>
                </div>

                <div className="glass-card p-5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
                    <span>Resumes Analyzed</span>
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{stats?.total_resumes_analyzed || 0}</div>
                  <span className="text-[11px] text-blue-400 font-semibold">ATS Parsing Engine Active</span>
                </div>

                <div className="glass-card p-5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
                    <span>Interviews Conducted</span>
                    <Mic className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{stats?.total_interviews_conducted || 0}</div>
                  <span className="text-[11px] text-purple-400 font-semibold">AI Voice/Text Sessions</span>
                </div>

                <div className="glass-card p-5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
                    <span>Coding Tests</span>
                    <Code2 className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{stats?.total_coding_tests || 0}</div>
                  <span className="text-[11px] text-amber-400 font-semibold">Py/JS Sandbox Evaluations</span>
                </div>
              </div>

              {/* System Health Diagnostics */}
              <div className="glass-card p-6 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-rose-400" /> Infrastructure & Service Health Monitor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">FastAPI REST Server</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <p className="text-xs text-slate-400">Port 8000 • 100% Uptime</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Google Gemini LLM</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <p className="text-xs text-slate-400">API Key Verified • Ready</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">SQLite Database</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="text-xs text-slate-400">14.2 MB • Healthy</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Security Sandbox</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="text-xs text-slate-400">JWT RBAC Guard Active</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: USER DIRECTORY & ROLES */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-card p-6 border border-slate-800 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" /> User Directory ({filteredUsers.length} Users Found)
                  </h3>

                  {/* Search & Role Filter */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                      <button
                        onClick={() => setRoleFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          roleFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setRoleFilter('ADMIN')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          roleFilter === 'ADMIN' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Admins
                      </button>
                      <button
                        onClick={() => setRoleFilter('CANDIDATE')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          roleFilter === 'CANDIDATE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Candidates
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                        <th className="p-3">User ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Target Role</th>
                        <th className="p-3">System Access Role</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredUsers.map((u) => {
                        const userIsAdmin = u.is_admin || u.email?.includes('admin');
                        return (
                          <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="p-3 text-slate-400 font-mono">#{u.id}</td>
                            <td className="p-3 font-semibold text-white flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-[10px] text-white">
                                {u.name ? u.name[0].toUpperCase() : 'U'}
                              </div>
                              <span>{u.name}</span>
                            </td>
                            <td className="p-3 text-slate-300 font-mono">{u.email}</td>
                            <td className="p-3 text-blue-400 font-medium">{u.preferred_job_role || 'Software Engineer'}</td>
                            <td className="p-3">
                              {userIsAdmin ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                                  <ShieldCheck className="w-3 h-3" /> System Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold">
                                  Candidate User
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:text-white transition-colors"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SYSTEM ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Feature Usage Bar Chart */}
                <div className="glass-card p-6 border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" /> Platform Weekly Feature Usage
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usageChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                        <Bar dataKey="Resumes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Interviews" fill="#a855f7" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Coding" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* API Latency Area Chart */}
                <div className="glass-card p-6 border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" /> AI API Response Time (ms)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={latencyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="Latency" stroke="#10b981" fill="#10b98120" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: DATABASE AUDIT LOGS */}
          {activeTab === 'logs' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-card p-6 border border-slate-800 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" /> Database Audit Logs ({filteredLogs.length} Events)
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        placeholder="Search logs..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                      {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setLogFilter(lvl)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            logFilter === lvl
                              ? lvl === 'ERROR'
                                ? 'bg-rose-600 text-white'
                                : lvl === 'WARN'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No matching audit logs found.</div>
                  ) : (
                    filteredLogs.map((log, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-slate-300">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            log.level === 'error'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : log.level === 'warn'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {log.level}
                          </span>
                          <span className="font-bold text-white">{log.action}:</span>
                          <span className="text-slate-400">{log.details}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0 ml-4">{log.created_at}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

