import React, { useState } from 'react';
import { UserRole, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { DEMO_PROFILES } from '../data/demoUsers';
import { AppLogo } from './AppLogo';
import {
  Baby,
  Pill,
  ShieldCheck,
  Scan,
  Activity,
  LogOut,
  Sparkles,
  User,
  ChevronDown,
  RefreshCw,
  Users,
  Search,
  Bell,
  Stethoscope,
  BarChart3,
  Menu,
  X,
  Radio,
  FileText,
  Calendar,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
    healthId?: string;
    facility?: string;
    isDemo?: boolean;
  } | null;
  onLogout: () => void;
  onSwitchDemoProfile?: (role: UserRole) => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  onOpenQrScanner: () => void;
  isOffline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  onSwitchDemoProfile,
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount = 3,
  language,
  onChangeLanguage,
  onOpenQrScanner,
  isOffline = false,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isSwitchMenuOpen, setIsSwitchMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'patient':
        return t.rolePatient;
      case 'health_worker':
        return t.roleHealthWorker;
      case 'phc_doctor':
        return t.rolePhcDoctor;
      case 'doctor':
        return t.roleDoctor;
      case 'admin':
        return t.roleAdmin;
      default:
        return role;
    }
  };

  return (
    <header className="no-print glass-nav sticky top-0 z-40 transition border-b border-white/60 shadow-xs" lang={language}>
      {/* Top Demo Mode Banner Strip if in Demo Mode */}
      {currentUser?.isDemo && (
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-teal-100 text-[11px] px-4 py-1.5 border-b border-teal-700/60 shadow-inner">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 text-[10px]">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{t.demoModeActive}: {getRoleDisplayName(currentUser.role)}</span>
              </span>
              <span className="hidden sm:inline text-teal-200">
                {t.loggedInAs} <strong>{currentUser.name}</strong>
                {currentUser.facility ? ` · ${currentUser.facility}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Switch Profile Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSwitchMenuOpen(!isSwitchMenuOpen)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-semibold text-[11px] transition cursor-pointer shadow-xs"
                >
                  <Users className="w-3 h-3" />
                  <span>{t.switchProfile}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Profile switch dropdown */}
                {isSwitchMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 glass-card rounded-2xl p-2 shadow-2xl border border-white/80 z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                      {t.instantSwitch}
                    </div>
                    {DEMO_PROFILES.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => {
                          setIsSwitchMenuOpen(false);
                          if (onSwitchDemoProfile) {
                            onSwitchDemoProfile(profile.role);
                          }
                        }}
                        className={`w-full text-left p-2 rounded-xl transition cursor-pointer flex items-center justify-between ${
                          currentUser.role === profile.role
                            ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{profile.name}</div>
                          <div className="text-[10px] text-slate-500 capitalize">{getRoleDisplayName(profile.role)}</div>
                        </div>
                        {currentUser.role === profile.role && (
                          <span className="text-[10px] bg-teal-600 text-white px-1.5 py-0.2 rounded font-bold">
                            {t.activeUser}
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-slate-200 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSwitchMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left p-2 rounded-xl text-xs text-red-600 hover:bg-red-50 font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.signOutLogin}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="text-[10px] font-bold text-teal-200 hover:text-white bg-teal-950/60 hover:bg-teal-900 px-2 py-0.5 rounded transition cursor-pointer"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Artistic Emblem Logo & Brand Title */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('dashboard');
          }}
          className="flex items-center gap-2 text-slate-900 hover:opacity-90 transition shrink-0"
        >
          <AppLogo size="md" />
        </a>

        {/* Zone 2: Navigation Links for Desktop */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`transition cursor-pointer whitespace-nowrap py-1 ${
              currentTab === 'dashboard'
                ? 'text-teal-700 font-bold border-b-2 border-teal-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.navDashboard}
          </button>

          {currentUser?.role !== 'patient' ? (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('triage')}
                className={`transition cursor-pointer whitespace-nowrap py-1 ${
                  currentTab === 'triage'
                    ? 'text-teal-700 font-bold border-b-2 border-teal-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {t.navTriage}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('referrals')}
                className={`transition cursor-pointer whitespace-nowrap py-1 ${
                  currentTab === 'referrals'
                    ? 'text-teal-700 font-bold border-b-2 border-teal-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {t.navReferrals}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('followups')}
                className={`transition cursor-pointer whitespace-nowrap py-1 ${
                  currentTab === 'followups'
                    ? 'text-teal-700 font-bold border-b-2 border-teal-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {t.navFollowUps}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('mch')}
                className={`transition cursor-pointer whitespace-nowrap py-1 flex items-center gap-1 ${
                  currentTab === 'mch'
                    ? 'text-pink-700 font-bold border-b-2 border-pink-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? 'माता-बाल' : language === 'hi' ? 'मातृ-शिशु' : 'MCH'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('chronic')}
                className={`transition cursor-pointer whitespace-nowrap py-1 flex items-center gap-1 ${
                  currentTab === 'chronic'
                    ? 'text-amber-700 font-bold border-b-2 border-amber-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? 'तीव्र आजार' : language === 'hi' ? 'दीर्घकालिक' : 'Chronic'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('medicines')}
                className={`transition cursor-pointer whitespace-nowrap py-1 flex items-center gap-1 ${
                  currentTab === 'medicines'
                    ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>{t.navMedicines}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('analytics')}
                className={`transition cursor-pointer whitespace-nowrap py-1 flex items-center gap-1 ${
                  currentTab === 'analytics'
                    ? 'text-indigo-700 font-bold border-b-2 border-indigo-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{t.navAnalytics}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('audit')}
                className={`transition cursor-pointer whitespace-nowrap py-1 flex items-center gap-1 ${
                  currentTab === 'audit'
                    ? 'text-slate-900 font-bold border-b-2 border-slate-800'
                    : 'hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>{t.navAudit}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onSelectTab('patient_portal')}
              className={`transition cursor-pointer whitespace-nowrap py-1 ${
                currentTab === 'patient_portal'
                  ? 'text-teal-700 font-bold border-b-2 border-teal-600'
                  : 'hover:text-slate-900'
              }`}
            >
              {t.navPatientPortal}
            </button>
          )}
        </nav>

        {/* Zone 3: Search, Notifications, QR Scanner, Offline Status & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal Search Button */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 glass-card hover:bg-slate-100 rounded-xl text-slate-600 hover:text-teal-700 transition cursor-pointer border border-slate-200 shadow-2xs flex items-center gap-1.5"
              title={`${t.search} (/)`}
            >
              <Search className="w-4 h-4" />
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
                /
              </kbd>
            </button>
          )}

          {/* Universal Notification Center Bell */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 glass-card hover:bg-slate-100 rounded-xl text-slate-600 hover:text-teal-700 transition cursor-pointer border border-slate-200 shadow-2xs"
              title={t.notifications}
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Quick QR Scanner for Arrival Verification */}
          {currentUser?.role !== 'patient' && (
            <button
              type="button"
              onClick={onOpenQrScanner}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              title={t.qrScanner}
            >
              <Scan className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.qrScanner}</span>
            </button>
          )}

          {/* Offline Status Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl glass-card border border-slate-200 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="text-[11px] font-medium text-slate-600">
              {isOffline ? t.offline : t.synced}
            </span>
          </div>

          {/* Language Switcher (EN / मराठी / हिंदी) */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-semibold shadow-2xs">
            <button
              type="button"
              onClick={() => onChangeLanguage('en')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer text-xs ${
                language === 'en'
                  ? 'bg-white text-teal-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('mr')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer text-xs ${
                language === 'mr'
                  ? 'bg-white text-teal-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('hi')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer text-xs ${
                language === 'hi'
                  ? 'bg-white text-teal-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass-card border-b border-slate-200/80 p-4 space-y-2 text-xs font-semibold animate-in slide-in-from-top-2 duration-150">
          <button
            type="button"
            onClick={() => {
              onSelectTab('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-xl ${
              currentTab === 'dashboard' ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700'
            }`}
          >
            {t.navDashboard}
          </button>

          {currentUser?.role !== 'patient' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('triage');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl ${
                  currentTab === 'triage' ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700'
                }`}
              >
                {t.navTriage}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('referrals');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl ${
                  currentTab === 'referrals' ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700'
                }`}
              >
                {t.navReferrals}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('followups');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl ${
                  currentTab === 'followups' ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700'
                }`}
              >
                {t.navFollowUps}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('mch');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl ${
                  currentTab === 'mch' ? 'bg-pink-50 text-pink-900 font-bold' : 'text-slate-700'
                }`}
              >
                {t.navMch}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('chronic');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl ${
                  currentTab === 'chronic' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700'
                }`}
              >
                {t.navChronic}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('medicines');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl ${
                  currentTab === 'medicines' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                }`}
              >
                {t.navMedicines}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('analytics');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl ${
                  currentTab === 'analytics' ? 'bg-indigo-50 text-indigo-900 font-bold' : 'text-slate-700'
                }`}
              >
                {t.navAnalytics}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('audit');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl ${
                  currentTab === 'audit' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-700'
                }`}
              >
                {t.navAudit}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                onSelectTab('patient_portal');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left p-2.5 rounded-xl ${
                currentTab === 'patient_portal' ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700'
              }`}
            >
              {t.navPatientPortal}
            </button>
          )}

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onOpenQrScanner}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{t.qrScanner}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="text-red-600 font-bold text-xs"
            >
              {t.logout}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
