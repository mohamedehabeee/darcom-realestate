import { useEffect, useState } from 'react';

export default function IntroScreen({ onComplete }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const doneTimer = setTimeout(() => onComplete(), 2500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => onComplete(), 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111111] text-white transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="text-center px-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[#C59B27] mb-3">
          Architectural Real Estate
        </p>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-[0.18em]">
          DAR<span className="text-[#C59B27]">COM</span>
        </h1>
        <div className="mt-6 w-48 h-[1px] bg-white/15 mx-auto overflow-hidden">
          <div className="h-full bg-[#C59B27] animate-[introBar_2s_ease-out_forwards]" />
        </div>
      </div>

      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 text-xs uppercase tracking-widest text-white/60 hover:text-[#C59B27] transition-colors cursor-pointer"
      >
        Skip Intro
      </button>

      <style>{`
        @keyframes introBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}