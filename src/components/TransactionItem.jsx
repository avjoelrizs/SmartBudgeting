import React from 'react';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Gamepad2, 
  Receipt, 
  Wallet, 
  Briefcase, 
  Gift, 
  CircleDollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Trash2
} from 'lucide-react';
import { CATEGORIES } from '../data/dummyTransactions';
import { formatRupiah } from '../utils/formatters';

// Map category icons to Lucide components
const ICON_MAP = {
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Receipt,
  Wallet,
  Briefcase,
  Gift,
  CircleDollarSign
};

export const TransactionItem = ({ transaction, onDelete }) => {
  const categoryInfo = CATEGORIES[transaction.category] || {
    label: 'Lainnya',
    icon: 'CircleDollarSign',
  };

  const IconComponent = ICON_MAP[categoryInfo.icon] || CircleDollarSign;
  const isExpense = transaction.type === 'expense';

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(transaction.id);
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Minimalist Monochrome Category Icon */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-slate-800 border border-slate-700/60 text-slate-300">
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Title, Category & Time (Standard White / Slate-400 Colors) */}
        <div className="min-w-0 flex-1 pr-2">
          <h4 className="text-sm font-semibold text-slate-100 truncate">
            {transaction.title}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-400">
              {categoryInfo.label}
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-xs text-slate-500 font-mono">
              {transaction.time || (transaction.date ? formatTime(new Date(transaction.date)) : 'Baru saja')}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Nominal Price & Delete Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 pl-2">
        {/* Nominal Price with strict semantic color */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1">
            <span className={isExpense ? 'text-rose-500' : 'text-emerald-500'}>
              {isExpense ? (
                <ArrowDownRight className="w-4 h-4" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
            </span>
            <span
              className={`text-sm sm:text-base font-bold font-mono tracking-tight ${
                isExpense ? 'text-rose-500' : 'text-emerald-500'
              }`}
            >
              {formatRupiah(transaction.amount, { showSign: true, type: transaction.type })}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {isExpense ? 'Pengeluaran' : 'Pemasukan'}
          </span>
        </div>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={handleDelete}
            type="button"
            title="Hapus transaksi ini"
            aria-label={`Hapus ${transaction.title}`}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 border border-transparent transition-colors cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
