import React from 'react';
import { Plus } from 'lucide-react';

export const FAB = ({ onClick }) => {
  return (
    <div className="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 lg:bottom-10 lg:right-10 z-40 transition-all duration-300">
      <button
        onClick={onClick}
        type="button"
        aria-label="Catat Transaksi Baru"
        title="Catat Transaksi Baru"
        className="flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all duration-200 active:scale-90 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
