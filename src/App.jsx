import { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutGrid, Map as MapIcon } from 'lucide-react';
import { supabase } from './services/supabaseClient';
import {
  DEFAULT_SITE_SETTINGS,
  getUnits,
  addUnit,
  updateUnit,
  updateUnitStatus,
  deleteUnit,
  resetUnits,
  getSavedIds,
  clearLocalSavedIds,
  toggleSavedId,
  syncSavedUnitsWithCloud,
  getBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getRegisteredClients,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
  getAdminActivityLogs,
  getSiteSettings,
  updateSiteSettings,
  getCurrentUser,
  getMfaStatus,
  logoutUser,
  getRecentlyViewedIds,
  addRecentlyViewedId,
  clearRecentlyViewedIds,
  fetchPriceAlerts,
  updatePriceAlertStatus,
  deletePriceAlert,
} from './services/realEstateService';
import IntroScreen from './components/IntroScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoShowcaseSection from './components/VideoShowcaseSection';
import FilterBar from './components/FilterBar';
import UnitCard from './components/UnitCard';
import PropertyMap from './components/PropertyMap';
import LocationsSection from './components/LocationsSection';
import DevelopersSection from './components/DevelopersSection';
import WhyDarcomSection from './components/WhyDarcomSection';
import FeaturedSliderSection from './components/FeaturedSliderSection';
import TestimonialsSection from './components/TestimonialsSection';
import FaqSection from './components/FaqSection';
import RecentlyViewedSection from './components/RecentlyViewedSection';
import ScrollReveal from './components/ScrollReveal';
import UnitDetails from './components/UnitDetails';
import CompareModal from './components/CompareModal';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import AccountModal from './components/AccountModal';
import PhonePromptModal from './components/PhonePromptModal';
import AdminMfaGate from './components/AdminMfaGate';
import SavedUnits from './pages/SavedUnits';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './components/Footer';

const DEFAULT_FILTERS = {
  search: '',
  city: 'All',
  purpose: 'All',
  type: 'All',
  sort: 'default',
};

const isRecoveryUrl = () =>
  window.location.hash.includes('type=recovery') ||
  window.location.search.includes('type=recovery');

const isOAuthCallbackUrl = () =>
  window.location.search.includes('code=') ||
  window.location.hash.includes('access_token=');

const isSecretVaultUrl = () => window.location.hash === '#vault';

export default function App() {
  const [showIntro, setShowIntro] = useState(
    () => !isRecoveryUrl() && !isSecretVaultUrl() && !isOAuthCallbackUrl()
  );
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darcom_dark') === 'true'
  );
  const [lang, setLang] = useState(() => localStorage.getItem('darcom_lang') || 'en');
  const [activeView, setActiveView] = useState(() =>
    isSecretVaultUrl() ? 'admin' : 'home'
  );
  const [listingLayout, setListingLayout] = useState('grid');
  const [scrollProgress, setScrollProgress] = useState(0);

  const [units, setUnits] = useState([]);
  const [savedIds, setSavedIds] = useState(() => getSavedIds().map(String));
  const [recentIds, setRecentIds] = useState(() => getRecentlyViewedIds());
  const [compareIds, setCompareIds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [currentUser, setCurrentUser] = useState(null);
  const [mfaVerified, setMfaVerified] = useState(false);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [bookingUnit, setBookingUnit] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showAuth, setShowAuth] = useState(() => isRecoveryUrl());
  const [authMode, setAuthMode] = useState(() =>
    isRecoveryUrl() ? 'reset' : 'login'
  );
  const [showAccount, setShowAccount] = useState(false);

  const listingsRef = useRef(null);
  const isAdminVerifiedRef = useRef(false);

  useEffect(() => {
    isAdminVerifiedRef.current = Boolean(currentUser?.role === 'admin' && mfaVerified);
  }, [currentUser, mfaVerified]);

  // Gold Scroll Progress Bar tracker
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setScrollProgress(pct);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeView]);

  const loadAdminRecords = async () => {
    const [loadedBookings, loadedClients, loadedSubs, loadedAlerts, loadedLogs] =
      await Promise.all([
        getBookings(),
        getRegisteredClients(),
        getNewsletterSubscribers(),
        fetchPriceAlerts().catch(() => []),
        getAdminActivityLogs(),
      ]);
    setBookings(loadedBookings);
    setClients(loadedClients);
    setSubscribers(loadedSubs);
    setPriceAlerts(loadedAlerts);
    setActivityLogs(loadedLogs);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darcom_dark', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('darcom_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    async function loadInitialData() {
      const [loadedUnits, user, loadedSettings] = await Promise.all([
        getUnits(),
        getCurrentUser(),
        getSiteSettings(),
      ]);
      setUnits(loadedUnits);
      setCurrentUser(user);
      setSiteSettings(loadedSettings);

      if (user) {
        const synced = await syncSavedUnitsWithCloud();
        setSavedIds(synced.map(String));
      } else {
        setSavedIds(clearLocalSavedIds());
      }

      if (user?.role === 'admin') {
        const mfa = await getMfaStatus();
        if (mfa.currentLevel === 'aal2') {
          setMfaVerified(true);
          await loadAdminRecords();
        }
      }
    }
    loadInitialData();

    const checkSecretHash = () => {
      if (window.location.hash === '#vault') {
        setShowIntro(false);
        setActiveView('admin');
        window.history.replaceState({}, '', '/');
      }
    };
    checkSecretHash();
    window.addEventListener('hashchange', checkSecretHash);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowIntro(false);
        setAuthMode('reset');
        setShowAuth(true);
      } else if (event === 'SIGNED_IN') {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setShowAuth(false);
        if (user) {
          const synced = await syncSavedUnitsWithCloud();
          setSavedIds(synced.map(String));
        }
        if (isOAuthCallbackUrl()) {
          window.history.replaceState({}, '', '/');
        }
      } else if (event === 'SIGNED_OUT') {
        setSavedIds(clearLocalSavedIds());
        setCompareIds([]);
      }
    });

    // Live Supabase Realtime Channel (Protected)
    const realtimeChannel = supabase
      .channel('darcom-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, async () => {
        setUnits(await getUnits());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, async () => {
        if (isAdminVerifiedRef.current) {
          setBookings(await getBookings());
        }
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'price_alerts' },
        async () => {
          if (isAdminVerifiedRef.current) {
            setPriceAlerts(await fetchPriceAlerts().catch(() => []));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_activity_logs' },
        async () => {
          if (isAdminVerifiedRef.current) {
            setActivityLogs(await getAdminActivityLogs());
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('hashchange', checkSecretHash);
      subscription.unsubscribe();
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // Keep selectedUnit in sync if units update live
  useEffect(() => {
    if (!selectedUnit) return;
    const fresh = units.find((u) => String(u.id) === String(selectedUnit.id));
    if (fresh) setSelectedUnit(fresh);
  }, [units]);

  const filteredUnits = useMemo(() => {
    const list = units.filter((u) => {
      const q = filters.search.trim().toLowerCase();
      const matchSearch =
        !q ||
        u.title.toLowerCase().includes(q) ||
        u.compound.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q);
      const matchCity = filters.city === 'All' || u.city === filters.city;
      const matchPurpose = filters.purpose === 'All' || u.purpose === filters.purpose;
      const matchType = filters.type === 'All' || u.type === filters.type;
      return matchSearch && matchCity && matchPurpose && matchType;
    });

    if (filters.sort === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (filters.sort === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (filters.sort === 'area-desc') {
      return [...list].sort((a, b) => b.area - a.area);
    }
    return list;
  }, [units, filters]);

  const compareUnits = useMemo(
    () => units.filter((u) => compareIds.includes(String(u.id))),
    [units, compareIds]
  );

  // Normalized units with string IDs so SavedUnits page works with both UUIDs and mock numbers
  const normalizedUnits = useMemo(
    () => units.map((u) => ({ ...u, id: String(u.id) })),
    [units]
  );

  const needsPhonePrompt =
    !showIntro &&
    currentUser &&
    currentUser.role !== 'admin' &&
    !currentUser.phone &&
    !showAuth;

  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
    if (unit?.id) {
      setRecentIds(addRecentlyViewedId(unit.id));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectCity = (cityName) => {
    setFilters({ ...DEFAULT_FILTERS, city: cityName });
    listingsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectDeveloper = (dev) => {
    const keyword = dev?.filterKeyword || '';
    const hasKeywordMatch =
      keyword &&
      units.some(
        (u) =>
          u.compound.toLowerCase().includes(keyword.toLowerCase()) ||
          u.title.toLowerCase().includes(keyword.toLowerCase())
      );

    setFilters({
      ...DEFAULT_FILTERS,
      search: hasKeywordMatch ? keyword : '',
      city: hasKeywordMatch ? 'All' : dev?.city || 'All',
    });
    listingsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickJump = (sectionId) => {
    if (activeView !== 'home') {
      setActiveView('home');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleSave = (id) => {
    setSavedIds(toggleSavedId(String(id)));
  };

  const handleToggleCompare = (id) => {
    const strId = String(id);
    setCompareIds((prev) => {
      if (prev.includes(strId)) return prev.filter((item) => item !== strId);
      if (prev.length >= 3) return [...prev.slice(1), strId];
      return [...prev, strId];
    });
  };

  const handleNavigate = (view) => {
    if (view === 'compare') {
      setShowCompare(true);
      return;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddUnit = async (unitData) => {
    const updated = await addUnit(unitData);
    setUnits(updated);
    setActivityLogs(await getAdminActivityLogs());
  };

  const handleUpdateUnit = async (id, updatedData) => {
    const updated = await updateUnit(id, updatedData);
    setUnits(updated);
    setActivityLogs(await getAdminActivityLogs());
  };

  const handleUpdateUnitStatus = async (id, status) => {
    const updated = await updateUnitStatus(id, status);
    setUnits(updated);
    setActivityLogs(await getAdminActivityLogs());
  };

  const handleDeleteUnit = async (id) => {
    const updated = await deleteUnit(id);
    setUnits(updated);
    setActivityLogs(await getAdminActivityLogs());
  };

  const handleResetUnits = async () => {
    const updated = await resetUnits();
    setUnits(updated);
    setActivityLogs(await getAdminActivityLogs());
  };

  const handleCreateBooking = async (bookingData) => {
    await createBooking(bookingData);
    if (currentUser?.role === 'admin' && mfaVerified) {
      await loadAdminRecords();
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    const updated = await updateBookingStatus(id, status);
    setBookings(updated);
    setActivityLogs(await getAdminActivityLogs());
  };

  const handleDeleteBooking = async (id) => {
    const updated = await deleteBooking(id);
    setBookings(updated);
    setActivityLogs(await getAdminActivityLogs());
  };

  const handleDeleteSubscriber = async (id) => {
    const updated = await deleteNewsletterSubscriber(id);
    setSubscribers(updated);
  };

  const handleUpdatePriceAlertStatus = async (id, status) => {
    await updatePriceAlertStatus(id, status);
    setPriceAlerts(await fetchPriceAlerts().catch(() => []));
  };

  const handleDeletePriceAlert = async (id) => {
    await deletePriceAlert(id);
    setPriceAlerts(await fetchPriceAlerts().catch(() => []));
  };

  const handleSaveSiteSettings = async (newSettings) => {
    const updated = await updateSiteSettings(newSettings);
    setSiteSettings(updated);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setMfaVerified(false);
    setSavedIds([]);
    setCompareIds([]);
    setBookings([]);
    setClients([]);
    setSubscribers([]);
    setPriceAlerts([]);
    setActivityLogs([]);
    if (activeView === 'admin') {
      setActiveView('home');
    }
  };

  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#111111] text-[#111111] dark:text-white transition-colors">
      {/* Gold Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2.5px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#C59B27] via-[#f0cf65] to-[#C59B27] transition-[width] duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}

      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        onQuickJump={handleQuickJump}
        savedCount={savedIds.length}
        compareCount={compareIds.length}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((prev) => !prev)}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthMode('login');
          setShowAuth(true);
        }}
        onOpenAccount={() => setShowAccount(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <Hero
              siteSettings={siteSettings}
              onBrowseClick={() =>
                listingsRef.current?.scrollIntoView({ behavior: 'smooth' })
              }
            />

            {siteSettings?.showVideoSection !== false && (
              <ScrollReveal>
                <VideoShowcaseSection />
              </ScrollReveal>
            )}

            <section ref={listingsRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
              <ScrollReveal>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
                      {isAr ? 'وحدات مختارة بعناية' : 'Curated Listings'}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-semibold mt-1">
                      {isAr
                        ? `العقارات المتاحة (${filteredUnits.length})`
                        : `Available Properties (${filteredUnits.length})`}
                    </h2>
                  </div>

                  {/* Grid / Map Toggle */}
                  <div className="flex border border-black/15 dark:border-white/15 text-xs font-semibold">
                    <button
                      onClick={() => setListingLayout('grid')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 cursor-pointer transition-colors ${
                        listingLayout === 'grid'
                          ? 'bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111]'
                          : 'text-[#111111]/70 dark:text-white/70'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>{isAr ? 'شبكة' : 'Grid'}</span>
                    </button>
                    <button
                      onClick={() => setListingLayout('map')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 cursor-pointer transition-colors ${
                        listingLayout === 'map'
                          ? 'bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111]'
                          : 'text-[#111111]/70 dark:text-white/70'
                      }`}
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>{isAr ? 'خريطة' : 'Map'}</span>
                    </button>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={70}>
                <FilterBar
                  filters={filters}
                  onChange={handleFilterChange}
                  onReset={() => setFilters(DEFAULT_FILTERS)}
                />
              </ScrollReveal>

              {filteredUnits.length === 0 ? (
                <div className="py-16 text-center border border-black/10 dark:border-white/10 bg-white dark:bg-[#161616] text-sm text-[#111111]/60 dark:text-white/60">
                  {isAr
                    ? 'لا توجد عقارات مطابقة لمعايير البحث الحالية.'
                    : 'No properties match your selected filters.'}
                </div>
              ) : listingLayout === 'map' ? (
                <ScrollReveal>
                  <PropertyMap units={filteredUnits} onSelectUnit={handleSelectUnit} />
                </ScrollReveal>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUnits.map((unit, index) => (
                    <ScrollReveal key={unit.id} delay={(index % 3) * 110}>
                      <UnitCard
                        unit={unit}
                        isSaved={savedIds.includes(String(unit.id))}
                        isCompared={compareIds.includes(String(unit.id))}
                        onToggleSave={handleToggleSave}
                        onToggleCompare={handleToggleCompare}
                        onSelect={handleSelectUnit}
                      />
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </section>

            {siteSettings?.showLocationsSection !== false && (
              <div id="locations-section">
                <ScrollReveal>
                  <LocationsSection units={units} onSelectCity={handleSelectCity} />
                </ScrollReveal>
              </div>
            )}

            <DevelopersSection lang={lang} onSelectDeveloper={handleSelectDeveloper} />

            {siteSettings?.showWhyDarcomSection !== false && (
              <ScrollReveal>
                <WhyDarcomSection />
              </ScrollReveal>
            )}

            {siteSettings?.showFeaturedSlider !== false && (
              <ScrollReveal>
                <FeaturedSliderSection units={units} onSelectUnit={handleSelectUnit} />
              </ScrollReveal>
            )}

            <TestimonialsSection lang={lang} />

            <FaqSection lang={lang} />

            <ScrollReveal>
              <RecentlyViewedSection
                units={units}
                recentIds={recentIds}
                isAr={isAr}
                onSelectUnit={handleSelectUnit}
                onClearHistory={() => {
                  clearRecentlyViewedIds();
                  setRecentIds([]);
                }}
              />
            </ScrollReveal>
          </>
        )}

        {activeView === 'saved' && (
          <SavedUnits
            units={normalizedUnits}
            savedIds={savedIds}
            compareIds={compareIds}
            onToggleSave={handleToggleSave}
            onToggleCompare={handleToggleCompare}
            onSelectUnit={handleSelectUnit}
            onBackHome={() => setActiveView('home')}
          />
        )}

        {activeView === 'admin' && (
          currentUser?.role === 'admin' && mfaVerified ? (
            <AdminDashboard
              units={units}
              bookings={bookings}
              clients={clients}
              subscribers={subscribers}
              priceAlerts={priceAlerts}
              activityLogs={activityLogs}
              siteSettings={siteSettings}
              onAddUnit={handleAddUnit}
              onUpdateUnit={handleUpdateUnit}
              onUpdateUnitStatus={handleUpdateUnitStatus}
              onDeleteUnit={handleDeleteUnit}
              onResetUnits={handleResetUnits}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onDeleteBooking={handleDeleteBooking}
              onDeleteSubscriber={handleDeleteSubscriber}
              onUpdatePriceAlertStatus={handleUpdatePriceAlertStatus}
              onDeletePriceAlert={handleDeletePriceAlert}
              onSaveSiteSettings={handleSaveSiteSettings}
            />
          ) : (
            <AdminMfaGate
              currentUser={currentUser}
              onAdminAuthenticated={(user) => setCurrentUser(user)}
              onVerified={async () => {
                setMfaVerified(true);
                await loadAdminRecords();
              }}
              onCancel={() => setActiveView('home')}
            />
          )
        )}
      </main>

      <Footer siteSettings={siteSettings} onNavigate={handleNavigate} />

      {selectedUnit && (
        <UnitDetails
          unit={selectedUnit}
          siteSettings={siteSettings}
          currentUser={currentUser}
          isAr={isAr}
          isSaved={savedIds.includes(String(selectedUnit.id))}
          onToggleSave={handleToggleSave}
          onClose={() => setSelectedUnit(null)}
          onBookViewing={(unit) => {
            setSelectedUnit(null);
            setBookingUnit(unit);
          }}
        />
      )}

      {showCompare && (
        <CompareModal
          units={compareUnits}
          onRemove={handleToggleCompare}
          onClose={() => setShowCompare(false)}
        />
      )}

      {bookingUnit && (
        <BookingModal
          unit={bookingUnit}
          currentUser={currentUser}
          onSubmit={handleCreateBooking}
          onClose={() => setBookingUnit(null)}
        />
      )}

      {showAuth && (
        <AuthModal
          initialMode={authMode}
          onSuccess={async (user) => {
            setCurrentUser(user);
            setShowAuth(false);
            if (user) {
              const synced = await syncSavedUnitsWithCloud();
              setSavedIds(synced.map(String));
            }
            if (user?.role === 'admin') {
              setActiveView('admin');
            }
          }}
          onClose={() => {
            setShowAuth(false);
            if (isRecoveryUrl()) {
              window.history.replaceState({}, '', '/');
            }
          }}
        />
      )}

      {showAccount && currentUser && (
        <AccountModal
          currentUser={currentUser}
          savedCount={savedIds.length}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onLogout={handleLogout}
          onClose={() => setShowAccount(false)}
        />
      )}

      {needsPhonePrompt && (
        <PhonePromptModal
          currentUser={currentUser}
          onUpdated={(updated) => setCurrentUser(updated)}
        />
      )}
    </div>
  );
}