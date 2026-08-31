import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Gamepad2, 
  Receipt, 
  Wallet,
  Briefcase,
  Gift,
  CircleDollarSign,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { formatTime } from '../utils/formatters';
import confetti from 'canvas-confetti';

// Kategori Pengeluaran
const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Makan & Minum', icon: Utensils },
  { id: 'transport', label: 'Transportasi', icon: Car },
  { id: 'shopping', label: 'Belanja', icon: ShoppingBag },
  { id: 'entertainment', label: 'Hiburan', icon: Gamepad2 },
  { id: 'bills', label: 'Tagihan', icon: Receipt },
  { id: 'other', label: 'Lainnya', icon: CircleDollarSign },
];

// Kategori Pemasukan
const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Gaji Bulanan', icon: Wallet },
  { id: 'freelance', label: 'Proyek Sampingan', icon: Briefcase },
  { id: 'gift', label: 'Bonus / Hadiah', icon: Gift },
  { id: 'other', label: 'Lainnya', icon: CircleDollarSign },
];

export const TransactionModal = ({ isOpen, onClose, onAddTransaction }) => {
  const [type, setType] = useState('expense'); // 'expense' | 'income' (Default: 'expense')
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [notes, setNotes] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset category when switching type
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory('food');
    } else {
      setCategory('salary');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) {
      alert('Silakan masukkan nominal yang valid');
      return;
    }

    const categoryList = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const selectedCatObj = categoryList.find((c) => c.id === category);
    const defaultLabel = type === 'expense' ? 'Pengeluaran' : 'Pemasukan';
    const title = notes.trim() || selectedCatObj?.label || defaultLabel;

    const newTx = {
      id: `tx-${Date.now()}`,
      title: title,
      category: category,
      type: type,
      amount: numAmount,
      time: formatTime(new Date()),
      date: new Date().toISOString(),
      dateLabel: 'Hari Ini',
    };

    onAddTransaction(newTx);

    // Sweet celebration confetti
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 },
        colors: type === 'expense' 
          ? ['#f43f5e', '#fb7185', '#cbd5e1'] 
          : ['#10b981', '#34d399', '#cbd5e1'],
      });
    } catch (err) {}

    // Reset Form & Close
    setAmount('');
    setNotes('');
    setType('expense');
    setCategory('food');
    onClose();
  };

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm transition-opacity"
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 text-slate-100 rounded-t-3xl sm:rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]"
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center ${type === 'expense' ? 'text-rose-500' : 'text-emerald-400'}`}>
              {type === 'expense' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Tambah Transaksi
              </h3>
              <p className="text-xs text-slate-400">
                {type === 'expense' ? 'Catat pengeluaran harian' : 'Catat pemasukan tambahan'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Tutup modal"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* 1. Toggle Pilihan Tipe: Pengeluaran (Merah) vs Pemasukan (Hijau) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Tipe Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Pengeluaran</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Pemasukan</span>
              </button>
            </div>
          </div>

          {/* 2. Nominal Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Nominal {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </label>
            <div className={`relative flex items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 transition-colors ${type === 'expense' ? 'focus-within:border-rose-500' : 'focus-within:border-emerald-500'}`}>
              <span className={`text-2xl sm:text-3xl font-bold font-mono mr-2 ${type === 'expense' ? 'text-rose-500' : 'text-emerald-400'}`}>
                Rp
              </span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-2xl sm:text-3xl font-bold font-mono text-slate-100 placeholder-slate-600 focus:outline-none border-none tracking-tight"
                required
                autoFocus
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[10000, 25000, 50000, 100000, 250000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className="px-2.5 py-1 text-xs font-semibold font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                >
                  +{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Kategori Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {currentCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border cursor-pointer ${
                      isSelected
                        ? type === 'expense'
                          ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                          : 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Catatan / Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Catatan <span className="text-slate-500 font-normal lowercase">(opsional)</span>
            </label>
            <input
              type="text"
              placeholder={type === 'expense' ? 'Contoh: Kopi Susu, Makan Siang, Bensin' : 'Contoh: Transfer Klien, Bonus, Hadiah'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
            />
          </div>

          {/* 5. Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-colors cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{type === 'expense' ? 'Simpan Pengeluaran' : 'Simpan Pemasukan'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
