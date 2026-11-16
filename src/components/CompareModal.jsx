import { X, Trash2 } from 'lucide-react';

export default function CompareModal({ units, onRemove, onClose }) {
  const fmt = (num) => new Intl.NumberFormat('en-EG').format(Math.round(num)) + ' EGP';

  const rows = [
    { label: 'City', render: (u) => u.city },
    { label: 'Compound', render: (u) => u.compound },
    { label: 'Type', render: (u) => `${u.type} (${u.purpose})` },
    {
      label: 'Price',
      render: (u) => fmt(u.price) + (u.purpose === 'Rent' ? ' / mo' : ''),
    },
    { label: 'Area', render: (u) => `${u.area} m²` },
    {
      label: 'Price / m²',
      render: (u) => (u.purpose === 'Buy' ? fmt(u.price / u.area) : '—'),
    },
    { label: 'Bedrooms', render: (u) => (u.bedrooms > 0 ? u.bedrooms : 'Office') },
    { label: 'Bathrooms', render: (u) => u.bathrooms },
    { label: 'Delivery', render: (u) => u.delivery },
    {
      label: 'Payment Plan',
      render: (u) =>
        u.purpose === 'Buy' ? `${u.downPaymentPercent}% Down / ${u.installmentYears} Yrs` : 'Monthly Rent',
    },
    { label: 'Status', render: (u) => u.status },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#161616] border border-black/15 dark:border-white/15 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111111] dark:text-white">
            Compare Properties ({units.length}/3)
          </h2>
          <button
            onClick={onClose}
            className="p-2 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {units.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#111111]/60 dark:text-white/60">
            Select up to 3 properties using the scale icon on any card to compare them side-by-side.
          </div>
        ) : (
          <div className="overflow-x-auto p-6">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-3 pr-4 text-xs uppercase tracking-wider text-[#111111]/50 dark:text-white/50 w-36">
                    Specification
                  </th>
                  {units.map((u) => (
                    <th key={u.id} className="py-3 px-4 min-w-[200px] align-top">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-[#111111] dark:text-white">
                          {u.title}
                        </span>
                        <button
                          onClick={() => onRemove(u.id)}
                          title="Remove"
                          className="p-1 text-[#111111]/50 dark:text-white/50 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-3 pr-4 text-xs font-medium text-[#111111]/60 dark:text-white/60">
                      {row.label}
                    </td>
                    {units.map((u) => (
                      <td key={u.id} className="py-3 px-4 text-[#111111] dark:text-white">
                        {row.render(u)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}