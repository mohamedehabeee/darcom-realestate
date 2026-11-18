import { Star, Quote, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    nameEn: 'Eng. Tarek El-Gamal',
    nameAr: 'م. طارق الجمل',
    roleEn: 'Purchased Standalone Villa • Mivida, New Cairo',
    roleAr: 'اشترى فيلا مستقلة • ميفيدا، القاهرة الجديدة',
    quoteEn:
      'The installment calculator and side-by-side comparison saved me weeks of broker calls. Every number was transparent before I even booked my site viewing.',
    quoteAr:
      'حاسبة الأقساط والمقارنة المباشرة وفروا عليا أسابيع من المكالمات. كل الأرقام والمقدمات كانت واضحة بالقرش قبل حتى ما أحجز المعاينة.',
    dealValue: '24.5M EGP',
    rating: 5,
  },
  {
    id: 2,
    nameEn: 'Dr. Mariam Soliman',
    nameAr: 'د. مريم سليمان',
    roleEn: 'Purchased Seafront Chalet • Hacienda Bay, North Coast',
    roleAr: 'اشترت شاليه صف أول • هاسيندا باي، الساحل الشمالي',
    quoteEn:
      'DarCom’s advisory team verified the delivery date and contract terms directly with the developer. Smooth reservation and zero hidden commissions.',
    quoteAr:
      'فريق داركوم راجع عقود الاستلام وجدول السداد مع المطور مباشرة. الحجز تم في يومين وبشفافية كاملة من غير أي عمولات مخفية.',
    dealValue: '15.2M EGP',
    rating: 5,
  },
  {
    id: 3,
    nameEn: 'Karim Abdel-Rahman',
    nameAr: 'أ. كريم عبد الرحمن',
    roleEn: 'Executive Office • Financial District, New Capital',
    roleAr: 'مقر إداري • الحي المالي، العاصمة الإدارية',
    quoteEn:
      'Having the interactive 3D tour and exact down-payment breakdown helped our board approve the New Capital office acquisition in record time.',
    quoteAr:
      'المعاينة ثلاثية الأبعاد وتفاصيل الدفعات ساعدت مجلس الإدارة عندنا يعتمد شراء المقر الجديد في العاصمة الإدارية في وقت قياسي.',
    dealValue: '11.4M EGP',
    rating: 5,
  },
];

export default function TestimonialsSection({ lang = 'en' }) {
  const isAr = lang === 'ar';

  return (
    <section
      id="testimonials-section"
      className="bg-[#111111] text-white py-16 px-4 sm:px-6 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#C59B27] font-semibold">
              {isAr ? 'قصص نجاح وصفقات موثقة' : 'Verified Client Closings'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold mt-1">
              {isAr ? 'آراء عملاء داركوم العقارية' : 'Trusted by Discerning Property Buyers'}
            </h2>
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 text-xs">
            <div className="flex items-center gap-0.5 text-[#C59B27]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#C59B27]" />
              ))}
            </div>
            <span className="font-semibold">
              {isAr ? '4.9/5 من +320 عملية شراء موثقة' : '4.9 / 5 across 320+ verified closings'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-[#181818] border border-white/10 hover:border-[#C59B27]/70 transition-all flex flex-col justify-between gap-6 relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#C59B27]">
                  {[...Array(item.rating)].map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-[#C59B27]" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#C59B27]/35" />
              </div>

              <p className="text-sm text-white/80 leading-relaxed">
                “{isAr ? item.quoteAr : item.quoteEn}”
              </p>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{isAr ? item.nameAr : item.nameEn}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C59B27]" />
                  </p>
                  <p className="text-[11px] text-white/55 mt-0.5">
                    {isAr ? item.roleAr : item.roleEn}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-[#C59B27]/15 border border-[#C59B27]/40 text-[#C59B27] text-[11px] font-bold shrink-0">
                  {item.dealValue}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}