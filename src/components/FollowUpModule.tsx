import React, { useState } from 'react';
import { Referral, FollowUpStatus, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  Home,
  CheckSquare,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';

interface FollowUpModuleProps {
  referrals: Referral[];
  language: Language;
  onUpdateFollowUp: (
    referralId: string,
    status: FollowUpStatus,
    checklist: {
      homeVisited: boolean;
      medicationAdherence: boolean;
      symptomsRelieved: boolean;
      notes: string;
    }
  ) => void;
}

export const FollowUpModule: React.FC<FollowUpModuleProps> = ({
  referrals,
  language,
  onUpdateFollowUp,
}) => {
  const t = TRANSLATIONS[language];
  const [activeChecklistReferral, setActiveChecklistReferral] = useState<Referral | null>(null);

  // Form states
  const [homeVisited, setHomeVisited] = useState(false);
  const [medicationAdherence, setMedicationAdherence] = useState(true);
  const [symptomsRelieved, setSymptomsRelieved] = useState(true);
  const [notes, setNotes] = useState('');

  const openChecklistModal = (referral: Referral) => {
    setActiveChecklistReferral(referral);
    if (referral.followUpChecklist) {
      setHomeVisited(referral.followUpChecklist.homeVisited);
      setMedicationAdherence(referral.followUpChecklist.medicationAdherence);
      setSymptomsRelieved(referral.followUpChecklist.symptomsRelieved);
      setNotes(referral.followUpChecklist.notes || '');
    } else {
      setHomeVisited(false);
      setMedicationAdherence(true);
      setSymptomsRelieved(true);
      setNotes('');
    }
  };

  const handleSaveChecklist = () => {
    if (!activeChecklistReferral) return;

    onUpdateFollowUp(activeChecklistReferral.id, 'DONE', {
      homeVisited,
      medicationAdherence,
      symptomsRelieved,
      notes,
    });

    setActiveChecklistReferral(null);
  };

  const missedAlerts = referrals.filter((r) => r.followUpStatus === 'MISSED_ALERT');
  const pendingFollowups = referrals.filter((r) => r.followUpStatus === 'PENDING');
  const completedFollowups = referrals.filter((r) => r.followUpStatus === 'DONE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          {t.followupAlertTitle || 'Loss-to-Follow-Up Prevention & Home Visits'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {t.followupAlertSubtitle || 'Proactive tracking for loss-to-follow-up prevention, post-treatment recovery verification, and ASHA home visits'}
        </p>
      </div>

      {/* Critical Overdue / Missed Loss-to-Follow-Up Alerts Banner */}
      {missedAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
            <span>{t.missedAlertUrgent || `Loss-to-Follow-Up (LTFU) Urgent Flag: ${missedAlerts.length} Patient(s) Did Not Reach Hospital`}</span>
          </div>
          <p className="text-xs text-red-800">
            {t.missedAlertDesc || 'The system flagged patients who were referred > 48 hours ago but have no record of arrival at the destination hospital. Field workers must call the patient or conduct an emergency home visit.'}
          </p>

          <div className="space-y-2 mt-2">
            {missedAlerts.map((ref) => (
              <div
                key={ref.id}
                className="bg-white p-3.5 rounded-lg border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ref.patientName}</span>
                    <span className="font-mono text-red-700 font-semibold">{ref.patientHealthId}</span>
                    <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold text-[10px]">
                      {t.overdueArrival || 'OVERDUE ARRIVAL'}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    {language === 'mr' ? 'संदर्भित केले: ' : language === 'hi' ? 'रेफर किया गया: ' : 'Referred to '}
                    <span className="font-semibold text-slate-800">{ref.destinationHospitalName}</span> (
                    <span className="text-slate-800 font-medium">{ref.triageResult.recommendedSpecialty}</span>)
                    {' · '}{ref.appointmentDate}
                  </div>
                  <div className="text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{ref.patientVillage}, Taluka {ref.patientTaluka}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {ref.patientMobile}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${ref.patientMobile}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.callPatient || 'Call Patient'}</span>
                  </a>
                  <button
                    onClick={() => openChecklistModal(ref)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>{t.recordVisitBtn || 'Record Visit / Resolve'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Follow-Up List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Follow-ups */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{t.pendingFollowupTitle || 'Pending Post-Treatment Follow-Ups'} ({pendingFollowups.length})</span>
            </h3>
            <span className="text-xs text-slate-500">Day 7 & Day 14 Checks</span>
          </div>

          {pendingFollowups.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              {language === 'mr' ? 'कोणताही प्रलंबित फॉलो-अप नाही.' : language === 'hi' ? 'कोई लंबित फॉलो-अप नहीं है।' : 'No pending routine follow-ups.'}
            </p>
          ) : (
            <div className="space-y-3">
              {pendingFollowups.map((ref) => (
                <div
                  key={ref.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900">{ref.patientName}</div>
                    <div className="text-slate-600">
                      {ref.triageResult.recommendedSpecialty} · {ref.destinationHospitalName}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {ref.followUpDate || 'Within 7 days'}
                    </div>
                  </div>

                  <button
                    onClick={() => openChecklistModal(ref)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium self-start sm:self-center shrink-0 cursor-pointer"
                  >
                    {t.recordVisitBtn || 'Record Visit'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Follow-ups */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.completedFollowupTitle || (language === 'mr' ? 'पूर्ण झालेल्या पडताळणी भेटी' : language === 'hi' ? 'पूर्ण सत्यापन भेंटें' : 'Completed Verification Visits')} ({completedFollowups.length})</span>
            </h3>
            <span className="text-xs text-slate-500">
              {language === 'mr' ? 'आरोग्य सेविकेद्वारे प्रमाणित' : language === 'hi' ? 'स्वास्थ्य कार्यकर्ता द्वारा सत्यापित' : 'Verified by Field Worker'}
            </span>
          </div>

          {completedFollowups.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              {language === 'mr' ? 'अद्याप कोणत्याही पूर्ण झालेल्या भेटींची नोंद नाही.' : language === 'hi' ? 'अभी तक कोई पूर्ण भेंट दर्ज नहीं है।' : 'No completed follow-ups logged yet.'}
            </p>
          ) : (
            <div className="space-y-3">
              {completedFollowups.map((ref) => (
                <div
                  key={ref.id}
                  className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{ref.patientName}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {language === 'mr' ? 'प्रमाणित बरे झाले' : language === 'hi' ? 'सत्यापित स्वस्थ' : 'VERIFIED RECOVERED'}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    {ref.followUpChecklist?.notes || (language === 'mr' ? 'रुग्ण नियमित औषधे घेत असून लक्षणमुक्त आहे.' : language === 'hi' ? 'मरीज़ नियमित दवा ले रहा है और लक्षणमुक्त है।' : 'Patient adhering to medications and symptom-free.')}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === 'mr' ? 'भेट प्रमाणित · नियमित औषध:' : language === 'hi' ? 'भेंट सत्यापित · नियमित दवा:' : 'Visit verified · Adherence:'} {ref.followUpChecklist?.medicationAdherence ? (language === 'mr' ? 'होय' : language === 'hi' ? 'हाँ' : 'Yes') : (language === 'mr' ? 'नाही' : language === 'hi' ? 'नहीं' : 'No')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ASHA / ANM Home Visit Checklist Modal */}
      {activeChecklistReferral && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold">
                  {language === 'mr' ? 'आशा / एएनएम गृहभेट पडताळणी चेकलिस्ट' : language === 'hi' ? 'आशा / एएनएम गृह भेंट सत्यापन चेकलिस्ट' : 'ASHA / ANM Home Visit Verification Checklist'}
                </h3>
              </div>
              <button
                onClick={() => setActiveChecklistReferral(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border space-y-1">
                <div className="font-bold text-sm text-slate-900">
                  {activeChecklistReferral.patientName}
                </div>
                <div className="text-slate-600">
                  Health ID: <span className="font-mono">{activeChecklistReferral.patientHealthId}</span> ·{' '}
                  {activeChecklistReferral.patientVillage}, Taluka {activeChecklistReferral.patientTaluka}
                </div>
                <div className="text-slate-500">
                  {language === 'mr' ? 'संदर्भ रुग्णालय:' : language === 'hi' ? 'रेफरल अस्पताल:' : 'Referral:'} {activeChecklistReferral.destinationHospitalName} (
                  {activeChecklistReferral.triageResult.recommendedSpecialty})
                </div>
              </div>

              {/* Checklist checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homeVisited}
                    onChange={(e) => setHomeVisited(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {t.homeVisitedCheck || (language === 'mr' ? 'प्रत्यक्ष गृहभेट / संपर्क पूर्ण' : language === 'hi' ? 'प्रत्यक्ष गृह भेंट / सीधा संपर्क पूर्ण' : 'Physical Home Visit / Direct Contact Completed')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {language === 'mr' ? 'आरोग्य सेविकेने प्रत्यक्ष भेट दिली किंवा संपर्क केला' : language === 'hi' ? 'स्वास्थ्य कार्यकर्ता ने प्रत्यक्ष भेंट की या संपर्क किया' : 'Health worker met patient or verified via direct call'}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={medicationAdherence}
                    onChange={(e) => setMedicationAdherence(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {t.medAdherenceCheck || (language === 'mr' ? 'औषधे वेळेवर घेतल्याची खात्री केली' : language === 'hi' ? 'नियमित दवा लेने की पुष्टि की' : 'Medication Adherence Confirmed')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {language === 'mr' ? 'रुग्ण डॉक्टरांच्या सल्ल्यानुसार नियमित गोळ्या घेत आहे' : language === 'hi' ? 'मरीज़ डॉक्टर की सलाह अनुसार नियमित दवा ले रहा है' : 'Patient is taking prescribed tablets as directed by doctor'}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={symptomsRelieved}
                    onChange={(e) => setSymptomsRelieved(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {t.symptomsRelievedCheck || (language === 'mr' ? 'लक्षणे कमी झाली / प्रकृती स्थिर' : language === 'hi' ? 'लक्षणों में राहत / स्वास्थ्य स्थिर' : 'Clinical Symptoms Relieved / Stable')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {language === 'mr' ? 'ताप, छातीत दुखणे किंवा दम लागणे यांसारखी गंभीर लक्षणे नाहीत' : language === 'hi' ? 'बुखार, सीने में दर्द या सांस फूलने जैसे कोई गंभीर लक्षण नहीं हैं' : 'No fever spikes, chest pain, or breathing distress present'}
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.ashaNotesLabel || (language === 'mr' ? 'आरोग्य सेविकेची निरीक्षण नोंद व कृती:' : language === 'hi' ? 'स्वास्थ्य कार्यकर्ता का अवलोकन व की गई कार्रवाई:' : 'Field Observations & Action Taken:')}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'mr' ? 'उदा. रुग्णाची घरी भेट घेतली; प्रकृतीत सुधारणा आहे, नियमित गोळ्या सुरू आहेत...' : language === 'hi' ? 'उदा. मरीज़ के घर का दौरा किया; स्वास्थ्य में सुधार है, नियमित दवाएं जारी हैं...' : 'e.g. Visited patient at home; patient explained recovery progress...'}
                  className="w-full text-xs px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveChecklistReferral(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md"
                >
                  {language === 'mr' ? 'रद्द करा' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveChecklist}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-xs"
                >
                  {t.saveChecklist || (language === 'mr' ? 'नोंद साठवा व फॉलो-अप पूर्ण करा' : language === 'hi' ? 'सहेजें व फॉलो-अप पूर्ण करें' : 'Save & Resolve Follow-up')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
