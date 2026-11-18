import { useEffect, useState } from 'react';
import { ShieldCheck, KeyRound, Mail } from 'lucide-react';
import { loginUser } from '../services/realEstateService';

const DEFAULT_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

export default function AdminMfaGate({
  currentUser,
  onAdminAuthenticated,
  onVerified,
  onCancel,
}) {
  const [adminEmail, setAdminEmail] = useState(DEFAULT_ADMIN_EMAIL);
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
      const user = await loginUser({
        email: adminEmail.trim().toLowerCase(),
        password: masterKey,
      });
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized access.');
      }
      onAdminAuthenticated(user);
      onVerified();
    } catch {
      setError('Invalid Admin Email or Master Passkey.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="max-w-md mx-auto my-14 px-4">
      <div className="bg-white dark:bg-[#161616] text-[#111111] dark:text-white border border-black/15 dark:border-white/15 p-6 space-y-5 animate-modal-in">
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
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
            type="button"
            onClick={onCancel}
            className="text-xs text-neutral-500 hover:text-[#111111] dark:hover:text-white cursor-pointer"
          >
            Exit
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Admin Email / Username
            </label>
            <div className="flex items-center border border-black/20 dark:border-white/20 bg-white dark:bg-[#111111] px-3 focus-within:border-[#C59B27]">
              <Mail className="w-4 h-4 text-[#C59B27] mr-2 shrink-0" />
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@darcom.eg"
                className="w-full py-2.5 text-sm bg-transparent text-[#111111] dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Enter Admin Master Passkey
            </label>
            <div className="flex items-center border border-black/20 dark:border-white/20 bg-white dark:bg-[#111111] px-3 focus-within:border-[#C59B27]">
              <KeyRound className="w-4 h-4 text-[#C59B27] mr-2 shrink-0" />
              <input
                type="password"
                required
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="••••••••••••"
                className="w-full py-2.5 text-sm bg-transparent text-[#111111] dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-[#111111] dark:bg-[#C59B27] text-[#C59B27] dark:text-[#111111] text-xs font-semibold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {busy ? 'Unlocking...' : 'Unlock Admin Console'}
          </button>
        </form>
      </div>
    </section>
  );
}