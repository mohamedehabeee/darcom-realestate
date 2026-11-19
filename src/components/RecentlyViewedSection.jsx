import React from 'react';
import { Clock, Trash2, MapPin, ArrowUpRight } from 'lucide-react';

export default function RecentlyViewedSection({
  units,
  recentIds,
  isAr,
  onSelectUnit,
  onClearHistory,
}) {
  // ترتيب الوحدات حسب أحدث مشاهدة
  const recentUnits = recentIds
    .map((id) => units.find((u) => String(u.id) === String(id)))
    .filter(Boolean);

  if (recentUnits.length === 0) return null;

  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {isAr ? 'شاهدته مؤخراً' : 'Recently Viewed'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              {recentUnits.length}
            </span>
          </div>

          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-500 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isAr ? 'مسح السجل' : 'Clear History'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentUnits.map((unit) => (
            <div
              key={unit.id}
              onClick={() => onSelectUnit(unit)}
              className="group cursor-pointer flex gap-4 p-3 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 transition-all shadow-sm hover:shadow-md"
            >
              <img
                src={unit.image}
                alt={unit.title}
                className="w-24 h-24 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                      {unit.title}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 shrink-0 transition" />
                  </div>
                  <p className="flex items-center gap-1 text-xs text-zinc-500 mt-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {unit.compound}، {unit.city}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                    {Number(unit.price).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {unit.area} {isAr ? 'م²' : 'm²'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}