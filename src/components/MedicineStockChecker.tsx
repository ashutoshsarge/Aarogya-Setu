import React, { useState } from 'react';
import { Hospital, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  Pill,
  Search,
  Building2,
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
} from 'lucide-react';

interface MedicineStockCheckerProps {
  hospitals: Hospital[];
  patientTaluka: string;
  language: Language;
}

export const MedicineStockChecker: React.FC<MedicineStockCheckerProps> = ({
  hospitals,
  patientTaluka,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Aggregate all unique medicines across all facilities
  const allMedicines = Array.from(
    new Set(hospitals.flatMap((h) => h.medicineStock.map((m) => m.medicineName)))
  );

  const categories = ['ALL', 'Emergency Antidote', 'Emergency Thrombolytic', 'Maternal Health', 'Diabetic Care', 'Antibiotic'];

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'ALL':
        return language === 'mr' ? 'सर्व औषधे' : language === 'hi' ? 'सभी दवाएं' : 'All Drugs';
      case 'Emergency Antidote':
        return language === 'mr' ? 'आपत्कालीन विषरोधी' : language === 'hi' ? 'आपातकालीन एंटीडोट' : 'Emergency Antidote';
      case 'Emergency Thrombolytic':
        return language === 'mr' ? 'हृदयविकार थ्रोम्बोलिटिक' : language === 'hi' ? 'हृदय थ्रोम्बोलिटिक' : 'Emergency Thrombolytic';
      case 'Maternal Health':
        return language === 'mr' ? 'मातृ आरोग्य' : language === 'hi' ? 'मातृ स्वास्थ्य' : 'Maternal Health';
      case 'Diabetic Care':
        return language === 'mr' ? 'मधुमेह उपचार' : language === 'hi' ? 'डायबिटीज देखभाल' : 'Diabetic Care';
      case 'Antibiotic':
        return language === 'mr' ? 'अँटीबायोटिक' : language === 'hi' ? 'एंटीबायोटिक' : 'Antibiotic';
      default:
        return cat;
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'In Stock') {
      return language === 'mr' ? 'उपलब्ध' : language === 'hi' ? 'उपलब्ध' : 'In Stock';
    }
    if (status === 'Low') {
      return language === 'mr' ? 'कमी साठा' : language === 'hi' ? 'कम स्टॉक' : 'Low';
    }
    return language === 'mr' ? 'तुटवडा' : language === 'hi' ? 'स्टॉक खत्म' : 'Out of Stock';
  };

  return (
    <div className="space-y-6" lang={language}>
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          {language === 'mr'
            ? 'सार्वजनिक आरोग्य औषध साठा व इन्व्हेंटरी तपासक'
            : language === 'hi'
            ? 'सार्वजनिक स्वास्थ्य दवा स्टॉक एवं इन्वेंटरी चेकर'
            : 'Public Health Medicine Stock & Inventory Checker'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'mr'
            ? 'पुणे प्रा.आ. केंद्र आणि रुग्णालयांमधील आवश्यक आपत्कालीन औषधे, विषरोधी लस व माता औषधांचा थेट साठा'
            : language === 'hi'
            ? 'पुणे प्राथमिक स्वास्थ्य केंद्रों व अस्पतालों में आवश्यक आपातकालीन दवाओं, एंटीडोट्स और मातृ दवाओं का लाइव स्टॉक'
            : 'Live stock tracking for essential emergency medicines, antidotes, and maternal drugs across Pune PHCs and hospitals'}
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'mr'
                ? 'औषध शोधा (उदा. अँटी-स्नेक व्हेनम, स्ट्रेप्टोकायनेज, इन्सुलिन, ऑक्सिटोसिन)...'
                : language === 'hi'
                ? 'दवा खोजें (उदा. एंटी-स्नेक वेनम, स्ट्रेप्टोकाइनेज, इंसुलिन, ऑक्सीटोसिन)...'
                : 'Search medicine (e.g. Anti-Snake Venom, Streptokinase, Insulin, Oxytocin)...'
            }
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Stock Matrix */}
      <div className="space-y-4">
        {hospitals.map((hospital) => {
          const distanceKm = hospital.distanceKmByTaluka[patientTaluka] ?? 35;
          const matchingMedicines = hospital.medicineStock.filter((m) => {
            const matchesQuery = m.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
            return matchesQuery && matchesCategory;
          });

          if (matchingMedicines.length === 0) return null;

          return (
            <div
              key={hospital.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{hospital.name}</h3>
                    <span className="text-[10px] bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-600">
                      {hospital.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{language === 'mr' ? 'तालुका' : language === 'hi' ? 'तहसील' : 'Taluka'} {hospital.taluka}</span>
                    <span>·</span>
                    <span className="font-mono font-medium text-teal-700">
                      {distanceKm} {language === 'mr' ? 'किमी अंतरावर' : language === 'hi' ? 'किमी दूरी पर' : `km from ${patientTaluka}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <a
                    href={`tel:${hospital.phone}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{language === 'mr' ? 'औषधालय:' : language === 'hi' ? 'फार्मेसी:' : 'Pharmacy:'} {hospital.phone}</span>
                  </a>
                </div>
              </div>

              {/* Medicine items row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {matchingMedicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{med.medicineName}</span>
                      <span className="text-[10px] text-slate-400">{getCategoryLabel(med.category)}</span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${
                          med.status === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : med.status === 'Low'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {getStatusLabel(med.status)}
                      </span>
                      {med.quantityOnHand && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {med.quantityOnHand} {language === 'mr' ? 'नग' : language === 'hi' ? 'इकाई' : 'units'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
