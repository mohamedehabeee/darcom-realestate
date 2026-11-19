import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Calendar,
  CheckCircle2,
  Calculator,
  Phone,
  MessageCircle,
  ShieldCheck,
  Bell,
  ChevronLeft,
  ChevronRight,
  Images,
  FileDown,
  ZoomIn,
} from 'lucide-react';
import PriceAlertModal from './PriceAlertModal';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

export default function UnitDetails({
  unit,
  siteSettings,
  currentUser,
  isAr = false,
  isSaved,
  onToggleSave,
  onClose,
  onBookViewing,
}) {
  if (!unit) return null;

  const gallery = useMemo(() => {
    const raw = [
      ...(unit.image ? [unit.image] : []),
      ...(Array.isArray(unit.gallery) ? unit.gallery : []),
    ];
    const unique = [
      ...new Set(raw.map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean)),
    ];
    return unique.length ? unique : [FALLBACK_IMAGE];
  }, [unit]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [downPct, setDownPct] = useState(Number(unit.downPaymentPercent ?? 15));
  const [years, setYears] = useState(Math.max(1, Number(unit.installmentYears ?? 7)));
  const [showPriceAlert, setShowPriceAlert] = useState(false);

  // Keep image index and simulator in sync if unit changes or updates live
  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
    setDownPct(Number(unit.downPaymentPercent ?? 15));
    setYears(Math.max(1, Number(unit.installmentYears ?? 7)));
  }, [unit.id]);

  useEffect(() => {
    if (activeIndex >= gallery.length) {
      setActiveIndex(0);
    }
  }, [gallery.length, activeIndex]);

  // Keyboard navigation for Full-Screen Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % gallery.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, gallery.length]);

  const activeImg = gallery[activeIndex] || FALLBACK_IMAGE;

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % gallery.length);
  };

  const price = Number(unit.price || 0);
  const area = Math.max(1, Number(unit.area || 1));
  const pricePerSqm = Math.round(price / area);

  const installmentPlan = useMemo(() => {
    const downAmount = Math.round((price * downPct) / 100);
    const remaining = Math.max(0, price - downAmount);
    const totalMonths = Math.max(1, years * 12);
    const monthly = Math.round(remaining / totalMonths);
    const quarterly = monthly * 3;
    return { downAmount, remaining, monthly, quarterly };
  }, [price, downPct, years]);

  const fmt = (n) => new Intl.NumberFormat('en-EG').format(n);
  const whatsappNumber = (siteSettings?.whatsapp || '201065347544').replace(/\D/g, '');
  const advisorPhone = siteSettings?.phone || '+20 106 534 7544';
  const advisorEmail = siteSettings?.email || 'info@darcom.eg';

  const whatsappMessage = useMemo(() => {
    if (isAr) {
      const lines = [
        'مرحباً فريق *DarCom* العقاري، أنا مهتم بالعقار التالي:',
        '',
        `🏠 *العقار:* ${unit.title}`,
        `📍 *الموقع:* ${unit.compound} - ${unit.city}`,
        `🏷️ *النوع / الغرض:* ${unit.type} (${unit.purpose === 'Rent' ? 'للإيجار' : 'للبيع'})`,
        `📐 *المساحة:* ${unit.area} م²`,
        `🛏️ *الغرف والحمامات:* ${unit.bedrooms} غرف | ${unit.bathrooms} حمام`,
        `📅 *الاستلام:* ${unit.delivery || 'استلام فوري'}`,
        `💰 *السعر:* ${fmt(price)} ج.م${unit.purpose === 'Rent' ? ' / شهرياً' : ''}`,
      ];

      if (unit.purpose === 'Buy') {
        lines.push(
          `📊 *متوسط سعر المتر:* ${fmt(pricePerSqm)} ج.م / م²`,
          '',
          '*خطة السداد المختارة من الحاسبة:*',
          `• المقدم (${downPct}%): ${fmt(installmentPlan.downAmount)} ج.م`,
          `• مدة التقسيط: ${years} سنوات`,
          `• القسط الشهري التقديري: ${fmt(installmentPlan.monthly)} ج.م`,
          `• القسط الربع سنوي التقديري: ${fmt(installmentPlan.quarterly)} ج.م`
        );
      }

      lines.push('', 'أرجو التواصل معي لتفاصيل أكتر وحجز موعد للمعاينة.');
      return lines.join('\n');
    }

    const lines = [
      'Hello *DarCom Advisory*, I am interested in the following property:',
      '',
      `🏠 *Property:* ${unit.title}`,
      `📍 *Location:* ${unit.compound}, ${unit.city}`,
      `🏷️ *Type / Purpose:* ${unit.type} (${unit.purpose === 'Rent' ? 'For Rent' : 'For Sale'})`,
      `📐 *Built Area:* ${unit.area} m²`,
      `🛏️ *Specs:* ${unit.bedrooms} Bedrooms | ${unit.bathrooms} Bathrooms`,
      `📅 *Delivery:* ${unit.delivery || 'Ready to Move'}`,
      `💰 *Price:* ${fmt(price)} EGP${unit.purpose === 'Rent' ? ' / month' : ''}`,
    ];

    if (unit.purpose === 'Buy') {
      lines.push(
        `📊 *Avg. Price/m²:* ${fmt(pricePerSqm)} EGP / m²`,
        '',
        '*Selected Payment Plan:*',
        `• Down Payment (${downPct}%): ${fmt(installmentPlan.downAmount)} EGP`,
        `• Duration: ${years} Years`,
        `• Est. Monthly: ${fmt(installmentPlan.monthly)} EGP`,
        `• Est. Quarterly: ${fmt(installmentPlan.quarterly)} EGP`
      );
    }

    lines.push('', 'Please contact me with full details and to schedule a private viewing.');
    return lines.join('\n');
  }, [unit, isAr, price, pricePerSqm, downPct, years, installmentPlan]);

  const whatsappText = encodeURIComponent(whatsappMessage);

  // Branded Payment Plan PDF Generator (Zero dependencies, full RTL/LTR support)
  const handleDownloadPaymentPlanPdf = () => {
    const printWin = window.open('', '_blank', 'width=900,height=750');
    if (!printWin) return;

    const today = new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const currency = isAr ? 'ج.م' : 'EGP';
    const dir = isAr ? 'rtl' : 'ltr';

    const paymentSection =
      unit.purpose === 'Buy'
        ? `
        <div class="card">
          <div class="card-title">${isAr ? 'خطة السداد المختارة' : 'SELECTED PAYMENT PLAN'}</div>
          <table>
            <tr>
              <td>${isAr ? 'السعر الإجمالي' : 'Total Unit Price'}</td>
              <td class="val">${fmt(price)} ${currency}</td>
            </tr>
            <tr>
              <td>${isAr ? 'متوسط سعر المتر' : 'Average Price / m²'}</td>
              <td class="val">${fmt(pricePerSqm)} ${currency} / m²</td>
            </tr>
            <tr>
              <td>${isAr ? `الدفعة المقدمة (${downPct}%)` : `Down Payment (${downPct}%)`}</td>
              <td class="val gold">${fmt(installmentPlan.downAmount)} ${currency}</td>
            </tr>
            <tr>
              <td>${isAr ? 'المبلغ المتبقي للتقسيط' : 'Remaining Balance'}</td>
              <td class="val">${fmt(installmentPlan.remaining)} ${currency}</td>
            </tr>
            <tr>
              <td>${isAr ? 'مدة التقسيط' : 'Installment Duration'}</td>
              <td class="val">${years} ${isAr ? 'سنوات' : 'Years'} (${years * 12} ${isAr ? 'شهر' : 'Months'})</td>
            </tr>
            <tr class="highlight">
              <td>${isAr ? 'القسط الشهري التقديري' : 'Estimated Monthly Installment'}</td>
              <td class="val">${fmt(installmentPlan.monthly)} ${currency}</td>
            </tr>
            <tr>
              <td>${isAr ? 'القسط الربع سنوي التقديري' : 'Estimated Quarterly Installment'}</td>
              <td class="val gold">${fmt(installmentPlan.quarterly)} ${currency}</td>
            </tr>
          </table>
        </div>
      `
        : `
        <div class="card">
          <div class="card-title">${isAr ? 'ملخص الإيجار' : 'RENTAL SUMMARY'}</div>
          <table>
            <tr class="highlight">
              <td>${isAr ? 'الإيجار الشهري' : 'Monthly Rent'}</td>
              <td class="val">${fmt(price)} ${currency} / ${isAr ? 'شهر' : 'month'}</td>
            </tr>
          </table>
        </div>
      `;

    const html = `<!doctype html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>DarCom - ${unit.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, Arial, sans-serif;
      color: #111111;
      background: #ffffff;
      padding: 32px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #C59B27;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 0.2em;
    }
    .brand span { color: #C59B27; }
    .meta { font-size: 12px; color: #555; text-align: ${isAr ? 'left' : 'right'}; }
    .hero {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 20px;
      margin-bottom: 24px;
      align-items: center;
    }
    .hero img {
      width: 220px;
      height: 150px;
      object-fit: cover;
      border: 1px solid #ddd;
    }
    .loc { color: #C59B27; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    h1 { font-size: 22px; margin: 6px 0 12px; }
    .specs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .spec-box {
      background: #FAF8F5;
      border: 1px solid #e5e2dc;
      padding: 8px 10px;
    }
    .spec-lbl { font-size: 10px; color: #666; text-transform: uppercase; }
    .spec-val { font-size: 13px; font-weight: 700; margin-top: 2px; }
    .card {
      border: 1px solid #e5e2dc;
      background: #FAF8F5;
      padding: 18px 20px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: #C59B27;
      margin-bottom: 12px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    td { padding: 9px 10px; border-bottom: 1px solid #e5e2dc; }
    tr:last-child td { border-bottom: none; }
    td.val { font-weight: 700; text-align: ${isAr ? 'left' : 'right'}; }
    td.gold { color: #9c7814; }
    tr.highlight td { background: #111111; color: #ffffff; font-size: 14px; }
    .footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #666;
    }
    @media print {
      body { padding: 16px; }
      tr.highlight td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .spec-box, .card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">DAR<span>COM</span></div>
    <div class="meta">
      <div><strong>${isAr ? 'عرض سعر وخطة سداد' : 'Official Payment Plan Sheet'}</strong></div>
      <div>${today}</div>
    </div>
  </div>

  <div class="hero">
    <img src="${activeImg}" alt="${unit.title}" />
    <div>
      <div class="loc">${unit.compound} • ${unit.city}</div>
      <h1>${unit.title}</h1>
      <div class="specs">
        <div class="spec-box">
          <div class="spec-lbl">${isAr ? 'المساحة' : 'Area'}</div>
          <div class="spec-val">${unit.area} m²</div>
        </div>
        <div class="spec-box">
          <div class="spec-lbl">${isAr ? 'الغرف' : 'Bedrooms'}</div>
          <div class="spec-val">${unit.bedrooms}</div>
        </div>
        <div class="spec-box">
          <div class="spec-lbl">${isAr ? 'الحمامات' : 'Bathrooms'}</div>
          <div class="spec-val">${unit.bathrooms}</div>
        </div>
        <div class="spec-box">
          <div class="spec-lbl">${isAr ? 'الاستلام' : 'Delivery'}</div>
          <div class="spec-val">${unit.delivery || 'Ready to Move'}</div>
        </div>
      </div>
    </div>
  </div>

  ${paymentSection}

  <div class="footer">
    <div><strong>DarCom Real Estate Advisory</strong> • ${advisorPhone} • ${advisorEmail}</div>
    <div>${isAr ? 'الأرقام تقديرية وقابلة للتحديث حسب سياسة المطور' : 'Figures are indicative and subject to developer availability.'}</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>`;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#151515] border border-black/15 dark:border-white/15 max-w-4xl w-full max-h-[92vh] overflow-y-auto animate-modal-in">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#151515]/95 backdrop-blur-sm px-5 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#111111] text-white dark:bg-[#C59B27] dark:text-[#111111]">
              {unit.purpose === 'Rent' ? 'For Rent' : 'For Sale'}
            </span>
            <span
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                unit.status === 'Sold'
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  : unit.status === 'Reserved'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {unit.status || 'Available'}
            </span>
            {unit.badge && (
              <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#C59B27]/20 text-[#C59B27]">
                {unit.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave?.(String(unit.id))}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold cursor-pointer transition-colors ${
                isSaved
                  ? 'bg-[#C59B27] border-[#C59B27] text-[#111111]'
                  : 'border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Image & Thumbnails */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="space-y-3">
            <div
              onClick={() => setLightboxOpen(true)}
              title={isAr ? 'اضغط لتكبير الصورة' : 'Click to view full screen'}
              className="relative h-64 sm:h-96 w-full overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 group cursor-zoom-in"
            >
              <img
                src={activeImg}
                alt={unit.title}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(true);
                }}
                className="absolute top-3 right-3 px-2.5 py-1.5 bg-black/65 hover:bg-[#C59B27] text-white hover:text-[#111111] text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>{isAr ? 'تكبير' : 'Full Screen'}</span>
              </button>

              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-[#C59B27] text-white hover:text-[#111111] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-[#C59B27] text-white hover:text-[#111111] transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 text-white text-xs font-semibold inline-flex items-center gap-1.5">
                    <Images className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>
                      {activeIndex + 1} / {gallery.length}
                    </span>
                  </div>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`w-20 h-14 shrink-0 overflow-hidden border-2 cursor-pointer transition-all ${
                      activeIndex === idx
                        ? 'border-[#C59B27] scale-105'
                        : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Bar */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-black/10 dark:border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#C59B27] font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {unit.compound} • {unit.city}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111111] dark:text-white">
                {unit.title}
              </h2>
            </div>

            <div className="text-start sm:text-end">
              <p className="text-2xl sm:text-3xl font-bold text-[#111111] dark:text-white">
                {fmt(price)} EGP
                {unit.purpose === 'Rent' && (
                  <span className="text-xs font-normal text-[#111111]/60 dark:text-white/60">
                    {' '}
                    / month
                  </span>
                )}
              </p>
              {unit.purpose === 'Buy' && (
                <p className="text-xs text-[#C59B27] font-semibold mt-0.5">
                  Avg. {fmt(pricePerSqm)} EGP / m²
                </p>
              )}
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#111111] border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#111111]/60 dark:text-white/60">
                <Maximize2 className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Built Area</span>
              </div>
              <p className="text-sm font-bold text-[#111111] dark:text-white mt-1">
                {unit.area} m²
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#111111] border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#111111]/60 dark:text-white/60">
                <BedDouble className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Bedrooms</span>
              </div>
              <p className="text-sm font-bold text-[#111111] dark:text-white mt-1">
                {unit.bedrooms} Bedrooms
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#111111] border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#111111]/60 dark:text-white/60">
                <Bath className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Bathrooms</span>
              </div>
              <p className="text-sm font-bold text-[#111111] dark:text-white mt-1">
                {unit.bathrooms} Bathrooms
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#111111] border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#111111]/60 dark:text-white/60">
                <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Delivery</span>
              </div>
              <p className="text-sm font-bold text-[#111111] dark:text-white mt-1">
                {unit.delivery || 'Ready to Move'}
              </p>
            </div>
          </div>

          {/* Description & Features */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#C59B27] mb-2">
                  Architectural Overview
                </h3>
                <p className="text-sm text-[#111111]/75 dark:text-white/75 leading-relaxed">
                  {unit.description ||
                    `${unit.type} located in ${unit.compound}, ${unit.city}, offering premium finishing, prime community access, and verified legal documentation.`}
                </p>
              </div>

              {Array.isArray(unit.features) && unit.features.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-[#C59B27] mb-2.5">
                    Amenities & Features
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {unit.features.map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-[#111111]/80 dark:text-white/80 p-2 bg-[#FAF8F5] dark:bg-[#111111] border border-black/5 dark:border-white/5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Installment Simulator */}
            <div className="lg:col-span-5 p-5 bg-[#FAF8F5] dark:bg-[#111111] border border-black/15 dark:border-white/15 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#111111] dark:text-white flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-[#C59B27]" />
                  <span>
                    {unit.purpose === 'Buy' ? 'Live Installment Simulator' : 'Rental Summary'}
                  </span>
                </h3>
                <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
              </div>

              {unit.purpose === 'Buy' ? (
                <>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Down Payment ({downPct}%)</span>
                        <span className="text-[#C59B27]">
                          {fmt(installmentPlan.downAmount)} EGP
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={downPct}
                        onChange={(e) => setDownPct(Number(e.target.value))}
                        className="w-full accent-[#C59B27] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Installment Duration</span>
                        <span className="text-[#C59B27]">{years} Years</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        step="1"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="w-full accent-[#C59B27] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#111111]/60 dark:text-white/60">
                        Est. Monthly
                      </span>
                      <span className="text-lg font-bold text-[#111111] dark:text-white">
                        {fmt(installmentPlan.monthly)} EGP
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs border-t border-black/10 dark:border-white/10 pt-2">
                      <span className="text-[#111111]/60 dark:text-white/60">
                        Est. Quarterly
                      </span>
                      <span className="font-semibold text-[#C59B27]">
                        {fmt(installmentPlan.quarterly)} EGP
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 text-xs space-y-2">
                  <p className="font-semibold text-[#111111] dark:text-white">
                    Monthly Rent: {fmt(price)} EGP
                  </p>
                  <p className="text-[#111111]/65 dark:text-white/65">
                    Includes compound security & maintenance access. Contact our leasing desk for contract duration options.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={unit.status === 'Sold'}
                  onClick={() => onBookViewing?.(unit)}
                  className="w-full py-3 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  {unit.status === 'Sold' ? 'Property Sold' : 'Schedule Private Viewing'}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPaymentPlanPdf}
                  className="w-full py-2.5 px-3 border border-black/20 dark:border-white/20 text-[#111111] dark:text-white hover:border-[#C59B27] hover:text-[#C59B27] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#C59B27]" />
                  <span>{isAr ? 'تحميل خطة السداد PDF' : 'Download Payment Plan PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPriceAlert(true)}
                  className="w-full py-2.5 px-3 border border-[#C59B27]/60 text-[#C59B27] hover:bg-[#C59B27]/10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isAr ? 'بلّغني لو السعر نزل' : 'Notify Me on Price Drop'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${advisorPhone.replace(/\s+/g, '')}`}
                    className="py-2.5 px-3 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>Call Direct</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Image Lightbox */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[70] bg-black/95 flex flex-col items-center justify-center p-4"
        >
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#C59B27]">
              {unit.title} — {activeIndex + 1} / {gallery.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 bg-white/10 hover:bg-[#C59B27] text-white hover:text-[#111111] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl w-full flex items-center justify-center"
          >
            <img
              src={activeImg}
              alt={unit.title}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
              className="max-h-[80vh] max-w-full object-contain border border-white/15 shadow-2xl"
            />

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-[#C59B27] text-white hover:text-[#111111] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-[#C59B27] text-white hover:text-[#111111] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {gallery.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-4 flex items-center gap-2 overflow-x-auto max-w-full pb-1"
            >
              {gallery.map((imgUrl, idx) => (
                <button
                  key={`lb-${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`w-16 h-12 shrink-0 overflow-hidden border-2 cursor-pointer transition-all ${
                    activeIndex === idx
                      ? 'border-[#C59B27] opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showPriceAlert && (
        <PriceAlertModal
          unit={unit}
          user={currentUser}
          isAr={isAr}
          onClose={() => setShowPriceAlert(false)}
        />
      )}
    </div>
  );
}