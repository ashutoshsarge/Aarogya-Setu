import React, { useState } from 'react';
import { ChronicRecord, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  Activity,
  Calendar,
  Pill,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';

interface ChronicDiseaseModuleProps {
  records: ChronicRecord[];
  language: Language;
  onLogRefill: (recordId: string) => void;
}

export const ChronicDiseaseModule: React.FC<ChronicDiseaseModuleProps> = ({
  records,
  language,
  onLogRefill,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = records.filter((r) => {
    if (filterType === 'ALL') return true;
    return r.diseaseType === filterType;
  });

  const getDiseaseTypeLabel = (type: string) => {
    switch (type) {
      case 'ALL':
        return language === 'mr' ? 'सर्व NCD' : language === 'hi' ? 'सभी NCD' : 'All NCD';
      case 'Hypertension':
        return language === 'mr' ? 'उच्च रक्तदाब' : language === 'hi' ? 'उच्च रक्तचाप' : 'Hypertension';
      case 'Diabetes':
        return language === 'mr' ? 'मधुमेह' : language === 'hi' ? 'मधुमेह' : 'Diabetes';
      case 'Tuberculosis':
        return language === 'mr' ? 'क्षयरोग (TB)' : language === 'hi' ? 'क्षय रोग (TB)' : 'Tuberculosis';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6" lang={language}>
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-xs font-semibold mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>
              {language === 'mr'
                ? 'अंसंसर्गजन्य रोग (NCD) व राष्ट्रीय क्षयरोग निर्मूलन कार्यक्रम'
                : language === 'hi'
                ? 'गैर-संचारी रोग (NCD) व राष्ट्रीय क्षय रोग उन्मूलन कार्यक्रम'
                : 'Non-Communicable Disease (NCD) & National TB Elimination Programme'}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'mr'
              ? 'तीव्र दीर्घकालीन आजार पाठपुरावा व औषध रिफिल स्मरणपत्रे'
              : language === 'hi'
              ? 'दीर्घकालिक बीमारी फॉलो-अप और दवा रिफिल अनुस्मारक'
              : 'Chronic Disease Follow-Up & Medicine Refill Reminders'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'mr'
              ? 'पुणे ग्रामीण आरोग्य केंद्रांमध्ये उच्च रक्तदाब, मधुमेह आणि क्षयरोग डॉट्स उपचार पूर्तता'
              : language === 'hi'
              ? 'पुणे ग्रामीण स्वास्थ्य केंद्रों में उच्च रक्तचाप, मधुमेह और क्षय रोग डॉट्स उपचार अनुपालन'
              : 'Hypertension, Diabetes, and Tuberculosis DOTS treatment compliance across Pune rural health centres'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          {['ALL', 'Hypertension', 'Diabetes', 'Tuberculosis'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 font-medium rounded-md transition cursor-pointer ${
                filterType === type ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getDiseaseTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of chronic disease cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{item.patientName}</h3>
                  <span className="font-mono text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {item.healthId}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {item.age} {language === 'mr' ? 'वर्षे' : language === 'hi' ? 'वर्ष' : 'y'} · {item.village}, {language === 'mr' ? 'तालुका' : language === 'hi' ? 'तहसील' : 'Taluka'} {item.taluka}
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                  item.status === 'UP_TO_DATE'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : item.status === 'REFILL_DUE'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-red-50 text-red-800 border-red-200 animate-pulse'
                }`}
              >
                {item.status === 'UP_TO_DATE' && (language === 'mr' ? '✓ औषध उपलब्ध' : language === 'hi' ? '✓ दवा उपलब्ध' : '✓ Refill Current')}
                {item.status === 'REFILL_DUE' && (language === 'mr' ? '⚠️ रिफिल बाकी' : language === 'hi' ? '⚠️ रिफिल देय' : '⚠️ Refill Due')}
                {item.status === 'OVERDUE' && (language === 'mr' ? '🚨 तपासणी थकीत' : language === 'hi' ? '🚨 जांच लंबित' : '🚨 Overdue Checkup')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  {language === 'mr' ? 'दीर्घकालीन आजार' : language === 'hi' ? 'दीर्घकालिक बीमारी' : 'Chronic Condition'}
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {getDiseaseTypeLabel(item.diseaseType)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  {language === 'mr' ? 'शेवटची नोंदलेली तपासणी' : language === 'hi' ? 'अंतिम दर्ज जांच' : 'Last Recorded Vitals'}
                </span>
                <span className="font-bold text-teal-800 text-sm mt-0.5 block font-mono">{item.lastReading}</span>
              </div>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
              <div>
                <span className="font-semibold text-slate-700">
                  {language === 'mr' ? 'सुरू असलेले औषधोपचार: ' : language === 'hi' ? 'निर्धारित दवाएं: ' : 'Prescribed Regimen: '}
                </span>
                <span className="text-slate-900 font-medium">{item.regimen}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1">
                <span>
                  {language === 'mr' ? 'औषध रिफिल लक्ष्य: ' : language === 'hi' ? 'दवा रिफिल लक्ष्य: ' : 'Medicine Refill Target: '}
                  <strong className="text-slate-800">{item.nextRefillDate}</strong>
                </span>
                <span>
                  {language === 'mr' ? 'पुढील डॉक्टर तपासणी: ' : language === 'hi' ? 'अगली डॉक्टर जांच: ' : 'Next Doctor Review: '}
                  <strong className="text-slate-800">{item.nextCheckupDate}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                {language === 'mr' ? 'आरोग्य सेविका: आशा सुनिता वाघमारे' : language === 'hi' ? 'स्वास्थ्य कार्यकर्ता: आशा सुनीता वाघमारे' : 'Field Worker: ASHA Sunita Waghmare'}
              </span>
              <button
                onClick={() => onLogRefill(item.id)}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>
                  {language === 'mr' ? 'औषध वाटप नोंदवा' : language === 'hi' ? 'दवा वितरण दर्ज करें' : 'Log Refill Dispensed'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
