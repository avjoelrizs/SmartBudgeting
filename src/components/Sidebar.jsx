import React, { useState } from 'react';
import { 
  Home, 
  PieChart, 
  WalletCards, 
  User, 
  ShieldCheck, 
  Wallet, 
  Menu 
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  // State: Sidebar terbuka (true) atau terlipat (false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home, desc: 'Dashboard & Transaksi' },
    { id: 'laporan', label: 'Laporan', icon: PieChart, desc: 'Statistik & Analisis' },
    { id: 'dompet', label: 'Dompet', icon: WalletCards, desc: 'Rekening & Saldo' },
    { id: 'akun', label: 'Akun', icon: User, desc: 'Profil & Pengaturan' },
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col justify-between shrink-0 bg-slate-900 border-r border-slate-800 sticky top-0 h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-64 p-5' : 'w-20 p-3 items-center'
      }`}
    >
      {/* Top Section: Brand Logo & Hamburger Menu Button & Navigation */}
      <div className="w-full">
        
        {/* Header: Logo, Nama Aplikasi, & Tombol Hamburger Menu (Garis Tiga) */}
        <div className={`flex items-center mb-7 transition-all ${
          isSidebarOpen ? 'justify-between px-1' : 'flex-col gap-3 justify-center'
        }`}>
          
          {/* Logo & Text Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-sm shrink-0">
              <Wallet className="w-5 h-5" />
            </div>

            {isSidebarOpen && (
              <div className="min-w-0 transition-opacity duration-200">
                <h2 className="text-sm font-bold text-slate-100 tracking-tight truncate">
                  Catat Keuangan
                </h2>
                <p className="text-[10px] text-slate-400 font-medium">
                  Smart Budgeting
                </p>
              </div>
            )}
          </div>

          {/* Tombol Hamburger Menu (Menu) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            type="button"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer active:scale-95 shrink-0"
            title={isSidebarOpen ? 'Lipat Sidebar' : 'Buka Sidebar'}
            aria-label={isSidebarOpen ? 'Lipat Sidebar' : 'Buka Sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                type="button"
                title={!isSidebarOpen ? item.label : undefined}
                className={`w-full flex items-center rounded-2xl transition-all duration-200 cursor-pointer ${
                  isSidebarOpen 
                    ? 'gap-3.5 px-3.5 py-3 text-left' 
                    : 'justify-center p-3'
                } ${
                  isActive
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400 stroke-[2.2]' : 'text-slate-400'}`} />
                
                {isSidebarOpen && (
                  <div className="min-w-0 flex-1 transition-opacity duration-200">
                    <p className="text-sm font-semibold leading-none">{item.label}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal truncate">{item.desc}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Info Ringkas Budget Plan (Hanya muncul saat sidebar terbuka) */}
      {isSidebarOpen && (
        <div className="w-full p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 transition-all animate-fadeIn">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Budget Plan</span>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            Pemasukan & tabungan bulanan aktif terlindungi aman.
          </p>
        </div>
      )}
    </aside>
  );
};
