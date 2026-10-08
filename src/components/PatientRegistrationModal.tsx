import React, { useState } from 'react';
import { Patient, Language } from '../types';
import { PUNE_TALUKAS, TALUKA_VILLAGES } from '../data/mockData';
import { TRANSLATIONS } from '../utils/translations';
import { UserPlus, X, ShieldCheck } from 'lucide-react';

interface PatientRegistrationModalProps {
  language: Language;
  onClose: () => void;
  onRegister: (patient: Patient) => void;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  language,
  onClose,
  onRegister,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [mobile, setMobile] = useState('');
  const [taluka, setTaluka] = useState('Haveli');
  const [village, setVillage] = useState(TALUKA_VILLAGES['Haveli'][0]);
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [existingConditions, setExistingConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);
  const [medInput, setMedInput] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);

  const handleTalukaChange = (newTaluka: string) => {
    setTaluka(newTaluka);
    const villages = TALUKA_VILLAGES[newTaluka] || [];
    setVillage(villages[0] || 'Main Village');
  };

  const handleAddCondition = () => {
    if (conditionInput.trim() && !existingConditions.includes(conditionInput.trim())) {
      setExistingConditions([...existingConditions, conditionInput.trim()]);
      setConditionInput('');
    }
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const handleAddMedication = () => {
    if (medInput.trim() && !currentMedications.includes(medInput.trim())) {
      setCurrentMedications([...currentMedications, medInput.trim()]);
      setMedInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !mobile.trim()) {
      alert(
        language === 'mr'
          ? 'कृपया आवश्यक माहिती भरा: नाव, वय, मोबाईल क्रमांक.'
          : language === 'hi'
          ? 'कृपया आवश्यक जानकारी भरें: नाम, आयु, मोबाइल नंबर।'
          : 'Please fill out required patient fields: Name, Age, Mobile.'
      );
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newHealthId = `MH-PUN-2026-${randomNum}`;
    const newAbha = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${randomNum}`;

    const newPatient: Patient = {
      id: `pat_${Date.now()}`,
      healthId: newHealthId,
      abhaNumber: newAbha,
      name: name.trim(),
      age: Number(age),
      gender,
      mobile: mobile.trim(),
      taluka,
      village,
      aadhaarLast4: aadhaarLast4.trim() || 'XXXX',
      emergencyContact: emergencyContact.trim() || `${mobile.trim()} (Self)`,
      bloodGroup,
      existingConditions,
      allergies,
      currentMedications,
      consentGiven,
      registeredAt: new Date().toISOString(),
    };

    onRegister(newPatient);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold">{t.registerNew}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Health ID info notice */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-800">
            {language === 'mr' ? (
              <>
                विशिष्ट पुणे ग्रामीण आरोग्य ओळख क्रमांक (उदा. <span className="font-mono font-bold">MH-PUN-2026-XXXX</span>) आणि लिंक केलेला आभा क्रमांक आपोआप तयार होईल.
              </>
            ) : language === 'hi' ? (
              <>
                विशिष्ट पुणे ग्रामीण स्वास्थ्य पहचान संख्या (उदा. <span className="font-mono font-bold">MH-PUN-2026-XXXX</span>) और लिंक की गई आभा संख्या स्वतः उत्पन्न होगी।
              </>
            ) : (
              <>
                A unique Pune Rural Health ID (e.g. <span className="font-mono font-bold">MH-PUN-2026-XXXX</span>) and linked ABHA number will be automatically generated.
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'mr'
                  ? 'पूर्ण नाव'
                  : language === 'hi'
                  ? 'पूरा नाम'
                  : 'Full Name'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  language === 'mr'
                    ? 'उदा. आनंदा विठोबा शिंदे'
                    : language === 'hi'
                    ? 'उदा. आनंदा विठोबा शिंदे'
                    : 'e.g. Ananda Vithoba Shinde'
                }
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'mr' ? 'वय' : language === 'hi' ? 'आयु' : 'Age'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={language === 'mr' ? 'वर्षे' : language === 'hi' ? 'वर्ष' : 'Years'}
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'mr' ? 'लिंग' : language === 'hi' ? 'लिंग' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full text-sm px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="Male">
                  {language === 'mr' ? 'पुरुष' : language === 'hi' ? 'पुरुष' : 'Male'}
                </option>
                <option value="Female">
                  {language === 'mr' ? 'स्त्री / महिला' : language === 'hi' ? 'महिला' : 'Female'}
                </option>
                <option value="Other">
                  {language === 'mr' ? 'इतर' : language === 'hi' ? 'अन्य' : 'Other'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'mr' ? 'रक्तगट' : language === 'hi' ? 'रक्त समूह' : 'Blood Group'}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">{language === 'mr' ? 'अज्ञात' : language === 'hi' ? 'अज्ञात' : 'Unknown'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'mr' ? 'मोबाईल क्र.' : language === 'hi' ? 'मोबाइल नं.' : 'Mobile'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit number"
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'mr'
                  ? 'तालुका (पुणे जिल्हा)'
                  : language === 'hi'
                  ? 'तालुका (पुणे जिला)'
                  : 'Taluka (Pune Dist)'}
              </label>
              <select
                value={taluka}
                onChange={(e) => handleTalukaChange(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                {PUNE_TALUKAS.map((tal) => (
                  <option key={tal} value={tal}>
                    {tal}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'mr'
                  ? 'गाव / उपकेंद्र'
                  : language === 'hi'
                  ? 'गाँव / उप-केंद्र'
                  : 'Village / Sub-Centre'}
              </label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                {(TALUKA_VILLAGES[taluka] || []).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Allergies Input (Special clinical safety feature) */}
          <div>
            <label className="block text-xs font-semibold text-red-800 mb-1">
              {language === 'mr'
                ? '⚠️ औषधांची ॲलर्जी (Drug Allergies):'
                : language === 'hi'
                ? '⚠️ ज्ञात दवा एलर्जी (Drug Allergies):'
                : '⚠️ Known Drug Allergies:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                placeholder={
                  language === 'mr'
                    ? 'उदा. पेनिसिलिन, सल्फा औषधे'
                    : language === 'hi'
                    ? 'उदा. पेनिसिलिन, सल्फा दवाएं'
                    : 'e.g. Penicillin, Sulfa, NSAIDs'
                }
                className="flex-1 text-sm px-3 py-2 border border-red-200 rounded-xl bg-red-50/40 focus:ring-2 focus:ring-red-400 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                + {language === 'mr' ? 'ॲलर्जी जोडा' : language === 'hi' ? 'एलर्जी जोड़ें' : 'Add Allergy'}
              </button>
            </div>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {allergies.map((all, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 text-xs rounded-lg font-medium"
                  >
                    <span>⚠️ {all}</span>
                    <button
                      type="button"
                      onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))}
                      className="text-red-500 hover:text-red-800 cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Current Routine Medications */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'mr'
                ? '💊 सुरू असलेली नियमित औषधे:'
                : language === 'hi'
                ? '💊 वर्तमान दैनिक दवाएं:'
                : '💊 Current Daily Medications:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={medInput}
                onChange={(e) => setMedInput(e.target.value)}
                placeholder={
                  language === 'mr'
                    ? 'उदा. टॅब. अ‍ॅम्लोडिपिन 5mg, इन्सुलिन'
                    : language === 'hi'
                    ? 'उदा. टैब. एम्लोडिपिन 5mg, इंसुलिन'
                    : 'e.g. Tab. Amlodipine 5mg, Insulin'
                }
                className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddMedication}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                + {language === 'mr' ? 'औषध जोडा' : language === 'hi' ? 'दवा जोड़ें' : 'Add Med'}
              </button>
            </div>
            {currentMedications.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentMedications.map((m, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 text-xs rounded-lg font-medium border border-teal-200"
                  >
                    <span>💊 {m}</span>
                    <button
                      type="button"
                      onClick={() => setCurrentMedications(currentMedications.filter((_, idx) => idx !== i))}
                      className="text-teal-600 hover:text-teal-900 cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-slate-700">
                {language === 'mr'
                  ? 'रुग्ण डिजिटल आरोग्य प्रोफाइल साठवणूक आणि इलेक्ट्रॉनिक संदर्भ देवाणघेवाणीस संमती देतो'
                  : language === 'hi'
                  ? 'रोगी डिजिटल स्वास्थ्य प्रोफाइल भंडारण और इलेक्ट्रॉनिक रेफरल साझा करने की सहमति देता है'
                  : 'Patient provides consent for digital health profile storage and electronic referral sharing'}
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              {language === 'mr' ? 'रद्द करा' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs cursor-pointer"
            >
              {language === 'mr'
                ? 'नोंदणी करा व आरोग्य ID द्या'
                : language === 'hi'
                ? 'पंजीकृत करें व स्वास्थ्य ID बनाएं'
                : 'Register & Assign Health ID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
