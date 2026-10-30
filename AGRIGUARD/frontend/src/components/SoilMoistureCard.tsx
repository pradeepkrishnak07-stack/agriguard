import React, { useState } from 'react';
import {
  Droplets, Activity, RefreshCw, Clock, AlertTriangle,
  CheckCircle2, Wifi, WifiOff, Cpu, Waves, Info
} from 'lucide-react';
import { Language, SoilMoistureData } from '../types';
import { translations } from '../i18n';

interface SoilMoistureCardProps {
  language: Language;
  data: SoilMoistureData | null;
  loading: boolean;
  onRefresh: () => Promise<void> | void;
  className?: string;
  showDetails?: boolean;
}

export const SoilMoistureCard: React.FC<SoilMoistureCardProps> = ({
  language,
  data,
  loading,
  onRefresh,
  className = '',
  showDetails = true,
}) => {
  const t = translations[language] || translations.en;
  const isTa = language === 'ta';
  const isHi = language === 'hi';

  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  const percentage = data ? Math.max(0, Math.min(100, Math.round(data.moisture_percentage))) : 0;
  const rawAdc = data?.raw_adc ?? 0;
  const isWaiting = !data || data.status === 'WAITING' || data.connectivity_status === 'WAITING';
  const isOnline = !!data?.is_online && !isWaiting;
  const status = data?.status || 'WAITING';

  // Status configuration
  const statusConfig = {
    DRY: {
      label: isTa ? t.soil_moisture_status_dry : isHi ? t.soil_moisture_status_dry : 'DRY',
      bg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeDot: 'bg-amber-500',
      barColor: 'from-amber-500 to-orange-500',
      icon: AlertTriangle,
      colorHex: '#f59e0b',
      textClass: 'text-amber-700',
    },
    MOIST: {
      label: isTa ? t.soil_moisture_status_moist : isHi ? t.soil_moisture_status_moist : 'OPTIMAL (MOIST)',
      bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      badgeDot: 'bg-emerald-500',
      barColor: 'from-emerald-500 to-teal-500',
      icon: CheckCircle2,
      colorHex: '#10b981',
      textClass: 'text-emerald-700',
    },
    WET: {
      label: isTa ? t.soil_moisture_status_wet : isHi ? t.soil_moisture_status_wet : 'WET (SATURATED)',
      bg: 'bg-sky-100 text-sky-900 border-sky-300',
      badgeDot: 'bg-sky-500',
      barColor: 'from-sky-500 to-blue-600',
      icon: Waves,
      colorHex: '#0284c7',
      textClass: 'text-sky-700',
    },
    WAITING: {
      label: isTa ? t.soil_moisture_status_waiting : isHi ? t.soil_moisture_status_waiting : 'WAITING FOR SENSOR',
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      badgeDot: 'bg-slate-400',
      barColor: 'from-slate-400 to-slate-500',
      icon: Info,
      colorHex: '#64748b',
      textClass: 'text-slate-600',
    },
  };

  const currentCfg = statusConfig[status as keyof typeof statusConfig] || statusConfig.WAITING;
  const StatusIcon = currentCfg.icon;

  // Format relative seconds if available
  const getRelativeTimeText = () => {
    if (isWaiting) return isTa ? 'சென்சார் தகவலுக்காக காத்திருக்கிறது' : isHi ? 'सेंसर डेटा की प्रतीक्षा है' : 'Waiting for sensor transmission...';
    if (!isOnline) {
      if (data?.seconds_since_update != null) {
        const secs = data.seconds_since_update;
        if (secs < 60) return `${secs}s ago (${isTa ? 'ஆஃப்லைன்' : 'offline'})`;
        const mins = Math.floor(secs / 60);
        return `${mins}m ago (${isTa ? 'ஆஃப்லைன்' : 'offline'})`;
      }
      return isTa ? 'சென்சார் ஆஃப்லைனில் உள்ளது' : isHi ? 'सेंसर ऑफ़लाइन है' : 'Sensor offline';
    }
    if (data?.seconds_since_update != null) {
      const secs = data.seconds_since_update;
      if (secs < 10) return isTa ? 'இப்போதுதான்' : isHi ? 'अभी-अभी' : 'Just now';
      if (secs < 60) return `${secs}s ago`;
      const mins = Math.floor(secs / 60);
      return `${mins}m ago`;
    }
    return data?.last_updated_formatted || (isTa ? 'இணைக்கப்பட்டுள்ளது' : 'Live');
  };

  // Agronomic advice
  const advice = isTa ? data?.advice_ta : isHi ? data?.advice_hi : data?.advice_en;

  // Gauge calculation for semi-circular SVG
  // Radius = 44, circumference = Math.PI * 44 ≈ 138.23
  const arcLength = Math.PI * 44;
  const strokeDashoffset = isWaiting
    ? arcLength
    : arcLength - (arcLength * percentage) / 100;

  return (
    <div
      className={`rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xs">
            <Droplets className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                {t.soil_moisture_title}
              </h3>
              {/* Online/Offline/Waiting Pill */}
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isWaiting
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : isOnline
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {isWaiting ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>{isTa ? 'காத்திருக்கிறது' : isHi ? 'प्रतीक्षा' : 'WAITING'}</span>
                  </>
                ) : isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>{isTa ? 'இணைப்பில்' : isHi ? 'ऑनलाइन' : 'LIVE'}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-600" />
                    <span>{isTa ? 'துண்டிக்கப்பட்டது' : isHi ? 'ऑफ़लाइन' : 'OFFLINE'}</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Cpu className="w-3 h-3 text-slate-400" />
              <span>ESP32 DevKit V1 • {data?.sensor_pin || 'GPIO34'}</span>
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleManualRefresh}
          disabled={loading || refreshing}
          title={t.sensor_refresh_btn}
          id="btn-refresh-soil-moisture"
          className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading || refreshing ? 'animate-spin text-emerald-600' : ''}`}
          />
        </button>
      </div>

      {/* Main Moisture Gauge & Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Left Column: Gauge & Value (5 cols) */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center py-1">
          <div className="relative w-36 h-24 flex items-end justify-center">
            {/* SVG Semi-Circle Dial */}
            <svg className="w-36 h-36 -rotate-180 transform" viewBox="0 0 100 100">
              {/* Background Arc */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="9"
                strokeDasharray={`${arcLength} ${arcLength}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* Value Arc */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={isWaiting ? '#94a3b8' : currentCfg.colorHex}
                strokeWidth="9"
                strokeDasharray={`${arcLength} ${arcLength}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Center Gauge Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 text-center">
              {isWaiting ? (
                <div className="flex flex-col items-center">
                  <Activity className="w-5 h-5 text-amber-500 animate-spin mb-1" />
                  <span className="text-xs font-bold text-slate-500">
                    -- %
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-3xl font-black tracking-tight text-slate-900 leading-none">
                    {percentage}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">
                    {t.soil_moisture_level}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Scale range indicators */}
          <div className="w-36 flex justify-between text-[10px] font-bold text-slate-600 px-1 pt-1">
            <span>0% (Dry)</span>
            <span className="text-emerald-800">50%</span>
            <span>100% (Wet)</span>
          </div>
        </div>

        {/* Right Column: Status Badge, Metrics & Advice (7 cols) */}
        <div className="sm:col-span-7 space-y-3">
          {/* Status Badge + ADC Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black shadow-2xs ${currentCfg.bg}`}
            >
              <StatusIcon className="w-4 h-4" />
              <span>{currentCfg.label}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              <span className="text-slate-600 font-bold">ADC:</span>
              <span className="font-mono font-bold text-slate-900">
                {isWaiting ? '----' : rawAdc}
              </span>
              <span className="text-[10px] text-slate-600">/ 4095</span>
            </div>
          </div>

          {/* Visual Progress Bar with Tiered Zone Indicators */}
          <div className="space-y-1">
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/80">
              <div
                className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${currentCfg.barColor} transition-all duration-700 ease-out`}
                style={{ width: `${isWaiting ? 0 : percentage}%` }}
              />
              {/* Threshold zone markers */}
              <div className="absolute left-[30%] top-0 bottom-0 w-[1px] bg-slate-300" title="30% Dry Threshold" />
              <div className="absolute left-[70%] top-0 bottom-0 w-[1px] bg-slate-300" title="70% Wet Threshold" />
            </div>

            <div className="flex justify-between text-[9px] text-slate-600 font-medium px-0.5">
              <span className="text-amber-800">0-30% Dry</span>
              <span className="text-emerald-800 font-bold">30-70% Optimal Root Zone</span>
              <span className="text-sky-800">70-100% Saturated</span>
            </div>
          </div>

          {/* Advice message block */}
          {advice && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-2.5 text-xs text-slate-700 flex items-start gap-2">
              <StatusIcon className={`w-4 h-4 shrink-0 mt-0.5 ${currentCfg.textClass}`} />
              <p className="leading-relaxed font-medium">
                {advice}
              </p>
            </div>
          )}

          {/* Offline/Waiting Diagnostic Guidance Banner */}
          {isWaiting && (
            <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-bold block mb-0.5">
                  {isTa ? 'சென்சார் தயார் நிலையில் உள்ளது' : isHi ? 'सेंसर तैयार स्थिति में है' : 'Sensor Ready for Ingestion'}
                </span>
                <span>
                  {isTa
                    ? 'ESP32 போர்டை இயக்கி வைஃபையுடன் இணைக்கவும். அது HTTP POST மூலம் தானாகவே நேரலை அளவீடுகளை அனுப்பும்.'
                    : isHi
                    ? 'कृपया ESP32 चालू करें और वाई-फ़ाई से जोड़ें। यह स्वचालित रूप से डेटा भेजेगा।'
                    : 'Power on your ESP32 DevKit V1 and ensure it is connected to Wi-Fi. Live telemetry will populate automatically.'}
                </span>
              </div>
            </div>
          )}

          {!isWaiting && !isOnline && (
            <div className="rounded-2xl bg-red-50/80 border border-red-200 p-2 text-[11px] text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              <span>
                {isTa
                  ? 'ESP32 சென்சாரிலிருந்து அண்மைக்காலத்தில் தகவல் வரவில்லை (ஆஃப்லைன்).'
                  : isHi
                  ? 'ESP32 से हाल ही में डेटा नहीं मिला (ऑफ़लाइन)।'
                  : 'ESP32 telemetry timeout (>90s). Displaying last recorded reading.'}
              </span>
            </div>
          )}

          {/* Metadata Footer: Timestamp */}
          {showDetails && (
            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>
                  {t.sensor_last_updated}: <strong className="text-slate-800">{getRelativeTimeText()}</strong>
                </span>
              </div>

              {data?.last_updated_formatted && !isWaiting && (
                <span className="text-[10px] text-slate-600 hidden sm:inline">
                  {data.last_updated_formatted}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
