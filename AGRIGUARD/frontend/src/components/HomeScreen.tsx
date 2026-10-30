import React, { useState, useEffect } from 'react';
import {
  Camera, ShieldAlert, Droplets, FlaskConical,
  Thermometer, Droplet, Wind, CloudRain,
  ChevronRight, AlertTriangle, AlertCircle, Info,
  CheckCircle2, XCircle, Leaf, RefreshCw,
  Bell, BellRing, Clock, Zap, TrendingUp,
  Microscope, CloudSun, ShieldCheck,
  ArrowRight, ArrowUpRight, X, Sparkles, MapPin,
  Activity, ExternalLink
} from 'lucide-react';
import { Language, WeatherData, FarmProfile, DetectionRecord, SmartAlert, SoilMoistureData } from '../types';
import { translations } from '../i18n';
import { api } from '../services/api';
import { SoilMoistureCard } from './SoilMoistureCard';
import { TabType } from './BottomNav';

interface HomeScreenProps {
  language: Language;
  weather: WeatherData | null;
  farmProfile: FarmProfile;
  detectionHistory: DetectionRecord[];
  alerts: SmartAlert[];
  authUser?: { full_name: string; mobile?: string; email?: string } | null;
  onNavigate: (tab: TabType) => void;
  onRefreshWeather: () => void;
  onViewScanDetails?: (scan: DetectionRecord) => void;
}

/* ─────────────────────────────────────────────────────────────
   SEVERITY BADGE COMPONENT (Multi-modal: Icon + Color + Text)
   Meets accessibility guidelines by never relying on color alone
   ───────────────────────────────────────────────────────────── */
const SeverityBadge = ({ severity, language }: { severity: string; language: Language }) => {
  const configs: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
    high: {
      label: language === 'ta' ? 'அவசரம்' : language === 'hi' ? 'जरूरी' : 'URGENT',
      cls: 'bg-red-700 text-white border-red-800',
      icon: AlertTriangle,
    },
    medium: {
      label: language === 'ta' ? 'எச்சரிக்கை' : language === 'hi' ? 'चेतावनी' : 'WARNING',
      cls: 'bg-amber-600 text-white border-amber-700',
      icon: AlertCircle,
    },
    low: {
      label: language === 'ta' ? 'ஆலோசனை' : language === 'hi' ? 'सूचना' : 'ADVISORY',
      cls: 'bg-emerald-700 text-white border-emerald-800',
      icon: Info,
    },
  };

  const cfg = configs[severity] ?? configs.low;
  const IconComponent = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-xs ${cfg.cls}`}
      role="status"
    >
      <IconComponent className="w-3 h-3 shrink-0" />
      <span>{cfg.label}</span>
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   ALERT CATEGORY ICON
   ───────────────────────────────────────────────────────────── */
const AlertCategoryIcon = ({ category, severity }: { category: string; severity: string }) => {
  const IconComponent =
    category === 'disease_risk'    ? ShieldAlert :
    category === 'weather_warning' ? CloudRain   :
    category === 'irrigation'      ? Droplets    : BellRing;

  const bgStyles =
    severity === 'high'
      ? 'bg-red-100 text-red-700 border border-red-200'
      : severity === 'medium'
      ? 'bg-amber-100 text-amber-800 border border-amber-200'
      : 'bg-emerald-100 text-emerald-800 border border-emerald-200';

  return (
    <div className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${bgStyles}`}>
      <IconComponent className="w-5 h-5" strokeWidth={2} />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   WEATHER METRIC CHIP
   ───────────────────────────────────────────────────────────── */
const WeatherChip = ({
  icon: Icon,
  value,
  label,
  accentColor
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  accentColor: string;
}) => (
  <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center transition-transform hover:scale-[1.02]">
    <Icon className={`w-4 h-4 ${accentColor} mb-1`} />
    <span className="block text-sm sm:text-base font-extrabold text-white leading-tight tracking-tight">
      {value}
    </span>
    <span className="mt-0.5 block text-[10px] text-emerald-100/80 font-medium leading-tight">
      {label}
    </span>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN HOME SCREEN COMPONENT
   ───────────────────────────────────────────────────────────── */
export const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  weather,
  farmProfile,
  detectionHistory,
  alerts,
  authUser,
  onNavigate,
  onRefreshWeather,
  onViewScanDetails,
}) => {
  const t = translations[language] || translations.en;
  const isTa = language === 'ta';
  const isHi = language === 'hi';

  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedScan, setSelectedScan] = useState<DetectionRecord | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  // Live Soil Moisture State (ESP32 Sensor)
  const [soilMoisture, setSoilMoisture] = useState<SoilMoistureData | null>(null);
  const [soilLoading, setSoilLoading] = useState<boolean>(true);

  const fetchSoilMoisture = async () => {
    try {
      const sm = await api.getLatestSoilMoisture();
      setSoilMoisture(sm);
    } catch (e) {
      console.warn("Failed to fetch soil moisture telemetry", e);
    } finally {
      setSoilLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 40);
    fetchSoilMoisture();

    // Auto-poll live sensor telemetry every 8 seconds
    const interval = setInterval(fetchSoilMoisture, 8000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const activeCrop =
    farmProfile.crops.find((c) => c.crop_id === farmProfile.active_crop_id) ||
    farmProfile.crops[0];

  const activeAlerts = alerts.filter((a) => !a.read).slice(0, 4);
  const recentDetections = detectionHistory.slice(0, 3);
  const curr = weather?.current;

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setAlertsError(null);
      await onRefreshWeather();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 2500);
    } catch {
      setAlertsError(
        isTa
          ? 'வானிலை தரவை புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
          : isHi
          ? 'मौसम डेटा अपडेट नहीं हो सका। पुनः प्रयास करें।'
          : 'Unable to refresh weather data. Please try again.'
      );
    } finally {
      setTimeout(() => setRefreshing(false), 800);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     THE FOUR PREMIUM SUMMARY CARDS (Strict Order 1 -> 2 -> 3 -> 4)
     1. Disease Detection
     2. Fertilizer Recommendation
     3. Weather-Based Disease Prediction
     4. Smart Irrigation
     ───────────────────────────────────────────────────────────── */
  const featureCards = [
    {
      id: 'detect' as TabType,
      cardNumber: '01',
      icon: Microscope,
      badgeText: isTa ? 'AI இலை ஆய்வு' : isHi ? 'AI फसल जांच' : 'Instant AI Diagnosis',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      actionText: isTa ? 'ஆய்வு செய்' : isHi ? 'स्कैन करें' : 'Scan Leaf',
      title: isTa ? 'நோய் கண்டறிதல்' : isHi ? 'फसल रोग पहचान' : 'Disease Detection',
      desc: isTa
        ? 'இலை படம் எடுத்து AI மூலம் உடனடி நோய் ஆய்வு மற்றும் TNAU அங்கீகரித்த சிகிச்சை பெறுங்கள்'
        : isHi
        ? 'पत्ती की तस्वीर से तुरंत AI रोग पहचान और विश्वविद्यालय प्रमाणित वैज्ञानिक उपचार पाएं'
        : 'Capture a leaf photo for instant AI diagnosis with IPM management and remedies',
      accentBorder: 'hover:border-emerald-500 focus-visible:border-emerald-600',
      stripBg: 'from-emerald-600 to-teal-600',
      iconBoxBg: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white',
    },
    {
      id: 'fertilizer' as TabType,
      cardNumber: '02',
      icon: FlaskConical,
      badgeText: isTa ? 'TNAU & ICAR வழிகாட்டி' : isHi ? 'ICAR पोषण गाइड' : 'Nutrient Guide',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      actionText: isTa ? 'அளவை அறி' : isHi ? 'सलाह देखें' : 'View Schedule',
      title: isTa ? 'உர பரிந்துரை' : isHi ? 'उर्वरक अनुशंसा' : 'Fertilizer Recommendation',
      desc: isTa
        ? 'பயிர் வளர்ச்சி நிலை மற்றும் மண் வகைக்கேற்ப சமச்சீர் NPK அளவுகள் மற்றும் நுண்ணூட்ட ஆலோசனை'
        : isHi
        ? 'फसल वृद्धि चरण और मिट्टी के अनुसार संतुलित NPK खुराक और पोषक तत्वों की सही सलाह'
        : 'Balanced NPK dosage schedules, biofertilizers, and nutrient deficiency diagnosis',
      accentBorder: 'hover:border-emerald-500 focus-visible:border-emerald-600',
      stripBg: 'from-emerald-700 to-teal-700',
      iconBoxBg: 'bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white',
    },
    {
      id: 'risk' as TabType,
      cardNumber: '03',
      icon: CloudSun,
      badgeText: isTa ? 'முன் எச்சரிக்கை' : isHi ? 'अग्रिम चेतावनी' : 'Early Outbreak Warning',
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
      actionText: isTa ? 'அபாயத்தை அறி' : isHi ? 'जोखिम जांचें' : 'Check Forecast',
      title: isTa ? 'வானிலை நோய் முன்னறிவிப்பு' : isHi ? 'मौसम आधारित रोग पूर्वानुमान' : 'Weather-Based Disease Prediction',
      desc: isTa
        ? 'ஈரப்பதம் மற்றும் மழை சூழலைக் கொண்டு நோய் வெடிப்பை அறிகுறிகள் தோன்றும் முன்பே கண்டறியுங்கள்'
        : isHi
        ? 'तापमान और नमी के विश्लेषण से पत्तियों पर लक्षण दिखने से पहले ही रोग प्रकोप का पूर्वानुमान'
        : 'Predict foliar pathogen outbreaks before visible symptoms appear via local microclimate',
      accentBorder: 'hover:border-amber-500 focus-visible:border-amber-600',
      stripBg: 'from-amber-600 to-emerald-700',
      iconBoxBg: 'bg-amber-50 text-amber-800 group-hover:bg-amber-700 group-hover:text-white',
    },
    {
      id: 'irrigation' as TabType,
      cardNumber: '04',
      icon: Droplets,
      badgeText: isTa ? 'நீர் சேமிப்பு' : isHi ? 'जल संरक्षण' : 'Water Conservation',
      badgeBg: 'bg-teal-50 text-teal-900 border-teal-200',
      actionText: isTa ? 'பாசன திட்டம்' : isHi ? 'योजना देखें' : 'Watering Plan',
      title: isTa ? 'நுண்ணிய நீர் பாசனம்' : isHi ? 'स्मार्ट सिंचाई' : 'Smart Irrigation',
      desc: isTa
        ? '48 மணி நேர மழை முன்னறிவிப்பு மற்றும் மண் ஈரம் சார்ந்து எப்போது நீர் பாய்ச்ச வேண்டும் என்ற வழிகாட்டல்'
        : isHi
        ? '48 घंटे के वर्षा पूर्वानुमान और मिट्टी की नमी के आधार पर अनुकूल सिंचाई समय सारणी'
        : 'Smart watering schedule based on crop stage, rain forecast, and soil moisture',
      accentBorder: 'hover:border-teal-500 focus-visible:border-teal-600',
      stripBg: 'from-teal-600 to-emerald-700',
      iconBoxBg: 'bg-teal-50 text-teal-800 group-hover:bg-teal-700 group-hover:text-white',
    },
  ];

  return (
    <div
      className={`space-y-6 pb-24 transition-opacity duration-300 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* ══════════════════════════════════════════════════════════
          HERO SECTION — NATURAL AGRICULTURAL BANNER & LIVE WEATHER
      ══════════════════════════════════════════════════════════ */}
      <section
        aria-label="Farm Overview and Weather"
        className="relative overflow-hidden rounded-3xl shadow-xl shadow-emerald-950/20 text-white animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 45%, #0d9488 100%)',
        }}
      >
        {/* Subtle decorative agricultural watermarks */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-52 w-52 rounded-full bg-teal-300/10 blur-2xl" />

        {/* Delicate leaf watermark illustration */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-2 h-44 w-44 opacity-[0.07] animate-wave"
          viewBox="0 0 200 200"
          fill="white"
        >
          <path d="M20 180 C60 140 160 120 180 20 C120 40 40 100 20 180Z" />
          <path d="M20 180 L180 20" stroke="white" strokeWidth="2.5" fill="none" />
          <path d="M20 180 C50 165 100 140 140 100" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>

        <div className="relative z-10 p-5 sm:p-6 space-y-4">
          {/* Header Row: Location Beacon & Farmer Greeting */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 pulse-glow-green" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {farmProfile.location_name}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white">
                {(() => {
                  const rawName = (authUser?.full_name || '').trim();
                  // Ensure we never use a hardcoded legacy Murugesan
                  const validName = (rawName && rawName.toLowerCase() !== 'murugesan') ? rawName : '';
                  // Proper capitalize first letter of each word
                  const formattedName = validName
                    ? validName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                    : '';
                  
                  if (isTa) {
                    return formattedName ? `வணக்கம், ${formattedName}` : 'வணக்கம், விவசாயி';
                  }
                  if (isHi) {
                    return formattedName ? `नमस्ते, ${formattedName}` : 'नमस्ते, किसान';
                  }
                  return formattedName ? `Welcome, ${formattedName}` : 'Welcome, Farmer';
                })()}
              </h1>
              <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                {isTa
                  ? 'உங்கள் பண்ணையின் இன்றைய நிலை & வானிலை தகவல்'
                  : isHi
                  ? 'आपके खेत की आज की स्थिति और मौसम की जानकारी'
                  : "Here is your farm's real-time crop & weather overview"}
              </p>
            </div>

          </div>

          {/* Active Crop Pill */}
          {activeCrop && (
            <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-black/20 px-3.5 py-2 text-xs backdrop-blur-md">
              <span className="text-base leading-none">🌱</span>
              <span className="text-emerald-300 font-semibold">{t.home_active_crop}:</span>
              <span className="font-extrabold text-white">
                {isTa ? activeCrop.crop_name_ta : activeCrop.crop_name_en}
              </span>
              {activeCrop.variety && (
                <span className="text-emerald-200/70 text-[11px]">({activeCrop.variety})</span>
              )}
              {activeCrop.growth_stage && (
                <span className="rounded-lg bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                  {activeCrop.growth_stage}
                </span>
              )}
            </div>
          )}

          {/* Live Weather Metrics Strip */}
          {curr ? (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                <WeatherChip
                  icon={Thermometer}
                  value={`${curr.temperature}°C`}
                  label={isTa ? 'வெப்பம்' : isHi ? 'तापमान' : 'Temperature'}
                  accentColor="text-amber-300"
                />
                <WeatherChip
                  icon={Droplet}
                  value={`${curr.humidity}%`}
                  label={isTa ? 'ஈரப்பதம்' : isHi ? 'नमी' : 'Humidity'}
                  accentColor="text-sky-300"
                />
                <WeatherChip
                  icon={CloudRain}
                  value={`${curr.precipitation_mm}mm`}
                  label={isTa ? 'மழை' : isHi ? 'बारिश' : 'Rainfall'}
                  accentColor="text-blue-300"
                />
                <WeatherChip
                  icon={Wind}
                  value={`${curr.wind_speed_kmh}km/h`}
                  label={isTa ? 'காற்று' : isHi ? 'हवा' : 'Wind Speed'}
                  accentColor="text-teal-200"
                />
              </div>

              {/* Status and Refresh Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5">
                <div className="flex items-center gap-2 text-[11px] text-emerald-200/80">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>
                    {t.weather_last_updated}: {weather?.last_updated_formatted}
                  </span>
                  {weather?.is_cached && (
                    <span className="rounded bg-amber-500/25 px-1.5 py-0.5 text-amber-200 text-[10px] font-bold border border-amber-400/30">
                      {isTa ? 'சேமித்த தகவல்' : isHi ? 'सहेजा डेटा' : 'CACHED'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {refreshSuccess && (
                    <span className="text-[11px] font-bold text-emerald-200 flex items-center gap-1 animate-fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      {isTa ? 'புதுப்பிக்கப்பட்டது!' : isHi ? 'अपडेट हुआ!' : 'Updated!'}
                    </span>
                  )}
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    id="btn-refresh-weather-hero"
                    className="flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-[11px] font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>{t.weather_refresh}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Weather Loading Skeleton */
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-xs text-emerald-100 backdrop-blur-md">
              <Activity className="h-5 w-5 animate-spin text-emerald-300 shrink-0" />
              <span>
                {weather?.status_message ||
                  (isTa
                    ? 'பண்ணை வானிலை தகவல் சேகரிக்கப்படுகிறது...'
                    : isHi
                    ? 'खेत मौसम डेटा प्राप्त किया जा रहा है...'
                    : 'Connecting to farm agrometeorological station...')}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          LIVE SOIL MOISTURE TELEMETRY (ESP32 DevKit V1 Sensor)
      ══════════════════════════════════════════════════════════ */}
      <section aria-label="Live Soil Moisture" className="animate-slide-up">
        <SoilMoistureCard
          language={language}
          data={soilMoisture}
          loading={soilLoading}
          onRefresh={fetchSoilMoisture}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — THE FOUR PREMIUM SUMMARY CARDS (Strict Order)
          1. Disease Detection
          2. Fertilizer Recommendation
          3. Weather-Based Disease Prediction
          4. Smart Irrigation
      ══════════════════════════════════════════════════════════ */}
      <section aria-labelledby="heading-quick-actions" className="space-y-3.5">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-emerald-700" />
            </div>
            <h2 id="heading-quick-actions" className="text-xs font-black uppercase tracking-wider text-slate-600">
              {t.home_quick_actions}
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {isTa ? '4 முதன்மை சேவைகள்' : isHi ? '4 मुख्य सेवाएं' : '4 Core Services'}
          </span>
        </div>

        {/* 2x2 Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                id={`feature-card-${card.id}`}
                onClick={() => onNavigate(card.id)}
                className={`group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 text-left shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] ${card.accentBorder} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600`}
                style={{ animationDelay: `${100 + idx * 50}ms` }}
              >
                {/* Left accent color strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b ${card.stripBg} rounded-l-2xl`}
                />

                {/* Card Number Watermark */}
                <span className="absolute bottom-3 right-3 text-[10px] font-black text-slate-300 group-hover:text-emerald-700/30 transition-colors">
                  {card.cardNumber}
                </span>

                {/* Top-right subtle arrow icon */}
                <ArrowUpRight className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />

                {/* Card Icon Container */}
                <div
                  className={`flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl ${card.iconBoxBg} transition-all duration-200 shadow-xs`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>

                {/* Card Content */}
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${card.badgeBg}`}>
                      {card.badgeText}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                    {card.title}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-2">
                    {card.desc}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-800 group-hover:text-emerald-600 transition-colors">
                    <span>{card.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — IMPORTANT FARM ALERTS (Directly below summary cards)
      ══════════════════════════════════════════════════════════ */}
      <section aria-labelledby="heading-farm-alerts" className="space-y-3.5 animate-slide-up">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                activeAlerts.length > 0 ? 'bg-red-100' : 'bg-emerald-100'
              }`}
            >
              <BellRing
                className={`h-3.5 w-3.5 ${activeAlerts.length > 0 ? 'text-red-700' : 'text-emerald-700'}`}
              />
            </div>
            <h2 id="heading-farm-alerts" className="text-xs font-black uppercase tracking-wider text-slate-700">
              {t.active_alerts_title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {activeAlerts.length > 0 && (
              <span className="rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
                {activeAlerts.length} {isTa ? 'செயலில்' : isHi ? 'सक्रिय' : 'Active'}
              </span>
            )}
            <button
              onClick={() => onNavigate('alerts' as TabType)}
              id="btn-view-all-alerts"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 transition-colors"
            >
              <span>{isTa ? 'அனைத்தும்' : isHi ? 'सभी देखें' : 'View All'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Error State Banner (if refresh or sync failed) */}
        {alertsError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{alertsError}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="shrink-0 font-bold text-red-900 underline hover:no-underline"
            >
              {isTa ? 'மீண்டும் முயற்சி' : isHi ? 'पुनः प्रयास' : 'Retry'}
            </button>
          </div>
        )}

        {/* Alerts List OR Empty State */}
        {activeAlerts.length === 0 ? (
          /* Empty State: All Clear Reassurance Card */
          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/80 via-emerald-50/40 to-white p-5 text-left shadow-xs">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-xs border border-emerald-200">
              <ShieldCheck className="h-8 w-8 text-emerald-700" strokeWidth={2} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-emerald-950">
                {isTa ? 'அனைத்தும் பாதுகாப்பாக உள்ளது!' : isHi ? 'सब कुछ सुरक्षित है!' : 'All Clear — Farm Protected!'}
              </h3>
              <p className="mt-0.5 text-xs text-emerald-900/80 leading-relaxed">
                {isTa
                  ? 'உங்கள் பயிர்களுக்கு தற்போது நோய் ஆபத்தோ அல்லது தீவிர வானிலை அச்சுறுத்தலோ இல்லை. தொடர்ந்து சீரான பாசனத்தை பேணவும்.'
                  : isHi
                  ? 'आपकी फसल के लिए वर्तमान में कोई गंभीर रोग या मौसम संबंधी जोखिम नहीं है। सामान्य जल प्रबंधन जारी रखें।'
                  : 'No active disease outbreak risks or severe weather warnings for your active crops today.'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('detect')}
              className="shrink-0 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              {isTa ? 'இலை ஆய்வு செய்' : isHi ? 'फसल जांचें' : 'Check Leaf Health'}
            </button>
          </div>
        ) : (
          /* List of Active Alert Cards */
          <div className="space-y-3">
            {activeAlerts.map((alert, idx) => {
              const isUrgent = alert.severity === 'high';
              const isWarning = alert.severity === 'medium';

              const cardBorder = isUrgent
                ? 'border-red-300 bg-gradient-to-r from-red-50/90 via-red-50/40 to-white'
                : isWarning
                ? 'border-amber-300 bg-gradient-to-r from-amber-50/90 via-amber-50/30 to-white'
                : 'border-emerald-300 bg-gradient-to-r from-emerald-50/90 via-emerald-50/30 to-white';

              const leftStripe = isUrgent ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-600';

              return (
                <div
                  key={alert.id}
                  className={`relative flex items-start gap-3.5 rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md ${cardBorder}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Left severity indicator stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${leftStripe} rounded-l-2xl`} />

                  <AlertCategoryIcon category={alert.category} severity={alert.severity} />

                  <div className="min-w-0 flex-1 pl-1">
                    {/* Header: Title + Severity Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                        {isTa ? alert.title_ta : isHi ? alert.title_en : alert.title_en}
                      </h3>
                      <SeverityBadge severity={alert.severity} language={language} />
                    </div>

                    {/* Alert Message */}
                    <p className="text-xs leading-relaxed text-slate-700">
                      {isTa ? alert.message_ta : alert.message_en}
                    </p>

                    {/* Immediate Recommended Action Chip */}
                    {(alert.action_en || alert.action_ta) && (
                      <div className="mt-2.5 flex items-start gap-1.5 rounded-xl bg-white/80 border border-slate-200/80 p-2.5 text-xs text-slate-800 shadow-2xs">
                        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                        <div>
                          <span className="font-bold text-emerald-900 mr-1">
                            {isTa ? 'உடனடி நடவடிக்கை:' : isHi ? 'कार्रवाई:' : 'Recommended Action:'}
                          </span>
                          <span className="text-slate-800 font-medium">
                            {isTa ? alert.action_ta : alert.action_en}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Metadata Footer: Crop name & Timestamp */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                      {alert.crop_name && (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <Leaf className="h-3 w-3 text-emerald-600" />
                          {alert.crop_name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — RECENT CROP SCANS (Directly below Important Alerts)
      ══════════════════════════════════════════════════════════ */}
      <section aria-labelledby="heading-recent-scans" className="space-y-3.5 animate-slide-up">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Camera className="h-3.5 w-3.5 text-emerald-700" />
            </div>
            <h2 id="heading-recent-scans" className="text-xs font-black uppercase tracking-wider text-slate-700">
              {t.recent_scans}
            </h2>
          </div>

          {recentDetections.length > 0 && (
            <button
              onClick={() => onNavigate('detect')}
              id="btn-view-all-scans"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 transition-colors"
            >
              <span>{t.view_all_history}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {recentDetections.length === 0 ? (
          /* Empty State: Friendly Prompt to Start First Scan */
          <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-white px-6 py-10 text-center shadow-xs">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-md border border-emerald-200 p-4">
                <Camera className="h-9 w-9 text-emerald-600" strokeWidth={1.75} />
              </div>
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            <div className="max-w-sm">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                {isTa
                  ? 'இதுவரை இலை ஆய்வுகள் எதுவும் இல்லை'
                  : isHi
                  ? 'अभी तक कोई स्कैन नहीं हुआ'
                  : 'No Crop Scans Recorded Yet'}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {isTa
                  ? 'பாதிக்கப்பட்ட அல்லது ஆரோக்கியமான இலையை படம் பிடியுங்கள். AI உடனடியாக நோய் காரணி மற்றும் சிகிச்சையை வழிகாட்டும்.'
                  : isHi
                  ? 'प्रभावित पत्ती की फोटो लें। हमारा AI तुरंत रोग की पहचान कर समाधान बताएगा।'
                  : 'Photograph any leaf showing spots, yellowing, or wilting. AI will identify the condition and recommend approved management practices.'}
              </p>
            </div>

            {/* Prominent Scan a Crop Button in Empty State */}
            <button
              onClick={() => onNavigate('detect')}
              id="btn-scan-crop-empty"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 transition-all hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 active:scale-95"
            >
              <Camera className="h-5 w-5" />
              <span>
                {isTa ? 'இப்போது இலை ஆய்வு செய்' : isHi ? 'अब फसल स्कैन करें' : 'Scan a Crop Now'}
              </span>
            </button>
          </div>
        ) : (
          /* Scans List with Prominent CTA */
          <div className="space-y-3">
            {recentDetections.map((scan, idx) => {
              const isHealthy = scan.is_healthy;
              const confidence = Math.round(scan.confidence_score * 100);

              const statusBadgeBg = isHealthy
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : confidence >= 75
                ? 'bg-red-100 text-red-800 border-red-200'
                : 'bg-amber-100 text-amber-800 border-amber-200';

              const barColor = isHealthy
                ? 'bg-emerald-600'
                : confidence >= 75
                ? 'bg-red-600'
                : 'bg-amber-600';

              const treatmentSummary = isTa
                ? scan.treatment_summary_ta || "முன்னெச்சரிக்கையாக பரிந்துரைக்கப்பட்ட மருந்துகளைத் தெளிக்கவும்."
                : isHi
                ? scan.treatment_summary_hi || "फसल सुरक्षा हेतु अनुशंसित उपचार का समय पर प्रयोग करें।"
                : scan.treatment_summary_en || "Apply approved preventive or curative treatment according to label instructions.";

              const organicSummary = isTa
                ? scan.organic_summary_ta || "சூடோமோனாஸ் அல்லது வேப்பெண்ணெய் கரைசல்"
                : isHi
                ? scan.organic_summary_hi || "स्यूडोमोनास फ्लोरोसेंस या नीम तेल का छिड़काव"
                : scan.organic_summary_en || "Pseudomonas fluorescens or Neem oil extract spray";

              const chemicalSummary = isTa
                ? scan.chemical_summary_ta || "மேன்கோசெப் அல்லது கார்பன்டசிம் பரிந்துரைக்கப்பட்ட அளவில்"
                : isHi
                ? scan.chemical_summary_hi || "मैंकोजेब या अनुशंसित कवकनाशी अनुमोदित मात्रा में"
                : scan.chemical_summary_en || "Mancozeb or registered fungicide at recommended dosage";

              return (
                <div
                  key={scan.id}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-xs transition-all hover:border-emerald-300 hover:shadow-md"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail / Crop Diagnostic Icon */}
                    {scan.image_preview_url ? (
                      <img
                        src={scan.image_preview_url}
                        alt={isTa ? scan.condition_title_ta : scan.condition_title_en}
                        className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 ${
                          isHealthy
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        {isHealthy ? (
                          <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
                        ) : (
                          <XCircle className="h-8 w-8" strokeWidth={2} />
                        )}
                      </div>
                    )}

                    {/* Scan Header Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {isTa ? scan.condition_title_ta : isHi ? scan.condition_title_hi || scan.condition_title_en : scan.condition_title_en}
                        </h4>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusBadgeBg}`}>
                          {isHealthy
                            ? isTa ? 'ஆரோக்கியமானது' : isHi ? 'स्वस्थ' : 'Healthy'
                            : isTa ? 'நோய் காரணி' : isHi ? 'रोगग्रस्त' : 'Infected'}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-emerald-800">
                          <Leaf className="h-3 w-3 text-emerald-600" />
                          {isTa ? scan.crop_name_ta : isHi ? scan.crop_name_hi || scan.crop_name_en : scan.crop_name_en}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {scan.timestamp_formatted || scan.timestamp}
                        </span>
                      </div>

                      {/* Confidence Indicator Bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full ${barColor} transition-all`}
                            style={{ width: `${confidence}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 shrink-0">
                          {confidence}% {isTa ? 'துல்லியம்' : isHi ? 'सटीकता' : 'Accuracy'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Summaries Strip */}
                  <div className="mt-3 grid grid-cols-1 gap-2 pt-2 border-t border-slate-100 text-xs">
                    {/* General Treatment Summary */}
                    <div className="rounded-xl bg-slate-50/80 p-2.5 border border-slate-100/80 text-[11px] text-slate-700">
                      <span className="font-bold text-slate-900 block mb-0.5">
                        📋 {isTa ? 'சிகிச்சை சுருக்கம்:' : isHi ? 'उपचार सारांश:' : 'Treatment Summary:'}
                      </span>
                      <span>{treatmentSummary}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Organic Summary */}
                      <div className="rounded-xl bg-emerald-50/70 p-2.5 border border-emerald-100 text-[11px] text-emerald-950">
                        <span className="font-bold text-emerald-800 flex items-center gap-1 mb-0.5">
                          🌱 {isTa ? 'இயற்கை தீர்வு:' : isHi ? 'जैविक उपाय:' : 'Organic Solution:'}
                        </span>
                        <span className="line-clamp-2">{organicSummary}</span>
                      </div>

                      {/* Chemical Summary */}
                      <div className="rounded-xl bg-sky-50/70 p-2.5 border border-sky-100 text-[11px] text-sky-950">
                        <span className="font-bold text-sky-800 flex items-center gap-1 mb-0.5">
                          🧪 {isTa ? 'இரசாயன தீர்வு:' : isHi ? 'रासायनिक उपाय:' : 'Chemical Solution:'}
                        </span>
                        <span className="line-clamp-2">{chemicalSummary}</span>
                      </div>
                    </div>
                  </div>

                  {/* View Full Details Button */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (onViewScanDetails) {
                          onViewScanDetails(scan);
                        } else {
                          setSelectedScan(scan);
                          onNavigate('detect');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3.5 text-xs shadow-xs transition-all active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isTa ? 'முழு விவரம் காண்க' : isHi ? 'पूरा विवरण देखें' : 'View Full Details'}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Prominent Primary Scan Button */}
            <button
              onClick={() => onNavigate('detect')}
              id="btn-scan-a-crop-primary"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 py-3.5 px-4 text-sm font-extrabold text-white shadow-md shadow-emerald-800/20 transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg active:scale-[0.99]"
            >
              <Camera className="h-4 w-4" />
              <span>
                {isTa ? 'புதிய இலை ஆய்வு செய்' : isHi ? 'नया फसल स्कैन शुरू करें' : 'Scan a Crop Now'}
              </span>
            </button>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════
          MODAL — RECENT CROP SCAN DIAGNOSTIC DETAILS
          Provides full result view on click without losing context
      ══════════════════════════════════════════════════════════ */}
      {selectedScan && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedScan(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 mb-1">
                  {isTa ? 'நோய் ஆய்வு முடிவு' : isHi ? 'निदान परिणाम' : 'Diagnostic Assessment'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {isTa ? selectedScan.condition_title_ta : selectedScan.condition_title_en}
                </h3>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image / Avatar */}
            {selectedScan.image_preview_url ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={selectedScan.image_preview_url}
                  alt={selectedScan.condition_title_en}
                  className="w-full h-48 object-cover"
                />
              </div>
            ) : (
              <div
                className={`flex items-center justify-center p-6 rounded-2xl border-2 ${
                  selectedScan.is_healthy
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                {selectedScan.is_healthy ? (
                  <CheckCircle2 className="h-16 w-16" strokeWidth={1.5} />
                ) : (
                  <XCircle className="h-16 w-16" strokeWidth={1.5} />
                )}
              </div>
            )}

            {/* Key Diagnostic Attributes */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {isTa ? 'பயிர்' : isHi ? 'फसल' : 'Crop'}
                </span>
                <span className="font-extrabold text-slate-800">
                  {isTa ? selectedScan.crop_name_ta : selectedScan.crop_name_en}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {isTa ? 'துல்லியம்' : isHi ? 'सटीकता' : 'Confidence'}
                </span>
                <span className="font-extrabold text-emerald-700">
                  {Math.round(selectedScan.confidence_score * 100)}%
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 col-span-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {isTa ? 'தேதி & நேரம்' : isHi ? 'दिनांक और समय' : 'Timestamp'}
                </span>
                <span className="font-semibold text-slate-700">
                  {selectedScan.timestamp_formatted || selectedScan.timestamp}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedScan(null);
                  onNavigate('detect');
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 text-xs shadow-sm transition-all active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>
                  {isTa ? 'முழு மருத்துவ வழிகாட்டல்' : isHi ? 'पूर्ण उपचार देखें' : 'Open in Disease Detection'}
                </span>
              </button>

              <button
                onClick={() => setSelectedScan(null)}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 transition-colors"
              >
                {isTa ? 'மூடு' : isHi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
