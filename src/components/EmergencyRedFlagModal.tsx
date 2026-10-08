import React, { useState } from 'react';
import { Patient, Hospital, DangerSignItem, Referral, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  AlertOctagon,
  PhoneCall,
  Printer,
  Ambulance,
  MapPin,
  Clock,
  ShieldAlert,
  ArrowRight,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';

interface EmergencyRedFlagModalProps {
  patient: Patient;
  triggeredDangerSigns: string[];
  nearestHospital: Hospital;
  language: Language;
  onCall108: () => void;
  onGenerateEmergencyReferral: () => void;
  onClose: () => void;
}

export const EmergencyRedFlagModal: React.FC<EmergencyRedFlagModalProps> = ({
  patient,
  triggeredDangerSigns,
  nearestHospital,
  language,
  onCall108,
  onGenerateEmergencyReferral,
  onClose,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [ambulanceDispatched, setAmbulanceDispatched] = useState(false);
  const [dispatchEta, setDispatchEta] = useState<number>(14);

  const handleAmbulanceClick = () => {
    setAmbulanceDispatched(true);
    onCall108();
  };

  const distanceKm = nearestHospital.distanceKmByTaluka[patient.taluka] ?? 24;
  const travelMinutes = Math.round((distanceKm / 45) * 60);

  // Localization for danger signs
  const dangerSignTranslations: Record<string, { mr: string; hi: string }> = {
    'Severe chest pain radiating to left arm': {
      mr: 'डाव्या हाताकडे पसरणाऱ्या छातीत तीव्र वेदना',
      hi: 'बाएं हाथ में फैलने वाला सीने में तेज दर्द',
    },
    'Severe acute breathlessness (SpO2 < 90%)': {
      mr: 'तीव्र श्वास लागणे (SpO2 < ९०%)',
      hi: 'गंभीर सांस फूलना (SpO2 < ९०%)',
    },
    'Active uncontrolled bleeding or severe hemorrhage': {
      mr: 'सुरू असलेला प्रचंड रक्तस्राव',
      hi: 'सक्रिय अनियंत्रित रक्तस्राव',
    },
    'Altered sensorium or sudden loss of consciousness': {
      mr: 'शुद्ध हरपणे किंवा अचानक बेशुद्ध पडणे',
      hi: 'बेहोशी या अचानक चेतना खोना',
    },
    'High fever with neck stiffness & confusion': {
      mr: 'मानेच्या ताठरतेसह तीव्र ताप व गोंधळ',
      hi: 'गर्दन में अकड़न और भ्रम के साथ तेज बुखार',
    },
    'Severe acute abdomen pain with shock/hypotension': {
      mr: 'पोटात तीव्र असह्य वेदना आणि रक्तदाब खालावणे',
      hi: 'पेट में असहनीय दर्द और निम्न रक्तचाप',
    },
    'Signs of pre-eclampsia / eclampsia during pregnancy': {
      mr: 'गरोदरपणातील झटके किंवा तीव्र उच्च रक्तदाब (Eclampsia)',
      hi: 'गर्भावस्था में दौरे या तीव्र उच्च रक्तचाप (Eclampsia)',
    },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-red-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border-4 border-red-600 overflow-hidden">
        {/* Pulsing Emergency Banner */}
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-ping text-white">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-red-100">
                {language === 'mr'
                  ? 'अतितातडीचा धोक्याचा इशारा आढळला (RED FLAG)'
                  : language === 'hi'
                  ? 'अति गंभीर आपातकालीन रेड-फ्लैग चेतावनी'
                  : 'CRITICAL EMERGENCY RED-FLAG DETECTED'}
              </div>
              <h2 className="text-lg md:text-xl font-black tracking-tight">
                {language === 'mr'
                  ? 'तातडीची आपत्कालीन वैद्यकीय नियमावली कार्यान्वित'
                  : language === 'hi'
                  ? 'तत्काल आपातकालीन प्रोटोकॉल सक्रिय'
                  : 'Immediate Emergency Protocol Activated'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-red-200 hover:text-white text-xs px-2.5 py-1 rounded bg-red-700 hover:bg-red-800 transition cursor-pointer"
          >
            ✕ {language === 'mr' ? 'बंद करा' : language === 'hi' ? 'खारिज करें' : 'Dismiss'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Active Red Flags List */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-xs font-bold text-red-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>
                {language === 'mr'
                  ? 'निरीक्षण केलेली गंभीर धोक्याची लक्षणे:'
                  : language === 'hi'
                  ? 'पहचाने गए गंभीर खतरे के लक्षण:'
                  : 'Critical Red Flag Symptoms Observed:'}
              </span>
            </div>
            <ul className="space-y-1.5">
              {triggeredDangerSigns.map((ds, idx) => {
                const localized = dangerSignTranslations[ds]?.[language as 'mr' | 'hi'] || ds;
                return (
                  <li key={idx} className="flex items-start gap-2 text-xs font-bold text-red-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                    <span>{localized}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Patient Quick Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">
                {language === 'mr' ? 'रुग्णाचे नाव' : language === 'hi' ? 'रोगी का नाम' : 'Patient Name'}
              </span>
              <span className="font-bold text-slate-900">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">
                {language === 'mr' ? 'वय / लिंग' : language === 'hi' ? 'आयु / लिंग' : 'Age / Gender'}
              </span>
              <span className="font-semibold text-slate-800">
                {patient.age}y ·{' '}
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
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">
                {language === 'mr' ? 'आरोग्य ओळख क्र.' : language === 'hi' ? 'स्वास्थ्य ID' : 'Health ID'}
              </span>
              <span className="font-mono font-semibold text-teal-800">{patient.healthId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">
                {language === 'mr' ? 'गाव / तालुका' : language === 'hi' ? 'गाँव / तालुका' : 'Village'}
              </span>
              <span className="font-semibold text-slate-800">
                {patient.village}, {patient.taluka}
              </span>
            </div>
          </div>

          {/* Nearest 24x7 Emergency Hospital Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between text-xs text-teal-300 font-semibold mb-1">
              <span>
                {language === 'mr'
                  ? 'जवळचे २४x७ आपत्कालीन ट्रॉमा आणि अतिदक्षता (ICU) केंद्र'
                  : language === 'hi'
                  ? 'निकटतम २४x७ आपातकालीन ट्रॉमा और आईसीयू केंद्र'
                  : 'NEAREST 24x7 EMERGENCY TRAUMA & ICU HUB'}
              </span>
              <span className="bg-teal-900/80 border border-teal-500/40 text-teal-200 px-2 py-0.5 rounded text-[10px]">
                {nearestHospital.type}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              {nearestHospital.name}
            </h3>

            <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">
                  {language === 'mr' ? 'रस्त्याचे अंतर' : language === 'hi' ? 'सड़क की दूरी' : 'Road Distance'}
                </span>
                <span className="font-mono text-base font-bold text-white">{distanceKm} km</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">
                  {language === 'mr' ? 'रुग्णवाहिका वेळ' : language === 'hi' ? 'अनुमानित समय' : 'Est. Ambulance Time'}
                </span>
                <span className="font-mono text-base font-bold text-amber-400">~{travelMinutes} mins</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">
                  {language === 'mr' ? 'ICU / O2 उपलब्धता' : language === 'hi' ? 'ICU / O2 बेड' : 'ICU Readiness'}
                </span>
                <span className="font-mono text-base font-bold text-emerald-400">
                  {nearestHospital.bedAvailability.icuBeds} ICU / {nearestHospital.bedAvailability.oxygenBeds} O2
                </span>
              </div>
            </div>
          </div>

          {/* Immediate First Aid & Stabilization Guidance */}
          <div className="border border-slate-200 rounded-xl p-4 text-xs bg-slate-50 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-teal-600" />
              <span>
                {language === 'mr'
                  ? 'तातडीचे प्राथमिक उपचार व स्थिरीकरण मार्गदर्शन (आशा / एएनएम मार्गदर्शक):'
                  : language === 'hi'
                  ? 'तत्काल प्राथमिक उपचार और स्थिरीकरण दिशा-निर्देश (आशा / एएनएम):'
                  : 'Immediate Field Stabilization Protocol (ASHA / ANM Guidance):'}
              </span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
              {language === 'mr' ? (
                <>
                  <li><strong>श्वसनमार्ग व श्वासोच्छ्वास:</strong> श्वसनमार्ग मोकळा ठेवा. प्राथमिक आरोग्य केंद्रात ऑक्सिजन उपलब्ध असल्यास त्वरित सुरू करा.</li>
                  <li><strong>रुग्णाची स्थिती:</strong> छातीत दुखणे किंवा धाप लागल्यास अर्ध-बसलेली स्थिती ठेवा; झटके आल्यास किंवा बेशुद्ध असल्यास एका कुशीवर वळवून ठेवा (Recovery position).</li>
                  <li><strong>रक्तदाब/मातृ काळजी:</strong> शॉक लागल्यास पाय वर उचला. प्रसूतीनंतर रक्तस्राव झाल्यास गर्भाशयावर बाह्य दाब (bimanual compression) द्या.</li>
                  <li><strong>वेळ न दवडता हलवा:</strong> सामान्य ओपीडी रांगेची वाट पाहू नका. त्वरित तृतीयक रुग्णालयात हलवा.</li>
                </>
              ) : language === 'hi' ? (
                <>
                  <li><strong>श्वसन मार्ग व श्वास:</strong> श्वास नली खुली रखें। पीएचसी पर ऑक्सीजन उपलब्ध हो तो तुरंत पूरक ऑक्सीजन दें।</li>
                  <li><strong>रोगी की स्थिति:</strong> सीने में दर्द या सांस फूलने पर आधी बैठी स्थिति में रखें; दौरे या बेहोशी में करवट लेकर लिटाएं।</li>
                  <li><strong>शॉक / मातृ देखभाल:</strong> शॉक में पैर ऊपर उठाएं। प्रसवोत्तर रक्तस्राव में गर्भाशय पर बाहरी दबाव दें।</li>
                  <li><strong>स्थानांतरण में देरी न करें:</strong> ओपीडी लाइन की प्रतीक्षा न करें। तत्काल रेफरल अस्पताल रवाना करें।</li>
                </>
              ) : (
                <>
                  <li><strong>Airway & Breathing:</strong> Maintain open airway. Administer supplemental oxygen if available at PHC.</li>
                  <li><strong>Positioning:</strong> Semi-recumbent position for chest pain/breathlessness; recovery lateral position if seizures or unconscious.</li>
                  <li><strong>Vascular/Maternal:</strong> Elevate feet if in shock. For postpartum hemorrhage, apply external bimanual uterine compression.</li>
                  <li><strong>Do not delay transfer:</strong> Do not wait for routine OPD queues. Transit to tertiary care immediately.</li>
                </>
              )}
            </ul>
          </div>

          {/* Ambulance Dispatch Status & Actions */}
          <div className="space-y-3 pt-2">
            {ambulanceDispatched ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-emerald-900 block text-sm">
                      {language === 'mr'
                        ? '१०८ रुग्णवाहिका सूचना पाठवली'
                        : language === 'hi'
                        ? '१०८ एम्बुलेंस प्रेषण चेतावनी भेजी गई'
                        : '108 Ambulance Dispatch Alert Sent'}
                    </span>
                    <span className="text-emerald-700">
                      {language === 'mr'
                        ? `महाराष्ट्र आपत्कालीन वैद्यकीय सेवेला कळवले आहे · पोहोचण्याची वेळ: ~${dispatchEta} मिनिटे`
                        : language === 'hi'
                        ? `महाराष्ट्र आपातकालीन चिकित्सा सेवा को सूचित किया · आगमन समय: ~${dispatchEta} मिनट`
                        : `Maharashtra Emergency Medical Services notified · Est. Arrival: ~${dispatchEta} mins`}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded border border-emerald-300">
                  TOKEN: MEMS-PUN-084
                </span>
              </div>
            ) : (
              <button
                onClick={handleAmbulanceClick}
                className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-base rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-3 cursor-pointer"
              >
                <PhoneCall className="w-6 h-6 animate-bounce" />
                <span>
                  {language === 'mr'
                    ? '१०८ आपत्कालीन रुग्णवाहिका त्वरित बोलवा'
                    : language === 'hi'
                    ? 'तुरंत १०८ एम्बुलेंस प्रेषण को कॉल करें'
                    : 'TAP TO CALL 108 AMBULANCE DISPATCH NOW'}
                </span>
              </button>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={onGenerateEmergencyReferral}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>
                  {language === 'mr'
                    ? 'आपत्कालीन संदर्भ व्हाउचर तयार व प्रिंट करा'
                    : language === 'hi'
                    ? 'आपातकालीन रेफरल वाउचर प्रिंट करें'
                    : 'Auto-Generate & Print Emergency Referral Voucher'}
                </span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                {language === 'mr' ? 'मागे जा' : language === 'hi' ? 'वापस जाएं' : 'Back to Triage'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
