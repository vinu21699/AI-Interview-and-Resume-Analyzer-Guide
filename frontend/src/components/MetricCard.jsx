import React from 'react';

export default function MetricCard({ title, value, subtext, icon: Icon, trend }) {
  return (
    <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between text-xs text-[#85858b]">
        <span>{title}</span>
        {Icon && <Icon className="w-4 h-4 text-[#85858b]" />}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-medium tracking-tight text-[#ededed] font-mono tabular-nums">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-mono text-emerald-400">
            {trend}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-[#85858b] leading-relaxed">{subtext}</p>}
    </div>
  );
}
