import { supabase } from './supabaseClient';
import { MOCK_UNITS } from '../data/mockUnits';

const SAVED_KEY = 'darcom_saved_v1';

export const DEFAULT_SITE_SETTINGS = {
  phone: '+20 106 534 7544',
  whatsapp: '201065347544',
  email: 'info@darcom.eg',
  instagram: 'https://www.instagram.com/',
  facebook: 'https://www.facebook.com/',
  heroTitle: 'Find Your Next Home With Clear Numbers.',
  heroSubtitle:
    'Explore verified villas, apartments, and offices across New Cairo, Sheikh Zayed, and the New Capital — compare units side-by-side and calculate monthly installments before booking a viewing.',
};

function mapUnitFromDb(row) {
  return {
    id: row.id,
    title: row.title,
    city: row.city,
    compound: row.compound,
    type: row.type,
    purpose: row.purpose,
    price: Number(row.price),
    area: Number(row.area),
    bedrooms: Number(row.bedrooms ?? 0),
    bathrooms: Number(row.bathrooms ?? 1),
    delivery: row.delivery || 'Ready to Move',
    status: row.status || 'Available',
    badge: row.badge || '',
    downPaymentPercent: Number(row.down_payment_percent ?? 15),
    installmentYears: Number(row.installment_years ?? 7),
    image: row.image,
    gallery: Array.isArray(row.gallery) && row.gallery.length ? row.gallery : [row.image],
    features: Array.isArray(row.features) ? row.features : ['24/7 Security', 'Parking'],
    description: row.description || '',
  };
}

function mapUnitToDb(unit) {
  return {
    title: unit.title,
    city: unit.city,
    compound: unit.compound,
    type: unit.type,
    purpose: unit.purpose,
    price: Number(unit.price),
    area: Number(unit.area),
    bedrooms: Number(unit.bedrooms ?? 0),
    bathrooms: Number(unit.bathrooms ?? 1),
    delivery: unit.delivery || 'Ready to Move',
    status: unit.status || 'Available',
    badge: unit.badge || '',
    down_payment_percent: Number(unit.downPaymentPercent ?? 15),
    installment_years: Number(unit.installmentYears ?? 7),
    image: unit.image,
    gallery: unit.gallery?.length ? unit.gallery : [unit.image],
    features: Array.isArray(unit.features) && unit.features.length
      ? unit.features
      : ['24/7 Security', 'Parking'],
    description: unit.description || '',
  };
}

// Units CRUD
export async function getUnits() {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    return MOCK_UNITS;
  }
  return data.map(mapUnitFromDb);
}

export async function addUnit(unitData) {
  const { error } = await supabase.from('units').insert([mapUnitToDb(unitData)]);
  if (error) throw error;
  return getUnits();
}

export async function updateUnit(unitId, updatedData) {
  const payload = {};
  if (updatedData.title !== undefined) payload.title = updatedData.title;
  if (updatedData.city !== undefined) payload.city = updatedData.city;
  if (updatedData.compound !== undefined) payload.compound = updatedData.compound;
  if (updatedData.type !== undefined) payload.type = updatedData.type;
  if (updatedData.purpose !== undefined) payload.purpose = updatedData.purpose;
  if (updatedData.price !== undefined) payload.price = Number(updatedData.price);
  if (updatedData.area !== undefined) payload.area = Number(updatedData.area);
  if (updatedData.bedrooms !== undefined) payload.bedrooms = Number(updatedData.bedrooms);
  if (updatedData.bathrooms !== undefined) payload.bathrooms = Number(updatedData.bathrooms);
  if (updatedData.delivery !== undefined) payload.delivery = updatedData.delivery;
  if (updatedData.status !== undefined) payload.status = updatedData.status;
  if (updatedData.badge !== undefined) payload.badge = updatedData.badge;
  if (updatedData.downPaymentPercent !== undefined) {
    payload.down_payment_percent = Number(updatedData.downPaymentPercent);
  }
  if (updatedData.installmentYears !== undefined) {
    payload.installment_years = Number(updatedData.installmentYears);
  }
  if (updatedData.image !== undefined) {
    payload.image = updatedData.image;
    payload.gallery = [updatedData.image];
  }
  if (updatedData.features !== undefined) payload.features = updatedData.features;
  if (updatedData.description !== undefined) payload.description = updatedData.description;

  const { error } = await supabase.from('units').update(payload).eq('id', unitId);
  if (error) throw error;
  return getUnits();
}

export async function updateUnitStatus(unitId, status) {
  const { error } = await supabase.from('units').update({ status }).eq('id', unitId);
  if (error) throw error;
  return getUnits();
}

export async function deleteUnit(unitId) {
  const { error } = await supabase.from('units').delete().eq('id', unitId);
  if (error) throw error;
  return getUnits();
}

export async function resetUnits() {
  await supabase.from('units').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const rows = MOCK_UNITS.map(mapUnitToDb);
  const { error } = await supabase.from('units').insert(rows);
  if (error) throw error;
  return getUnits();
}

// Storage Image Upload
export async function uploadPropertyImage(file) {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `unit-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
  return data.publicUrl;
}

// Saved / Favorites
export function getSavedIds() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSavedId(unitId) {
  const current = getSavedIds();
  const exists = current.includes(unitId);
  const updated = exists ? current.filter((id) => id !== unitId) : [...current, unitId];
  localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  return updated;
}

// Viewing Bookings
export async function getBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data.map((b) => ({
    id: b.id,
    unitId: b.unit_id,
    unitTitle: b.unit_title,
    name: b.name,
    phone: b.phone,
    date: b.preferred_date,
    notes: b.notes || '',
    status: b.status || 'Pending',
  }));
}

export async function createBooking(booking) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    booking.unitId || ''
  );

  const { error } = await supabase.from('bookings').insert([
    {
      unit_id: isUuid ? booking.unitId : null,
      unit_title: booking.unitTitle,
      name: booking.name,
      phone: booking.phone,
      preferred_date: booking.date,
      notes: booking.notes || '',
      status: 'Pending',
    },
  ]);
  if (error) throw error;
}

export async function updateBookingStatus(bookingId, status) {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
  if (error) throw error;
  return getBookings();
}

export async function deleteBooking(bookingId) {
  const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
  if (error) throw error;
  return getBookings();
}

// Registered Clients (from profiles table)
export async function getRegisteredClients() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error || !data) return [];
  return data.map((p) => ({
    id: p.id,
    name: p.name || 'Client',
    email: p.email || '',
    phone: p.phone || '',
    updatedAt: p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-EG') : '—',
  }));
}

// Site Settings
export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) return DEFAULT_SITE_SETTINGS;
  return {
    phone: data.phone || DEFAULT_SITE_SETTINGS.phone,
    whatsapp: data.whatsapp || DEFAULT_SITE_SETTINGS.whatsapp,
    email: data.email || DEFAULT_SITE_SETTINGS.email,
    instagram: data.instagram || DEFAULT_SITE_SETTINGS.instagram,
    facebook: data.facebook || DEFAULT_SITE_SETTINGS.facebook,
    heroTitle: data.hero_title || DEFAULT_SITE_SETTINGS.heroTitle,
    heroSubtitle: data.hero_subtitle || DEFAULT_SITE_SETTINGS.heroSubtitle,
  };
}

export async function updateSiteSettings(settings) {
  const { error } = await supabase.from('site_settings').upsert({
    id: 1,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    instagram: settings.instagram,
    facebook: settings.facebook,
    hero_title: settings.heroTitle,
    hero_subtitle: settings.heroSubtitle,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return getSiteSettings();
}

// Authentication (Zero-Trust Role Check via Supabase DB)
async function formatUserWithRole(user) {
  if (!user) return null;
  const email = (user.email || '').toLowerCase();

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    name: user.user_metadata?.name || (roleRow?.role === 'admin' ? 'Admin' : email.split('@')[0]),
    email,
    phone: user.user_metadata?.phone || '',
    role: roleRow?.role === 'admin' ? 'admin' : 'buyer',
  };
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return formatUserWithRole(data?.user);
}

export async function registerUser({ name, email, phone, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        name: name.trim(),
        phone: (phone || '').trim(),
      },
    },
  });
  if (error) throw error;
  return formatUserWithRole(data.user);
}

export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return formatUserWithRole(data.user);
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
}

export async function updateUserPassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function updateUserProfile({ name, phone }) {
  const metadata = {};
  if (name !== undefined) metadata.name = name.trim();
  if (phone !== undefined) metadata.phone = phone.trim();

  const { data, error } = await supabase.auth.updateUser({
    data: metadata,
  });
  if (error) throw error;
  return formatUserWithRole(data.user);
}

export async function logoutUser() {
  await supabase.auth.signOut();
}

// Multi-Factor Authentication
export async function getMfaStatus() {
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verifiedFactor = factors?.totp?.find((f) => f.status === 'verified');
  return {
    currentLevel: aal?.currentLevel || 'aal1',
    nextLevel: aal?.nextLevel || 'aal1',
    hasMfaSetup: Boolean(verifiedFactor),
    factorId: verifiedFactor?.id || null,
  };
}

export async function enrollAdminMfa() {
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const unverified = (factors?.all || []).filter((f) => f.status === 'unverified');
  for (const f of unverified) {
    await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: `DarCom Admin ${Date.now()}`,
  });
  if (error) throw error;
  return data;
}

export async function verifyAdminMfa(factorId, code) {
  const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
    factorId,
  });
  if (challengeErr) throw challengeErr;

  const { error: verifyErr } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: code.trim(),
  });
  if (verifyErr) throw verifyErr;
  return true;
}