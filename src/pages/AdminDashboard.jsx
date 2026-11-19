import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  Check,
  Clock,
  Pencil,
  X,
  RotateCcw,
  Upload,
  Users,
  Settings,
  CheckCircle2,
  TrendingUp,
  Building2,
  DollarSign,
  PieChart,
  BarChart3,
  Search,
  Mail,
  Activity,
  Download,
  Star,
  Images,
  ImagePlus,
} from 'lucide-react';
import { uploadPropertyImages } from '../services/realEstateService';

const DEFAULT_FALLBACK_IMG =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

const EMPTY_FORM = {
  title: '',
  city: 'New Cairo',
  compound: '',
  type: 'Apartment',
  purpose: 'Buy',
  price: '',
  area: '',
  bedrooms: '3',
  bathrooms: '2',
  delivery: 'Ready to Move',
  downPaymentPercent: '15',
  installmentYears: '7',
  status: 'Available',
  badge: '',
  image: DEFAULT_FALLBACK_IMG,
  gallery: [DEFAULT_FALLBACK_IMG],
  featuresText: 'Private Garden, 24/7 Security, Covered Parking',
  description: '',
};

function fmtCompact(num) {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B EGP`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M EGP`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K EGP`;
  return `${num} EGP`;
}

export default function AdminDashboard({
  units,
  bookings,
  clients = [],
  subscribers = [],
  activityLogs = [],
  siteSettings,
  onAddUnit,
  onUpdateUnit,
  onUpdateUnitStatus,
  onDeleteUnit,
  onResetUnits,
  onUpdateBookingStatus,
  onDeleteBooking,
  onDeleteSubscriber,
  onSaveSiteSettings,
}) {
  const [tab, setTab] = useState('units');
  const [adminSearch, setAdminSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [settingsForm, setSettingsForm] = useState(() => ({
    phone: siteSettings?.phone || '+20 106 534 7544',
    whatsapp: siteSettings?.whatsapp || '201065347544',
    email: siteSettings?.email || 'info@darcom.eg',
    instagram: siteSettings?.instagram || 'https://www.instagram.com/',
    facebook: siteSettings?.facebook || 'https://www.facebook.com/',
    heroBadge: siteSettings?.heroBadge || 'Egypt Real Estate Marketplace',
    heroTitle: siteSettings?.heroTitle || 'Find Your Next Home With Clear Numbers.',
    heroSubtitle: siteSettings?.heroSubtitle || '',
    heroCta: siteSettings?.heroCta || 'Explore Properties',
    footerDesc: siteSettings?.footerDesc || '',
    locationsText:
      siteSettings?.locationsText || 'New Cairo • Sheikh Zayed • New Capital • North Coast',
    showVideoSection: siteSettings?.showVideoSection ?? true,
    showLocationsSection: siteSettings?.showLocationsSection ?? true,
    showWhyDarcomSection: siteSettings?.showWhyDarcomSection ?? true,
    showFeaturedSlider: siteSettings?.showFeaturedSlider ?? true,
  }));
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (!siteSettings) return;
    setSettingsForm({
      phone: siteSettings.phone || '+20 106 534 7544',
      whatsapp: siteSettings.whatsapp || '201065347544',
      email: siteSettings.email || 'info@darcom.eg',
      instagram: siteSettings.instagram || 'https://www.instagram.com/',
      facebook: siteSettings.facebook || 'https://www.facebook.com/',
      heroBadge: siteSettings.heroBadge || 'Egypt Real Estate Marketplace',
      heroTitle: siteSettings.heroTitle || 'Find Your Next Home With Clear Numbers.',
      heroSubtitle: siteSettings.heroSubtitle || '',
      heroCta: siteSettings.heroCta || 'Explore Properties',
      footerDesc: siteSettings.footerDesc || '',
      locationsText:
        siteSettings.locationsText || 'New Cairo • Sheikh Zayed • New Capital • North Coast',
      showVideoSection: siteSettings.showVideoSection ?? true,
      showLocationsSection: siteSettings.showLocationsSection ?? true,
      showWhyDarcomSection: siteSettings.showWhyDarcomSection ?? true,
      showFeaturedSlider: siteSettings.showFeaturedSlider ?? true,
    });
  }, [siteSettings]);

  const inputCls =
    'w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:border-indigo-500';

  const stats = useMemo(() => {
    const total = units.length || 1;
    const buyUnits = units.filter((u) => u.purpose === 'Buy');
    const rentUnits = units.filter((u) => u.purpose === 'Rent');
    const avail = units.filter((u) => u.status === 'Available').length;
    const resv = units.filter((u) => u.status === 'Reserved').length;
    const sold = units.filter((u) => u.status === 'Sold').length;

    const totalVal = buyUnits.reduce((s, u) => s + Number(u.price || 0), 0);
    const closedVal = buyUnits
      .filter((u) => u.status === 'Sold' || u.status === 'Reserved')
      .reduce((s, u) => s + Number(u.price || 0), 0);
    const rentVal = rentUnits.reduce((s, u) => s + Number(u.price || 0), 0);
    const totalArea = buyUnits.reduce((s, u) => s + Number(u.area || 0), 0);
    const avgSqm = totalArea > 0 ? Math.round(totalVal / totalArea) : 0;

    const availPct = Math.round((avail / total) * 100);
    const resvPct = Math.round((resv / total) * 100);
    const soldPct = Math.max(0, 100 - availPct - resvPct);
    const closeRate = Math.round(((sold + resv) / total) * 100);
    const buyPct = Math.round((buyUnits.length / total) * 100);
    const rentPct = 100 - buyPct;

    const confBk = bookings.filter((b) => b.status === 'Confirmed').length;
    const bkRate = bookings.length > 0 ? Math.round((confBk / bookings.length) * 100) : 0;

    const cityCounts = {};
    units.forEach((u) => {
      cityCounts[u.city] = (cityCounts[u.city] || 0) + 1;
    });
    const cities = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);

    return {
      avail,
      resv,
      sold,
      buyCount: buyUnits.length,
      rentCount: rentUnits.length,
      totalVal,
      closedVal,
      rentVal,
      avgSqm,
      availPct,
      resvPct,
      soldPct,
      closeRate,
      buyPct,
      rentPct,
      confBk,
      bkRate,
      cities,
    };
  }, [units, bookings]);

  const tableUnits = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    if (!q) return units;
    return units.filter(
      (u) =>
        u.title.toLowerCase().includes(q) ||
        u.compound.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q)
    );
  }, [units, adminSearch]);

  // Multi-file upload handler
  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadError('');
    setUploading(true);
    try {
      const uploadedUrls = await uploadPropertyImages(files);
      setForm((prev) => {
        const isOnlyDefault =
          prev.gallery.length === 1 && prev.gallery[0] === DEFAULT_FALLBACK_IMG && !editingId;
        const baseGallery = isOnlyDefault ? [] : prev.gallery;
        const merged = [...new Set([...baseGallery, ...uploadedUrls])];
        return {
          ...prev,
          image: isOnlyDefault ? merged[0] : prev.image || merged[0],
          gallery: merged,
        };
      });
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Make sure each image is under 5MB.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const clean = newImageUrl.trim();
    if (!clean) return;
    setForm((prev) => {
      const isOnlyDefault =
        prev.gallery.length === 1 && prev.gallery[0] === DEFAULT_FALLBACK_IMG && !editingId;
      const baseGallery = isOnlyDefault ? [] : prev.gallery;
      const merged = [...new Set([...baseGallery, clean])];
      return {
        ...prev,
        image: isOnlyDefault ? clean : prev.image || clean,
        gallery: merged,
      };
    });
    setNewImageUrl('');
  };

  const handleSetCoverImage = (url) => {
    setForm((prev) => {
      const rest = prev.gallery.filter((item) => item !== url);
      return {
        ...prev,
        image: url,
        gallery: [url, ...rest],
      };
    });
  };

  const handleRemoveGalleryImage = (url) => {
    setForm((prev) => {
      const remaining = prev.gallery.filter((item) => item !== url);
      const nextCover = prev.image === url ? remaining[0] || '' : prev.image;
      return {
        ...prev,
        image: nextCover,
        gallery: remaining,
      };
    });
  };

  const handleExportSubscribersCsv = () => {
    if (!subscribers.length) return;
    const csv = ['Email,Subscribed Date', ...subscribers.map((s) => `${s.email},${s.createdAt}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `darcom-vip-subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setUploadError('');
    setNewImageUrl('');
    const existingGallery = [
      ...new Set(
        [u.image, ...(Array.isArray(u.gallery) ? u.gallery : [])]
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean)
      ),
    ];
    const coverImg = u.image || existingGallery[0] || DEFAULT_FALLBACK_IMG;

    setForm({
      title: u.title || '',
      city: u.city || 'New Cairo',
      compound: u.compound || '',
      type: u.type || 'Apartment',
      purpose: u.purpose || 'Buy',
      price: String(u.price || ''),
      area: String(u.area || ''),
      bedrooms: String(u.bedrooms ?? 0),
      bathrooms: String(u.bathrooms ?? 1),
      delivery: u.delivery || 'Ready to Move',
      downPaymentPercent: String(u.downPaymentPercent ?? 15),
      installmentYears: String(u.installmentYears ?? 7),
      status: u.status || 'Available',
      badge: u.badge || '',
      image: coverImg,
      gallery: existingGallery.length ? existingGallery : [coverImg],
      featuresText: Array.isArray(u.features) ? u.features.join(', ') : '',
      description: u.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUploadError('');
    try {
      const feats = form.featuresText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const cleanedGallery = [
        ...new Set(
          [form.image, ...(Array.isArray(form.gallery) ? form.gallery : [])]
            .map((url) => (typeof url === 'string' ? url.trim() : ''))
            .filter(Boolean)
        ),
      ];
      const coverImage = form.image?.trim() || cleanedGallery[0] || DEFAULT_FALLBACK_IMG;
      const finalGallery = cleanedGallery.length ? cleanedGallery : [coverImage];

      const payload = {
        title: form.title,
        city: form.city,
        compound: form.compound,
        type: form.type,
        purpose: form.purpose,
        price: Number(form.price),
        area: Number(form.area),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        delivery: form.delivery,
        status: form.status,
        badge: form.badge,
        downPaymentPercent: form.purpose === 'Buy' ? Number(form.downPaymentPercent) : 0,
        installmentYears: form.purpose === 'Buy' ? Number(form.installmentYears) : 1,
        image: coverImage,
        gallery: finalGallery,
        features: feats.length ? feats : ['24/7 Security', 'Parking'],
        description:
          form.description.trim() || `${form.type} in ${form.compound}, ${form.city}.`,
      };

      if (editingId) {
        await onUpdateUnit(editingId, payload);
        setEditingId(null);
      } else {
        await onAddUnit(payload);
      }
      setForm(EMPTY_FORM);
      setNewImageUrl('');
    } catch (err) {
      setUploadError(err.message || 'Could not save property.');
    } finally {
      setSaving(false);
    }
  };

  const cardCls =
    'bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';

  return (
    <section className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Executive Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE REAL-TIME ANALYTICS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              DarCom Executive Command Center
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onResetUnits}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset / Seed Data</span>
            </button>

            <div className="flex flex-wrap bg-slate-800/90 p-1 rounded-xl border border-white/10 text-xs font-semibold">
              {[
                { id: 'units', label: `Inventory (${units.length})` },
                { id: 'bookings', label: `Viewings (${bookings.length})` },
                { id: 'clients', label: `Clients (${clients.length})`, icon: Users },
                { id: 'newsletter', label: `VIP Leads (${subscribers.length})`, icon: Mail },
                { id: 'logs', label: `Audit Logs (${activityLogs.length})`, icon: Activity },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                      tab === t.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4 Live Financial & Sales KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${cardCls} flex items-start justify-between`}>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Portfolio Valuation</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {fmtCompact(stats.totalVal)}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                Avg {new Intl.NumberFormat('en-EG').format(stats.avgSqm)} EGP / m²
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className={`${cardCls} flex items-start justify-between`}>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Closed & Reserved Sales</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {fmtCompact(stats.closedVal)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {stats.sold} Sold • {stats.resv} Reserved ({stats.closeRate}% Close Rate)
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className={`${cardCls} flex items-start justify-between`}>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Sale vs Rent Mix</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.buyPct}% Buy / {stats.rentPct}% Rent
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                Rent Roll: {fmtCompact(stats.rentVal)} / mo
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
              <PieChart className="w-5 h-5" />
            </div>
          </div>

          <div className={`${cardCls} flex items-start justify-between`}>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Viewing Conversion</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {stats.bkRate}% Confirmed
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {stats.confBk} of {bookings.length} Requests • {clients.length} Clients
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Live Interactive Visual Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className={`lg:col-span-6 ${cardCls} space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-500" />
                <span>Live Sales Pipeline & Status Share</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {stats.closeRate}% Sold/Reserved
              </span>
            </div>

            <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${stats.soldPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Sold: ${stats.soldPct}%`}
              />
              <div
                style={{ width: `${stats.resvPct}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Reserved: ${stats.resvPct}%`}
              />
              <div
                style={{ width: `${stats.availPct}%` }}
                className="bg-indigo-500 transition-all duration-500"
                title={`Available: ${stats.availPct}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  Sold ({stats.soldPct}%)
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{stats.sold} Properties</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  Reserved ({stats.resvPct}%)
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{stats.resv} Properties</p>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                <span className="font-bold text-indigo-700 dark:text-indigo-400">
                  Available ({stats.availPct}%)
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{stats.avail} Properties</p>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-6 ${cardCls} space-y-3`}>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <span>Regional Inventory Distribution</span>
            </h3>
            <div className="space-y-2.5">
              {stats.cities.map((c) => (
                <div key={c.city} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-200">{c.city}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {c.count} units ({c.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${c.pct}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
          {tab === 'units' && (
            <div className="space-y-8">
              <form
                onSubmit={handleSubmit}
                className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {editingId ? (
                      <>
                        <Pencil className="w-4 h-4 text-indigo-500" />
                        <span>Edit Property</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-indigo-500" />
                        <span>Add New Property</span>
                      </>
                    )}
                  </h3>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setForm(EMPTY_FORM);
                        setNewImageUrl('');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel Edit</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Property Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Compound Name"
                    value={form.compound}
                    onChange={(e) => setForm({ ...form, compound: e.target.value })}
                    className={inputCls}
                  />
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={inputCls}
                  >
                    <option value="New Cairo">New Cairo</option>
                    <option value="Sheikh Zayed">Sheikh Zayed</option>
                    <option value="New Capital">New Capital</option>
                    <option value="Maadi">Maadi</option>
                    <option value="North Coast">North Coast</option>
                    <option value="Ain Sokhna">Ain Sokhna</option>
                  </select>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Villa">Villa</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Chalet">Chalet</option>
                    <option value="Office">Office</option>
                  </select>
                  <select
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Buy">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Price (EGP)"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    required
                    placeholder="Area (m²)"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className={inputCls}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 px-2.5">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1.5">Beds</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={form.bedrooms}
                        onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                        className="w-full py-2 text-sm bg-transparent focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 px-2.5">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1.5">Baths</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={form.bathrooms}
                        onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                        className="w-full py-2 text-sm bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 px-2.5">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1.5">Down%</span>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        required
                        value={form.downPaymentPercent}
                        onChange={(e) => setForm({ ...form, downPaymentPercent: e.target.value })}
                        className="w-full py-2 text-sm bg-transparent focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 px-2.5">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1.5">Years</span>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        required
                        value={form.installmentYears}
                        onChange={(e) => setForm({ ...form, installmentYears: e.target.value })}
                        className="w-full py-2 text-sm bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                  <select
                    value={form.delivery}
                    onChange={(e) => setForm({ ...form, delivery: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Ready to Move">Delivery: Ready to Move</option>
                    <option value="Under Construction">Delivery: Under Construction</option>
                    <option value="2027 Delivery">Delivery: 2027</option>
                  </select>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Available">Status: Available</option>
                    <option value="Reserved">Status: Reserved</option>
                    <option value="Sold">Status: Sold</option>
                  </select>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Badge: None</option>
                    <option value="New">Badge: New</option>
                    <option value="Hot">Badge: Hot</option>
                    <option value="Exclusive">Badge: Exclusive</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Features (comma separated)"
                    value={form.featuresText}
                    onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                    className={`${inputCls} lg:col-span-4`}
                  />

                  {/* Multi-Image Gallery Manager */}
                  <div className="lg:col-span-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Images className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                          Property Photos ({form.gallery.length})
                        </span>
                      </div>

                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploading ? 'Uploading...' : 'Upload Multiple Photos'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploading}
                          onChange={handleFilesChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Add by URL */}
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Or paste an image URL and click Add..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold hover:border-indigo-500 cursor-pointer"
                      >
                        <ImagePlus className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Add URL</span>
                      </button>
                    </div>

                    {/* Preview Grid */}
                    {form.gallery.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">
                        No photos added yet. Upload one or more photos above.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
                        {form.gallery.map((imgUrl, idx) => {
                          const isCover = imgUrl === form.image;
                          return (
                            <div
                              key={`${imgUrl}-${idx}`}
                              className={`relative group rounded-lg overflow-hidden border-2 aspect-[4/3] bg-slate-100 dark:bg-slate-950 ${
                                isCover
                                  ? 'border-amber-500 shadow-sm'
                                  : 'border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <img
                                src={imgUrl}
                                alt={`Property photo ${idx + 1}`}
                                onError={(e) => {
                                  e.currentTarget.src = DEFAULT_FALLBACK_IMG;
                                }}
                                className="w-full h-full object-cover"
                              />

                              {isCover && (
                                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold uppercase shadow">
                                  Cover
                                </span>
                              )}

                              <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                                {!isCover && (
                                  <button
                                    type="button"
                                    title="Set as Cover Photo"
                                    onClick={() => handleSetCoverImage(imgUrl)}
                                    className="p-1 rounded bg-black/70 hover:bg-amber-500 text-white hover:text-slate-950 transition-colors cursor-pointer"
                                  >
                                    <Star className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  title="Remove Photo"
                                  onClick={() => handleRemoveGalleryImage(imgUrl)}
                                  className="p-1 rounded bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <textarea
                    rows="2"
                    placeholder="Property Description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${inputCls} lg:col-span-4`}
                  />
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="lg:col-span-4 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingId ? 'Save All Property Changes' : 'Add Property'}
                  </button>
                </div>
                {uploadError && <p className="text-xs text-rose-500">{uploadError}</p>}
              </form>

              <div className="space-y-3">
                <div className="relative max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Quick filter inventory..."
                    className={`${inputCls} pl-9`}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-400">
                        <th className="py-3 pr-4">Property</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Price & Plan</th>
                        <th className="py-3 px-4">Badge</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableUnits.map((u) => {
                        const photoCount = Array.isArray(u.gallery) && u.gallery.length ? u.gallery.length : 1;
                        return (
                          <tr
                            key={u.id}
                            className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          >
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.image || DEFAULT_FALLBACK_IMG}
                                  alt={u.title}
                                  onError={(e) => {
                                    e.currentTarget.src = DEFAULT_FALLBACK_IMG;
                                  }}
                                  className="w-11 h-9 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white">
                                    {u.title}
                                  </div>
                                  <div className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                    <Images className="w-3 h-3" />
                                    <span>{photoCount} {photoCount === 1 ? 'photo' : 'photos'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                              {u.compound}, {u.city}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold">
                                {new Intl.NumberFormat('en-EG').format(u.price)} EGP
                              </div>
                              {u.purpose === 'Buy' && (
                                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                                  {u.downPaymentPercent}% Down • {u.installmentYears} Yrs
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={u.badge || ''}
                                onChange={(e) => onUpdateUnit(u.id, { badge: e.target.value })}
                                className="px-2.5 py-1 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                              >
                                <option value="">None</option>
                                <option value="New">New</option>
                                <option value="Hot">Hot</option>
                                <option value="Exclusive">Exclusive</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={u.status}
                                onChange={(e) => onUpdateUnitStatus(u.id, e.target.value)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                                  u.status === 'Sold'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                    : u.status === 'Reserved'
                                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                                    : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                                }`}
                              >
                                <option value="Available">Available</option>
                                <option value="Reserved">Reserved</option>
                                <option value="Sold">Sold</option>
                              </select>
                            </td>
                            <td className="py-3 pl-4 text-right space-x-2">
                              <button
                                onClick={() => startEdit(u)}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteUnit(u.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'bookings' && (
            <div className="overflow-x-auto">
              {bookings.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  No viewing requests submitted yet.
                </p>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-400">
                      <th className="py-3 pr-4">Client</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 pl-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 pr-4 font-semibold">{b.name}</td>
                        <td className="py-3 px-4">{b.phone}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {b.unitTitle}
                        </td>
                        <td className="py-3 px-4">{b.date}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() =>
                              onUpdateBookingStatus(
                                b.id,
                                b.status === 'Pending' ? 'Confirmed' : 'Pending'
                              )
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                              b.status === 'Confirmed'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {b.status === 'Confirmed' ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            {b.status}
                          </button>
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <button
                            onClick={() => onDeleteBooking(b.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'clients' && (
            <div className="overflow-x-auto">
              {clients.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  No registered clients found yet.
                </p>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-400">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Mobile</th>
                      <th className="py-3 px-4">Updated</th>
                      <th className="py-3 pl-4 text-right">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => (
                      <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 pr-4 font-semibold">{c.name}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{c.email}</td>
                        <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                          {c.phone || 'Not provided'}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{c.updatedAt}</td>
                        <td className="py-3 pl-4 text-right">
                          {c.phone && (
                            <a
                              href={`https://wa.me/2${c.phone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
                            >
                              Chat
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'newsletter' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  VIP launch alert subscribers collected from the website footer.
                </p>
                {subscribers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportSubscribersCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>

              {subscribers.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  No VIP newsletter subscribers yet.
                </p>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-400">
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 px-4">Subscribed Date</th>
                      <th className="py-3 pl-4 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((s) => (
                      <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 pr-4 font-semibold">{s.email}</td>
                        <td className="py-3 px-4 text-slate-400">{s.createdAt}</td>
                        <td className="py-3 pl-4 text-right">
                          <button
                            onClick={() => onDeleteSubscriber?.(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'logs' && (
            <div className="overflow-x-auto">
              {activityLogs.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  No database activity logged yet. Any unit or booking change will appear here automatically.
                </p>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-400">
                      <th className="py-3 pr-4">Action</th>
                      <th className="py-3 px-4">Target</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 pl-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 pr-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {log.entityType}: {log.entityTitle}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {log.details}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400">{log.actorEmail}</td>
                        <td className="py-3 pl-4 text-right text-xs text-slate-400">
                          {log.createdAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'settings' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSettingsSaved(false);
                await onSaveSiteSettings(settingsForm);
                setSettingsSaved(true);
              }}
              className="space-y-6"
            >
              {settingsSaved && (
                <div className="p-3 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All website settings & section visibility updated live!</span>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contact, Social & Hero Content
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Display Phone"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp (with 20)"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="email"
                    placeholder="Official Email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Instagram URL"
                    value={settingsForm.instagram}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Facebook URL"
                    value={settingsForm.facebook}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Hero Badge Text"
                    value={settingsForm.heroBadge}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Hero Headline"
                    value={settingsForm.heroTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    className={`${inputCls} sm:col-span-2`}
                  />
                  <input
                    type="text"
                    placeholder="Hero Button Text"
                    value={settingsForm.heroCta}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroCta: e.target.value })}
                    className={inputCls}
                  />
                  <textarea
                    rows="2"
                    placeholder="Hero Subtitle..."
                    value={settingsForm.heroSubtitle}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })
                    }
                    className={`${inputCls} lg:col-span-3`}
                  />
                  <textarea
                    rows="2"
                    placeholder="Footer Description..."
                    value={settingsForm.footerDesc}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, footerDesc: e.target.value })
                    }
                    className={`${inputCls} sm:col-span-2`}
                  />
                  <input
                    type="text"
                    placeholder="Footer Locations Line"
                    value={settingsForm.locationsText}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, locationsText: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Homepage Section Visibility Controls
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold">
                  {[
                    { key: 'showVideoSection', label: 'Architectural Video Section' },
                    { key: 'showLocationsSection', label: 'Prime Locations Section' },
                    { key: 'showWhyDarcomSection', label: 'Why DarCom Section' },
                    { key: 'showFeaturedSlider', label: 'Featured Properties Slider' },
                  ].map((sec) => (
                    <label
                      key={sec.key}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                    >
                      <span>{sec.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(settingsForm[sec.key])}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, [sec.key]: e.target.checked })
                        }
                        className="w-4 h-4 accent-indigo-600"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Save All Website Settings
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}