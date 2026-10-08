import React from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { AppLogo } from '../AppLogo';
import {
  Stethoscope,
  Building2,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  Activity,
} from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  language,
  onChangeLanguage,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden" lang={language}>
      {/* Ambient background glows for glassmorphism */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-sky-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher - Floats Top Right on all views */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
        <div className="glass-card px-1.5 py-1 rounded-xl shadow-xs flex items-center gap-1 border border-white/80">
          <button
            onClick={() => onChangeLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
              language === 'en' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onChangeLanguage('mr')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
              language === 'mr' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            मराठी
          </button>
          <button
            onClick={() => onChangeLanguage('hi')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
              language === 'hi' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* LEFT PANEL (~45% on desktop, collapses to compact banner on mobile) */}
      <div className="lg:w-[45%] p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative z-10 lg:border-r border-slate-200/60 lg:bg-gradient-to-b lg:from-teal-900/90 lg:via-slate-900/95 lg:to-slate-950 text-slate-900 lg:text-white">
        {/* Brand Header */}
        <div className="space-y-6">
          <div className="flex items-center">
            <AppLogo size="lg" className="lg:[&_span.text-slate-900]:text-white lg:[&_span.text-slate-400]:text-teal-200" />
          </div>

          <div className="hidden lg:block space-y-3 pt-4">
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
              {t.tagline}
            </h1>
            <p className="text-sm text-teal-100/90 leading-relaxed max-w-md">
              A unified digital continuum connecting primary health sub-centres, ASHA workers, secondary hospitals, and specialist doctors across rural Maharashtra.
            </p>
          </div>

          {/* 3 Key Benefits with Icons (Desktop only) */}
          <div className="hidden lg:flex flex-col gap-4 pt-6">
            <div className="glass-card-dark p-4 rounded-2xl flex items-start gap-3.5 border border-white/10 hover:border-teal-400/40 transition">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white">{t.benefit1Title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{t.benefit1Desc}</p>
              </div>
            </div>

            <div className="glass-card-dark p-4 rounded-2xl flex items-start gap-3.5 border border-white/10 hover:border-teal-400/40 transition">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 border border-sky-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white">{t.benefit2Title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{t.benefit2Desc}</p>
              </div>
            </div>

            <div className="glass-card-dark p-4 rounded-2xl flex items-start gap-3.5 border border-white/10 hover:border-teal-400/40 transition">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <GitBranch className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white">{t.benefit3Title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{t.benefit3Desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Trust Marker (Desktop) */}
        <div className="hidden lg:flex items-center justify-between text-xs text-teal-200/80 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>National Health Mission (NHM) Protocol Standard</span>
          </div>
          <span className="font-mono text-[11px] text-teal-300">24x7 Pune Health Network</span>
        </div>
      </div>

      {/* RIGHT PANEL (~55% on desktop: holds the centered auth form) */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
};
