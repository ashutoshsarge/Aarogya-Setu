import React, { useState, useEffect } from 'react';
import { Patient, Hospital, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Stethoscope,
  Send,
  Pill,
  User,
  Shield,
  FileText,
} from 'lucide-react';

interface TeleconsultationModalProps {
  session: {
    patient: Patient;
    hospital: Hospital;
    specialty: string;
  };
  language: Language;
  onClose: () => void;
  onSavePrescription?: (notes: string) => void;
}

export const TeleconsultationModal: React.FC<TeleconsultationModalProps> = ({
  session,
  language,
  onClose,
  onSavePrescription,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([
    {
      sender: 'Dr. Anand Deshmukh',
      text:
        language === 'mr'
          ? `नमस्कार, मी आपल्या ${session.specialty} संदर्भातील लक्षणांची तपासणी करत आहे. सध्या आपल्याला कसे वाटत आहे?`
          : language === 'hi'
          ? `नमस्कार, मैं आपके ${session.specialty} संबंधी लक्षणों की समीक्षा कर रहा हूँ। अभी आप कैसा महसूस कर रहे हैं?`
          : `Namaskar, I am reviewing your symptoms for ${session.specialty}. How are you feeling right now?`,
      time: '10:30 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender:
        language === 'mr'
          ? 'रुग्ण / आरोग्य कार्यकर्ता'
          : language === 'hi'
          ? 'रोगी / स्वास्थ्य कार्यकर्ता'
          : 'Patient / Health Worker',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMsg]);
    setChatInput('');

    // Simulated doctor reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'Dr. Anand Deshmukh',
          text:
            language === 'mr'
              ? 'समजले. कृपया खोल श्वास घेत राहा. मी या नोंदी आपल्या डिजिटल आरोग्य पासपोर्टमध्ये नोंदवत आहे.'
              : language === 'hi'
              ? 'समझ गया। कृपया गहरी सांस लेते रहें। मैं ये अवलोकन आपके डिजिटल स्वास्थ्य पासपोर्ट में दर्ज कर रहा हूँ।'
              : 'Understood. Please keep taking deep breaths. I am recording these observations into your digital health passport.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  const handleEndCall = () => {
    if (onSavePrescription) {
      onSavePrescription(clinicalNotes);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-3 bg-slate-950 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                {language === 'mr'
                  ? 'थेट ग्रामीण टेलिकन्सल्टेशन कक्ष · एनएचएम ई-संजीवनी प्रणाली'
                  : language === 'hi'
                  ? 'लाइव ग्रामीण टेलीकंसल्टेशन बूथ · एनएचएम ई-संजीवनी मोड'
                  : 'Live Rural Teleconsultation Booth · NHM e-Sanjeevani Mode'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {session.patient.name} ({session.patient.village}) ↔ {session.hospital.name} ({session.specialty})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-teal-400 bg-teal-950/80 border border-teal-800 px-2 py-0.5 rounded">
              {language === 'mr'
                ? 'सुरक्षित WebRTC सत्र'
                : language === 'hi'
                ? 'सुरक्षित WebRTC सत्र'
                : 'Encrypted WebRTC Session'}
            </span>
            <button
              onClick={handleEndCall}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'कॉल समाप्त करा' : language === 'hi' ? 'कॉल समाप्त करें' : 'End Call'}</span>
            </button>
          </div>
        </div>

        {/* Main Teleconsult Body: Left = Video Boxes, Right = Clinical Notes & Chat */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Video Streams Column (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 p-4 flex flex-col justify-between gap-4">
            {/* Primary Doctor Screen Preview */}
            <div className="relative flex-1 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center min-h-[220px]">
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-slate-700 mx-auto flex items-center justify-center text-teal-400 mb-3 border-2 border-teal-500/50">
                  <Stethoscope className="w-10 h-10" />
                </div>
                <h4 className="text-sm font-bold text-white">Dr. Anand Deshmukh, MD</h4>
                <p className="text-xs text-teal-300 font-medium">
                  {language === 'mr'
                    ? `तज्ज्ञ सल्लागार · ${session.specialty}`
                    : language === 'hi'
                    ? `विशेषज्ञ सलाहकार · ${session.specialty}`
                    : `Attending Consultant · ${session.specialty}`}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{session.hospital.name}</p>

                {/* Simulated Audio Waveform */}
                <div className="flex items-center justify-center gap-1 mt-4">
                  <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce" />
                  <span className="w-1 h-6 bg-teal-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-4 bg-teal-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-1 h-7 bg-teal-400 rounded-full animate-bounce [animation-delay:0.45s]" />
                  <span className="w-1 h-2 bg-teal-400 rounded-full animate-bounce" />
                </div>
              </div>

              {/* Status pill in corner */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] text-white flex items-center gap-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  {language === 'mr'
                    ? 'डॉक्टर व्हिडिओ जोडला गेला'
                    : language === 'hi'
                    ? 'डॉक्टर वीडियो कनेक्टेड'
                    : 'Doctor Video Connected'}
                </span>
              </div>
            </div>

            {/* Self / Patient Feed & Control Bar */}
            <div className="flex items-center justify-between gap-4">
              {/* Patient PiP feed */}
              <div className="w-40 h-24 bg-slate-800 rounded-lg border border-slate-700 relative overflow-hidden flex items-center justify-center shrink-0">
                {isVideoOn ? (
                  <div className="text-center">
                    <User className="w-8 h-8 text-slate-400 mx-auto" />
                    <span className="text-[10px] text-slate-300 block">{session.patient.name}</span>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[10px] flex items-center gap-1">
                    <VideoOff className="w-3 h-3" />{' '}
                    {language === 'mr' ? 'कॅमेरा बंद' : language === 'hi' ? 'कैमरा बंद' : 'Camera Off'}
                  </div>
                )}
                <div className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white">
                  {language === 'mr' ? 'गाव उपकेंद्र' : language === 'hi' ? 'गाँव उप-केंद्र' : 'Village Sub-Centre'}
                </div>
              </div>

              {/* Floating Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-3 rounded-full transition cursor-pointer ${
                    isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-600 text-white'
                  }`}
                  title={isMicOn ? 'Mute' : 'Unmute'}
                >
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-full transition cursor-pointer ${
                    isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-600 text-white'
                  }`}
                  title={isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
                >
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-full flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>
                    {language === 'mr'
                      ? 'सल्लामसलत समाप्त करा'
                      : language === 'hi'
                      ? 'परामर्श समाप्त करें'
                      : 'Leave Consultation'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Clinical Notes & Real-time Consultation Chat (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 border-l border-slate-800 flex flex-col justify-between">
            {/* Patient Clinical Sheet */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/60 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{session.patient.name}</span>
                <span className="font-mono text-teal-400">{session.patient.healthId}</span>
              </div>
              <div className="text-slate-400">
                {session.patient.age}{' '}
                {language === 'mr' ? 'वर्षे' : language === 'hi' ? 'वर्ष' : 'y'} ·{' '}
                {session.patient.gender === 'MALE'
                  ? language === 'mr'
                    ? 'पुरुष'
                    : language === 'hi'
                    ? 'पुरुष'
                    : 'Male'
                  : session.patient.gender === 'FEMALE'
                  ? language === 'mr'
                    ? 'महिला'
                    : language === 'hi'
                    ? 'महिला'
                    : 'Female'
                  : session.patient.gender}{' '}
                · {session.patient.village}, {session.patient.taluka}
              </div>
              {session.patient.existingConditions.length > 0 && (
                <div className="text-[11px] text-amber-300">
                  {language === 'mr' ? 'मागील आजार:' : language === 'hi' ? 'पूर्व इतिहास:' : 'Known History:'}{' '}
                  {session.patient.existingConditions.join(', ')}
                </div>
              )}
            </div>

            {/* Doctor Clinical Notes Entry Pad */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/40">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                {language === 'mr'
                  ? 'टेलिकन्सल्ट वैद्यकीय निरीक्षणे व प्रिस्क्रिप्शन'
                  : language === 'hi'
                  ? 'टेलीकंसल्ट नैदानिक अवलोकन व दवा पर्चा'
                  : 'Teleconsult Clinical Observations & Prescription'}
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder={
                  language === 'mr'
                    ? 'डॉक्टर: सल्ला, आहाराविषयी सूचना किंवा प्रयोगशाळा चाचण्या नोंदवा...'
                    : language === 'hi'
                    ? 'डॉक्टर: सलाह, आहार संबंधी निर्देश या लैब जांच दर्ज करें...'
                    : 'Doctor: Enter advice, dietary instructions, or required lab investigations...'
                }
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Real-time Consultation Chat Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-2.5 rounded-lg max-w-[85%] ${
                    m.sender === 'Dr. Anand Deshmukh'
                      ? 'bg-teal-950/70 border border-teal-800/60 text-teal-100 self-start'
                      : 'bg-slate-800 text-white ml-auto'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-0.5">
                    <span className="font-semibold text-teal-300">{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  language === 'mr'
                    ? 'वैद्यकीय प्रश्न किंवा लक्षणांची माहिती टाइप करा...'
                    : language === 'hi'
                    ? 'चिकित्सीय प्रश्न या लक्षणों का विवरण टाइप करें...'
                    : 'Type a clinical query or symptom update...'
                }
                className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
