import React from 'react';
import { AuditLog, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  Eye,
  Edit,
  AlertCircle,
  Database,
} from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLog[];
  language: Language;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const getActionBadgeColor = (action: string) => {
    if (action.includes('VIEW')) return 'bg-blue-50 text-blue-800 border border-blue-200';
    if (action.includes('UPDATE')) return 'bg-amber-50 text-amber-800 border border-amber-200';
    return 'bg-red-50 text-red-800 border border-red-200';
  };

  const getLocalizedRole = (role: string) => {
    if (role === 'health_worker' || role.includes('ASHA') || role.includes('Worker')) {
      return language === 'mr' ? 'आशा सेविका / आरोग्य कर्मचारी' : language === 'hi' ? 'आशा / स्वास्थ्य कार्यकर्ता' : role;
    }
    if (role === 'phc_doctor' || role.includes('Medical Officer')) {
      return language === 'mr' ? 'वैद्यकीय अधिकारी (MO)' : language === 'hi' ? 'चिकित्सा अधिकारी (MO)' : role;
    }
    if (role === 'doctor' || role.includes('Specialist')) {
      return language === 'mr' ? 'हॉस्पिटल तज्ज्ञ डॉक्टर' : language === 'hi' ? 'अस्पताल विशेषज्ञ डॉक्टर' : role;
    }
    if (role === 'admin' || role.includes('DHO')) {
      return language === 'mr' ? 'जिल्हा आरोग्य अधिकारी' : language === 'hi' ? 'जिला स्वास्थ्य अधिकारी' : role;
    }
    return role;
  };

  return (
    <div className="space-y-6" lang={language}>
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-md text-xs font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>
            {language === 'mr'
              ? 'डिजिटल वैयक्तिक डेटा संरक्षण (DPDP) कायदा व ABDM सुरक्षा अनुपालन'
              : language === 'hi'
              ? 'डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम व ABDM सुरक्षा अनुपालन'
              : 'Digital Personal Data Protection (DPDP) Act & ABDM Security Compliance'}
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          {language === 'mr'
            ? 'सुरक्षा ऑडिट नोंदी आणि रुग्ण संमती नोंदवही'
            : language === 'hi'
            ? 'सुरक्षा ऑडिट लॉग एवं मरीज़ सहमति लेजर'
            : 'Security Audit Logs & Patient Consent Ledger'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'mr'
            ? 'पुणे ग्रामीण आरोग्य केंद्रांमधील रुग्ण वैद्यकीय नोंदींचा छेडछाड-मुक्त प्रवेश इतिहास'
            : language === 'hi'
            ? 'पुणे ग्रामीण स्वास्थ्य केंद्रों में मरीज़ मेडिकल रिकॉर्ड का छेड़छाड़-रहित एक्सेस इतिहास'
            : 'Tamper-evident access history for patient medical records across Pune rural health centres'}
        </p>
      </div>

      {/* DPDP Compliance Notice Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-teal-400">
            <Lock className="w-4 h-4" />
            <span>
              {language === 'mr'
                ? 'संमती-आधारित इलेक्ट्रॉनिक आरोग्य नोंद (EHR) देवाणघेवाण'
                : language === 'hi'
                ? 'सहमति-आधारित इलेक्ट्रॉनिक स्वास्थ्य रिकॉर्ड (EHR) आदान-प्रदान'
                : 'Consent-Driven Electronic Health Record (EHR) Exchange'}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {language === 'mr'
              ? 'प्रत्येक वैद्यकीय तपासणी, ट्रायज आणि संदर्भ सेवा नोंद अपरिवर्तनीय टाइमस्टॅम्प, पद अधिकार आणि वापरकर्ता ओळखीसह नोंदवली जाते.'
              : language === 'hi'
              ? 'प्रत्येक नैदानिक जांच, ट्रायज और रेफरल लेनदेन को अपरिवर्तनीय टाइमस्टैम्प, भूमिका अधिकार और ऑपरेटर पहचान के साथ दर्ज किया जाता है।'
              : 'Every clinical query, triage execution, and referral transition is logged with immutable cryptographic timestamps, role authorization, and operator identity.'}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 font-mono text-[11px] bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{language === 'mr' ? 'ऑडिट इंजिन: सक्रिय' : language === 'hi' ? 'ऑडिट इंजन: सक्रिय' : 'Audit Engine: Active'}</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b">
              <tr>
                <th className="px-5 py-3">{language === 'mr' ? 'वेळ व दिनांक' : language === 'hi' ? 'समय एवं तिथि' : 'Timestamp'}</th>
                <th className="px-4 py-3">{language === 'mr' ? 'ऑपरेटर / कर्मचारी' : language === 'hi' ? 'ऑपरेटर / कार्यकर्ता' : 'Actor / Operator'}</th>
                <th className="px-4 py-3">{language === 'mr' ? 'भूमिका' : language === 'hi' ? 'भूमिका' : 'Role'}</th>
                <th className="px-4 py-3">{language === 'mr' ? 'कृती प्रकार' : language === 'hi' ? 'कार्रवाई प्रकार' : 'Action Type'}</th>
                <th className="px-4 py-3">{language === 'mr' ? 'रुग्ण / स्रोत' : language === 'hi' ? 'मरीज़ / संसाधन' : 'Resource Target'}</th>
                <th className="px-4 py-3">{language === 'mr' ? 'तपशील' : language === 'hi' ? 'विवरण' : 'Operation Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 font-sans">{log.actor}</td>
                  <td className="px-4 py-3 text-slate-700 font-sans">{getLocalizedRole(log.role)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-800">{log.resource}</td>
                  <td className="px-4 py-3 text-slate-600 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
