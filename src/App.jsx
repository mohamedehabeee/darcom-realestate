import { useEffect, useMemo, useRef, useState } from 'react';
import {
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
  getCurrentUser,
  logoutUser,
} from './services/realEstateService';
import IntroScreen from './components/IntroScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoShowcaseSection from './components/VideoShowcaseSection';
import FilterBar from './components/FilterBar';
import UnitCard from './components/UnitCard';
import LocationsSection from './components/LocationsSection';
import WhyDarcomSection from './components/WhyDarcomSection';
import FeaturedSliderSection from './components/FeaturedSliderSection';
import UnitDetails from './components/UnitDetails';
import CompareModal from './components/CompareModal';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import SavedUnits from './pages/SavedUnits';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

const DEFAULT_FILTERS = {
  search: '',
  city: 'All',
  purpose: 'All',
  type: 'All',
  sort: 'default',
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('home');

  const [units, setUnits] = useState(() => getUnits());
  const [savedIds, setSavedIds] = useState(() => getSavedIds());
  const [compareIds, setCompareIds] = useState([]);
  const [bookings, setBookings] = useState(() => getBookings());
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [bookingUnit, setBookingUnit] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const listingsRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

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

  const handleAddUnit = (unitData) => {
    addUnit(unitData);
    setUnits(getUnits());
  };

  const handleUpdateUnit = (id, updatedData) => {
    setUnits(updateUnit(id, updatedData));
  };

  const handleUpdateUnitStatus = (id, status) => {
    setUnits(updateUnitStatus(id, status));
  };

  const handleDeleteUnit = (id) => {
    setUnits(deleteUnit(id));
  };

  const handleResetUnits = () => {
    setUnits(resetUnits());
  };

  const handleCreateBooking = (bookingData) => {
    createBooking(bookingData);
    setBookings(getBookings());
  };

  const handleUpdateBookingStatus = (id, status) => {
    setBookings(updateBookingStatus(id, status));
  };

  const handleDeleteBooking = (id) => {
    setBookings(deleteBooking(id));
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
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
        onOpenAuth={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <Hero
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

        {activeView === 'admin' && currentUser?.role === 'admin' && (
          <AdminDashboard
            units={units}
            bookings={bookings}
            onAddUnit={handleAddUnit}
            onUpdateUnit={handleUpdateUnit}
            onUpdateUnitStatus={handleUpdateUnitStatus}
            onDeleteUnit={handleDeleteUnit}
            onResetUnits={handleResetUnits}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onDeleteBooking={handleDeleteBooking}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
      <ScrollToTop />

      {selectedUnit && (
        <UnitDetails
          unit={selectedUnit}
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
          onSuccess={(user) => {
            setCurrentUser(user);
            setShowAuth(false);
            if (user.role === 'admin') {
              setActiveView('admin');
            }
          }}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}