import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Calendar, 
  Wallet, 
  Pencil,
  Receipt,
  Lock
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export const HeroDashboard = ({
  dailyLimit = 0,
  sisaAnggaran = 0,
  maxSpendingBudget = 0,
  savingsTarget = 0,
  totalExpense = 0,
  remainingDays = 1,
  onEditBudget,
}) => {
  const isOverbudget = sisaAnggaran <= 0;

  // Semantic status config
  const getStatusConfig = () => {
    if (isOverbudget) {
      return {
        key: 'overbudget',
        textClass: 'text-rose-500',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        cardBorder: 'border-rose-500/30',
        progressBar: 'bg-rose-500',
        icon: AlertOctagon,
        statusText: 'Anggaran Jajan Habis! Stop Belanja',
      };
    }

    if (dailyLimit < 20000) {
      return {
        key: 'danger',
        textClass: 'text-rose-500',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        cardBorder: 'border-slate-800',
        progressBar: 'bg-rose-500',
        icon: AlertTriangle,
        statusText: 'Kritis (< Rp 20rb/hari)',
      };
    }

    if (dailyLimit <= 50000) {
      return {
        key: 'warning',
        textClass: 'text-amber-400',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        cardBorder: 'border-slate-800',
        progressBar: 'bg-amber-500',
        icon: AlertTriangle,
        statusText: 'Waspada (Rp 20rb - 50rb/hari)',
      };
    }

    return {
      key: 'safe',
      textClass: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      cardBorder: 'border-slate-800',
      progressBar: 'bg-emerald-500',
      icon: ShieldCheck,
      statusText: 'Aman (> Rp 50rb/hari)',
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  // Percentage of budget used
  const percentUsed = maxSpendingBudget > 0 
    ? Math.min(100, Math.round((totalExpense / maxSpendingBudget) * 100))
    : 100;

  return (
    <div className="w-full">
      {/* Clean Solid Dark Card */}
      <div className={`relative rounded-3xl bg-slate-900 border ${status.cardBorder} p-5 sm:p-7 shadow-sm transition-colors`}>
        
        {/* Card Header: Tag & Shortcut Edit Button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Batas Jajan Hari Ini
            </span>

            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium ${status.badgeClass}`}>
              <StatusIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{status.statusText}</span>
            </div>
          </div>

          {/* Shortcut Pencil Edit Button */}
          {onEditBudget && (
            <button
              onClick={onEditBudget}
              type="button"
              title="Edit Budget Bulanan"
              aria-label="Edit Budget"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer active:scale-95 shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Huge Nominal Display */}
        <div className="mt-1 mb-5">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-mono break-all ${status.textClass}`}>
              {formatRupiah(isOverbudget ? 0 : dailyLimit)}
            </h2>
            <span className="text-sm font-medium text-slate-400">
              / hari
            </span>
          </div>

          {/* Budget Consumption Progress Bar */}
          <div className="mt-3.5">
            <div className="flex flex-wrap justify-between text-xs text-slate-400 font-medium mb-1.5 gap-1">
              <span className="break-words">
                Terpakai: <strong className="text-slate-200 font-mono">{formatRupiah(totalExpense)}</strong> dari {formatRupiah(maxSpendingBudget)}
              </span>
              <span className={`font-mono font-bold shrink-0 ${isOverbudget ? 'text-rose-500' : 'text-slate-300'}`}>
                {percentUsed}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${status.progressBar}`}
                style={{ width: `${percentUsed}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-800 my-4"></div>

        {/* Sub-information Grid: Sisa Anggaran Jajan & Sisa Hari (Fixed Wrapping & Typography) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Box 1: Sisa Anggaran Jajan with Responsive Wrapping */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700/50 mt-0.5">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                Sisa Anggaran Jajan
              </p>
              <p className={`text-sm sm:text-base font-bold font-mono break-words leading-tight mt-1 ${isOverbudget ? 'text-rose-500 font-extrabold' : 'text-slate-100'}`}>
                {formatRupiah(sisaAnggaran)}
              </p>
            </div>
          </div>

          {/* Box 2: Sisa Hari */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700/50 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                Sisa Hari Bulan Ini
              </p>
              <p className="text-sm sm:text-base font-bold font-mono text-slate-100 break-words leading-tight mt-1">
                {remainingDays} Hari
              </p>
            </div>
          </div>

        </div>

        {/* Savings & Expense Summary Banner */}
        <div className="mt-3.5 pt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-800 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Tabungan Terkunci:</span>
            <span className="font-semibold font-mono text-slate-200">{formatRupiah(savingsTarget)}</span>
          </div>

          <div className="flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
            <span>Keluar:</span>
            <span className="font-semibold text-rose-500 font-mono">{formatRupiah(totalExpense)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
