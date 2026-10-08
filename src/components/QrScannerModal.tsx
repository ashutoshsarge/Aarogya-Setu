import React, { useState } from 'react';
import { Referral, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  QrCode,
  Scan,
  CheckCircle2,
  Building,
  User,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface QrScannerModalProps {
  referrals: Referral[];
  language: Language;
  onScanReached: (referralId: string, operatorName: string) => void;
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  referrals,
  language,
  onScanReached,
  onClose,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [selectedReferralId, setSelectedReferralId] = useState<string>(
    referrals.find((r) => r.status === 'REFERRED')?.id || referrals[0]?.id || ''
  );
  const [operatorName, setOperatorName] = useState(
    language === 'mr'
      ? 'कर्मचारी परिचारिका प्रतिमा (ओपीडी कक्ष)'
      : language === 'hi'
      ? 'स्टाफ नर्स प्रतिमा (ओपीडी डेस्क)'
      : 'Staff Nurse Pratima (OPD Desk)'
  );
  const [scanSuccess, setScanSuccess] = useState(false);

  const selectedRef = referrals.find((r) => r.id === selectedReferralId);

  const handleConfirmScan = () => {
    if (!selectedRef) return;
    onScanReached(selectedRef.id, operatorName);
    setScanSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold">
              {language === 'mr'
                ? 'रुग्णालय आगमन किओस्क · QR स्कॅनर'
                : language === 'hi'
                ? 'अस्पताल आगमन कियोस्क · QR स्कैनर'
                : 'Hospital Arrival Kiosk · QR Scanner'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Simulated Scanner Viewport */}
          <div className="bg-slate-950 rounded-xl p-6 text-center text-white relative overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-teal-500/50">
            <div className="w-28 h-28 relative flex items-center justify-center mb-2">
              <QrCode className="w-24 h-24 text-teal-400 opacity-80" />
              {/* Animated Laser Scanning Line */}
              <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-sm shadow-red-500 animate-[bounce_2s_infinite]" />
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'mr'
                ? 'व्ह्यूफाइंडरमध्ये संदर्भ व्हाउचरचा QR कोड जुळवा'
                : language === 'hi'
                ? 'व्यूफाइंडर में रेफरल वाउचर का QR कोड संरेखित करें'
                : 'Align Referral Voucher QR Code within the viewfinder'}
            </p>
          </div>

          {/* Select Referral to simulate scan */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {language === 'mr'
                ? 'स्कॅन करण्यासाठी येणारे रुग्ण व्हाउचर निवडा:'
                : language === 'hi'
                ? 'स्कैन करने के लिए आने वाला रोगी वाउचर चुनें:'
                : 'Select Incoming Patient Voucher to Scan:'}
            </label>
            <select
              value={selectedReferralId}
              onChange={(e) => setSelectedReferralId(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium"
            >
              {referrals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.referralNumber} · {r.patientName} ({r.patientVillage}) ·{' '}
                  {language === 'mr' ? 'स्थिती' : language === 'hi' ? 'स्थिति' : 'Status'}: {r.status}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Details */}
          {selectedRef && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedRef.patientName}</span>
                <span className="font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {selectedRef.patientHealthId}
                </span>
              </div>
              <div className="text-slate-600">
                {selectedRef.patientAge} {language === 'mr' ? 'वर्षे' : language === 'hi' ? 'वर्ष' : 'y'} ·{' '}
                {selectedRef.patientGender === 'MALE'
                  ? language === 'mr'
                    ? 'पुरुष'
                    : language === 'hi'
                    ? 'पुरुष'
                    : 'Male'
                  : selectedRef.patientGender === 'FEMALE'
                  ? language === 'mr'
                    ? 'महिला'
                    : language === 'hi'
                    ? 'महिला'
                    : 'Female'
                  : selectedRef.patientGender}{' '}
                · {selectedRef.patientVillage}, {selectedRef.patientTaluka}
              </div>
              <div className="text-slate-700">
                {language === 'mr' ? 'गंतव्य रुग्णालय: ' : language === 'hi' ? 'गंतव्य अस्पताल: ' : 'Destination: '}
                <strong className="text-slate-900">{selectedRef.destinationHospitalName}</strong> (
                {selectedRef.triageResult.recommendedSpecialty})
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-slate-500">
                  {language === 'mr' ? 'ट्रायज प्राधान्य:' : language === 'hi' ? 'ट्राइएज प्राथमिकता:' : 'Triage Priority:'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedRef.triageResult.level === 'HIGH'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedRef.triageResult.level}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {language === 'mr'
                ? 'ओपीडी नोंदणी लिपिक / ट्रायज परिचारिका:'
                : language === 'hi'
                ? 'ओपीडी स्वागतकर्ता / ट्राइएज नर्स का नाम:'
                : 'OPD Receptionist / Triage Nurse Name:'}
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* CTA */}
          <div className="pt-2">
            {scanSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'mr'
                    ? 'रुग्ण आगमन निश्चित झाले आणि "पोहोचले" म्हणून चिन्हांकित केले!'
                    : language === 'hi'
                    ? 'रोगी का आगमन सत्यापित हुआ और "पहुंच गए" अंकित किया गया!'
                    : 'Patient Arrival Confirmed & Marked REACHED!'}
                </span>
              </div>
            ) : (
              <button
                onClick={handleConfirmScan}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === 'mr'
                    ? 'QR कोडची पुष्टी करा व रुग्णाला "पोहोचले" चिन्हांकित करा'
                    : language === 'hi'
                    ? 'QR कोड सत्यापित करें व रोगी को "पहुंच गए" अंकित करें'
                    : 'Confirm QR Code & Mark Patient "REACHED"'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
