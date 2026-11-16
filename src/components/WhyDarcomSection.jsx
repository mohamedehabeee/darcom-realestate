import { Scale, Calculator, CalendarCheck } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: Scale,
    title: 'Inspect & Compare',
    desc: 'Rotate the 3D villa model and compare up to 3 properties side-by-side with clear price per square meter.',
  },
  {
    num: '02',
    icon: Calculator,
    title: 'Calculate Exact Installments',
    desc: 'Adjust down payment, delivery percentage, and installment years live before committing to any unit.',
  },
  {
    num: '03',
    icon: CalendarCheck,
    title: 'Book a Verified Viewing',
    desc: 'Schedule an on-site visit in seconds or reach out directly via WhatsApp with full property details.',
  },
];

export default function WhyDarcomSection() {
  return (
    <section className="border-t border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
            How It Works
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold mt-1 text-[#111111] dark:text-white">
            Built for Clear Decisions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="gold-glow-hover p-6 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 hover:border-[#C59B27] transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-widest text-[#C59B27]">
                    {item.num}
                  </span>
                  <Icon className="w-5 h-5 text-[#C59B27]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111111] dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-[#111111]/70 dark:text-white/70 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}