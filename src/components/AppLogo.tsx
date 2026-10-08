import React from 'react';
import { Language } from '../types';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  language?: Language;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 'md', language = 'en' }) => {
  const dimension = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';

  const subtitle =
    language === 'mr'
      ? 'ग्रामीण आरोग्य सेवा · एनएचएम'
      : language === 'hi'
      ? 'ग्रामीण स्वास्थ्य सेवा · एनएचएम'
      : 'Rural Health Continuum · NHM';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Eye-pleasing artistic rural healthcare SVG mark: Merges medical cross + protective green leaf + sunrise of rural care */}
      <div className={`${dimension} rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 flex items-center justify-center p-2 text-white shadow-md shadow-teal-700/20 relative overflow-hidden shrink-0`}>
        {/* Subtle decorative glow */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 rounded-full blur-xs pointer-events-none" />
        
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full text-white" strokeWidth="2.5" stroke="currentColor">
          {/* Stylized protective caduceus & leaf cross */}
          <path
            d="M20 6V34"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M8 18H32"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Organic rural health leaf flourish */}
          <path
            d="M20 18C24 10 32 10 32 18C32 26 24 26 20 18Z"
            fill="rgba(255,255,255,0.25)"
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Central heartbeat pulse dot */}
          <circle cx="20" cy="18" r="2.5" fill="#fef08a" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-bold text-slate-900 tracking-tight text-base md:text-lg">
            {language === 'mr' ? 'आरोग्यसेतू' : language === 'hi' ? 'आरोग्यसेतु' : 'AarogyaSetu'}
          </span>
          <span className="text-teal-600 font-extrabold text-base md:text-lg">
            {language === 'mr' ? 'पुणे' : language === 'hi' ? 'पुणे' : 'Pune'}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
          {subtitle}
        </span>
      </div>
    </div>
  );
};
