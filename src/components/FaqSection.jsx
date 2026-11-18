import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    qEn: 'Are there any buyer commissions when purchasing a primary unit through DarCom?',
    qAr: 'هل يوجد أي عمولات على المشتري عند شراء وحدة أولية (Primary) عن طريق داركوم؟',
    aEn: 'Zero buyer commission on all primary developer launches. You pay the exact official developer price sheet and installment plan while receiving full legal and technical advisory from DarCom.',
    aAr: 'لا توجد أي عمولة نهائياً على المشتري في جميع مشاريع المطورين العقاريين (0% عمولة). تدفع نفس سعر وخطط سداد المطور الرسمية مع الحصول على استشارة عقارية وقانونية كاملة مجاناً.',
  },
  {
    qEn: 'How accurate is the monthly installment calculator on each property?',
    qAr: 'ما مدى دقة حاسبة الأقساط الشهرية الموجودة في صفحة كل عقار؟',
    aEn: 'Every property listing uses the developer’s live down-payment percentage and maximum installment years. You can also adjust the sliders inside the unit details modal to simulate custom down payments.',
    aAr: 'حاسبة الأقساط مربوطة بنسبة المقدم وعدد سنوات التقسيط الفعلية لكل مشروع، ويمكنك تعديل المؤشر داخل صفحة تفاصيل العقار لحساب القسط الشهري أو الربع سنوي حسب ميزانيتك.',
  },
  {
    qEn: 'How do I book a private on-site viewing or developer showroom visit?',
    qAr: 'كيف يمكنني حجز معاينة ميدانية للموقع أو زيارة مقر المطور؟',
    aEn: 'Open any property card, click “Book Viewing”, and select your preferred date. Your request appears immediately in our advisory command center and you can track its confirmation status under “My Account > My Viewings”.',
    aAr: 'افتح أي عقار واضغط على "حجز معاينة" واختار التاريخ المناسب. يظهر طلبك فوراً لفريق المبيعات ويمكنك متابعة تأكيد الموعد لحظياً من داخل "حسابي > معايناتي".',
  },
  {
    qEn: 'What is the difference between Ready-to-Move and Under-Construction payment plans?',
    qAr: 'ما الفرق بين أنظمة سداد الاستلام الفوري والوحدات تحت الإنشاء؟',
    aEn: 'Ready-to-Move units typically require a 15%–25% down payment with installments over 4–6 years and immediate key handover, whereas Under-Construction launches start from 5%–10% down payment over up to 8–10 years.',
    aAr: 'وحدات الاستلام الفوري تبدأ غالباً بمقدم 15% إلى 25% وتقسيط حتى 6 سنوات مع استلام المفتاح فوراً، بينما المشاريع تحت الإنشاء تبدأ بمقدم 5% أو 10% وتقسيط يصل إلى 8 أو 10 سنوات.',
  },
  {
    qEn: 'Can Egyptians abroad or international investors reserve a property online?',
    qAr: 'هل يمكن للمصريين بالخارج أو المستثمرين العرب حجز وحدة أونلاين؟',
    aEn: 'Yes. We arrange live video site tours, digital reservation forms, and direct bank-transfer payment schedules directly to the developer’s escrow account.',
    aAr: 'نعم بالتأكيد. نوفر جولات فيديو حية من أرض المشروع، وإجراءات حجز إلكترونية، وتحويلات بنكية مباشرة لحساب المطور العقاري المعتمد.',
  },
];

export default function FaqSection({ lang = 'en' }) {
  const [openIndex, setOpenIndex] = useState(0);
  const isAr = lang === 'ar';

  return (
    <section
      id="faq-section"
      className="max-w-5xl mx-auto px-4 sm:px-6 py-16 border-t border-black/10 dark:border-white/10"
    >
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C59B27]/10 border border-[#C59B27]/30 text-[#C59B27] text-xs font-semibold uppercase tracking-widest">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{isAr ? 'دليل المشتري الذكي' : 'Buyer Advisory FAQ'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#111111] dark:text-white">
          {isAr
            ? 'الأسئلة الشائعة حول الشراء والتقسيط العقاري'
            : 'Frequently Asked Real Estate Questions'}
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-black/15 dark:border-white/15 bg-white dark:bg-[#161616] transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full px-5 py-4 text-start flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-sm sm:text-base font-semibold text-[#111111] dark:text-white">
                  {isAr ? item.qAr : item.qEn}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#C59B27] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[#111111]/70 dark:text-white/70 leading-relaxed border-t border-black/5 dark:border-white/5">
                  {isAr ? item.aAr : item.aEn}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}