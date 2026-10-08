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
  Pill,
  Activity,
  ArrowRight,
  TrendingUp,
  Download,
  Phone,
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Building,
  RefreshCw,
  Search,
} from 'lucide-react';

interface PhcDoctorDashboardProps {
  hospitals: Hospital[];
  referrals: Referral[];
  patients: Patient[];
  language: Language;
  onOpenTriage: () => void;
  onViewSlip: (referral: Referral) => void;
  onNavigateTab: (tab: string) => void;
}

export const PhcDoctorDashboard: React.FC<PhcDoctorDashboardProps> = ({
  hospitals,
  referrals,
  patients,
  language,
  onOpenTriage,
  onViewSlip,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[language];
  const [dateRange, setDateRange] = useState<DateRangeOption>('today');
  const [activeDrilldownType, setActiveDrilldownType] = useState<string | null>(null);

  // Diagnostic Lab & Equipment toggles
  const [labStatus, setLabStatus] = useState<Record<string, boolean>>({
    'Digital ECG Machine': true,
    'CBC / Automated Cell Counter': true,
    'Malaria & Dengue Rapid Kits': true,
    'Ultrasonography (USG Probe)': false,
    'Centrifuge & Chemistry Analyzer': true,
  });

  // Low-Stock Medicines Table with interactive Restock action
  const [medicinesStock, setMedicinesStock] = useState([
    { id: 'stk_1', name: 'Anti-Snake Venom (ASV)', current: 0, min: 10, unit: 'Vials', expiry: 'Nov 2026', status: 'CRITICAL' },
    { id: 'stk_2', name: 'Tab. Amlodipine 5mg', current: 120, min: 500, unit: 'Tabs', expiry: 'Jan 2027', status: 'LOW' },
    { id: 'stk_3', name: 'Oxytocin 10 IU Injection', current: 15, min: 50, unit: 'Ampoules', expiry: 'Dec 2026', status: 'LOW' },
    { id: 'stk_4', name: 'ORS & Zinc Paediatric Kits', current: 45, min: 200, unit: 'Packs', expiry: 'Feb 2027', status: 'LOW' },
  ]);

  const [restockedIds, setRestockedIds] = useState<Record<string, boolean>>({});

  // Staff roster
  const staffRoster = [
    { name: 'Dr. Rajesh Shinde (MO)', role: 'Medical Officer MBBS', status: 'Present (On Duty)' },
    { name: 'Dr. Smita Bhor (Ayush MO)', role: 'Medical Officer BAMS', status: 'Present (OPD 2)' },
    { name: 'Sister Pratima Jadhav', role: 'Staff Nurse In-Charge', status: 'Present (Labor Room)' },
    { name: 'Sunita Jadhav', role: 'ASHA Field Coordinator', status: 'Field Visit (Velhe)' },
    { name: 'Santosh Kamble', role: 'Lab Technician', status: 'Present (Testing Room)' },
  ];

  // Escalation Inbox: High-priority patients who haven't reached destination hospital
  const escalations = referrals.filter(
    (r) => r.triageResult.level === 'HIGH' && r.status === 'REFERRED'
  );

  const toggleDiagnostic = (name: string) => {
    setLabStatus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleRequestRestock = (id: string, name: string) => {
    setRestockedIds((prev) => ({ ...prev, [id]: true }));
    alert(`Emergency restock requisition dispatched to District Drug Warehouse for ${name}.`);
  };

  const handleExportHmis = () => {
    alert(
      'Exporting HMIS-2026 Monthly Health Management Information System summary (Form 7 & 9) in CSV & PDF format.'
    );
  };

  // Drilldown items generator
  const getDrillDownItems = (): DrillDownItem[] => {
    switch (activeDrilldownType) {
      case 'opd':
        return patients.map((p) => {
          const conditions = p.existingConditions || p.chronicDiseases || [];
          return {
            id: p.id,
            title: `${p.name} (${p.age}y, ${p.gender})`,
            subtitle: `OPD Token #042 · Health ID: ${p.healthId}`,
            badge: conditions.length > 0 ? conditions[0] : 'General OPD',
            badgeColor: 'teal',
            date: '04 Oct 2026, 09:30 AM',
            detail: `Emergency Contact: ${p.emergencyContact || 'Family'} · Conditions: ${conditions.join(', ') || 'None'}`,
            actionLabel: 'Open Clinical Triage',
            onAction: onOpenTriage,
          };
        });
      case 'referrals_sent':
        return referrals.map((ref) => ({
          id: ref.id,
          title: `${ref.patientName} (${ref.patientAge}y)`,
          subtitle: `Destination: ${ref.destinationHospitalName} (${ref.triageResult.recommendedSpecialty})`,
          badge: ref.status,
          badgeColor: ref.status === 'COMPLETED' ? 'emerald' : ref.status === 'REFERRED' ? 'amber' : 'sky',
          date: ref.appointmentDate,
          detail: `Voucher #${ref.referralNumber} · Triaged by ${ref.referringHealthWorker}`,
          actionLabel: 'View Voucher',
          onAction: () => onViewSlip(ref),
        }));
      case 'referrals_completed':
        return referrals
          .filter((r) => r.status === 'COMPLETED' || r.status === 'UNDER_TREATMENT')
          .map((ref) => ({
            id: ref.id,
            title: `${ref.patientName} - Treatment Completed`,
            subtitle: `${ref.destinationHospitalName} · Doctor: ${ref.treatingDoctorName || 'Dr. Anil Kulkarni'}`,
            badge: 'DISCHARGED',
            badgeColor: 'emerald',
            detail: `Discharge advice: ${ref.doctorNotes || 'Continue antihypertensives; regular ASHA review'}`,
            actionLabel: 'View Summary',
            onAction: () => onViewSlip(ref),
          }));
      case 'stockouts':
        return medicinesStock.map((m) => ({
          id: m.id,
          title: m.name,
          subtitle: `Current: ${m.current} ${m.unit} (Safety Minimum: ${m.min} ${m.unit})`,
          badge: m.status,
          badgeColor: m.status === 'CRITICAL' ? 'rose' : 'amber',
          detail: `Expiry batch: ${m.expiry} · Storage: Cold Chain / PHC Pharmacy`,
          actionLabel: restockedIds[m.id] ? 'Requisition Sent' : 'Request Restock',
          onAction: () => handleRequestRestock(m.id, m.name),
        }));
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6" lang={language}>
      {/* High-Priority Alert Banner: High-Risk Escalation & ASV Stockout */}
      <div className="p-3.5 bg-gradient-to-r from-rose-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-rose-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                PHC Medical Officer Alert: 1 High-Priority Patient Overdue at Sassoon Hospital
              </span>
              <span className="text-[9px] uppercase font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                SLA Breached (&gt;24h)
              </span>
            </div>
            <p className="text-[11px] text-rose-100/90 mt-0.5">
              Ramesh Patil (HID-2026-0001, suspected ACS) has not checked in at Sassoon Cardiology OPD.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <a
            href="tel:9822104523"
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Patient</span>
          </a>
          <button
            type="button"
            onClick={() => setActiveDrilldownType('stockouts')}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            View Stockouts
          </button>
        </div>
      </div>

      {/* Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Dr. Rajesh Shinde · PHC Medical Officer
            </h1>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
              Velhe Primary Health Centre (PHC)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Outpatient department operations, sub-centre oversight, diagnostic readiness, and HMIS reporting
          </p>
        </div>

        <DateRangeFilter
          selectedRange={dateRange}
          onChangeRange={(r) => setDateRange(r)}
          lastUpdated="Today, 03:50 PM"
        />
      </div>

      {/* Top Row: 4 Stat Cards with DrillDown Integration */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="OPD Count Today"
          value="48"
          icon={<Stethoscope className="w-4 h-4 text-teal-700" />}
          color="teal"
          trend={{ value: '+12% this week', isPositive: true }}
          badge="General & Maternal OPD"
          onClick={() => setActiveDrilldownType('opd')}
        />
        <StatCard
          label="Referrals Sent"
          value={referrals.length || 7}
          icon={<FileText className="w-4 h-4 text-sky-700" />}
          color="sky"
          trend={{ value: '100% Digital Vouchers', isPositive: true }}
          badge="Tertiary / Specialist"
          onClick={() => setActiveDrilldownType('referrals_sent')}
        />
        <StatCard
          label="Referrals Completed"
          value={referrals.filter((r) => r.status === 'COMPLETED').length || 4}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          color="emerald"
          trend={{ value: '82% Closed Loop', isPositive: true }}
          badge="Discharge Slip Received"
          onClick={() => setActiveDrilldownType('referrals_completed')}
        />
        <StatCard
          label="Medicine Stockouts"
          value={medicinesStock.filter((m) => m.current === 0).length || 1}
          icon={<AlertTriangle className="w-4 h-4 text-rose-700" />}
          color="rose"
          trend={{ value: 'ASV 0 vials', isPositive: false }}
          badge="Emergency Indent"
          onClick={() => setActiveDrilldownType('stockouts')}
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>PHC Command Actions</span>
          </span>
          <span className="text-[11px] text-slate-400">Clinical & administrative tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onOpenTriage}
            className="p-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">1. New Outpatient Referral</div>
              <div className="text-[11px] text-teal-100 mt-0.5">Triage patient & match specialist bed</div>
            </div>
            <ArrowRight className="w-5 h-5 text-teal-200 group-hover:translate-x-1 transition" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('medicines')}
            className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">2. Check Medicine Inventory</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Manage stock & drug supply indents</div>
            </div>
            <Pill className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition" />
          </button>

          <button
            type="button"
            onClick={handleExportHmis}
            className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">3. Generate HMIS Monthly Report</div>
              <div className="text-[11px] text-indigo-100 mt-0.5">Download Form 7 & 9 for DHO office</div>
            </div>
            <Download className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Main Grid: Escalation Inbox, Disease Trends, Low-Stock Inventory, Diagnostic Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Escalation Inbox: High-Priority Patients Not Reached */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Escalation Inbox: High-Priority Patients Not Reached Destination</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Critical alerts triggered when patients referred to secondary/tertiary care exceed arrival SLA
                </p>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                {escalations.length || 1} Overdue
              </span>
            </div>

            <div className="space-y-3">
              {(escalations.length > 0 ? escalations : referrals.slice(0, 1)).map((ref) => (
                <div
                  key={ref.id}
                  className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{ref.patientName}</span>
                      <span className="text-xs text-slate-500 font-mono">({ref.patientHealthId})</span>
                      <span className="px-2 py-0.2 bg-rose-600 text-white text-[9px] font-extrabold rounded-full uppercase">
                        SLA Breached (&gt;24h)
                      </span>
                    </div>
                    <div className="text-xs text-slate-700">
                      Referred to <strong>{ref.destinationHospitalName}</strong> ({ref.triageResult.recommendedSpecialty})
                    </div>
                    <div className="text-[11px] text-rose-800 font-medium">
                      Suspected Acute Coronary Syndrome. Assigned ASHA: <strong>{ref.referringHealthWorker}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${ref.patientMobile}`}
                      className="px-3.5 py-2 bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-rose-600" />
                      <span>Call Family</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => onViewSlip(ref)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                    >
                      View Referral
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medicine Inventory Low-Stock & Expiry Alerts with Request Restock */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-amber-600" />
                  <span>Medicine Inventory & Low-Stock Alerts</span>
                </h3>
                <p className="text-xs text-slate-500">Live monitoring of essential drug store with one-tap restock indent</p>
              </div>
              <button
                onClick={() => onNavigateTab('medicines')}
                className="text-xs text-teal-700 font-bold hover:underline"
              >
                All Medicines →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2">Medicine Name</th>
                    <th className="py-2">Available Stock</th>
                    <th className="py-2">Min Threshold</th>
                    <th className="py-2">Expiry</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicinesStock.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5">
                        <div className="font-bold text-slate-900">{med.name}</div>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                            med.status === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {med.status}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono font-bold text-slate-900">
                        {med.current} {med.unit}
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono">
                        {med.min} {med.unit}
                      </td>
                      <td className="py-2.5 text-slate-600">{med.expiry}</td>
                      <td className="py-2.5 text-right">
                        {restockedIds[med.id] ? (
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Requested</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestRestock(med.id, med.name)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition shadow-2xs"
                          >
                            Request Restock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disease Trend Chart for PHC Catchment Area */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Catchment Disease Surveillance (Velhe & Surrounding 14 Villages)
                </h3>
                <p className="text-xs text-slate-500">Weekly epidemiological trends reported by ASHA network</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                Week 40 / 2026
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Acute Fever</span>
                <div className="font-mono text-xl font-extrabold text-amber-950 mt-0.5">38 cases</div>
                <span className="text-[10px] text-amber-700 mt-1 block">▲ +14% (Outbreak Alert)</span>
              </div>

              <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl">
                <span className="text-[10px] text-sky-800 font-bold uppercase block">Hypertension / NCD</span>
                <div className="font-mono text-xl font-extrabold text-sky-950 mt-0.5">82 cases</div>
                <span className="text-[10px] text-emerald-700 mt-1 block">94% on regular treatment</span>
              </div>

              <div className="p-3.5 bg-pink-50/70 border border-pink-200 rounded-2xl">
                <span className="text-[10px] text-pink-800 font-bold uppercase block">ANC Registrations</span>
                <div className="font-mono text-xl font-extrabold text-pink-950 mt-0.5">24 mothers</div>
                <span className="text-[10px] text-pink-700 mt-1 block">4 high-risk identified</span>
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Child Diarrhea</span>
                <div className="font-mono text-xl font-extrabold text-emerald-950 mt-0.5">6 cases</div>
                <span className="text-[10px] text-emerald-700 mt-1 block">▼ -40% (Clean water drive)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Staff Roster, Diagnostic Toggles & Sub-centre Performance */}
        <div className="space-y-6">
          {/* Staff Roster & Attendance */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-600" />
              <span>PHC Staff Roster & Attendance</span>
            </h3>

            <div className="space-y-2 text-xs">
              {staffRoster.map((staff, idx) => (
                <div key={idx} className="p-2.5 bg-white/70 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{staff.name}</div>
                    <div className="text-[10px] text-slate-500">{staff.role}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {staff.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic & Equipment Availability Toggles */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Diagnostic Equipment Status</span>
              </h3>
              <span className="text-[10px] text-teal-700 font-mono">Live Sync</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Toggle equipment operational status to automatically update the AI referral recommendation engine:
            </p>

            <div className="space-y-2 text-xs">
              {Object.entries(labStatus).map(([equip, isWorking]) => (
                <div
                  key={equip}
                  className="flex items-center justify-between p-2.5 bg-white/70 rounded-xl border border-slate-200"
                >
                  <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[160px]">{equip}</span>
                  <button
                    type="button"
                    onClick={() => toggleDiagnostic(equip)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition ${
                      isWorking
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {isWorking ? '● Working' : '✕ Down for Repair'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Outcomes & Sub-Centre Performance */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-teal-200/80 bg-gradient-to-br from-teal-50/70 to-white/90 space-y-3">
            <span className="font-bold text-teal-950 text-xs flex items-center gap-1">
              <Building className="w-4 h-4 text-teal-600" />
              <span>Referral Outcomes & Completion Rates</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 bg-white/80 rounded-xl border border-teal-200">
                <span className="text-[10px] text-slate-500 block">Avg. Transit Time</span>
                <span className="font-bold text-teal-900 font-mono text-sm">48 mins</span>
              </div>
              <div className="p-2 bg-white/80 rounded-xl border border-teal-200">
                <span className="text-[10px] text-slate-500 block">Treatment Rate</span>
                <span className="font-bold text-emerald-800 font-mono text-sm">82.4%</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 space-y-2 pt-1">
              <div>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Velhe Sub-Centre:</span>
                  <span>92% (23/25)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Pasure Sub-Centre:</span>
                  <span>78% (14/18)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: '78%' }} />
                </div>
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
          activeDrilldownType === 'opd'
            ? 'Today’s Outpatient Department (OPD) Roster'
            : activeDrilldownType === 'referrals_sent'
            ? 'Referrals Sent to Secondary / Tertiary Hospitals'
            : activeDrilldownType === 'referrals_completed'
            ? 'Completed Referrals & Discharge Outcomes'
            : 'Medicine Inventory & Stockout Requisitions'
        }
        category="PHC Medical Officer Drilldown"
        items={getDrillDownItems()}
      />
    </div>
  );
};
