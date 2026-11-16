import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-[#111111] text-white border-t border-white/10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Brand */}
        <div className="md:col-span-5 space-y-4">
          <button
            onClick={() => onNavigate('home')}
            className="darcom-logo text-2xl font-semibold tracking-[0.18em] text-white cursor-pointer"
          >
            DAR<span className="gold-part">COM</span>
          </button>
          <p className="text-sm text-white/65 leading-relaxed max-w-sm">
            Modern Egyptian real estate platform built for clear pricing, side-by-side unit comparisons, and transparent installment planning.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#C59B27]">
            <MapPin className="w-3.5 h-3.5" />
            <span>New Cairo • Sheikh Zayed • New Capital • Maadi</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
            Explore
          </h4>
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-[#C59B27] transition-colors cursor-pointer"
              >
                All Properties
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('saved')}
                className="hover:text-[#C59B27] transition-colors cursor-pointer"
              >
                Saved Shortlist
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('compare')}
                className="hover:text-[#C59B27] transition-colors cursor-pointer"
              >
                Compare Units
              </button>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
            Connect With Us
          </h4>

          <div className="space-y-2 text-sm text-white/75">
            <a
              href="tel:+201065347544"
              className="flex items-center gap-2 hover:text-[#C59B27] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#C59B27]" />
              <span>+20 106 534 7544</span>
            </a>
            <a
              href="mailto:info@darcom.eg"
              className="flex items-center gap-2 hover:text-[#C59B27] transition-colors"
            >
              <Mail className="w-4 h-4 text-[#C59B27]" />
              <span>info@darcom.eg</span>
            </a>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="group flex items-center gap-2 px-3.5 py-2 border border-white/15 bg-white/5 hover:border-[#C59B27] hover:bg-[#C59B27]/10 transition-all"
            >
              <svg
                className="w-4 h-4 text-white group-hover:text-[#C59B27] transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span className="text-xs font-medium">Instagram</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="group flex items-center gap-2 px-3.5 py-2 border border-white/15 bg-white/5 hover:border-[#C59B27] hover:bg-[#C59B27]/10 transition-all"
            >
              <svg
                className="w-4 h-4 text-white group-hover:text-[#C59B27] transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              <span className="text-xs font-medium">Facebook</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        DARCOM Real Estate © {new Date().getFullYear()} — All Rights Reserved.
      </div>
    </footer>
  );
}