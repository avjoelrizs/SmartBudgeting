import React, { useState } from 'react';
import { Wallet, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, PiggyBank, Lock } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import confetti from 'canvas-confetti';

export const WelcomeSetup = ({ onCompleteSetup }) => {
  const [income, setIncome] = useState('');
  const [savings, setSavings] = useState('');

  const numIncome = parseInt(income, 10) || 0;
  const numSavings = parseInt(savings, 10) || 0;
  const maxSpendingBudget = Math.max(0, numIncome - numSavings);

  const isValid = numIncome > 0 && numSavings < numIncome;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numIncome <= 0) {
      alert('Silakan masukkan total pemasukan bulan ini yang valid');
      return;
    }
    if (numSavings >= numIncome) {
      alert('Target tabungan tidak boleh melebihi atau sama dengan total pemasukan');
      return;
    }

    onCompleteSetup({
      monthlyIncome: numIncome,
      savingsTarget: numSavings,
    });

    // Celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f43f5e', '#cbd5e1'],
      });
    } catch (err) {}
  };

  return (
    /* Full-Screen Overlay Modal (Tanpa Tombol X dan Tidak Bisa Ditutup Sebelum Diisi) */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
      
      {/* Modal Card */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto animate-scaleUp">
        
        {/* Header: Ikon Dompet Besar & Teks Selamat Datang */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <Wallet className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-emerald-400 border border-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Setup Awal Wajib</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Selamat Datang di Catat Keuangan!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Mari mulai dengan mengatur anggaran bulananmu agar uangmu tidak kebobolan.
            </p>
          </div>
        </div>

        {/* Form Pengaturan Budget */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Input 1: Total Pemasukan Bulan Ini */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Total Pemasukan Bulan Ini <span className="text-emerald-400">*</span>
            </label>
            <div className="relative flex items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-emerald-500 transition-colors">
              <span className="text-xl font-bold font-mono text-emerald-400 mr-2">
                Rp
              </span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Contoh: 2000000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full bg-transparent text-xl sm:text-2xl font-bold font-mono text-slate-100 placeholder-slate-600 focus:outline-none border-none tracking-tight"
                required
                autoFocus
              />
            </div>

            {/* Quick Income Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[2000000, 3500000, 5000000, 8000000].map((preset) => (
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
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Target Tabungan / Alokasi Wajib
              </label>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Uang Terkunci
              </span>
            </div>

            <div className="relative flex items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-emerald-500 transition-colors">
              <span className="text-xl font-bold font-mono text-slate-400 mr-2">
                Rp
              </span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Contoh: 500000"
                value={savings}
                onChange={(e) => setSavings(e.target.value)}
                className="w-full bg-transparent text-xl sm:text-2xl font-bold font-mono text-slate-100 placeholder-slate-600 focus:outline-none border-none tracking-tight"
              />
            </div>

            {/* Quick Savings Percentage Chips */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 mr-1">Rekomendasi:</span>
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
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Automatic Calculation Preview */}
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
                <h4 className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                  {formatRupiah(maxSpendingBudget)}
                </h4>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Tombol Validasi: 'Mulai Gunakan Aplikasi' (Hanya aktif jika pemasukan > 0) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                isValid
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60 border border-slate-700'
              }`}
            >
              <span>Mulai Gunakan Aplikasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!isValid && numIncome <= 0 && (
              <p className="text-[11px] text-center text-slate-500 mt-2">
                *Masukkan nominal pemasukan lebih dari Rp 0 untuk melanjutkan
              </p>
            )}
          </div>

        </form>

      </div>

    </div>
  );
};
