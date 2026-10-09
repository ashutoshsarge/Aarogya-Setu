import React, { useState, useMemo } from 'react';
import { Patient, Referral, Hospital, Language } from '../../types';
import { Search, X, User, FileText, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { TRANSLATIONS } from '../../utils/translations';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  referrals: Referral[];
  hospitals: Hospital[];
  onSelectPatient?: (patient: Patient) => void;
  onSelectReferral?: (referral: Referral) => void;
  language?: Language;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  patients,
  referrals,
  hospitals,
  onSelectPatient,
  onSelectReferral,
  language = 'en',
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();

  const filteredPatients = useMemo(() => {
    if (!trimmed) return patients.slice(0, 4);
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(trimmed) ||
        p.healthId.toLowerCase().includes(trimmed) ||
        p.mobile.includes(trimmed) ||
        p.village.toLowerCase().includes(trimmed) ||
        p.taluka.toLowerCase().includes(trimmed)
    );
  }, [patients, trimmed]);

  const filteredReferrals = useMemo(() => {
    if (!trimmed) return referrals.slice(0, 3);
    return referrals.filter(
      (r) =>
        r.referralNumber.toLowerCase().includes(trimmed) ||
        r.patientName.toLowerCase().includes(trimmed) ||
        r.patientHealthId.toLowerCase().includes(trimmed) ||
        r.destinationHospitalName.toLowerCase().includes(trimmed)
    );
  }, [referrals, trimmed]);

  if (!isOpen) return null;

  const placeholderText =
    language === 'mr'
      ? 'रुग्णाचे नाव, आरोग्य आयडी (HID-2026), मोबाईल किंवा व्हाउचर शोधा...'
      : language === 'hi'
      ? 'मरीज़ का नाम, स्वास्थ्य आईडी (HID-2026), मोबाइल या वाउचर खोजें...'
      : 'Search patient name, Health ID (HID-2026), mobile, or voucher ID...';

  const patientsCategory =
    language === 'mr' ? 'नोंदणीकृत रुग्ण' : language === 'hi' ? 'पंजीकृत मरीज़' : 'Patients';

  const referralsCategory =
    language === 'mr' ? 'डिजिटल संदर्भ सेवा (Referrals)' : language === 'hi' ? 'डिजिटल रेफरल' : 'Digital Referrals';

  const noPatientsText =
    language === 'mr' ? 'कोणताही रुग्ण आढळला नाही' : language === 'hi' ? 'कोई मरीज़ रिकॉर्ड नहीं मिला' : 'No matching patient records';

  const noReferralsText =
    language === 'mr' ? 'कोणतेही रेफरल आढळले नाही' : language === 'hi' ? 'कोई रेफरल नहीं मिला' : 'No matching referrals';

  const footerText =
    language === 'mr'
      ? 'पुणे ग्रामीण आरोग्य प्रणालीमधील सर्व नोंदींमध्ये थेट शोध'
      : language === 'hi'
      ? 'पुणे ग्रामीण स्वास्थ्य प्रणाली के सभी रिकॉर्ड में खोज'
      : 'Search matches across all public health records';

  const escCloseText =
    language === 'mr' ? 'Esc दाबून बंद करा' : language === 'hi' ? 'बंद करने के लिए Esc दबाएं' : 'Esc to close';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200"
      onClick={onClose}
      lang={language}
    >
      <div
        className="glass-card w-full max-w-2xl rounded-3xl p-5 shadow-2xl border border-white/80 space-y-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholderText}
            className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden transition"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto space-y-5 flex-1 pr-1">
          {/* Patient Results */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
              <span>{patientsCategory} ({filteredPatients.length})</span>
              <span>
                {language === 'mr'
                  ? 'आरोग्य आयडी / मोबाईल'
                  : language === 'hi'
                  ? 'स्वास्थ्य आईडी / मोबाइल'
                  : 'Health ID / Mobile'}
              </span>
            </div>

            {filteredPatients.length > 0 ? (
              <div className="space-y-1.5">
                {filteredPatients.map((pat) => (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => {
                      if (onSelectPatient) onSelectPatient(pat);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl glass-card border border-slate-200/70 hover:border-teal-500 hover:bg-teal-50/40 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {pat.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-teal-900 flex items-center gap-1.5">
                          <span>{pat.name}</span>
                          <span className="text-xs text-slate-500 font-normal">
                            ({pat.age} {language === 'mr' ? 'वर्षे' : language === 'hi' ? 'वर्ष' : 'y'},{' '}
                            {(pat.gender as string).toUpperCase() === 'MALE'
                              ? language === 'mr'
                                ? 'पुरुष'
                                : language === 'hi'
                                ? 'पुरुष'
                                : 'Male'
                              : (pat.gender as string).toUpperCase() === 'FEMALE'
                              ? language === 'mr'
                                ? 'महिला'
                                : language === 'hi'
                                ? 'महिला'
                                : 'Female'
                              : pat.gender})
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-teal-700 font-semibold">{pat.healthId}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{pat.village}, {pat.taluka}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-xs text-slate-600 font-medium">+91 {pat.mobile}</div>
                      <span className="text-[10px] text-teal-600 font-bold flex items-center gap-0.5 justify-end mt-0.5 opacity-0 group-hover:opacity-100 transition">
                        {language === 'mr' ? 'उघडा' : language === 'hi' ? 'खोलें' : 'Open'}{' '}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">{noPatientsText}</div>
            )}
          </div>

          {/* Referral Results */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
              <span>{referralsCategory} ({filteredReferrals.length})</span>
              <span>{language === 'mr' ? 'स्थिती' : language === 'hi' ? 'स्थिति' : 'Status'}</span>
            </div>

            {filteredReferrals.length > 0 ? (
              <div className="space-y-1.5">
                {filteredReferrals.map((ref) => (
                  <button
                    key={ref.id}
                    type="button"
                    onClick={() => {
                      if (onSelectReferral) onSelectReferral(ref);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl glass-card border border-slate-200/70 hover:border-teal-500 hover:bg-teal-50/40 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-900 group-hover:text-teal-900">
                          {ref.referralNumber}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {language === 'mr' ? 'रुग्ण:' : language === 'hi' ? 'रोगी:' : 'Patient:'}{' '}
                          <strong>{ref.patientName}</strong> → {ref.destinationHospitalName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ref.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ref.status === 'UNDER_TREATMENT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ref.status === 'COMPLETED'
                          ? language === 'mr'
                            ? 'पूर्ण'
                            : language === 'hi'
                            ? 'पूर्ण'
                            : 'COMPLETED'
                          : ref.status === 'UNDER_TREATMENT'
                          ? language === 'mr'
                            ? 'उपचार सुरू'
                            : language === 'hi'
                            ? 'उपचार जारी'
                            : 'UNDER TREATMENT'
                          : (ref.status as string) === 'INITIATED' || ref.status === 'REFERRED'
                          ? language === 'mr'
                            ? 'नोंदणीकृत / रेफरल'
                            : language === 'hi'
                            ? 'रेफर किया गया'
                            : 'REFERRED'
                          : ref.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">{ref.appointmentDate}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">{noReferralsText}</div>
            )}
          </div>
        </div>

        {/* Modal Footer Quick Shortcut */}
        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-400">
          <span>{footerText}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
          >
            {escCloseText}
          </button>
        </div>
      </div>
    </div>
  );
};
