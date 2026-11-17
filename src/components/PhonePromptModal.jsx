import { useState } from 'react';
import { PhoneCall } from 'lucide-react';
import { updateUserProfile } from '../services/realEstateService';

const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/;

export default function PhonePromptModal({ currentUser, onUpdated }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phone.trim();

    if (!EGYPT_PHONE_REGEX.test(cleanPhone)) {
      setError('Please enter a valid 11-digit Egyptian mobile number (e.g. 010xxxxxxxx).');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateUserProfile({
        name: currentUser.name,
        phone: cleanPhone,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err.message || 'Could not save phone number.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161616] border border-black/15 dark:border-white/15 max-w-md w-full p-6 space-y-5 animate-modal-in">
        <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-4">
          <div className="p-2.5 bg-[#C59B27]/15 text-[#C59B27]">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
              Complete Your Profile
            </p>
            <h2 className="text-lg font-semibold text-[#111111] dark:text-white">
              Add Your Mobile Number
            </h2>
          </div>
        </div>

        <p className="text-xs text-[#111111]/75 dark:text-white/75 leading-relaxed">
          Welcome back, <strong>{currentUser.name}</strong>! Please add your mobile number so our property advisors can confirm your viewing requests and send instant updates.
        </p>

        {error && (
          <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75">
              Mobile Number
            </label>
            <input
              type="tel"
              required
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="01012345678"
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#111111] border border-black/15 dark:border-white/15 text-[#111111] dark:text-white focus:outline-none focus:border-[#C59B27]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-semibold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Mobile Number'}
          </button>
        </form>
      </div>
    </div>
  );
}