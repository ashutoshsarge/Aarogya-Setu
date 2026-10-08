import React from 'react';
import { Referral, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { Printer, Download, CheckCircle, AlertTriangle, Hospital as HospitalIcon, Phone, MapPin, Calendar, Clock, QrCode, Scan } from 'lucide-react';

interface DigitalReferralSlipProps {
  referral: Referral;
  language: Language;
  onClose: () => void;
  onSimulateScan?: () => void;
}

export const DigitalReferralSlip: React.FC<DigitalReferralSlipProps> = ({
  referral,
  language,
  onClose,
  onSimulateScan,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handlePrint = () => {
    window.print();
  };

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getUrgencyLabel = (level: string) => {
    if (level === 'HIGH') return language === 'mr' ? 'अति-तातडीचे' : language === 'hi' ? 'उच्च प्राथमिकता' : 'HIGH PRIORITY';
    if (level === 'MEDIUM') return language === 'mr' ? 'मध्यम तातडी' : language === 'hi' ? 'मध्यम प्राथमिकता' : 'MEDIUM PRIORITY';
    return language === 'mr' ? 'सर्वसाधारण' : language === 'hi' ? 'सामान्य प्राथमिकता' : 'ROUTINE';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" lang={language}>
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Toolbar - Hidden during Print */}
        <div className="no-print bg-slate-900 px-6 py-3.5 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide">
              {language === 'mr'
                ? 'महाराष्ट्र शासन · सार्वजनिक आरोग्य संदर्भ सेवा व्हाउचर'
                : language === 'hi'
                ? 'महाराष्ट्र सरकार · सार्वजनिक स्वास्थ्य रेफरल वाउचर'
                : 'Government of Maharashtra · Public Health Referral Voucher'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {onSimulateScan && (
              <button
                onClick={onSimulateScan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>
                  {language === 'mr'
                    ? 'रुग्णालयातील स्कॅन अनुकरण'
                    : language === 'hi'
                    ? 'अस्पताल में स्कैन का अनुकरण'
                    : 'Simulate Scan at Hospital'}
                </span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printSlip}</span>
            </button>
            <button
              onClick={onClose}
              className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>

        {/* Printable Referral Slip Document Content */}
        <div className="referral-slip-print p-8 bg-white text-slate-900">
          {/* Header with emblem text & Zilla Parishad banner */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center relative">
            <div className="text-xs uppercase tracking-widest font-semibold text-slate-500 mb-1">
              {language === 'mr'
                ? 'महाराष्ट्र शासन · सार्वजनिक आरोग्य विभाग · पुणे जिल्हा परिषद'
                : language === 'hi'
                ? 'महाराष्ट्र सरकार · सार्वजनिक स्वास्थ्य विभाग · पुणे जिला परिषद'
                : 'Government of Maharashtra · Public Health Department · Pune Zilla Parishad'}
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              {language === 'mr'
                ? 'राष्ट्रीय आरोग्य अभियान (NHM) · डिजिटल संदर्भ व्हाउचर'
                : language === 'hi'
                ? 'राष्ट्रीय स्वास्थ्य मिशन (NHM) · डिजिटल रेफरल वाउचर'
                : 'NATIONAL HEALTH MISSION (NHM) · DIGITAL REFERRAL VOUCHER'}
            </h1>
            <div className="text-xs text-slate-600 mt-1 font-mono">
              {language === 'mr'
                ? 'पुणे ग्रामीण एकात्मिक आरोग्य नेटवर्क · सावित्रीबाई फुले पुणे विद्यापीठ कम्युनिटी प्रकल्प'
                : language === 'hi'
                ? 'पुणे ग्रामीण एकीकृत स्वास्थ्य नेटवर्क · सावित्रीबाई फुले पुणे विश्वविद्यालय'
                : 'Pune Rural Integrated Health Network · SPPU Community Engineering Project'}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500">{language === 'mr' ? 'संदर्भ क्र.: ' : language === 'hi' ? 'रेफरल क्र.: ' : 'Referral ID: '}</span>
                <span className="font-bold font-mono text-slate-900">{referral.referralNumber}</span>
              </div>
              <div>
                <span className="text-slate-500">{language === 'mr' ? 'जारी दिनांक: ' : language === 'hi' ? 'जारी तिथि: ' : 'Issued On: '}</span>
                <span className="font-medium text-slate-800">{new Date(referral.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">{language === 'mr' ? 'प्राधान्यता: ' : language === 'hi' ? 'प्राथमिकता: ' : 'Triage Urgency: '}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getUrgencyBadge(referral.triageResult.level)}`}>
                  {getUrgencyLabel(referral.triageResult.level)}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Details & Referring Station */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">
                {language === 'mr' ? 'रुग्णाची माहिती (Demographics)' : language === 'hi' ? 'मरीज़ विवरण (Demographics)' : 'Patient Demographics'}
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">{language === 'mr' ? 'पूर्ण नाव:' : language === 'hi' ? 'पूरा नाम:' : 'Full Name:'}</span>
                  <span className="font-semibold text-slate-900">{referral.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">{language === 'mr' ? 'वय / लिंग:' : language === 'hi' ? 'आयु / लिंग:' : 'Age / Gender:'}</span>
                  <span className="text-slate-800">
                    {referral.patientAge} {language === 'mr' ? 'वर्षे' : language === 'hi' ? 'वर्ष' : 'Years'} · {referral.patientGender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">{language === 'mr' ? 'आरोग्य आयडी / ABHA:' : language === 'hi' ? 'स्वास्थ्य आईडी / ABHA:' : 'Health ID / ABHA:'}</span>
                  <span className="font-mono text-xs font-bold text-teal-700">{referral.patientHealthId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">{language === 'mr' ? 'गाव / तालुका:' : language === 'hi' ? 'गांव / तहसील:' : 'Village / Taluka:'}</span>
                  <span className="text-slate-800">{referral.patientVillage}, {language === 'mr' ? 'तालुका' : language === 'hi' ? 'तहसील' : 'Tal.'} {referral.patientTaluka}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">{language === 'mr' ? 'मोबाईल क्र.:' : language === 'hi' ? 'मोबाइल सं.:' : 'Mobile Contact:'}</span>
                  <span className="font-mono text-xs text-slate-800">{referral.patientMobile}</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">
                {language === 'mr' ? 'रुग्णालय व मार्ग तपशील' : language === 'hi' ? 'अस्पताल व रूट विवरण' : 'Destination & Routing Details'}
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">{language === 'mr' ? 'संदर्भ देणारे केंद्र:' : language === 'hi' ? 'रेफर करने वाला केंद्र:' : 'Referring Centre:'}</span>
                  <span className="font-medium text-slate-800">{referral.referringFacility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">{language === 'mr' ? 'आरोग्य सेविका (ASHA):' : language === 'hi' ? 'स्वास्थ्य कार्यकर्ता (ASHA):' : 'Field Health Worker:'}</span>
                  <span className="text-slate-800">{referral.referringHealthWorker}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">{language === 'mr' ? 'गंतव्य रुग्णालय:' : language === 'hi' ? 'गंतव्य अस्पताल:' : 'Destination Facility:'}</span>
                  <span className="font-bold text-slate-900 text-right">{referral.destinationHospitalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">{language === 'mr' ? 'तज्ज्ञ विभाग:' : language === 'hi' ? 'विशेषज्ञ विभाग:' : 'Specialty Dept:'}</span>
                  <span className="font-bold text-teal-800">{referral.triageResult.recommendedSpecialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">{language === 'mr' ? 'नियोजित वेळ:' : language === 'hi' ? 'नियोजित समय:' : 'Scheduled Slot:'}</span>
                  <span className="font-semibold text-slate-900">{referral.appointmentDate} ({referral.appointmentSlot})</span>
                </div>
                {referral.alternativeHospital && (
                  <div className="flex justify-between pt-1 border-t text-[11px] text-slate-500">
                    <span>{language === 'mr' ? 'पर्यायी रुग्णालय:' : language === 'hi' ? 'वैकल्पिक अस्पताल:' : 'Backup Facility:'}</span>
                    <span className="font-medium text-slate-700">{referral.alternativeHospital.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Summary & Vitals */}
          <div className="border border-slate-200 rounded-xl p-4 mb-6 bg-slate-50/60">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b pb-1">
              {language === 'mr' ? 'वैद्यकीय मूल्यांकन व ट्रायज निष्कर्ष' : language === 'hi' ? 'नैदानिक मूल्यांकन एवं ट्रायज निष्कर्ष' : 'Field Clinical Assessment & Triage Findings'}
            </div>

            {/* Vitals row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">{language === 'mr' ? 'रक्तदाब' : language === 'hi' ? 'रक्तचाप' : 'Blood Pressure'}</div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {referral.symptoms.vitals.bpSystolic}/{referral.symptoms.vitals.bpDiastolic}
                </div>
                <div className="text-[9px] text-slate-400">mmHg</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">{language === 'mr' ? 'ऑक्सिजन पातळी' : language === 'hi' ? 'ऑक्सीजन स्तर' : 'SpO2 Level'}</div>
                <div className={`font-mono text-sm font-bold ${referral.symptoms.vitals.spo2 < 93 ? 'text-red-600' : 'text-slate-900'}`}>
                  {referral.symptoms.vitals.spo2}%
                </div>
                <div className="text-[9px] text-slate-400">Arterial O2</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">{language === 'mr' ? 'हृदय गती' : language === 'hi' ? 'हृदय गति' : 'Heart Rate'}</div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {referral.symptoms.vitals.heartRate}
                </div>
                <div className="text-[9px] text-slate-400">bpm</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">{language === 'mr' ? 'तापमान' : language === 'hi' ? 'तापमान' : 'Temperature'}</div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {referral.symptoms.vitals.temperature}°F
                </div>
                <div className="text-[9px] text-slate-400">Body Temp</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">{language === 'mr' ? 'श्वसन दर' : language === 'hi' ? 'श्वसन दर' : 'Respiratory Rate'}</div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {referral.symptoms.vitals.respiratoryRate}
                </div>
                <div className="text-[9px] text-slate-400">breaths/min</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">{language === 'mr' ? 'वेदना तीव्रता' : language === 'hi' ? 'दर्द तीव्रता' : 'Pain Score'}</div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {referral.symptoms.painSeverity}/10
                </div>
                <div className="text-[9px] text-slate-400">{language === 'mr' ? 'तीव्रता' : language === 'hi' ? 'तीव्रता' : 'Severity'}</div>
              </div>
            </div>

            {/* Complaints and Justification */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-700">{language === 'mr' ? 'प्रमुख तक्रारी: ' : language === 'hi' ? 'मुख्य शिकायतें: ' : 'Chief Complaints: '}</span>
                <span className="text-slate-800">{referral.symptoms.chiefComplaints.join(', ')}</span>
                <span className="text-slate-500"> ({language === 'mr' ? 'कालावधी:' : language === 'hi' ? 'अवधि:' : 'Duration:'} {referral.symptoms.durationDays} {language === 'mr' ? 'दिवस' : language === 'hi' ? 'दिन' : 'days'})</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">{language === 'mr' ? 'तपशीलवार लक्षणे: ' : language === 'hi' ? 'विस्तृत लक्षण: ' : 'Clinical Narrative: '}</span>
                <span className="text-slate-800">{referral.symptoms.description}</span>
              </div>
              {referral.symptoms.dangerSigns.length > 0 && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-900">
                  <span className="font-bold">{language === 'mr' ? 'धोक्याची लक्षणे (Red Flags): ' : language === 'hi' ? 'खतरे के लक्षण (Red Flags): ' : 'Active Danger Signs: '}</span>
                  <span>{referral.symptoms.dangerSigns.join(' · ')}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-slate-700">{language === 'mr' ? 'वैद्यकीय कारण: ' : language === 'hi' ? 'नैदानिक कारण: ' : 'Clinical Justification: '}</span>
                <span className="text-slate-800">{referral.triageResult.clinicalJustification}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">{language === 'mr' ? 'शिफारस केलेल्या तपासण्या: ' : language === 'hi' ? 'अनुशंसित जांचें: ' : 'Recommended Diagnostic Tests: '}</span>
                <span className="font-medium text-slate-900">{referral.triageResult.requiredTests.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Instructions for Patient & Receiving Hospital */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs">
            <div className="md:col-span-2 border border-slate-200 rounded-xl p-4 bg-white">
              <div className="font-bold text-slate-800 mb-1">{language === 'mr' ? 'रुग्ण आणि कुटुंबासाठी सूचना:' : language === 'hi' ? 'मरीज़ और परिवार के लिए निर्देश:' : 'Instructions for Patient & Family:'}</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>
                  {language === 'mr'
                    ? 'रुग्णालयात पोहोचल्यावर नोंदणी काऊंटरवर ही पावती किंवा क्यूआर कोड दाखवा.'
                    : language === 'hi'
                    ? 'अस्पताल पहुंचकर पंजीकरण काउंटर पर यह पर्ची या क्यूआर कोड दिखाएं।'
                    : 'Present this printed slip or show digital QR code at the referral desk / OPD registration counter.'}
                </li>
                <li>
                  {language === 'mr'
                    ? 'आधार कार्ड, जुनी औषध चिठ्ठी आणि तपासणी अहवाल सोबत ठेवा.'
                    : language === 'hi'
                    ? 'आधार कार्ड, पुरानी दवा पर्ची और पिछली जांच रिपोर्ट साथ रखें।'
                    : 'Carry Aadhaar card, past prescription slips, and previous test reports.'}
                </li>
                <li>{referral.triageResult.immediateAdvice}</li>
                <li>
                  {language === 'mr'
                    ? 'प्रकृती अचानक बिघडल्यास विनाविलंब १०८ रुग्णवाहिका क्रमांकावर कॉल करा.'
                    : language === 'hi'
                    ? 'तबीयत अचानक बिगड़ने पर बिना देर किए 108 एम्बुलेंस हेल्पलाइन पर कॉल करें।'
                    : 'In case of sudden worsening, call emergency ambulance helpline 108 without delay.'}
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center flex flex-col items-center justify-center">
              {/* QR Code representation */}
              <div className="w-24 h-24 bg-white p-1 border border-slate-300 rounded-lg flex items-center justify-center mb-1">
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
              <span className="font-mono text-[10px] text-slate-600 font-bold">{referral.referralNumber}</span>
              <span className="text-[10px] text-slate-400">
                {language === 'mr' ? 'रुग्णालय काऊंटरवर स्कॅन करा' : language === 'hi' ? 'अस्पताल काउंटर पर स्कैन करें' : 'Scan at Hospital OPD Kiosk'}
              </span>
            </div>
          </div>

          {/* Official Signatures Footer */}
          <div className="border-t border-slate-300 pt-4 flex items-end justify-between text-xs text-slate-500">
            <div>
              <div>{language === 'mr' ? 'प्रणाली पडताळणी की:' : language === 'hi' ? 'सिस्टम सत्यापन कुंजी:' : 'System-Generated Verification Key:'} <span className="font-mono text-slate-800 font-bold">PUN-NHM-2026-X8</span></div>
              <div className="text-[10px] text-slate-400 mt-0.5">Savitribai Phule Pune University (SPPU) · Community Engineering Project</div>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-400 w-44 mb-1"></div>
              <div className="font-medium text-slate-800">
                {language === 'mr' ? 'अधिकृत वैद्यकीय अधिकारी / आशा' : language === 'hi' ? 'अधिकृत चिकित्सा अधिकारी / आशा' : 'Authorized Medical Officer / ASHA'}
              </div>
              <div className="text-[10px] text-slate-400">{referral.referringFacility}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
