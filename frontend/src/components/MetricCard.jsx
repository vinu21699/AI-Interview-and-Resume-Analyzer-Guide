import React from 'react';
import { motion } from 'framer-motion';

export default function MetricCard({ title, value, subtext, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    purple: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30',
    amber: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`glass-card p-5 border relative overflow-hidden bg-gradient-to-br ${colorMap[color] || colorMap.blue}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
        {trend && <span className="text-xs font-medium text-emerald-400">{trend}</span>}
      </div>

      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </motion.div>
  );
}
