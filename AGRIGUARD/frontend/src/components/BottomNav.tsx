import React from 'react';
import {
  Home, Camera, ShieldAlert, Droplets, FlaskConical,
  Mic, Settings
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';

export type TabType = 'home' | 'detect' | 'risk' | 'irrigation' | 'fertilizer' | 'assistant' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, language }) => {
  const t = translations[language];

  const shortLabels: Record<Language, Record<TabType, string>> = {
    en: {
      home: 'Home',
      detect: 'Disease Scan',
      fertilizer: 'Fertilizer',
      risk: 'Disease Risk',
      irrigation: 'Irrigation',
      assistant: 'Assistant',
      settings: 'Settings',
    },
    ta: {
      home: 'முகப்பு',
      detect: 'நோய் ஆய்வு',
      fertilizer: 'உரங்கள்',
      risk: 'நோய் அபாயம்',
      irrigation: 'பாசனம்',
      assistant: 'உதவி',
      settings: 'அமைப்பு',
    },
    hi: {
      home: 'होम',
      detect: 'रोग जांच',
      fertilizer: 'उर्वरक',
      risk: 'रोग जोखिम',
      irrigation: 'सिंचाई',
      assistant: 'सहायक',
      settings: 'सेटिंग',
    },
  };

  const tabs: Array<{ id: TabType; label: string; fullLabel: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = [
    { id: 'home',       label: shortLabels[language]?.home || 'Home',             fullLabel: t.nav_home,       icon: Home },
    { id: 'detect',     label: shortLabels[language]?.detect || 'Disease Scan',   fullLabel: t.nav_detect,     icon: Camera },
    { id: 'fertilizer', label: shortLabels[language]?.fertilizer || 'Fertilizer', fullLabel: t.nav_fertilizer, icon: FlaskConical },
    { id: 'risk',       label: shortLabels[language]?.risk || 'Disease Risk',     fullLabel: t.nav_risk,       icon: ShieldAlert },
    { id: 'irrigation', label: shortLabels[language]?.irrigation || 'Irrigation', fullLabel: t.nav_irrigation, icon: Droplets },
    { id: 'assistant',  label: shortLabels[language]?.assistant || 'Assistant',   fullLabel: t.nav_assistant,  icon: Mic },
    { id: 'settings',   label: shortLabels[language]?.settings || 'Settings',     fullLabel: t.nav_settings,   icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-lg border-t border-emerald-100 shadow-xl shadow-emerald-950/10 pb-safe">
      <div className="max-w-4xl mx-auto flex items-stretch px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              title={tab.fullLabel}
              className={`relative flex flex-col items-center justify-center py-2 px-0.5 flex-1 min-w-0 transition-all duration-200 touch-manipulation ${
                isActive ? 'text-emerald-800 font-bold' : 'text-slate-400 hover:text-emerald-700'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-0.5 rounded-full bg-emerald-600 shadow-sm" />
              )}
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-xs' : 'hover:bg-slate-50'
              }`}>
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.25 : 1.75} />
              </div>
              <span className={`text-[9px] sm:text-[10px] mt-0.5 truncate w-full text-center leading-tight tracking-tight ${
                isActive ? 'font-bold text-emerald-900' : 'font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
