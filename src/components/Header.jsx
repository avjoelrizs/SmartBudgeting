import React from 'react';
import { Sparkles } from 'lucide-react';
import { formatIndonesianDate } from '../utils/formatters';

export const Header = ({ userName = 'Rizko', profileImage = null }) => {
  const todayFormatted = formatIndonesianDate(new Date());

  // Determine time-based greeting
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  return (
    <header className="flex items-center justify-between w-full">
      {/* User Profile & Greeting */}
      <div className="flex items-center gap-3.5">
        {/* Minimalist User Avatar */}
        <div className="relative group cursor-pointer shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-slate-100 text-base shadow-sm overflow-hidden">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Foto Profil" 
                className="w-full h-full object-cover" 
              />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
        </div>

        {/* Greeting & Date */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>{getGreetingTime()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50 leading-tight">
            Halo, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            {todayFormatted}
          </p>
        </div>
      </div>
    </header>
  );
};
