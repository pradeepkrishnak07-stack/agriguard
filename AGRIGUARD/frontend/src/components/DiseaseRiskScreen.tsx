import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Thermometer, Droplet, CloudRain,
  AlertTriangle, CheckCircle2, RefreshCw, Info, Calendar
} from 'lucide-react';
import { Language, DiseaseRiskData, FarmProfile } from '../types';
import { translations } from '../i18n';
import { api } from '../services/api';

interface DiseaseRiskScreenProps {
  language: Language;
  farmProfile: FarmProfile;
}

export const DiseaseRiskScreen: React.FC<DiseaseRiskScreenProps> = ({ language, farmProfile }) => {
  const t = translations[language];
  const isTa = language === 'ta';

  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState<DiseaseRiskData | null>(null);

  const activeCrop = farmProfile.crops.find(c => c.crop_id === farmProfile.active_crop_id) || farmProfile.crops[0];

  const fetchRisk = async () => {
    setLoading(true);
    try {
      const data = await api.getDiseaseRisk(
        farmProfile.active_crop_id,
        farmProfile.latitude,
        farmProfile.longitude,
        farmProfile.location_name
      );
      setRiskData(data);
    } catch (e) {
      console.error("Error fetching risk assessment", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, [farmProfile.active_crop_id, farmProfile.location_name]);

  const getRiskBadge = (category: string) => {
    switch (category) {
      case 'High':
        return {
          bg: 'bg-red-50 text-red-950 border-red-200',
          badge: 'bg-red-600 text-white',
          icon: AlertTriangle,
          label: isTa ? 'அதிக அபாயம்' : 'High Risk'
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50 text-amber-950 border-amber-200',
          badge: 'bg-amber-600 text-white',
          icon: AlertTriangle,
          label: isTa ? 'மிதமான அபாயம்' : 'Moderate Risk'
        };
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-950 border-emerald-200',
          badge: 'bg-emerald-600 text-white',
          icon: CheckCircle2,
          label: isTa ? 'குறைந்த அபாயம்' : 'Low Risk'
        };
    }
  };

  const badgeInfo = getRiskBadge(riskData?.risk_category || 'Low');
  const BadgeIcon = badgeInfo.icon;

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              {t.risk_title}
            </h2>
          </div>
          <button
            onClick={fetchRisk}
            disabled={loading}
            className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh Risk Forecast"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          {t.risk_desc}
        </p>

        <div className="pt-2 text-xs flex items-center justify-between border-t border-slate-100">
          <div>
            <span className="text-slate-500">{isTa ? "பயிர்:" : "Target Crop:"} </span>
            <span className="font-bold text-slate-900">
              🌱 {isTa ? activeCrop?.crop_name_ta : activeCrop?.crop_name_en}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{isTa ? riskData?.forecast_period_ta : riskData?.forecast_period}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">
            {isTa ? "வானிலை காரணிகள் மற்றும் நோய் அபாயம் கணக்கிடப்படுகிறது..." : "Calculating epidemiological risk factors from forecast..."}
          </p>
        </div>
      ) : riskData && (
        <div className="space-y-4">
          {/* Main Risk Status Card */}
          <div className={`p-5 rounded-2xl border ${badgeInfo.bg} shadow-sm space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgeIcon className="w-6 h-6 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    {t.risk_level_label}
                  </span>
                  <h3 className="text-lg font-extrabold leading-tight">
                    {isTa ? riskData.risk_category_ta : riskData.risk_category}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/60 border border-current">
                  {riskData.overall_score_out_of_10} / 10
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed font-medium">
              {isTa ? riskData.summary_ta : riskData.summary_en}
            </p>

            {/* Contributing Weather Factors */}
            <div className="pt-2 border-t border-current/15 space-y-1.5">
              <h5 className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                {t.risk_factors}:
              </h5>
              <ul className="list-disc list-inside text-xs space-y-1 pl-1">
                {(isTa ? riskData.contributing_factors_ta : riskData.contributing_factors_en)?.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Meteorological Snapshot */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-700">
              {isTa ? "வானிலை உள்ளீடுகள் (Agrometeorological Parameters):" : "Forecast Meteorological Inputs:"}
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Thermometer className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                <span className="font-bold block text-slate-800">{riskData.weather_snapshot.temperature_c}°C</span>
                <span className="text-[10px] text-slate-500">{isTa ? "வெப்பநிலை" : "Temperature"}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Droplet className="w-4 h-4 mx-auto text-sky-600 mb-1" />
                <span className="font-bold block text-slate-800">{riskData.weather_snapshot.humidity_percent}%</span>
                <span className="text-[10px] text-slate-500">{isTa ? "ஈரப்பதம்" : "Humidity"}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CloudRain className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                <span className="font-bold block text-slate-800">{riskData.weather_snapshot.forecast_3day_rain_mm} mm</span>
                <span className="text-[10px] text-slate-500">{isTa ? "3-நாள் மழை" : "3-Day Rain"}</span>
              </div>
            </div>
          </div>

          {/* Pathogen-Level Breakdown */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
              {t.risk_target_diseases}
            </h4>

            <div className="space-y-2.5">
              {riskData.assessed_diseases.map((d) => (
                <div
                  key={d.disease_id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900">
                        {isTa ? d.disease_name_ta : d.disease_name_en}
                      </h5>
                      <span className="text-[10px] text-slate-400 italic">
                        {d.pathogen}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.risk_level === 'High'
                        ? 'bg-red-100 text-red-800'
                        : d.risk_level === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isTa ? d.risk_level_ta : d.risk_level}
                    </span>
                  </div>

                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-slate-700">
                    <span className="font-bold text-emerald-950 block mb-1">
                      🛡️ {isTa ? "முன்னெச்சரிக்கை பாதுகாப்பு நடவடிக்கை:" : "Preventive Management:"}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {(isTa ? d.prevention_ta : d.prevention_en)?.map((prev, i) => (
                        <li key={i}>{prev}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Disclaimer */}
          <div className="bg-slate-100 rounded-xl p-3 text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>{isTa ? riskData.disclaimer_ta : riskData.disclaimer_en}</span>
          </div>
        </div>
      )}
    </div>
  );
};
