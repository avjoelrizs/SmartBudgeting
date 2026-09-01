import React, { useMemo, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Gamepad2, 
  Receipt, 
  CircleDollarSign,
  PieChart as PieChartIcon,
  Wallet,
  ReceiptText,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { CATEGORIES } from '../../data/dummyTransactions';
import { formatRupiah } from '../../utils/formatters';

// Map icon string to Lucide component
const ICON_MAP = {
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Receipt,
  CircleDollarSign,
  Wallet,
};

// Palet warna cerah & harmonis untuk masing-masing kategori
const CATEGORY_COLORS = {
  food: { fill: '#FB7185', hex: '#FB7185', label: 'Makanan & Minuman' },
  transport: { fill: '#38BDF8', hex: '#38BDF8', label: 'Transportasi' },
  shopping: { fill: '#C084FC', hex: '#C084FC', label: 'Belanja' },
  entertainment: { fill: '#F472B6', hex: '#F472B6', label: 'Hiburan' },
  bills: { fill: '#F59E0B', hex: '#F59E0B', label: 'Tagihan & Langganan' },
  other: { fill: '#94A3B8', hex: '#94A3B8', label: 'Lainnya' },
};

const FALLBACK_PALETTE = [
  '#FB7185', '#38BDF8', '#C084FC', '#F472B6', '#F59E0B', '#34D399', '#818CF8', '#94A3B8'
];

export const Laporan = ({ 
  transactions = [], 
  budget 
}) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Total Pemasukan
  const calculatedIncome = useMemo(() => {
    try {
      let incomeFromTxs = 0;
      if (Array.isArray(transactions)) {
        transactions.forEach((tx) => {
          if (tx && tx.type === 'income') {
            incomeFromTxs += Number(tx.amount) || 0;
          }
        });
      }
      return (Number(budget?.monthlyIncome) || 0) + incomeFromTxs;
    } catch (e) {
      return Number(budget?.monthlyIncome) || 0;
    }
  }, [transactions, budget]);

  // Total Pengeluaran
  const calculatedExpense = useMemo(() => {
    try {
      let sum = 0;
      if (Array.isArray(transactions)) {
        transactions.forEach((tx) => {
          if (tx && tx.type === 'expense') {
            sum += Number(tx.amount) || 0;
          }
        });
      }
      return sum;
    } catch (e) {
      return 0;
    }
  }, [transactions]);

  // Kalkulasi Breakdown Kategori
  const categoryBreakdown = useMemo(() => {
    try {
      const map = {};

      if (Array.isArray(transactions)) {
        transactions.forEach((tx) => {
          if (tx && tx.type === 'expense') {
            const rawCat = tx.category ? String(tx.category).toLowerCase().trim() : 'other';
            const catKey = CATEGORIES[rawCat] ? rawCat : 'other';
            const amt = Number(tx.amount) || 0;

            if (!map[catKey]) {
              map[catKey] = {
                id: catKey,
                amount: 0,
                count: 0,
              };
            }
            map[catKey].amount += amt;
            map[catKey].count += 1;
          }
        });
      }

      // Urutkan dari pengeluaran terbesar ke terkecil
      return Object.values(map)
        .map((item, index) => {
          const categoryData = CATEGORIES[item.id] || {
            label: item.id === 'other' ? 'Lainnya' : item.id,
            icon: 'CircleDollarSign',
          };
          const percentage = calculatedExpense > 0 
            ? ((item.amount / calculatedExpense) * 100) 
            : 0;
          const colorObj = CATEGORY_COLORS[item.id] || { 
            hex: FALLBACK_PALETTE[index % FALLBACK_PALETTE.length] 
          };

          return {
            ...item,
            label: categoryData.label || 'Lainnya',
            icon: categoryData.icon || 'CircleDollarSign',
            percentage: isNaN(percentage) ? 0 : Number(percentage.toFixed(1)),
            color: colorObj.hex,
          };
        })
        .sort((a, b) => b.amount - a.amount);
    } catch (err) {
      console.error('Error calculating category breakdown:', err);
      return [];
    }
  }, [transactions, calculatedExpense]);

  // Radius dan Keliling Lingkaran Pie Chart Donut
  const radius = 68;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  // Hitung offset slice SVG Pie Chart
  let cumulativePercentage = 0;
  const pieSlices = categoryBreakdown.map((cat) => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
    cumulativePercentage += cat.percentage;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Data kategori yang sedang di-hover
  const activeCategoryData = hoveredCategory 
    ? categoryBreakdown.find((c) => c.id === hoveredCategory)
    : null;

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Ringkasan Pemasukan & Pengeluaran */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Kartu 1: Total Pemasukan Bulan Ini (Hijau) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Total Pemasukan</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
              {formatRupiah(calculatedIncome)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Gaji pokok & alokasi anggaran aktif
            </p>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Kartu 2: Total Pengeluaran Bulan Ini (Merah) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Total Pengeluaran</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-500">
              {formatRupiah(calculatedExpense)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Total {transactions.filter(t => t.type === 'expense').length} transaksi belanja & jajan
            </p>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. Visualisasi Grafik Pie Chart & Breakdown Pengeluaran */}
      {categoryBreakdown.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
            <PieChartIcon className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h4 className="text-base font-bold text-slate-200">
            Belum Ada Data Pengeluaran
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Grafik Pie Chart dan rincian proporsi belanja akan otomatis terbentuk saat Anda mencatat pengeluaran harian.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Kolom Kiri: Visual Donut / Pie Chart Interaktif */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col items-center justify-center relative">
            
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Grafik Pie Chart
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Proporsi Kategori
              </span>
            </div>

            {/* SVG Pie / Donut Chart */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-2">
              <svg 
                viewBox="0 0 200 200" 
                className="w-full h-full -rotate-90 transform transition-all duration-300"
              >
                {/* Background Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth={strokeWidth}
                />

                {/* Slices */}
                {pieSlices.map((slice) => {
                  const isHovered = hoveredCategory === slice.id;
                  return (
                    <circle
                      key={slice.id}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      className="cursor-pointer transition-all duration-300 ease-out"
                      style={{
                        filter: isHovered ? `drop-shadow(0 0 6px ${slice.color})` : 'none',
                        opacity: hoveredCategory && !isHovered ? 0.45 : 1,
                      }}
                      onMouseEnter={() => setHoveredCategory(slice.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() => setHoveredCategory(hoveredCategory === slice.id ? null : slice.id)}
                    />
                  );
                })}
              </svg>

              {/* Teks Tengah Donut Chart (Berubah Dinamis saat Di-Hover) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                {activeCategoryData ? (
                  <div className="animate-in fade-in duration-200 space-y-0.5">
                    <span 
                      className="text-[10px] font-bold uppercase tracking-wider block truncate max-w-[130px]"
                      style={{ color: activeCategoryData.color }}
                    >
                      {activeCategoryData.label}
                    </span>
                    <p className="text-sm sm:text-base font-extrabold font-mono text-white">
                      {formatRupiah(activeCategoryData.amount)}
                    </p>
                    <span className="inline-block text-[10px] font-bold font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                      {activeCategoryData.percentage}%
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Total Keluar
                    </span>
                    <p className="text-base sm:text-lg font-extrabold font-mono text-slate-100">
                      {formatRupiah(calculatedExpense)}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      Sentuh irisan grafik
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Mini Legend */}
            <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80">
              {categoryBreakdown.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setHoveredCategory(item.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center gap-2 p-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                    hoveredCategory === item.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-slate-300 truncate">
                      {item.label}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-slate-400">
                      {item.percentage}%
                    </p>
                  </div>
                </button>
              ))}
            </div>

          </div>

          {/* Kolom Kanan: Rincian Lengkap per Kategori */}
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Rincian Detail per Kategori
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Diurutkan berdasarkan porsi pengeluaran terbesar
                </p>
              </div>

              <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 font-mono">
                {categoryBreakdown.length} Kategori
              </span>
            </div>

            {/* List Detail Kategori */}
            <div className="space-y-3 pt-1">
              {categoryBreakdown.map((item) => {
                const IconComponent = ICON_MAP[item.icon] || CircleDollarSign;
                const isHovered = hoveredCategory === item.id;

                return (
                  <div 
                    key={item.id} 
                    onMouseEnter={() => setHoveredCategory(item.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer space-y-2.5 ${
                      isHovered 
                        ? 'bg-slate-800/90 border-slate-600 shadow-md' 
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Category Details: Icon, Name, Nominal, Percentage */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{ 
                            backgroundColor: `${item.color}15`, 
                            borderColor: `${item.color}30`,
                            color: item.color
                          }}
                        >
                          <IconComponent className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-200 leading-tight">
                            {item.label}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {item.count} transaksi
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold font-mono text-slate-100">
                          {formatRupiah(item.amount)}
                        </p>
                        <span 
                          className="inline-block text-[11px] font-bold font-mono px-2 py-0.5 rounded-lg mt-0.5 border"
                          style={{ 
                            backgroundColor: `${item.color}15`, 
                            borderColor: `${item.color}30`,
                            color: item.color
                          }}
                        >
                          {item.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar dengan Warna Kategori Masing-Masing */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, Math.max(item.percentage, 2))}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
