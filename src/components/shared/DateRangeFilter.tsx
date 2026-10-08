import React, { useState } from 'react';
import { Calendar, RefreshCw, Clock } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';

export type DateRangeOption = 'today' | '7days' | '30days' | 'custom';

interface DateRangeFilterProps {
  selectedRange: DateRangeOption;
  onChangeRange: (range: DateRangeOption) => void;
  lastUpdated?: string;
  onRefresh?: () => void;
  className?: string;
  language?: Language;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedRange,
  onChangeRange,
  lastUpdated = 'Just now',
  onRefresh,
  className = '',
  language = 'en',
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 text-xs ${className}`}>
      {/* Date Range Chips */}
      <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs">
        <button
          type="button"
          onClick={() => onChangeRange('today')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            selectedRange === 'today'
              ? 'bg-white text-teal-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.today || 'Today'}
        </button>
        <button
          type="button"
          onClick={() => onChangeRange('7days')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            selectedRange === '7days'
              ? 'bg-white text-teal-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.sevenDays || '7 Days'}
        </button>
        <button
          type="button"
          onClick={() => onChangeRange('30days')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            selectedRange === '30days'
              ? 'bg-white text-teal-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.thirtyDays || '30 Days'}
        </button>
        <button
          type="button"
          onClick={() => onChangeRange('custom')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer hidden sm:inline-flex items-center gap-1 ${
            selectedRange === 'custom'
              ? 'bg-white text-teal-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{t.customRange || 'Custom'}</span>
        </button>
      </div>

      {/* Last Updated Timestamp & Manual Refresh */}
      <div className="flex items-center gap-2 text-slate-500 font-medium">
        <span className="flex items-center gap-1 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span>{t.lastUpdated || 'Last updated'}: <strong className="text-slate-700">{lastUpdated}</strong></span>
        </span>

        <button
          type="button"
          onClick={handleRefreshClick}
          className="p-1.5 glass-card rounded-lg hover:bg-slate-100 text-slate-600 hover:text-teal-700 transition cursor-pointer shadow-2xs border border-slate-200"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
        </button>
      </div>
    </div>
  );
};
