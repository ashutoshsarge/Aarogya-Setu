import React, { useState } from 'react';
import { Hospital, Patient, Referral, Language } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { StatCard } from '../shared/StatCard';
import { DateRangeFilter, DateRangeOption } from '../shared/DateRangeFilter';
import { DrillDownModal, DrillDownItem } from '../shared/DrillDownModal';
import {
  ShieldCheck,
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MapPin,
  Download,
  Activity,
  Heart,
  Baby,
  Star,
  Sparkles,
  BarChart3,
  UserCheck,
  X,
  Search,
  Check,
  Clock,
  Layers,
  Flame,
  Radio,
  Building,
} from 'lucide-react';

interface AdminDashboardProps {
  referrals: Referral[];
  hospitals: Hospital[];
  patients: Patient[];
  language: Language;
  onNavigateAudit: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  referrals,
  hospitals,
  patients,
  language,
  onNavigateAudit,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[language];
  const [dateRange, setDateRange] = useState<DateRangeOption>('30days');
  const [activeDrilldownType, setActiveDrilldownType] = useState<string | null>(null);

  // User management pending approvals state
  const [pendingUsers, setPendingUsers] = useState([
    { id: 'usr_p1', name: 'Dr. Neha Kulkarni (OBGYN)', role: 'Doctor', facility: 'Baramati Sub-District Hosp', status: 'PENDING' },
    { id: 'usr_p2', name: 'Pooja Salunkhe (ANM)', role: 'Health Worker', facility: 'Uruli Kanchan Sub-Centre', status: 'PENDING' },
  ]);

  const handleApproveUser = (id: string) => {
    setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    alert('User account approved and credentials activated in District Health Registry.');
  };

  const handleRejectUser = (id: string) => {
    setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    alert('User registration rejected.');
  };

  const handleExportCsv = () => {
    alert('Exporting Full District Report (HMIS/NHM Form 9) in CSV & PDF format for State Health Department.');
  };

  // Referral Funnel calculations
  const totalReferred = referrals.length || 10;
  const totalReached = referrals.filter((r) => r.status !== 'REFERRED').length || 8;
  const totalTreated = referrals.filter((r) => r.status === 'UNDER_TREATMENT' || r.status === 'COMPLETED').length || 6;
  const totalFollowedUp = referrals.filter((r) => r.followUpStatus === 'DONE' || r.status === 'COMPLETED').length || 5;

  // Facility Performance Table Data
  const facilityPerformanceData = [
    { name: 'Sassoon General Hospital (Pune)', type: 'Tertiary Medical College', opdVolume: 1840, bedOccupancy: '89%', acceptRate: '98.2%', waitTime: '24 mins', loadStatus: 'HIGH' },
    { name: 'Aundh District Hospital', type: 'District Civil Hospital', opdVolume: 820, bedOccupancy: '74%', acceptRate: '94.5%', waitTime: '32 mins', loadStatus: 'NORMAL' },
    { name: 'Sub-District Hospital Baramati', type: 'Sub-District Hospital', opdVolume: 610, bedOccupancy: '68%', acceptRate: '91.0%', waitTime: '28 mins', loadStatus: 'NORMAL' },
    { name: 'Narayangaon Rural Hospital', type: 'Rural Hospital (RH)', opdVolume: 430, bedOccupancy: '58%', acceptRate: '88.4%', waitTime: '18 mins', loadStatus: 'LOW' },
    { name: 'Velhe Primary Health Centre', type: 'Primary Health Centre (PHC)', opdVolume: 240, bedOccupancy: '50%', acceptRate: '96.0%', waitTime: '12 mins', loadStatus: 'LOW' },
  ];

  // Health Worker Coverage: sub-centres with vacancies or low visit rates
  const coverageData = [
    { subCentre: 'Pasure Sub-Centre', taluka: 'Bhor', worker: 'Vacant (1 ANM post)', visitRate: '42%', status: 'ACTION_NEEDED' },
    { subCentre: 'Khadakwasla Rural', taluka: 'Haveli', worker: '2 ASHA assigned', visitRate: '91%', status: 'OPTIMAL' },
    { subCentre: 'Kelawade Sub-Centre', taluka: 'Bhor', worker: '1 ASHA assigned', visitRate: '68%', status: 'NEEDS_SUPPORT' },
    { subCentre: 'Velhe Sub-Centre', taluka: 'Velhe', worker: 'Sunita Jadhav (ASHA)', visitRate: '96%', status: 'OPTIMAL' },
  ];

  // Audit Log Recent Events
  const recentAuditEvents = [
    { id: 'aud_1', time: '10 mins ago', user: 'Dr. Anil Kulkarni (Cardiology)', action: 'Viewed ECG & Vitals for Ramesh Patil (HID-2026-0001)' },
    { id: 'aud_2', time: '28 mins ago', user: 'Sunita Jadhav (ASHA)', action: 'Updated home visit checklist & BP reading' },
    { id: 'aud_3', time: '1 hour ago', user: 'Dr. Rajesh Shinde (MO)', action: 'Dispensed emergency antivenom restock indent' },
  ];

  // Drilldown items generator
  const getDrillDownItems = (): DrillDownItem[] => {
    switch (activeDrilldownType) {
      case 'patients':
        return patients.map((p) => {
          const conditions = p.existingConditions || p.chronicDiseases || [];
          return {
            id: p.id,
            title: `${p.name} (${p.age}y, ${p.gender})`,
            subtitle: `Health ID: ${p.healthId} · Taluka: ${p.taluka} (${p.village})`,
            badge: 'ACTIVE REGISTRY',
            badgeColor: 'teal',
            date: `Reg Date: 2026`,
            detail: `Linked ABHA: ${p.abhaNumber || '91-XXXX-XXXX'} · Conditions: ${conditions.join(', ') || 'Healthy'}`,
            actionLabel: 'Inspect Patient',
            onAction: () => onNavigateTab('referrals'),
          };
        });
      case 'referrals':
        return referrals.map((ref) => ({
          id: ref.id,
          title: `${ref.patientName} (${ref.patientHealthId})`,
          subtitle: `From ${ref.referringFacility} -> ${ref.destinationHospitalName}`,
          badge: ref.status,
          badgeColor: ref.status === 'COMPLETED' ? 'emerald' : ref.status === 'REFERRED' ? 'amber' : 'sky',
          date: ref.appointmentDate,
          detail: `Voucher: ${ref.referralNumber} · Specialty: ${ref.triageResult.recommendedSpecialty}`,
          actionLabel: 'View Digital Slip',
          onAction: () => onNavigateTab('referrals'),
        }));
      case 'completion':
        return [
          {
            id: 'c1',
            title: 'Sassoon General Hospital Referral Continuum',
            subtitle: '142 referrals completed / 164 generated (86.5% completion rate)',
            badge: 'TOP PERFORMER',
            badgeColor: 'emerald',
            detail: 'Average patient transit time: 42 mins. Zero emergency bounce-backs.',
          },
          {
            id: 'c2',
            title: 'Baramati Sub-District Hospital Continuum',
            subtitle: '88 referrals completed / 105 generated (83.8% completion rate)',
            badge: 'GOOD STANDING',
            badgeColor: 'teal',
            detail: 'High compliance with follow-up protocols for obstetrics and trauma.',
          },
        ];
      case 'facilities':
        return facilityPerformanceData.map((f, idx) => ({
          id: `fac_${idx}`,
          title: f.name,
          subtitle: `${f.type} · OPD Volume: ${f.opdVolume} patients/day`,
          badge: `${f.bedOccupancy} Beds Full`,
          badgeColor: f.loadStatus === 'HIGH' ? 'rose' : 'teal',
          detail: `Referral Acceptance: ${f.acceptRate} · Average OPD Wait: ${f.waitTime}`,
          actionLabel: 'Inspect Facility',
          onAction: () => onNavigateTab('analytics'),
        }));
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6" lang={language}>
      {/* High-Priority Alert Banner: Disease Outbreak & Supply Chain Stockout */}
      <div className="p-3.5 bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 text-white rounded-2xl border border-amber-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                District Early Warning Surveillance: Cluster of 8 Fever Cases in Velhe Taluka
              </span>
              <span className="text-[9px] uppercase font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                Outbreak Alert
              </span>
            </div>
            <p className="text-[11px] text-amber-100/90 mt-0.5">
              Epidemiology rapid response team dispatched. Also monitoring Critical Anti-Snake Venom stockout at Velhe PHC.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onNavigateTab('analytics')}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
          >
            Open Outbreak Map
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Export DHO Report
          </button>
        </div>
      </div>

      {/* Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              District Health Officer (DHO) · Pune Administrative Dashboard
            </h1>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
              Pune Zilla Parishad Health Division
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            District-wide referral oversight, multi-facility capacity monitoring, gap analysis, and epidemiological surveillance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 glass-card rounded-xl text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export District CSV/PDF</span>
          </button>

          <DateRangeFilter
            selectedRange={dateRange}
            onChangeRange={(r) => setDateRange(r)}
            lastUpdated="Today, 04:00 PM"
          />
        </div>
      </div>

      {/* Top Row: 4 Summary Stat Cards with DrillDown Integration */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Registered Patients"
          value={patients.length * 140 || 1420}
          icon={<Users className="w-4 h-4 text-teal-700" />}
          color="teal"
          trend={{ value: '+18% this month', isPositive: true }}
          badge="14 Pune Talukas"
          onClick={() => setActiveDrilldownType('patients')}
        />
        <StatCard
          label="Referrals This Month"
          value={referrals.length * 15 || 185}
          icon={<FileText className="w-4 h-4 text-sky-700" />}
          color="sky"
          trend={{ value: '100% Digital Slips', isPositive: true }}
          badge="Avg transit 44m"
          onClick={() => setActiveDrilldownType('referrals')}
        />
        <StatCard
          label="Treatment Completion Rate"
          value="84.2%"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          color="emerald"
          trend={{ value: '+6.4% YoY', isPositive: true }}
          badge="Closed-Loop Validated"
          onClick={() => setActiveDrilldownType('completion')}
        />
        <StatCard
          label="Active Facilities Monitored"
          value={facilityPerformanceData.length}
          icon={<Building2 className="w-4 h-4 text-indigo-700" />}
          color="indigo"
          trend={{ value: 'PHCs & Hospitals', isPositive: true }}
          badge="100% Online"
          onClick={() => setActiveDrilldownType('facilities')}
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>District Administrative Operations</span>
          </span>
          <span className="text-[11px] text-slate-400">Governance, Security & Workforce</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onNavigateAudit}
            className="p-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">1. Open DPDP Security Audit Log</div>
              <div className="text-[11px] text-teal-100 mt-0.5">Inspect patient record access & edits</div>
            </div>
            <ShieldCheck className="w-5 h-5 text-teal-200 group-hover:translate-x-1 transition" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('analytics')}
            className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">2. Village-Wise Gap Heatmap</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Identify underserved blocks & missing tests</div>
            </div>
            <MapPin className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition" />
          </button>

          <button
            type="button"
            onClick={() => setActiveDrilldownType('facilities')}
            className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-left transition cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div>
              <div className="font-extrabold text-sm">3. Facility Capacity Performance</div>
              <div className="text-[11px] text-indigo-100 mt-0.5">Review bed occupancy & wait times</div>
            </div>
            <Building2 className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Main Grid: Referral Funnel, Facility Performance Table, Map & Early Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Funnel, Facility Performance Table, Heatmap Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Referral Funnel (Referred -> Reached -> Treated -> Followed Up) */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Referral Funnel & Drop-off Tracker
                </h3>
                <p className="text-xs text-slate-500">
                  Visualizing patient continuity from primary sub-centre to tertiary completion
                </p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                District Aggregate
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { stage: '1. Initial Referral Generated', count: totalReferred, percent: 100, color: 'bg-blue-600' },
                { stage: '2. Reached Destination OPD', count: totalReached, percent: 84, color: 'bg-teal-600' },
                { stage: '3. Completed In-Hospital Treatment', count: totalTreated, percent: 72, color: 'bg-amber-600' },
                { stage: '4. Post-Discharge ASHA Follow-up Done', count: totalFollowedUp, percent: 64, color: 'bg-emerald-600' },
              ].map((step, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{step.stage}</span>
                    <span className="font-mono">{step.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${step.color} transition-all duration-500`}
                      style={{ width: `${step.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-teal-50/80 rounded-2xl border border-teal-200 text-xs text-teal-950 flex items-center justify-between">
              <span>
                💡 Drop-off Insight: <strong>16%</strong> of referred patients do not reach the tertiary hospital within 48h. ASHA automated alerts reduced this drop-off by <strong>32%</strong> this quarter.
              </span>
            </div>
          </div>

          {/* Facility Performance Table: OPD Volume, Bed Occupancy, Referral Acceptance, Wait Time */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Facility Performance & Capacity Monitor
                </h3>
                <p className="text-xs text-slate-500">Live metrics across tertiary, sub-district, and primary facilities</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                5 Monitored
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2">Hospital Facility</th>
                    <th className="py-2">OPD Volume</th>
                    <th className="py-2">Bed Occupancy</th>
                    <th className="py-2">Acceptance</th>
                    <th className="py-2">Avg Wait Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facilityPerformanceData.map((fac, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5">
                        <div className="font-bold text-slate-900">{fac.name}</div>
                        <div className="text-[10px] text-slate-400">{fac.type}</div>
                      </td>
                      <td className="py-2.5 font-mono text-slate-800 font-semibold">{fac.opdVolume}/d</td>
                      <td className="py-2.5">
                        <span
                          className={`font-mono font-bold ${
                            fac.loadStatus === 'HIGH' ? 'text-rose-700' : 'text-slate-800'
                          }`}
                        >
                          {fac.bedOccupancy}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-emerald-800 font-bold">{fac.acceptRate}</td>
                      <td className="py-2.5 text-slate-600 font-mono">{fac.waitTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* District Map with Facility Markers & Heatmap Preview */}
          <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>District Map: Facility Load & Referral Heatmap</span>
                </h3>
                <p className="text-xs text-slate-500">Color-coded facility status across Pune catchment</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('analytics')}
                className="text-xs text-teal-700 font-bold hover:underline"
              >
                Interactive Map View →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950">Sassoon General</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                </div>
                <div className="text-[11px] text-rose-800 mt-1">Pune City · 89% Bed Occupancy (Heavy Load)</div>
              </div>

              <div className="p-3 bg-teal-50/80 rounded-2xl border border-teal-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-950">Aundh District</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                </div>
                <div className="text-[11px] text-teal-800 mt-1">Haveli · 74% Occupancy (Optimal Load)</div>
              </div>

              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950">Baramati Sub-District</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] text-emerald-800 mt-1">Baramati · 68% Occupancy (Available)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Approvals, Health Worker Coverage, Supply Chain, Audit Log */}
        <div className="space-y-6">
          {/* Health Worker Coverage & Vacancies */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Health Worker Coverage & Sub-Centres</span>
            </h3>

            <div className="space-y-2 text-xs">
              {coverageData.map((cov, idx) => (
                <div key={idx} className="p-2.5 bg-white/70 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">{cov.subCentre}</span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                        cov.status === 'ACTION_NEEDED'
                          ? 'bg-rose-100 text-rose-800'
                          : cov.status === 'NEEDS_SUPPORT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {cov.visitRate} Visits
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">Taluka: {cov.taluka} · {cov.worker}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Medicine Supply Chain: Critical Stockouts */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Critical Medicine Supply Stockouts</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Velhe Primary Health Centre</span>
                  <span className="text-rose-700">0 Vials Available</span>
                </div>
                <div className="text-[11px] text-rose-900 mt-0.5 font-medium">
                  Anti-Snake Venom (ASV) · Requisition dispatched to Central Medical Store
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Uruli Kanchan PHC</span>
                  <span className="text-amber-800">Low Stock</span>
                </div>
                <div className="text-[11px] text-amber-900 mt-0.5">
                  Tab. Metformin 500mg · Buffer below 7 days
                </div>
              </div>
            </div>
          </div>

          {/* DPDP Patient Record Audit Log Preview */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Recent DPDP Audit Log Events</span>
              </h3>
              <button
                type="button"
                onClick={onNavigateAudit}
                className="text-[11px] text-teal-700 font-bold hover:underline"
              >
                All Logs →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {recentAuditEvents.map((ev) => (
                <div key={ev.id} className="p-2.5 bg-white/70 rounded-xl border border-slate-200 space-y-0.5">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-bold text-slate-700">{ev.user}</span>
                    <span>{ev.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">{ev.action}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending User Approvals */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-white/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>Staff Account Approvals</span>
              </h3>
              <span className="text-xs font-bold text-teal-700 font-mono">{pendingUsers.length} Pending</span>
            </div>

            {pendingUsers.length > 0 ? (
              <div className="space-y-2 text-xs">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="p-3 bg-white/70 rounded-xl border border-slate-200 space-y-2">
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.role} · {u.facility}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleApproveUser(u.id)}
                        className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectUser(u.id)}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-[10px] rounded-lg cursor-pointer transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 text-center text-xs text-slate-400">All staff registrations verified</div>
            )}
          </div>
        </div>
      </div>

      {/* DrillDown Modal */}
      <DrillDownModal
        isOpen={Boolean(activeDrilldownType)}
        onClose={() => setActiveDrilldownType(null)}
        title={
          activeDrilldownType === 'patients'
            ? 'Total Registered Citizens Across Pune'
            : activeDrilldownType === 'referrals'
            ? 'District-Wide Monthly Referrals'
            : activeDrilldownType === 'completion'
            ? 'Treatment Completion & Closed-Loop Audits'
            : 'Facility Capacity & Bed Readiness Matrix'
        }
        category="District Health Office Drilldown"
        items={getDrillDownItems()}
      />
    </div>
  );
};
