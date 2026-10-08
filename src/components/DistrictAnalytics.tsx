import React from 'react';
import { Referral, Hospital, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Users,
  MapPin,
  Activity,
  Download,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

interface DistrictAnalyticsProps {
  referrals: Referral[];
  hospitals: Hospital[];
  language: Language;
}

export const DistrictAnalytics: React.FC<DistrictAnalyticsProps> = ({
  referrals,
  hospitals,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const totalReferrals = referrals.length;
  const highPriorityCases = referrals.filter((r) => r.triageResult.level === 'HIGH').length;
  const mediumCases = referrals.filter((r) => r.triageResult.level === 'MEDIUM').length;
  const lowCases = referrals.filter((r) => r.triageResult.level === 'LOW').length;

  const reachedCount = referrals.filter((r) => r.status !== 'REFERRED').length;
  const completedCount = referrals.filter((r) => r.status === 'COMPLETED').length;
  const missedCount = referrals.filter((r) => r.followUpStatus === 'MISSED_ALERT').length;

  const arrivalRate = totalReferrals > 0 ? Math.round((reachedCount / totalReferrals) * 100) : 0;
  const completionRate = totalReferrals > 0 ? Math.round((completedCount / totalReferrals) * 100) : 0;

  // Village analytics table
  const villageStats: Record<string, { total: number; reached: number; completed: number; taluka: string }> = {};
  referrals.forEach((r) => {
    if (!villageStats[r.patientVillage]) {
      villageStats[r.patientVillage] = { total: 0, reached: 0, completed: 0, taluka: r.patientTaluka };
    }
    villageStats[r.patientVillage].total += 1;
    if (r.status !== 'REFERRED') villageStats[r.patientVillage].reached += 1;
    if (r.status === 'COMPLETED') villageStats[r.patientVillage].completed += 1;
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Referral Number,Patient Name,Health ID,Taluka,Village,Hospital,Specialty,Triage Level,Status,Created At'];
    const rows = referrals.map((r) =>
      `"${r.referralNumber}","${r.patientName}","${r.patientHealthId}","${r.patientTaluka}","${r.patientVillage}","${r.destinationHospitalName}","${r.triageResult.recommendedSpecialty}","${r.triageResult.level}","${r.status}","${r.createdAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join('\n'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AarogyaSetu_Pune_Referrals_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" lang={language}>
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-md text-xs font-semibold mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>
              {language === 'mr'
                ? 'जिल्हा आरोग्य अधिकारी (DHO) · पुणे जिल्हा परिषद आरोग्य बुद्धिमत्ता'
                : language === 'hi'
                ? 'जिला स्वास्थ्य अधिकारी (DHO) · पुणे जिला परिषद स्वास्थ्य विश्लेषण'
                : 'District Health Officer (DHO) · Pune Zilla Parishad Health Intelligence'}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'mr'
              ? 'जिल्हा सार्वजनिक आरोग्य संदर्भ सेवा व रुग्णालय विश्लेषण'
              : language === 'hi'
              ? 'जिला सार्वजनिक स्वास्थ्य रेफरल व अस्पताल विश्लेषण'
              : 'District Public Health Referral & Facility Analytics'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'mr'
              ? 'थेट संदर्भ प्रमाण, सुविधा विश्लेषण, गाववार तपासणी वितरण आणि पूर्णत्व दर'
              : language === 'hi'
              ? 'लाइव रेफरल संख्या, अस्पताल क्षमता विश्लेषण, गांववार वितरण और पूर्णता दर'
              : 'Real-time referral volumes, facility gap analysis, village heat distribution, and completion rates'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>
              {language === 'mr'
                ? 'DHO CSV अहवाल डाउनलोड'
                : language === 'hi'
                ? 'DHO CSV रिपोर्ट डाउनलोड'
                : 'Export DHO CSV Report'}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'mr' ? 'एकूण संदर्भ' : language === 'hi' ? 'कुल रेफरल' : 'Total Referrals'}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {totalReferrals}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {language === 'mr' ? 'प्राथमिक आरोग्य संदर्भ' : language === 'hi' ? 'प्राथमिक स्वास्थ्य रेफरल' : 'Primary care referrals'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'mr' ? 'उपस्थिती प्रमाण' : language === 'hi' ? 'पहुँचने की दर' : 'Arrival Rate'}
          </div>
          <div className="text-2xl font-bold font-mono text-teal-700 mt-1">
            {arrivalRate}%
          </div>
          <div className="text-[11px] text-teal-600 mt-0.5">
            {reachedCount} / {totalReferrals} {language === 'mr' ? 'रुग्ण पोहोचले' : language === 'hi' ? 'मरीज़ पहुंचे' : 'reached'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'mr' ? 'उपचार पूर्णत्व दर' : language === 'hi' ? 'उपचार पूर्णता दर' : 'Completion Rate'}
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {completionRate}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            {completedCount} {language === 'mr' ? 'उपचार पूर्ण' : language === 'hi' ? 'इलाज पूर्ण' : 'treatments finished'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
            {language === 'mr' ? 'सरासरी प्रवास वेळ' : language === 'hi' ? 'औसत यात्रा समय' : 'Avg. Transit Time'}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            68 <span className="text-xs font-normal text-slate-400">{language === 'mr' ? 'मि.' : language === 'hi' ? 'मिनट' : 'mins'}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {language === 'mr' ? 'उपकेंद्र ते मुख्य रुग्णालय' : language === 'hi' ? 'उपकेंद्र से मुख्य अस्पताल' : 'From Sub-Centre to Hub'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <div className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
            {language === 'mr' ? 'चुकलेले फॉलो-अप' : language === 'hi' ? 'लंबित फॉलो-अप' : 'Missed Follow-Ups'}
          </div>
          <div className="text-2xl font-bold font-mono text-red-700 mt-1">
            {missedCount}
          </div>
          <div className="text-[11px] text-red-600 mt-0.5">
            {language === 'mr' ? 'तातडीचे अलर्ट' : language === 'hi' ? 'अति-आवश्यक अलर्ट' : 'Overdue action alerts'}
          </div>
        </div>
      </div>

      {/* Village Referral & Completion Heat Table (Special requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'mr'
                ? 'गाववार संदर्भ घनता आणि उपचार पूर्णत्व दर (हीट टेबल)'
                : language === 'hi'
                ? 'गांववार रेफरल घनत्व एवं उपचार पूर्णता दर (हीट टेबल)'
                : 'Village Referral Density & Treatment Completion Rate (Heat Table)'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'mr'
                ? 'सर्वात कमी संदर्भ पूर्णत्व असलेले ग्रामीण भाग शोधते'
                : language === 'hi'
                ? 'कमजोर रेफरल फॉलो-अप वाले ग्रामीण क्षेत्रों की पहचान'
                : 'Identifies rural pockets with the lowest referral follow-through'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b">
              <tr>
                <th className="px-5 py-3">{language === 'mr' ? 'गाव' : language === 'hi' ? 'गांव' : 'Village'}</th>
                <th className="px-4 py-3">{language === 'mr' ? 'तालुका' : language === 'hi' ? 'तहसील' : 'Taluka'}</th>
                <th className="px-4 py-3">{language === 'mr' ? 'सुरू केलेले संदर्भ' : language === 'hi' ? 'आरंभिक रेफरल' : 'Referrals Initiated'}</th>
                <th className="px-4 py-3">{language === 'mr' ? 'रुग्णालयात पोहोचले' : language === 'hi' ? 'अस्पताल पहुंचे' : 'Reached Hospital'}</th>
                <th className="px-4 py-3">{language === 'mr' ? 'उपचार पूर्ण' : language === 'hi' ? 'उपचार पूर्ण' : 'Treatment Completed'}</th>
                <th className="px-4 py-3">{language === 'mr' ? 'पूर्णत्व टक्केवारी' : language === 'hi' ? 'पूर्णता प्रतिशत' : 'Completion Rate'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {Object.entries(villageStats).map(([village, stats]) => {
                const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                return (
                  <tr key={village} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-semibold text-slate-900 font-sans">{village}</td>
                    <td className="px-4 py-3 text-slate-700 font-sans">{stats.taluka}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{stats.total}</td>
                    <td className="px-4 py-3 text-teal-800">{stats.reached}</td>
                    <td className="px-4 py-3 text-emerald-700 font-bold">{stats.completed}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            rate >= 75 ? 'text-emerald-700' : rate >= 50 ? 'text-amber-700' : 'text-red-700'
                          }`}
                        >
                          {rate}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              rate >= 75 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Facility Gap Report: Which PHCs lack specialists, tests, or medicines most frequently */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="border-b pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>
              {language === 'mr'
                ? 'सुविधा अभाव व पायाभूत सुविधा त्रुटी अहवाल'
                : language === 'hi'
                ? 'अस्पताल कमियां व बुनियादी ढांचा रिपोर्ट'
                : 'Facility Gap & Infrastructure Vulnerability Report'}
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'mr'
              ? 'पुणे जिल्हा प्राथमिक आरोग्य केंद्रे आणि ग्रामीण रुग्णालयांमधील थेट कमतरता'
              : language === 'hi'
              ? 'पुणे प्राथमिक स्वास्थ्य केंद्रों व ग्रामीण अस्पतालों में वास्तविक कमियां'
              : 'Live operational gaps across Pune district primary health centres and rural hospitals'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-red-50/60 rounded-xl border border-red-200 space-y-2">
            <span className="font-bold text-red-900 text-sm block">
              {language === 'mr' ? 'तपासणी यंत्रसामग्री बंद' : language === 'hi' ? 'डायग्नोस्टिक उपकरण मरम्मत' : 'Diagnostic Equipment Downtime'}
            </span>
            <ul className="space-y-1.5 text-[11px] text-red-800">
              <li>
                • <strong>{language === 'mr' ? 'ग्रामीण रुग्णालय जुन्नर:' : language === 'hi' ? 'ग्रामीण अस्पताल जुन्नर:' : 'Rural Hospital Junnar:'}</strong>{' '}
                {language === 'mr' ? 'छातीचा एक्स-रे कॅलिब्रेशन दुरुस्ती सुरू (अंदाजे ४८ तास).' : language === 'hi' ? 'चेस्ट एक्स-रे मशीन कैलिब्रेशन मरम्मत जारी (अनु. 48 घंटे)।' : 'Chest X-Ray machine undergoing tube calibration (est. 48h repair).'}
              </li>
              <li>
                • <strong>{language === 'mr' ? 'प्रा.आ. केंद्र वाघोली:' : language === 'hi' ? 'प्राथमिक स्वास्थ्य केंद्र वाघोली:' : 'PHC Wagholi:'}</strong>{' '}
                {language === 'mr' ? 'उपकेंद्र स्तरावर १२-लीड ईसीजी मशीन उपलब्ध नाही.' : language === 'hi' ? 'उपकेंद्र स्तर पर 12-लीड ईसीजी मशीन उपलब्ध नहीं है।' : 'No 12-lead ECG machine available at Sub-Centre level.'}
              </li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
            <span className="font-bold text-amber-900 text-sm block">
              {language === 'mr' ? 'तज्ज्ञ डॉक्टरांचा अभाव' : language === 'hi' ? 'विशेषज्ञ डॉक्टर रिक्तियां' : 'Specialist Rostering Gaps'}
            </span>
            <ul className="space-y-1.5 text-[11px] text-amber-800">
              <li>
                • <strong>{language === 'mr' ? 'उपजिल्हा रुग्णालय मंचर:' : language === 'hi' ? 'उप-जिला अस्पताल मंचर:' : 'Sub-District Hospital Manchar:'}</strong>{' '}
                {language === 'mr' ? 'पूर्णवेळ हृदयरोग तज्ज्ञ अनुपलब्ध (भेट देणारे एमडी कव्हर करत आहेत).' : language === 'hi' ? 'पूर्णकालिक हृदय रोग विशेषज्ञ अनुपस्थित (विजिटिंग एमडी द्वारा कवर)।' : 'Full-time Cardiologist absent (covered by visiting MD General Medicine).'}
              </li>
              <li>
                • <strong>{language === 'mr' ? 'सीएचसी जुन्नर:' : language === 'hi' ? 'सीएचसी जुन्नर:' : 'CHC Junnar:'}</strong>{' '}
                {language === 'mr' ? 'जनरल सर्जन केवळ मंगळवार आणि गुरुवारी उपलब्ध.' : language === 'hi' ? 'जनरल सर्जन केवल मंगलवार और गुरुवार को उपलब्ध।' : 'General Surgeon on rotational duty only on Tuesdays and Thursdays.'}
              </li>
            </ul>
          </div>

          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2">
            <span className="font-bold text-teal-900 text-sm block">
              {language === 'mr' ? 'औषध साठा तुटवडा जोखीम' : language === 'hi' ? 'दवा स्टॉक की कमी' : 'Medicine Inventory Vulnerabilities'}
            </span>
            <ul className="space-y-1.5 text-[11px] text-teal-800">
              <li>
                • <strong>{language === 'mr' ? 'प्रा.आ. केंद्र वाघोली:' : language === 'hi' ? 'प्राथमिक स्वास्थ्य केंद्र वाघोली:' : 'PHC Wagholi:'}</strong>{' '}
                {language === 'mr' ? 'अँटी-स्नेक व्हेनम (ASV) साठा कमी (फक्त २ कुप्या शिल्लक).' : language === 'hi' ? 'एंटी-स्नेक वेनम (ASV) बफर स्टॉक कम (केवल 2 शीशियां बची हैं)।' : 'Anti-Snake Venom (ASV) buffer stock low (2 vials left).'}
              </li>
              <li>
                • <strong>{language === 'mr' ? 'ग्रामीण रुग्णालय जुन्नर:' : language === 'hi' ? 'ग्रामीण अस्पताल जुन्नर:' : 'Rural Hospital Junnar:'}</strong>{' '}
                {language === 'mr' ? 'ऑक्सिटोसिन इंजेक्शन पुनर्नोंदणी पातळीवर (६ ॲम्प्युल्स शिल्लक).' : language === 'hi' ? 'ऑक्सीटोसिन इंजेक्शन री-ऑर्डर सीमा पर (6 एम्पुल बचे हैं)।' : 'Inj. Oxytocin stock at re-order threshold (6 ampoules left).'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
