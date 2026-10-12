import React, { useState } from 'react';
import { UserRole, Language } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { DEMO_PROFILES, ENABLE_DEMO_LOGIN, DemoUser } from '../../data/demoUsers';
import { authenticateUser } from '../../services/backendService';
import { useAuth, EMAIL_REGEX } from '../../context/AuthContext';
import {
  Lock,
  Eye,
  EyeOff,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface LoginPageProps {
  language: Language;
  onSuccessLogin: (user: { id: string; name: string; role: UserRole; healthId?: string; facility?: string }) => void;
  onNavigateSignUp: () => void;
  onNavigateForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  language,
  onSuccessLogin,
  onNavigateSignUp,
  onNavigateForgotPassword,
}) => {
  const t = TRANSLATIONS[language];
  const { signIn } = useAuth();

  // Role selector: Patient, Health Worker, Doctor/Hospital, Admin
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  // Loading and error toast states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (!cleanId) {
      setErrorMessage('Please enter your registered email address or mobile number.');
      showToast('Validation Error: Identification field cannot be empty');
      return;
    }

    if (!isOtpMode && !password) {
      setErrorMessage('Please enter your password.');
      showToast('Validation Error: Password is required');
      return;
    }

    if (isOtpMode && otpValue !== '123456') {
      setErrorMessage('Invalid verification code. For demo, use 123456.');
      showToast('Auth Error: Invalid OTP code entered');
      return;
    }

    // Client-side validations for email login
    const isEmail = cleanId.includes('@');
    if (isEmail && !EMAIL_REGEX.test(cleanId)) {
      setErrorMessage('Please enter a valid email address (e.g. name@domain.com).');
      showToast('Invalid email address format');
      return;
    }

    if (!isOtpMode && password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      showToast('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!isOtpMode && isEmail) {
        // Connect directly to Supabase Auth signIn
        const res = await signIn(cleanId, password);
        setIsLoading(false);

        if (res.error) {
          setErrorMessage(res.error);
          showToast(res.error);
          return;
        }

        if (res.data?.user) {
          const u = res.data.user;
          const metaRole = (u.user_metadata?.role as UserRole) || selectedRole;
          onSuccessLogin({
            id: u.id,
            name: u.user_metadata?.full_name || u.user_metadata?.name || cleanId.split('@')[0],
            role: metaRole,
            healthId: u.user_metadata?.healthId || `HID-${u.id.slice(0, 6).toUpperCase()}`,
            facility: u.user_metadata?.facility,
          });
          return;
        }
      }

      // Fallback for mobile demo / phone number flow
      const authResult = await authenticateUser(cleanId, isOtpMode ? '123456' : password);
      setIsLoading(false);

      if (authResult.user) {
        const effectiveRole = authResult.user.role || selectedRole;
        onSuccessLogin({
          id: authResult.user.id,
          name: authResult.user.name,
          role: effectiveRole,
          healthId: authResult.user.healthId,
          facility: authResult.user.facility,
        });
      } else {
        setErrorMessage(authResult.error || 'Authentication failed. Please check credentials.');
        showToast(authResult.error || 'Authentication failed');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Authentication error');
    }
  };

  const handleDemoInstantLogin = (demoProfile: DemoUser) => {
    onSuccessLogin({
      id: demoProfile.id,
      name: demoProfile.name,
      role: demoProfile.role,
      healthId: demoProfile.healthId,
      facility: demoProfile.facility,
    });
  };

  return (
    <div className="relative">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="glass-card rounded-3xl p-6 sm:p-9 shadow-xl border border-white/80 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.signIn}
          </h2>
          <p className="text-xs text-slate-500">
            Access clinical triage, digital referrals, and follow-up tracking
          </p>
        </div>

        {/* Role Selector Tabs (Patient, Health Worker, Doctor/Hospital, Admin) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 text-xs font-semibold">
            {[
              { id: 'patient', label: '👤 Patient' },
              { id: 'health_worker', label: '👩‍⚕️ ASHA' },
              { id: 'phc_doctor', label: '🏥 PHC MO' },
              { id: 'doctor', label: '🩺 Specialist' },
              { id: 'admin', label: '🏛️ Admin' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedRole(tab.id as UserRole);
                  setErrorMessage(null);
                }}
                className={`py-2 px-1 text-center rounded-xl transition cursor-pointer text-[10px] sm:text-xs ${
                  selectedRole === tab.id
                    ? 'bg-white text-teal-800 shadow-sm font-bold ring-1 ring-teal-600/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inline Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50/90 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email or Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email or Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="e.g. 9822104523 or name@hospital.gov.in"
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden transition"
              />
            </div>
          </div>

          {/* Password (with show/hide eye icon) or 6-digit OTP */}
          {!isOtpMode ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={onNavigateForgotPassword}
                  className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer hover:underline"
                >
                  {t.forgotPassword}
                </button>
              </div>
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
                  placeholder="Enter your password"
                  className="glass-input w-full pl-10 pr-11 py-3 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">6-Digit Mobile OTP</label>
                <span className="text-[11px] text-teal-700 font-mono font-bold">Use: 123456</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => {
                    setOtpValue(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Enter 6-digit code (123456)"
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-xl font-mono text-sm tracking-widest text-slate-900 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Remember me & Sign in with OTP link */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span>{t.rememberMe}</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setIsOtpMode(!isOtpMode);
                setErrorMessage(null);
              }}
              className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer hover:underline"
            >
              {isOtpMode ? 'Sign in with Password' : 'Sign in with OTP'}
            </button>
          </div>

          {/* Primary Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <>
                <span>{t.signIn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider "or" */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200/80"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            {t.or}
          </span>
          <div className="flex-grow border-t border-slate-200/80"></div>
        </div>

        {/* Try Demo Profile Section (Quick Demo Access) */}
        {ENABLE_DEMO_LOGIN && (
          <div className="glass-card rounded-2xl p-4 border border-teal-200/70 bg-gradient-to-br from-teal-50/70 to-white/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-teal-950 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>{t.quickDemoAccess}</span>
              </div>
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-100/80 px-2 py-0.5 rounded-full">
                1-Click Instant Login
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-normal">
              Click any verified role below to log in instantly with complete mock medical data:
            </p>

            {/* 4 Demo profiles grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_PROFILES.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleDemoInstantLogin(profile)}
                  className={`p-3 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    profile.isDefault
                      ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/25'
                      : 'bg-white/80 border-slate-200 hover:border-teal-300 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5 truncate">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {profile.avatarLabel}
                      </span>
                      <span className="truncate">{profile.name}</span>
                    </span>
                    {profile.isDefault && (
                      <span className="text-[9px] bg-teal-600 text-white font-bold px-1.5 py-0.5 rounded shrink-0">
                        Patient Default
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {profile.title}
                  </div>
                  <div className="text-[10px] text-teal-700 font-semibold truncate mt-1">
                    {profile.location}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Link: New here? Create an account */}
        <div className="text-center pt-1 text-xs text-slate-600">
          <span>New here? </span>
          <button
            onClick={onNavigateSignUp}
            className="text-teal-700 font-bold hover:underline cursor-pointer"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};
