import React, { useState } from 'react';
import { UserRole, Language } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { PUNE_TALUKAS } from '../../data/mockData';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Info,
  X,
  FileText,
} from 'lucide-react';

interface SignUpPageProps {
  language: Language;
  onNavigateLogin: () => void;
  onSuccessRegistered: (user: { name: string; role: UserRole; healthId?: string }) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  language,
  onNavigateLogin,
  onSuccessRegistered,
}) => {
  const t = TRANSLATIONS[language];

  // Role: Only Patient or Health Worker can self-register
  const [selectedRole, setSelectedRole] = useState<'patient' | 'health_worker'>('patient');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [taluka, setTaluka] = useState('Haveli');
  const [villageName, setVillageName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!villageName.trim()) {
      setErrorMessage('Please specify your village or locality name.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both entries.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms & Data Privacy policy to continue.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedId =
        selectedRole === 'patient'
          ? `HID-2026-${randomSuffix}`
          : `ASHA-PUN-${randomSuffix}`;

      onSuccessRegistered({
        name: fullName.trim(),
        role: selectedRole,
        healthId: generatedId,
      });
    }, 800);
  };

  return (
    <>
      <div className="glass-card rounded-3xl p-6 sm:p-9 shadow-xl border border-white/80 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.signUp}
          </h2>
          <p className="text-xs text-slate-500">
            Create an official account on the Pune Rural Integrated Healthcare Platform
          </p>
        </div>

        {/* Role Selector Tabs (Patient vs Health Worker only) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('patient');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 text-center rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                selectedRole === 'patient'
                  ? 'bg-white text-teal-800 shadow-sm font-bold ring-1 ring-teal-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👤 Rural Patient</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('health_worker');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 text-center rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                selectedRole === 'health_worker'
                  ? 'bg-white text-teal-800 shadow-sm font-bold ring-1 ring-teal-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👩‍⚕️ Health Worker (ASHA/ANM)</span>
            </button>
          </div>

          {/* Helper note for Doctors & Admins */}
          <div className="mt-2 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Doctors and Admins, contact your district health office for access.
            </span>
          </div>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="p-3 bg-red-50/90 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Legal Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="e.g. Ramesh Patil"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Mobile Number with +91 Prefix */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative flex rounded-xl shadow-xs">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-bold font-mono">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value.replace(/\D/g, ''));
                  setErrorMessage(null);
                }}
                placeholder="10-digit mobile number"
                className="glass-input w-full rounded-r-xl rounded-l-none pl-3.5 pr-4 py-2.5 text-sm font-mono text-slate-900 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Taluka Dropdown & Village Name Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Taluka (Pune District) <span className="text-red-500">*</span>
              </label>
              <select
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="glass-input w-full px-3 py-2.5 rounded-xl text-xs font-medium text-slate-900 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden cursor-pointer"
              >
                {PUNE_TALUKAS.map((tal) => (
                  <option key={tal} value={tal}>
                    {tal}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Village Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  value={villageName}
                  onChange={(e) => {
                    setVillageName(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="e.g. Velhe or Uruli Kanchan"
                  className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-xs text-slate-900 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Min 8 characters"
                  className="glass-input w-full pl-10 pr-9 py-2.5 rounded-xl text-xs text-slate-900 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Re-enter password"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-slate-900 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Indicator (weak / medium / strong) */}
          {password && <PasswordStrengthMeter password={password} />}

          {/* Terms and Privacy Checkbox with Link to Summary Modal */}
          <div className="p-3 bg-white/70 border border-slate-200/80 rounded-2xl">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  setErrorMessage(null);
                }}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4 shrink-0"
              />
              <span className="text-slate-700 leading-relaxed text-[11px]">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsModal(true);
                  }}
                  className="text-teal-700 font-bold hover:underline cursor-pointer"
                >
                  Terms of Service & Privacy Policy
                </button>
                , and consent to digital referral routing across Pune public healthcare centers.
              </span>
            </label>
          </div>

          {/* Primary Create Account Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating your verified health account...</span>
              </div>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link: Already have an account? Sign In */}
        <div className="text-center pt-1 text-xs text-slate-600">
          <span>Already have an account? </span>
          <button
            onClick={onNavigateLogin}
            className="text-teal-700 font-bold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Terms & Privacy Summary Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-white/80 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Terms of Service & Data Privacy Summary
                </h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>1. Healthcare Continuum Purpose:</strong> AarogyaSetu Pune is a public digital health initiative designed to facilitate early triage, hospital matching, appointment coordination, and follow-up tracking across rural sub-centres, Primary Health Centres (PHCs), and secondary/tertiary referral hospitals in Pune district.
              </p>
              <p>
                <strong>2. Data Privacy & DPDP Act Compliance:</strong> All medical vitals, symptoms, diagnostic records, and referral slips are protected under the Digital Personal Data Protection (DPDP) Act. Patient records are shared strictly with the destination hospital and attending medical practitioners involved in your direct care.
              </p>
              <p>
                <strong>3. Transparent Role-Based Access:</strong> Every record access, update, and referral confirmation is audited with timestamped logs. Health workers cannot modify clinical prescriptions issued by medical doctors.
              </p>
              <p>
                <strong>4. Emergency Services:</strong> The platform is an intelligent decision-support system. In case of critical danger signs, emergency protocols and direct 108 ambulance dispatch must be utilized immediately.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
