import { Building2, ArrowUpRight, ShieldCheck } from 'lucide-react';

const DEVELOPERS = [
  {
    id: 'emaar',
    nameEn: 'Emaar Misr',
    nameAr: 'إعمار مصر',
    tagEn: 'Mivida • Marassi • Belle Vie',
    tagAr: 'ميفيدا • مراسي • بيل في',
    filterKeyword: 'Mivida',
    city: 'New Cairo',
    projectsCount: 14,
    est: '2005',
  },
  {
    id: 'sodic',
    nameEn: 'SODIC',
    nameAr: 'سوديك العقارية',
    tagEn: 'Villette • Allegria • Eastown',
    tagAr: 'فيليت • أليجريا • إيست تاون',
    filterKeyword: 'Allegria',
    city: 'Sheikh Zayed',
    projectsCount: 18,
    est: '1996',
  },
  {
    id: 'palmhills',
    nameEn: 'Palm Hills',
    nameAr: 'بالم هيلز للتعمير',
    tagEn: 'Palm Hills • Badya • Hacienda',
    tagAr: 'بالم هيلز • بادية • هاسيندا',
    filterKeyword: 'Hacienda',
    city: 'North Coast',
    projectsCount: 22,
    est: '1997',
  },
  {
    id: 'mountainview',
    nameEn: 'Mountain View',
    nameAr: 'ماونتن فيو',
    tagEn: 'iCity • Hyde Park • Ras El Hikma',
    tagAr: 'آي سيتي • هايد بارك • رأس الحكمة',
    filterKeyword: 'Hyde Park',
    city: 'New Cairo',
    projectsCount: 16,
    est: '2005',
  },
  {
    id: 'ora',
    nameEn: 'ORA Developers',
    nameAr: 'أورا ديفلوبرز',
    tagEn: 'ZED East • ZED West • Silversands',
    tagAr: 'زد إيست • زد ويست • سيلفر ساندس',
    filterKeyword: 'Sheikh Zayed',
    city: 'Sheikh Zayed',
    projectsCount: 9,
    est: '2018',
  },
  {
    id: 'ilmonte',
    nameEn: 'Tatweer Misr',
    nameAr: 'تطوير مصر',
    tagEn: 'Il Monte Galala • Fouka Bay • Bloomfields',
    tagAr: 'المونت جلالة • فوكا باي • بلوم فيلدز',
    filterKeyword: 'Il Monte Galala',
    city: 'Ain Sokhna',
    projectsCount: 11,
    est: '2014',
  },
];

export default function DevelopersSection({ lang = 'en', onSelectDeveloper }) {
  const isAr = lang === 'ar';

  return (
    <section
      id="developers-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-black/10 dark:border-white/10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#C59B27] font-semibold">
            {isAr ? 'شركاء النجاح المعتمدون' : 'Authorized Strategic Partners'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold mt-1 text-[#111111] dark:text-white">
            {isAr ? 'كبار المطورين العقاريين في مصر' : 'Egypt’s Tier-1 Master Developers'}
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#C59B27]/40 bg-[#C59B27]/10 text-xs font-semibold text-[#C59B27]">
          <ShieldCheck className="w-4 h-4" />
          <span>
            {isAr
              ? 'اضغط على أي مطور لعرض مشاريعه المتاحة'
              : 'Click any developer to filter verified listings'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEVELOPERS.map((dev) => (
          <button
            key={dev.id}
            type="button"
            onClick={() => onSelectDeveloper?.(dev)}
            className="group text-start p-6 bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 hover:border-[#C59B27] dark:hover:border-[#C59B27] transition-all duration-300 flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 bg-[#111111] dark:bg-[#C59B27]/15 border border-[#C59B27]/40 flex items-center justify-center text-[#C59B27] shrink-0 group-hover:bg-[#C59B27] group-hover:text-[#111111] transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] uppercase tracking-wider px-2.5 py-1 bg-[#FAF8F5] dark:bg-[#111111] border border-black/10 dark:border-white/10 text-[#111111]/70 dark:text-white/70 font-semibold">
                {isAr ? `${dev.projectsCount}+ مشروع` : `${dev.projectsCount}+ Compounds`}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#111111] dark:text-white group-hover:text-[#C59B27] transition-colors flex items-center justify-between">
                <span>{isAr ? dev.nameAr : dev.nameEn}</span>
                <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </h3>
              <p className="text-xs text-[#111111]/65 dark:text-white/65 mt-1.5">
                {isAr ? dev.tagAr : dev.tagEn}
              </p>
            </div>

            <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] text-[#111111]/55 dark:text-white/55">
              <span>{isAr ? `تأسست ${dev.est}` : `Est. ${dev.est}`}</span>
              <span className="text-[#C59B27] font-semibold">
                {isAr ? 'استكشف الوحدات ←' : 'Explore Units →'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}