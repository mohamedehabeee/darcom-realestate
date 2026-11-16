import { Heart, Scale, MapPin, BedDouble, Bath, Maximize2 } from 'lucide-react';

export default function UnitCard({
  unit,
  isSaved,
  isCompared,
  onToggleSave,
  onToggleCompare,
  onSelect,
}) {
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-EG').format(price) + (unit.purpose === 'Rent' ? ' EGP / mo' : ' EGP');

  const statusColors = {
    Available: 'bg-[#111111] text-white dark:bg-[#C59B27] dark:text-[#111111]',
    Reserved: 'bg-[#C59B27] text-[#111111]',
    Sold: 'bg-neutral-500 text-white',
  };

  return (
    <article className="group gold-glow-hover bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 hover:border-[#C59B27] hover:-translate-y-1.5 flex flex-col animate-fade-up">
      <div className="relative h-52 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <img
          src={unit.image}
          alt={unit.title}
          onClick={() => onSelect(unit)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
        />

        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusColors[unit.status] || statusColors.Available}`}>
            {unit.status}
          </span>
          <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-white/90 text-[#111111]">
            {unit.purpose}
          </span>
          {unit.badge && (
            <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[#C59B27] text-[#111111]">
              {unit.badge}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={() => onToggleSave(unit.id)}
            title="Save Unit"
            className={`p-2 border active:scale-90 transition-all duration-200 cursor-pointer ${
              isSaved
                ? 'bg-[#C59B27] border-[#C59B27] text-[#111111]'
                : 'bg-white/90 border-black/10 text-[#111111] hover:border-[#C59B27]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => onToggleCompare(unit.id)}
            title="Compare Unit"
            className={`p-2 border active:scale-90 transition-all duration-200 cursor-pointer ${
              isCompared
                ? 'bg-[#111111] border-[#111111] text-[#C59B27]'
                : 'bg-white/90 border-black/10 text-[#111111] hover:border-[#C59B27]'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#C59B27] font-medium mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {unit.compound} • {unit.city}
            </span>
          </div>
          <h3
            onClick={() => onSelect(unit)}
            className="text-lg font-semibold text-[#111111] dark:text-white hover:text-[#C59B27] transition-colors cursor-pointer line-clamp-1"
          >
            {unit.title}
          </h3>
          <p className="text-xl font-semibold text-[#111111] dark:text-white mt-2">
            {formatPrice(unit.price)}
          </p>
          {unit.purpose === 'Buy' && unit.installmentYears > 0 && (
            <p className="text-xs text-[#C59B27] font-medium mt-1">
              Est. ~
              {new Intl.NumberFormat('en-EG').format(
                Math.round(
                  (unit.price * (1 - (unit.downPaymentPercent || 15) / 100)) /
                    (unit.installmentYears * 12)
                )
              )}{' '}
              EGP / mo
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-[#111111]/70 dark:text-white/70">
          <span className="inline-flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-[#C59B27]" />
            {unit.area} m²
          </span>
          {unit.bedrooms > 0 && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-[#C59B27]" />
              {unit.bedrooms} Beds
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-[#C59B27]" />
            {unit.bathrooms} Baths
          </span>
          <button
            onClick={() => onSelect(unit)}
            className="group/btn inline-flex items-center gap-1 font-semibold text-[#111111] dark:text-[#C59B27] hover:underline cursor-pointer"
          >
            <span>Details</span>
            <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </article>
  );
}