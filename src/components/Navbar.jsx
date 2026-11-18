import { useState } from 'react';
import {
  Heart,
  Scale,
  ShieldCheck,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  Globe,
  MapPin,
} from 'lucide-react';

export default function Navbar({
  activeView,
  onNavigate,
  onQuickJump,
  savedCount,
  compareCount,
  darkMode,
  onToggleDark,
  lang = 'en',
  onToggleLang,
  currentUser,
  onOpenAuth,
  onOpenAccount,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAr = lang === 'ar';

  const t = {
    properties: isAr ? 'العقارات' : 'Properties',
    locations: isAr ? 'المناطق' : 'Locations',
    developers: isAr ? 'المطورين' : 'Developers',
    reviews: isAr ? 'آراء العملاء' : 'Reviews',
    faq: isAr ? 'الأسئلة' : 'FAQ',
    saved: isAr ? 'المفضلة' : 'Saved',
    compare: isAr ? 'مقارنة' : 'Compare',
    admin: isAr ? 'الأدمن' : 'Admin',
    signIn: isAr ? 'تسجيل الدخول' : 'Sign In',
    myAccount: isAr ? 'حسابي' : 'My Account',
  };

  const handleNav = (view) => {
    setMenuOpen(false);
    onNavigate(view);
  };

  const handleSectionClick = (sectionId) => {
    setMenuOpen(false);
    if (onQuickJump) {
      onQuickJump(sectionId);
    } else {
      onNavigate('home');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  };

  const navBtn = (view, label) => (
    <button
      onClick={() => handleNav(view)}
      className={`text-sm font-medium transition-colors cursor-pointer ${
        activeView === view
          ? 'text-[#C59B27]'
          : 'text-[#111111]/70 dark:text-white/70 hover:text-[#111111] dark:hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-[#FAF8F5]/95 dark:bg-[#111111]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <button
          onClick={() => handleNav('home')}
          className="darcom-logo text-xl font-semibold tracking-[0.15em] text-[#111111] dark:text-white cursor-pointer shrink-0"
        >
          DAR<span className="gold-part">COM</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5">
          {navBtn('home', t.properties)}

          <button
            type="button"
            onClick={() => handleSectionClick('locations-section')}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#111111]/70 dark:text-white/70 hover:text-[#C59B27] dark:hover:text-[#C59B27] transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>{t.locations}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSectionClick('developers-section')}
            className="text-sm font-medium text-[#111111]/70 dark:text-white/70 hover:text-[#C59B27] dark:hover:text-[#C59B27] transition-colors cursor-pointer"
          >
            {t.developers}
          </button>

          <button
            type="button"
            onClick={() => handleSectionClick('testimonials-section')}
            className="text-sm font-medium text-[#111111]/70 dark:text-white/70 hover:text-[#C59B27] dark:hover:text-[#C59B27] transition-colors cursor-pointer"
          >
            {t.reviews}
          </button>

          <button
            type="button"
            onClick={() => handleSectionClick('faq-section')}
            className="text-sm font-medium text-[#111111]/70 dark:text-white/70 hover:text-[#C59B27] dark:hover:text-[#C59B27] transition-colors cursor-pointer"
          >
            {t.faq}
          </button>

          <span className="h-4 w-[1px] bg-black/15 dark:bg-white/15" />

          <button
            onClick={() => handleNav('saved')}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${
              activeView === 'saved'
                ? 'text-[#C59B27]'
                : 'text-[#111111]/70 dark:text-white/70 hover:text-[#111111] dark:hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t.saved}</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.5 text-[11px] bg-[#C59B27] text-[#111111] font-semibold">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('compare')}
            className="flex items-center gap-1.5 text-sm font-medium text-[#111111]/70 dark:text-white/70 hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>{t.compare}</span>
            {compareCount > 0 && (
              <span className="px-1.5 py-0.5 text-[11px] bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-semibold">
                {compareCount}
              </span>
            )}
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${
                activeView === 'admin'
                  ? 'text-[#C59B27]'
                  : 'text-[#111111]/70 dark:text-white/70 hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.admin}</span>
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Switcher EN / عربي */}
          <button
            type="button"
            onClick={onToggleLang}
            title="Switch Language"
            className="inline-flex items-center gap-1.5 px-2.5 py-2 border border-black/15 dark:border-white/15 text-xs font-bold text-[#111111] dark:text-white hover:border-[#C59B27] transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>

          <button
            onClick={onToggleDark}
            aria-label="Toggle theme"
            className="p-2 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAccount}
                title={t.myAccount}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-2 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#C59B27]" />
                <span className="hidden sm:inline">{currentUser.name}</span>
              </button>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.signIn}</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="lg:hidden p-2 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="lg:hidden border-t border-black/10 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#111111] px-4 py-4 flex flex-col gap-3">
          <button
            onClick={() => handleNav('home')}
            className="text-start text-sm font-medium py-1.5 text-[#111111] dark:text-white hover:text-[#C59B27]"
          >
            {t.properties}
          </button>
          <button
            onClick={() => handleSectionClick('locations-section')}
            className="text-start text-sm font-medium py-1.5 text-[#111111] dark:text-white hover:text-[#C59B27]"
          >
            {t.locations}
          </button>
          <button
            onClick={() => handleSectionClick('developers-section')}
            className="text-start text-sm font-medium py-1.5 text-[#111111] dark:text-white hover:text-[#C59B27]"
          >
            {t.developers}
          </button>
          <button
            onClick={() => handleSectionClick('testimonials-section')}
            className="text-start text-sm font-medium py-1.5 text-[#111111] dark:text-white hover:text-[#C59B27]"
          >
            {t.reviews}
          </button>
          <button
            onClick={() => handleSectionClick('faq-section')}
            className="text-start text-sm font-medium py-1.5 text-[#111111] dark:text-white hover:text-[#C59B27]"
          >
            {t.faq}
          </button>

          <button
            onClick={() => handleNav('saved')}
            className="flex items-center justify-between text-sm font-medium py-1.5 text-[#111111] dark:text-white hover:text-[#C59B27]"
          >
            <span className="inline-flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#C59B27]" />
              {t.saved}
            </span>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-[#C59B27] text-[#111111] font-semibold">
                {savedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleNav('compare')}
            className="flex items-center justify-between text-sm font-medium py-1.5 text-[#111111] dark:text-white hover:text-[#C59B27]"
          >
            <span className="inline-flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#C59B27]" />
              {t.compare}
            </span>
            {compareCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-semibold">
                {compareCount}
              </span>
            )}
          </button>
          {currentUser && (
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenAccount();
              }}
              className="inline-flex items-center gap-2 text-sm font-medium py-1.5 text-[#111111] dark:text-white hover:text-[#C59B27]"
            >
              <User className="w-4 h-4 text-[#C59B27]" />
              <span>
                {t.myAccount} ({currentUser.name})
              </span>
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleNav('admin')}
              className="inline-flex items-center gap-2 text-sm font-medium py-1.5 text-[#C59B27]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.admin}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}