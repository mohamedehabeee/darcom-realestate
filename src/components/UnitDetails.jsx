import { useMemo, useState } from 'react';
import {
  X,
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Calendar,
  CheckCircle2,
  Calculator,
  Phone,
  MessageCircle,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import PriceAlertModal from './PriceAlertModal';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

export default function UnitDetails({
  unit,
  siteSettings,
  currentUser,
  isAr = false,
  isSaved,
  onToggleSave,
  onClose,
  onBookViewing,
}) {
  if (!unit) return null;

  const gallery = useMemo(() => {
    const list = Array.isArray(unit.gallery) && unit.gallery.length ? unit.gallery : [unit.image];
    return list.filter(Boolean);
  }, [unit]);

  const [activeImg, setActiveImg] = useState(gallery[0] || FALLBACK_IMAGE);
  const [downPct, setDownPct] = useState(Number(unit.downPaymentPercent ?? 15));
  const [years, setYears] = useState(Math.max(1, Number(unit.installmentYears ?? 7)));
  const [showPriceAlert, setShowPriceAlert] = useState(false);

  const price = Number(unit.price || 0);
  const area = Math.max(1, Number(unit.area || 1));
  const pricePerSqm = Math.round(price / area);

  const installmentPlan = useMemo(() => {
    const downAmount = Math.round((price * downPct) / 100);
    const remaining = Math.max(0, price - downAmount);
    const totalMonths = Math.max(1, years * 12);
    const monthly = Math.round(remaining / totalMonths);
    const quarterly = monthly * 3;
    return { downAmount, remaining, monthly, quarterly };
  }, [price, downPct, years]);

  const whatsappNumber = (siteSettings?.whatsapp || '201065347544').replace(/\D/g, '');
  const advisorPhone = siteSettings?.phone || '+20 106 534 7544';
  const whatsappText = encodeURIComponent(
    `Hello DarCom Advisory, I am interested in "${unit.title}" in ${unit.compound} (${unit.city}) listed at ${new Intl.NumberFormat('en-EG').format(price)} EGP.`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#151515] border border-black/15 dark:border-white/15 max-w-4xl w-full max-h-[92vh] overflow-y-auto animate-modal-in">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#151515]/95 backdrop-blur-sm px-5 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#111111] text-white dark:bg-[#C59B27] dark:text-[#111111]">
              {unit.purpose === 'Rent' ? 'For Rent' : 'For Sale'}
            </span>
            <span
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                unit.status === 'Sold'
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  : unit.status === 'Reserved'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {unit.status || 'Available'}
            </span>
            {unit.badge && (
              <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#C59B27]/20 text-[#C59B27]">
                {unit.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave?.(String(unit.id))}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold cursor-pointer transition-colors ${
                isSaved
                  ? 'bg-[#C59B27] border-[#C59B27] text-[#111111]'
                  : 'border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Image & Thumbnails */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="space-y-3">
            <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <img
                src={activeImg || FALLBACK_IMAGE}
                alt={unit.title}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {gallery.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImg(imgUrl)}
                    className={`w-20 h-14 shrink-0 overflow-hidden border-2 cursor-pointer transition-all ${
                      activeImg === imgUrl
                        ? 'border-[#C59B27] scale-105'
                        : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Bar */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-black/10 dark:border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#C59B27] font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {unit.compound} • {unit.city}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111111] dark:text-white">
                {unit.title}
              </h2>
            </div>

            <div className="text-start sm:text-end">
              <p className="text-2xl sm:text-3xl font-bold text-[#111111] dark:text-white">
                {new Intl.NumberFormat('en-EG').format(price)} EGP
                {unit.purpose === 'Rent' && (
                  <span className="text-xs font-normal text-[#111111]/60 dark:text-white/60">
                    {' '}
                    / month
                  </span>
                )}
              </p>
              {unit.purpose === 'Buy' && (
                <p className="text-xs text-[#C59B27] font-semibold mt-0.5">
                  Avg. {new Intl.NumberFormat('en-EG').format(pricePerSqm)} EGP / m²
                </p>
              )}
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#111111] border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#111111]/60 dark:text-white/60">
                <Maximize2 className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Built Area</span>
              </div>
              <p className="text-sm font-bold text-[#111111] dark:text-white mt-1">
                {unit.area} m²
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#111111] border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#111111]/60 dark:text-white/60">
                <BedDouble className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Bedrooms</span>
              </div>
              <p className="text-sm font-bold text-[#111111] dark:text-white mt-1">
                {unit.bedrooms} Bedrooms
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#111111] border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#111111]/60 dark:text-white/60">
                <Bath className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Bathrooms</span>
              </div>
              <p className="text-sm font-bold text-[#111111] dark:text-white mt-1">
                {unit.bathrooms} Bathrooms
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#111111] border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#111111]/60 dark:text-white/60">
                <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Delivery</span>
              </div>
              <p className="text-sm font-bold text-[#111111] dark:text-white mt-1">
                {unit.delivery || 'Ready to Move'}
              </p>
            </div>
          </div>

          {/* Description & Features */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#C59B27] mb-2">
                  Architectural Overview
                </h3>
                <p className="text-sm text-[#111111]/75 dark:text-white/75 leading-relaxed">
                  {unit.description ||
                    `${unit.type} located in ${unit.compound}, ${unit.city}, offering premium finishing, prime community access, and verified legal documentation.`}
                </p>
              </div>

              {Array.isArray(unit.features) && unit.features.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-[#C59B27] mb-2.5">
                    Amenities & Features
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {unit.features.map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-[#111111]/80 dark:text-white/80 p-2 bg-[#FAF8F5] dark:bg-[#111111] border border-black/5 dark:border-white/5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Installment Simulator */}
            <div className="lg:col-span-5 p-5 bg-[#FAF8F5] dark:bg-[#111111] border border-black/15 dark:border-white/15 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#111111] dark:text-white flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-[#C59B27]" />
                  <span>
                    {unit.purpose === 'Buy' ? 'Live Installment Simulator' : 'Rental Summary'}
                  </span>
                </h3>
                <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
              </div>

              {unit.purpose === 'Buy' ? (
                <>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Down Payment ({downPct}%)</span>
                        <span className="text-[#C59B27]">
                          {new Intl.NumberFormat('en-EG').format(installmentPlan.downAmount)} EGP
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={downPct}
                        onChange={(e) => setDownPct(Number(e.target.value))}
                        className="w-full accent-[#C59B27] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Installment Duration</span>
                        <span className="text-[#C59B27]">{years} Years</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        step="1"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="w-full accent-[#C59B27] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#111111]/60 dark:text-white/60">
                        Est. Monthly
                      </span>
                      <span className="text-lg font-bold text-[#111111] dark:text-white">
                        {new Intl.NumberFormat('en-EG').format(installmentPlan.monthly)} EGP
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs border-t border-black/10 dark:border-white/10 pt-2">
                      <span className="text-[#111111]/60 dark:text-white/60">
                        Est. Quarterly
                      </span>
                      <span className="font-semibold text-[#C59B27]">
                        {new Intl.NumberFormat('en-EG').format(installmentPlan.quarterly)} EGP
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 text-xs space-y-2">
                  <p className="font-semibold text-[#111111] dark:text-white">
                    Monthly Rent: {new Intl.NumberFormat('en-EG').format(price)} EGP
                  </p>
                  <p className="text-[#111111]/65 dark:text-white/65">
                    Includes compound security & maintenance access. Contact our leasing desk for contract duration options.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={unit.status === 'Sold'}
                  onClick={() => onBookViewing?.(unit)}
                  className="w-full py-3 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  {unit.status === 'Sold' ? 'Property Sold' : 'Schedule Private Viewing'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPriceAlert(true)}
                  className="w-full py-2.5 px-3 border border-[#C59B27]/60 text-[#C59B27] hover:bg-[#C59B27]/10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isAr ? 'بلّغني لو السعر نزل' : 'Notify Me on Price Drop'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${advisorPhone.replace(/\s+/g, '')}`}
                    className="py-2.5 px-3 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>Call Direct</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPriceAlert && (
        <PriceAlertModal
          unit={unit}
          user={currentUser}
          isAr={isAr}
          onClose={() => setShowPriceAlert(false)}
        />
      )}
    </div>
  );
}