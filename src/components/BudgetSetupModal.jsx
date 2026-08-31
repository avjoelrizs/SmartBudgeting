import React, { useState, useEffect } from 'react';
import { PiggyBank, ShieldCheck, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export const BudgetSetupModal = ({
  isOpen,
  onClose,
  currentBudget = { monthlyIncome: 2000000, savingsTarget: 500000 },
  onSaveBudget,
  isInitialSetup = false,
}) => {
  const [income, setIncome] = useState(currentBudget.monthlyIncome || 2000000);
  const [savings, setSavings] = useState(currentBudget.savingsTarget || 500000);

  useEffect(() => {
    if (isOpen) {
      setIncome(currentBudget.monthlyIncome || 2000000);
      setSavings(currentBudget.savingsTarget || 500000);
    }
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const numIncome = parseInt(income, 10) || 0;
  const numSavings = parseInt(savings, 10) || 0;
  // Anggaran Maksimal Jajan = Pemasukan - Target Tabungan
  const maxSpendingBudget = Math.max(0, numIncome - numSavings);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numIncome <= 0) {
      alert('Pemasukan bulanan harus lebih dari Rp 0');
      return;
    }
    if (numSavings >= numIncome) {
      alert('Target tabungan tidak boleh melebihi atau sama dengan total pemasukan');
      return;
    }

    onSaveBudget({
      monthlyIncome: numIncome,
      savingsTarget: numSavings,
      isConfigured: true,
    });

    onClose();
  };

  const handleBackdropClick = () => {
    if (!isInitialSetup) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm transition-opacity"
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 text-slate-100 rounded-t-3xl sm:rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 text-emerald-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {isInitialSetup ? 'Setup Budget Bulanan' : 'Edit Budget Bulanan'}
              </h3>
              <p className="text-xs text-slate-400">
                Atur alokasi tabungan dan batas jajan bulanan
              </p>
            </div>
          </div>

          {!isInitialSetup && (
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Input 1: Total Pemasukan Bulan Ini */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              1. Total Pemasukan Bulan Ini
            </label>
            <div className="relative flex items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-emerald-500 transition-colors">
              <span className="text-xl font-bold font-mono text-emerald-400 mr-2">
                Rp
              </span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="2000000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full bg-transparent text-2xl sm:text-3xl font-bold font-mono text-slate-100 placeholder-slate-600 focus:outline-none border-none tracking-tight"
                required
              />
            </div>

            {/* Quick Income Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[2000000, 3500000, 5000000, 8000000, 10000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setIncome(String(preset))}
                  className="px-2.5 py-1 text-xs font-semibold font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                >
                  {formatRupiah(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Input 2: Target Tabungan / Alokasi Wajib */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                2. Target Tabungan / Alokasi Wajib
              </label>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-300" /> Uang Terkunci
              </span>
            </div>

            <div className="relative flex items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-emerald-500 transition-colors">
              <span className="text-xl font-bold font-mono text-slate-300 mr-2">
                Rp
              </span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="500000"
                value={savings}
                onChange={(e) => setSavings(e.target.value)}
                className="w-full bg-transparent text-2xl sm:text-3xl font-bold font-mono text-slate-100 placeholder-slate-600 focus:outline-none border-none tracking-tight"
                required
              />
            </div>

            {/* Quick Savings Percentage Chips */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs text-slate-500 mr-1">Rekomendasi:</span>
              {[10, 20, 30, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    if (numIncome > 0) {
                      setSavings(String(Math.floor(numIncome * (pct / 100))));
                    }
                  }}
                  className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {pct}% Tabungan
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Pemasukan: <strong className="text-slate-200 font-mono">{formatRupiah(numIncome)}</strong></span>
              <span className="text-slate-600">-</span>
              <span>Tabungan: <strong className="text-slate-200 font-mono">{formatRupiah(numSavings)}</strong></span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Anggaran Maksimal Jajan
                </p>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-0.5">
                  {formatRupiah(maxSpendingBudget)}
                </h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isInitialSetup ? 'Atur Budget' : 'Simpan Budget'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
