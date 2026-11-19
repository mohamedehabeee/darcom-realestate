import { ArrowDownRight, ShieldCheck, Building2, Calculator } from 'lucide-react';
import Villa3DViewer from './Villa3DViewer';

export default function Hero({ siteSettings, onBrowseClick }) {
  const heroBadge = siteSettings?.heroBadge || 'Egypt Real Estate Marketplace';
  const heroTitle =
    siteSettings?.heroTitle || 'Find Your Next Home With Clear Numbers.';
  const heroSubtitle =
    siteSettings?.heroSubtitle ||
    'Explore verified villas, apartments, and offices across New Cairo, Sheikh Zayed, and the New Capital — compare units side-by-side and calculate monthly installments before booking a viewing.';
  const heroCta = siteSettings?.heroCta || 'Explore Properties';

  return (
    <section className="relative border-b border-black/10 dark:border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Dynamic Copy & CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#C59B27] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#C59B27]" />
            <span>{heroBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold leading-[1.12] tracking-tight text-[#111111] dark:text-white">
            {heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-[#111111]/70 dark:text-white/70 leading-relaxed max-w-xl">
            {heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onBrowseClick}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span>{heroCta}</span>
              <ArrowDownRight className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/${(siteSettings?.whatsapp || '201065347544').replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 border border-black/15 dark:border-white/15 text-xs font-semibold uppercase tracking-wider text-[#111111] dark:text-white hover:border-[#C59B27] transition-colors"
            >
              <span>WhatsApp Advisor</span>
            </a>
          </div>

          <div className="pt-4 border-t border-black/10 dark:border-white/10 grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#111111] dark:text-white">0% Commission</p>
                <p className="text-[#111111]/60 dark:text-white/60">Primary Launches</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calculator className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#111111] dark:text-white">Live Plans</p>
                <p className="text-[#111111]/60 dark:text-white/60">Up to 10 Years</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#111111] dark:text-white">Verified Units</p>
                <p className="text-[#111111]/60 dark:text-white/60">Direct Developer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Architectural Villa */}
        <div className="lg:col-span-7">
          <Villa3DViewer />
        </div>
      </div>
    </section>
  );
}