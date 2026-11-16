import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FeaturedSliderSection({ units, onSelectUnit }) {
  const featured = units.slice(0, 5);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const current = featured[index % featured.length];

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % featured.length);
  };

  return (
    <section className="relative w-full bg-[#090909] text-white overflow-hidden border-t border-white/10">
      <div className="relative min-h-[420px] sm:min-h-[500px] lg:min-h-[540px] flex items-center">
        {/* Diagonal Clipped Image */}
        <div
          key={current.id}
          className="absolute inset-0 md:right-[18%] overflow-hidden animate-fade-up"
          style={{
            clipPath: 'polygon(0 0, 86% 0, 100% 100%, 10% 100%)',
          }}
        >
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover opacity-80 md:opacity-90 transition-transform duration-700 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/90" />
        </div>

        {/* Content Overlay on the Right */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-14 sm:px-20 py-14 flex justify-end">
          <div className="max-w-md text-right space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C59B27] font-semibold">
              {current.type} • {current.city}
            </p>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase leading-none text-white">
              {current.compound}
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed line-clamp-2">
              {current.description}
            </p>

            <div className="pt-2">
              <button
                onClick={() => onSelectUnit(current)}
                className="gold-sheen inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#C59B27]/20 border border-[#C59B27] text-[#C59B27] hover:bg-[#C59B27] hover:text-[#111111] text-xs font-semibold uppercase tracking-[0.18em] transition-all cursor-pointer"
              >
                VIEW PROPERTY
              </button>
            </div>
          </div>
        </div>

        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          aria-label="Previous property"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-[#111111] shadow-lg flex items-center justify-center hover:bg-[#C59B27] active:scale-90 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          aria-label="Next property"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-[#111111] shadow-lg flex items-center justify-center hover:bg-[#C59B27] active:scale-90 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}