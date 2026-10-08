import React, { useState, useEffect } from 'react';
import {
  Patient,
  Hospital,
  SymptomEntry,
  TriageResult,
  HospitalRecommendation,
  Referral,
  Language,
} from '../types';
import { COMMON_SYMPTOMS, DANGER_SIGNS } from '../data/mockData';
import { calculateTriage } from '../utils/triageEngine';
import { rankHospitals } from '../utils/recommendationEngine';
import { TRANSLATIONS } from '../utils/translations';
import { EmergencyRedFlagModal } from './EmergencyRedFlagModal';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Stethoscope,
  Building2,
  Calendar,
  Phone,
  FileText,
  Video,
  ArrowRight,
  ShieldAlert,
  Mic,
  MicOff,
  User,
  Plus,
  Heart,
  ChevronRight,
  AlertOctagon,
  Sparkles,
  MessageSquare,
  Lock,
} from 'lucide-react';

interface TriageFlowProps {
  patients: Patient[];
  hospitals: Hospital[];
  language: Language;
  onOpenRegister: () => void;
  onCreateReferral: (referral: Referral) => void;
  onViewReferralSlip: (referral: Referral) => void;
  onOpenTeleconsult: (session: { patient: Patient; hospital: Hospital; specialty: string }) => void;
  onPreviewNotification?: (referral: Referral) => void;
}

export const TriageFlow: React.FC<TriageFlowProps> = ({
  patients,
  hospitals,
  language,
  onOpenRegister,
  onCreateReferral,
  onViewReferralSlip,
  onOpenTeleconsult,
  onPreviewNotification,
}) => {
  const t = TRANSLATIONS[language];

  // Wizard Step: 1 = Patient & Consent, 2 = Symptoms & Voice, 3 = Vitals & Danger Flags, 4 = Review & Recommendations
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const [consentGranted, setConsentGranted] = useState<boolean>(true);

  // Symptoms & Vitals State
  const [bodyAreaFilter, setBodyAreaFilter] = useState<string>('all');
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>(['Chest Pain / Discomfort']);
  const [durationDays, setDurationDays] = useState<number>(1);
  const [painSeverity, setPainSeverity] = useState<number>(8);
  const [description, setDescription] = useState<string>(
    'Patient experiencing acute retrosternal heaviness and discomfort radiating to shoulder for the past 4 hours.'
  );
  const [selectedDangerSigns, setSelectedDangerSigns] = useState<string[]>([
    'Crushing chest pain radiating to left arm / jaw',
  ]);

  // Vitals State
  const [bpSystolic, setBpSystolic] = useState<number>(178);
  const [bpDiastolic, setBpDiastolic] = useState<number>(102);
  const [heartRate, setHeartRate] = useState<number>(110);
  const [spo2, setSpo2] = useState<number>(92);
  const [temperature, setTemperature] = useState<number>(98.6);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(24);
  const [bloodGlucose, setBloodGlucose] = useState<number>(190);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Triage Execution Results
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [rankedRecommendations, setRankedRecommendations] = useState<HospitalRecommendation[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Immediate Emergency Screen Trigger
  const [showEmergencyScreen, setShowEmergencyScreen] = useState<boolean>(false);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const handleToggleVoiceInput = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please type symptoms in the text box.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Quick Preset Test Scenarios
  const loadScenario = (type: 'cardiac_emergency' | 'pediatric_dehydration' | 'maternal_preeclampsia' | 'routine_phc') => {
    if (type === 'cardiac_emergency') {
      setSelectedComplaints(['Chest Pain / Discomfort', 'Difficulty in Breathing / Cough']);
      setDurationDays(1);
      setPainSeverity(9);
      setDescription('Sudden severe crushing chest pain, diaphoresis, radiating to jaw and left arm.');
      setSelectedDangerSigns(['Crushing chest pain radiating to left arm / jaw', 'Severe breathlessness at rest / Inability to speak']);
      setBpSystolic(186);
      setBpDiastolic(108);
      setHeartRate(114);
      setSpo2(91);
      setTemperature(98.4);
      setRespiratoryRate(26);
      setBloodGlucose(215);
      setShowEmergencyScreen(true);
    } else if (type === 'pediatric_dehydration') {
      setSelectedComplaints(['Child (<5y) Severe Diarrhea / Lethargy', 'High Fever (>3 days)']);
      setDurationDays(2);
      setPainSeverity(6);
      setDescription('3-year-old child passing watery stools 8 times today, sunken eyes, poor skin turgor.');
      setSelectedDangerSigns([]);
      setBpSystolic(92);
      setBpDiastolic(58);
      setHeartRate(132);
      setSpo2(96);
      setTemperature(102.4);
      setRespiratoryRate(32);
      setBloodGlucose(82);
      setShowEmergencyScreen(false);
    } else if (type === 'maternal_preeclampsia') {
      setSelectedComplaints(['Pregnancy Complications / Labor Pain']);
      setDurationDays(3);
      setPainSeverity(5);
      setDescription('34-week pregnant female with bilateral leg edema, persistent frontal headache, blurred vision.');
      setSelectedDangerSigns(['Pregnancy danger sign (Severe headache, blurred vision, vaginal bleeding)']);
      setBpSystolic(164);
      setBpDiastolic(104);
      setHeartRate(92);
      setSpo2(98);
      setTemperature(98.8);
      setRespiratoryRate(20);
      setBloodGlucose(105);
      setShowEmergencyScreen(true);
    } else if (type === 'routine_phc') {
      setSelectedComplaints(['High Fever (>3 days)']);
      setDurationDays(3);
      setPainSeverity(3);
      setDescription('Intermittent fever with body ache and mild shivering since 3 days.');
      setSelectedDangerSigns([]);
      setBpSystolic(122);
      setBpDiastolic(78);
      setHeartRate(82);
      setSpo2(98);
      setTemperature(100.8);
      setRespiratoryRate(18);
      setBloodGlucose(110);
      setShowEmergencyScreen(false);
    }
  };

  const handleToggleComplaint = (label: string) => {
    if (selectedComplaints.includes(label)) {
      if (selectedComplaints.length > 1) {
        setSelectedComplaints(selectedComplaints.filter((c) => c !== label));
      }
    } else {
      setSelectedComplaints([...selectedComplaints, label]);
    }
  };

  const handleToggleDangerSign = (label: string) => {
    let updated: string[];
    if (selectedDangerSigns.includes(label)) {
      updated = selectedDangerSigns.filter((s) => s !== label);
    } else {
      updated = [...selectedDangerSigns, label];
    }
    setSelectedDangerSigns(updated);

    // If a critical danger sign was added, immediately offer the Emergency screen!
    if (updated.length > 0) {
      setShowEmergencyScreen(true);
    }
  };

  const handleRunTriage = () => {
    if (!activePatient) return;
    setIsProcessing(true);

    const symptomEntry: SymptomEntry = {
      chiefComplaints: selectedComplaints,
      durationDays,
      painSeverity,
      description,
      dangerSigns: selectedDangerSigns,
      vitals: {
        bpSystolic,
        bpDiastolic,
        heartRate,
        spo2,
        temperature,
        respiratoryRate,
        bloodGlucose,
      },
    };

    setTimeout(() => {
      const result = calculateTriage(symptomEntry, activePatient.age, activePatient.gender);
      const ranked = rankHospitals(hospitals, activePatient.taluka, result);

      setTriageResult(result);
      setRankedRecommendations(ranked);
      setIsProcessing(false);
      setCurrentStep(4); // Move to review & recommendations step
    }, 350);
  };

  const handleCreateReferralForHospital = (rec: HospitalRecommendation, isTeleconsult = false) => {
    if (!triageResult || !activePatient) return;

    const randomNum = Math.floor(100 + Math.random() * 900);
    const newReferral: Referral = {
      id: `ref_${Date.now()}`,
      referralNumber: `REF-2026-PUN-${randomNum}`,
      patientId: activePatient.id,
      patientName: activePatient.name,
      patientAge: activePatient.age,
      patientGender: activePatient.gender,
      patientHealthId: activePatient.healthId,
      patientVillage: activePatient.village,
      patientTaluka: activePatient.taluka,
      patientMobile: activePatient.mobile,
      referringFacility: `PHC ${activePatient.village} Sub-Centre`,
      referringHealthWorker: 'ASHA Field Worker (Wagholi Cluster)',
      destinationHospitalId: rec.hospital.id,
      destinationHospitalName: rec.hospital.name,
      destinationTaluka: rec.hospital.taluka,
      alternativeHospital: rankedRecommendations[1]
        ? {
            id: rankedRecommendations[1].hospital.id,
            name: rankedRecommendations[1].hospital.name,
            reason: `Backup option (${rankedRecommendations[1].distanceKm} km) if ${rec.hospital.name} reaches maximum capacity`,
          }
        : undefined,
      triageResult,
      symptoms: {
        chiefComplaints: selectedComplaints,
        durationDays,
        painSeverity,
        description,
        dangerSigns: selectedDangerSigns,
        vitals: {
          bpSystolic,
          bpDiastolic,
          heartRate,
          spo2,
          temperature,
          respiratoryRate,
          bloodGlucose,
        },
      },
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentSlot: rec.recommendedSlot,
      isTeleconsultation: isTeleconsult,
      status: 'REFERRED',
      timeline: [
        {
          stage: 'REFERRED',
          timestamp: new Date().toISOString(),
          operator: 'ASHA Sunita Waghmare',
          facility: `PHC ${activePatient.village} Sub-Centre`,
          note: `Clinical triage: ${triageResult.level} priority referral generated`,
        },
      ],
      createdAt: new Date().toISOString(),
      followUpStatus: 'PENDING',
    };

    onCreateReferral(newReferral);

    if (!isTeleconsult) {
      onViewReferralSlip(newReferral);
    } else {
      onOpenTeleconsult({
        patient: activePatient,
        hospital: rec.hospital,
        specialty: triageResult.recommendedSpecialty,
      });
    }
  };

  // Filter symptoms by body area
  const filteredSymptoms = COMMON_SYMPTOMS.filter((s) => {
    if (bodyAreaFilter === 'all') return true;
    return s.bodyArea === bodyAreaFilter;
  });

  const nearestHospital = hospitals[0];

  return (
    <div className="space-y-6">
      {/* Emergency Red-Flag Modal Bypass */}
      {showEmergencyScreen && (
        <EmergencyRedFlagModal
          patient={activePatient}
          triggeredDangerSigns={selectedDangerSigns}
          nearestHospital={nearestHospital}
          language={language}
          onCall108={() => {
            // Handled inside component
          }}
          onGenerateEmergencyReferral={() => {
            handleRunTriage();
            setShowEmergencyScreen(false);
          }}
          onClose={() => setShowEmergencyScreen(false)}
        />
      )}

      {/* Top Banner & Demo Presets */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {t.nhmClinicalDecision || 'National Health Mission · Clinical Decision Support'}
            </span>
            <span className="text-xs text-slate-400">{t.puneRuralBlocks || '· Pune Rural Health Blocks'}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {t.triageWizardTitle || 'Clinical Triage & Smart Facility Matching Wizard'}
          </h1>
          <p className="text-xs text-slate-500">
            {t.triageWizardSubtitle || 'Step-by-step triage for ASHA workers with voice input, red-flag emergency screening, and MCDA facility ranking'}
          </p>
        </div>

        {/* Demo Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
          <span className="text-slate-500 px-2 font-semibold text-[11px]">{t.demoPresets || 'Demo Presets:'}</span>
          <button
            onClick={() => loadScenario('cardiac_emergency')}
            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
          >
            {t.presetCardiac || '🚨 Cardiac Emergency'}
          </button>
          <button
            onClick={() => loadScenario('maternal_preeclampsia')}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
          >
            {t.presetPreeclampsia || '🤰 Pre-eclampsia (High)'}
          </button>
          <button
            onClick={() => loadScenario('pediatric_dehydration')}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            {t.presetPediatric || '👶 Child Diarrhea'}
          </button>
          <button
            onClick={() => loadScenario('routine_phc')}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            {t.presetFever || 'Routine Fever'}
          </button>
        </div>
      </div>

      {/* 4-Step Stepper Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs">
          {[
            { step: 1, label: language === 'mr' ? 'रुग्ण आणि संमती' : language === 'hi' ? 'मरीज़ और सहमति' : 'Patient & Consent' },
            { step: 2, label: language === 'mr' ? 'लक्षणे आणि आवाज' : language === 'hi' ? 'लक्षण और आवाज' : 'Symptoms & Voice' },
            { step: 3, label: language === 'mr' ? 'तपासण्या आणि धोके' : language === 'hi' ? 'वाइटल्स और खतरे' : 'Vitals & Danger Signs' },
            { step: 4, label: language === 'mr' ? 'ट्रायज आणि रुग्णालय' : language === 'hi' ? 'ट्राइएज और अस्पताल' : 'Triage & Match' },
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              <button
                onClick={() => setCurrentStep(item.step)}
                className="flex flex-col items-center gap-1 cursor-pointer transition"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep === item.step
                      ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                      : currentStep > item.step
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > item.step ? '✓' : item.step}
                </div>
                <span
                  className={`text-[11px] whitespace-nowrap font-medium ${
                    currentStep === item.step ? 'text-teal-800 font-bold' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
              {idx < 3 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    currentStep > item.step ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Step Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        {/* STEP 1: PATIENT SELECTION & CONSENT */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{t.step1Title || 'Step 1: Patient Selection & Consent'}</h2>
                <p className="text-xs text-slate-500">{t.step1Sub || 'Verify health identity, pre-existing conditions, allergies, and data exchange consent'}</p>
              </div>
              <button
                onClick={onOpenRegister}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.registerNewPatient || 'Register New Patient'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.selectPatient || 'Select Registered Rural Patient:'}
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full text-sm font-medium px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age}y, {p.village}) · {p.healthId}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Patient Details Card */}
            {activePatient && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{activePatient.name}</h3>
                    <div className="text-slate-500">
                      {activePatient.age} Yrs · {activePatient.gender} · Blood Group: {activePatient.bloodGroup} · Contact: {activePatient.mobile}
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-teal-800 bg-white px-3 py-1 rounded border border-slate-300">
                    {activePatient.healthId}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-slate-700 block">
                      {language === 'mr' ? 'गाव व तालुका:' : language === 'hi' ? 'गांव व तालुका:' : 'Village & Taluka:'}
                    </span>
                    <span className="text-slate-900 font-medium">
                      {activePatient.village}, Taluka {activePatient.taluka}, Pune
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">
                      {language === 'mr' ? 'आपत्कालीन संपर्क:' : language === 'hi' ? 'आपातकालीन संपर्क:' : 'Emergency Contact:'}
                    </span>
                    <span className="text-slate-900 font-medium">{activePatient.emergencyContact}</span>
                  </div>
                </div>

                {/* Allergies & Current Medications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div className="p-2.5 bg-red-50/70 border border-red-200 rounded-lg">
                    <span className="font-bold text-red-900 block mb-0.5">
                      {language === 'mr' ? '⚠️ नोंदवलेली औषध ॲलर्जी:' : language === 'hi' ? '⚠️ दर्ज दवा एलर्जी:' : '⚠️ Documented Drug Allergies:'}
                    </span>
                    <span className="text-red-800 font-medium">
                      {activePatient.allergies?.length > 0 ? activePatient.allergies.join(', ') : (language === 'mr' ? 'कोणतीही ॲलर्जी नोंदवलेली नाही' : language === 'hi' ? 'कोई ज्ञात दवा एलर्जी नहीं है' : 'No known drug allergies reported')}
                    </span>
                  </div>

                  <div className="p-2.5 bg-teal-50/70 border border-teal-200 rounded-lg">
                    <span className="font-bold text-teal-900 block mb-0.5">
                      {language === 'mr' ? '💊 चालू असलेली नियमित औषधे:' : language === 'hi' ? '💊 वर्तमान नियमित दवाएं:' : '💊 Current Routine Medications:'}
                    </span>
                    <span className="text-teal-800 font-medium">
                      {activePatient.currentMedications?.length > 0 ? activePatient.currentMedications.join(', ') : (language === 'mr' ? 'काही नाही' : language === 'hi' ? 'कोई नहीं' : 'None')}
                    </span>
                  </div>
                </div>

                {/* Consent checkbox */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentGranted}
                      onChange={(e) => setConsentGranted(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">
                        {t.patientConsentText || 'Informed Patient Consent for Clinical Data Sharing (DPDP / ABDM Compliance)'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {t.patientConsentSub || 'Patient agrees to share vitals and triage records with the destination referral facility'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!consentGranted}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <span>{t.continueToSymptoms || 'Continue to Symptoms & Voice Input'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SYMPTOMS, VOICE INPUT & BODY AREA */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{t.step2Title || 'Step 2: Chief Complaints & Symptoms'}</h2>
                <p className="text-xs text-slate-500">{t.step2Sub || 'Filter by body area, tap common complaints, or use speech-to-text voice input'}</p>
              </div>

              {/* Voice Input Button */}
              <button
                onClick={handleToggleVoiceInput}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100'
                }`}
                title="Tap to speak in Marathi, Hindi, or English"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? (t.voiceListening || 'Listening... (Speak Now)') : (t.voiceInput || 'Voice Input')}</span>
              </button>
            </div>

            {/* Body Area Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'mr' ? 'शारीरिक भाग / अवयव निवडा:' : language === 'hi' ? 'शारीरिक अंग / क्षेत्र चुनें:' : 'Body Area Selector:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: language === 'mr' ? 'सर्व भाग' : language === 'hi' ? 'सभी भाग' : 'All Areas' },
                  { id: 'chest', label: language === 'mr' ? '🫀 छाती व हृदय' : language === 'hi' ? '🫀 सीना व हृदय' : '🫀 Chest & Heart' },
                  { id: 'respiratory', label: language === 'mr' ? '🫁 श्वसन व फुफ्फुसे' : language === 'hi' ? '🫁 श्वसन व फेफड़े' : '🫁 Breathing & Lungs' },
                  { id: 'head', label: language === 'mr' ? '🧠 डोके व मेंदू' : language === 'hi' ? '🧠 सिर व तंत्रिका' : '🧠 Head & Neuro' },
                  { id: 'abdomen', label: language === 'mr' ? '🥘 पोट व पचन' : language === 'hi' ? '🥘 पेट व पाचन' : '🥘 Abdomen & Digestion' },
                  { id: 'maternal', label: language === 'mr' ? '🤰 गरोदरपण व प्रसूती' : language === 'hi' ? '🤰 प्रसूति व गर्भावस्था' : '🤰 Maternal / Labor' },
                  { id: 'general', label: language === 'mr' ? '🩺 सामान्य व ताप' : language === 'hi' ? '🩺 सामान्य व बुखार' : '🩺 General / Fever' },
                ].map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setBodyAreaFilter(area.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      bodyAreaFilter === area.id
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptom chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'mr' ? 'आढळलेली लक्षणे निवडा:' : language === 'hi' ? 'पाए गए लक्षण चुनें:' : 'Select Observed Symptoms:'}
              </label>
              <div className="flex flex-wrap gap-2">
                {filteredSymptoms.map((sym) => {
                  const isSelected = selectedComplaints.includes(sym.labelEn);
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => handleToggleComplaint(sym.labelEn)}
                      className={`text-xs px-3 py-2 rounded-xl font-semibold transition cursor-pointer border ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                      }`}
                    >
                      {language === 'mr' ? sym.labelMr : language === 'hi' ? ((sym as any).labelHi || sym.labelEn) : sym.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'mr' ? 'लक्षणांचा कालावधी:' : language === 'hi' ? 'लक्षणों की अवधि:' : 'Symptom Duration:'}{' '}
                  <span className="font-mono text-teal-700 font-bold">{durationDays} {language === 'mr' ? 'दिवस' : language === 'hi' ? 'दिन' : 'Days'}</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full text-sm font-mono px-3 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'mr' ? 'वेदना / त्रासाची तीव्रता:' : language === 'hi' ? 'दर्द / तकलीफ़ की तीव्रता:' : 'Pain / Distress Severity:'}{' '}
                  <span className="font-mono text-red-600 font-bold">{painSeverity}/10</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={painSeverity}
                  onChange={(e) => setPainSeverity(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
                />
              </div>
            </div>

            {/* Narrative / Voice transcription */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'mr' ? 'शारीरिक निरीक्षण नोंद (आवाजाने किंवा टाईप करून):' : language === 'hi' ? 'शारीरिक अवलोकन टिप्पणी (बोलकर या टाइप करके):' : 'Clinical Observation Narrative (Transcribed by voice or typed):'}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'mr' ? 'त्रासाची सुरुवात, वेदनांचा प्रकार, रुग्णाची स्थिती लिहा...' : language === 'hi' ? 'दर्द की शुरुआत, फैलाव, मरीज़ की स्थिति लिखें...' : 'Describe onset, radiation of pain, patient appearance...'}
                className="w-full text-xs px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                {language === 'mr' ? 'मागे' : language === 'hi' ? 'पीछे' : 'Back'}
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <span>{t.continueToVitals || 'Continue to Vitals & Red Flags'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: VITALS & DANGER FLAGS */}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">{t.step3Title || 'Step 3: Clinical Vitals & Red Flag Danger Signs'}</h2>
              <p className="text-xs text-slate-500">{t.step3Sub || 'Record measured vitals from Sub-Centre kit. Any red flag triggers immediate emergency escalation.'}</p>
            </div>

            {/* Red Flag Danger Signs Box */}
            <div className="bg-red-50/80 p-5 rounded-xl border border-red-200 space-y-3">
              <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>{language === 'mr' ? 'तातडीचे आपत्कालीन धोक्याचे संकेत:' : language === 'hi' ? 'तत्काल आपातकालीन खतरे के संकेत:' : 'Immediate Emergency Red Flags:'}</span>
              </div>

              <div className="space-y-2">
                {DANGER_SIGNS.map((ds) => {
                  const isChecked = selectedDangerSigns.includes(ds.labelEn);
                  return (
                    <label
                      key={ds.id}
                      className={`flex items-start gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition ${
                        isChecked ? 'bg-red-100 text-red-950 font-bold' : 'hover:bg-red-100/50 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDangerSign(ds.labelEn)}
                        className="mt-0.5 rounded text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <span>{language === 'mr' ? ds.labelMr : language === 'hi' ? ds.labelHi : ds.labelEn}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Vitals Grid */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {language === 'mr' ? 'शारीरिक तपासणी मोजमापे:' : language === 'hi' ? 'शारीरिक जांच माप:' : 'Field Vitals Measurements:'}
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'mr' ? 'सिस्टोलिक रक्तदाब (mmHg)' : language === 'hi' ? 'सिस्टोलिक रक्तचाप (mmHg)' : 'Systolic BP (mmHg)'}
                  </label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(Number(e.target.value))}
                    className={`w-full text-sm font-mono px-3 py-2 border rounded-xl font-bold ${
                      bpSystolic >= 180 || bpSystolic < 85
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'mr' ? 'डायस्टोलिक रक्तदाब (mmHg)' : language === 'hi' ? 'डायस्टोलिक रक्तचाप (mmHg)' : 'Diastolic BP (mmHg)'}
                  </label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(Number(e.target.value))}
                    className={`w-full text-sm font-mono px-3 py-2 border rounded-xl font-bold ${
                      bpDiastolic >= 110 || bpDiastolic < 55
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'mr' ? 'ऑक्सिजन प्रमाण SpO2 (%)' : language === 'hi' ? 'ऑक्सीजन स्तर SpO2 (%)' : 'SpO2 Arterial O2 (%)'}
                  </label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className={`w-full text-sm font-mono px-3 py-2 border rounded-xl font-bold ${
                      spo2 < 90
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : spo2 <= 93
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'mr' ? 'नाडीचे ठोके (bpm)' : language === 'hi' ? 'हृदय गति / पल्स (bpm)' : 'Heart Rate (bpm)'}
                  </label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'mr' ? 'शरीराचे तापमान (°F)' : language === 'hi' ? 'शारीरिक तापमान (°F)' : 'Temperature (°F)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'mr' ? 'श्वसन गती (/min)' : language === 'hi' ? 'श्वसन दर (/min)' : 'Respiratory Rate (/min)'}
                  </label>
                  <input
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                    className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                {language === 'mr' ? 'मागे' : language === 'hi' ? 'पीछे' : 'Back'}
              </button>
              <button
                onClick={handleRunTriage}
                disabled={isProcessing}
                className="px-8 py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                {isProcessing ? (
                  <span>{t.calculating || 'Evaluating Clinical Triage Model...'}</span>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    <span>{t.runAiTriage || 'Run Clinical Triage & Rank Hospitals'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW, TRIAGE CLASSIFICATION & HOSPITAL MATCHING */}
        {currentStep === 4 && triageResult && (
          <div className="space-y-6">
            {/* Triage Banner */}
            <div
              className={`p-6 rounded-2xl border shadow-sm ${
                triageResult.level === 'HIGH'
                  ? 'bg-red-50 border-red-200 text-red-950'
                  : triageResult.level === 'MEDIUM'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                      triageResult.level === 'HIGH'
                        ? 'bg-red-600 text-white'
                        : triageResult.level === 'MEDIUM'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {triageResult.level} {language === 'mr' ? 'प्राधान्य' : language === 'hi' ? 'प्राथमिकता' : 'PRIORITY'}
                  </span>
                  <span className="font-mono text-xs font-bold">
                    {language === 'mr' ? 'ट्रायज स्कोअर:' : language === 'hi' ? 'ट्राइएज स्कोर:' : 'Triage Score:'} {triageResult.score}/100
                  </span>
                </div>

                {triageResult.ambulanceRequired && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold animate-pulse">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{language === 'mr' ? '१०८ रुग्णवाहिका तात्काळ बोलवण्याची शिफारस' : language === 'hi' ? '108 एम्बुलेंस तुरंत बुलाने की सिफारिश' : '108 Ambulance Dispatch Alert Recommended'}</span>
                  </div>
                )}
              </div>

              <h3 className="text-base font-bold mb-1">
                {triageResult.level === 'HIGH'
                  ? t.highUrgency
                  : triageResult.level === 'MEDIUM'
                  ? t.mediumUrgency
                  : t.lowUrgency}
              </h3>

              <p className="text-xs leading-relaxed text-slate-800 mb-4">
                {triageResult.clinicalJustification}
              </p>

              {/* Specialty & Required Tests row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    {t.recommendedSpecialty || 'Recommended Specialty:'}
                  </span>
                  <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 inline-block">
                    {triageResult.recommendedSpecialty}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    {language === 'mr' ? 'आवश्यक चाचण्या व तपासण्या:' : language === 'hi' ? 'आवश्यक जांच व टेस्ट:' : 'Required Diagnostic Tests:'}
                  </span>
                  <span className="font-medium text-slate-800">
                    {triageResult.requiredTests.join(', ')}
                  </span>
                </div>
              </div>

              {/* Factor Breakdown */}
              {triageResult.scoreBreakdown.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    {language === 'mr' ? 'कारणीभूत जोखीम घटक:' : language === 'hi' ? 'प्रमुख जोखिम कारक:' : 'Contributing Risk Factors:'}
                  </span>
                  <div className="space-y-1">
                    {triageResult.scoreBreakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-white/80 px-3 py-1.5 rounded-lg"
                      >
                        <span className="text-slate-700">{item.factor}</span>
                        <span className="font-mono font-semibold text-slate-900">
                          +{item.contribution} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Matched Hospitals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>{t.matchedFacilities || 'Matched Facilities Ranked by Multi-Criteria Fit (MCDA)'}</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {language === 'mr' ? 'रुग्णाचे गाव:' : language === 'hi' ? 'मरीज़ का गांव:' : 'Patient Location:'} {activePatient.village} ({activePatient.taluka})
                </span>
              </div>

              <div className="space-y-4">
                {rankedRecommendations.map((rec, rankIdx) => (
                  <div
                    key={rec.hospital.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition hover:shadow-md ${
                      rankIdx === 0 ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          {rankIdx === 0 && (
                            <span className="bg-teal-600 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                              {language === 'mr' ? 'सर्वोत्तम शिफारस (#१)' : language === 'hi' ? 'सर्वश्रेष्ठ मिलान (#1)' : 'Best Match (#1)'}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-medium">
                            {rec.hospital.type} · Taluka {rec.hospital.taluka}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">
                          {rec.hospital.name}
                        </h4>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-mono font-bold text-teal-700">
                          {rec.totalScore}%
                        </div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">
                          {language === 'mr' ? 'सुसंगतता स्कोअर' : language === 'hi' ? 'मिलान स्कोर' : 'Match Fit Score'}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase">{language === 'mr' ? 'अंतर' : language === 'hi' ? 'दूरी' : 'Distance'}</span>
                        <span className="font-mono font-bold text-slate-900">{rec.distanceKm} km</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase">{language === 'mr' ? 'प्रवासाचा वेळ' : language === 'hi' ? 'अनुमानित समय' : 'Est. Travel Time'}</span>
                        <span className="font-mono font-bold text-slate-900">~{rec.estimatedTravelMinutes} mins</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase">{language === 'mr' ? 'उपलब्ध वेळ' : language === 'hi' ? 'उपलब्ध समय' : 'Open Slot'}</span>
                        <span className="font-medium text-teal-800 truncate block">{rec.recommendedSlot}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase">{language === 'mr' ? 'आयसीयू व खाटा' : language === 'hi' ? 'आईसीयू व बिस्तर' : 'ICU & Beds'}</span>
                        <span className="font-mono font-bold text-slate-900">
                          {rec.hospital.bedAvailability.icuBeds} ICU · {rec.hospital.bedAvailability.oxygenBeds} O2
                        </span>
                      </div>
                    </div>

                    {/* Reasons */}
                    <div className="space-y-1 mb-4 text-xs">
                      {rec.matchReasons.map((reason, rIdx) => (
                        <div key={rIdx} className="flex items-center gap-1.5 text-slate-700">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'mr' ? 'आपत्कालीन संपर्क:' : language === 'hi' ? 'आपातकालीन फोन:' : 'Emergency:'} {rec.hospital.emergencyPhone}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {rec.hospital.hasTeleconsultation && triageResult.level !== 'HIGH' && (
                          <button
                            onClick={() => handleCreateReferralForHospital(rec, true)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5 text-teal-600" />
                            <span>{language === 'mr' ? 'व्हिडिओ कॉल नोंदवा' : language === 'hi' ? 'टेलीकंसल्टेशन बुक करें' : 'Book Teleconsult'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleCreateReferralForHospital(rec, false)}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t.generateReferralSlip || 'Issue Digital Referral'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                {language === 'mr' ? '← तपासणी बदलण्यासाठी मागे जा' : language === 'hi' ? '← वाइटल्स बदलने के लिए पीछे जाएं' : '← Back to Edit Vitals'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
