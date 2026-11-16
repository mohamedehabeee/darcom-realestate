import UnitCard from '../components/UnitCard';

export default function SavedUnits({
  units,
  savedIds,
  compareIds,
  onToggleSave,
  onToggleCompare,
  onSelectUnit,
  onBackHome,
}) {
  const savedList = units.filter((u) => savedIds.includes(u.id));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
            Your Shortlist
          </p>
          <h2 className="text-2xl font-semibold text-[#111111] dark:text-white mt-1">
            Saved Properties ({savedList.length})
          </h2>
        </div>

        <button
          onClick={onBackHome}
          className="px-4 py-2 border border-black/15 dark:border-white/15 text-xs font-semibold text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
        >
          Back to Listings
        </button>
      </div>

      {savedList.length === 0 ? (
        <div className="py-16 text-center border border-black/10 dark:border-white/10 bg-white dark:bg-[#161616]">
          <p className="text-sm text-[#111111]/65 dark:text-white/65 mb-4">
            You haven&apos;t saved any properties yet.
          </p>
          <button
            onClick={onBackHome}
            className="px-5 py-2.5 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedList.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              isSaved={true}
              isCompared={compareIds.includes(unit.id)}
              onToggleSave={onToggleSave}
              onToggleCompare={onToggleCompare}
              onSelect={onSelectUnit}
            />
          ))}
        </div>
      )}
    </section>
  );
}