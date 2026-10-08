import React, { useState } from 'react';
import { Referral, PatientFeedback, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { Star, Clock, CheckCircle, MessageSquare } from 'lucide-react';

interface PatientFeedbackModalProps {
  referral: Referral;
  language: Language;
  onSubmit: (feedback: PatientFeedback) => void;
  onClose: () => void;
}

export const PatientFeedbackModal: React.FC<PatientFeedbackModalProps> = ({
  referral,
  language,
  onSubmit,
  onClose,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [waitingTime, setWaitingTime] = useState<PatientFeedback['waitingTimeRating']>('Less than 30 mins');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      rating,
      waitingTimeRating: waitingTime,
      feedbackNote: note.trim(),
      submittedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 className="text-base font-bold">
            {language === 'mr'
              ? 'रुग्ण अनुभव आणि गुणवत्ता अभिप्राय'
              : language === 'hi'
              ? 'रोगी अनुभव व गुणवत्ता फीडबैक'
              : 'Patient Experience & Quality Feedback'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <span className="text-slate-500">
              {language === 'mr' ? 'उपचार रुग्णालय: ' : language === 'hi' ? 'उपचार अस्पताल: ' : 'Treated At: '}
            </span>
            <strong className="text-slate-900">{referral.destinationHospitalName}</strong>
            <div className="text-[11px] text-slate-400">
              {language === 'mr' ? 'संदर्भ क्र: ' : language === 'hi' ? 'रेफरल ID: ' : 'Referral ID: '}
              {referral.referralNumber}
            </div>
          </div>

          {/* 1-5 Star Rating */}
          <div>
            <label className="font-semibold text-slate-700 block mb-2">
              {language === 'mr'
                ? 'एकूण उपचार अनुभव (१ ते ५ स्टार):'
                : language === 'hi'
                ? 'समग्र उपचार अनुभव (१ से ५ स्टार):'
                : 'Overall Treatment Experience (1 to 5 Stars):'}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="font-bold font-mono text-sm text-slate-700 ml-2">{rating} / 5</span>
            </div>
          </div>

          {/* Waiting time question */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {language === 'mr'
                ? 'तज्ज्ञ डॉक्टरांना भेटण्यापूर्वी आपल्याला किती वेळ प्रतीक्षा करावी लागली?'
                : language === 'hi'
                ? 'विशेषज्ञ डॉक्टर से मिलने से पहले आपको कितना इंतजार करना पड़ा?'
                : 'How long did you wait before seeing the specialist doctor?'}
            </label>
            <select
              value={waitingTime}
              onChange={(e) => setWaitingTime(e.target.value as any)}
              className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              <option value="Less than 30 mins">
                {language === 'mr'
                  ? '३० मिनिटांपेक्षा कमी (त्वरित)'
                  : language === 'hi'
                  ? '३० मिनट से कम (शीघ्र)'
                  : 'Less than 30 mins (Quick)'}
              </option>
              <option value="30 to 60 mins">
                {language === 'mr'
                  ? '३० ते ६० मिनिटे (सामान्य)'
                  : language === 'hi'
                  ? '३० से ६० मिनट (सामान्य)'
                  : '30 to 60 mins (Normal)'}
              </option>
              <option value="1 to 2 hours">
                {language === 'mr'
                  ? '१ ते २ तास (मध्यम विलंब)'
                  : language === 'hi'
                  ? '१ से २ घंटे (मध्यम विलंब)'
                  : '1 to 2 hours (Moderate delay)'}
              </option>
              <option value="More than 2 hours">
                {language === 'mr'
                  ? '२ तासांपेक्षा जास्त (गंभीर विलंब)'
                  : language === 'hi'
                  ? '२ घंटे से अधिक (अत्यधिक विलंब)'
                  : 'More than 2 hours (Severe delay)'}
              </option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {language === 'mr'
                ? 'अतिरिक्त टिप्पण्या किंवा सूचना:'
                : language === 'hi'
                ? 'अतिरिक्त टिप्पणियां या सुझाव:'
                : 'Additional Comments or Suggestions:'}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'उदा. डॉक्टरांनी लक्षपूर्वक ऐकले, औषधे वेळेवर मिळाली...'
                  : language === 'hi'
                  ? 'उदा. डॉक्टर ने ध्यान से देखा, दवाएं समय पर मिलीं...'
                  : 'e.g. Doctor was very attentive, medicines were provided on time...'
              }
              className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-medium cursor-pointer"
            >
              {language === 'mr' ? 'रद्द करा' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
            >
              {language === 'mr' ? 'अभिप्राय पाठवा' : language === 'hi' ? 'प्रतिक्रिया भेजें' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
