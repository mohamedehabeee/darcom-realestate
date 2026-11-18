import { useRef, useState } from 'react';
import { MapPin, Phone, Mail, ArrowUpRight, Send, CheckCircle2 } from 'lucide-react';
import { subscribeNewsletter } from '../services/realEstateService';

export default function Footer({ onNavigate, onSecretTrigger, siteSettings }) {
  const clicksRef = useRef({ count: 0, timer: null });
  const [subEmail, setSubEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');

  const phone = siteSettings?.phone || '+20 106 534 7544';
  const email = siteSettings?.email || 'info@darcom.eg';
  const instagram = siteSettings?.instagram || 'https://www.instagram.com/';
  const facebook = siteSettings?.facebook || 'https://www.facebook.com/';
  const footerDesc =
    siteSettings?.footerDesc ||
    'Interactive 3D architectural tours, live installment modeling, and verified residences across New Cairo, Sheikh Zayed, New Capital, and the North Coast.';
  const locationsText =
    siteSettings?.locationsText || 'New Cairo • Sheikh Zayed • New Capital • North Coast';

  const handleLogoClick = () => {
    clicksRef.current.count += 1;
    clearTimeout(clicksRef.current.timer);
    if (clicksRef.current.count >= 5) {
      clicksRef.current.count = 0;
      onSecretTrigger?.();
      return;
    }
    clicksRef.current.timer = setTimeout(() => {
      if (clicksRef.current.count < 5) {
        onNavigate('home');
      }
      clicksRef.current.count = 0;
    }, 450);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    setSubError('');
    setSubLoading(true);
    try {
      await subscribeNewsletter(subEmail);
      setSubscribed(true);
      setSubEmail('');
    } catch (err) {
      setSubError(err.message || 'Could not subscribe right now.');
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <footer className="relative bg-[#080808] text-white overflow-hidden">
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C59B27] to-transparent animate-pulse" />

      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[220px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #C59B27 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-10 border-b border-white/10">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C59B27]/10 border border-[#C59B27]/40 text-[11px] uppercase tracking-[0.25em] text-[#C59B27]">
              <span className="w-2 h-2 rounded-full bg-[#C59B27] animate-ping" />
              <span>Egypt Luxury Real Estate</span>
            </div>

            <div>
              <button
                onClick={handleLogoClick}
                className="footer-neon-logo text-4xl sm:text-5xl font-bold tracking-[0.22em] text-white cursor-pointer select-none"
              >
                DAR<span className="footer-gold-pulse">COM</span>
              </button>
            </div>

            <p className="text-sm text-white/65 max-w-xl leading-relaxed">
              {footerDesc}
            </p>
          </div>

          <div className="lg:col-span-5 bg-[#121212] border border-white/10 p-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
              VIP Launch Alerts
            </p>
            <p className="text-xs text-white/65">
              Get notified first when new standalone villas and seafront chalets are listed.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 py-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>You are subscribed to DarCom VIP alerts.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="flex-1 px-3 py-2.5 text-xs bg-black border border-white/15 text-white focus:outline-none focus:border-[#C59B27]"
                  />
                  <button
                    type="submit"
                    disabled={subLoading}
                    className="gold-sheen px-4 py-2.5 bg-[#C59B27] text-[#111111] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{subLoading ? '...' : 'Join'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {subError && <p className="text-[11px] text-rose-400">{subError}</p>}
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#C59B27] font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#C59B27] hover:translate-x-1 transition-all cursor-pointer"
                >
                  → All Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('saved')}
                  className="hover:text-[#C59B27] hover:translate-x-1 transition-all cursor-pointer"
                >
                  → Saved Shortlist
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('compare')}
                  className="hover:text-[#C59B27] hover:translate-x-1 transition-all cursor-pointer"
                >
                  → Compare Units (Up to 3)
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#C59B27] font-semibold">
              Direct Advisory
            </h4>
            <div className="space-y-2.5 text-sm text-white/75">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2.5 hover:text-[#C59B27] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#C59B27]" />
                <span>{phone}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 hover:text-[#C59B27] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#C59B27]" />
                <span>{email}</span>
              </a>
              <div className="flex items-center gap-2.5 text-xs text-white/60 pt-1">
                <MapPin className="w-4 h-4 text-[#C59B27] shrink-0" />
                <span>{locationsText}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#C59B27] font-semibold">
              Follow Our Channels
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="group relative p-3.5 bg-[#121212] border border-white/15 hover:border-[#E1306C] hover:shadow-[0_0_25px_rgba(225,48,108,0.35)] transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-[#E1306C] transition-colors">
                      Instagram
                    </p>
                    <p className="text-[11px] text-white/50">@darcom.eg</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              <a
                href={facebook}
                target="_blank"
                rel="noreferrer"
                className="group relative p-3.5 bg-[#121212] border border-white/15 hover:border-[#1877F2] hover:shadow-[0_0_25px_rgba(24,119,242,0.35)] transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1877F2] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-[#1877F2] transition-colors">
                      Facebook
                    </p>
                    <p className="text-[11px] text-white/50">DarCom Official</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
          <span>DARCOM Real Estate © {new Date().getFullYear()} — All Rights Reserved.</span>
          <span className="text-[#C59B27]/80">Designed for Modern Living</span>
        </div>
      </div>

      <style>{`
        @keyframes neonGoldPulse {
          0%, 100% {
            text-shadow: 0 0 10px rgba(197, 155, 39, 0.35), 0 0 24px rgba(197, 155, 39, 0.15);
            filter: brightness(1);
          }
          50% {
            text-shadow: 0 0 22px rgba(255, 230, 128, 0.95), 0 0 45px rgba(197, 155, 39, 0.65);
            filter: brightness(1.25);
          }
        }
        .footer-neon-logo {
          animation: neonGoldPulse 2.8s ease-in-out infinite;
        }
        .footer-gold-pulse {
          color: #C59B27;
        }
      `}</style>
    </footer>
  );
}