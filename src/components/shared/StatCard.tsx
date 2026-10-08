import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  color?: 'teal' | 'rose' | 'amber' | 'sky' | 'indigo' | 'emerald';
  badge?: string;
  sparklineData?: number[];
  onClick?: () => void;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = 'teal',
  badge,
  sparklineData = [12, 19, 14, 22, 28, 25, 32],
  onClick,
  subtitle,
}) => {
  const colorMap = {
    teal: {
      bg: 'from-teal-500/10 to-teal-500/5',
      border: 'border-teal-500/20 hover:border-teal-500/40',
      text: 'text-teal-900',
      iconBg: 'bg-teal-50 text-teal-700',
      stroke: '#0d9488',
    },
    rose: {
      bg: 'from-rose-500/10 to-rose-500/5',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      text: 'text-rose-950',
      iconBg: 'bg-rose-50 text-rose-700',
      stroke: '#e11d48',
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-500/5',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      text: 'text-amber-950',
      iconBg: 'bg-amber-50 text-amber-700',
      stroke: '#d97706',
    },
    sky: {
      bg: 'from-sky-500/10 to-sky-500/5',
      border: 'border-sky-500/20 hover:border-sky-500/40',
      text: 'text-sky-950',
      iconBg: 'bg-sky-50 text-sky-700',
      stroke: '#0284c7',
    },
    indigo: {
      bg: 'from-indigo-500/10 to-indigo-500/5',
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      text: 'text-indigo-950',
      iconBg: 'bg-indigo-50 text-indigo-700',
      stroke: '#4f46e5',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      text: 'text-emerald-950',
      iconBg: 'bg-emerald-50 text-emerald-700',
      stroke: '#059669',
    },
  };

  const scheme = colorMap[color] || colorMap.teal;

  // Generate SVG path for sparkline
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left glass-card p-4 rounded-2xl border ${scheme.border} bg-gradient-to-br ${scheme.bg} transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 group' : 'cursor-default'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-slate-600 line-clamp-1 group-hover:text-slate-900 transition">
          {label}
        </span>
        {icon && (
          <div className={`w-8 h-8 rounded-xl ${scheme.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className={`text-2xl sm:text-3xl font-extrabold ${scheme.text} tracking-tight font-mono`}>
            {value}
          </div>
          {subtitle && (
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{subtitle}</div>
          )}
        </div>

        {/* Sparkline & trend */}
        <div className="flex flex-col items-end shrink-0">
          <svg width={width} height={height} className="opacity-80">
            <polyline fill="none" stroke={scheme.stroke} strokeWidth="2" strokeLinecap="round" points={points} />
          </svg>

          {trend && (
            <div
              className={`flex items-center gap-0.5 text-[10px] font-bold mt-1 ${
                trend.isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend.value}</span>
              {trend.label && <span className="text-slate-400 font-normal ml-0.5">{trend.label}</span>}
            </div>
          )}
        </div>
      </div>

      {badge && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-slate-700 shadow-2xs border border-slate-200/60">
            {badge}
          </span>
          {onClick && (
            <span className="text-[10px] font-semibold text-teal-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
              <span>View list</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      )}
    </button>
  );
};
