import React, { useState } from 'react';
import {
  Settings, Globe, MapPin, HardDrive, Cpu,
  Trash2, Shield, LogOut, User
} from 'lucide-react';
import { Language, FarmProfile } from '../types';
import { translations } from '../i18n';
import { storageService } from '../services/storage';

interface SettingsScreenProps {
  language: Language;
  onSetLanguage: (lang: Language) => void;
  farmProfile: FarmProfile;
  onProfileUpdated: (updated: FarmProfile) => void;
  onLogout?: () => void;
  authUser?: { full_name: string; mobile: string; email?: string; state?: string; district?: string } | null;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  onSetLanguage,
  farmProfile,
  onProfileUpdated,
  onLogout,
  authUser
}) => {
  const t = translations[language];
  const isTa = language === 'ta';

  const [location, setLocation] = useState(farmProfile.location_name);
  const [farmerName, setFarmerName] = useState(farmProfile.farmer_name || '');
  const [stats, setStats] = useState(storageService.getStorageStats());
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleSaveLocation = () => {
    const updated = {
      ...farmProfile,
      farmer_name: farmerName,
      location_name: location
    };
    storageService.saveProfile(updated);
    onProfileUpdated(updated);
  };

  const handleClearCache = () => {
    if (window.confirm(isTa ? "சேமிக்கப்பட்ட ஆஃப்லைன் இலை ஆய்வுகள் மற்றும் தற்காலிகத் தரவை அழிக்கவா?" : "Clear cached scans and offline weather data?")) {
      storageService.clearHistory();
      setStats(storageService.getStorageStats());
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  const handleLogout = () => {
    onLogout?.();
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Title */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">
            {t.settings_title}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {isTa ? "மொழி, இருப்பிடம் மற்றும் ஆஃப்லைன் அமைப்புகளை நிர்வகிக்கவும்" : "Manage language, farm district, and offline data storage"}
        </p>
      </div>

      {/* Logged-In User Card */}
      {authUser && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{authUser.full_name}</p>
              <p className="text-emerald-200 text-xs">{authUser.mobile}</p>
              {authUser.district && authUser.state && (
                <p className="text-emerald-200 text-xs">{authUser.district}, {authUser.state}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Language Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>{t.settings_lang}</span>
        </h4>

        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <button
            type="button"
            onClick={() => onSetLanguage('ta')}
            className={`p-3 rounded-xl border text-center font-bold transition-all ${
              language === 'ta'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            🌾 தமிழ்
          </button>
          <button
            type="button"
            onClick={() => onSetLanguage('en')}
            className={`p-3 rounded-xl border text-center font-bold transition-all ${
              language === 'en'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            🌱 English
          </button>
          <button
            type="button"
            onClick={() => onSetLanguage('hi')}
            className={`p-3 rounded-xl border text-center font-bold transition-all ${
              language === 'hi'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            🌿 हिंदी
          </button>
        </div>
      </div>

      {/* Farmer & Location Settings */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>{isTa ? "பண்ணை விவரங்கள்" : "Farm Location & Display"}</span>
        </h4>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t.farm_farmer_name}
            </label>
            <input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t.settings_location}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Thanjavur, Tamil Nadu">தஞ்சாவூர் (Thanjavur)</option>
              <option value="Madurai, Tamil Nadu">மதுரை (Madurai)</option>
              <option value="Coimbatore, Tamil Nadu">கோயம்புத்தூர் (Coimbatore)</option>
              <option value="Tiruchirappalli, Tamil Nadu">திருச்சிராப்பள்ளி (Trichy)</option>
              <option value="Salem, Tamil Nadu">சேலம் (Salem)</option>
              <option value="Tirunelveli, Tamil Nadu">திருநெல்வேலி (Tirunelveli)</option>
              <option value="Erode, Tamil Nadu">ஈரோடு (Erode)</option>
              <option value="Dindigul, Tamil Nadu">திண்டுக்கல் (Dindigul)</option>
              <option value="Theni, Tamil Nadu">தேனி (Theni)</option>
            </select>
          </div>

          <button
            onClick={handleSaveLocation}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-colors"
          >
            {isTa ? "மாற்றங்களைச் சேமி" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Offline Storage Status */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-600" />
          <span>{t.settings_cache_stats}</span>
        </h4>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px]">{isTa ? "சேமித்த ஆய்வுகள்" : "Scans Saved"}</span>
            <strong className="text-slate-800 text-sm">{stats.historyCount}</strong>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px]">{isTa ? "வானிலை தகவல்" : "Weather Cache"}</span>
            <strong className="text-emerald-700 text-xs">{stats.hasWeather ? (isTa ? "உள்ளது" : "Cached") : "Empty"}</strong>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px]">{isTa ? "பதிவு பயிர்கள்" : "Crop Plots"}</span>
            <strong className="text-slate-800 text-sm">{stats.cropsCount}</strong>
          </div>
        </div>

        <button
          onClick={handleClearCache}
          className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-xs font-semibold pt-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.settings_clear_cache}</span>
        </button>

        {clearedNotice && (
          <p className="text-xs text-emerald-600 font-semibold">
            {isTa ? "ஆஃப்லைன் தற்காலிகத் தரவு வெற்றிகரமாக அழிக்கப்பட்டது." : "Local cache cleared successfully."}
          </p>
        )}
      </div>

      {/* Model & System Diagnostics */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <span>{t.settings_model_info}</span>
        </h4>

        <div className="space-y-1.5 text-slate-600">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Vision Engine:</span>
            <strong className="text-slate-800">AgriGuard-Vision-v1.4</strong>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Agrometeorology Provider:</span>
            <strong className="text-slate-800">Open-Meteo & OpenWeather</strong>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Agronomic Package of Practices:</span>
            <strong className="text-slate-800">TNAU & ICAR 2026</strong>
          </div>
          <div className="flex justify-between py-1">
            <span>Voice Speech Engine:</span>
            <strong className="text-slate-800">Web Speech API (ta-IN / en-IN)</strong>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-900 font-bold">
          <Shield className="w-4 h-4 text-emerald-700" />
          <span>{t.settings_about}</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          {t.settings_about_text}
        </p>
      </div>

      {/* Sign Out */}
      {onLogout && (
        <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm">
          <button
            type="button"
            onClick={handleLogout}
            id="btn-logout"
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {isTa ? "வெளியேறு (Sign Out)" : "Sign Out"}
          </button>
        </div>
      )}
    </div>
  );
};
