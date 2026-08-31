import React, { useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Gamepad2, 
  Receipt, 
  CircleDollarSign,
  PieChart,
  Wallet,
  ReceiptText
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

export const Laporan = ({ 
  transactions = [], 
  totalIncome = 0, 
  totalExpense = 0, 
  budget 
}) => {
  // Total Pemasukan Safely Calculated
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

  // Total Pengeluaran Safely Calculated
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

  // 1. Kalkulasi Breakdown Kategori (Safe dengan Try-Catch)
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

      // Convert to array and sort descending (terbesar ke terkecil)
      return Object.values(map)
        .map((item) => {
          const categoryData = CATEGORIES[item.id] || {
            label: item.id === 'other' ? 'Lainnya' : item.id,
            icon: 'CircleDollarSign',
          };
          const percentage = calculatedExpense > 0 
            ? Math.min(100, Math.max(0, Math.round((item.amount / calculatedExpense) * 100))) 
            : 0;

          return {
            ...item,
            label: categoryData.label || 'Lainnya',
            icon: categoryData.icon || 'CircleDollarSign',
            percentage: isNaN(percentage) ? 0 : percentage,
          };
        })
        .sort((a, b) => b.amount - a.amount);
    } catch (err) {
      console.error('Error calculating category breakdown:', err);
      return [];
    }
  }, [transactions, calculatedExpense]);

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Ringkasan: 2 Kartu Kecil di Atas (Pemasukan Hijau & Pengeluaran Merah) */}
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
              Gaji pokok & pemasukan tambahan
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
              Akumulasi belanja & jajan bulan ini
            </p>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. Visualisasi Breakdown Kategori (Progress Bar) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              Breakdown Pengeluaran per Kategori
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Diurutkan dari pengeluaran terbesar ke terkecil
            </p>
          </div>

          <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 font-mono">
            {categoryBreakdown.length} Kategori
          </span>
        </div>

        {/* Category List with Progress Bars */}
        {categoryBreakdown.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <ReceiptText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300">
              Belum ada catatan pengeluaran
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Catatan pengeluaran yang Anda tambahkan akan otomatis divisualisasikan di halaman ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {categoryBreakdown.map((item) => {
              const IconComponent = ICON_MAP[item.icon] || CircleDollarSign;
              const safePct = Number(item.percentage) || 0;

              return (
                <div 
                  key={item.id} 
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5"
                >
                  {/* Category Details: Icon, Name, Nominal, Percentage */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 shrink-0">
                        <IconComponent className="w-4 h-4" />
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
                      <span className="inline-block text-[11px] font-semibold font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 mt-0.5">
                        {safePct}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(safePct, 2))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
