import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const rulesPassed = [hasMinLength, hasUppercase, hasLowercase, hasNumber].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (rulesPassed === 0) return { label: 'Enter password', color: 'bg-slate-200', text: 'text-slate-400', width: '0%' };
    if (rulesPassed === 1) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-600', width: '25%' };
    if (rulesPassed === 2) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600', width: '50%' };
    if (rulesPassed === 3) return { label: 'Good', color: 'bg-teal-500', text: 'text-teal-600', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-600', text: 'text-emerald-700', width: '100%' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-medium">Password Strength:</span>
        <span className={`font-bold ${strength.text}`}>{strength.label}</span>
      </div>

      <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: strength.width }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
        <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
          {hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>At least 8 characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
          {hasUppercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>Uppercase letter (A-Z)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
          {hasLowercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>Lowercase letter (a-z)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
          {hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>Number (0-9)</span>
        </div>
      </div>
    </div>
  );
};
