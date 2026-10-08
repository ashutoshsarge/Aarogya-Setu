import React, { useState } from 'react';
import { Patient, Referral, MchRecord, ChronicRecord, Language } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { StatCard } from '../shared/StatCard';
import { DateRangeFilter, DateRangeOption } from '../shared/DateRangeFilter';
import { DrillDownModal, DrillDownItem } from '../shared/DrillDownModal';
import {
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  Phone,
  CheckCircle2,
  Calendar,
  Baby,
  Pill,
  Send,
  Wifi,
  Sparkles,
  Search,
  Filter,
  ShieldAlert,
  Award,
  ChevronRight,
  Activity,
  PlusCircle,
  Home,
  UserPlus,
  AlertCircle,
  Syringe,
  HeartHandshake,
} from 'lucide-react';

interface HealthWorkerDashboardProps {
  patients: Patient[];
  referrals: Referral[];
  mchRecords: MchRecord[];
  chronicRecords: ChronicRecord[];
  language: Language;
  onOpenTriage: () => void;
  onOpenRegister: () => void;
  onViewSlip: (referral: Referral) => void;
  onNavigateTab: (tab: string) => void;
}

export const HealthWorkerDashboard: React.FC<HealthWorkerDashboardProps> = ({
  patients,
  referrals,
  mchRecords,
  chronicRecords,
  language,
  onOpenTriage,
  onOpenRegister,
  onViewSlip,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [dateRange, setDateRange] = useState<DateRangeOption>('today');
  const [activeDrilldownType, setActiveDrilldownType] = useState<string | null>(null);

  // Village registry filter states
  const [filterVillage, setFilterVillage] = useState<string>('All');
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('All');
  const [filterCondition, setFilterCondition] = useState<string>('All');
  const [registrySearch, setRegistrySearch] = useState<string>('');

  // Household survey state
  const [householdId, setHouseholdId] = useState('HH-VELHE-042');
  const [newFamilyMember, setNewFamilyMember] = useState('');

  // Supply request state
  const [supplySent, setSupplySent] = useState(false);

  // High-priority cases count
  const highPriorityCases = referrals.filter(
    (r) => r.triageResult.level === 'HIGH' && r.status !== 'COMPLETED'
  );
  const inTransitReferrals = referrals.filter((r) => r.status === 'REFERRED');
  const overdueFollowUps = referrals.filter(
    (r) => r.followUpStatus === 'MISSED_ALERT' || r.status === 'REFERRED'
  );

  // Priority "Visit Today" list sorted by urgency
  const visitTodayList = [
    {
      id: 'vis_1',
      patientName: 'Ramesh Patil',
      age: 54,
      condition: language === 'mr' ? 'उच्च रक्तदाब फॉलो-अप (४८ तास उलटले)' : language === 'hi' ? 'उच्च रक्तचाप फॉलो-अप (48 घंटे बीते)' : 'Hypertension Follow-Up (Overdue 48h)',
      urgency: 'CRITICAL' as const,
      village: 'Velhe',
      action: language === 'mr' ? 'ससून रुग्णालयातील उपस्थिती व रक्तदाब तपासणी' : 'Verify arrival at Sassoon Hospital & monitor systolic BP',
      phone: '9822104523',
    },
    {
      id: 'vis_2',
      patientName: 'Savita Eknath Shinde',
      age: 26,
      condition: language === 'mr' ? 'अति-जोखमीची गरोदर माता (३२ आठवडे, प्री-एक्लॅम्प्सिया)' : language === 'hi' ? 'उच्च जोखिम गर्भवती (32 सप्ताह, प्री-एक्लेम्पसिया)' : 'High-Risk Pregnancy (32w Preeclampsia)',
      urgency: 'HIGH' as const,
      village: 'Velhe',
      action:
        language === 'mr'
          ? 'रक्तदाब, लघवी अल्ब्युमिन तपासणी व आयएफए वाटप'
          : language === 'hi'
          ? 'रक्तचाप, मूत्र एल्बुमिन जांच व आईएफए वितरण'
          : 'Check BP, urine albumin & dispense Calcium/IFA stock',
      phone: '9765412390',
    },
    {
      id: 'vis_3',
      patientName: 'Tukaram Jadhav',
      age: 62,
      condition: language === 'mr' ? 'मधुमेह टाइप-२ व पायाची जखम तपासणी' : language === 'hi' ? 'डायबिटीज टाइप-2 व पैर का घाव जांच' : 'Type 2 Diabetes & Foot Ulcer Check',
      urgency: 'MEDIUM' as const,
      village: 'Velhe',
      action:
        language === 'mr'
          ? 'मेटफॉर्मिन औषध वाटप व ग्लुकोमीटरने साखर तपासणी'
          : language === 'hi'
          ? 'मेटफॉर्मिन दवा वितरण व ग्लूकोमीटर से शुगर जांच'
          : 'Metformin refill & fasting blood sugar glucometer test',
      phone: '9822104521',
    },
    {
      id: 'vis_4',
      patientName: 'Kavita More (Infant Aarav)',
      age: 23,
      condition: language === 'mr' ? 'बाल लसीकरण (पेंटाव्हॅलेंट-३ बाकी)' : language === 'hi' ? 'बाल टीकाकरण (पेंटावेलेंट-3 देय)' : 'Child Immunisation (Pentavalent-3 Due)',
      urgency: 'MEDIUM' as const,
      village: 'Velhe',
      action:
        language === 'mr'
          ? 'प्रा.आ. केंद्र लसीकरण सत्र वेळ पडताळणी'
          : language === 'hi'
          ? 'प्राथमिक स्वास्थ्य केंद्र टीकाकरण सत्र समय पुष्टि'
          : 'Confirm PHC immunization session timing & growth chart',
      phone: '9822104529',
    },
  ];

  // Immunisation Due List
  const immunisationList = [
    { id: 'imm_1', childName: 'Aarav More', motherName: 'Kavita More', age: '14 Weeks', vaccine: 'Pentavalent-3 + OPV-3 + Rota-3', dueDate: language === 'mr' ? 'आज' : language === 'hi' ? 'आज' : 'Today', village: 'Velhe' },
    { id: 'imm_2', childName: 'Ananya Patil', motherName: 'Sunita Patil', age: '9 Months', vaccine: 'Measles-Rubella (MR-1) + Vit A', dueDate: '08 Oct 2026', village: 'Velhe' },
    { id: 'imm_3', childName: 'Sarthak Shinde', motherName: 'Pooja Shinde', age: '6 Weeks', vaccine: 'Pentavalent-1 + OPV-1 + IPV-1', dueDate: '11 Oct 2026', village: 'Pasure' },
  ];

  // High-Risk Tracker
  const highRiskTracker = [
    { id: 'hr_1', name: 'Savita Shinde (26)', category: language === 'mr' ? 'अति-जोखमीची गरोदर माता' : language === 'hi' ? 'उच्च जोखिम गर्भवती' : 'High-Risk Pregnancy', details: '32w Gestation · Severe Pre-eclampsia · BP 154/98', village: 'Velhe', priority: 'CRITICAL' },
    { id: 'hr_2', name: 'Baby of Geeta (2w)', category: language === 'mr' ? 'कमी वजनाचे नवजात बालक' : language === 'hi' ? 'कम वजन वाला नवजात' : 'Low Birth Weight Newborn', details: 'Birth weight 1.9 kg · Kangaroo Mother Care (KMC)', village: 'Velhe', priority: 'HIGH' },
    { id: 'hr_3', name: 'Vimalabai Bhor (78)', category: language === 'mr' ? 'एकटे राहणारे वृद्ध नागरिक' : language === 'hi' ? 'अकेले रहने वाले वरिष्ठ' : 'Elderly Living Alone', details: 'Severe osteoarthritis · Chronic hypertension', village: 'Kelawade', priority: 'MEDIUM' },
    { id: 'hr_4', name: 'Rohan Gaikwad (3y)', category: language === 'mr' ? 'तीव्र कुपोषित बालक (SAM)' : language === 'hi' ? 'गंभीर कुपोषित बच्चा (SAM)' : 'Severe Acute Malnutrition (SAM)', details: 'MUAC < 11.5 cm · Referred to NRC Baramati', village: 'Velhe', priority: 'HIGH' },
  ];

  // Filtered Patient Registry
  const filteredPatients = patients.filter((p) => {
    if (filterVillage !== 'All' && p.village !== filterVillage) return false;
    if (filterAgeGroup === 'pediatric' && p.age > 14) return false;
    if (filterAgeGroup === 'adult' && (p.age < 15 || p.age > 59)) return false;
    if (filterAgeGroup === 'geriatric' && p.age < 60) return false;
    const conditions = p.existingConditions || p.chronicDiseases || [];
    if (filterCondition === 'hypertension' && !conditions.some((d: string) => d.toLowerCase().includes('hyper'))) return false;
    if (filterCondition === 'diabetes' && !conditions.some((d: string) => d.toLowerCase().includes('diab'))) return false;
    if (registrySearch) {
      const q = registrySearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.healthId.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Drilldown items generator
  const getDrillDownItems = (): DrillDownItem[] => {
    switch (activeDrilldownType) {
      case 'seen_today':
        return patients.map((p) => {
          const conditions = p.existingConditions || p.chronicDiseases || [];
          return {
            id: p.id,
            title: `${p.name} (${p.age}y, ${p.gender})`,
            subtitle: `Health ID: ${p.healthId} · Village: ${p.village}`,
            badge: conditions.length > 0 ? conditions[0] : (language === 'mr' ? 'सामान्य ओपीडी' : 'General OPD'),
            badgeColor: 'teal',
            date: 'Triage 04 Oct 2026',
            detail: `Vitals BP: ${p.vitals?.bloodPressure || '120/80'} · Emergency Contact: ${p.emergencyContact || 'Family'}`,
            actionLabel: t.actionStartTriage || 'Open Triage',
            onAction: onOpenTriage,
          };
        });
      case 'pending_followups':
        return overdueFollowUps.map((ref) => ({
          id: ref.id,
          title: `${ref.patientName} (${ref.patientAge}y)`,
          subtitle: `Referred to ${ref.destinationHospitalName} · Health ID: ${ref.patientHealthId}`,
          badge: ref.followUpStatus === 'MISSED_ALERT' ? 'MISSED ALERT' : 'PENDING VISIT',
          badgeColor: 'amber',
          detail: `Diagnosis: ${ref.triageResult.clinicalJustification}. Needs ASHA in-person verification.`,
          actionLabel: t.actionLogVisit || 'Log Home Visit',
          onAction: () => onNavigateTab('followups'),
        }));
      case 'high_priority':
        return highPriorityCases.map((ref) => ({
          id: ref.id,
          title: `${ref.patientName} - HIGH PRIORITY`,
          subtitle: `Specialty: ${ref.triageResult.recommendedSpecialty} · ${ref.destinationHospitalName}`,
          badge: 'SCORE 5/5',
          badgeColor: 'rose',
          detail: `Red Flag: ${ref.triageResult.clinicalJustification}. Destination SLA must be verified.`,
          actionLabel: t.viewVoucher || 'View Voucher',
          onAction: () => onViewSlip(ref),
        }));
      case 'in_transit':
        return inTransitReferrals.map((ref) => ({
          id: ref.id,
          title: `${ref.patientName} (En Route)`,
          subtitle: `Destination: ${ref.destinationHospitalName} · Mobile: ${ref.patientMobile}`,
          badge: 'TRANSIT',
          badgeColor: 'sky',
          detail: `Slot: ${ref.appointmentDate} (${ref.appointmentSlot}). Awaiting OPD barcode scan.`,
          actionLabel: t.callPatient || 'Call Patient',
          onAction: () => alert(`Calling patient ${ref.patientName} at ${ref.patientMobile}`),
        }));
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6" lang={language}>
      {/* High-Priority Alert Banner: Did-Not-Reach & Outbreak Alert */}
      <div className="p-3.5 bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 text-white rounded-2xl border border-rose-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                {language === 'mr'
                  ? 'तातडीची कार्यवाही: रुग्ण रमेश पाटील ससून सर्वोपचार रुग्णालयात पोहोचलेले नाहीत'
                  : language === 'hi'
                  ? 'तत्काल कार्रवाई: मरीज़ रमेश पाटिल ससून अस्पताल नहीं पहुंचे'
                  : 'Urgent Action: Patient Ramesh Patil Did Not Reach Sassoon Hospital'}
              </span>
              <span className="text-[9px] uppercase font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                {language === 'mr' ? '४८ तास उलटले' : language === 'hi' ? '४८ घंटे विलंबित' : 'Overdue 48h'}
              </span>
            </div>
            <p className="text-[11px] text-rose-100/90 mt-0.5">
              {language === 'mr'
                ? 'छातीतील तीव्र वेदनेसाठी ससूनला संदर्भित. आशा सेविका सुनिता जाधव यांनी तात्काळ प्रत्यक्ष गृहभेट द्यावी.'
                : language === 'hi'
                ? 'सीने में तेज दर्द के लिए ससून रेफर। आशा कार्यकर्ता सुनीता जाधव द्वारा तत्काल गृह-भेंट या परिवार से संपर्क आवश्यक।'
                : 'Referred for acute cardiac chest pain. Immediate home visit or family call required by ASHA worker Sunita.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <a
            href="tel:9822104523"
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t.callPatient}</span>
          </a>
          <button
            type="button"
            onClick={() => onNavigateTab('followups')}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            {t.markVisited}
          </button>
        </div>
      </div>

      {/* Top Banner: Outbreak Signal & Offline Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Outbreak Signal Warning Chip */}
        <div className="md:col-span-2 p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
            <div>
              <span className="font-extrabold uppercase text-[10px] tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                {t.surveillanceAlert}
              </span>
              <p className="font-semibold text-xs mt-0.5">
                {language === 'mr'
                  ? 'रोगप्रसार इशारा: वेल्हे गावात ४८ तासांत ताप आणि अंगावर पुरळ उठण्याचे ५ रुग्ण आढळले. डेंग्यू/व्हायरल सर्वेक्षण सुरू आहे.'
                  : language === 'hi'
                  ? 'प्रकोप चेतावनी: वेल्हे गाँव में ४८ घंटों में बुखार और चकत्तों के ५ मामले मिले। डेंगू / वायरल निगरानी सक्रिय।'
                  : 'Cluster Alert: 5 fever + rash cases reported in Velhe within 48h. Dengue / Viral syndrome surveillance active.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenTriage}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0 cursor-pointer shadow-2xs"
          >
            {t.logClusterCase}
          </button>
        </div>

        {/* Offline Sync Indicator */}
        <div className="p-3.5 glass-card rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-slate-900">{t.localCacheSynced}</span>
              <span className="text-[11px] text-slate-500">{t.allRecordsCached}</span>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
        </div>
      </div>

      {/* Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sunita Jadhav ({t.ashaPortalTitle})
            </h1>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
              Velhe Sub-Centre
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.ashaPortalSubtitle}
          </p>
        </div>

        <DateRangeFilter
          selectedRange={dateRange}
          onChangeRange={(r) => setDateRange(r)}
          lastUpdated="03:45 PM"
          language={language}
        />
      </div>

      {/* Top Row: 4 Stat Cards with DrillDown Integration */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label={t.patientsSeenToday}
          value={patients.length || 6}
          icon={<Users className="w-4 h-4 text-teal-700" />}
          color="teal"
          trend={{ value: '+3 vs yesterday', isPositive: true }}
          badge={t.viewDetails}
          onClick={() => setActiveDrilldownType('seen_today')}
        />
        <StatCard
          label={t.pendingFollowups}
          value={overdueFollowUps.length || 2}
          icon={<Clock className="w-4 h-4 text-amber-700" />}
          color="amber"
          trend={{ value: '1 Overdue 48h', isPositive: false }}
          badge={t.viewDetails}
          onClick={() => setActiveDrilldownType('pending_followups')}
        />
        <StatCard
          label={t.highPriorityCases}
          value={highPriorityCases.length || 1}
          icon={<AlertTriangle className="w-4 h-4 text-rose-700" />}
          color="rose"
          trend={{ value: 'Critical Care', isPositive: false }}
          badge="108 Transit Alert"
          onClick={() => setActiveDrilldownType('high_priority')}
        />
        <StatCard
          label={t.referralsInTransit}
          value={inTransitReferrals.length || 2}
          icon={<ArrowRight className="w-4 h-4 text-sky-700" />}
          color="sky"
          trend={{ value: 'En Route', isPositive: true }}
          badge={t.viewDetails}
          onClick={() => setActiveDrilldownType('in_transit')}
        />
      </div>

      {/* Quick Actions Panel: Big Buttons for the 3 Most Common Tasks */}
      <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>{t.quickFieldActions}</span>
          </span>
          <span className="text-[11px] text-slate-400">{t.oneTapCommunity}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onOpenTriage}
            className="p-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">{t.actionStartTriage}</div>
              <div className="text-[11px] text-teal-100 mt-0.5">{t.actionStartTriageSub}</div>
            </div>
            <Activity className="w-5 h-5 text-teal-200 group-hover:translate-x-1 transition" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('followups')}
            className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">{t.actionLogVisit}</div>
              <div className="text-[11px] text-slate-300 mt-0.5">{t.actionLogVisitSub}</div>
            </div>
            <Home className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition" />
          </button>

          <button
            type="button"
            onClick={onOpenRegister}
            className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">{t.actionRegisterPatient}</div>
              <div className="text-[11px] text-emerald-100 mt-0.5">{t.actionRegisterPatientSub}</div>
            </div>
            <UserPlus className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Main Grid: Priority Task List, Village Registry & Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority "Visit Today" List (Sorted by Urgency) */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>{t.priorityVisitListTitle}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t.priorityVisitListSub}
                </p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                {visitTodayList.length} Scheduled
              </span>
            </div>

            <div className="space-y-2.5">
              {visitTodayList.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.urgency === 'CRITICAL'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : task.urgency === 'HIGH'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-white/80 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{task.patientName}</span>
                      <span className="text-xs text-slate-500">({task.age}y, {task.village})</span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.2 rounded-full uppercase ${
                          task.urgency === 'CRITICAL'
                            ? 'bg-rose-600 text-white'
                            : task.urgency === 'HIGH'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {task.urgency}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-teal-800">{task.condition}</div>
                    <div className="text-[11px] text-slate-500">{task.action}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${task.phone}`}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1 shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      <span>{t.call}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('followups')}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                    >
                      {t.markVisited}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Village-Wise Patient Registry with Filters (village, age group, condition, risk) */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>{t.villageRegistryTitle}</span>
                </h3>
                <p className="text-xs text-slate-500">{t.villageRegistrySub}</p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={registrySearch}
                  onChange={(e) => setRegistrySearch(e.target.value)}
                  placeholder={
                    language === 'mr'
                      ? 'नाव, आयडी, गाव शोधा...'
                      : language === 'hi'
                      ? 'नाम, आईडी, गाँव खोजें...'
                      : 'Search name, HID, village...'
                  }
                  className="glass-input w-full pl-8 pr-3 py-1.5 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3" /> {t.filter}:
              </span>

              <select
                value={filterVillage}
                onChange={(e) => setFilterVillage(e.target.value)}
                className="glass-input px-2.5 py-1 rounded-xl text-xs font-medium"
              >
                <option value="All">{t.allVillages}</option>
                <option value="Velhe">Velhe</option>
                <option value="Pasure">Pasure</option>
                <option value="Kelawade">Kelawade</option>
              </select>

              <select
                value={filterAgeGroup}
                onChange={(e) => setFilterAgeGroup(e.target.value)}
                className="glass-input px-2.5 py-1 rounded-xl text-xs font-medium"
              >
                <option value="All">{t.allAgeGroups}</option>
                <option value="pediatric">
                  {language === 'mr' ? 'बालके (<१५ वर्षे)' : language === 'hi' ? 'बच्चे (<१५ वर्ष)' : 'Children (<15y)'}
                </option>
                <option value="adult">
                  {language === 'mr' ? 'प्रौढ (१५-५९ वर्षे)' : language === 'hi' ? 'वयस्क (१५-५९ वर्ष)' : 'Adults (15-59y)'}
                </option>
                <option value="geriatric">
                  {language === 'mr' ? 'ज्येष्ठ नागरिक (६०+ वर्षे)' : language === 'hi' ? 'वरिष्ठ नागरिक (६०+ वर्ष)' : 'Seniors (60y+)'}
                </option>
              </select>

              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="glass-input px-2.5 py-1 rounded-xl text-xs font-medium"
              >
                <option value="All">{t.allConditions}</option>
                <option value="hypertension">{t.bloodPressure}</option>
                <option value="diabetes">{language === 'mr' ? 'मधुमेह' : language === 'hi' ? 'मधुमेह' : 'Diabetes'}</option>
              </select>
            </div>

            {/* Registry Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2">
                      {language === 'mr' ? 'नागरिकाचे नाव व HID' : language === 'hi' ? 'नागरिक का नाम व HID' : 'Citizen Name & HID'}
                    </th>
                    <th className="py-2">
                      {language === 'mr' ? 'वय / लिंग' : language === 'hi' ? 'आयु / लिंग' : 'Age / Gender'}
                    </th>
                    <th className="py-2">
                      {language === 'mr' ? 'गाव' : language === 'hi' ? 'गाँव' : 'Village'}
                    </th>
                    <th className="py-2">
                      {language === 'mr' ? 'तीव्र / जुनाट आजार' : language === 'hi' ? 'गंभीर रोग' : 'Chronic Conditions'}
                    </th>
                    <th className="py-2 text-right">
                      {language === 'mr' ? 'कृती' : language === 'hi' ? 'कार्यवाही' : 'Action'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.healthId}</div>
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {p.age} {language === 'mr' ? 'वर्षे' : language === 'hi' ? 'वर्ष' : 'y'} ·{' '}
                        {p.gender === 'MALE'
                          ? language === 'mr'
                            ? 'पुरुष'
                            : language === 'hi'
                            ? 'पुरुष'
                            : 'Male'
                          : p.gender === 'FEMALE'
                          ? language === 'mr'
                            ? 'महिला'
                            : language === 'hi'
                            ? 'महिला'
                            : 'Female'
                          : p.gender}
                      </td>
                      <td className="py-2.5 text-slate-700 font-medium">{p.village}</td>
                      <td className="py-2.5">
                        {(p.existingConditions || p.chronicDiseases || []).length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-semibold border border-teal-200">
                            {(p.existingConditions || p.chronicDiseases || [])[0]}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">
                            {language === 'mr' ? 'नोंद नाही' : language === 'hi' ? 'कोई नहीं' : 'None documented'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={onOpenTriage}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer transition"
                        >
                          {t.navTriage.split(' ')[0]}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Referral Status Board (Kanban style: Referred / Reached / In Treatment / Completed) */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {t.kanbanBoardTitle}
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('referrals')}
                className="text-xs text-teal-700 font-bold hover:underline"
              >
                {t.viewDetails} →
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                { stage: 'REFERRED', label: `1. ${t.statusReferred}`, count: 2, bg: 'bg-blue-50/80 border-blue-200 text-blue-900' },
                { stage: 'REACHED', label: `2. ${t.statusReached}`, count: 1, bg: 'bg-teal-50/80 border-teal-200 text-teal-900' },
                { stage: 'UNDER_TREATMENT', label: `3. ${t.statusUnderTreatment}`, count: 2, bg: 'bg-amber-50/80 border-amber-200 text-amber-900' },
                { stage: 'COMPLETED', label: `4. ${t.statusCompleted}`, count: 4, bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-900' },
              ].map((col) => (
                <div key={col.stage} className={`p-3 rounded-2xl border ${col.bg} space-y-2`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>{col.label}</span>
                    <span className="font-mono text-sm">{col.count}</span>
                  </div>
                  <div className="space-y-1.5">
                    {referrals
                      .filter((r) => r.status === col.stage)
                      .slice(0, 1)
                      .map((ref) => (
                        <div
                          key={ref.id}
                          onClick={() => onViewSlip(ref)}
                          className="p-2 bg-white/90 rounded-xl shadow-2xs border border-slate-200 text-[11px] cursor-pointer hover:border-teal-400 transition"
                        >
                          <div className="font-bold text-slate-900 truncate">{ref.patientName}</div>
                          <div className="text-[10px] text-slate-500 truncate">{ref.destinationHospitalName}</div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Immunisation Due, High-Risk Tracker, Supply Request, & ASHA Incentive */}
        <div className="space-y-6">
          {/* Immunisation Due List for Children */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Syringe className="w-4 h-4 text-teal-600" />
                <span>{t.childImmunisationTitle}</span>
              </h3>
              <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                {immunisationList.length} Due
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {immunisationList.map((item) => (
                <div key={item.id} className="p-2.5 bg-white/70 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">{item.childName}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                      {item.dueDate}
                    </span>
                  </div>
                  <div className="text-[11px] text-teal-800 font-semibold">{item.vaccine}</div>
                  <div className="text-[10px] text-slate-500">
                    {language === 'mr' ? 'माता:' : language === 'hi' ? 'माता:' : 'Mother:'} {item.motherName} · {item.village}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Risk Tracker */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-pink-600" />
              <span>{t.highRiskTrackerTitle}</span>
            </h3>
            <p className="text-[11px] text-slate-500">{t.highRiskTrackerSub}</p>

            <div className="space-y-2 text-xs">
              {highRiskTracker.map((hr) => (
                <div key={hr.id} className="p-2.5 bg-pink-50/70 border border-pink-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{hr.name}</span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                        hr.priority === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-pink-200 text-pink-900'
                      }`}
                    >
                      {hr.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-pink-900 font-medium">{hr.details}</div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('mch')}
              className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              {language === 'mr'
                ? 'माता व बाल आरोग्य (MCH) रजिस्टर'
                : language === 'hi'
                ? 'मातृ एवं शिशु स्वास्थ्य (MCH) रजिस्टर'
                : 'Open MCH & ANC Register'}
            </button>
          </div>

          {/* Household Survey Shortcut */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Home className="w-4 h-4 text-teal-600" />
              <span>{t.householdSurveyTitle}</span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t.householdSurveySub}: <strong>{householdId}</strong>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFamilyMember}
                onChange={(e) => setNewFamilyMember(e.target.value)}
                placeholder={
                  language === 'mr'
                    ? 'नवीन सदस्याचे पूर्ण नाव...'
                    : language === 'hi'
                    ? 'नए सदस्य का पूरा नाम...'
                    : 'Family member full name...'
                }
                className="glass-input flex-1 px-3 py-1.5 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (newFamilyMember.trim()) {
                    alert(`Added ${newFamilyMember} under Household ID ${householdId}`);
                    setNewFamilyMember('');
                  }
                }}
                className="px-3 py-1.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                {t.addMemberBtn}
              </button>
            </div>
          </div>

          {/* Supply & Medicine Request to PHC */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-amber-600" />
              <span>{t.supplyRequestTitle}</span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t.supplyRequestSub}
            </p>

            {supplySent ? (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.indentSubmitted}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSupplySent(true)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                {t.requestRestockPhc}
              </button>
            )}
          </div>

          {/* ASHA Performance & Incentive View */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-teal-200/80 bg-gradient-to-br from-teal-50/70 to-white/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-950 text-xs flex items-center gap-1">
                <Award className="w-4 h-4 text-teal-600" />
                <span>{t.ashaIncentiveTitle}</span>
              </span>
              <span className="text-xs font-mono font-extrabold text-teal-800">₹4,200</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1 pt-1">
              <div className="flex justify-between">
                <span>{t.completedVisits} (28):</span>
                <strong>₹2,100</strong>
              </div>
              <div className="flex justify-between">
                <span>{t.trackedReferrals} (6):</span>
                <strong>₹1,200</strong>
              </div>
              <div className="flex justify-between">
                <span>{t.ncdRefills} (9):</span>
                <strong>₹900</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DrillDown Modal */}
      <DrillDownModal
        isOpen={Boolean(activeDrilldownType)}
        onClose={() => setActiveDrilldownType(null)}
        title={
          activeDrilldownType === 'seen_today'
            ? t.patientsSeenToday
            : activeDrilldownType === 'pending_followups'
            ? t.pendingFollowups
            : activeDrilldownType === 'high_priority'
            ? t.highPriorityCases
            : t.referralsInTransit
        }
        category={t.ashaPortalTitle}
        items={getDrillDownItems()}
        language={language}
      />
    </div>
  );
};
