import React, { useState, useMemo } from 'react';
import { TransactionItem } from './TransactionItem';
import { History, Receipt, Search } from 'lucide-react';
import { formatIndonesianDate } from '../utils/formatters';

export const TransactionHistory = ({ transactions = [], onDeleteTransaction }) => {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Filter and search transactions safely with defensive checks
  const filteredTransactions = useMemo(() => {
    try {
      if (!Array.isArray(transactions)) return [];

      return transactions.filter((item) => {
        if (!item) return false;

        // Type filter
        if (filterType !== 'all' && item.type !== filterType) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const titleMatch = item.title ? String(item.title).toLowerCase().includes(query) : false;
          const categoryMatch = item.category ? String(item.category).toLowerCase().includes(query) : false;
          return titleMatch || categoryMatch;
        }
        return true;
      });
    } catch (e) {
      console.error('Error filtering transactions:', e);
      return [];
    }
  }, [transactions, filterType, searchQuery]);

  // Group transactions by dateLabel safely
  const groupedTransactions = useMemo(() => {
    const groups = {};
    try {
      filteredTransactions.forEach((item) => {
        if (!item) return;
        const label = item.dateLabel || (item.date ? formatIndonesianDate(item.date) : 'Hari Ini');
        if (!groups[label]) {
          groups[label] = [];
        }
        groups[label].push(item);
      });
    } catch (e) {
      console.error('Error grouping transactions:', e);
    }
    return groups;
  }, [filteredTransactions]);

  const isEmpty = !Array.isArray(transactions) || transactions.length === 0;

  return (
    <section className="w-full rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-sm">
      {/* Header & Search Control */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <History className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-100">
            Riwayat Transaksi
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            {filteredTransactions.length}
          </span>
        </div>

        {!isEmpty && (
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showSearch
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Cari transaksi"
          >
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input Bar if enabled */}
      {showSearch && !isEmpty && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari transaksi (contoh: Makan, Kopi, Transfer, Gaji)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
            autoFocus
          />
        </div>
      )}

      {/* Filter Tabs: Semua, Pengeluaran, Pemasukan */}
      {!isEmpty && (
        <div className="flex items-center gap-1 p-1 mb-4 rounded-xl bg-slate-950 border border-slate-800/80">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Pemasukan
          </button>
        </div>
      )}

      {/* Empty State Tampilan Menarik */}
      {isEmpty ? (
        <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-800/90 bg-slate-950/40">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-center mx-auto mb-3 text-slate-500 shadow-sm">
            <Receipt className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h4 className="text-sm font-semibold text-slate-300">
            Belum ada transaksi
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Belum ada transaksi. Klik tombol + untuk mulai mencatat.
          </p>
        </div>
      ) : Object.keys(groupedTransactions).length === 0 ? (
        <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-slate-800">
          <p className="text-xs text-slate-400">
            Tidak ada transaksi yang cocok dengan kata kunci "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-400 tracking-wider">
                  {dateLabel}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {items.length} transaksi
                </span>
              </div>

              <div className="space-y-2">
                {items.map((tx) => (
                  <TransactionItem
                    key={tx.id || Math.random()}
                    transaction={tx}
                    onDelete={onDeleteTransaction}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
