import React, { useState } from 'react';
import { MchRecord, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  Baby,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Heart,
  Plus,
  Stethoscope,
  Activity,
} from 'lucide-react';

interface MchModuleProps {
  records: MchRecord[];
  language: Language;
  onReferMch: (record: MchRecord) => void;
  onUpdateAnc: (recordId: string, visitNumber: number) => void;
}

export const MchModule: React.FC<MchModuleProps> = ({
  records,
  language,
  onReferMch,
  onUpdateAnc,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [selectedRecord, setSelectedRecord] = useState<MchRecord>(records[0]);

  const highRiskReasonsLocalized: Record<string, { mr: string; hi: string }> = {
    'BP 154/98 mmHg (Pre-eclampsia)': {
      mr: 'रक्तदाब १५४/९८ mmHg (प्री-एक्लॅम्प्सिया)',
      hi: 'रक्तचाप 154/98 mmHg (प्री-एक्लेम्पसिया)',
    },
    'Bilateral Pedal Edema': {
      mr: 'दोन्ही पायांवर सूज (एडिमा)',
      hi: 'दोनों पैरों में सूजन (एडिमा)',
    },
    'Severe Anemia (Hb 7.8 g/dL)': {
      mr: 'तीव्र ॲनिमिया / रक्ताल्पता (Hb ७.८ g/dL)',
      hi: 'गंभीर एनीमिया / खून की कमी (Hb 7.8 g/dL)',
    },
  };

  return (
    <div className="space-y-6" lang={language}>
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pink-50 border border-pink-200 text-pink-800 rounded-md text-xs font-semibold mb-1">
            <Baby className="w-3.5 h-3.5" />
            <span>
              {language === 'mr'
                ? 'राष्ट्रीय आरोग्य अभियान · RCH माता व बाल ट्रॅकिंग प्रणाली'
                : language === 'hi'
                ? 'राष्ट्रीय स्वास्थ्य मिशन · RCH मातृ एवं शिशु ट्रैकिंग प्रणाली'
                : 'National Health Mission · RCH Maternal & Child Tracking System'}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'mr'
              ? 'माता व बाल आरोग्य (MCH / ANC ट्रॅकिंग)'
              : language === 'hi'
              ? 'मातृ एवं शिशु स्वास्थ्य (MCH / ANC ट्रैकिंग)'
              : 'Maternal & Child Health (MCH / ANC Tracking)'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'mr'
              ? 'गर्भधारणा निरीक्षण, प्रसूतीपूर्व तपासणी (ANC) वेळापत्रक आणि अति-जोखमीची गर्भधारणा (HRP) शोध'
              : language === 'hi'
              ? 'गर्भावस्था निगरानी, प्रसवपूर्व देखभाल (ANC) अनुसूची और उच्च-जोखिम गर्भावस्था (HRP) पहचान'
              : 'Gestational monitoring, Antenatal Care (ANC) visit schedules, and High-Risk Pregnancy (HRP) detection'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full border border-red-200">
            {language === 'mr'
              ? '१ अति-जोखमीची गरोदर माता चिन्हांकित'
              : language === 'hi'
              ? '1 उच्च-जोखिम गर्भवती महिला चिह्नित'
              : '1 High-Risk Mother Flagged'}
          </span>
        </div>
      </div>

      {/* Grid of registered mothers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Mothers (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {language === 'mr'
              ? 'नोंदणीकृत गरोदर माता'
              : language === 'hi'
              ? 'पंजीकृत गर्भवती महिलाएं'
              : 'Registered Pregnant Mothers'} ({records.length})
          </span>

          {records.map((rec) => (
            <div
              key={rec.id}
              onClick={() => setSelectedRecord(rec)}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition ${
                selectedRecord.id === rec.id
                  ? 'bg-teal-50 border-teal-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-slate-900">{rec.patientName}</span>
                {rec.isHighRisk && (
                  <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    {language === 'mr' ? 'HRP अति-जोखीम' : language === 'hi' ? 'HRP उच्च-जोखिम' : 'HRP High-Risk'}
                  </span>
                )}
              </div>
              <div className="text-slate-600 mb-1">
                {rec.age} {language === 'mr' ? 'वर्षे' : language === 'hi' ? 'वर्ष' : 'y'} · {rec.village}, {language === 'mr' ? 'तालुका' : language === 'hi' ? 'तहसील' : 'Taluka'} {rec.taluka}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>
                  {language === 'mr' ? 'गर्भ वय:' : language === 'hi' ? 'गर्भ आयु:' : 'Gestational Age:'}{' '}
                  <strong className="text-slate-800">
                    {rec.gestationalWeeks} {language === 'mr' ? 'आठवडे' : language === 'hi' ? 'सप्ताह' : 'Weeks'}
                  </strong>
                </span>
                <span>
                  {language === 'mr' ? 'प्रसूती तारीख:' : language === 'hi' ? 'प्रसव तिथि:' : 'EDD:'}{' '}
                  <strong className="text-teal-700">{rec.eddDate}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Detail Pane (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* Header of selected mother */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{selectedRecord.patientName}</h2>
                <span className="font-mono text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {selectedRecord.healthId}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {language === 'mr' ? 'गर्भावधी (Gravida)' : language === 'hi' ? 'गर्भावस्था (Gravida)' : 'Gravida'}: {selectedRecord.gravida} · {language === 'mr' ? 'प्रसूती संख्या (Parity)' : language === 'hi' ? 'प्रसव संख्या (Parity)' : 'Parity'}: {selectedRecord.parity} · LMP: {selectedRecord.lmpDate} · {language === 'mr' ? 'अंदाजित प्रसूती तारीख (EDD)' : language === 'hi' ? 'संभावित प्रसव तिथि (EDD)' : 'Expected Delivery (EDD)'}: {selectedRecord.eddDate}
              </div>
            </div>

            <button
              onClick={() => onReferMch(selectedRecord)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>
                {language === 'mr'
                  ? 'स्त्रीरोग तज्ज्ञ संदर्भ सेवा तयार करा'
                  : language === 'hi'
                  ? 'स्त्री रोग विशेषज्ञ रेफरल बनाएं'
                  : 'Create Obstetric Specialist Referral'}
              </span>
            </button>
          </div>

          {/* Gestational Age Progress Bar */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">
                {language === 'mr' ? 'गर्भधारणा प्रगती:' : language === 'hi' ? 'गर्भावस्था प्रगति:' : 'Pregnancy Progression:'}{' '}
                <span className="text-teal-700 font-mono">
                  {selectedRecord.gestationalWeeks} {language === 'mr' ? 'आठवडे' : language === 'hi' ? 'सप्ताह' : 'Weeks'}
                </span>{' '}
                ({language === 'mr' ? 'तिसरी तिमाही' : language === 'hi' ? 'तीसरी तिमाही' : 'Third Trimester'})
              </span>
              <span className="text-slate-500 font-medium">
                {language === 'mr' ? 'लक्ष्य मुदत: ४० आठवडे' : language === 'hi' ? 'लक्ष्य अवधि: 40 सप्ताह' : 'Target Term: 40 Weeks'}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${(selectedRecord.gestationalWeeks / 40) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{language === 'mr' ? 'तिमाही १ (०-१२ आठवडे)' : language === 'hi' ? 'तिमाही 1 (0-12 सप्ताह)' : 'Trimester 1 (0-12w)'}</span>
              <span>{language === 'mr' ? 'तिमाही २ (१३-२७ आठवडे)' : language === 'hi' ? 'तिमाही 2 (13-27 सप्ताह)' : 'Trimester 2 (13-27w)'}</span>
              <span>{language === 'mr' ? 'तिमाही ३ (२८-४० आठवडे)' : language === 'hi' ? 'तिमाही 3 (28-40 सप्ताह)' : 'Trimester 3 (28-40w)'}</span>
            </div>
          </div>

          {/* High Risk Pregnancy (HRP) Alert Flags */}
          {selectedRecord.isHighRisk && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-red-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>
                  {language === 'mr'
                    ? 'अति-जोखमीची गर्भधारणा (HRP) वैद्यकीय लक्षणे:'
                    : language === 'hi'
                    ? 'उच्च-जोखिम गर्भावस्था (HRP) नैदानिक लक्षण:'
                    : 'High-Risk Pregnancy (HRP) Clinical Indicators:'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedRecord.highRiskReasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="bg-white text-red-800 font-semibold px-2.5 py-1 rounded border border-red-200 text-xs"
                  >
                    ⚠️ {language === 'mr' ? highRiskReasonsLocalized[reason]?.mr || reason : language === 'hi' ? highRiskReasonsLocalized[reason]?.hi || reason : reason}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-red-700">
                {language === 'mr'
                  ? 'कृती निर्देश: वाढलेला रक्तदाब (>१४०/९०) आणि सूज असलेल्या मातेला मंचर उपजिल्हा रुग्णालय किंवा ससून सर्वोपचार रुग्णालयात डॉपलर तपासणी व तज्ज्ञ सल्ला आवश्यक आहे.'
                  : language === 'hi'
                  ? 'कार्रवाई निर्देश: बढ़े हुए रक्तचाप (>140/90) और सूजन वाली माता को मंचर उप-जिला अस्पताल या ससून अस्पताल में डॉपलर जांच व विशेषज्ञ परामर्श अनिवार्य है।'
                  : 'Action Mandate: Primigravida with elevated BP (>140/90) and edema requires USG Doppler and specialist consultation at Sub-District Hospital Manchar or Sassoon General Hospital.'}
              </p>
            </div>
          )}

          {/* Antenatal Care (ANC) Visits Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>
                {language === 'mr'
                  ? 'अनिवार्य ४-ANC तपासणी वेळापत्रक'
                  : language === 'hi'
                  ? 'अनिवार्य 4-ANC जांच अनुसूची'
                  : 'Mandatory 4-ANC Checkup Schedule'}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {selectedRecord.ancVisits.map((visit) => (
                <div
                  key={visit.visitNumber}
                  className={`p-3.5 rounded-xl border ${
                    visit.status === 'DONE'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : visit.status === 'OVERDUE'
                      ? 'bg-red-50/60 border-red-200'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">
                      {language === 'mr' ? 'ANC भेट #' : language === 'hi' ? 'ANC जांच #' : 'ANC Visit #'}{visit.visitNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        visit.status === 'DONE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : visit.status === 'OVERDUE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {visit.status === 'DONE'
                        ? (language === 'mr' ? 'पूर्ण' : language === 'hi' ? 'पूर्ण' : 'DONE')
                        : visit.status === 'OVERDUE'
                        ? (language === 'mr' ? 'थकीत' : language === 'hi' ? 'लंबित' : 'OVERDUE')
                        : (language === 'mr' ? 'नियोजित' : language === 'hi' ? 'नियोजित' : 'SCHEDULED')}
                    </span>
                  </div>

                  <div className="text-slate-600 text-[11px] mt-1">
                    {language === 'mr' ? 'तारीख:' : language === 'hi' ? 'तारीख:' : 'Date:'} {visit.completedDate || visit.scheduledDate}
                  </div>

                  {visit.status === 'DONE' ? (
                    <div className="mt-2 pt-2 border-t border-emerald-200 text-[11px] text-slate-700 space-y-0.5 font-mono">
                      <div>BP: {visit.bp}</div>
                      <div>Hb: {visit.hb} g/dL</div>
                      <div>{language === 'mr' ? 'वजन:' : language === 'hi' ? 'वजन:' : 'Weight:'} {visit.weightKg} kg</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => onUpdateAnc(selectedRecord.id, visit.visitNumber)}
                      className="mt-3 w-full py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded font-semibold text-[11px] border border-slate-300 transition cursor-pointer"
                    >
                      {language === 'mr' ? 'पूर्ण नोंदवा' : language === 'hi' ? 'पूर्ण दर्ज करें' : 'Mark Completed'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
