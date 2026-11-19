import { supabase } from './supabaseClient';
import { MOCK_UNITS } from '../data/mockUnits';

const SAVED_KEY = 'darcom_saved_v1';

export const DEFAULT_SITE_SETTINGS = {
  phone: '+20 106 534 7544',
  whatsapp: '201065347544',
  email: 'info@darcom.eg',
  instagram: 'https://www.instagram.com/',
  facebook: 'https://www.facebook.com/',
  heroBadge: 'Egypt Real Estate Marketplace',
  heroTitle: 'Find Your Next Home With Clear Numbers.',
  heroSubtitle:
    'Explore verified villas, apartments, and offices across New Cairo, Sheikh Zayed, and the New Capital — compare units side-by-side and calculate monthly installments before booking a viewing.',
  heroCta: 'Explore Properties',
  footerDesc:
    'Interactive 3D architectural tours, live installment modeling, and verified residences across New Cairo, Sheikh Zayed, New Capital, and the North Coast.',
  locationsText: 'New Cairo • Sheikh Zayed • New Capital • North Coast',
  showVideoSection: true,
  showLocationsSection: true,
  showWhyDarcomSection: true,
  showFeaturedSlider: true,
};

function normalizeGallery(image, gallery) {
  const rawList = [
    ...(image ? [image] : []),
    ...(Array.isArray(gallery) ? gallery : []),
  ];
  const cleaned = rawList
    .map((url) => (typeof url === 'string' ? url.trim() : ''))
    .filter(Boolean);
  return [...new Set(cleaned)];
}

function extractStorageFileName(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const marker = '/storage/v1/object/public/property-images/';
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(imageUrl.slice(idx + marker.length).split('?')[0]);
}

async function removeStorageImagesIfOwned(imageUrls) {
  const list = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  const fileNames = [...new Set(list.map(extractStorageFileName).filter(Boolean))];
  if (!fileNames.length) return;
  try {
    await supabase.storage.from('property-images').remove(fileNames);
  } catch {
    // Ignore storage cleanup errors
  }
}

function mapUnitFromDb(row) {
  const gallery = normalizeGallery(row.image, row.gallery);
  const coverImage = row.image || gallery[0] || '';
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
    image: coverImage,
    gallery: gallery.length ? gallery : [coverImage].filter(Boolean),
    features: Array.isArray(row.features) ? row.features : ['24/7 Security', 'Parking'],
    description: row.description || '',
  };
}

function mapUnitToDb(unit) {
  const gallery = normalizeGallery(unit.image, unit.gallery);
  const coverImage = unit.image?.trim() || gallery[0] || '';
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
    image: coverImage,
    gallery: gallery.length ? gallery : [coverImage].filter(Boolean),
    features:
      Array.isArray(unit.features) && unit.features.length
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
  let oldUrls = [];
  const isUpdatingMedia =
    updatedData.image !== undefined || updatedData.gallery !== undefined;

  if (isUpdatingMedia) {
    const { data: existing } = await supabase
      .from('units')
      .select('image, gallery')
      .eq('id', unitId)
      .maybeSingle();
    if (existing) {
      oldUrls = normalizeGallery(existing.image, existing.gallery);
    }
  }

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

  let newUrls = [];
  if (isUpdatingMedia) {
    newUrls = normalizeGallery(updatedData.image, updatedData.gallery);
    const coverImage = updatedData.image?.trim() || newUrls[0] || '';
    payload.image = coverImage;
    payload.gallery = newUrls.length ? newUrls : [coverImage].filter(Boolean);
  }

  if (updatedData.features !== undefined) payload.features = updatedData.features;
  if (updatedData.description !== undefined) payload.description = updatedData.description;

  const { error } = await supabase.from('units').update(payload).eq('id', unitId);
  if (error) throw error;

  if (isUpdatingMedia && oldUrls.length) {
    const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));
    if (removedUrls.length) {
      await removeStorageImagesIfOwned(removedUrls);
    }
  }

  return getUnits();
}

export async function updateUnitStatus(unitId, status) {
  const { error } = await supabase.from('units').update({ status }).eq('id', unitId);
  if (error) throw error;
  return getUnits();
}

export async function deleteUnit(unitId) {
  const { data: existing } = await supabase
    .from('units')
    .select('image, gallery')
    .eq('id', unitId)
    .maybeSingle();

  const { error } = await supabase.from('units').delete().eq('id', unitId);
  if (error) throw error;

  if (existing) {
    const allUrls = normalizeGallery(existing.image, existing.gallery);
    if (allUrls.length) {
      await removeStorageImagesIfOwned(allUrls);
    }
  }

  return getUnits();
}

export async function resetUnits() {
  await supabase.from('units').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const rows = MOCK_UNITS.map(mapUnitToDb);
  const { error } = await supabase.from('units').insert(rows);
  if (error) throw error;
  return getUnits();
}

// Storage Image Upload (Single & Multiple)
export async function uploadPropertyImage(file) {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `unit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
  return data.publicUrl;
}

export async function uploadPropertyImages(files) {
  const fileList = Array.from(files || []).filter(Boolean);
  if (!fileList.length) return [];
  return Promise.all(fileList.map((file) => uploadPropertyImage(file)));
}

// Saved / Favorites (Local + Supabase Cloud Sync)
export function getSavedIds() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearLocalSavedIds() {
  try {
    localStorage.removeItem(SAVED_KEY);
  } catch {
    // Ignore storage errors
  }
  return [];
}

export function toggleSavedId(unitId) {
  const strId = String(unitId);
  const current = getSavedIds().map(String);
  const exists = current.includes(strId);
  const updated = exists ? current.filter((id) => id !== strId) : [...current, strId];
  localStorage.setItem(SAVED_KEY, JSON.stringify(updated));

  supabase.auth.getUser().then(async ({ data }) => {
    const user = data?.user;
    if (!user) return;
    try {
      if (exists) {
        await supabase
          .from('saved_units')
          .delete()
          .eq('user_id', user.id)
          .eq('unit_id', strId);
      } else {
        await supabase
          .from('saved_units')
          .upsert({ user_id: user.id, unit_id: strId }, { onConflict: 'user_id,unit_id' });
      }
    } catch {
      // Cloud sync optional fallback
    }
  });

  return updated;
}

export async function syncSavedUnitsWithCloud() {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return getSavedIds();

    const { data: rows, error } = await supabase
      .from('saved_units')
      .select('unit_id')
      .eq('user_id', user.id);

    if (error) return getSavedIds();

    const remoteIds = (rows || []).map((r) => String(r.unit_id));
    localStorage.setItem(SAVED_KEY, JSON.stringify(remoteIds));
    return remoteIds;
  } catch {
    return getSavedIds();
  }
}

// Viewing Bookings
export async function getBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((b) => ({
    id: b.id,
    unitId: b.unit_id,
    unitTitle: b.unit_title,
    userId: b.user_id || null,
    name: b.name,
    phone: b.phone,
    date: b.preferred_date,
    notes: b.notes || '',
    status: b.status || 'Pending',
  }));
}

export async function getUserBookings() {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return [];

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((b) => ({
      id: b.id,
      unitId: b.unit_id,
      unitTitle: b.unit_title,
      date: b.preferred_date,
      phone: b.phone,
      status: b.status || 'Pending',
    }));
  } catch {
    return [];
  }
}

export async function cancelUserBooking(bookingId) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'Cancelled' })
    .eq('id', bookingId);
  if (error) throw error;
  return getUserBookings();
}

export async function createBooking(booking) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    booking.unitId || ''
  );

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;

  const payload = {
    unit_id: isUuid ? booking.unitId : null,
    unit_title: booking.unitTitle,
    name: booking.name,
    phone: booking.phone,
    preferred_date: booking.date,
    notes: booking.notes || '',
    status: 'Pending',
  };

  if (userId) {
    payload.user_id = userId;
  }

  const { error } = await supabase.from('bookings').insert([payload]);
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

// Newsletter Subscribers (VIP Footer Form)
export async function subscribeNewsletter(email) {
  const clean = (email || '').trim().toLowerCase();
  if (!clean) throw new Error('Please enter a valid email.');
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: clean }, { onConflict: 'email' });
  if (error) throw error;
  return true;
}

export async function getNewsletterSubscribers() {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((s) => ({
    id: s.id,
    email: s.email,
    createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString('en-EG') : '—',
  }));
}

export async function deleteNewsletterSubscriber(id) {
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw error;
  return getNewsletterSubscribers();
}

// Admin Activity Logs (Audit Trail)
export async function getAdminActivityLogs() {
  const { data, error } = await supabase
    .from('admin_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(60);

  if (error || !data) return [];
  return data.map((l) => ({
    id: l.id,
    actorEmail: l.actor_email || 'Admin',
    action: l.action || 'UPDATED',
    entityType: l.entity_type || 'Unit',
    entityTitle: l.entity_title || '',
    details: l.details || '',
    createdAt: l.created_at
      ? new Date(l.created_at).toLocaleString('en-EG', {
          dateStyle: 'short',
          timeStyle: 'short',
        })
      : '—',
  }));
}

// Site Settings (Full Admin Control)
export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) return DEFAULT_SITE_SETTINGS;
  const cfg = data.config || {};
  return {
    phone: data.phone || DEFAULT_SITE_SETTINGS.phone,
    whatsapp: data.whatsapp || DEFAULT_SITE_SETTINGS.whatsapp,
    email: data.email || DEFAULT_SITE_SETTINGS.email,
    instagram: data.instagram || DEFAULT_SITE_SETTINGS.instagram,
    facebook: data.facebook || DEFAULT_SITE_SETTINGS.facebook,
    heroTitle: data.hero_title || DEFAULT_SITE_SETTINGS.heroTitle,
    heroSubtitle: data.hero_subtitle || DEFAULT_SITE_SETTINGS.heroSubtitle,
    heroBadge: cfg.heroBadge || DEFAULT_SITE_SETTINGS.heroBadge,
    heroCta: cfg.heroCta || DEFAULT_SITE_SETTINGS.heroCta,
    footerDesc: cfg.footerDesc || DEFAULT_SITE_SETTINGS.footerDesc,
    locationsText: cfg.locationsText || DEFAULT_SITE_SETTINGS.locationsText,
    showVideoSection: cfg.showVideoSection ?? DEFAULT_SITE_SETTINGS.showVideoSection,
    showLocationsSection: cfg.showLocationsSection ?? DEFAULT_SITE_SETTINGS.showLocationsSection,
    showWhyDarcomSection: cfg.showWhyDarcomSection ?? DEFAULT_SITE_SETTINGS.showWhyDarcomSection,
    showFeaturedSlider: cfg.showFeaturedSlider ?? DEFAULT_SITE_SETTINGS.showFeaturedSlider,
  };
}

export async function updateSiteSettings(settings) {
  const extraConfig = {
    heroBadge: settings.heroBadge ?? DEFAULT_SITE_SETTINGS.heroBadge,
    heroCta: settings.heroCta ?? DEFAULT_SITE_SETTINGS.heroCta,
    footerDesc: settings.footerDesc ?? DEFAULT_SITE_SETTINGS.footerDesc,
    locationsText: settings.locationsText ?? DEFAULT_SITE_SETTINGS.locationsText,
    showVideoSection: settings.showVideoSection ?? true,
    showLocationsSection: settings.showLocationsSection ?? true,
    showWhyDarcomSection: settings.showWhyDarcomSection ?? true,
    showFeaturedSlider: settings.showFeaturedSlider ?? true,
  };

  const payloadWithConfig = {
    id: 1,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    instagram: settings.instagram,
    facebook: settings.facebook,
    hero_title: settings.heroTitle,
    hero_subtitle: settings.heroSubtitle,
    config: extraConfig,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('site_settings').upsert(payloadWithConfig);
  if (error) {
    const { config, ...fallbackPayload } = payloadWithConfig;
    const { error: fallbackErr } = await supabase.from('site_settings').upsert(fallbackPayload);
    if (fallbackErr) throw fallbackErr;
  }
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
    name:
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      (roleRow?.role === 'admin' ? 'Admin' : email.split('@')[0]),
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
  const cleanName = name.trim();
  const cleanPhone = (phone || '').trim();

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        name: cleanName,
        phone: cleanPhone,
      },
    },
  });
  if (error) throw error;

  if (data?.user?.id) {
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Handled by DB trigger or profile update fallback
    }
  }

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

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'Could not start Google sign-in.');
  }

  return data;
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

  const formatted = await formatUserWithRole(data.user);
  if (formatted?.id) {
    try {
      await supabase.from('profiles').upsert({
        id: formatted.id,
        name: formatted.name,
        email: formatted.email,
        phone: formatted.phone,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Profile sync handled safely
    }
  }

  return formatted;
}

export async function logoutUser() {
  clearLocalSavedIds();
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

// ==========================================
// 1. دوال تنبيهات نزول السعر (Price Alerts)
// ==========================================
export async function createPriceAlert(alertData) {
  const { data, error } = await supabase
    .from('price_alerts')
    .insert([
      {
        unit_id: String(alertData.unitId),
        unit_title: alertData.unitTitle,
        current_price: Number(alertData.currentPrice) || 0,
        target_price: alertData.targetPrice ? Number(alertData.targetPrice) : null,
        user_id: alertData.userId || null,
        name: alertData.name.trim(),
        phone: alertData.phone.trim(),
        email: alertData.email?.trim() || null,
        status: 'Active',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchPriceAlerts() {
  const { data, error } = await supabase
    .from('price_alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updatePriceAlertStatus(id, status) {
  const { error } = await supabase
    .from('price_alerts')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function deletePriceAlert(id) {
  const { error } = await supabase
    .from('price_alerts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ==========================================
// 2. دوال المشاهدات الأخيرة (Recently Viewed)
// ==========================================
const RECENTLY_VIEWED_KEY = 'darcom_recently_viewed';

export function getRecentlyViewedIds() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewedId(unitId) {
  if (!unitId) return [];
  const idStr = String(unitId);
  const current = getRecentlyViewedIds().filter((id) => id !== idStr);
  const updated = [idStr, ...current].slice(0, 6);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  return updated;
}

export function clearRecentlyViewedIds() {
  localStorage.removeItem(RECENTLY_VIEWED_KEY);
}