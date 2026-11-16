import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 360);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      title="Back to Top"
      className="fixed bottom-5 right-5 z-40 p-3 bg-[#111111] dark:bg-[#C59B27] text-[#C59B27] dark:text-[#111111] border border-[#C59B27] shadow-lg hover:shadow-[0_0_20px_rgba(197,155,39,0.5)] hover:-translate-y-1 active:scale-95 transition-all duration-200 cursor-pointer animate-fade-up"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}