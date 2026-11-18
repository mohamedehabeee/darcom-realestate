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
  toggleSavedId,
  getBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getRegisteredClients,
  getSiteSettings,
  updateSiteSettings,
  getCurrentUser,
  getMfaStatus,
  logoutUser,
} from './services/realEstateService';
import IntroScreen from './components/IntroScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoShowcaseSection from './components/VideoShowcaseSection';
import FilterBar from './components/FilterBar';
import UnitCard from './components/UnitCard';
import PropertyMap from './components/PropertyMap';
import LocationsSection from './components/LocationsSection';
import WhyDarcomSection from './components/WhyDarcomSection';
import FeaturedSliderSection from './components/FeaturedSliderSection';
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

const isSecretVaultUrl = () => window.location.hash === '#vault';

export default function App() {
  const [showIntro, setShowIntro] = useState(
    () => !isRecoveryUrl() && !isSecretVaultUrl()
  );
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState(() =>
    isSecretVaultUrl() ? 'admin' : 'home'
  );
  const [listingLayout, setListingLayout] = useState('grid');

  const [units, setUnits] = useState([]);
  const [savedIds, setSavedIds] = useState(() => getSavedIds());
  const [compareIds, setCompareIds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

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

      if (user?.role === 'admin') {
        const mfa = await getMfaStatus();
        if (mfa.currentLevel === 'aal2') {
          setMfaVerified(true);
          const [loadedBookings, loadedClients] = await Promise.all([
            getBookings(),
            getRegisteredClients(),
          ]);
          setBookings(loadedBookings);
          setClients(loadedClients);
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
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowIntro(false);
        setAuthMode('reset');
        setShowAuth(true);
      }
    });

    return () => {
      window.removeEventListener('hashchange', checkSecretHash);
      subscription.unsubscribe();
    };
  }, []);

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
    () => units.filter((u) => compareIds.includes(u.id)),
    [units, compareIds]
  );

  const needsPhonePrompt =
    !showIntro &&
    currentUser &&
    currentUser.role !== 'admin' &&
    !currentUser.phone &&
    !showAuth;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectCity = (cityName) => {
    setFilters({ ...DEFAULT_FILTERS, city: cityName });
    listingsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleSave = (id) => {
    setSavedIds(toggleSavedId(id));
  };

  const handleToggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
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
  };

  const handleUpdateUnit = async (id, updatedData) => {
    const updated = await updateUnit(id, updatedData);
    setUnits(updated);
  };

  const handleUpdateUnitStatus = async (id, status) => {
    const updated = await updateUnitStatus(id, status);
    setUnits(updated);
  };

  const handleDeleteUnit = async (id) => {
    const updated = await deleteUnit(id);
    setUnits(updated);
  };

  const handleResetUnits = async () => {
    const updated = await resetUnits();
    setUnits(updated);
  };

  const handleCreateBooking = async (bookingData) => {
    await createBooking(bookingData);
    if (currentUser?.role === 'admin' && mfaVerified) {
      setBookings(await getBookings());
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    const updated = await updateBookingStatus(id, status);
    setBookings(updated);
  };

  const handleDeleteBooking = async (id) => {
    const updated = await deleteBooking(id);
    setBookings(updated);
  };

  const handleSaveSiteSettings = async (newSettings) => {
    const updated = await updateSiteSettings(newSettings);
    setSiteSettings(updated);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setMfaVerified(false);
    setBookings([]);
    setClients([]);
    if (activeView === 'admin') {
      setActiveView('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#111111] text-[#111111] dark:text-white transition-colors">
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}

      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        savedCount={savedIds.length}
        compareCount={compareIds.length}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((prev) => !prev)}
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

            <VideoShowcaseSection />

            <section ref={listingsRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
                    Curated Listings
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-semibold mt-1">
                    Available Properties ({filteredUnits.length})
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
                    <span>Grid</span>
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
                    <span>Map</span>
                  </button>
                </div>
              </div>

              <FilterBar
                filters={filters}
                onChange={handleFilterChange}
                onReset={() => setFilters(DEFAULT_FILTERS)}
              />

              {filteredUnits.length === 0 ? (
                <div className="py-16 text-center border border-black/10 dark:border-white/10 bg-white dark:bg-[#161616] text-sm text-[#111111]/60 dark:text-white/60">
                  No properties match your selected filters.
                </div>
              ) : listingLayout === 'map' ? (
                <PropertyMap units={filteredUnits} onSelectUnit={setSelectedUnit} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUnits.map((unit) => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      isSaved={savedIds.includes(unit.id)}
                      isCompared={compareIds.includes(unit.id)}
                      onToggleSave={handleToggleSave}
                      onToggleCompare={handleToggleCompare}
                      onSelect={setSelectedUnit}
                    />
                  ))}
                </div>
              )}
            </section>

            <LocationsSection units={units} onSelectCity={handleSelectCity} />
            <WhyDarcomSection />
            <FeaturedSliderSection units={units} onSelectUnit={setSelectedUnit} />
          </>
        )}

        {activeView === 'saved' && (
          <SavedUnits
            units={units}
            savedIds={savedIds}
            compareIds={compareIds}
            onToggleSave={handleToggleSave}
            onToggleCompare={handleToggleCompare}
            onSelectUnit={setSelectedUnit}
            onBackHome={() => setActiveView('home')}
          />
        )}

        {activeView === 'admin' && (
          currentUser?.role === 'admin' && mfaVerified ? (
            <AdminDashboard
              units={units}
              bookings={bookings}
              clients={clients}
              siteSettings={siteSettings}
              onAddUnit={handleAddUnit}
              onUpdateUnit={handleUpdateUnit}
              onUpdateUnitStatus={handleUpdateUnitStatus}
              onDeleteUnit={handleDeleteUnit}
              onResetUnits={handleResetUnits}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onDeleteBooking={handleDeleteBooking}
              onSaveSiteSettings={handleSaveSiteSettings}
            />
          ) : (
            <AdminMfaGate
              currentUser={currentUser}
              onAdminAuthenticated={(user) => setCurrentUser(user)}
              onVerified={async () => {
                setMfaVerified(true);
                const [loadedBookings, loadedClients] = await Promise.all([
                  getBookings(),
                  getRegisteredClients(),
                ]);
                setBookings(loadedBookings);
                setClients(loadedClients);
              }}
              onCancel={() => setActiveView('home')}
            />
          )
        )}
      </main>

      <Footer
        siteSettings={siteSettings}
        onNavigate={handleNavigate}
        onSecretTrigger={() => {
          setActiveView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {selectedUnit && (
        <UnitDetails
          unit={selectedUnit}
          siteSettings={siteSettings}
          isSaved={savedIds.includes(selectedUnit.id)}
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