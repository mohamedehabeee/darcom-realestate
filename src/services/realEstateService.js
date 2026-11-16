import { MOCK_UNITS } from '../data/mockUnits';

const KEYS = {
  UNITS: 'darcom_units_v2',
  SAVED: 'darcom_saved_v1',
  BOOKINGS: 'darcom_bookings_v1',
  USERS: 'darcom_users_v1',
  SESSION: 'darcom_session_v1',
};

const ADMIN_EMAIL = 'admin@darcom.eg';
const ADMIN_PASS = 'DarCom@2026';

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Units CRUD
export function getUnits() {
  const stored = readStorage(KEYS.UNITS, null);
  if (!stored || stored.length === 0) {
    writeStorage(KEYS.UNITS, MOCK_UNITS);
    return MOCK_UNITS;
  }
  return stored;
}

export function addUnit(unitData) {
  const units = getUnits();
  const newUnit = {
    ...unitData,
    id: `unit-${Date.now()}`,
    status: unitData.status || 'Available',
    gallery: unitData.gallery?.length ? unitData.gallery : [unitData.image],
    features: unitData.features?.length ? unitData.features : ['24/7 Security', 'Parking'],
  };
  const updated = [newUnit, ...units];
  writeStorage(KEYS.UNITS, updated);
  return newUnit;
}

export function updateUnit(unitId, updatedData) {
  const units = getUnits();
  const updated = units.map((u) =>
    u.id === unitId
      ? {
          ...u,
          ...updatedData,
          gallery: updatedData.image ? [updatedData.image, ...(u.gallery?.slice(1) || [])] : u.gallery,
        }
      : u
  );
  writeStorage(KEYS.UNITS, updated);
  return updated;
}

export function updateUnitStatus(unitId, status) {
  const units = getUnits();
  const updated = units.map((u) => (u.id === unitId ? { ...u, status } : u));
  writeStorage(KEYS.UNITS, updated);
  return updated;
}

export function deleteUnit(unitId) {
  const units = getUnits();
  const updated = units.filter((u) => u.id !== unitId);
  writeStorage(KEYS.UNITS, updated);
  return updated;
}

export function resetUnits() {
  writeStorage(KEYS.UNITS, MOCK_UNITS);
  return MOCK_UNITS;
}

// Saved / Favorites
export function getSavedIds() {
  return readStorage(KEYS.SAVED, []);
}

export function toggleSavedId(unitId) {
  const current = getSavedIds();
  const exists = current.includes(unitId);
  const updated = exists ? current.filter((id) => id !== unitId) : [...current, unitId];
  writeStorage(KEYS.SAVED, updated);
  return updated;
}

// Viewing Bookings
export function getBookings() {
  return readStorage(KEYS.BOOKINGS, []);
}

export function createBooking(booking) {
  const bookings = getBookings();
  const newBooking = {
    ...booking,
    id: `bk-${Date.now()}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  const updated = [newBooking, ...bookings];
  writeStorage(KEYS.BOOKINGS, updated);
  return newBooking;
}

export function updateBookingStatus(bookingId, status) {
  const bookings = getBookings();
  const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
  writeStorage(KEYS.BOOKINGS, updated);
  return updated;
}

export function deleteBooking(bookingId) {
  const bookings = getBookings();
  const updated = bookings.filter((b) => b.id !== bookingId);
  writeStorage(KEYS.BOOKINGS, updated);
  return updated;
}

// Authentication
export function getCurrentUser() {
  return readStorage(KEYS.SESSION, null);
}

export function registerUser({ name, email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === ADMIN_EMAIL) {
    throw new Error('This email is reserved.');
  }

  const users = readStorage(KEYS.USERS, []);
  const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);
  if (exists) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    password,
    role: 'buyer',
  };
  writeStorage(KEYS.USERS, [...users, newUser]);
  const session = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  writeStorage(KEYS.SESSION, session);
  return session;
}

export function loginUser({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();

  if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASS) {
    const adminSession = {
      id: 'admin-01',
      name: 'Admin',
      email: ADMIN_EMAIL,
      role: 'admin',
    };
    writeStorage(KEYS.SESSION, adminSession);
    return adminSession;
  }

  const users = readStorage(KEYS.USERS, []);
  const found = users.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === password
  );
  if (!found) {
    throw new Error('Invalid email or password.');
  }
  const session = { id: found.id, name: found.name, email: found.email, role: found.role };
  writeStorage(KEYS.SESSION, session);
  return session;
}

export function logoutUser() {
  localStorage.removeItem(KEYS.SESSION);
}