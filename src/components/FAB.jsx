import React from 'react';
import { Plus } from 'lucide-react';

export const FAB = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
      <button
        onClick={onClick}
        type="button"
        aria-label="Catat Pengeluaran Baru"
        title="Catat Pengeluaran Baru"
        className="flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all duration-200 active:scale-90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
