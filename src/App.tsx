/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Language,
  Patient,
  Hospital,
  Referral,
  ReferralStatus,
  FollowUpStatus,
  MchRecord,
  ChronicRecord,
  AuditLog,
  PatientFeedback,
} from './types';
import {
  INITIAL_PATIENTS,
  INITIAL_HOSPITALS,
  INITIAL_REFERRALS,
  INITIAL_MCH_RECORDS,
  INITIAL_CHRONIC_RECORDS,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import { DEMO_PROFILES, DemoUser } from './data/demoUsers';
import { TRANSLATIONS } from './utils/translations';
import { AuthLayout } from './components/auth/AuthLayout';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { Navbar } from './components/Navbar';
import { TriageFlow } from './components/TriageFlow';
import { ReferralsList } from './components/ReferralsList';
import { FollowUpModule } from './components/FollowUpModule';
import { DistrictAnalytics } from './components/DistrictAnalytics';
import { PatientPortalView } from './components/PatientPortalView';
import { DigitalReferralSlip } from './components/DigitalReferralSlip';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import { TeleconsultationModal } from './components/TeleconsultationModal';
import { MchModule } from './components/MchModule';
import { ChronicDiseaseModule } from './components/ChronicDiseaseModule';
import { MedicineStockChecker } from './components/MedicineStockChecker';
import { AuditLogView } from './components/AuditLogView';
import { QrScannerModal } from './components/QrScannerModal';
import { NotificationModal } from './components/NotificationModal';
import { PatientFeedbackModal } from './components/PatientFeedbackModal';
import { PatientDashboard } from './components/dashboards/PatientDashboard';
import { HealthWorkerDashboard } from './components/dashboards/HealthWorkerDashboard';
import { PhcDoctorDashboard } from './components/dashboards/PhcDoctorDashboard';
import { HospitalDoctorDashboard } from './components/dashboards/HospitalDoctorDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { GlobalSearchModal } from './components/shared/GlobalSearchModal';
import { NotificationDrawer } from './components/shared/NotificationDrawer';
import { OfflineBanner } from './components/OfflineBanner';
import { BackendStatusModal } from './components/BackendStatusModal';
import {
  fetchPatients,
  savePatient,
  fetchReferrals,
  saveReferral,
  updateReferralInDb,
  fetchHospitals,
  fetchMchRecords,
  updateMchRecordInDb,
  fetchChronicRecords,
  updateChronicRecordInDb,
  fetchAuditLogs,
  recordAuditLog,
  subscribeToReferralUpdates,
} from './services/backendService';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');

  // Connectivity & Offline State (Monitored via Service Worker, navigator, and localStorage cross-tab listeners)
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedOffline = localStorage.getItem('aarogya_simulated_offline');
      if (storedOffline === 'true') return true;
      return !navigator.onLine;
    }
    return false;
  });

  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aarogya_simulated_offline') === 'true';
    }
    return false;
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    role: UserRole;
    healthId?: string;
    facility?: string;
    isDemo?: boolean;
  } | null>(() => {
    const saved = localStorage.getItem('aarogya_auth_user');
    // Default to null or saved user. For seamless first experience if no saved user:
    return saved ? JSON.parse(saved) : null;
  });

  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Persistence data states
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('aarogya_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);

  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem('aarogya_referrals');
    return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
  });

  const [mchRecords, setMchRecords] = useState<MchRecord[]>(INITIAL_MCH_RECORDS);
  const [chronicRecords, setChronicRecords] = useState<ChronicRecord[]>(INITIAL_CHRONIC_RECORDS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Modal states
  const [viewingSlipReferral, setViewingSlipReferral] = useState<Referral | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [previewNotificationReferral, setPreviewNotificationReferral] = useState<Referral | null>(null);
  const [feedbackReferral, setFeedbackReferral] = useState<Referral | null>(null);
  const [activeTeleconsultSession, setActiveTeleconsultSession] = useState<{
    patient: Patient;
    hospital: Hospital;
    specialty: string;
  } | null>(null);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);

  // Listen for online/offline events & localStorage cross-tab updates
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsSimulatedOffline(false);
      localStorage.removeItem('aarogya_simulated_offline');
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aarogya_simulated_offline') {
        const isSim = e.newValue === 'true';
        setIsSimulatedOffline(isSim);
        setIsOffline(isSim || !navigator.onLine);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Global keyboard shortcut ('/' or 'Cmd/Ctrl+K') to open Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleOfflineSimulation = () => {
    const nextVal = !isOffline;
    setIsOffline(nextVal);
    setIsSimulatedOffline(nextVal);
    if (nextVal) {
      localStorage.setItem('aarogya_simulated_offline', 'true');
    } else {
      localStorage.removeItem('aarogya_simulated_offline');
    }
  };

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('aarogya_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('aarogya_referrals', JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('aarogya_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('aarogya_auth_user');
    }
  }, [currentUser]);

  // Fetch live Supabase data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [pat, ref, hosp, mch, chron, aud] = await Promise.all([
          fetchPatients(),
          fetchReferrals(),
          fetchHospitals(),
          fetchMchRecords(),
          fetchChronicRecords(),
          fetchAuditLogs(),
        ]);
        if (isMounted) {
          if (pat && pat.length > 0) setPatients(pat);
          if (ref && ref.length > 0) setReferrals(ref);
          if (hosp && hosp.length > 0) setHospitals(hosp);
          if (mch && mch.length > 0) setMchRecords(mch);
          if (chron && chron.length > 0) setChronicRecords(chron);
          if (aud && aud.length > 0) setAuditLogs(aud);
        }
      } catch (err) {
        console.warn('Initial data load from backend completed with local fallback:', err);
      }
    }
    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time collaborative subscription to referral updates across clinics & hospitals
  useEffect(() => {
    const unsubscribe = subscribeToReferralUpdates((updatedReferral) => {
      setReferrals((prev) => {
        const exists = prev.some((r) => r.id === updatedReferral.id);
        if (exists) {
          return prev.map((r) => (r.id === updatedReferral.id ? updatedReferral : r));
        } else {
          return [updatedReferral, ...prev];
        }
      });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const addAuditLog = (action: string, resource: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? currentUser.name : 'System Security Engine',
      role: currentUser ? currentUser.role.toUpperCase() : 'AUTH_SERVICE',
      action,
      resource,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    recordAuditLog(newLog).catch(() => {});
  };

  // Auth Handlers
  const handleLoginSuccess = (user: { id: string; name: string; role: UserRole; healthId?: string; facility?: string }) => {
    const isDemo = DEMO_PROFILES.some((d) => d.id === user.id || d.name === user.name);
    const fullUser = { ...user, isDemo };
    setCurrentUser(fullUser);

    // Role-based dashboard redirection
    setCurrentTab('dashboard');

    addAuditLog('USER_LOGIN', `User: ${user.name}`, `Signed in successfully as ${user.role} (Demo: ${isDemo})`);
  };

  const handleLogout = () => {
    addAuditLog('USER_LOGOUT', `User: ${currentUser?.name}`, 'Signed out from session');
    setCurrentUser(null);
    setAuthView('login');
  };

  // Application Handlers
  const handleRegisterPatient = (newPatient: Patient) => {
    setPatients([newPatient, ...patients]);
    setIsRegisterOpen(false);
    savePatient(newPatient).catch(() => {});
    addAuditLog('PATIENT_REGISTER', `Health ID: ${newPatient.healthId}`, `Registered patient ${newPatient.name}`);
  };

  const handleCreateReferral = (newReferral: Referral) => {
    setReferrals([newReferral, ...referrals]);
    saveReferral(newReferral).catch(() => {});
    addAuditLog(
      'REFERRAL_CREATED',
      `Voucher: ${newReferral.referralNumber}`,
      `Created ${newReferral.triageResult.level} priority referral to ${newReferral.destinationHospitalName}`
    );
  };

  const handleUpdateReferralStatus = (
    referralId: string,
    newStatus: ReferralStatus,
    notes?: string,
    doctorName?: string,
    prescriptions?: { medicineName: string; dosage: string; frequency: string; duration: string }[]
  ) => {
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id !== referralId) return r;

        const currentFacility =
          currentUser?.role === 'doctor'
            ? r.destinationHospitalName
            : r.referringFacility;
        const currentOperator =
          currentUser?.role === 'doctor'
            ? doctorName || currentUser.name
            : currentUser?.name || 'ASHA Field Worker';

        const updatedTimeline = [
          ...(r.timeline || []),
          {
            stage: newStatus,
            timestamp: new Date().toISOString(),
            operator: currentOperator,
            facility: currentFacility,
            note: notes || `Status updated to ${newStatus}`,
          },
        ];

        const updated: Referral = {
          ...r,
          status: newStatus,
          timeline: updatedTimeline,
          reachedAt: newStatus === 'REACHED' ? new Date().toISOString() : r.reachedAt,
          underTreatmentAt: newStatus === 'UNDER_TREATMENT' ? new Date().toISOString() : r.underTreatmentAt,
          completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : r.completedAt,
        };

        if (notes) updated.doctorNotes = notes;
        if (doctorName) updated.treatingDoctorName = doctorName;
        if (prescriptions) updated.prescriptions = prescriptions;

        return updated;
      })
    );

    updateReferralInDb(referralId, {
      status: newStatus,
      doctorNotes: notes,
      treatingDoctorName: doctorName,
      prescriptions,
      reachedAt: newStatus === 'REACHED' ? new Date().toISOString() : undefined,
      underTreatmentAt: newStatus === 'UNDER_TREATMENT' ? new Date().toISOString() : undefined,
      completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
    }).catch(() => {});

    addAuditLog('STATUS_TRANSITION', `Referral: ${referralId}`, `Status changed to ${newStatus}`);
  };

  const handleScanReached = (referralId: string, operatorName: string) => {
    handleUpdateReferralStatus(referralId, 'REACHED', 'Arrived at OPD reception via QR code scan', operatorName);
    addAuditLog('QR_SCAN_VERIFIED', `Referral: ${referralId}`, `Patient marked REACHED by ${operatorName}`);
  };

  const handleUpdateFollowUp = (
    referralId: string,
    status: FollowUpStatus,
    checklist: {
      homeVisited: boolean;
      medicationAdherence: boolean;
      symptomsRelieved: boolean;
      notes: string;
    }
  ) => {
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id !== referralId) return r;
        return {
          ...r,
          followUpStatus: status,
          followUpChecklist: checklist,
        };
      })
    );
    updateReferralInDb(referralId, {
      followUpStatus: status,
      followUpChecklist: checklist,
    }).catch(() => {});

    addAuditLog('FOLLOW_UP_VERIFIED', `Referral: ${referralId}`, `ASHA home visit verified; status: ${status}`);
  };

  const handleLogRefill = (recordId: string) => {
    setChronicRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== recordId) return rec;
        const updated = {
          ...rec,
          status: 'UP_TO_DATE' as const,
          nextRefillDate: '2026-11-04',
        };
        updateChronicRecordInDb(updated).catch(() => {});
        return updated;
      })
    );
    addAuditLog('NCD_REFILL_DISPENSED', `Record: ${recordId}`, 'Chronic medicine refill dispensed');
  };

  const handleUpdateAnc = (recordId: string, visitNumber: number) => {
    setMchRecords((prev) =>
      prev.map((mch) => {
        if (mch.id !== recordId) return mch;
        const updatedVisits = mch.ancVisits.map((v) => {
          if (v.visitNumber !== visitNumber) return v;
          return {
            ...v,
            status: 'DONE' as const,
            completedDate: new Date().toISOString().split('T')[0],
            bp: '122/80',
            hb: 11.0,
            weightKg: 62,
          };
        });
        const updatedMch = { ...mch, ancVisits: updatedVisits };
        updateMchRecordInDb(updatedMch).catch(() => {});
        return updatedMch;
      })
    );
    addAuditLog('ANC_VISIT_LOGGED', `MCH: ${recordId}`, `ANC visit #${visitNumber} recorded as completed`);
  };

  const handleSaveFeedback = (feedback: PatientFeedback) => {
    if (!feedbackReferral) return;
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id !== feedbackReferral.id) return r;
        return { ...r, feedback };
      })
    );
    updateReferralInDb(feedbackReferral.id, { feedback }).catch(() => {});
    setFeedbackReferral(null);
    addAuditLog('FEEDBACK_SUBMITTED', `Referral: ${feedbackReferral.id}`, `Patient rated ${feedback.rating} stars`);
  };

  const activePatientForPortal = patients[0] || INITIAL_PATIENTS[0];

  // IF NOT AUTHENTICATED: RENDER SPLIT-SCREEN AUTHENTICATION FLOW
  if (!currentUser) {
    return (
      <AuthLayout language={language} onChangeLanguage={(l) => setLanguage(l)}>
        {authView === 'login' && (
          <LoginPage
            language={language}
            onSuccessLogin={handleLoginSuccess}
            onNavigateSignUp={() => setAuthView('signup')}
            onNavigateForgotPassword={() => setAuthView('forgot')}
          />
        )}
        {authView === 'signup' && (
          <SignUpPage
            language={language}
            onNavigateLogin={() => setAuthView('login')}
            onSuccessRegistered={(u) => {
              handleLoginSuccess({
                id: `usr_${Date.now()}`,
                name: u.name,
                role: u.role,
                healthId: u.healthId,
              });
            }}
          />
        )}
        {authView === 'forgot' && (
          <ForgotPasswordPage
            language={language}
            onNavigateLogin={() => setAuthView('login')}
          />
        )}
      </AuthLayout>
    );
  }

  // AUTHENTICATED APPLICATION
  return (
    <div className="min-h-screen flex flex-col font-sans relative" lang={language}>
      {/* Top Glassmorphic Navigation with Artistic Logo and Features */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchDemoProfile={(role) => {
          const profile = DEMO_PROFILES.find((p) => p.role === role) || DEMO_PROFILES[0];
          handleLoginSuccess({
            id: profile.id,
            name: profile.name,
            role: profile.role,
            healthId: profile.healthId,
            facility: profile.facility,
          });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={3}
        language={language}
        onChangeLanguage={(lang) => setLanguage(lang)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        isOffline={isOffline}
        onOpenBackendStatus={() => setIsBackendModalOpen(true)}
      />

      {/* Main Glassmorphic View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {currentTab === 'dashboard' && (
          <>
            {currentUser.role === 'patient' && (
              <PatientDashboard
                patient={activePatientForPortal}
                referrals={referrals}
                hospitals={hospitals}
                language={language}
                onViewSlip={(ref) => setViewingSlipReferral(ref)}
                onOpenTeleconsult={(ref) => {
                  const matchedHospital = hospitals.find((h) => h.id === ref.destinationHospitalId) || hospitals[0];
                  setActiveTeleconsultSession({
                    patient: activePatientForPortal,
                    hospital: matchedHospital,
                    specialty: ref.triageResult.recommendedSpecialty,
                  });
                }}
                onOpenFeedback={(ref) => setFeedbackReferral(ref)}
              />
            )}

            {currentUser.role === 'health_worker' && (
              <HealthWorkerDashboard
                patients={patients}
                referrals={referrals}
                mchRecords={mchRecords}
                chronicRecords={chronicRecords}
                language={language}
                onOpenTriage={() => setCurrentTab('triage')}
                onOpenRegister={() => setIsRegisterOpen(true)}
                onViewSlip={(ref) => setViewingSlipReferral(ref)}
                onNavigateTab={(t) => setCurrentTab(t)}
              />
            )}

            {currentUser.role === 'phc_doctor' && (
              <PhcDoctorDashboard
                hospitals={hospitals}
                referrals={referrals}
                patients={patients}
                language={language}
                onOpenTriage={() => setCurrentTab('triage')}
                onViewSlip={(ref) => setViewingSlipReferral(ref)}
                onNavigateTab={(t) => setCurrentTab(t)}
              />
            )}

            {currentUser.role === 'doctor' && (
              <HospitalDoctorDashboard
                doctorHospital={hospitals[0]}
                referrals={referrals}
                patients={patients}
                language={language}
                onViewSlip={(ref) => setViewingSlipReferral(ref)}
                onUpdateStatus={handleUpdateReferralStatus}
                onOpenTeleconsult={(ref) => {
                  const matchedHospital = hospitals.find((h) => h.id === ref.destinationHospitalId) || hospitals[0];
                  const matchedPatient = patients.find((p) => p.id === ref.patientId) || patients[0];
                  setActiveTeleconsultSession({
                    patient: matchedPatient,
                    hospital: matchedHospital,
                    specialty: ref.triageResult.recommendedSpecialty,
                  });
                }}
                onNavigateTab={(t) => setCurrentTab(t)}
              />
            )}

            {currentUser.role === 'admin' && (
              <AdminDashboard
                referrals={referrals}
                hospitals={hospitals}
                patients={patients}
                language={language}
                onNavigateAudit={() => setCurrentTab('audit')}
                onNavigateTab={(t) => setCurrentTab(t)}
              />
            )}
          </>
        )}
        {currentTab === 'triage' && (
          <TriageFlow
            patients={patients}
            hospitals={hospitals}
            language={language}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onCreateReferral={handleCreateReferral}
            onViewReferralSlip={(ref) => setViewingSlipReferral(ref)}
            onOpenTeleconsult={(sess) => setActiveTeleconsultSession(sess)}
            onPreviewNotification={(ref) => setPreviewNotificationReferral(ref)}
          />
        )}

        {currentTab === 'referrals' && (
          <ReferralsList
            referrals={referrals}
            userRole={currentUser.role}
            language={language}
            onViewSlip={(ref) => setViewingSlipReferral(ref)}
            onUpdateStatus={handleUpdateReferralStatus}
            onOpenTeleconsultModal={(ref) => {
              const matchedHospital = hospitals.find((h) => h.id === ref.destinationHospitalId) || hospitals[0];
              const matchedPatient = patients.find((p) => p.id === ref.patientId) || patients[0];
              setActiveTeleconsultSession({
                patient: matchedPatient,
                hospital: matchedHospital,
                specialty: ref.triageResult.recommendedSpecialty,
              });
            }}
            onOpenNotificationModal={(ref) => setPreviewNotificationReferral(ref)}
            onOpenFeedbackModal={(ref) => setFeedbackReferral(ref)}
          />
        )}

        {currentTab === 'followups' && (
          <FollowUpModule
            referrals={referrals}
            language={language}
            onUpdateFollowUp={handleUpdateFollowUp}
          />
        )}

        {currentTab === 'mch' && (
          <MchModule
            records={mchRecords}
            language={language}
            onReferMch={(rec) => {
              setCurrentTab('triage');
            }}
            onUpdateAnc={handleUpdateAnc}
          />
        )}

        {currentTab === 'chronic' && (
          <ChronicDiseaseModule
            records={chronicRecords}
            language={language}
            onLogRefill={handleLogRefill}
          />
        )}

        {currentTab === 'medicines' && (
          <MedicineStockChecker
            hospitals={hospitals}
            patientTaluka={activePatientForPortal.taluka}
            language={language}
          />
        )}

        {currentTab === 'analytics' && (
          <DistrictAnalytics
            referrals={referrals}
            hospitals={hospitals}
            language={language}
          />
        )}

        {currentTab === 'audit' && (
          <AuditLogView logs={auditLogs} language={language} />
        )}

        {currentTab === 'patient_portal' && (
          <PatientPortalView
            patient={activePatientForPortal}
            referrals={referrals}
            language={language}
            onViewSlip={(ref) => setViewingSlipReferral(ref)}
            onOpenTeleconsult={(ref) => {
              const matchedHospital = hospitals.find((h) => h.id === ref.destinationHospitalId) || hospitals[0];
              setActiveTeleconsultSession({
                patient: activePatientForPortal,
                hospital: matchedHospital,
                specialty: ref.triageResult.recommendedSpecialty,
              });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print glass-nav border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-800">{TRANSLATIONS[language]?.footerTitle || 'AarogyaSetu Pune'}</span> · {TRANSLATIONS[language]?.footerContinuum || 'Integrated Rural Healthcare Continuum'}
            <div className="text-[11px] text-slate-400 mt-0.5">
              {TRANSLATIONS[language]?.footerDept || 'Public Health Department · Government of Maharashtra & National Health Mission (NHM)'}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setCurrentTab('audit')}
              className="hover:text-teal-700 transition cursor-pointer"
            >
              {TRANSLATIONS[language]?.footerAudit || 'DPDP Compliance & Security Audit'}
            </button>
            <span>·</span>
            <span>{TRANSLATIONS[language]?.footerHelpline || '24x7 Emergency Helpline 108'}</span>
            <span>·</span>
            <span className="text-teal-700 font-bold">{TRANSLATIONS[language]?.footerProtocol || 'NHM Clinical Protocol Certified'}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {viewingSlipReferral && (
        <DigitalReferralSlip
          referral={viewingSlipReferral}
          language={language}
          onClose={() => setViewingSlipReferral(null)}
          onSimulateScan={() => {
            handleScanReached(viewingSlipReferral.id, 'Staff Nurse Pratima (OPD Desk)');
            setViewingSlipReferral(null);
            alert(`Patient ${viewingSlipReferral.patientName} arrival marked REACHED at ${viewingSlipReferral.destinationHospitalName}!`);
          }}
        />
      )}

      {isRegisterOpen && (
        <PatientRegistrationModal
          language={language}
          onClose={() => setIsRegisterOpen(false)}
          onRegister={handleRegisterPatient}
        />
      )}

      {isQrScannerOpen && (
        <QrScannerModal
          referrals={referrals}
          language={language}
          onScanReached={handleScanReached}
          onClose={() => setIsQrScannerOpen(false)}
        />
      )}

      {previewNotificationReferral && (
        <NotificationModal
          referral={previewNotificationReferral}
          language={language}
          onClose={() => setPreviewNotificationReferral(null)}
        />
      )}

      {feedbackReferral && (
        <PatientFeedbackModal
          referral={feedbackReferral}
          language={language}
          onSubmit={handleSaveFeedback}
          onClose={() => setFeedbackReferral(null)}
        />
      )}

      {activeTeleconsultSession && (
        <TeleconsultationModal
          session={activeTeleconsultSession}
          language={language}
          onClose={() => setActiveTeleconsultSession(null)}
          onSavePrescription={(notes) => {
            if (referrals.length > 0) {
              handleUpdateReferralStatus(
                referrals[0].id,
                'UNDER_TREATMENT',
                `Teleconsultation notes: ${notes}`
              );
            }
          }}
        />
      )}

      {/* Global Search Modal across all patient records & referrals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        patients={patients}
        referrals={referrals}
        hospitals={hospitals}
        language={language}
        onSelectPatient={(p) => {
          setCurrentTab('triage');
        }}
        onSelectReferral={(ref) => {
          setViewingSlipReferral(ref);
        }}
      />

      {/* Universal Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        language={language}
        onAction={(notif) => {
          if (notif.category === 'referral') {
            setCurrentTab('referrals');
          } else if (notif.category === 'followup') {
            setCurrentTab('followups');
          } else if (notif.category === 'stock') {
            setCurrentTab('medicines');
          }
        }}
      />

      {/* Offline Sync Status Indicator Banner */}
      <OfflineBanner
        isOffline={isOffline}
        onToggleOfflineSimulation={handleToggleOfflineSimulation}
        isSimulated={isSimulatedOffline}
        language={language}
      />

      {/* Backend Health & Supabase Cloud Management Modal */}
      <BackendStatusModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        language={language}
      />
    </div>
  );
}
