import { useEffect, useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { enrollAdminMfa, getMfaStatus, verifyAdminMfa } from '../services/realEstateService';

export default function AdminMfaGate({ onVerified }) {
  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function initMfa() {
      setLoading(true);
      try {
        const status = await getMfaStatus();
        if (status.currentLevel === 'aal2') {
          onVerified();
          return;
        }
        if (status.hasMfaSetup && status.factorId) {
          setFactorId(status.factorId);
        } else {
          const enrolled = await enrollAdminMfa();
          setFactorId(enrolled.id);
          setQrCode(enrolled.totp.qr_code);
          setSecret(enrolled.totp.secret);
        }
      } catch (err) {
        setError(err.message || 'Could not initialize 2FA.');
      } finally {
        setLoading(false);
      }
    }
    initMfa();
  }, [onVerified]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      await verifyAdminMfa(factorId, code);
      onVerified();
    } catch (err) {
      setError(err.message || 'Invalid 6-digit code. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white text-[#111111] border border-black/15 text-center text-sm">
        Checking hardware security token...
      </div>
    );
  }

  return (
    <section className="max-w-md mx-auto my-14 px-4">
      <div className="bg-white text-[#111111] border border-black/15 p-6 space-y-5">
        <div className="flex items-center gap-2.5 border-b border-black/10 pb-4">
          <ShieldCheck className="w-6 h-6 text-[#C59B27]" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
              Zero-Trust Protection
            </p>
            <h2 className="text-lg font-semibold">Admin 2FA Verification</h2>
          </div>
        </div>

        {qrCode ? (
          <div className="space-y-3 text-xs text-neutral-600">
            <p className="font-medium text-[#111111]">
              First-time setup: Open <strong>Google Authenticator</strong> on your phone, tap <strong>+</strong> and scan this QR code:
            </p>
            <div className="p-3 bg-[#FAF8F5] border border-black/10 flex justify-center">
              <img src={qrCode} alt="2FA QR Code" className="w-44 h-44" />
            </div>
            {secret && (
              <p className="text-[11px] break-all bg-neutral-100 p-2 border border-black/10">
                Manual key: <strong>{secret}</strong>
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-neutral-600">
            Open <strong>Google Authenticator</strong> on your phone and enter the 6-digit code for <strong>DarCom</strong>.
          </p>
        )}

        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-300 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              6-Digit Authenticator Code
            </label>
            <div className="flex items-center border border-black/20 bg-white px-3 focus-within:border-[#C59B27]">
              <Lock className="w-4 h-4 text-[#C59B27] mr-2" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full py-2.5 text-base tracking-[0.35em] font-semibold text-[#111111] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="w-full py-3 bg-[#111111] text-[#C59B27] text-xs font-semibold uppercase tracking-widest hover:bg-[#C59B27] hover:text-[#111111] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {verifying ? 'Verifying...' : 'Unlock Admin Console'}
          </button>
        </form>
      </div>
    </section>
  );
}