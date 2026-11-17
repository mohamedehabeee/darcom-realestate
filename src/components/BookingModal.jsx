import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export default function BookingModal({ unit, currentUser, onSubmit, onClose }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const inputStyle =
    'w-full px-3 py-2.5 text-sm bg-white dark:bg-[#111111] border border-black/15 dark:border-white/15 text-[#111111] dark:text-white focus:outline-none focus:border-[#C59B27]';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      unitId: unit.id,
      unitTitle: unit.title,
      name,
      phone,
      date,
      notes,
    });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161616] border border-black/15 dark:border-white/15 max-w-md w-full p-6 animate-modal-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#111111] dark:text-white">
            Book a Viewing
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#C59B27] mx-auto" />
            <h3 className="text-base font-semibold text-[#111111] dark:text-white">
              Viewing Request Confirmed
            </h3>
            <p className="text-xs text-[#111111]/70 dark:text-white/70">
              Our property advisor will contact you on {phone} to confirm your visit to {unit.title}.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-[#C59B27] font-medium">
              {unit.title} — {unit.compound}
            </p>

            <div>
              <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mohamed Ehab"
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75">
                Phone Number
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
              <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75">
                Preferred Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75">
                Notes (Optional)
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Preferred time or questions..."
                className={inputStyle}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Confirm Viewing Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}