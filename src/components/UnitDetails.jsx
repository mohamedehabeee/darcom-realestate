import { useState } from 'react';
import { X, MapPin, BedDouble, Bath, Maximize2, Check, Calendar, Heart } from 'lucide-react';
import InstallmentCalculator from './InstallmentCalculator';

export default function UnitDetails({
  unit,
  isSaved,
  siteSettings,
  onToggleSave,
  onClose,
  onBookViewing,
}) {
  const [activeImage, setActiveImage] = useState(unit.gallery?.[0] || unit.image);

  const fmt = (price) =>
    new Intl.NumberFormat('en-EG').format(price) + (unit.purpose === 'Rent' ? ' EGP / mo' : ' EGP');

  const rawWa = (siteSettings?.whatsapp || '201065347544').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${rawWa}?text=${encodeURIComponent(
    `Hello DarCom, I'm interested in "${unit.title}" in ${unit.compound} (${unit.city}) listed at ${new Intl.NumberFormat('en-EG').format(unit.price)} EGP.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#161616] border border-black/15 dark:border-white/15 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-modal-in">
        <div className="sticky top-0 z-10 bg-white dark:bg-[#161616] px-6 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#C59B27] font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {unit.compound} — {unit.city}
            </p>
            <h2 className="text-lg sm:text-xl font-semibold text-[#111111] dark:text-white">
              {unit.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-64 sm:h-80 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <img src={activeImage} alt={unit.title} className="w-full h-full object-cover" />
            </div>

            {unit.gallery?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {unit.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-14 overflow-hidden border-2 shrink-0 cursor-pointer ${
                      activeImage === img ? 'border-[#C59B27]' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 py-3 border-y border-black/10 dark:border-white/10 text-xs text-[#111111] dark:text-white">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#C59B27]" />
                <span>{unit.area} m²</span>
              </div>
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-[#C59B27]" />
                <span>{unit.bedrooms || 'Studio / Office'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-[#C59B27]" />
                <span>{unit.bathrooms} Baths</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#111111] dark:text-white mb-2">
                Property Overview
              </h4>
              <p className="text-sm text-[#111111]/75 dark:text-white/75 leading-relaxed">
                {unit.description}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#111111] dark:text-white mb-2">
                Key Features
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {unit.features?.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#111111]/80 dark:text-white/80">
                    <Check className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="p-4 border border-black/10 dark:border-white/10">
              <p className="text-xs text-[#111111]/60 dark:text-white/60 uppercase tracking-wider">
                {unit.delivery} • {unit.status}
              </p>
              <p className="text-2xl font-semibold text-[#111111] dark:text-white mt-1">
                {fmt(unit.price)}
              </p>
            </div>

            <InstallmentCalculator unit={unit} />

            <div className="flex gap-2">
              <button
                onClick={() => onBookViewing(unit)}
                disabled={unit.status === 'Sold'}
                className="flex-1 py-3 px-4 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-sm font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Viewing</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                title="Inquire on WhatsApp"
                className="px-4 py-3 border border-black/15 dark:border-white/15 text-xs font-semibold text-[#111111] dark:text-white hover:border-[#C59B27] hover:text-[#C59B27] inline-flex items-center justify-center transition-colors"
              >
                WhatsApp
              </a>

              <button
                onClick={() => onToggleSave(unit.id)}
                className={`px-4 py-3 border text-sm font-semibold inline-flex items-center justify-center cursor-pointer ${
                  isSaved
                    ? 'border-[#C59B27] bg-[#C59B27]/15 text-[#C59B27]'
                    : 'border-black/15 dark:border-white/15 text-[#111111] dark:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}