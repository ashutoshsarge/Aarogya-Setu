import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { OtpInput } from './OtpInput';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import {
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface ForgotPasswordPageProps {
  language: Language;
  onNavigateLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  language,
  onNavigateLogin,
}) => {
  const t = TRANSLATIONS[language];

  // Clean 2-step flow: Step 1 (enter identifier) -> Step 2 (enter 6-digit OTP + new password + confirm) -> Success auto-redirect
  const [step, setStep] = useState<1 | 2>(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectCount, setRedirectCount] = useState(4);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP resend countdown timer for Step 2
  useEffect(() => {
    let interval: any = null;
    if (step === 2 && !isSuccess && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, isSuccess, resendTimer]);

  // Auto-redirect timer on success
  useEffect(() => {
    let interval: any = null;
    if (isSuccess && redirectCount > 0) {
      interval = setInterval(() => {
        setRedirectCount((prev) => prev - 1);
      }, 1000);
    } else if (isSuccess && redirectCount === 0) {
      onNavigateLogin();
    }
    return () => clearInterval(interval);
  }, [isSuccess, redirectCount, onNavigateLogin]);

  // Step 1: Send OTP / Reset Link
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your registered mobile number or email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      setResendTimer(30);
      setStep(2);
    }, 600);
  };

  // Step 2: Verify OTP + Set New Password -> Reset Password button
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (otpValue.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (otpValue !== '123456') {
      setErrorMessage('Invalid verification code. For demo testing, please use 123456.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 700);
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-9 shadow-xl border border-white/80 space-y-6">
      {/* Return to Login link at top */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
        <span className="text-[11px] text-slate-400 font-mono">
          {!isSuccess ? `Step ${step} of 2` : 'Complete'}
        </span>
      </div>

      {!isSuccess ? (
        <>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {step === 1 ? 'Forgot Your Password?' : 'Enter OTP & Set New Password'}
            </h2>
            <p className="text-xs text-slate-500">
              {step === 1
                ? 'Enter your registered mobile number or email to receive a recovery code'
                : `Enter the 6-digit OTP sent to ${identifier} and choose your new password`}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50/90 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Enter registered mobile number or email */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Registered Mobile Number or Email
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
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50/90 p-3 rounded-xl border border-slate-200 leading-relaxed">
                🔒 A one-time verification code will be dispatched to your registered device for identity authentication.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending code...</span>
                  </div>
                ) : (
                  <>
                    <span>Send OTP / Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter 6-digit OTP + new password + confirm password */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              {/* 6-Digit OTP */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    6-Digit SMS Verification Code
                  </label>
                  <span className="text-[11px] text-teal-700 font-mono font-semibold">
                    Demo Code: 123456
                  </span>
                </div>
                <OtpInput
                  value={otpValue}
                  onChange={(val) => {
                    setOtpValue(val);
                    setErrorMessage(null);
                  }}
                  length={6}
                />
              </div>

              {/* Resend OTP Link */}
              <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-teal-700 font-semibold hover:underline cursor-pointer"
                >
                  Change mobile number
                </button>

                {resendTimer > 0 ? (
                  <span className="flex items-center gap-1 font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5" /> Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResendTimer(30)}
                    className="text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
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

              {newPassword && <PasswordStrengthMeter password={newPassword} />}

              {/* Primary Reset Password Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting your password...</span>
                  </div>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </>
      ) : (
        /* SUCCESS CONFIRMATION & AUTO-REDIRECT SCREEN */
        <div className="space-y-5 text-center py-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">
              Password Reset Successfully!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your password has been securely updated. You can now access your health account with your new credentials.
            </p>
          </div>

          <div className="text-xs text-teal-700 font-semibold bg-teal-50 py-2 px-4 rounded-xl inline-block border border-teal-200">
            Redirecting to Sign In in {redirectCount} seconds...
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigateLogin}
              className="py-3 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition"
            >
              Sign In Now
            </button>
          </div>
        </div>
      )}

      {/* Return to Login link at bottom */}
      <div className="text-center pt-1 text-xs text-slate-600">
        <span>Remember your password? </span>
        <button
          onClick={onNavigateLogin}
          className="text-teal-700 font-bold hover:underline cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
