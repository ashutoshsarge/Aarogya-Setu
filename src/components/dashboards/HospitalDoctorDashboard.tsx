import React, { useState } from 'react';
import { Hospital, Patient, Referral, Language } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { StatCard } from '../shared/StatCard';
import { DateRangeFilter, DateRangeOption } from '../shared/DateRangeFilter';
import { DrillDownModal, DrillDownItem } from '../shared/DrillDownModal';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Calendar,
  Video,
  Bed,
  Activity,
  Send,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Phone,
  Pill,
  Sparkles,
  RefreshCw,
  Ambulance,
  Lock,
  Unlock,
  Building2,
  FileCheck,
} from 'lucide-react';

interface HospitalDoctorDashboardProps {
  doctorHospital: Hospital;
  referrals: Referral[];
  patients: Patient[];
  language: Language;
  onViewSlip: (referral: Referral) => void;
  onUpdateStatus: (referralId: string, status: any, notes?: string, doctorName?: string) => void;
  onOpenTeleconsult: (referral: Referral) => void;
  onNavigateTab: (tab: string) => void;
}

export const HospitalDoctorDashboard: React.FC<HospitalDoctorDashboardProps> = ({
  doctorHospital,
  referrals,
  patients,
  language,
  onViewSlip,
  onUpdateStatus,
  onOpenTeleconsult,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[language];
  const [dateRange, setDateRange] = useState<DateRangeOption>('today');
  const [activeDrilldownType, setActiveDrilldownType] = useState<string | null>(null);

  // Availability toggle: On duty / On leave / Emergency only
  const [dutyStatus, setDutyStatus] = useState<'ON_DUTY' | 'ON_LEAVE' | 'EMERGENCY_ONLY'>('ON_DUTY');

  // Selected referral for detailed clinical action modal
  const [inspectingReferral, setInspectingReferral] = useState<Referral | null>(null);
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [prescribedMed, setPrescribedMed] = useState('Tab. Atorvastatin 40mg OD, Tab. Clopidogrel 75mg OD');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('2026-10-18');
  const [sendBackPhcAdvice, setSendBackPhcAdvice] = useState('');

  // Hospital Capacity states
  const [generalBedsAvailable, setGeneralBedsAvailable] = useState(14);
  const [icuBedsAvailable, setIcuBedsAvailable] = useState(2);
  const [ambulancesReady, setAmbulancesReady] = useState(3);
  const [opdLoadPercent, setOpdLoadPercent] = useState(78);

  // Diagnostic equipment availability status (feeds recommendation engine)
  const [diagnosticsStatus, setDiagnosticsStatus] = useState<Record<string, boolean>>({
    '12-Lead Digital ECG': true,
    'Cath Lab (Angiography)': true,
    'Troponin-I Rapid Serology': true,
    'CT Scanner 64-Slice': true,
    'Digital X-Ray & Ultrasound': true,
  });

  // Today's schedule slots with slot blocking & reschedule
  const [todaySlots, setTodaySlots] = useState([
    { id: 's1', time: '09:00 AM - 09:30 AM', patientName: 'Ramesh Patil', type: 'Referred Emergency', status: 'CONFIRMED', blocked: false },
    { id: 's2', time: '09:30 AM - 10:00 AM', patientName: 'Suresh More', type: 'Post-OP Follow-up', status: 'CONFIRMED', blocked: false },
    { id: 's3', time: '10:00 AM - 10:30 AM', patientName: 'Reserved for Emergency', type: 'ICU Triage', status: 'BLOCKED', blocked: true },
    { id: 's4', time: '10:30 AM - 11:00 AM', patientName: 'Teleconsultation: Velhe PHC', type: 'Virtual Video Call', status: 'TELECONSULT', blocked: false },
    { id: 's5', time: '11:00 AM - 11:30 AM', patientName: 'Open Walk-in Slot', type: 'General OPD', status: 'AVAILABLE', blocked: false },
  ]);

  // Request external records modal state
  const [isRecordReqOpen, setIsRecordReqOpen] = useState(false);
  const [recordReqSuccess, setRecordReqSuccess] = useState(false);

  // Incoming referrals for this hospital
  const incomingQueue = referrals.filter(
    (r) => r.status === 'REFERRED' || r.status === 'REACHED'
  );

  const toggleDiagnostic = (name: string) => {
    setDiagnosticsStatus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleToggleBlockSlot = (slotId: string) => {
    setTodaySlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        const newBlocked = !s.blocked;
        return {
          ...s,
          blocked: newBlocked,
          status: newBlocked ? 'BLOCKED' : 'AVAILABLE',
          patientName: newBlocked ? 'Blocked by Doctor' : 'Open Slot',
        };
      })
    );
  };

  const handleAcceptReferral = (ref: Referral) => {
    onUpdateStatus(ref.id, 'UNDER_TREATMENT', 'Referral accepted by Cardiology team; Patient moved to ICCU/OPD examination room.', 'Dr. Anil Kulkarni');
    alert(`Referral ${ref.referralNumber} for ${ref.patientName} accepted for urgent treatment!`);
  };

  const handleRescheduleReferral = (ref: Referral) => {
    alert(`Referral ${ref.referralNumber} slot moved to Tomorrow 10:00 AM. Notification sent to ${ref.patientName}.`);
  };

  const handleRedirectReferral = (ref: Referral) => {
    alert(`Referral ${ref.referralNumber} redirected to Aundh Chest Hospital with digital case history transferred.`);
  };

  const handleSendBackToPhc = (ref: Referral) => {
    onUpdateStatus(
      ref.id,
      'COMPLETED',
      `Stabilized. Patient discharged and referred back to ${ref.referringFacility}. Advice: ${sendBackPhcAdvice || 'Continue Tab. Amlodipine 5mg OD; weekly BP monitoring by ASHA worker.'}. Next hospital review: ${nextFollowUpDate}`,
      'Dr. Anil Kulkarni'
    );
    alert(`Patient ${ref.patientName} discharged and clinical follow-up advice sent back to ${ref.referringFacility}.`);
    setInspectingReferral(null);
  };

  // Drilldown items generator
  const getDrillDownItems = (): DrillDownItem[] => {
    switch (activeDrilldownType) {
      case 'incoming':
        return incomingQueue.map((ref) => ({
          id: ref.id,
          title: `${ref.patientName} (${ref.patientAge}y, ${ref.patientGender})`,
          subtitle: `Referred from: ${ref.referringFacility} · Score: ${ref.triageResult.score}/5`,
          badge: ref.triageResult.level,
          badgeColor: ref.triageResult.level === 'HIGH' ? 'rose' : 'amber',
          date: `Slot: ${ref.appointmentDate} (${ref.appointmentSlot})`,
          detail: `Clinical Assessment: ${ref.triageResult.clinicalJustification}. SLA: Waiting ~35m`,
          actionLabel: 'Accept & Treat',
          onAction: () => handleAcceptReferral(ref),
        }));
      case 'appointments':
        return todaySlots.map((slot) => ({
          id: slot.id,
          title: slot.patientName,
          subtitle: `${slot.time} · ${slot.type}`,
          badge: slot.status,
          badgeColor: slot.status === 'CONFIRMED' ? 'teal' : slot.status === 'BLOCKED' ? 'rose' : 'emerald',
          detail: `Consultation Room 14 · Sassoon Cardiology OPD`,
          actionLabel: slot.blocked ? 'Unblock Slot' : 'Block Slot',
          onAction: () => handleToggleBlockSlot(slot.id),
        }));
      case 'teleconsults':
        return [
          {
            id: 'tel_1',
            title: 'Ramesh Patil (Cardiology Review)',
            subtitle: 'Velhe Sub-Centre Tele-booth · ASHA Sunita Jadhav',
            badge: 'LIVE LINK READY',
            badgeColor: 'teal',
            date: 'Today, 10:30 AM',
            detail: 'Review ST-segment elevations and recommend dosage titration.',
            actionLabel: 'Launch Video Call',
            onAction: () => {
              if (referrals[0]) onOpenTeleconsult(referrals[0]);
            },
          },
        ];
      case 'capacity':
        return [
          {
            id: 'cap_icu',
            title: 'Cardiology Intensive Care Unit (ICCU)',
            subtitle: `${icuBedsAvailable} of 8 Beds Available (Monitored & Ventilator equipped)`,
            badge: `${icuBedsAvailable} VACANT`,
            badgeColor: icuBedsAvailable > 0 ? 'emerald' : 'rose',
            detail: 'Central cardiac telemetry and invasive arterial line setup ready.',
          },
          {
            id: 'cap_gen',
            title: 'General Cardiology Post-OP Ward',
            subtitle: `${generalBedsAvailable} of 40 Beds Available`,
            badge: `${generalBedsAvailable} VACANT`,
            badgeColor: 'teal',
            detail: 'Step-down telemetry recovery unit.',
          },
          {
            id: 'cap_amb',
            title: 'Advanced Cardiac Ambulances (108 Fleet)',
            subtitle: `${ambulancesReady} of 4 Ambulances on Standby`,
            badge: `${ambulancesReady} ON STANDBY`,
            badgeColor: 'emerald',
            detail: 'Equipped with portable defibrillator and EMT paramedic.',
          },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6" lang={language}>
      {/* High-Priority Alert Banner: Critical Incoming STEMI Case */}
      <div className="p-3.5 bg-gradient-to-r from-rose-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-rose-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                Critical Incoming STEMI Alert: Ramesh Patil En Route to Sassoon
              </span>
              <span className="text-[9px] uppercase font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                ICCU Bed Required
              </span>
            </div>
            <p className="text-[11px] text-rose-100/90 mt-0.5">
              Referred from Velhe PHC. BP: 188/104 mmHg, Diaphoretic, Troponin-I pending. Cath Lab team alerted.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {incomingQueue[0] && (
            <button
              type="button"
              onClick={() => handleAcceptReferral(incomingQueue[0])}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
            >
              Prepare & Accept Bed
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveDrilldownType('incoming')}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Queue ({incomingQueue.length})
          </button>
        </div>
      </div>

      {/* Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Dr. Anil Kulkarni · Specialist Dashboard
            </h1>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
              Senior Cardiologist, MD DM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sassoon General Hospital & B.J. Govt Medical College · Tertiary Referral Hub
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Availability Toggle */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDutyStatus('ON_DUTY')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                dutyStatus === 'ON_DUTY' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              ● On Duty
            </button>
            <button
              type="button"
              onClick={() => setDutyStatus('EMERGENCY_ONLY')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                dutyStatus === 'EMERGENCY_ONLY' ? 'bg-amber-600 text-white shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Emergency Only
            </button>
            <button
              type="button"
              onClick={() => setDutyStatus('ON_LEAVE')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                dutyStatus === 'ON_LEAVE' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              On Leave
            </button>
          </div>

          <DateRangeFilter
            selectedRange={dateRange}
            onChangeRange={(r) => setDateRange(r)}
            lastUpdated="Today, 03:55 PM"
          />
        </div>
      </div>

      {/* Top Row: 4 Stat Cards with DrillDown Integration */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Incoming Referrals"
          value={incomingQueue.length || 3}
          icon={<AlertTriangle className="w-4 h-4 text-rose-700" />}
          color="rose"
          trend={{ value: '1 High Priority', isPositive: false }}
          badge="Cath Lab / ICCU"
          onClick={() => setActiveDrilldownType('incoming')}
        />
        <StatCard
          label="Today's Appointments"
          value={todaySlots.filter((s) => !s.blocked).length}
          icon={<Calendar className="w-4 h-4 text-sky-700" />}
          color="sky"
          trend={{ value: '1 Slot Blocked', isPositive: true }}
          badge="OPD Room 14"
          onClick={() => setActiveDrilldownType('appointments')}
        />
        <StatCard
          label="Teleconsultations"
          value="4"
          icon={<Video className="w-4 h-4 text-teal-700" />}
          color="teal"
          trend={{ value: '1 In Session Now', isPositive: true }}
          badge="Rural PHC Link"
          onClick={() => setActiveDrilldownType('teleconsults')}
        />
        <StatCard
          label="Beds Available"
          value={`${generalBedsAvailable + icuBedsAvailable}`}
          icon={<Bed className="w-4 h-4 text-emerald-700" />}
          color="emerald"
          trend={{ value: `${icuBedsAvailable} ICU Beds`, isPositive: true }}
          badge="Real-time Capacity"
          onClick={() => setActiveDrilldownType('capacity')}
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Specialist Workflows</span>
          </span>
          <span className="text-[11px] text-slate-400">Cardiology Dept · Room 14</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveDrilldownType('incoming')}
            className="p-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">1. Review Incoming Referral Queue</div>
              <div className="text-[11px] text-teal-100 mt-0.5">Accept, reschedule, or redirect patients</div>
            </div>
            <ArrowRight className="w-5 h-5 text-teal-200 group-hover:translate-x-1 transition" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (referrals[0]) onOpenTeleconsult(referrals[0]);
            }}
            className="p-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">2. Launch Teleconsultation Booth</div>
              <div className="text-[11px] text-sky-100 mt-0.5">Connect with rural sub-centre video link</div>
            </div>
            <Video className="w-5 h-5 text-sky-200 group-hover:translate-x-1 transition" />
          </button>

          <button
            type="button"
            onClick={() => setIsRecordReqOpen(true)}
            className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">3. Request Records from External Facility</div>
              <div className="text-[11px] text-slate-300 mt-0.5">ABHA federated health record pull</div>
            </div>
            <FileCheck className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Main Grid: Incoming Referral Queue & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incoming Referral Queue & Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incoming Referral Queue sorted by urgency with Accept / Reschedule / Redirect */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Incoming Referral Queue (Sorted by Urgency)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Patients routed by rural triage algorithm with SLA wait times & diagnostic requirements
                </p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                {incomingQueue.length} In Queue
              </span>
            </div>

            <div className="space-y-3">
              {incomingQueue.map((ref) => (
                <div
                  key={ref.id}
                  className={`p-4 rounded-2xl border transition space-y-3 ${
                    ref.triageResult.level === 'HIGH'
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-white/80 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">{ref.patientName}</span>
                        <span className="text-xs text-slate-500">({ref.patientAge}y, {ref.patientGender})</span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.2 rounded-full uppercase ${
                            ref.triageResult.level === 'HIGH'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {ref.triageResult.level} Priority (Score {ref.triageResult.score})
                        </span>
                        {/* SLA Tracker */}
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          ⏱ Waiting: 35m (SLA &lt;2h)
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Referring Facility: <strong>{ref.referringFacility}</strong> · Worker: {ref.referringHealthWorker}
                      </div>
                      <div className="text-[11px] text-rose-900 font-semibold mt-1">
                        Clinical Flag: {ref.triageResult.clinicalJustification}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAcceptReferral(ref)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-2xs"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRescheduleReferral(ref)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRedirectReferral(ref)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300"
                      >
                        Redirect
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectingReferral(ref)}
                        className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-2xs"
                      >
                        Clinical Summary
                      </button>
                    </div>
                  </div>

                  {/* Vitals summary bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-2 bg-white/80 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Blood Pressure</span>
                      <strong className="text-rose-900 font-mono">188/104 mmHg</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">SpO2 Level</span>
                      <strong className="text-rose-900 font-mono">91% (Diaphoretic)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Heart Rate</span>
                      <strong className="font-mono">112 bpm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Tests Required</span>
                      <span className="font-medium text-teal-800 truncate block">12-Lead ECG, Troponin</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule (Slot View with Drag/Reschedule & Slot Blocking) */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Today's Consultation Schedule & Slot Management</span>
                </h3>
                <p className="text-xs text-slate-500">Block slots for emergency procedures or reassign timing</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                OPD Room 14
              </span>
            </div>

            <div className="space-y-2">
              {todaySlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs ${
                    slot.blocked
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : slot.status === 'TELECONSULT'
                      ? 'bg-sky-50/70 border-sky-200 text-sky-950'
                      : 'bg-white/80 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-600 w-36 shrink-0">{slot.time}</span>
                    <div>
                      <div className="font-bold text-slate-900">{slot.patientName}</div>
                      <div className="text-[10px] text-slate-500">{slot.type}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        slot.blocked
                          ? 'bg-rose-600 text-white'
                          : slot.status === 'TELECONSULT'
                          ? 'bg-sky-600 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {slot.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleBlockSlot(slot.id)}
                      className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                        slot.blocked
                          ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                      title={slot.blocked ? 'Unblock slot' : 'Block slot for emergency'}
                    >
                      {slot.blocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Hospital Capacity, Availability, & Diagnostics */}
        <div className="space-y-6">
          {/* Capacity Panel: General, ICU, and Ambulance Availability */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-teal-600" />
              <span>Hospital Capacity & Bed Readiness</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white/70 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">ICU / ICCU Beds</div>
                  <div className="text-[10px] text-slate-500">Ventilator & telemetry ready</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-teal-900">{icuBedsAvailable}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setIcuBedsAvailable(Math.max(0, icuBedsAvailable - 1))}
                      className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded text-xs font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setIcuBedsAvailable(icuBedsAvailable + 1)}
                      className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/70 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">General Ward Beds</div>
                  <div className="text-[10px] text-slate-500">Post-stabilization recovery</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-slate-900">{generalBedsAvailable}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setGeneralBedsAvailable(Math.max(0, generalBedsAvailable - 1))}
                      className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded text-xs font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setGeneralBedsAvailable(generalBedsAvailable + 1)}
                      className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/70 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Ambulance className="w-3.5 h-3.5 text-teal-600" />
                    <span>108 Ambulances on Standby</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Advanced life support equipped</div>
                </div>
                <span className="font-mono text-base font-extrabold text-emerald-800">{ambulancesReady}</span>
              </div>

              <div className="p-3 bg-white/70 rounded-xl border border-slate-200">
                <div className="flex justify-between font-bold text-slate-800 mb-1">
                  <span>OPD Load:</span>
                  <span>{opdLoadPercent}% Capacity</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      opdLoadPercent > 80 ? 'bg-rose-500' : 'bg-teal-600'
                    }`}
                    style={{ width: `${opdLoadPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Lab Status */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Diagnostic Equipment Readiness</span>
              </h3>
              <span className="text-[10px] text-teal-700 font-mono">Live Sync</span>
            </div>
            <p className="text-[11px] text-slate-500">Toggle feeds recommendation engine for patient routing:</p>

            <div className="space-y-1.5 text-xs">
              {Object.entries(diagnosticsStatus).map(([name, ready]) => (
                <div
                  key={name}
                  className="p-2 bg-white/70 rounded-xl border border-slate-200 flex justify-between items-center text-[11px]"
                >
                  <span className="font-medium text-slate-800">{name}</span>
                  <button
                    type="button"
                    onClick={() => toggleDiagnostic(name)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg cursor-pointer ${
                      ready ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {ready ? '● Available' : '✕ Down'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Action Modal: Prescription Writer, Next Follow-Up Picker & "Send Back to PHC" */}
      {inspectingReferral && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full rounded-3xl p-6 shadow-2xl border border-white/80 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Doctor Clinical Orders & Referral Close-Loop
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {inspectingReferral.patientName} ({inspectingReferral.patientHealthId})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingReferral(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient Clinical Summary Banner */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">
                Triage Result: {inspectingReferral.triageResult.level} Priority ({inspectingReferral.triageResult.clinicalJustification})
              </div>
              <div className="text-slate-600">
                Referring Facility: {inspectingReferral.referringFacility} · Health Worker: {inspectingReferral.referringHealthWorker}
              </div>
            </div>

            {/* Clinical Treatment Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Examination & Treatment Notes
              </label>
              <textarea
                rows={3}
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
                placeholder="e.g. Admitted to ICCU. Loaded with DAPT (Aspirin + Clopidogrel) and Heparin. Troponin-I elevated..."
                className="glass-input w-full p-3 rounded-xl text-xs"
              />
            </div>

            {/* Prescriptions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prescribe Discharge Medications
              </label>
              <input
                type="text"
                value={prescribedMed}
                onChange={(e) => setPrescribedMed(e.target.value)}
                className="glass-input w-full p-2.5 rounded-xl text-xs"
              />
            </div>

            {/* Next Follow-Up Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Next Follow-Up Review Date
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="glass-input w-full p-2.5 rounded-xl text-xs font-mono"
              />
            </div>

            {/* Send back to PHC Advice */}
            <div className="p-3 bg-teal-50/80 rounded-2xl border border-teal-200 space-y-1">
              <label className="block text-xs font-bold text-teal-900">
                "Send Back to PHC" Directives for Local Health Worker (ASHA)
              </label>
              <textarea
                rows={2}
                value={sendBackPhcAdvice}
                onChange={(e) => setSendBackPhcAdvice(e.target.value)}
                placeholder="Directives for local sub-centre: weekly BP monitoring, pill compliance check, salt restriction..."
                className="glass-input w-full p-2 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleAcceptReferral(inspectingReferral)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Accept & Begin In-Hospital Care
              </button>
              <button
                type="button"
                onClick={() => handleSendBackToPhc(inspectingReferral)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Discharge & Send Back to PHC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External Record Request Modal */}
      {isRecordReqOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-3xl p-6 shadow-2xl border border-white/80 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Request External Hospital Records</h3>
              <button
                type="button"
                onClick={() => {
                  setIsRecordReqOpen(false);
                  setRecordReqSuccess(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {recordReqSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-950">Patient Consent Verified via ABHA Gateway</h4>
                <p className="text-xs text-emerald-800">
                  Transferred 3 previous ECG traces and discharge summary from Aundh District Hospital.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecordReqOpen(false);
                    setRecordReqSuccess(false);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Pull historical clinical summaries from other public hospitals across Pune district under DPDP consent:
                </p>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source Hospital</label>
                  <select className="glass-input w-full p-2.5 rounded-xl text-xs font-medium">
                    <option>Aundh District Hospital</option>
                    <option>Sub-District Hospital Baramati</option>
                    <option>YCM Hospital Pimpri</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient ABHA / Health ID</label>
                  <input
                    type="text"
                    defaultValue="HID-2026-0001 (Ramesh Patil)"
                    className="glass-input w-full p-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setRecordReqSuccess(true)}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Send Consent Request via ABHA
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DrillDown Modal */}
      <DrillDownModal
        isOpen={Boolean(activeDrilldownType)}
        onClose={() => setActiveDrilldownType(null)}
        title={
          activeDrilldownType === 'incoming'
            ? 'Incoming Triage Referrals Queue'
            : activeDrilldownType === 'appointments'
            ? 'Today’s Specialist Appointment Slots'
            : activeDrilldownType === 'teleconsults'
            ? 'Active Rural Teleconsultation Links'
            : 'Hospital Bed & Emergency Fleet Readiness'
        }
        category="Hospital Specialist Drilldown"
        items={getDrillDownItems()}
      />
    </div>
  );
};
