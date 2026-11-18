import { Heart, ArrowLeft } from 'lucide-react';
import UnitCard from '../components/UnitCard';

export default function SavedUnits({
  units = [],
  savedIds = [],
  compareIds = [],
  onToggleSave,
  onToggleCompare,
  onSelectUnit,
  onBackHome,
}) {
  const normalizedSaved = savedIds.map(String);
  const normalizedCompare = compareIds.map(String);

  const savedUnits = units.filter((u) => normalizedSaved.includes(String(u.id)));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
            Your Shortlist
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1 text-[#111111] dark:text-white">
            Saved Properties ({savedUnits.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-black/15 dark:border-white/15 text-xs font-semibold text-[#111111] dark:text-white hover:border-[#C59B27] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Listings</span>
        </button>
      </div>

      {savedUnits.length === 0 ? (
        <div className="py-20 text-center border border-black/10 dark:border-white/10 bg-white dark:bg-[#161616] space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#C59B27]/15 flex items-center justify-center text-[#C59B27]">
            <Heart className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-[#111111] dark:text-white">
              Your shortlist is currently empty
            </p>
            <p className="text-xs text-[#111111]/60 dark:text-white/60">
              Click the heart icon on any property card to save it to your account across all devices.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <span>Explore Properties</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              isSaved={true}
              isCompared={normalizedCompare.includes(String(unit.id))}
              onToggleSave={() => onToggleSave(String(unit.id))}
              onToggleCompare={() => onToggleCompare(String(unit.id))}
              onSelect={onSelectUnit}
            />
          ))}
        </div>
      )}
    </section>
  );
}