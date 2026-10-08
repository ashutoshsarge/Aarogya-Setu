import React, { useState } from 'react';
import { Referral, ReferralStatus, UserRole, Language, PatientFeedback } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  UserCheck,
  Stethoscope,
  Pill,
  ChevronRight,
  AlertCircle,
  Video,
  MessageSquare,
  Star,
  Building2,
  AlertTriangle,
  History,
} from 'lucide-react';

interface ReferralsListProps {
  referrals: Referral[];
  userRole: UserRole;
  language: Language;
  onViewSlip: (referral: Referral) => void;
  onUpdateStatus: (
    referralId: string,
    newStatus: ReferralStatus,
    notes?: string,
    doctorName?: string,
    prescriptions?: { medicineName: string; dosage: string; frequency: string; duration: string }[]
  ) => void;
  onOpenTeleconsultModal?: (referral: Referral) => void;
  onOpenNotificationModal?: (referral: Referral) => void;
  onOpenFeedbackModal?: (referral: Referral) => void;
}

export const ReferralsList: React.FC<ReferralsListProps> = ({
  referrals,
  userRole,
  language,
  onViewSlip,
  onUpdateStatus,
  onOpenTeleconsultModal,
  onOpenNotificationModal,
  onOpenFeedbackModal,
}) => {
  const t = TRANSLATIONS[language];
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Status updating modal state
  const [activeModalReferral, setActiveModalReferral] = useState<Referral | null>(null);
  const [modalTargetStatus, setModalTargetStatus] = useState<ReferralStatus>('REACHED');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [doctorNameInput, setDoctorNameInput] = useState('Dr. Anand Deshmukh, MD');
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: 'Tab. Paracetamol 650mg', dosage: '1 tab', frequency: 'Three times daily', duration: '5 days' },
  ]);

  const filteredReferrals = referrals.filter((r) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'HIGH_URGENCY') return r.triageResult.level === 'HIGH';
    return r.status === filterStatus;
  });

  const getStatusBadge = (status: ReferralStatus) => {
    switch (status) {
      case 'REFERRED':
        return {
          label: language === 'mr' ? 'संदर्भित (प्रवासात)' : language === 'hi' ? 'रेफर किया गया (ट्रांजिट)' : 'Referred (Transit)',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'REACHED':
        return {
          label: language === 'mr' ? 'रुग्णालयात पोहोचले' : language === 'hi' ? 'अस्पताल पहुंचे' : 'Reached Facility',
          color: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'UNDER_TREATMENT':
        return {
          label: language === 'mr' ? 'उपचार सुरू' : language === 'hi' ? 'उपचार जारी' : 'Under Treatment',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'COMPLETED':
        return {
          label: language === 'mr' ? 'उपचार पूर्ण' : language === 'hi' ? 'उपचार पूरा हुआ' : 'Treatment Completed',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
    }
  };

  const openStatusTransitionModal = (referral: Referral, targetStatus: ReferralStatus) => {
    setActiveModalReferral(referral);
    setModalTargetStatus(targetStatus);
    setTreatmentNotes(referral.doctorNotes || '');
    if (referral.treatingDoctorName) {
      setDoctorNameInput(referral.treatingDoctorName);
    }
  };

  const handleConfirmStatusChange = () => {
    if (!activeModalReferral) return;

    onUpdateStatus(
      activeModalReferral.id,
      modalTargetStatus,
      treatmentNotes,
      doctorNameInput,
      modalTargetStatus === 'COMPLETED' ? prescriptions : undefined
    );

    setActiveModalReferral(null);
  };

  const handleAddPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      { medicineName: '', dosage: '1 tab', frequency: 'Twice daily', duration: '7 days' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            {t.referralTrackerTitle || t.navReferrals}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.referralTrackerSubtitle || 'Closed-loop patient referral and treatment tracking across Pune district health network'}
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'ALL', label: t.filterAllCases || 'All Cases' },
            { id: 'HIGH_URGENCY', label: t.filterHighUrgency || '🚨 High Urgency' },
            { id: 'REFERRED', label: t.filterReferred || 'Referred' },
            { id: 'REACHED', label: t.filterReached || 'Reached' },
            { id: 'UNDER_TREATMENT', label: t.filterInTreatment || 'In Treatment' },
            { id: 'COMPLETED', label: t.filterCompleted || 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Referral Cards List */}
      <div className="space-y-4">
        {filteredReferrals.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">{t.noReferralsFound || 'No referrals found matching the filter criteria.'}</p>
          </div>
        ) : (
          filteredReferrals.map((ref) => {
            const statusInfo = getStatusBadge(ref.status);
            const isHighPriorityOverdue =
              ref.triageResult.level === 'HIGH' &&
              ref.status === 'REFERRED' &&
              new Date().getTime() - new Date(ref.createdAt).getTime() > 2 * 3600 * 1000;

            return (
              <div
                key={ref.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition hover:shadow-sm space-y-4"
              >
                {/* Auto-escalation banner if high priority patient hasn't reached within 2 hours */}
                {isHighPriorityOverdue && (
                  <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-center justify-between text-xs text-red-900">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
                      <div>
                        <strong className="block">{t.transitOverdueAlert || 'Auto-Escalation Alert: Emergency Patient Transit Overdue'}</strong>
                        <span className="text-[11px] text-red-700">
                          {t.transitOverdueSub || 'Patient was referred >2 hours ago but has not reached destination hospital! Alert sent to PHC Medical Officer.'}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${ref.patientMobile}`}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shrink-0 shadow-xs"
                    >
                      {t.callFamilyNow || 'Call Family Now'}
                    </a>
                  </div>
                )}

                {/* Top zone: Ref Number, Urgency Badge, Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {ref.referralNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        ref.triageResult.level === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : ref.triageResult.level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ref.triageResult.level} {language === 'mr' ? 'प्राधान्य' : language === 'hi' ? 'प्राथमिकता' : 'PRIORITY'}
                    </span>
                    {ref.isTeleconsultation && (
                      <span className="bg-teal-100 text-teal-800 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <Video className="w-3 h-3" /> Teleconsult
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    {onOpenNotificationModal && (
                      <button
                        onClick={() => onOpenNotificationModal(ref)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                        title="View SMS/WhatsApp Message Sent"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        <span>SMS / WA</span>
                      </button>
                    )}
                    <button
                      onClick={() => onViewSlip(ref)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{t.printVoucher || t.printSlip || 'Print Slip'}</span>
                    </button>
                  </div>
                </div>

                {/* Patient Summary & Facility Routing */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  {/* Patient Info (4 cols) */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      {language === 'mr' ? 'रुग्ण' : language === 'hi' ? 'मरीज़' : 'Patient'}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{ref.patientName}</div>
                    <div className="text-slate-600">
                      {ref.patientAge}y · {ref.patientGender} · {ref.patientVillage}, Taluka {ref.patientTaluka}
                    </div>
                    <div className="font-mono text-slate-500">Health ID: {ref.patientHealthId}</div>
                  </div>

                  {/* Transfer Pipeline (5 cols) */}
                  <div className="md:col-span-5 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      {language === 'mr' ? 'संदर्भ सेवा मार्ग' : language === 'hi' ? 'रेफरल मार्ग' : 'Referral Route'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-800">
                      <span className="font-medium text-slate-600">{ref.referringFacility}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="font-bold text-slate-900">{ref.destinationHospitalName}</span>
                    </div>
                    <div className="text-teal-800 font-medium">
                      Dept: {ref.triageResult.recommendedSpecialty} · Slot: {ref.appointmentSlot}
                    </div>

                    {/* Alternative Hospital Suggestion */}
                    {ref.alternativeHospital && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                        <span className="font-semibold text-slate-700">
                          {language === 'mr' ? 'पर्यायी रुग्णालय: ' : language === 'hi' ? 'वैकल्पिक अस्पताल: ' : 'Backup Facility: '}
                        </span>
                        <span>{ref.alternativeHospital.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Timestamps (3 cols) */}
                  <div className="md:col-span-3 space-y-1 md:text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      {language === 'mr' ? 'वेळ नोंद' : language === 'hi' ? 'समय रेखा' : 'Timeline'}
                    </div>
                    <div className="text-slate-600">
                      {language === 'mr' ? 'संदर्भित: ' : language === 'hi' ? 'रेफर किया: ' : 'Referred: '}
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </div>
                    {ref.reachedAt && (
                      <div className="text-purple-700 font-medium">
                        {language === 'mr' ? 'पोहोचले: ' : language === 'hi' ? 'पहुंचे: ' : 'Reached: '}
                        {new Date(ref.reachedAt).toLocaleDateString()}
                      </div>
                    )}
                    {ref.completedAt && (
                      <div className="text-emerald-700 font-semibold">
                        {language === 'mr' ? 'पूर्ण: ' : language === 'hi' ? 'पूर्ण: ' : 'Completed: '}
                        {new Date(ref.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive Status Timeline */}
                {ref.timeline && ref.timeline.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-teal-600" />
                      <span>{language === 'mr' ? 'रेफरल टप्पा बदल इतिहास' : language === 'hi' ? 'रेफरल स्थिति बदलाव इतिहास' : 'Referral Transition Timeline (Audited Events)'}</span>
                    </div>

                    <div className="space-y-1.5">
                      {ref.timeline.map((evt, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-teal-800 font-mono">[{evt.stage}]</span>
                            <span className="text-slate-900 font-medium">{evt.operator}</span>
                            <span className="text-slate-400">({evt.facility})</span>
                          </div>
                          <span className="font-mono text-slate-500 text-[10px]">
                            {new Date(evt.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Notes & Prescriptions */}
                {ref.doctorNotes && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>{language === 'mr' ? 'डॉक्टरांच्या तपासणी नोंदी' : language === 'hi' ? 'डॉक्टर की चिकित्सीय टिप्पणी' : "Doctor's Clinical Notes"} ({ref.treatingDoctorName || 'Attending Physician'})</span>
                      <span className="text-[10px] text-slate-400 font-mono">EHR</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{ref.doctorNotes}</p>

                    {ref.prescriptions && ref.prescriptions.length > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <span className="font-semibold text-slate-700 block mb-1">
                          {language === 'mr' ? 'डिस्चार्ज औषधोपचार:' : language === 'hi' ? 'डिस्चार्ज दवाएं:' : 'Prescribed Discharge Routine:'}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {ref.prescriptions.map((rx, idx) => (
                            <span key={idx} className="bg-white px-2.5 py-1 rounded-lg border text-[11px] text-slate-800 font-medium">
                              💊 {rx.medicineName} · {rx.frequency} ({rx.duration})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Patient Feedback if available */}
                {ref.feedback && (
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-emerald-900 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{language === 'mr' ? 'रुग्ण अभिप्राय:' : language === 'hi' ? 'मरीज़ की प्रतिक्रिया:' : 'Patient Feedback:'} {ref.feedback.rating}/5 Stars</span>
                        <span className="text-emerald-700 font-normal">· {language === 'mr' ? 'प्रतीक्षा वेळ:' : language === 'hi' ? 'प्रतीक्षा समय:' : 'Wait time:'} {ref.feedback.waitingTimeRating}</span>
                      </div>
                      {ref.feedback.feedbackNote && (
                        <p className="text-slate-600 mt-0.5">"{ref.feedback.feedbackNote}"</p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Verified Citizen Review</span>
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {ref.status === 'REFERRED' && (
                    <button
                      onClick={() => openStatusTransitionModal(ref, 'REACHED')}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'रुग्ण पोहोचल्याची नोंद करा' : language === 'hi' ? 'मरीज़ आगमन दर्ज करें' : 'Mark Patient Reached'}</span>
                    </button>
                  )}

                  {ref.status === 'REACHED' && (
                    <button
                      onClick={() => openStatusTransitionModal(ref, 'UNDER_TREATMENT')}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'उपचार सुरू करा व नोंद करा' : language === 'hi' ? 'उपचार प्रारंभ करें व नोट्स जोड़ें' : 'Begin Treatment & Add Notes'}</span>
                    </button>
                  )}

                  {ref.status === 'UNDER_TREATMENT' && (
                    <button
                      onClick={() => openStatusTransitionModal(ref, 'COMPLETED')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'उपचार पूर्ण करा व प्रिस्क्रिप्शन द्या' : language === 'hi' ? 'उपचार पूर्ण करें व पर्चा दें' : 'Complete Treatment & Prescribe'}</span>
                    </button>
                  )}

                  {ref.status === 'COMPLETED' && !ref.feedback && onOpenFeedbackModal && (
                    <button
                      onClick={() => onOpenFeedbackModal(ref)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'रुग्ण अभिप्राय नोंदवा' : language === 'hi' ? 'मरीज़ प्रतिक्रिया दर्ज करें' : 'Record Patient Feedback'}</span>
                    </button>
                  )}

                  {ref.isTeleconsultation && onOpenTeleconsultModal && (
                    <button
                      onClick={() => onOpenTeleconsultModal(ref)}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'टेलिकन्सल्टेशन सुरू करा' : language === 'hi' ? 'टेलीकंसल्टेशन शुरू करें' : 'Enter Teleconsult Booth'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Status Transition Modal */}
      {activeModalReferral && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <span className="font-bold text-sm">
                {language === 'mr' ? 'स्थिती बदला: ' : language === 'hi' ? 'स्थिति अपडेट: ' : 'Update Status: '}
                {activeModalReferral.patientName} ({activeModalReferral.referralNumber})
              </span>
              <button
                onClick={() => setActiveModalReferral(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  {language === 'mr' ? 'नवीन स्थिती:' : language === 'hi' ? 'लक्षित स्थिति:' : 'Target Status:'}
                </span>
                <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg font-bold uppercase inline-block">
                  {modalTargetStatus}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t.doctorNameLabel || 'Treating Doctor / Attending Physician Name:'}
                </label>
                <input
                  type="text"
                  value={doctorNameInput}
                  onChange={(e) => setDoctorNameInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t.doctorNotesLabel || 'Clinical Examination & Treatment Findings:'}
                </label>
                <textarea
                  rows={3}
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  placeholder={language === 'mr' ? 'निदान, केलेल्या तपासण्या, उपचार तपशील...' : language === 'hi' ? 'जांच निष्कर्ष, उपचार विवरण, प्रक्रिया...' : 'Record diagnosis findings, investigations conducted, procedures...'}
                  className="w-full text-xs px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {modalTargetStatus === 'COMPLETED' && (
                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{t.dischargePrescriptions || 'Digital Discharge Prescriptions'}</span>
                    <button
                      type="button"
                      onClick={handleAddPrescriptionRow}
                      className="text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
                    >
                      {t.addMedicineRow || '+ Add Medicine'}
                    </button>
                  </div>

                  {prescriptions.map((rx, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-1.5">
                      <input
                        type="text"
                        placeholder={language === 'mr' ? 'औषधाचे नाव' : language === 'hi' ? 'दवा का नाम' : 'Medicine name'}
                        value={rx.medicineName}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[idx].medicineName = e.target.value;
                          setPrescriptions(updated);
                        }}
                        className="col-span-5 px-2.5 py-1.5 border rounded-lg text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder={language === 'mr' ? 'प्रमाण / वेळ' : language === 'hi' ? 'मात्रा / समय' : 'Frequency'}
                        value={rx.frequency}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[idx].frequency = e.target.value;
                          setPrescriptions(updated);
                        }}
                        className="col-span-4 px-2.5 py-1.5 border rounded-lg text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder={language === 'mr' ? 'कालावधी' : language === 'hi' ? 'अवधि' : 'Duration'}
                        value={rx.duration}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[idx].duration = e.target.value;
                          setPrescriptions(updated);
                        }}
                        className="col-span-3 px-2.5 py-1.5 border rounded-lg text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalReferral(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium"
                >
                  {language === 'mr' ? 'रद्द करा' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {t.confirmUpdate || 'Save & Update Patient Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
