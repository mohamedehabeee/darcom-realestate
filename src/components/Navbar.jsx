import { useState } from 'react';
import { Heart, Scale, ShieldCheck, Sun, Moon, LogIn, LogOut, User, Menu, X } from 'lucide-react';

export default function Navbar({
  activeView,
  onNavigate,
  savedCount,
  compareCount,
  darkMode,
  onToggleDark,
  currentUser,
  onOpenAuth,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (view) => {
    setMenuOpen(false);
    onNavigate(view);
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
          className="darcom-logo text-xl font-semibold tracking-[0.15em] text-[#111111] dark:text-white cursor-pointer"
        >
          DAR<span className="gold-part">COM</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navBtn('home', 'Properties')}
          <button
            onClick={() => handleNav('saved')}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${
              activeView === 'saved'
                ? 'text-[#C59B27]'
                : 'text-[#111111]/70 dark:text-white/70 hover:text-[#111111] dark:hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved</span>
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
            <span>Compare</span>
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
              <span>Admin</span>
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleDark}
            aria-label="Toggle theme"
            className="p-2 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white">
                <User className="w-3.5 h-3.5 text-[#C59B27]" />
                {currentUser.name}
              </span>
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
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="md:hidden p-2 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-black/10 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#111111] px-4 py-4 flex flex-col gap-3">
          <button
            onClick={() => handleNav('home')}
            className="text-left text-sm font-medium py-1.5 text-[#111111] dark:text-white hover:text-[#C59B27]"
          >
            Properties
          </button>
          <button
            onClick={() => handleNav('saved')}
            className="flex items-center justify-between text-sm font-medium py-1.5 text-[#111111] dark:text-white hover:text-[#C59B27]"
          >
            <span className="inline-flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#C59B27]" />
              Saved
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
              Compare
            </span>
            {compareCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-semibold">
                {compareCount}
              </span>
            )}
          </button>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleNav('admin')}
              className="inline-flex items-center gap-2 text-sm font-medium py-1.5 text-[#C59B27]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}