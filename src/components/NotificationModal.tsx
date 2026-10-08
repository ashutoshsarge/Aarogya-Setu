import React, { useState } from 'react';
import { Referral, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  MessageSquare,
  Smartphone,
  CheckCheck,
  Phone,
  Calendar,
  Share2,
} from 'lucide-react';

interface NotificationModalProps {
  referral: Referral;
  language: Language;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  referral,
  language,
  onClose,
}) => {
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [msgLang, setMsgLang] = useState<Language>(language);

  // Message templates in 3 languages
  const getAppointmentMessage = () => {
    if (msgLang === 'mr') {
      return `राष्ट्रीय आरोग्य अभियान (NHM) महाराष्ट्र:\n\nनमस्कार ${referral.patientName}, आपले डिजिटल संदर्भ नोंदणी क्र. ${referral.referralNumber} यशस्वीरित्या पूर्ण झाले आहे.\n\nरुग्णालय: ${referral.destinationHospitalName}\nविभाग: ${referral.triageResult.recommendedSpecialty}\nवेळ: ${referral.appointmentDate} (${referral.appointmentSlot})\n\nकृपया पोहोचल्यावर ओपीडी काऊंटरवर आपली डिजिटल पावती दाखवा. आपत्कालीन मदतीसाठी १०८ डायल करा.`;
    }
    if (msgLang === 'hi') {
      return `राष्ट्रीय स्वास्थ्य मिशन (NHM) महाराष्ट्र:\n\nनमस्ते ${referral.patientName}, आपका डिजिटल रेफरल क्र. ${referral.referralNumber} सफलतापूर्वक दर्ज हो गया है।\n\nअस्पताल: ${referral.destinationHospitalName}\nविभाग: ${referral.triageResult.recommendedSpecialty}\nसमय: ${referral.appointmentDate} (${referral.appointmentSlot})\n\nअस्पताल पहुँचकर ओपीडी पर यह संदेश दिखाएं। आपातकाल में 108 पर कॉल करें।`;
    }
    return `National Health Mission (NHM) Maharashtra:\n\nHello ${referral.patientName}, your digital referral voucher ${referral.referralNumber} is confirmed.\n\nHospital: ${referral.destinationHospitalName}\nDepartment: ${referral.triageResult.recommendedSpecialty}\nSlot: ${referral.appointmentDate} (${referral.appointmentSlot})\n\nPlease present your digital QR slip at OPD reception. In emergency dial 108.`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold">
              {language === 'mr'
                ? 'रुग्ण सूचना पूर्वावलोकन'
                : language === 'hi'
                ? 'रोगी अधिसूचना पूर्वावलोकन'
                : 'Patient Notification Preview'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Channel and Language Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setChannel('whatsapp')}
                className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer ${
                  channel === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                }`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setChannel('sms')}
                className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer ${
                  channel === 'sms' ? 'bg-slate-800 text-white' : 'text-slate-600'
                }`}
              >
                SMS
              </button>
            </div>

            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setMsgLang('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${msgLang === 'en' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
              >
                English
              </button>
              <button
                onClick={() => setMsgLang('mr')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${msgLang === 'mr' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
              >
                मराठी
              </button>
              <button
                onClick={() => setMsgLang('hi')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${msgLang === 'hi' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
              >
                हिंदी
              </button>
            </div>
          </div>

          {/* Smartphone Chat Bubble Mockup */}
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 min-h-[260px] flex flex-col justify-end">
            <div
              className={`p-3.5 rounded-2xl shadow-sm text-xs max-w-[95%] whitespace-pre-line leading-relaxed ${
                channel === 'whatsapp'
                  ? 'bg-emerald-50 border border-emerald-200 text-slate-900 ml-auto'
                  : 'bg-white border border-slate-300 text-slate-900 ml-auto'
              }`}
            >
              {getAppointmentMessage()}
              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-2 font-mono">
                <span>{language === 'mr' ? 'आत्ताच' : language === 'hi' ? 'अभी-अभी' : 'Just now'}</span>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            {language === 'mr' ? (
              <>शासकीय राष्ट्रीय आरोग्य अभियान (NHM) एसएमएस गेटवेवरून <strong className="font-mono">{referral.patientMobile}</strong> वर पाठवले</>
            ) : language === 'hi' ? (
              <>सरकारी राष्ट्रीय स्वास्थ्य मिशन (NHM) एसएमएस गेटवे द्वारा <strong className="font-mono">{referral.patientMobile}</strong> पर भेजा गया</>
            ) : (
              <>Sent via Government National Health Mission (NHM) SMS Gateway to <strong className="font-mono">{referral.patientMobile}</strong></>
            )}
          </p>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl cursor-pointer"
          >
            {language === 'mr' ? 'पूर्वावलोकन बंद करा' : language === 'hi' ? 'पूर्वावलोकन बंद करें' : 'Close Preview'}
          </button>
        </div>
      </div>
    </div>
  );
};
