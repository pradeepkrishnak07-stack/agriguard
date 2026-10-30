import React, { useState, useEffect } from 'react';
import {
  Droplets, CloudRain, Clock, AlertCircle,
  HelpCircle, RefreshCw, CheckCircle2, Waves
} from 'lucide-react';
import { Language, IrrigationAdvice, FarmProfile, SoilMoistureData } from '../types';
import { translations } from '../i18n';
import { api } from '../services/api';
import { SoilMoistureCard } from './SoilMoistureCard';

interface IrrigationScreenProps {
  language: Language;
  farmProfile: FarmProfile;
}

export const IrrigationScreen: React.FC<IrrigationScreenProps> = ({ language, farmProfile }) => {
  const t = translations[language];
  const isTa = language === 'ta';

  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState<IrrigationAdvice | null>(null);
  const [reminderSet, setReminderSet] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState<SoilMoistureData | null>(null);
  const [soilLoading, setSoilLoading] = useState(true);

  const activeCrop = farmProfile.crops.find(c => c.crop_id === farmProfile.active_crop_id) || farmProfile.crops[0];

  const fetchSoilMoisture = async () => {
    try {
      const sm = await api.getLatestSoilMoisture();
      setSoilMoisture(sm);
    } catch (e) {
      console.warn("Failed to fetch soil moisture", e);
    } finally {
      setSoilLoading(false);
    }
  };

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      const [adviceData, smData] = await Promise.all([
        api.getIrrigationAdvice(
          farmProfile.active_crop_id,
          activeCrop?.growth_stage,
          activeCrop?.soil_type,
          activeCrop?.irrigation_method,
          farmProfile.latitude,
          farmProfile.longitude
        ),
        api.getLatestSoilMoisture()
      ]);
      setAdvice(adviceData);
      setSoilMoisture(smData);
    } catch (e) {
      console.error("Error fetching irrigation advice", e);
    } finally {
      setLoading(false);
      setSoilLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
    const interval = setInterval(fetchSoilMoisture, 8000);
    return () => clearInterval(interval);
  }, [farmProfile.active_crop_id]);

  const handleSetReminder = () => {
    setReminderSet(true);
    setTimeout(() => setReminderSet(false), 4000);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Title Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">
              {t.irri_title}
            </h2>
          </div>
          <button
            onClick={fetchAdvice}
            disabled={loading}
            className="p-1.5 text-slate-500 hover:text-sky-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          {t.irri_desc}
        </p>

        {/* Crop Profile Info */}
        <div className="pt-2 text-xs flex flex-wrap gap-2 text-slate-600 border-t border-slate-100">
          <span className="bg-sky-50 text-sky-900 px-2.5 py-1 rounded-lg border border-sky-100 font-semibold">
            🌱 {isTa ? activeCrop?.crop_name_ta : activeCrop?.crop_name_en}
          </span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
            {t.irri_growth_stage}: <strong>{activeCrop?.growth_stage || 'Vegetative'}</strong>
          </span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
            {t.irri_soil_type}: <strong>{activeCrop?.soil_type || 'Red Loam'}</strong>
          </span>
        </div>
      </div>

      {/* Live ESP32 Soil Sensor Telemetry */}
      <SoilMoistureCard
        language={language}
        data={soilMoisture}
        loading={soilLoading}
        onRefresh={fetchSoilMoisture}
      />

      {loading ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">
            {isTa ? "நீர்ப்பாசன ஆலோசனை கணக்கிடப்படுகிறது..." : "Analyzing evapotranspiration & rain forecasts..."}
          </p>
        </div>
      ) : advice && (
        <div className="space-y-4">
          {/* Main Watering Status Card */}
          <div className={`p-5 rounded-2xl border shadow-sm space-y-3 ${
            advice.status_code === 'POSTPONE_RAIN'
              ? 'bg-blue-50 border-blue-200 text-blue-950'
              : advice.status_code === 'INCREASE'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : advice.status_code === 'CRITICAL_STAGE'
              ? 'bg-purple-50 border-purple-200 text-purple-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
                {advice.status_code === 'POSTPONE_RAIN' ? (
                  <CloudRain className="w-6 h-6 text-blue-700" />
                ) : (
                  <Waves className="w-6 h-6 text-emerald-700" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  {t.irri_status}
                </span>
                <h3 className="text-base font-extrabold leading-tight">
                  {isTa ? advice.status_title_ta : advice.status_title_en}
                </h3>
              </div>
            </div>

            <div className="bg-white/80 p-3 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-slate-900 block">
                👉 {t.irri_action}:
              </span>
              <p className="text-slate-700 leading-relaxed">
                {isTa ? advice.action_advice_ta : advice.action_advice_en}
              </p>
            </div>

            {/* Contributing factors */}
            <div className="pt-1 space-y-1 text-xs">
              <span className="font-bold opacity-80 block text-[11px] uppercase tracking-wider">
                {isTa ? "காரணிகள்:" : "Considered Factors:"}
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pl-1">
                {(isTa ? advice.contributing_factors_ta : advice.contributing_factors_en)?.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            {/* Reassess Time & Reminder */}
            <div className="pt-2 border-t border-current/15 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 opacity-90">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {t.irri_reassess} {advice.reassess_after_hours} {t.irri_hours}
                </span>
              </div>

              <button
                onClick={handleSetReminder}
                disabled={reminderSet}
                className="bg-white/80 hover:bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm transition-colors active:scale-95 flex items-center gap-1"
              >
                {reminderSet ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isTa ? "நினைவூட்டல் பதிவு செய்யப்பட்டது!" : "Reminder Saved!"}</span>
                  </>
                ) : (
                  <span>{isTa ? "நினைவூட்டல் வை" : "Set Reminder"}</span>
                )}
              </button>
            </div>
          </div>

          {/* Irrigation Method Tip */}
          {advice.method_guidance_en && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1.5 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>{t.irri_method_tip} ({advice.irrigation_method}):</span>
              </h4>
              <p className="text-slate-600">
                {isTa ? advice.method_guidance_ta : advice.method_guidance_en}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-slate-100 rounded-xl p-3 text-[11px] text-slate-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>{isTa ? advice.disclaimer_ta : advice.disclaimer_en}</span>
          </div>
        </div>
      )}
    </div>
  );
};
