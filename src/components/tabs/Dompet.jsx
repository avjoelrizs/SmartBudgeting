import React, { useState, useEffect } from 'react';
import { 
  Vault, 
  Lock, 
  ShieldCheck, 
  Wallet, 
  PiggyBank, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatRupiah, formatNumberWithDots, parseNumberFromDots } from '../../utils/formatters';
import confetti from 'canvas-confetti';

export const Dompet = ({ budget, onSaveBudget, sisaAnggaran = 0 }) => {
  const [income, setIncome] = useState(formatNumberWithDots(budget?.monthlyIncome || 2000000));
  const [savings, setSavings] = useState(formatNumberWithDots(budget?.savingsTarget || 500000));
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when budget prop changes
  useEffect(() => {
    if (budget) {
      setIncome(formatNumberWithDots(budget.monthlyIncome || 2000000));
      setSavings(formatNumberWithDots(budget.savingsTarget || 500000));
    }
  }, [budget]);

  const numIncome = parseNumberFromDots(income);
  const numSavings = parseNumberFromDots(savings);
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

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    // Sweet celebration confetti
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#cbd5e1'],
      });
    } catch (err) {}
  };

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Kartu Elegan Tabungan Terkunci (Atas) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/80 text-emerald-400 flex items-center justify-center shrink-0">
              <Vault className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dana Aman & Terkunci</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Tabungan Terkunci Bulan Ini
              </h3>
            </div>
          </div>

          <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 font-mono hidden sm:inline">
            Status: Terlindungi
          </span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Nominal Tabungan</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 mt-0.5">
              {formatRupiah(budget?.savingsTarget || 0)}
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            🔒 Uang ini tidak dapat digunakan untuk pengeluaran harian dan tersimpan aman di rekening tabungan Anda.
          </p>
        </div>

      </div>

      {/* 2. Form Pengaturan Budget (Langsung di Halaman Ini / Non-Modal) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
        
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            Form Pengaturan Budget Bulanan
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ubah target pemasukan dan alokasi tabungan untuk memperbarui batas jajan harian
          </p>
        </div>

        {/* Feedback Success Notification */}
        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Perubahan budget berhasil disimpan! Batas jajan di Beranda telah diperbarui.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Input 1: Target Pemasukan Bulanan */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Target Pemasukan Bulanan
            </label>
            <div className="relative flex items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-emerald-500 transition-colors">
              <span className="text-xl font-bold font-mono text-emerald-400 mr-2">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="2.000.000"
                value={income}
                onChange={(e) => setIncome(formatNumberWithDots(e.target.value))}
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
                  onClick={() => setIncome(formatNumberWithDots(preset))}
                  className="px-2.5 py-1 text-xs font-semibold font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                >
                  {formatRupiah(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Input 2: Target Tabungan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Target Tabungan / Alokasi Wajib
              </label>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Uang Terkunci
              </span>
            </div>

            <div className="relative flex items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-emerald-500 transition-colors">
              <span className="text-xl font-bold font-mono text-slate-300 mr-2">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="500.000"
                value={savings}
                onChange={(e) => setSavings(formatNumberWithDots(e.target.value))}
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
                      setSavings(formatNumberWithDots(Math.floor(numIncome * (pct / 100))));
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {pct}% Tabungan
                </button>
              ))}
            </div>
          </div>

          {/* Automatic Calculation Preview Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Pemasukan: <strong className="text-slate-200 font-mono">{formatRupiah(numIncome)}</strong></span>
              <span className="text-slate-600">-</span>
              <span>Tabungan: <strong className="text-slate-200 font-mono">{formatRupiah(numSavings)}</strong></span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Anggaran Maksimal Jajan Baru
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

          {/* Tombol Simpan Perubahan Budget */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simpan Perubahan Budget</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
