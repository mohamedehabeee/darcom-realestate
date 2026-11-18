import { useEffect, useState } from 'react';
import { X, Calendar, Phone, User, CheckCircle2, FileText } from 'lucide-react';

const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/;

export default function BookingModal({ unit, currentUser, onSubmit, onClose }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [date, setDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!unit) return null;

  const inputStyle =
    'w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#111111] border border-black/15 dark:border-white/15 text-[#111111] dark:text-white focus:outline-none focus:border-[#C59B27]';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!EGYPT_PHONE_REGEX.test(cleanPhone)) {
      setError('Please enter a valid 11-digit Egyptian mobile number (e.g. 01012345678).');
      return;
    }

    if (!date || date < todayStr) {
      setError('Please select a valid upcoming viewing date.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        unitId: String(unit.id),
        unitTitle: unit.title,
        name: cleanName,
        phone: cleanPhone,
        date,
        notes: notes.trim().slice(0, 500),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not submit viewing request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#161616] border border-black/15 dark:border-white/15 max-w-md w-full p-6 space-y-5 animate-modal-in">
        <div className="flex items-start justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
              Private Viewing Request
            </p>
            <h2 className="text-lg font-semibold text-[#111111] dark:text-white mt-0.5">
              {unit.title}
            </h2>
            <p className="text-xs text-[#111111]/60 dark:text-white/60 mt-0.5">
              {unit.compound} • {unit.city}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#111111] dark:text-white">
                Viewing Request Received!
              </h3>
              <p className="text-xs text-[#111111]/65 dark:text-white/65 leading-relaxed">
                Our senior property advisor will contact you on <strong>{phone}</strong> to confirm your appointment for <strong>{date}</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Egyptian Mobile Number (11 Digits)</span>
              </label>
              <input
                type="tel"
                required
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="01012345678"
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Preferred Viewing Date</span>
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Notes / Preferred Time (Optional)</span>
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Morning visit around 11 AM, interested in installment plan..."
                className={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {loading ? 'Submitting Request...' : 'Confirm Viewing Appointment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}