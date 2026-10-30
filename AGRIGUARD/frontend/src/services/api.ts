import {
  Language, WeatherData, DiseaseDetectionResult, DiseaseRiskData,
  IrrigationAdvice, FertilizerAdvice, SmartAlert, FarmProfile, DetectionRecord
} from '../types';
import { SoilMoistureData } from '../types';
import { storageService } from './storage';
import { getEnrichedDiseaseData } from './diseaseKnowledge';

export interface BackendHealthStatus {
  backendAvailable: boolean;
  databaseAvailable: boolean;
  authReady: boolean;
  status: 'ready' | 'db_unavailable' | 'unavailable' | 'checking';
  usersCount?: number;
  message?: string;
  errorDetail?: string;
}

export interface AssistantConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantResponse {
  success: boolean;
  topic_en: string;
  topic_ta: string;
  topic_hi: string;
  reply_en: string;
  reply_ta: string;
  reply_hi: string;
  spoken_text: string;
  reference: string;
  model: string;
}

function isDiseaseDetectionResult(value: unknown): value is DiseaseDetectionResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'success' in value &&
    typeof value.success === 'boolean' &&
    'is_reliable' in value &&
    typeof value.is_reliable === 'boolean'
  );
}

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) ||
  (import.meta.env.DEV ? '/api' : 'http://127.0.0.1:8001/api');

export const api = {
  async checkBackendHealth(retries = 1): Promise<BackendHealthStatus> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(`${API_BASE_URL}/health/ready`, {
          signal: AbortSignal.timeout(3000),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          return {
            backendAvailable: true,
            databaseAvailable: true,
            authReady: true,
            status: 'ready',
            usersCount: data?.database?.users_count,
            message: 'Backend and database are ready'
          };
        }

        if (res.status === 503) {
          const data = await res.json().catch(() => null);
          return {
            backendAvailable: true,
            databaseAvailable: false,
            authReady: false,
            status: 'db_unavailable',
            message: data?.database?.error || 'Database storage is temporarily unavailable',
            errorDetail: data?.database?.error
          };
        }

        // Fallback to basic /health liveness endpoint
        const liveRes = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
        if (liveRes.ok) {
          return {
            backendAvailable: true,
            databaseAvailable: true,
            authReady: true,
            status: 'ready',
            message: 'Backend service is responsive'
          };
        }
      } catch (err: any) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 600));
          continue;
        }
      }
    }

    return {
      backendAvailable: false,
      databaseAvailable: false,
      authReady: false,
      status: 'unavailable',
      message: 'Backend service is unavailable. Please verify the backend server is running on port 8001.'
    };
  },

  async isBackendHealthy(): Promise<boolean> {
    const health = await this.checkBackendHealth(0);
    return health.backendAvailable;
  },

  async register(payload: {
    full_name: string;
    mobile: string;
    email: string;
    state: string;
    district: string;
    password: string;
    confirm_password: string;
    preferred_language?: string;
  }): Promise<{
    success: boolean;
    token?: string;
    user?: any;
    message?: string;
    message_ta?: string;
    message_hi?: string;
    field?: string;
    error_code?: string;
    isBackendUnavailable?: boolean;
    isDbUnavailable?: boolean;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Failed to parse JSON body (e.g. 502/504 Bad Gateway from proxy)
        if (res.status >= 500) {
          return {
            success: false,
            isBackendUnavailable: true,
            message: 'Backend service is unavailable. Please verify the backend server is running on port 8001.'
          };
        }
        return {
          success: false,
          message: `Request failed with HTTP status ${res.status}`
        };
      }

      if (res.ok && data?.success) {
        return { success: true, ...data };
      }

      if (res.status === 503) {
        return {
          success: false,
          isDbUnavailable: true,
          message: data?.message || 'Database service is temporarily unavailable. Please retry.'
        };
      }

      return {
        success: false,
        message: data?.message || 'Registration failed. Please try again.',
        message_ta: data?.message_ta,
        message_hi: data?.message_hi,
        field: data?.field,
        error_code: data?.error_code,
        ...data
      };
    } catch (err: any) {
      return {
        success: false,
        isBackendUnavailable: true,
        message: 'Backend service is unavailable. Please verify the backend server is running on port 8001.'
      };
    }
  },

  async login(payload: {
    mobile?: string;
    email?: string;
    password: string;
  }): Promise<{
    success: boolean;
    token?: string;
    user?: any;
    message?: string;
    message_ta?: string;
    message_hi?: string;
    field?: string;
    error_code?: string;
    isBackendUnavailable?: boolean;
    isDbUnavailable?: boolean;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        if (res.status >= 500) {
          return {
            success: false,
            isBackendUnavailable: true,
            message: 'Backend service is unavailable. Please verify the backend server is running on port 8001.'
          };
        }
        return {
          success: false,
          message: `Request failed with HTTP status ${res.status}`
        };
      }

      if (res.ok && data?.success) {
        return { success: true, ...data };
      }

      if (res.status === 503) {
        return {
          success: false,
          isDbUnavailable: true,
          message: data?.message || 'Database service is temporarily unavailable. Please retry.'
        };
      }

      return {
        success: false,
        message: data?.message || 'Invalid credentials. Please try again.',
        message_ta: data?.message_ta,
        message_hi: data?.message_hi,
        field: data?.field,
        error_code: data?.error_code,
        ...data
      };
    } catch (err: any) {
      return {
        success: false,
        isBackendUnavailable: true,
        message: 'Backend service is unavailable. Please verify the backend server is running on port 8001.'
      };
    }
  },

  async getWeather(lat?: number, lon?: number, locationName?: string): Promise<WeatherData> {
    try {
      const params = new URLSearchParams();
      if (lat !== undefined) params.append('lat', String(lat));
      if (lon !== undefined) params.append('lon', String(lon));
      if (locationName) params.append('location_name', locationName);

      const res = await fetch(`${API_BASE_URL}/weather/forecast?${params.toString()}`, {
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const data: WeatherData = await res.json();
        if (data.success) {
          storageService.saveCachedWeather(data);
          return data;
        }
      }
    } catch (e) {
      console.warn("Network request for weather failed, checking offline cache", e);
    }

    // Offline Fallback from Cache
    const cached = storageService.getCachedWeather();
    if (cached) {
      return {
        ...cached,
        is_cached: true,
        is_stale: true,
        status_message: "You are offline. Showing previously saved weather."
      };
    }

    // Fallback default snapshot if brand new and offline
    return {
      success: true,
      source: "Offline Agrometeorological Profile",
      is_cached: true,
      is_stale: true,
      location_name: locationName || "Thanjavur, Tamil Nadu",
      latitude: lat || 10.7870,
      longitude: lon || 79.1378,
      last_updated_formatted: "Offline Cache",
      current: {
        temperature: 28.5,
        feels_like: 30.0,
        humidity: 78,
        precipitation_mm: 0.0,
        wind_speed_kmh: 11.5,
        condition_en: "Partly Cloudy",
        condition_ta: "பகுதி மேகமூட்டம்",
        icon: "cloud-sun"
      },
      forecast: [
        { date: "Day 1", temp_max: 31, temp_min: 24, precipitation_mm: 2.0, precipitation_probability: 30, condition_en: "Scattered Clouds", condition_ta: "மேகமூட்டம்", icon: "cloud" },
        { date: "Day 2", temp_max: 30, temp_min: 23, precipitation_mm: 8.5, precipitation_probability: 65, condition_en: "Light Rain", condition_ta: "லேசான மழை", icon: "cloud-drizzle" },
        { date: "Day 3", temp_max: 29, temp_min: 23, precipitation_mm: 14.0, precipitation_probability: 80, condition_en: "Moderate Rain", condition_ta: "மிதமான மழை", icon: "cloud-rain" }
      ]
    };
  },

  async detectCropDisease(file: File, cropHint?: string): Promise<DiseaseDetectionResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (cropHint && cropHint.trim()) {
      formData.append('crop_hint', cropHint.trim());
    }
    formData.append('save_to_history', 'true');

    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/disease/detect`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(15000)
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'TimeoutError') {
        throw new Error('Disease analysis timed out. Please try again with a smaller, clear image.');
      }
      throw new Error('Could not connect to the disease prediction service. Check the backend connection and try again.');
    }

    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      throw new Error(
        res.ok
          ? 'The disease prediction service returned an unreadable response. Please try again.'
          : `The disease prediction service returned an error (HTTP ${res.status}). Please try again.`
      );
    }

    if (!res.ok) {
      const detail =
        typeof payload === 'object' && payload !== null && 'detail' in payload &&
        typeof payload.detail === 'string'
          ? payload.detail
          : `The disease prediction service returned an error (HTTP ${res.status}). Please try again.`;
      throw new Error(detail);
    }

    if (!isDiseaseDetectionResult(payload)) {
      throw new Error('The disease prediction service returned an invalid response. Please try again.');
    }

    const data = payload;

    // Enrich with scientific knowledge base details without clobbering backend results
    if (data.success && data.is_reliable && data.crop_id) {
      const enriched = getEnrichedDiseaseData(data.crop_id, data.disease_id);
      if (enriched) {
        data.soil_info = data.soil_info || enriched.soil_info;
        data.causes_info = data.causes_info || enriched.causes;
        data.organic_treatment = data.organic_treatment || enriched.organic;
        data.chemical_treatment = data.chemical_treatment || enriched.chemical;
        data.crop_name_hi = data.crop_name_hi || enriched.crop_meta?.crop_name_hi;
        data.condition_title_hi = data.condition_title_hi || enriched.disease_detail?.name_hi;
        data.explanation_en = data.explanation_en || enriched.disease_detail?.explanation_en;
        data.explanation_ta = data.explanation_ta || enriched.disease_detail?.explanation_ta;
        data.explanation_hi = data.explanation_hi || enriched.disease_detail?.explanation_hi;
        data.common_symptoms_hi = data.common_symptoms_hi || enriched.disease_detail?.symptoms_hi;
      }

      const record: DetectionRecord = {
        id: data.saved_record_id || `local_${Date.now()}`,
        crop_id: data.crop_id || (cropHint || 'general'),
        crop_name_en: data.crop_name_en || (cropHint || 'Crop Leaf'),
        crop_name_ta: data.crop_name_ta || (cropHint || 'பயிர் இலை'),
        crop_name_hi: data.crop_name_hi,
        disease_id: data.disease_id,
        condition_title_en: data.condition_title_en || 'Analyzed Leaf',
        condition_title_ta: data.condition_title_ta || 'ஆய்வு செய்யப்பட்ட இலை',
        condition_title_hi: data.condition_title_hi,
        confidence_score: data.confidence_score || 0.85,
        is_healthy: !!data.is_healthy,
        timestamp: new Date().toISOString(),
        timestamp_formatted: new Date().toLocaleString(),
        model_version: data.model_version || 'AgriGuard-Vision-v1.4',
        pathogen: data.pathogen,
        filename: file.name,
        treatment_summary_en: data.is_healthy
          ? 'No chemical intervention required; maintain balanced nutrition.'
          : `Organic: ${data.organic_treatment?.name_en || 'Bio-formulation'} | Chemical: ${data.chemical_treatment?.product_name_en || 'Approved chemical'}`,
        treatment_summary_ta: data.is_healthy
          ? 'மருந்து தெளிப்பு தேவையில்லை; சீரான பராமரிப்பு தொடரவும்.'
          : `இயற்கை: ${data.organic_treatment?.name_ta || 'இயற்கை கரைசல்'} | ரசாயனம்: ${data.chemical_treatment?.product_name_ta || 'ரசாயன மருந்து'}`,
        treatment_summary_hi: data.is_healthy
          ? 'दवा की आवश्यकता नहीं; नियमित देखभाल जारी रखें।'
          : `जैविक: ${data.organic_treatment?.name_hi || 'जैविक उपचार'} | रासायनिक: ${data.chemical_treatment?.product_name_hi || 'रासायनिक दवा'}`,
        organic_summary_en: data.organic_treatment?.name_en,
        organic_summary_ta: data.organic_treatment?.name_ta,
        organic_summary_hi: data.organic_treatment?.name_hi,
        chemical_summary_en: data.chemical_treatment?.product_name_en,
        chemical_summary_ta: data.chemical_treatment?.product_name_ta,
        chemical_summary_hi: data.chemical_treatment?.product_name_hi,
        full_result: data
      };
      storageService.addHistory(record);
    }
    return data;
  },

  async getDiseaseRisk(cropId: string, lat?: number, lon?: number, locationName?: string): Promise<DiseaseRiskData> {
    try {
      const res = await fetch(`${API_BASE_URL}/disease/risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_id: cropId,
          latitude: lat,
          longitude: lon,
          location_name: locationName
        }),
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    // Offline rule-based fallback based on cached weather
    const weather = storageService.getCachedWeather();
    const humidity = weather?.current?.humidity ?? 78;
    const temp = weather?.current?.temperature ?? 28;
    const isElevated = humidity >= 80;

    return {
      success: true,
      crop_id: cropId,
      crop_name_en: cropId === 'rice' ? 'Rice / Paddy' : 'Tomato',
      crop_name_ta: cropId === 'rice' ? 'நெல்' : 'தக்காளி',
      location_name: locationName || "Local Farm",
      forecast_period: "Next 48 - 72 Hours (Offline Cache)",
      forecast_period_ta: "அடுத்த 48 - 72 மணி நேரம் (ஆஃப்லைன்)",
      risk_category: isElevated ? 'Moderate' : 'Low',
      risk_category_ta: isElevated ? 'மிதமான அபாயம்' : 'குறைந்த அபாயம்',
      color_badge: isElevated ? 'amber' : 'green',
      overall_score_out_of_10: isElevated ? 6.5 : 3.0,
      summary_en: isElevated ? "Elevated humidity in cached weather suggests potential fungal incubation. Scout leaves regularly." : "Weather parameters appear safe in cached data. Continue scheduled care.",
      summary_ta: isElevated ? "காற்றில் அதிக ஈரப்பதம் உள்ளதால் பூஞ்சை பரவும் வாய்ப்புள்ளது. இலைகளை தவறாமல் கண்காணியுங்கள்." : "வானிலை சீராக உள்ளது. வழக்கமான பராமரிப்பைத் தொடரலாம்.",
      contributing_factors_en: [`Cached atmospheric humidity: ${humidity}%`, `Ambient temperature: ${temp}°C`],
      contributing_factors_ta: [`சேமிக்கப்பட்ட ஈரப்பதம்: ${humidity}%`, `வெப்பநிலை: ${temp}°C`],
      weather_snapshot: {
        temperature_c: temp,
        humidity_percent: humidity,
        precipitation_mm: weather?.current?.precipitation_mm ?? 0,
        forecast_3day_rain_mm: 5.0,
        is_cached_weather: true,
        last_weather_update: "Previously Saved"
      },
      assessed_diseases: [
        {
          disease_id: cropId === 'rice' ? 'rice_blast' : 'tomato_early_blight',
          disease_name_en: cropId === 'rice' ? 'Rice Blast' : 'Tomato Early Blight',
          disease_name_ta: cropId === 'rice' ? 'நெல் குலை நோய்' : 'தக்காளி ஆரம்பக்கால கருகல்',
          pathogen: "Fungus",
          risk_level: isElevated ? 'Moderate' : 'Low',
          risk_level_ta: isElevated ? 'மிதமான அபாயம்' : 'குறைந்த அபாயம்',
          score: isElevated ? 6.5 : 3.0,
          factors_en: ["Humidity approaching critical 80% threshold"],
          factors_ta: ["ஈரப்பதம் 80% அளவை நெருங்குகிறது"],
          prevention_en: ["Maintain canopy aeration", "Avoid overhead sprinkling"],
          prevention_ta: ["காற்றோட்டத்தை அதிகரிக்கவும்", "தெளிப்பு நீர் பாசனத்தை தவிர்க்கவும்"]
        }
      ],
      disclaimer_en: "Notice: Weather-based disease prediction estimates epidemiological risk; it does not confirm physical disease presence. Inspect leaves before applying any treatments.",
      disclaimer_ta: "குறிப்பு: வானிலை அடிப்படையிலான நோய் அபாயம் என்பது சாத்தியக்கூறைக் குறிக்கிறது; அது நோயை உறுதி செய்யவில்லை. மருந்து தெளிக்கும் முன் இலைகளை நேரில் ஆய்வு செய்யவும்.",
      last_assessed: new Date().toLocaleDateString()
    };
  },

  async getLatestSoilMoisture(): Promise<SoilMoistureData> {
    try {
      const res = await fetch(`${API_BASE_URL}/sensor/soil-moisture/latest`, {
        signal: AbortSignal.timeout(5000),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Unable to fetch latest soil moisture", e);
    }
    return {
      success: false,
      device_id: 'esp32_devkit_v1',
      raw_adc: 0,
      moisture_percentage: 0,
      status: 'WAITING',
      connectivity_status: 'OFFLINE',
      is_online: false,
      last_updated: null,
      last_updated_formatted: 'Offline / Unavailable',
      seconds_since_update: null,
      sensor_pin: 'GPIO34',
      advice_en: 'Sensor offline. Verify ESP32 Wi-Fi connection and power supply.',
      advice_ta: 'சென்சார் ஆஃப்லைனில் உள்ளது. ESP32 வைஃபை மற்றும் மின் இணைப்பை சரிபார்க்கவும்.',
      advice_hi: 'सेंसर ऑफ़लाइन है। कृपया ESP32 वाई-फ़ाई और पावर कनेक्शन की जांच करें।'
    };
  },

  async getSoilMoistureHistory(limit = 30): Promise<SoilMoistureData[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/sensor/soil-moisture/history?limit=${limit}`, {
        signal: AbortSignal.timeout(5000),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        return data.readings || [];
      }
    } catch (e) {
      console.warn("Unable to fetch soil moisture history", e);
    }
    return [];
  },

  async getIrrigationAdvice(
    cropId: string,
    growthStage?: string,
    soilType?: string,
    method?: string,
    lat?: number,
    lon?: number
  ): Promise<IrrigationAdvice> {
    try {
      const res = await fetch(`${API_BASE_URL}/irrigation/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_id: cropId,
          growth_stage: growthStage,
          soil_type: soilType,
          irrigation_method: method,
          latitude: lat,
          longitude: lon
        }),
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Offline fallback
    return {
      success: true,
      crop_id: cropId,
      crop_name_en: cropId === 'rice' ? 'Rice' : 'Tomato',
      crop_name_ta: cropId === 'rice' ? 'நெல்' : 'தக்காளி',
      growth_stage: growthStage || 'Vegetative',
      soil_type: soilType || 'Red Loam',
      irrigation_method: method || 'Drip Irrigation',
      status_code: 'NORMAL',
      status_title_en: 'Normal Scheduled Irrigation',
      status_title_ta: 'வழக்கமான நீர்ப்பாசனம்',
      action_advice_en: 'Irrigate according to your standard cycle. Verify soil moisture by hand feel before watering.',
      action_advice_ta: 'வழக்கமான அட்டவணைப்படி நீர் பாய்ச்சவும். நீர் பாய்ச்சும் முன் மண்ணை தொட்டுப் பார்த்து ஈரப்பதத்தை உறுதி செய்யவும்.',
      reassess_after_hours: 24,
      contributing_factors_en: ['Standard crop growth stage', 'Stable atmospheric temperature'],
      contributing_factors_ta: ['வழக்கமான பயிர் பருவம்', 'சீரான வெப்பநிலை'],
      method_guidance_en: 'Drip delivers moisture directly to roots without wetting foliage.',
      method_guidance_ta: 'சொட்டுநீர் பாசனம் இலைகளில் படாமல் நேரடியாக வேருக்கு நீர் தருகிறது.',
      weather_snapshot: {
        temperature: 28,
        humidity: 65,
        precipitation_today_mm: 0,
        rain_forecast_48h_mm: 0,
        rain_probability: 10,
        is_cached: true
      },
      disclaimer_en: 'Notice: Irrigation guidance is estimated based on crop stage and meteorological forecast. Always verify actual physical soil moisture by hand feel before operating pumps.',
      disclaimer_ta: 'குறிப்பு: இது பயிர் பருவம் மற்றும் வானிலை அடிப்படையிலான வழிகாட்டல் மட்டுமே. நீர் பாய்ச்சும் முன் மண்ணை தொட்டுப் பார்த்து ஈரப்பதத்தை உறுதி செய்யவும்.'
    };
  },

  async getFertilizerGuidance(
    cropId: string,
    growthStage?: string,
    deficiencySymptom?: string,
    hasSoilTest: boolean = false
  ): Promise<FertilizerAdvice> {
    try {
      const res = await fetch(`${API_BASE_URL}/fertilizer/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_id: cropId,
          growth_stage: growthStage,
          observed_deficiency_symptom: deficiencySymptom,
          has_soil_test: hasSoilTest
        }),
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Offline guidance
    return {
      success: true,
      crop_id: cropId,
      crop_name_en: cropId === 'rice' ? 'Rice' : 'Tomato',
      crop_name_ta: cropId === 'rice' ? 'நெல்' : 'தக்காளி',
      growth_stage: growthStage || 'Vegetative',
      has_soil_test: hasSoilTest,
      recommended_npk_ratio: '150:100:50 kg/ha',
      soil_testing_advice_en: 'A laboratory soil test every 2 years provides exact fertilizer recommendations.',
      soil_testing_advice_ta: 'இரண்டு வருடங்களுக்கு ஒருமுறை மண் பரிசோதனை செய்வது மிகவும் அவசியம்.',
      basal_application_en: 'Apply FYM 25 t/ha, full Phosphorus and 25% Nitrogen & Potash at planting.',
      basal_application_ta: 'கடைசி உழவின் போது தொழு உரம் 25 டன், முழு மணிச்சத்து மற்றும் கால் பங்கு தழை & சாம்பல் சத்து இடவும்.',
      stage_split_recommendations_en: [
        { stage: 'Vegetative', action: 'Top-dress 50% Nitrogen after weeding.' },
        { stage: 'Flowering', action: 'Apply remaining Nitrogen and Potash to support fruit formation.' }
      ],
      stage_split_recommendations_ta: [
        { stage: 'வளர்ச்சிப் பருவம்', action: 'களை எடுத்த பின் 50% தழைச்சத்து மேலுரமாக இடவும்.' },
        { stage: 'பூக்கும் பருவம்', action: 'மீதி தழை மற்றும் பொட்டாஷ் உரம் இடவும்.' }
      ],
      biofertilizer_guidance_en: 'Apply Azospirillum and Phosphobacteria @ 2 kg/ha mixed with compost.',
      biofertilizer_guidance_ta: 'அசோஸ்பைரில்லம் மற்றும் பாஸ்போபாக்டீரியா தலா 2 கிலோ/ஹெக்டர் இடவும்.',
      available_deficiency_options: [
        { id: 'nitrogen', label_en: 'Nitrogen (N) - Lower leaf yellowing', label_ta: 'தழைச்சத்து - கீழ் இலை மஞ்சளாதல்' },
        { id: 'phosphorus', label_en: 'Phosphorus (P) - Purple/bronze veins', label_ta: 'மணிச்சத்து - ஊதா நிற இலை நரம்புகள்' },
        { id: 'potassium', label_en: 'Potassium (K) - Edge scorching', label_ta: 'சாம்பல் சத்து - இலை விளிம்பு கருகல்' },
        { id: 'zinc', label_en: 'Zinc (Zn) - Bleached bands', label_ta: 'துத்தநாகம் - வெள்ளை வரிகள்' }
      ],
      reference: 'TNAU Agritech Portal',
      expert_consultation_en: 'Consult your local KVK for calibrated Soil Test Crop Response (STCR) dosing.',
      expert_consultation_ta: 'துல்லிய உர அளவிற்கு வட்டார வேளாண்மை அலுவலரை அணுகவும்.'
    };
  },

  async generateFertilizerPlan(payload: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/fertilizer/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000)
      });
      if (!res.ok) {
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          const err: any = new Error('BACKEND_UNAVAILABLE');
          err.status = res.status;
          err.isNetworkError = true;
          throw err;
        }
        let errorMsg = '';
        try {
          const errData = await res.json();
          if (typeof errData.detail === 'string') {
            errorMsg = errData.detail;
          } else if (Array.isArray(errData.detail)) {
            errorMsg = errData.detail.map((d: any) => d.msg || `${d.loc?.slice(1).join('.')}: ${d.type}`).join(', ');
          } else if (errData.message) {
            errorMsg = errData.message;
          }
        } catch (_) {}
        const customErr: any = new Error(errorMsg || `Server responded with status ${res.status}`);
        customErr.status = res.status;
        throw customErr;
      }
      return await res.json();
    } catch (e: any) {
      if (e.isNetworkError || e.message === 'BACKEND_UNAVAILABLE') {
        throw e;
      }
      if (
        e.name === 'TimeoutError' ||
        e.name === 'AbortError' ||
        (e.message && (e.message.includes('fetch') || e.message.includes('NetworkError') || e.message.includes('Failed to fetch')))
      ) {
        const netErr: any = new Error('BACKEND_UNAVAILABLE');
        netErr.isNetworkError = true;
        throw netErr;
      }
      throw e;
    }
  },

  async getFertilizerHistory(userId?: string): Promise<any[]> {
    if (!userId) return [];
    try {
      const res = await fetch(`${API_BASE_URL}/fertilizer/history?user_id=${encodeURIComponent(userId)}`, {
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Error fetching fertilizer history", e);
    }
    return [];
  },

  async deleteFertilizerRecord(recId: string, userId?: string): Promise<boolean> {
    if (!userId) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/fertilizer/history/${encodeURIComponent(recId)}?user_id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const data = await res.json();
        return !!data.success;
      }
    } catch (e) {
      console.warn("Error deleting fertilizer record", e);
    }
    return false;
  },

  async askFertilizerAssistant(query: string, recContext: any, lang: Language): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/fertilizer/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          language: lang,
          recommendation_context: recContext
        }),
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend assistant query failed", e);
    }
    // Fallback if offline
    const isTa = lang === 'ta';
    const isHi = lang === 'hi';
    return {
      success: true,
      topic_en: "Fertilizer Advice",
      topic_ta: "உர ஆலோசனை",
      topic_hi: "उर्वरक सलाह",
      reply_en: "AGRIGUARD advice: Apply Single Super Phosphate as basal dose during land preparation, and split Nitrogen (Urea) into 2-3 top dressings to prevent leaching. Avoid broadcasting fertilizer in dry soil.",
      reply_ta: "அக்ரிகார்ட் ஆலோசனை: கடைசி உழவின் போது அடி உரமாக முழு மணிச்சத்தையும், தழைச்சத்தை 2-3 தவணைகளாகவும் பிரித்து இடவும். ஈரம் இல்லாத வறண்ட நிலத்தில் உரம் இட வேண்டாம்.",
      reply_hi: "एग्रीगार्ड सलाह: जुताई के समय पूरा फॉस्फोरस (एसएसपी) डालें और यूरिया को 2-3 किस्तों में दें। सूखी मिट्टी में खाद न डालें।",
      spoken_text: isTa 
        ? "அக்ரிகார்ட் உர ஆலோசனை: முழு மணிச்சத்தை அடி உரமாகவும், யூரியாவை பிரித்தும் இடவும்." 
        : isHi 
        ? "एग्रीगार्ड सलाह: बुवाई पर पूरा फॉस्फोरस और यूरिया किस्तों में दें।" 
        : "AGRIGUARD recommendation: Apply SSP as basal dose and split Urea into 2 to 3 doses.",
      reference: "TNAU Agritech Portal & ICAR Recommended Fertilizer Schedules"
    };
  },

  async askAssistant(
    query: string,
    cropHint: string | undefined,
    lang: 'ta' | 'en' | 'hi',
    history: AssistantConversationTurn[] = []
  ): Promise<AssistantResponse> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/assistant/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          crop_hint: cropHint,
          language: lang,
          history: history.slice(-10)
        }),
        signal: AbortSignal.timeout(30000)
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new Error('The agriculture assistant timed out. Please try again.');
      }
      throw new Error('Could not connect to the agriculture assistant. Check the backend connection and try again.');
    }

    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      throw new Error(
        res.ok
          ? 'The agriculture assistant returned an unreadable response. Please try again.'
          : `The agriculture assistant returned an error (HTTP ${res.status}). Please try again.`
      );
    }

    if (!res.ok) {
      const detail =
        typeof payload === 'object' && payload !== null && 'detail' in payload &&
        typeof payload.detail === 'string'
          ? payload.detail
          : `The agriculture assistant returned an error (HTTP ${res.status}). Please try again.`;
      throw new Error(detail);
    }

    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('success' in payload) || payload.success !== true ||
      !('topic_en' in payload) || typeof payload.topic_en !== 'string' ||
      !('topic_ta' in payload) || typeof payload.topic_ta !== 'string' ||
      !('topic_hi' in payload) || typeof payload.topic_hi !== 'string' ||
      !('reply_en' in payload) || typeof payload.reply_en !== 'string' ||
      !('reply_ta' in payload) || typeof payload.reply_ta !== 'string' ||
      !('reply_hi' in payload) || typeof payload.reply_hi !== 'string' ||
      !('spoken_text' in payload) || typeof payload.spoken_text !== 'string' ||
      !('reference' in payload) || typeof payload.reference !== 'string' ||
      !('model' in payload) || typeof payload.model !== 'string'
    ) {
      throw new Error('The agriculture assistant returned an invalid response. Please try again.');
    }

    return payload as AssistantResponse;
  },

  async getProfile(): Promise<FarmProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/farm/profile`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        storageService.saveProfile(data);
        return data;
      }
    } catch (e) {}
    return storageService.getProfile();
  },

  async updateProfile(profileData: Partial<FarmProfile>): Promise<FarmProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/farm/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        storageService.saveProfile(data);
        return data;
      }
    } catch (e) {}
    const current = storageService.getProfile();
    const updated = { ...current, ...profileData };
    storageService.saveProfile(updated);
    return updated;
  },

  async getAlerts(): Promise<SmartAlert[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data: SmartAlert[] = await res.json();
        storageService.saveAlerts(data);
        return data;
      }
    } catch (e) {}
    return storageService.getAlerts();
  },

  async markAlertRead(alertId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/alerts/read/${alertId}`, { method: 'POST' });
    } catch (e) {}
    storageService.markAlertRead(alertId);
  },

  async getHistory(): Promise<DetectionRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/history/detections`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const list: DetectionRecord[] = await res.json();
        // sync to local storage
        list.forEach(item => storageService.addHistory(item));
        return list;
      }
    } catch (e) {}
    return storageService.getHistory();
  },

  async deleteHistory(recordId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/history/detections/${recordId}`, { method: 'DELETE' });
    } catch (e) {}
    storageService.deleteHistory(recordId);
  }
};
