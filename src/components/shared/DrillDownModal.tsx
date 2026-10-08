import React, { useState } from 'react';
import { X, Search, ArrowRight, Calendar } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';

export interface DrillDownItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: 'teal' | 'rose' | 'amber' | 'emerald' | 'sky' | 'indigo' | 'slate';
  date?: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: string;
  items: DrillDownItem[];
  emptyMessage?: string;
  language?: Language;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  items,
  emptyMessage,
  language = 'en',
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const defaultEmptyMessage =
    language === 'mr'
      ? 'या वर्गवारीत कोणतीही नोंद आढळली नाही.'
      : language === 'hi'
      ? 'इस श्रेणी में कोई रिकॉर्ड नहीं मिला।'
      : 'No matching records found in this category.';

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      (item.detail && item.detail.toLowerCase().includes(q)) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    );
  });

  const getBadgeClasses = (color?: string) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'sky':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'teal':
      default:
        return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  const searchPlaceholder =
    language === 'mr'
      ? 'नाव, आयडी, आजार किंवा रुग्णालयानुसार शोधा...'
      : language === 'hi'
      ? 'नाम, आईडी, बीमारी या अस्पताल अनुसार खोजें...'
      : 'Search records by name, ID, condition, or facility...';

  const footerText =
    language === 'mr'
      ? 'वैद्यकीय तपशील पाहण्यासाठी कोणत्याही नोंदीवर क्लिक करा'
      : language === 'hi'
      ? 'चिकित्सीय विवरण देखने के लिए किसी भी रिकॉर्ड पर क्लिक करें'
      : 'Click any record to inspect clinical details';

  const recordsSuffix =
    language === 'mr' ? 'नोंदी' : language === 'hi' ? 'रिकॉर्ड' : 'records filtered';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
      lang={language}
    >
      <div
        className="glass-card max-w-2xl w-full rounded-3xl p-6 shadow-2xl border border-white/80 space-y-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">
                {category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {items.length} {recordsSuffix}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="glass-input w-full pl-9 pr-4 py-2 rounded-xl text-xs"
            autoFocus
          />
        </div>

        {/* Record List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white/85 border border-slate-200/80 hover:border-teal-300 transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{item.title}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${getBadgeClasses(
                          item.badgeColor
                        )}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 font-medium">{item.subtitle}</div>

                  {item.detail && (
                    <div className="text-[11px] text-slate-500 leading-relaxed">{item.detail}</div>
                  )}

                  {item.date && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                  )}
                </div>

                {item.onAction && (
                  <button
                    type="button"
                    onClick={() => {
                      item.onAction?.();
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>{item.actionLabel || t.viewDetails || 'View Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              {emptyMessage || defaultEmptyMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>{footerText}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            {t.done || 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
