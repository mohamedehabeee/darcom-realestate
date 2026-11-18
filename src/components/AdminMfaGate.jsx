import { useEffect, useState } from 'react';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { loginUser } from '../services/realEstateService';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@darcom.eg';

export default function AdminMfaGate({
  currentUser,
  onAdminAuthenticated,
  onVerified,
  onCancel,
}) {
  const [masterKey, setMasterKey] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      onVerified();
    }
  }, [currentUser, onVerified]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await loginUser({ email: ADMIN_EMAIL, password: masterKey });
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized access.');
      }
      onAdminAuthenticated(user);
      onVerified();
    } catch {
      setError('Invalid Admin Master Passkey.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="max-w-md mx-auto my-14 px-4">
      <div className="bg-white text-[#111111] border border-black/15 p-6 space-y-5 animate-modal-in">
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#C59B27]" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
                Hidden Vault
              </p>
              <h2 className="text-lg font-semibold">Admin Security Gate</h2>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-neutral-500 hover:text-[#111111] cursor-pointer"
          >
            Exit
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-300 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Enter Admin Master Passkey
            </label>
            <div className="flex items-center border border-black/20 bg-white px-3 focus-within:border-[#C59B27]">
              <KeyRound className="w-4 h-4 text-[#C59B27] mr-2" />
              <input
                type="password"
                required
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="••••••••••••"
                className="w-full py-2.5 text-sm text-[#111111] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-[#111111] text-[#C59B27] text-xs font-semibold uppercase tracking-widest hover:bg-[#C59B27] hover:text-[#111111] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {busy ? 'Unlocking...' : 'Unlock Admin Console'}
          </button>
        </form>
      </div>
    </section>
  );
}