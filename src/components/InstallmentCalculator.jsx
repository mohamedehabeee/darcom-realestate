import { useState } from 'react';

export default function InstallmentCalculator({ unit }) {
  const [downPercent, setDownPercent] = useState(unit.downPaymentPercent || 15);
  const [years, setYears] = useState(unit.installmentYears || 7);
  const [deliveryPercent, setDeliveryPercent] = useState(5);

  const fmt = (num) => new Intl.NumberFormat('en-EG').format(Math.round(num)) + ' EGP';

  if (unit.purpose === 'Rent') {
    return (
      <div className="p-4 border border-black/10 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#111111] space-y-2">
        <h4 className="text-sm font-semibold text-[#111111] dark:text-white">
          Rental Terms Summary
        </h4>
        <div className="flex justify-between text-sm text-[#111111]/75 dark:text-white/75">
          <span>Monthly Rent</span>
          <span className="font-semibold text-[#111111] dark:text-white">{fmt(unit.price)}</span>
        </div>
        <div className="flex justify-between text-sm text-[#111111]/75 dark:text-white/75">
          <span>Security Deposit (2 Months)</span>
          <span className="font-semibold text-[#C59B27]">{fmt(unit.price * 2)}</span>
        </div>
      </div>
    );
  }

  const downAmount = (unit.price * downPercent) / 100;
  const deliveryAmount = (unit.price * deliveryPercent) / 100;
  const remaining = Math.max(0, unit.price - downAmount - deliveryAmount);
  const monthly = remaining / (years * 12);
  const pricePerSqm = unit.price / unit.area;

  return (
    <div className="p-5 border border-black/10 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#111111] space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-[#111111] dark:text-white">
          Installment Calculator
        </h4>
        <span className="text-xs text-[#C59B27] font-medium">
          {fmt(pricePerSqm)} / m²
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1 text-[#111111]/75 dark:text-white/75">
            <span>Down Payment</span>
            <span className="font-semibold text-[#111111] dark:text-white">{downPercent}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={downPercent}
            onChange={(e) => setDownPercent(Number(e.target.value))}
            className="w-full accent-[#C59B27] cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1 text-[#111111]/75 dark:text-white/75">
            <span>Installment Period</span>
            <span className="font-semibold text-[#111111] dark:text-white">{years} Years</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-[#C59B27] cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1 text-[#111111]/75 dark:text-white/75">
            <span>Delivery Payment</span>
            <span className="font-semibold text-[#111111] dark:text-white">{deliveryPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="5"
            value={deliveryPercent}
            onChange={(e) => setDeliveryPercent(Number(e.target.value))}
            className="w-full accent-[#C59B27] cursor-pointer"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-black/10 dark:border-white/10 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-[#111111]/60 dark:text-white/60">Down Payment</p>
          <p className="text-sm font-semibold text-[#111111] dark:text-white mt-0.5">{fmt(downAmount)}</p>
        </div>
        <div>
          <p className="text-[#111111]/60 dark:text-white/60">Monthly Installment</p>
          <p className="text-sm font-semibold text-[#C59B27] mt-0.5">{fmt(monthly)}</p>
        </div>
      </div>
    </div>
  );
}