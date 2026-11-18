import { ArrowDownRight } from 'lucide-react';
import Villa3DViewer from './Villa3DViewer';

export default function Hero({ onBrowseClick, siteSettings }) {
  const badge = siteSettings?.heroBadge || 'Egypt Real Estate Marketplace';
  const title = siteSettings?.heroTitle || 'Find Your Next Home With Clear Numbers.';
  const subtitle =
    siteSettings?.heroSubtitle ||
    'Explore verified villas, apartments, and offices across New Cairo, Sheikh Zayed, and the New Capital — compare units side-by-side and calculate monthly installments before booking a viewing.';
  const ctaText = siteSettings?.heroCta || 'Explore Properties';

  return (
    <section className="border-b border-black/10 dark:border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C59B27] font-semibold animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-[#C59B27] animate-breathe-dot" />
            <span>{badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold leading-tight text-[#111111] dark:text-white animate-breathe">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-[#111111]/70 dark:text-white/70 leading-relaxed animate-fade-up delay-200">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 animate-fade-up delay-300">
            <button
              onClick={onBrowseClick}
              className="gold-sheen group inline-flex items-center gap-2 px-6 py-3 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer animate-breathe-slow"
            >
              <span>{ctaText}</span>
              <ArrowDownRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 animate-breathe-slow">
          <Villa3DViewer />
        </div>
      </div>
    </section>
  );
}