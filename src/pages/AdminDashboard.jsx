import { useState } from 'react';
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
} from 'lucide-react';
import { uploadPropertyImage } from '../services/realEstateService';

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
  image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  featuresText: 'Private Garden, 24/7 Security, Covered Parking',
  description: '',
};

export default function AdminDashboard({
  units,
  bookings,
  clients = [],
  siteSettings,
  onAddUnit,
  onUpdateUnit,
  onUpdateUnitStatus,
  onDeleteUnit,
  onResetUnits,
  onUpdateBookingStatus,
  onDeleteBooking,
  onSaveSiteSettings,
}) {
  const [tab, setTab] = useState('units');
  const [form, setForm] = useState(EMPTY_FORM);
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
    heroTitle: siteSettings?.heroTitle || 'Find Your Next Home With Clear Numbers.',
    heroSubtitle: siteSettings?.heroSubtitle || '',
  }));
  const [settingsSaved, setSettingsSaved] = useState(false);

  const inputStyle =
    'w-full px-3 py-2 text-sm bg-white border border-black/20 text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#C59B27]';

  const availableCount = units.filter((u) => u.status === 'Available').length;
  const closedCount = units.filter((u) => u.status === 'Reserved' || u.status === 'Sold').length;
  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const publicUrl = await uploadPropertyImage(file);
      setForm((prev) => ({ ...prev, image: publicUrl }));
    } catch (err) {
      setUploadError(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (unit) => {
    setEditingId(unit.id);
    setUploadError('');
    setForm({
      title: unit.title || '',
      city: unit.city || 'New Cairo',
      compound: unit.compound || '',
      type: unit.type || 'Apartment',
      purpose: unit.purpose || 'Buy',
      price: String(unit.price || ''),
      area: String(unit.area || ''),
      bedrooms: String(unit.bedrooms ?? 0),
      bathrooms: String(unit.bathrooms ?? 1),
      delivery: unit.delivery || 'Ready to Move',
      downPaymentPercent: String(unit.downPaymentPercent ?? 15),
      installmentYears: String(unit.installmentYears ?? 7),
      status: unit.status || 'Available',
      badge: unit.badge || '',
      image: unit.image || EMPTY_FORM.image,
      featuresText: Array.isArray(unit.features) ? unit.features.join(', ') : '',
      description: unit.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUploadError('');
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUploadError('');
    try {
      const parsedFeatures = form.featuresText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

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
        image: form.image,
        features: parsedFeatures.length ? parsedFeatures : ['24/7 Security', 'Parking'],
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
    } catch (err) {
      setUploadError(err.message || 'Could not save property.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsSaved(false);
    await onSaveSiteSettings(settingsForm);
    setSettingsSaved(true);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white text-[#111111] border border-black/15 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
              Management Console
            </p>
            <h2 className="text-2xl font-semibold mt-0.5">DarCom Admin Dashboard</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onResetUnits}
              title="Seed / restore default 12 properties"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-black/15 text-xs font-medium text-[#111111] hover:border-[#C59B27] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>Reset / Seed Data</span>
            </button>

            <div className="flex flex-wrap border border-black/15 text-xs font-semibold">
              <button
                onClick={() => setTab('units')}
                className={`px-3.5 py-2 cursor-pointer ${
                  tab === 'units' ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'
                }`}
              >
                Properties ({units.length})
              </button>
              <button
                onClick={() => setTab('bookings')}
                className={`px-3.5 py-2 cursor-pointer ${
                  tab === 'bookings' ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'
                }`}
              >
                Viewings ({bookings.length})
              </button>
              <button
                onClick={() => setTab('clients')}
                className={`inline-flex items-center gap-1 px-3.5 py-2 cursor-pointer ${
                  tab === 'clients' ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Clients ({clients.length})</span>
              </button>
              <button
                onClick={() => setTab('settings')}
                className={`inline-flex items-center gap-1 px-3.5 py-2 cursor-pointer ${
                  tab === 'settings' ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Site Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#FAF8F5] border border-black/10">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Total Properties</p>
            <p className="text-2xl font-semibold mt-1">{units.length}</p>
          </div>
          <div className="p-4 bg-[#FAF8F5] border border-black/10">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Available</p>
            <p className="text-2xl font-semibold mt-1 text-[#C59B27]">{availableCount}</p>
          </div>
          <div className="p-4 bg-[#FAF8F5] border border-black/10">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Reserved / Sold</p>
            <p className="text-2xl font-semibold mt-1">{closedCount}</p>
          </div>
          <div className="p-4 bg-[#FAF8F5] border border-black/10">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Pending Viewings</p>
            <p className="text-2xl font-semibold mt-1 text-[#C59B27]">{pendingBookings}</p>
          </div>
        </div>

        {tab === 'units' && (
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="p-5 bg-[#FAF8F5] border border-black/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  {editingId ? (
                    <>
                      <Pencil className="w-4 h-4 text-[#C59B27]" />
                      <span>Edit Property (Full Control)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-[#C59B27]" />
                      <span>Add New Property</span>
                    </>
                  )}
                </h3>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-[#111111] cursor-pointer"
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
                  className={inputStyle}
                />
                <input
                  type="text"
                  required
                  placeholder="Compound Name"
                  value={form.compound}
                  onChange={(e) => setForm({ ...form, compound: e.target.value })}
                  className={inputStyle}
                />
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={inputStyle}
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
                  className={inputStyle}
                >
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Chalet">Chalet</option>
                  <option value="Office">Office</option>
                </select>
                <select
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className={inputStyle}
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
                  className={inputStyle}
                />
                <input
                  type="number"
                  required
                  placeholder="Area (m²)"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className={inputStyle}
                />

                {/* Beds & Baths */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center border border-black/20 bg-white px-2.5 focus-within:border-[#C59B27]">
                    <span className="text-[11px] font-semibold text-neutral-500 mr-1.5">Beds</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.bedrooms}
                      onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                      className="w-full py-2 text-sm bg-transparent text-[#111111] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center border border-black/20 bg-white px-2.5 focus-within:border-[#C59B27]">
                    <span className="text-[11px] font-semibold text-neutral-500 mr-1.5">Baths</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={form.bathrooms}
                      onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                      className="w-full py-2 text-sm bg-transparent text-[#111111] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Down Payment % & Installment Years */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center border border-black/20 bg-white px-2.5 focus-within:border-[#C59B27]">
                    <span className="text-[11px] font-semibold text-neutral-500 mr-1.5">Down%</span>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      required
                      value={form.downPaymentPercent}
                      onChange={(e) => setForm({ ...form, downPaymentPercent: e.target.value })}
                      className="w-full py-2 text-sm bg-transparent text-[#111111] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center border border-black/20 bg-white px-2.5 focus-within:border-[#C59B27]">
                    <span className="text-[11px] font-semibold text-neutral-500 mr-1.5">Years</span>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      required
                      value={form.installmentYears}
                      onChange={(e) => setForm({ ...form, installmentYears: e.target.value })}
                      className="w-full py-2 text-sm bg-transparent text-[#111111] focus:outline-none"
                    />
                  </div>
                </div>

                <select
                  value={form.delivery}
                  onChange={(e) => setForm({ ...form, delivery: e.target.value })}
                  className={inputStyle}
                >
                  <option value="Ready to Move">Delivery: Ready to Move</option>
                  <option value="Under Construction">Delivery: Under Construction</option>
                  <option value="2027 Delivery">Delivery: 2027</option>
                </select>

                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={inputStyle}
                >
                  <option value="Available">Status: Available</option>
                  <option value="Reserved">Status: Reserved</option>
                  <option value="Sold">Status: Sold</option>
                </select>

                <select
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className={inputStyle}
                >
                  <option value="">Badge: None</option>
                  <option value="New">Badge: New</option>
                  <option value="Hot">Badge: Hot</option>
                  <option value="Exclusive">Badge: Exclusive</option>
                </select>

                {/* Features & Image */}
                <input
                  type="text"
                  placeholder="Features (comma separated: Pool, Smart Home...)"
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  className={`${inputStyle} sm:col-span-2`}
                />

                <div className="sm:col-span-2 flex items-center gap-2">
                  {form.image && (
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-10 h-10 object-cover border border-black/15 shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    placeholder="Paste Image URL or upload from device..."
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className={inputStyle}
                  />
                  <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 border border-black/20 bg-white text-xs font-semibold text-[#111111] hover:border-[#C59B27] cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  rows="2"
                  placeholder="Full Property Description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputStyle} lg:col-span-4`}
                />

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="lg:col-span-4 py-2.5 px-4 bg-[#111111] text-white text-sm font-semibold hover:bg-[#C59B27] hover:text-[#111111] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : editingId ? 'Save All Property Changes' : 'Add Property'}
                </button>
              </div>

              {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-black/15 text-xs uppercase text-neutral-500">
                    <th className="py-3 pr-4">Property</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Price & Plan</th>
                    <th className="py-3 px-4">Badge</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.id} className="border-b border-black/5">
                      <td className="py-3 pr-4 font-medium">{u.title}</td>
                      <td className="py-3 px-4 text-neutral-600">
                        {u.compound}, {u.city}
                      </td>
                      <td className="py-3 px-4">
                        <div>{new Intl.NumberFormat('en-EG').format(u.price)} EGP</div>
                        {u.purpose === 'Buy' && (
                          <div className="text-[11px] text-[#C59B27]">
                            {u.downPaymentPercent}% Down • {u.installmentYears} Yrs
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={u.badge || ''}
                          onChange={(e) => onUpdateUnit(u.id, { badge: e.target.value })}
                          className="px-2 py-1 text-xs border border-black/20 bg-white text-[#111111]"
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
                          className="px-2 py-1 text-xs border border-black/20 bg-white text-[#111111]"
                        >
                          <option value="Available">Available</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </td>
                      <td className="py-3 pl-4 text-right space-x-2">
                        <button
                          onClick={() => startEdit(u)}
                          title="Edit Property"
                          className="p-1.5 text-neutral-600 hover:text-[#C59B27] cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteUnit(u.id)}
                          title="Delete Property"
                          className="p-1.5 text-neutral-500 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'bookings' && (
          <div className="overflow-x-auto">
            {bookings.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-500">
                No viewing requests submitted yet.
              </p>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-black/15 text-xs uppercase text-neutral-500">
                    <th className="py-3 pr-4">Client</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Preferred Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-black/5">
                      <td className="py-3 pr-4 font-medium">{b.name}</td>
                      <td className="py-3 px-4">{b.phone}</td>
                      <td className="py-3 px-4 text-neutral-600">{b.unitTitle}</td>
                      <td className="py-3 px-4">{b.date}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            onUpdateBookingStatus(
                              b.id,
                              b.status === 'Pending' ? 'Confirmed' : 'Pending'
                            )
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                            b.status === 'Confirmed'
                              ? 'bg-[#C59B27] text-[#111111]'
                              : 'bg-neutral-100 text-[#111111]'
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
                          title="Delete Request"
                          className="p-1.5 text-neutral-500 hover:text-red-600 cursor-pointer"
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
              <p className="py-10 text-center text-sm text-neutral-500">
                No registered clients found yet.
              </p>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-black/15 text-xs uppercase text-neutral-500">
                    <th className="py-3 pr-4">Client Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 pl-4 text-right">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="border-b border-black/5">
                      <td className="py-3 pr-4 font-medium">{c.name}</td>
                      <td className="py-3 px-4 text-neutral-600">{c.email}</td>
                      <td className="py-3 px-4 font-semibold text-[#C59B27]">
                        {c.phone || 'Not provided'}
                      </td>
                      <td className="py-3 px-4 text-neutral-500">{c.updatedAt}</td>
                      <td className="py-3 pl-4 text-right">
                        {c.phone && (
                          <a
                            href={`https://wa.me/2${c.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex px-3 py-1 bg-[#111111] text-[#C59B27] text-xs font-semibold hover:bg-[#C59B27] hover:text-[#111111] transition-colors"
                          >
                            WhatsApp
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

        {tab === 'settings' && (
          <form onSubmit={handleSaveSettingsSubmit} className="p-5 bg-[#FAF8F5] border border-black/10 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-[#C59B27]" />
              <span>Global Website & Contact Settings</span>
            </h3>

            {settingsSaved && (
              <div className="p-3 text-xs bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Website settings updated live!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Display Phone</label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">WhatsApp Number (with 20)</label>
                <input
                  type="text"
                  value={settingsForm.whatsapp}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Official Email</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Instagram Link</label>
                <input
                  type="text"
                  value={settingsForm.instagram}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Facebook Link</label>
                <input
                  type="text"
                  value={settingsForm.facebook}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Hero Main Headline</label>
                <input
                  type="text"
                  value={settingsForm.heroTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                  className={inputStyle}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold mb-1">Hero Description</label>
                <textarea
                  rows="2"
                  value={settingsForm.heroSubtitle}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })
                  }
                  className={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-[#111111] text-[#C59B27] text-xs font-semibold uppercase tracking-widest hover:bg-[#C59B27] hover:text-[#111111] transition-colors cursor-pointer"
            >
              Save Website Settings
            </button>
          </form>
        )}
      </div>
    </section>
  );
}