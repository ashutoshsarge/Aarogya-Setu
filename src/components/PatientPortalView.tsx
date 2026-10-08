import React, { useState } from 'react';
import { Patient, Referral, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  CreditCard,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Printer,
  Phone,
  Video,
  CheckCircle,
  AlertCircle,
  Pill,
  Download,
  Activity,
  Heart,
  Stethoscope,
  ShieldCheck,
  Eye,
  Bell,
  ChevronRight,
} from 'lucide-react';

interface PatientPortalViewProps {
  patient: Patient;
  referrals: Referral[];
  language: Language;
  onViewSlip: (referral: Referral) => void;
  onOpenTeleconsult: (referral: Referral) => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  patient,
  referrals,
  language,
  onViewSlip,
  onOpenTeleconsult,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const myReferrals = referrals.filter(
    (r) => r.patientId === patient.id || r.patientHealthId === patient.healthId
  );
  const activeReferral = myReferrals.find((r) => r.status !== 'COMPLETED') || myReferrals[0];

  // Demo 2 diagnostic reports for Ramesh Patil as requested
  const diagnosticReports = [
    {
      id: 'rep_ecg_01',
      title:
        language === 'mr'
          ? '१२-लीड ईसीजी (ECG) अहवाल'
          : language === 'hi'
          ? '१२-लीड ईसीजी (ECG) रिपोर्ट'
          : '12-Lead Electrocardiogram (ECG) Report',
      date: '2026-10-03',
      facility:
        language === 'mr'
          ? 'ससून सर्वोपचार रुग्णालय · हृदयरोग विभाग'
          : language === 'hi'
          ? 'ससून जनरल अस्पताल · कार्डियोलॉजी विभाग'
          : 'Sassoon General Hospital · Dept of Cardiology',
      doctor:
        language === 'mr'
          ? 'डॉ. अनिल कुलकर्णी, वरिष्ठ हृदयरोगतज्ज्ञ'
          : language === 'hi'
          ? 'डॉ. अनिल कुलकर्णी, वरिष्ठ हृदय रोग विशेषज्ञ'
          : 'Dr. Anil Kulkarni, Senior Cardiologist',
      findings:
        language === 'mr'
          ? 'सायनस रिदम @ ७६ bpm. PR इंटरव्हल 160ms. उच्च रक्तदाबामुळे हलका डावा व्हेंट्रिक्युलर हायपरट्रॉफी (LVH). तीव्र ST-एलिव्हेशन नाही.'
          : language === 'hi'
          ? 'साइनस रिदम @ ७६ bpm. PR इंटरवल 160ms. उच्च रक्तचाप के कारण हल्का बायां वेंट्रिकुलर हाइपरट्रॉफी (LVH). तीव्र ST-एलिवेशन नहीं.'
          : 'Sinus rhythm @ 76 bpm. PR interval 160ms. Mild Left Ventricular Hypertrophy (LVH) pattern consistent with systemic hypertension. No acute ST-elevation.',
      status: 'VERIFIED',
      fileSize: '420 KB PDF',
    },
    {
      id: 'rep_cbc_02',
      title:
        language === 'mr'
          ? 'रक्त तपासणी (CBC) आणि लिपिड प्रोफाईल'
          : language === 'hi'
          ? 'रक्त जांच (CBC) और लिपिड प्रोफाइल'
          : 'Complete Blood Count (CBC) & Lipid Profile',
      date: '2026-10-02',
      facility:
        language === 'mr'
          ? 'मध्यवर्ती पॅथॉलॉजी प्रयोगशाळा · ससून रुग्णालय'
          : language === 'hi'
          ? 'केंद्रीय पैथोलॉजी प्रयोगशाला · ससून अस्पताल'
          : 'Central Pathology Laboratory · Sassoon Hospital',
      doctor:
        language === 'mr'
          ? 'डॉ. मीरा रानडे, एमडी पॅथॉलॉजी'
          : language === 'hi'
          ? 'डॉ. मीरा रानडे, एमडी पैथोलॉजी'
          : 'Dr. Meera Ranade, MD Pathology',
      findings:
        language === 'mr'
          ? 'हिमोग्लोबिन: १३.८ g/dL (सामान्य: १३-१७). एकूण WBC: ७,४०० /cu.mm. कोलेस्ट्रॉल: १९२ mg/dL. ट्रायग्लिसराइड्स: १५४ mg/dL. सिरम क्रिएटिनिन: ०.९ mg/dL.'
          : language === 'hi'
          ? 'हीमोग्लोबिन: १३.८ g/dL (सामान्य: १३-१७). कुल WBC: ७,४०० /cu.mm. कुल कोलेस्ट्रॉल: १९२ mg/dL. ट्राइग्लिसराइड्स: १५४ mg/dL. सीरम क्रिएटिनिन: ०.९ mg/dL.'
          : 'Hemoglobin: 13.8 g/dL (Normal: 13-17). Total WBC: 7,400 /cu.mm. Total Cholesterol: 192 mg/dL. Triglycerides: 154 mg/dL. Serum Creatinine: 0.9 mg/dL.',
      status: 'VERIFIED',
      fileSize: '310 KB PDF',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto" lang={language}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>
              {language === 'mr'
                ? 'माझे आरोग्य पासपोर्ट आणि डिजिटल पोर्टल'
                : language === 'hi'
                ? 'मेरा स्वास्थ्य पासपोर्ट और डिजिटल पोर्टल'
                : 'My Health Passport & Digital Portal'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'mr'
              ? 'पुणे ग्रामीण एकात्मिक आरोग्य नेटवर्क · रुग्ण डिजिटल आरोग्य नोंदी आणि संदर्भ प्रवेशद्वार'
              : language === 'hi'
              ? 'पुणे ग्रामीण एकीकृत स्वास्थ्य नेटवर्क · रोगी डिजिटल स्वास्थ्य रिकॉर्ड और रेफरल गेटवे'
              : 'Pune Rural Integrated Health Network · Patient Digital Health Records & Referral Gateway'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            {language === 'mr'
              ? 'सत्यापित आभा (ABHA) नागरिक खाते'
              : language === 'hi'
              ? 'सत्यापित आभा (ABHA) नागरिक खाता'
              : 'Verified ABHA Citizen Account'}
          </span>
        </div>
      </div>

      {/* 1. Digital Health ID Card (ABHA + Pune Rural Health Card with Glassmorphic Gradient) */}
      <div className="glass-card-dark bg-gradient-to-br from-teal-900 via-slate-900 to-cyan-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-white/15">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none p-4">
          <svg className="w-56 h-56 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-widest uppercase bg-teal-600/90 text-white px-2.5 py-1 rounded-md shadow-xs">
                {language === 'mr'
                  ? 'महाराष्ट्र शासन · ग्रामीण आरोग्य ओळखपत्र'
                  : language === 'hi'
                  ? 'महाराष्ट्र सरकार · ग्रामीण स्वास्थ्य पहचान पत्र'
                  : 'Government of Maharashtra · Rural Health ID'}
              </span>
              <span className="text-[10px] text-teal-200 font-mono">
                {language === 'mr'
                  ? 'एनएचएम पुणे ग्रामीण डिजिटल पासपोर्ट'
                  : language === 'hi'
                  ? 'एनएचएम पुणे ग्रामीण डिजिटल पासपोर्ट'
                  : 'NHM Pune Rural Digital Passport'}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{patient.name}</h2>
              <div className="text-xs text-teal-100/90 flex flex-wrap items-center gap-2 mt-1">
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
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-300" />
                  <span>
                    {language === 'mr'
                      ? `गाव: ${patient.village}, तालुका ${patient.taluka}, पुणे`
                      : language === 'hi'
                      ? `गाँव: ${patient.village}, तालुका ${patient.taluka}, पुणे`
                      : `Village: ${patient.village}, Taluka ${patient.taluka}, Pune`}
                  </span>
                </span>
              </div>
            </div>

            {/* Health Identifiers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div className="glass-card-dark bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 block">
                  {language === 'mr' ? 'आरोग्य ओळख क्र.' : language === 'hi' ? 'स्वास्थ्य पहचान क्र.' : 'Health ID'}
                </span>
                <span className="font-mono text-base font-extrabold text-white tracking-wider block mt-0.5">
                  {patient.healthId}
                </span>
              </div>

              <div className="glass-card-dark bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 block">
                  {language === 'mr' ? 'आभा क्रमांक' : language === 'hi' ? 'आभा संख्या' : 'ABHA Number'}
                </span>
                <span className="font-mono text-xs font-semibold text-teal-100 block mt-1">
                  {patient.abhaNumber || '91-4521-8932-1104'}
                </span>
              </div>

              <div className="glass-card-dark bg-white/5 p-3 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 block">
                  {language === 'mr' ? 'प्राथमिक उपकेंद्र' : language === 'hi' ? 'प्राथमिक उप-केंद्र' : 'Primary Sub-Centre'}
                </span>
                <span className="text-xs font-medium text-slate-200 block mt-0.5 truncate">
                  {language === 'mr' ? 'वेल्हे उपकेंद्र / प्रा.आ.केंद्र' : language === 'hi' ? 'वेल्हे उप-केंद्र / प्रा.स्वा.केंद्र' : 'Velhe Sub-Centre / PHC'}
                </span>
              </div>
            </div>

            {/* Medical Summary Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-200 border border-red-500/30 text-[11px] font-semibold">
                <Heart className="w-3.5 h-3.5" />
                <span>
                  {language === 'mr'
                    ? 'आजाराचे नाव: उच्च रक्तदाब (Hypertension)'
                    : language === 'hi'
                    ? 'रोग स्थिति: उच्च रक्तचाप (Hypertension)'
                    : 'Condition: Hypertension'}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-200 border border-teal-500/30 text-[11px] font-semibold">
                <Pill className="w-3.5 h-3.5" />
                <span>
                  {language === 'mr'
                    ? 'औषध: टॅब. अ‍ॅम्लोडिपिन 5mg रोज'
                    : language === 'hi'
                    ? 'दवा: टैब. एम्लोडिपिन 5mg रोज'
                    : 'Medication: Tab. Amlodipine 5mg OD'}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/30 text-[11px] font-semibold">
                <span>
                  {language === 'mr'
                    ? 'अ‍ॅलर्जी: पेनिसिलिन / अ‍ॅम्पिसिलिन'
                    : language === 'hi'
                    ? 'एलर्जी: पेनिसिलिन / एम्पीसिलीन'
                    : 'Allergy: Penicillin / Ampicillin'}
                </span>
              </span>
            </div>
          </div>

          {/* Quick OPD QR Code */}
          <div className="bg-white p-4 rounded-2xl shadow-xl text-slate-900 flex flex-col items-center justify-center shrink-0 self-start md:self-auto border border-white/40">
            <div className="w-28 h-28 mb-1.5">
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
            <span className="font-mono text-[10px] font-bold text-slate-700">
              {language === 'mr' ? 'ओपीडी नोंदणी QR' : language === 'hi' ? 'ओपीडी रिसेप्शन QR' : 'OPD Reception QR'}
            </span>
            <span className="text-[9px] text-teal-700 font-medium">
              {language === 'mr'
                ? 'नोंदी उघडण्यासाठी स्कॅन करा'
                : language === 'hi'
                ? 'रिकॉर्ड खोलने के लिए स्कैन करें'
                : 'Scan to open records'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Urgent Alerts: 1 Upcoming Appointment + 1 Follow-up Reminder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1 Upcoming Appointment */}
        <div className="glass-card rounded-2xl p-5 border border-sky-200/80 bg-gradient-to-br from-sky-50/70 to-white/90 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-sky-300">
              <Calendar className="w-3.5 h-3.5 text-sky-700" />
              <span>
                {language === 'mr'
                  ? 'आगामी अपॉइंटमेंट'
                  : language === 'hi'
                  ? 'आगामी अपॉइंटमेंट'
                  : 'Upcoming Appointment'}
              </span>
            </span>
            <span className="text-xs font-bold text-sky-700 font-mono">12 Oct 2026</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'mr'
                ? 'हृदयरोग बाह्यरुग्ण पाठपुरावा (फॉलो-अप)'
                : language === 'hi'
                ? 'हृदय रोग बाह्य रोगी फॉलो-अप'
                : 'Cardiology Outpatient Follow-up'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {language === 'mr' ? (
                <>ससून सर्वोपचार रुग्णालय ओपीडी येथे <strong>डॉ. अनिल कुलकर्णी</strong> यांच्याशी सल्लामसलत</>
              ) : language === 'hi' ? (
                <>ससून जनरल अस्पताल ओपीडी में <strong>डॉ. अनिल कुलकर्णी</strong> के साथ परामर्श</>
              ) : (
                <>Consultation with <strong>Dr. Anil Kulkarni</strong> at Sassoon General Hospital OPD</>
              )}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-sky-100">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" />{' '}
              {language === 'mr'
                ? 'वेळ: सकाळी १०:३० - ११:३०'
                : language === 'hi'
                ? 'समय: सुबह १०:३० - ११:३०'
                : 'Slot: 10:30 AM - 11:30 AM'}
            </span>
            <span className="font-bold text-teal-700">
              {language === 'mr'
                ? 'खोली १४, सुपर-स्पेशालिटी ओपीडी'
                : language === 'hi'
                ? 'कक्ष १४, सुपर-स्पेशियलिटी ओपीडी'
                : 'Room 14, Super-Specialty OPD'}
            </span>
          </div>
        </div>

        {/* 1 Follow-Up Reminder */}
        <div className="glass-card rounded-2xl p-5 border border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-white/90 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
              <Bell className="w-3.5 h-3.5 text-amber-700" />
              <span>
                {language === 'mr'
                  ? 'पाठपुरावा स्मरणपत्र (फॉलो-अप)'
                  : language === 'hi'
                  ? 'फॉलो-अप रिमाइंडर'
                  : 'Follow-Up Reminder'}
              </span>
            </span>
            <span className="text-xs font-bold text-amber-700">
              {language === 'mr' ? '३ दिवसांत नियोजित' : language === 'hi' ? '३ दिनों में देय' : 'Due in 3 days'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'mr'
                ? 'रक्तदाब तपासणी आणि औषध पुन्हा घेणे'
                : language === 'hi'
                ? 'रक्तचाप जांच और दवा रीफिल'
                : 'BP Check & Medication Refill'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {language === 'mr' ? (
                <>आशा सेविका सुनिता जाधव यांच्याकडे मासिक रक्तदाब तपासणी व <em>टॅब. अ‍ॅम्लोडिपिन 5mg</em> औषध पुरवठा</>
              ) : language === 'hi' ? (
                <>आशा कार्यकर्ता सुनीता जाधव के साथ मासिक रक्तचाप जांच और <em>टैब. एम्लोडिपिन 5mg</em> दवा पुनः प्राप्ति</>
              ) : (
                <>Monthly Hypertension checkup & refill of <em>Tab. Amlodipine 5mg</em> with ASHA Sunita Jadhav</>
              )}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-100">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />{' '}
              {language === 'mr' ? 'वेल्हे उपकेंद्र' : language === 'hi' ? 'वेल्हे उप-केंद्र' : 'Velhe Sub-Centre'}
            </span>
            <span className="font-bold text-emerald-700">
              {language === 'mr'
                ? 'एनएचएम योजनेअंतर्गत मोफत'
                : language === 'hi'
                ? 'एनएचएम योजना अंतर्गत निःशुल्क'
                : 'Free Under NHM Scheme'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Diagnostic Test Reports Section (2 reports preloaded) */}
      <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>
                {language === 'mr'
                  ? 'निदान चाचणी अहवाल (२ अहवाल उपलब्ध)'
                  : language === 'hi'
                  ? 'नैदानिक परीक्षण रिपोर्ट (२ रिपोर्ट उपलब्ध)'
                  : 'Diagnostic Test Reports (2 Reports Available)'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'mr'
                ? 'सार्वजनिक आरोग्य नेटवर्क अंतर्गत केलेल्या प्रयोगशाळा चाचण्या आणि निदान तपासण्या'
                : language === 'hi'
                ? 'सार्वजनिक स्वास्थ्य नेटवर्क के तहत किए गए लैब परीक्षण और जांच'
                : 'Lab tests and diagnostic investigations performed under the public health network'}
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
            {language === 'mr' ? 'डिजिटली स्वाक्षरीकृत' : language === 'hi' ? 'डिजिटल रूप से हस्ताक्षरित' : 'Digitally Signed'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diagnosticReports.map((report) => (
            <div
              key={report.id}
              className="glass-card p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition space-y-3 bg-white/70"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{report.title}</h4>
                  <div className="text-[11px] text-teal-700 font-medium mt-0.5">{report.facility}</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase">
                  {report.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl text-xs text-slate-700 border border-slate-100 leading-relaxed">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  {language === 'mr'
                    ? 'वैद्यकीय निष्कर्ष (Clinical Findings)'
                    : language === 'hi'
                    ? 'चिकित्सीय निष्कर्ष (Clinical Findings)'
                    : 'Clinical Findings'}
                </span>
                {report.findings}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                <span>
                  {language === 'mr' ? 'दिनांक' : language === 'hi' ? 'दिनांक' : 'Date'}: {report.date}
                </span>
                <button
                  type="button"
                  onClick={() => alert(`Downloading verified report: ${report.title} (${report.fileSize})`)}
                  className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-bold cursor-pointer hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {language === 'mr'
                      ? `डाउनलोड करा (${report.fileSize})`
                      : language === 'hi'
                      ? `डाउनलोड करें (${report.fileSize})`
                      : `Download ${report.fileSize}`}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Active & Past Digital Referral Voucher */}
      {activeReferral && (
        <div className="glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {language === 'mr'
                  ? 'अधिकृत डिजिटल संदर्भ नोंदणी'
                  : language === 'hi'
                  ? 'आधिकारिक डिजिटल रेफरल रिकॉर्ड'
                  : 'Official Digital Referral Record'}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {activeReferral.destinationHospitalName}
              </h3>
              <div className="text-xs text-slate-500 font-mono">
                {language === 'mr' ? 'संदर्भ व्हाउचर क्र.' : language === 'hi' ? 'रेफरल वाउचर क्र.' : 'Referral Voucher #'}
                {activeReferral.referralNumber}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                  activeReferral.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeReferral.status === 'UNDER_TREATMENT'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {language === 'mr' ? 'स्थिती' : language === 'hi' ? 'स्थिति' : 'Status'}:{' '}
                {activeReferral.status === 'COMPLETED'
                  ? language === 'mr'
                    ? 'पूर्ण'
                    : language === 'hi'
                    ? 'पूर्ण'
                    : 'COMPLETED'
                  : activeReferral.status === 'UNDER_TREATMENT'
                  ? language === 'mr'
                    ? 'उपचार सुरू'
                    : language === 'hi'
                    ? 'उपचार जारी'
                    : 'UNDER TREATMENT'
                  : activeReferral.status === 'INITIATED'
                  ? language === 'mr'
                    ? 'सुरू केले'
                    : language === 'hi'
                    ? 'शुरू किया'
                    : 'INITIATED'
                  : activeReferral.status}
              </span>

              <button
                onClick={() => onViewSlip(activeReferral)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printSlip}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {language === 'mr' ? 'तज्ज्ञ विभाग' : language === 'hi' ? 'विशेषज्ञ विभाग' : 'Specialist Department'}
              </span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {activeReferral.triageResult.recommendedSpecialty}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {language === 'mr' ? 'अपॉइंटमेंट स्लॉट' : language === 'hi' ? 'अपॉइंटमेंट स्लॉट' : 'Appointment Slot'}
              </span>
              <span className="font-bold text-teal-800 text-sm mt-0.5 block">
                {activeReferral.appointmentDate} ({activeReferral.appointmentSlot})
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {language === 'mr'
                  ? 'संदर्भित करणारे केंद्र व आरोग्य कार्यकर्ता'
                  : language === 'hi'
                  ? 'रेफर करने वाला केंद्र व स्वास्थ्य कार्यकर्ता'
                  : 'Referring Centre & Worker'}
              </span>
              <span className="font-medium text-slate-800 text-xs mt-0.5 block">
                {activeReferral.referringFacility} · {activeReferral.referringHealthWorker}
              </span>
            </div>
          </div>

          {/* Doctor Prescriptions */}
          {activeReferral.prescriptions && activeReferral.prescriptions.length > 0 && (
            <div className="border-t border-slate-200/80 pt-3">
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>
                  {language === 'mr'
                    ? 'डॉक्टरांचे प्रिस्क्रिप्शन व औषध वेळापत्रक'
                    : language === 'hi'
                    ? 'डॉक्टर का पर्चा व दवा दिनचर्या'
                    : 'Doctor Prescriptions & Medicine Routine'}
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeReferral.prescriptions.map((rx, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{rx.medicineName}</span>
                      <span className="text-slate-500 ml-1.5">({rx.dosage})</span>
                    </div>
                    <div className="text-slate-700 font-medium">
                      {rx.frequency}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. 24x7 Emergency 108 Call Support Strip */}
      <div className="glass-card bg-gradient-to-r from-red-50/90 to-rose-50/90 border border-red-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-900 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Phone className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-sm block text-red-950">
              {language === 'mr'
                ? 'आपत्कालीन रुग्णवाहिकेची आवश्यकता आहे का?'
                : language === 'hi'
                ? 'क्या आपातकालीन एम्बुलेंस की आवश्यकता है?'
                : 'Emergency Ambulance Required?'}
            </span>
            <span className="text-[11px] text-red-700">
              {language === 'mr'
                ? 'महाराष्ट्र शासनाची टोल-फ्री १०८ रुग्णवाहिका सेवा सर्व पुणे ग्रामीण भागात २४x७ अविरत उपलब्ध आहे'
                : language === 'hi'
                ? 'महाराष्ट्र सरकार की टोल-फ्री १०८ एम्बुलेंस सेवा सभी पुणे ग्रामीण क्षेत्रों में २४x७ उपलब्ध है'
                : 'Government of Maharashtra toll-free 108 Ambulance service operates 24x7 across all Pune villages'}
            </span>
          </div>
        </div>
        <a
          href="tel:108"
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl shadow-md transition text-center shrink-0 cursor-pointer"
        >
          {language === 'mr'
            ? '१०८ रुग्णवाहिकेशी संपर्क करा'
            : language === 'hi'
            ? '१०८ एम्बुलेंस को कॉल करें'
            : 'Call 108 Ambulance'}
        </a>
      </div>
    </div>
  );
};
