import React from 'react';
import { WifiOff, Clock } from 'lucide-react';
import { Language } from '../types';

interface OfflineBannerProps {
  isOnline: boolean;
  isCachedWeather: boolean;
  lastUpdatedFormatted?: string;
  language: Language;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  isCachedWeather,
  lastUpdatedFormatted,
  language
}) => {
  if (isOnline && !isCachedWeather) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0 text-amber-900" />
        <span>
          {!isOnline
            ? (language === 'ta'
                ? "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். சேமிக்கப்பட்ட ஆஃப்லைன் அம்சங்களை தொடர்ந்து பயன்படுத்தலாம்."
                : "You are offline. You can still use supported offline features.")
            : (language === 'ta'
                ? "முந்தைய சேமிக்கப்பட்ட வானிலை காட்டப்படுகிறது."
                : "Displaying cached weather data.")}
        </span>
      </div>
      {lastUpdatedFormatted && (
        <div className="hidden sm:flex items-center gap-1 text-[11px] opacity-90">
          <Clock className="w-3.5 h-3.5" />
          <span>{lastUpdatedFormatted}</span>
        </div>
      )}
    </div>
  );
};
