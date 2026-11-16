import { useState } from 'react';
import { Plus, Trash2, Check, Clock, Pencil, X, RotateCcw, Upload } from 'lucide-react';

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
  status: 'Available',
  badge: '',
  image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
};

function compressImageFile(file, maxWidth = 1000, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboard({
  units,
  bookings,
  onAddUnit,
  onUpdateUnit,
  onUpdateUnitStatus,
  onDeleteUnit,
  onResetUnits,
  onUpdateBookingStatus,
  onDeleteBooking,
}) {
  const [tab, setTab] = useState('units');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const inputStyle =
    'w-full px-3 py-2 text-sm bg-white border border-black/20 text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#C59B27]';

  const availableCount = units.filter((u) => u.status === 'Available').length;
  const closedCount = units.filter((u) => u.status === 'Reserved' || u.status === 'Sold').length;
  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await compressImageFile(file);
      setForm((prev) => ({ ...prev, image: dataUrl }));
    } catch (err) {
      setUploadError(err.message);
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
      status: unit.status || 'Available',
      badge: unit.badge || '',
      image: unit.image || EMPTY_FORM.image,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUploadError('');
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      area: Number(form.area),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      delivery: 'Ready to Move',
      downPaymentPercent: form.purpose === 'Buy' ? 15 : 0,
      installmentYears: form.purpose === 'Buy' ? 7 : 1,
      description: `${form.type} in ${form.compound}, ${form.city}.`,
    };

    if (editingId) {
      onUpdateUnit(editingId, payload);
      setEditingId(null);
    } else {
      onAddUnit(payload);
    }
    setUploadError('');
    setForm(EMPTY_FORM);
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
              title="Restore default 12 properties"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-black/15 text-xs font-medium text-[#111111] hover:border-[#C59B27] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>Reset Data</span>
            </button>

            <div className="flex border border-black/15 text-xs font-semibold">
              <button
                onClick={() => setTab('units')}
                className={`px-4 py-2 cursor-pointer ${
                  tab === 'units' ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'
                }`}
              >
                Properties ({units.length})
              </button>
              <button
                onClick={() => setTab('bookings')}
                className={`px-4 py-2 cursor-pointer ${
                  tab === 'bookings' ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'
                }`}
              >
                Viewing Requests ({bookings.length})
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

        {tab === 'units' ? (
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="p-5 bg-[#FAF8F5] border border-black/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  {editingId ? (
                    <>
                      <Pencil className="w-4 h-4 text-[#C59B27]" />
                      <span>Edit Property</span>
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

                {/* Image URL + Device Upload + Preview */}
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
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="lg:col-span-4 py-2.5 px-4 bg-[#111111] text-white text-sm font-semibold hover:bg-[#C59B27] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Add Property'}
                </button>
              </div>

              {uploadError && (
                <p className="text-xs text-red-600">{uploadError}</p>
              )}
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-black/15 text-xs uppercase text-neutral-500">
                    <th className="py-3 pr-4">Property</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Price</th>
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
                        {new Intl.NumberFormat('en-EG').format(u.price)} EGP
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
        ) : (
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
      </div>
    </section>
  );
}