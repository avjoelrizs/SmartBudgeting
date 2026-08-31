import React from 'react';
import { Home, PieChart, WalletCards, User } from 'lucide-react';

export const BottomNav = ({ activeTab = 'beranda', setActiveTab }) => {
  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'laporan', label: 'Laporan', icon: PieChart },
    { id: 'dompet', label: 'Dompet', icon: WalletCards },
    { id: 'akun', label: 'Akun', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-6 py-2">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              type="button"
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? 'text-emerald-500 font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-emerald-500' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"></span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
