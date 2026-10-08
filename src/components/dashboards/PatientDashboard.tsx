import React, { useState } from 'react';
import { Patient, Referral, Hospital, Language } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { StatCard } from '../shared/StatCard';
import { DateRangeFilter, DateRangeOption } from '../shared/DateRangeFilter';
import { DrillDownModal, DrillDownItem } from '../shared/DrillDownModal';
import {
  CreditCard,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Printer,
  Phone,
  Video,
  CheckCircle2,
  AlertCircle,
  Pill,
  Download,
  Activity,
  Heart,
  ShieldCheck,
  Star,
  Share2,
  Navigation,
  ChevronRight,
  Sparkles,
  Check,
  TrendingUp,
  Search,
  Eye,
  AlertTriangle,
  History,
  ShieldAlert,
} from 'lucide-react';

interface PatientDashboardProps {
  patient: Patient;
  referrals: Referral[];
  hospitals: Hospital[];
  language: Language;
  onViewSlip: (referral: Referral) => void;
  onOpenTeleconsult: (referral: Referral) => void;
  onOpenFeedback: (referral: Referral) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patient,
  referrals,
  hospitals,
  language,
  onViewSlip,
  onOpenTeleconsult,
  onOpenFeedback,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [dateRange, setDateRange] = useState<DateRangeOption>('today');
  const [activeDrilldownType, setActiveDrilldownType] = useState<string | null>(null);

  // Medicine checklist state ("Taken today" tick-off)
  const [medicinesTaken, setMedicinesTaken] = useState<Record<string, boolean>>({
    'Tab. Amlodipine 5mg': true,
    'Tab. Telmisartan 40mg': false,
    'Tab. Atorvastatin 20mg': false,
  });

  // PM-JAY Eligibility Checker State
  const [isCheckingScheme, setIsCheckingScheme] = useState(false);
  const [schemeResult, setSchemeResult] = useState<string | null>(null);

  // Consent manager states
  const [consentedHospitals, setConsentedHospitals] = useState<Record<string, boolean>>({
    hosp_sassoon: true,
    hosp_aundh: false,
    hosp_baramati: true,
  });

  // Reports search state
  const [reportSearchQuery, setReportSearchQuery] = useState('');

  const myReferrals = referrals.filter(
    (r) => r.patientId === patient.id || r.patientHealthId === patient.healthId
  );
  const activeReferral = myReferrals.find((r) => r.status !== 'COMPLETED') || myReferrals[0];

  const handleToggleMedicine = (name: string) => {
    setMedicinesTaken((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleCheckScheme = () => {
    setIsCheckingScheme(true);
    setTimeout(() => {
      setIsCheckingScheme(false);
      setSchemeResult(
        language === 'mr'
          ? 'आपले कुटुंब महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) आणि आयुष्मान भारत (PM-JAY) अंतर्गत ५ लाखांपर्यंतच्या मोफत उपचारास पात्र आहे.'
          : language === 'hi'
          ? 'आपका परिवार आयुष्मान भारत (PM-JAY) और महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) के तहत 5 लाख तक के मुफ्त इलाज के लिए पात्र है।'
          : 'Eligible for Ayushman Bharat (PM-JAY) & Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY). 100% cashless coverage up to ₹5,00,000 for secondary & tertiary hospitalization in empanelled hospitals.'
      );
    }, 600);
  };

  const stages: { key: Referral['status']; label: string }[] = [
    { key: 'REFERRED', label: t.statusReferred || 'Referred' },
    { key: 'REACHED', label: t.statusReached || 'Reached OPD' },
    { key: 'UNDER_TREATMENT', label: t.statusUnderTreatment || 'In Treatment' },
    { key: 'COMPLETED', label: t.statusCompleted || 'Completed' },
  ];

  const currentStageIndex = activeReferral
    ? stages.findIndex((s) => s.key === activeReferral.status)
    : 0;

  // Diagnostic Reports List
  const reportsList = [
    {
      id: 'rep_1',
      title: '12-Lead Electrocardiogram (ECG)',
      type: language === 'mr' ? 'तपासणी अहवाल' : language === 'hi' ? 'जांच रिपोर्ट' : 'Diagnostic Report',
      date: '04 Oct 2026',
      facility: 'Velhe Sub-Centre & PHC',
      doctor: 'Dr. Rajesh Shinde (MO)',
      status: language === 'mr' ? 'असामान्य (ST-T एलिव्हेशन)' : language === 'hi' ? 'असामान्य (ST-T एलिवेशन)' : 'Abnormal (ST-T Elevation)',
      badgeColor: 'rose' as const,
    },
    {
      id: 'rep_2',
      title: 'Complete Blood Count (CBC) & Fasting Sugar',
      type: language === 'mr' ? 'प्रयोगशाळा अहवाल' : language === 'hi' ? 'लैब रिपोर्ट' : 'Laboratory Pathology',
      date: '02 Oct 2026',
      facility: 'Velhe PHC Diagnostic Lab',
      doctor: 'Santosh Kamble (Lab Tech)',
      status: 'Hb: 12.8 g/dL, Sugar: 104 mg/dL',
      badgeColor: 'emerald' as const,
    },
    {
      id: 'rep_3',
      title: 'Cardiology Referral Prescription',
      type: language === 'mr' ? 'डॉक्टर प्रिस्क्रिप्शन' : language === 'hi' ? 'डॉक्टर का पर्चा' : 'Prescription Slip',
      date: '04 Oct 2026',
      facility: 'Sassoon General Hospital OPD',
      doctor: 'Dr. Anil Kulkarni (Cardiologist)',
      status: language === 'mr' ? 'सक्रिय उपचार' : language === 'hi' ? 'सक्रिय दवाएं' : 'Active Regimen',
      badgeColor: 'teal' as const,
    },
  ];

  const filteredReports = reportsList.filter((r) =>
    r.title.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
    r.doctor.toLowerCase().includes(reportSearchQuery.toLowerCase())
  );

  // Drilldown items generator
  const getDrillDownItems = (): DrillDownItem[] => {
    switch (activeDrilldownType) {
      case 'referrals':
        return myReferrals.map((ref) => ({
          id: ref.id,
          title: `${ref.destinationHospitalName} - ${ref.triageResult.recommendedSpecialty}`,
          subtitle: `Voucher #${ref.referralNumber} · Slot: ${ref.appointmentDate} (${ref.appointmentSlot})`,
          badge: ref.status,
          badgeColor: ref.status === 'COMPLETED' ? 'emerald' : ref.status === 'REFERRED' ? 'amber' : 'teal',
          date: ref.appointmentDate,
          detail: `Clinical Assessment: ${ref.triageResult.clinicalJustification}`,
          actionLabel: t.viewVoucher || 'View Digital Slip',
          onAction: () => onViewSlip(ref),
        }));
      case 'appointments':
        return [
          {
            id: 'apt_1',
            title: language === 'mr' ? 'हृदयरोग ओपीडी तपासणी' : language === 'hi' ? 'हृदय रोग ओपीडी जांच' : 'Cardiology OPD Consultation',
            subtitle: 'Sassoon General Hospital · Dr. Anil Kulkarni',
            badge: '12 Oct 2026, 10:30 AM',
            badgeColor: 'sky',
            date: '12 Oct 2026',
            detail:
              language === 'mr'
                ? 'ओपीडी कक्ष १४. कृपया मागील ईसीजी आणि रक्तदाब नोंदी सोबत आणा.'
                : language === 'hi'
                ? 'ओपीडी कक्ष १४. कृपया पिछली ईसीजी और रक्तचाप रिकॉर्ड साथ लाएं।'
                : 'OPD Room 14. Please carry previous ECG & BP records.',
            actionLabel: t.viewDetails || 'View Details',
            onAction: () => {
              if (activeReferral) onViewSlip(activeReferral);
            },
          },
          {
            id: 'apt_2',
            title: language === 'mr' ? 'टेलिकन्सल्टेशन व्हर्च्युअल कक्ष' : language === 'hi' ? 'टेलीपरामर्श वर्चुअल कक्ष' : 'Teleconsultation Review Booth',
            subtitle: 'Velhe Sub-Centre Tele-clinic',
            badge: language === 'mr' ? 'सामील होण्यास तयार' : language === 'hi' ? 'जुड़ने के लिए तैयार' : 'Ready to Join',
            badgeColor: 'teal',
            date: language === 'mr' ? 'उद्या, सकाळी ११:००' : language === 'hi' ? 'कल, सुबह ११:००' : 'Tomorrow, 11:00 AM',
            detail:
              language === 'mr'
                ? 'ससूनच्या वरिष्ठ डॉक्टरांशी व्हर्च्युअल सल्लामसलत.'
                : language === 'hi'
                ? 'ससून के वरिष्ठ डॉक्टर के साथ वर्चुअल परामर्श।'
                : 'Virtual consultation with Sassoon Senior Resident.',
            actionLabel: t.joinTeleconsult || 'Join Teleconsult',
            onAction: () => {
              if (activeReferral) onOpenTeleconsult(activeReferral);
            },
          },
        ];
      case 'reports':
        return reportsList.map((rep) => ({
          id: rep.id,
          title: rep.title,
          subtitle: `${rep.type} · ${rep.facility}`,
          badge: rep.status,
          badgeColor: rep.badgeColor,
          date: rep.date,
          detail: `Ordered by ${rep.doctor}`,
          actionLabel: t.downloadPdf || 'Download PDF',
          onAction: () => alert(`Downloading verified report: ${rep.title}`),
        }));
      case 'medicines':
        return [
          {
            id: 'med_1',
            title: 'Tab. Amlodipine 5mg',
            subtitle: 'Calcium channel blocker · 1 Tablet OD (Morning)',
            badge: medicinesTaken['Tab. Amlodipine 5mg'] ? (t.takenToday || 'Taken Today') : (t.pendingPill || 'Pending'),
            badgeColor: medicinesTaken['Tab. Amlodipine 5mg'] ? 'emerald' : 'amber',
            detail: 'For blood pressure control. Prescribed by Sassoon Cardiology.',
          },
          {
            id: 'med_2',
            title: 'Tab. Telmisartan 40mg',
            subtitle: 'ARB Antihypertensive · 1 Tablet OD (Evening)',
            badge: medicinesTaken['Tab. Telmisartan 40mg'] ? (t.takenToday || 'Taken Today') : (t.pendingPill || 'Pending'),
            badgeColor: medicinesTaken['Tab. Telmisartan 40mg'] ? 'emerald' : 'amber',
            detail: 'Continue for 30 days. Weekly BP check by ASHA worker.',
          },
          {
            id: 'med_3',
            title: 'Tab. Atorvastatin 20mg',
            subtitle: 'Lipid lowering agent · 1 Tablet HS (Night)',
            badge: medicinesTaken['Tab. Atorvastatin 20mg'] ? (t.takenToday || 'Taken Today') : (t.pendingPill || 'Pending'),
            badgeColor: medicinesTaken['Tab. Atorvastatin 20mg'] ? 'emerald' : 'amber',
            detail: 'Refill available free of charge at Velhe PHC dispensary.',
          },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6" lang={language}>
      {/* High-Priority Alert Banner if Action Required */}
      <div className="p-3.5 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl border border-teal-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/30 border border-teal-400/50 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 text-teal-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                {language === 'mr'
                  ? 'सक्रिय संदर्भ सेवा: ससून सर्वोपचार रुग्णालय पुणे'
                  : language === 'hi'
                  ? 'सक्रिय रेफरल: ससून जनरल अस्पताल पुणे'
                  : 'Active Referral Underway: Sassoon General Hospital'}
              </span>
              <span className="text-[9px] uppercase font-extrabold bg-teal-400/30 text-teal-200 px-2 py-0.5 rounded border border-teal-400/30">
                {language === 'mr' ? 'हृदयरोग स्लॉट आरक्षित' : language === 'hi' ? 'हृदय रोग स्लॉट आरक्षित' : 'Cardiology Slot Reserved'}
              </span>
            </div>
            <p className="text-[11px] text-teal-100/90 mt-0.5">
              {language === 'mr'
                ? 'अपॉइंटमेंट: १२ ऑक्टोबर २०२६, स. १०:३० वाजता डॉ. अनिल कुलकर्णी यांच्याकडे. १२-लीड ईसीजी आपल्या आरोग्य आयडीशी जोडलेला आहे.'
                : language === 'hi'
                ? 'अपॉइंटमेंट: 12 अक्टूबर 2026, सुबह 10:30 बजे डॉ. अनिल कुलकर्णी के साथ। 12-लीड ईसीजी आपके स्वास्थ्य आईडी से जुड़ा है।'
                : 'Appointment on 12 Oct 2026, 10:30 AM with Dr. Anil Kulkarni. 12-lead ECG is linked to your Health ID.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {activeReferral && (
            <button
              type="button"
              onClick={() => onViewSlip(activeReferral)}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
            >
              {t.viewVoucher || 'View Voucher'}
            </button>
          )}
        </div>
      </div>

      {/* Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t.greetingNamaskar}, {patient.name}
            </h1>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
              {t.roleBadgePatient}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.patientPortalSubtitle}
          </p>
        </div>

        <DateRangeFilter
          selectedRange={dateRange}
          onChangeRange={(r) => setDateRange(r)}
          lastUpdated="03:40 PM"
          language={language}
        />
      </div>

      {/* Top Row: 4 Summary Stat Cards with Clickable Drilldown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label={t.activeReferrals}
          value={myReferrals.filter((r) => r.status !== 'COMPLETED').length || 1}
          icon={<FileText className="w-4 h-4 text-teal-700" />}
          color="teal"
          trend={{ value: '1 In Progress', isPositive: true }}
          badge={t.viewDetails}
          onClick={() => setActiveDrilldownType('referrals')}
        />
        <StatCard
          label={t.upcomingAppointments}
          value="1"
          icon={<Calendar className="w-4 h-4 text-sky-700" />}
          color="sky"
          trend={{ value: '12 Oct 2026', isPositive: true }}
          badge="Cardiology OPD"
          onClick={() => setActiveDrilldownType('appointments')}
        />
        <StatCard
          label={t.diagnosticReports}
          value={reportsList.length}
          icon={<Activity className="w-4 h-4 text-indigo-700" />}
          color="indigo"
          trend={{ value: '100% Verified', isPositive: true }}
          badge="ECG & Labs"
          onClick={() => setActiveDrilldownType('reports')}
        />
        <StatCard
          label={t.currentMedicines}
          value="3"
          icon={<Pill className="w-4 h-4 text-emerald-700" />}
          color="emerald"
          trend={{ value: 'Daily', isPositive: true }}
          badge="BP Daily Regimen"
          onClick={() => setActiveDrilldownType('medicines')}
        />
      </div>

      {/* Main Grid: Digital Health ID & Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Health ID Card, Active Referral Stepper, Reports, Visit History */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Greeting Card with Health ID, QR & Download */}
          <div className="glass-card-dark bg-gradient-to-br from-teal-900 via-slate-900 to-cyan-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden border border-white/15">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-teal-600/90 text-white px-2 py-0.5 rounded">
                    {t.govtDept}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{patient.name}</h2>
                  <div className="text-xs text-teal-100 flex items-center gap-2 mt-0.5">
                    <span>
                      {patient.age} {language === 'mr' ? 'वर्षे' : language === 'hi' ? 'वर्ष' : 'Yrs'} ·{' '}
                      {patient.gender === 'MALE'
                        ? language === 'mr'
                          ? 'पुरुष'
                          : language === 'hi'
                          ? 'पुरुष'
                          : 'Male'
                        : patient.gender === 'FEMALE'
                        ? language === 'mr'
                          ? 'महिला'
                          : language === 'hi'
                          ? 'महिला'
                          : 'Female'
                        : patient.gender}
                    </span>
                    <span>•</span>
                    <span>
                      {language === 'mr' ? 'रक्त गट' : language === 'hi' ? 'रक्त समूह' : 'Blood Group'}:{' '}
                      <strong className="text-white font-mono">{patient.bloodGroup || 'B+'}</strong>
                    </span>
                  </div>
                </div>

                {/* Health Summary: Blood group, allergies, chronic conditions, current medicines */}
                <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-1.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase text-teal-300 font-bold block">{t.chronicConditions}</span>
                      <span className="font-semibold text-white">Hypertension (Stage 2), Dyslipidemia</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-rose-300 font-bold block">{t.knownAllergies}</span>
                      <span className="font-semibold text-rose-100">Penicillin (Mild Rash)</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-teal-300 font-bold block">{t.currentMedicines}</span>
                    <span className="text-teal-100">Tab. Amlodipine 5mg, Tab. Telmisartan 40mg, Tab. Atorvastatin 20mg</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] uppercase text-teal-300 block">{t.puneHealthId}</span>
                    <span className="font-mono text-base font-bold text-white tracking-wider">
                      {patient.healthId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-teal-300 block">{t.linkedAbha}</span>
                    <span className="font-mono text-xs font-semibold text-teal-100">
                      {patient.abhaNumber || '91-4521-8932-1104'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => alert(`Downloading official digital health passport for ${patient.name} (${patient.healthId})`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadCard}</span>
                  </button>
                  <span className="text-xs text-teal-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{patient.village}, Taluka {patient.taluka}</span>
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white p-3 rounded-2xl shadow-lg text-slate-900 flex flex-col items-center justify-center shrink-0 self-start sm:self-auto border border-white/60">
                <div className="w-24 h-24 mb-1">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                    <rect x="5" y="5" width="30" height="30" fill="currentColor" />
                    <rect x="10" y="10" width="20" height="20" fill="white" />
                    <rect x="15" y="15" width="10" height="10" fill="currentColor" />
                    <rect x="65" y="5" width="30" height="30" fill="currentColor" />
                    <rect x="70" y="10" width="20" height="20" fill="white" />
                    <rect x="75" y="15" width="10" height="10" fill="currentColor" />
                    <rect x="5" y="65" width="30" height="30" fill="currentColor" />
                    <rect x="10" y="70" width="20" height="20" fill="white" />
                    <rect x="15" y="75" width="10" height="10" fill="currentColor" />
                    <rect x="42" y="10" width="8" height="8" fill="currentColor" />
                    <rect x="42" y="25" width="12" height="10" fill="currentColor" />
                    <rect x="10" y="42" width="12" height="10" fill="currentColor" />
                    <rect x="25" y="45" width="8" height="8" fill="currentColor" />
                    <rect x="42" y="42" width="16" height="16" fill="currentColor" />
                    <rect x="65" y="42" width="10" height="10" fill="currentColor" />
                    <rect x="80" y="42" width="12" height="14" fill="currentColor" />
                    <rect x="42" y="65" width="14" height="12" fill="currentColor" />
                    <rect x="60" y="65" width="14" height="14" fill="currentColor" />
                    <rect x="78" y="70" width="14" height="18" fill="currentColor" />
                  </svg>
                </div>
                <span className="font-mono text-[9px] font-bold text-slate-700">{t.scanAtHospital}</span>
              </div>
            </div>
          </div>

          {/* 2. Active Referral Tracker (Visual Stepper) */}
          {activeReferral && (
            <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {t.liveReferralJourney}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {activeReferral.destinationHospitalName}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    Voucher #{activeReferral.referralNumber} · Dept: {activeReferral.triageResult.recommendedSpecialty}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onViewSlip(activeReferral)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.printVoucher}</span>
                </button>
              </div>

              {/* Visual Stepper */}
              <div className="pt-2 pb-1">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                  {stages.map((stage, idx) => {
                    const isDone = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    return (
                      <div key={stage.key} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                            isCurrent
                              ? 'bg-teal-600 text-white ring-4 ring-teal-100 shadow-md'
                              : isDone
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-[11px] font-semibold mt-1.5 text-center ${
                            isCurrent ? 'text-teal-900 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{t.appointmentSlot}</span>
                  <div className="font-bold text-teal-900 mt-0.5">
                    {activeReferral.appointmentDate} ({activeReferral.appointmentSlot})
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{t.referringCentre}</span>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {activeReferral.referringFacility} · {activeReferral.referringHealthWorker}
                  </div>
                </div>
              </div>

              {/* Rate Experience Prompt after Completed Treatment */}
              {activeReferral.status === 'COMPLETED' ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                  <span>
                    {language === 'mr'
                      ? `${activeReferral.destinationHospitalName} येथील आपला अनुभव कसा होता?`
                      : language === 'hi'
                      ? `${activeReferral.destinationHospitalName} में आपका अनुभव कैसा रहा?`
                      : `How was your experience at ${activeReferral.destinationHospitalName}?`}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenFeedback(activeReferral)}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    {t.rateExperience}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-950">
                  <span>
                    {language === 'mr'
                      ? 'उपचार सुरू आहेत. डिस्चार्ज मिळाल्यावर आपण अभिप्राय नोंदवू शकता.'
                      : language === 'hi'
                      ? 'उपचार जारी है। डिस्चार्ज मिलने पर आप फीडबैक दर्ज कर सकते हैं।'
                      : 'Treatment in progress. You can submit feedback upon discharge.'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenFeedback(activeReferral)}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                  >
                    {t.rateNow}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. Upcoming Appointments & Teleconsultation */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>{t.upcomingAndTeleconsult}</span>
              </h3>
              <span className="text-xs text-sky-700 font-bold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                1 {language === 'mr' ? 'निश्चित' : language === 'hi' ? 'पुष्ट' : 'Confirmed'}
              </span>
            </div>

            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded">
                  {t.teleconsultLinkReady}
                </span>
                <h4 className="text-sm font-bold text-slate-900">Dr. Anil Kulkarni (Cardiology)</h4>
                <p className="text-xs text-slate-600">
                  {language === 'mr'
                    ? '१२-लीड ईसीजी आणि रक्तदाबाची पाठपुरावा तपासणी'
                    : language === 'hi'
                    ? '१२-लीड ईसीजी और रक्तचाप का फॉलो-अप परीक्षण'
                    : 'Follow-up review of 12-lead ECG and blood pressure trend'}
                </p>
                <div className="text-[11px] text-sky-700 font-medium flex items-center gap-2 pt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {language === 'mr'
                      ? 'सुरू होईल: २ दिवसांत, स. १०:३० वाजता'
                      : language === 'hi'
                      ? 'शुरू होगा: २ दिनों में, सुबह १०:३० बजे'
                      : 'Starts in 2 days, 10:30 AM'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (activeReferral) onOpenTeleconsult(activeReferral);
                }}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
              >
                <Video className="w-4 h-4" />
                <span>{t.joinTeleconsult}</span>
              </button>
            </div>
          </div>

          {/* 4. My Reports and Prescriptions: Searchable List */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>{t.myReportsTitle}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t.myReportsSub}
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  placeholder={
                    language === 'mr'
                      ? 'अहवाल किंवा डॉक्टर शोधा...'
                      : language === 'hi'
                      ? 'रिपोर्ट या डॉक्टर खोजें...'
                      : 'Search reports or doctors...'
                  }
                  className="glass-input w-full pl-8 pr-3 py-1.5 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 hover:border-teal-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{report.title}</span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          report.badgeColor === 'rose'
                            ? 'bg-rose-100 text-rose-800'
                            : report.badgeColor === 'emerald'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {report.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {report.facility} · <strong>{report.doctor}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">{report.status}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => alert(`Viewing ${report.title} for ${patient.name}`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.viewDetails}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading signed PDF: ${report.title}`)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloadPdf}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Visit History Timeline across all facilities */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              <span>{t.visitHistoryTitle}</span>
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white shadow-xs" />
                <div className="font-bold text-xs text-slate-900">04 Oct 2026 · Velhe Primary Health Centre (PHC)</div>
                <div className="text-[11px] text-slate-600">
                  {language === 'mr'
                    ? 'छातीतील तीव्र वेदनेसाठी ओपीडी भेट. १२-लीड ईसीजी चाचणी; ससून रुग्णालयासाठी तात्काळ रेफरल.'
                    : language === 'hi'
                    ? 'सीने में असहजता के लिए ओपीडी परामर्श। १२-लीड ईसीजी की गई; ससून अस्पताल के लिए तत्काल रेफरल तैयार किया।'
                    : 'OPD Visit for severe chest discomfort. 12-lead ECG performed; urgent referral created for Sassoon Cardiology.'}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white shadow-xs" />
                <div className="font-bold text-xs text-slate-900">22 Sep 2026 · Velhe Sub-Centre (ASHA Home Visit)</div>
                <div className="text-[11px] text-slate-600">
                  {language === 'mr'
                    ? 'सुनिता जाधव (आशा) यांच्याकडून रक्तदाब तपासणी (१६४/९८). ॲम्लोडिपिन गोळ्यांचे वाटप.'
                    : language === 'hi'
                    ? 'सुनीता जाधव (आशा) द्वारा रक्तचाप जांच (१६४/९८)। एम्लोडिपिन दवा वितरण; डॉक्टर से परामर्श की सलाह दी।'
                    : 'Sunita Jadhav (ASHA) checked BP (164/98 mmHg). Tab. Amlodipine refill verified; recommended doctor consult.'}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white shadow-xs" />
                <div className="font-bold text-xs text-slate-900">10 Aug 2026 · Bhor Sub-District Hospital</div>
                <div className="text-[11px] text-slate-600">
                  {language === 'mr'
                    ? 'वार्षिक उच्च रक्तदाब तपासणी व लिपिड प्रोफाईल चाचणी.'
                    : language === 'hi'
                    ? 'वार्षिक उच्च रक्तचाप जांच व लिपिड प्रोफाइल परीक्षण। प्रिस्क्रिप्शन नवीनीकृत।'
                    : 'Annual hypertension check-up and lipid panel testing. Prescriptions renewed.'}
                </div>
              </div>
            </div>
          </div>

          {/* 6. Vitals Trend Log (BP, Sugar, Weight) */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>{t.vitalsTrendTitle}</span>
              </h3>
              <span className="text-[11px] text-slate-400">Last 3 Field Visits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/70 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.bloodPressure}</span>
                <div className="font-mono text-lg font-bold text-slate-900 mt-0.5">138 / 86 <span className="text-xs font-normal text-slate-500">mmHg</span></div>
                <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 rotate-180" /> Improved from 188/104
                </div>
              </div>

              <div className="p-3 bg-white/70 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.fastingSugar}</span>
                <div className="font-mono text-lg font-bold text-slate-900 mt-0.5">104 <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
                <div className="text-[10px] text-emerald-700 font-medium mt-1">Normal Range (&lt;110)</div>
              </div>

              <div className="p-3 bg-white/70 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.weightAndPulse}</span>
                <div className="font-mono text-lg font-bold text-slate-900 mt-0.5">68 <span className="text-xs font-normal text-slate-500">kg</span> · 74 <span className="text-xs font-normal text-slate-500">bpm</span></div>
                <div className="text-[10px] text-slate-500 mt-1">SpO2: 98% on room air</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Medicine Schedule, Emergency Card, Facilities & Consent */}
        <div className="space-y-6">
          {/* Emergency 108 Card */}
          <div className="glass-card bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-3xl p-5 shadow-lg space-y-3 border border-red-500">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-white animate-pulse" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider">{t.emergencyCardTitle}</h3>
            </div>
            <p className="text-xs text-red-100 leading-relaxed">
              {t.emergencyCardDesc}
            </p>
            <div className="space-y-2 pt-1">
              <a
                href="tel:108"
                className="w-full py-2.5 bg-white text-red-700 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer hover:bg-red-50 transition"
              >
                <span>{t.call108Ambulance}</span>
              </a>
              <div className="p-2 bg-red-700/60 rounded-xl border border-red-400/40 text-[11px] text-red-100 space-y-1">
                <div className="flex justify-between">
                  <span>{t.savedEmergencyContact}:</span>
                  <strong className="text-white">Pravin Patil: 9822104999</strong>
                </div>
                <div className="flex justify-between">
                  <span>{t.nearestHospital}:</span>
                  <strong className="text-white">Sassoon General (14 km)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Medicine Schedule with "Taken Today" Tick-Off */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>{t.medicineScheduleTitle}</span>
              </h3>
              <span className="text-[10px] text-teal-700 font-bold">{t.dailyRoutine}</span>
            </div>

            <div className="space-y-2">
              {Object.entries(medicinesTaken).map(([med, taken]) => (
                <button
                  key={med}
                  type="button"
                  onClick={() => handleToggleMedicine(med)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                    taken
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-white/80 border-slate-200 text-slate-700 hover:border-teal-300'
                  }`}
                >
                  <div>
                    <div className={`font-bold ${taken ? 'line-through opacity-70' : ''}`}>{med}</div>
                    <div className="text-[10px] text-slate-400">1 Tablet · Daily adherence</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-xs ${
                      taken ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                    }`}
                  >
                    {taken && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nearby Facilities Status */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>{t.nearbyFacilitiesTitle}</span>
            </h3>

            <div className="space-y-2 text-xs">
              {hospitals.slice(0, 2).map((h) => (
                <div key={h.id} className="p-3 bg-white/70 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-slate-900 text-xs truncate">{h.name}</span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                      {t.openNow}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{h.type} · {h.phone}</div>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${h.phone}`}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-slate-600" /> {t.call}
                    </a>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(h.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3 text-teal-600" /> {t.directions}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consent Manager: Grant / Revoke Access with Access Log */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-teal-600" />
              <span>{t.consentManagerTitle}</span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              {t.consentManagerDesc}
            </p>

            <div className="space-y-2 text-xs">
              {[
                { id: 'hosp_sassoon', name: 'Sassoon General Hospital' },
                { id: 'hosp_baramati', name: 'Sub-District Hospital Baramati' },
              ].map((fac) => (
                <div key={fac.id} className="flex items-center justify-between p-2 bg-white/70 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">{fac.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setConsentedHospitals((prev) => ({
                        ...prev,
                        [fac.id]: !prev[fac.id],
                      }))
                    }
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md cursor-pointer ${
                      consentedHospitals[fac.id]
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {consentedHospitals[fac.id] ? t.accessGranted : t.accessRevoked}
                  </button>
                </div>
              ))}
            </div>

            {/* Access Log */}
            <div className="pt-1 border-t border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">{t.recentAccessLog}</span>
              <div className="text-[10px] text-slate-500 space-y-0.5">
                <div>• Sassoon OPD desk accessed ECG on 04 Oct 2026, 11:15 AM</div>
                <div>• Velhe PHC accessed Labs on 04 Oct 2026, 09:30 AM</div>
              </div>
            </div>
          </div>

          {/* Scheme Information & Ayushman Bharat Checker */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-teal-200/80 bg-gradient-to-br from-teal-50/70 to-white/90 space-y-2">
            <h3 className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>{t.healthSchemesTitle}</span>
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {t.healthSchemesDesc}
            </p>

            {schemeResult ? (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
                {schemeResult}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCheckScheme}
                disabled={isCheckingScheme}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
              >
                {isCheckingScheme ? t.checkingScheme : t.checkSchemeBtn}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DrillDown Modal */}
      <DrillDownModal
        isOpen={Boolean(activeDrilldownType)}
        onClose={() => setActiveDrilldownType(null)}
        title={
          activeDrilldownType === 'referrals'
            ? t.activeReferrals
            : activeDrilldownType === 'appointments'
            ? t.upcomingAppointments
            : activeDrilldownType === 'reports'
            ? t.diagnosticReports
            : t.currentMedicines
        }
        category={t.navPatientPortal}
        items={getDrillDownItems()}
        language={language}
      />
    </div>
  );
};
