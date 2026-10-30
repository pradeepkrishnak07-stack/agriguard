import React, { useState } from 'react';
import { Sprout, Wifi, WifiOff, Globe, Bell, ChevronDown, Leaf } from 'lucide-react';
import { Language, CropProfile } from '../types';
import { translations } from '../i18n';

interface NavbarProps {
  language: Language;
  onToggleLanguage: () => void;
  isOnline: boolean;
  crops: CropProfile[];
  activeCropId: string;
  onSelectCrop: (cropId: string) => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  isOnline,
  crops,
  activeCropId,
  onSelectCrop,
  unreadAlertsCount,
  onOpenAlerts
}) => {
  const t = translations[language];
  const activeCrop = crops.find(c => c.crop_id === activeCropId) || crops[0];

  return (
    <header className="sticky top-0 z-40 bg-white/97 backdrop-blur-md border-b border-emerald-100/80 shadow-sm shadow-emerald-900/5">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">

        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/25">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-[15px] font-black text-slate-900 tracking-tight leading-none">
                {t.app_title}
              </h1>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200">
                AI
              </span>
            </div>
            <p className="text-[10px] font-semibold text-emerald-700 leading-tight mt-0.5">
              {t.app_subtitle}
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* Crop Selector */}
          {crops.length > 0 && (
            <div className="relative hidden sm:block">
              <select
                value={activeCrop?.crop_id || 'tomato'}
                onChange={(e) => onSelectCrop(e.target.value)}
                className="appearance-none bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-semibold py-1.5 pl-2.5 pr-7 rounded-lg border border-emerald-200 cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                title={t.home_change_crop}
              >
                {crops.map((c) => (
                  <option key={c.crop_id} value={c.crop_id}>
                    🌱 {language === 'ta' ? c.crop_name_ta : c.crop_name_en}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-700 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Network Status */}
          <div
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-600" />
                <span>{t.offline_status_online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-600" />
                <span>{t.offline_status_offline}</span>
              </>
            )}
          </div>

          {/* Alerts Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title={t.nav_alerts}
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center pulse-glow-red">
                {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Language Switch */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-sm shadow-emerald-700/20 transition-all active:scale-95"
            title="Switch Language (English / தமிழ் / हिंदी)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'தமிழ்' : language === 'hi' ? 'हिंदी' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
