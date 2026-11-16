import { Search, RotateCcw } from 'lucide-react';

export default function FilterBar({ filters, onChange, onReset }) {
  const inputStyle =
    'w-full px-3 py-2.5 text-sm bg-white dark:bg-[#181818] border border-black/15 dark:border-white/15 text-[#111111] dark:text-white focus:outline-none focus:border-[#C59B27]';

  return (
    <div className="p-4 sm:p-5 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-[#111111]/40 dark:text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by compound or property name..."
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            className={`${inputStyle} pl-9`}
          />
        </div>

        <select
          value={filters.city}
          onChange={(e) => onChange('city', e.target.value)}
          className={inputStyle}
        >
          <option value="All">All Cities</option>
          <option value="New Cairo">New Cairo</option>
          <option value="Sheikh Zayed">Sheikh Zayed</option>
          <option value="New Capital">New Capital</option>
          <option value="Maadi">Maadi</option>
          <option value="North Coast">North Coast</option>
          <option value="Ain Sokhna">Ain Sokhna</option>
        </select>

        <select
          value={filters.purpose}
          onChange={(e) => onChange('purpose', e.target.value)}
          className={inputStyle}
        >
          <option value="All">Buy & Rent</option>
          <option value="Buy">For Sale</option>
          <option value="Rent">For Rent</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => onChange('type', e.target.value)}
          className={inputStyle}
        >
          <option value="All">All Types</option>
          <option value="Villa">Villa</option>
          <option value="Apartment">Apartment</option>
          <option value="Chalet">Chalet</option>
          <option value="Office">Office</option>
        </select>

        <div className="flex gap-2">
          <select
            value={filters.sort}
            onChange={(e) => onChange('sort', e.target.value)}
            className={inputStyle}
          >
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="area-desc">Area: Largest</option>
          </select>

          <button
            onClick={onReset}
            title="Reset Filters"
            className="px-3 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}