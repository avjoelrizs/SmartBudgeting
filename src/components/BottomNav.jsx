import React from 'react';
import { Home, PieChart, WalletCards, User, Plus } from 'lucide-react';

export const BottomNav = ({ activeTab = 'beranda', setActiveTab, onOpenAddModal }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        
        {/* 1. Beranda */}
        <button
          onClick={() => setActiveTab('beranda')}
          type="button"
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'beranda'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${activeTab === 'beranda' ? 'stroke-[2.5] text-emerald-400' : 'stroke-[1.8]'}`} />
            {activeTab === 'beranda' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Beranda</span>
        </button>

        {/* 2. Laporan */}
        <button
          onClick={() => setActiveTab('laporan')}
          type="button"
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'laporan'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <PieChart className={`w-5 h-5 ${activeTab === 'laporan' ? 'stroke-[2.5] text-emerald-400' : 'stroke-[1.8]'}`} />
            {activeTab === 'laporan' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Laporan</span>
        </button>

        {/* 3. Center Prominent Action Button (+) */}
        <div className="relative -mt-6 flex flex-col items-center">
          <button
            onClick={onOpenAddModal}
            type="button"
            aria-label="Catat Transaksi"
            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-slate-900 transition-all active:scale-90 cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[9px] font-bold text-emerald-400 mt-0.5">Catat</span>
        </div>

        {/* 4. Dompet */}
        <button
          onClick={() => setActiveTab('dompet')}
          type="button"
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'dompet'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <WalletCards className={`w-5 h-5 ${activeTab === 'dompet' ? 'stroke-[2.5] text-emerald-400' : 'stroke-[1.8]'}`} />
            {activeTab === 'dompet' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Dompet</span>
        </button>

        {/* 5. Akun */}
        <button
          onClick={() => setActiveTab('akun')}
          type="button"
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'akun'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 ${activeTab === 'akun' ? 'stroke-[2.5] text-emerald-400' : 'stroke-[1.8]'}`} />
            {activeTab === 'akun' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Akun</span>
        </button>

      </div>
    </div>
  );
};
