import { MapPin, ArrowUpRight } from 'lucide-react';

const CITIES = [
  { name: 'New Cairo', subtitle: 'Fifth Settlement & Sodic East' },
  { name: 'Sheikh Zayed', subtitle: 'Zed West & Allegria' },
  { name: 'New Capital', subtitle: 'Il Bosco & Financial District' },
  { name: 'North Coast', subtitle: 'Marassi & Hacienda White' },
  { name: 'Ain Sokhna', subtitle: 'Il Monte Galala' },
  { name: 'Maadi', subtitle: 'Degla & Sarayat' },
];

export default function LocationsSection({ units, onSelectCity }) {
  return (
    <section className="border-t border-black/10 dark:border-white/10 bg-white dark:bg-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
            Prime Destinations
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold mt-1 text-[#111111] dark:text-white">
            Explore by Location
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CITIES.map((city) => {
            const count = units.filter((u) => u.city === city.name).length;
            return (
              <button
                key={city.name}
                onClick={() => onSelectCity(city.name)}
                className="group gold-glow-hover text-left p-5 bg-[#FAF8F5] dark:bg-[#181818] border border-black/10 dark:border-white/10 hover:border-[#C59B27] transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#C59B27] font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{count} {count === 1 ? 'Property' : 'Properties'}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#111111] dark:text-white group-hover:text-[#C59B27] transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-xs text-[#111111]/60 dark:text-white/60">
                    {city.subtitle}
                  </p>
                </div>

                <ArrowUpRight className="w-5 h-5 text-[#111111]/40 dark:text-white/40 group-hover:text-[#C59B27] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}