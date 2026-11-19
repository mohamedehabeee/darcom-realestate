import React, { useState } from 'react';
import { Bell, X, CheckCircle2, TrendingDown } from 'lucide-react';
import { createPriceAlert } from '../services/realEstateService';

export default function PriceAlertModal({ unit, user, isAr, onClose }) {
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^(\+20|0)?1[0125][0-9]{8}$/.test(cleanPhone)) {
      setError(
        isAr
          ? 'يرجى إدخال رقم موبايل مصري صحيح (مثل 010xxxxxxxx)'
          : 'Please enter a valid Egyptian mobile number (e.g., 010xxxxxxxx)'
      );
      return;
    }

    setLoading(true);
    try {
      await createPriceAlert({
        unitId: unit.id,
        unitTitle: unit.title,
        currentPrice: unit.price,
        targetPrice: targetPrice || null,
        userId: user?.id || null,
        name,
        phone: cleanPhone,
        email,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || (isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                {isAr ? 'تنبيه نزول السعر' : 'Price Drop Alert'}
              </h3>
              <p className="text-xs text-zinc-500 truncate max-w-[220px]">{unit.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                {isAr ? 'تم تفعيل التنبيه بنجاح!' : 'Alert Activated!'}
              </h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {isAr
                  ? 'هنتواصل معاك فوراً لو سعر الوحدة دي نزل أو نزل عليها عرض جديد.'
                  : "We'll notify you immediately if the price drops or a new offer launches."}
              </p>
              <button
                onClick={onClose}
                className="mt-4 w-full py-2.5 bg-zinc-900 dark:bg-amber-500 text-white dark:text-black font-semibold rounded-xl hover:opacity-90 transition"
              >
                {isAr ? 'تم' : 'Done'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex justify-between items-center text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {isAr ? 'السعر الحالي:' : 'Current Price:'}
                </span>
                <span className="font-bold text-zinc-900 dark:text-amber-400">
                  {Number(unit.price).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                </span>
              </div>

              {error && (
                <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  {isAr ? 'الاسم بالكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'مثال: محمد إيهاب' : 'e.g. Mohamed Ehab'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  {isAr ? 'رقم الموبايل (واتساب) *' : 'Mobile Number (WhatsApp) *'}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  {isAr ? 'السعر المستهدف (اختياري)' : 'Target Price (Optional)'}
                </label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder={isAr ? 'بلغني لو وصل للسعر ده...' : 'Notify me if it reaches...'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-zinc-900 dark:bg-amber-500 text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
              >
                <Bell className="w-4 h-4" />
                {loading
                  ? isAr ? 'جاري التفعيل...' : 'Activating...'
                  : isAr ? 'تفعيل تنبيه السعر' : 'Activate Price Alert'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}