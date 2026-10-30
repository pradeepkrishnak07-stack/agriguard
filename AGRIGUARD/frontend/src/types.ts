export type Language = 'ta' | 'en' | 'hi';

export interface WeatherCurrent {
  temperature: number;
  feels_like: number;
  humidity: number;
  precipitation_mm: number;
  wind_speed_kmh: number;
  condition_en: string;
  condition_ta: string;
  icon: string;
}

export interface WeatherForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  precipitation_mm: number;
  precipitation_probability: number;
  condition_en: string;
  condition_ta: string;
  icon: string;
}

export interface WeatherData {
  success: boolean;
  source: string;
  is_cached: boolean;
  is_stale?: boolean;
  status_message?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  last_updated?: string;
  last_updated_formatted: string;
  cached_age_seconds?: number;
  current?: WeatherCurrent;
  forecast?: WeatherForecastDay[];
}

export interface SoilMoistureData {
  success: boolean;
  device_id: string;
  raw_adc: number;
  moisture_percentage: number;
  status: 'DRY' | 'MOIST' | 'WET' | 'WAITING';
  connectivity_status: 'ONLINE' | 'OFFLINE' | 'WAITING';
  is_online: boolean;
  last_updated?: string | null;
  last_updated_formatted?: string;
  seconds_since_update?: number | null;
  sensor_pin?: string;
  battery_level?: number | null;
  temperature_c?: number | null;
  advice_en?: string;
  advice_ta?: string;
  advice_hi?: string;
}

export interface CropProfile {
  id: string;
  crop_id: string;
  crop_name_en: string;
  crop_name_ta: string;
  crop_name_hi?: string;
  variety?: string;
  area_acres?: string;
  planting_date?: string;
  growth_stage?: string;
  soil_type?: string;
  irrigation_method?: string;
}

export interface FarmProfile {
  farmer_name?: string;
  phone?: string;
  preferred_language: Language;
  location_name: string;
  latitude: number;
  longitude: number;
  acreage?: number;
  active_crop_id: string;
  crops: CropProfile[];
  created_at?: string;
}

export interface SoilRequirements {
  suitable_soils_en: string[];
  suitable_soils_ta: string[];
  suitable_soils_hi: string[];
  ph_range: string;
  requirements_en: string;
  requirements_ta: string;
  requirements_hi: string;
  unsuitable_impact_en: string;
  unsuitable_impact_ta: string;
  unsuitable_impact_hi: string;
}

export interface DiseaseCauses {
  primary_causes_en: string[];
  primary_causes_ta: string[];
  primary_causes_hi: string[];
  weather_factors_en: string;
  weather_factors_ta: string;
  weather_factors_hi: string;
  disclaimer_en: string;
  disclaimer_ta: string;
  disclaimer_hi: string;
}

export interface OrganicTreatmentPlan {
  name_en: string;
  name_ta: string;
  name_hi: string;
  ingredients_en: string;
  ingredients_ta: string;
  ingredients_hi: string;
  rate_per_acre: string;
  rate_kg_per_acre: number;
  water_litres_per_acre: number;
  method_en: string;
  method_ta: string;
  method_hi: string;
  frequency_en: string;
  frequency_ta: string;
  frequency_hi: string;
  intervals_days: number;
  expected_duration_days: number;
  precautions_en: string[];
  precautions_ta: string[];
  precautions_hi: string[];
}

export interface ChemicalTreatmentPlan {
  product_name_en: string;
  product_name_ta: string;
  product_name_hi: string;
  name_en?: string;
  name_ta?: string;
  name_hi?: string;
  active_ingredient: string;
  approved_rate_per_acre: string;
  rate_grams_per_acre: number;
  water_litres_per_acre: number;
  method_en: string;
  method_ta: string;
  method_hi: string;
  interval_days: number;
  duration_days: number;
  ppe_required_en: string[];
  ppe_required_ta: string[];
  ppe_required_hi: string[];
  pre_harvest_interval_days: number;
  precautions_en: string[];
  precautions_ta: string[];
  precautions_hi: string[];
}

export interface DiseaseDetectionResult {
  success: boolean;
  is_reliable: boolean;
  is_uncertain?: boolean;
  is_out_of_distribution?: boolean;
  error_code?: string;
  message?: string;
  message_ta?: string;
  message_hi?: string;
  crop_id?: string;
  crop_name_en?: string;
  crop_name_ta?: string;
  crop_name_hi?: string;
  disease_id?: string;
  condition_title_en?: string;
  condition_title_ta?: string;
  condition_title_hi?: string;
  is_healthy?: boolean;
  confidence_score?: number;
  confidence_percentage?: number;
  confidence_level?: string;
  model_version?: string;
  disclaimer_en?: string;
  disclaimer_ta?: string;
  disclaimer_hi?: string;
  explanation_en?: string;
  explanation_ta?: string;
  explanation_hi?: string;
  pathogen?: string;
  common_symptoms_en?: string[];
  common_symptoms_ta?: string[];
  common_symptoms_hi?: string[];
  soil_info?: SoilRequirements;
  causes_info?: DiseaseCauses;
  organic_treatment?: OrganicTreatmentPlan;
  chemical_treatment?: ChemicalTreatmentPlan;
  recommended_actions_en?: string[];
  recommended_actions_ta?: string[];
  recommended_actions_hi?: string[];
  prevention_guidance_en?: string[];
  prevention_guidance_ta?: string[];
  prevention_guidance_hi?: string[];
  expert_advice_en?: string;
  expert_advice_ta?: string;
  expert_advice_hi?: string;
  reference?: string;
  image_diagnostics?: {
    plant_coverage_percent?: number;
    is_blurry?: boolean;
    blur_score?: number;
    inference_time_ms?: number;
  };
  saved_record_id?: string;
  image_preview_url?: string;
  top_predictions?: Array<{
    class_index: number;
    disease_name: string;
    crop_name: string;
    probability: number;
    percentage: number;
  }>;
}

export interface DetectionRecord {
  id: string;
  crop_id: string;
  crop_name_en: string;
  crop_name_ta: string;
  crop_name_hi?: string;
  disease_id?: string;
  condition_title_en: string;
  condition_title_ta: string;
  condition_title_hi?: string;
  confidence_score: number;
  is_healthy: boolean;
  timestamp: string;
  timestamp_formatted: string;
  model_version: string;
  pathogen?: string;
  filename?: string;
  image_preview_url?: string;
  treatment_summary_en?: string;
  treatment_summary_ta?: string;
  treatment_summary_hi?: string;
  organic_summary_en?: string;
  organic_summary_ta?: string;
  organic_summary_hi?: string;
  chemical_summary_en?: string;
  chemical_summary_ta?: string;
  chemical_summary_hi?: string;
  full_result?: DiseaseDetectionResult;
}

export interface DiseaseRiskData {
  success: boolean;
  crop_id: string;
  crop_name_en: string;
  crop_name_ta: string;
  location_name: string;
  forecast_period: string;
  forecast_period_ta: string;
  risk_category: 'Low' | 'Moderate' | 'High' | 'Unknown';
  risk_category_ta: string;
  color_badge: 'green' | 'amber' | 'red';
  overall_score_out_of_10: number;
  summary_en: string;
  summary_ta: string;
  contributing_factors_en: string[];
  contributing_factors_ta: string[];
  weather_snapshot: {
    temperature_c: number;
    humidity_percent: number;
    precipitation_mm: number;
    forecast_3day_rain_mm: number;
    is_cached_weather: boolean;
    last_weather_update: string;
  };
  assessed_diseases: Array<{
    disease_id: string;
    disease_name_en: string;
    disease_name_ta: string;
    pathogen: string;
    risk_level: string;
    risk_level_ta: string;
    score: number;
    factors_en: string[];
    factors_ta: string[];
    prevention_en: string[];
    prevention_ta: string[];
  }>;
  disclaimer_en: string;
  disclaimer_ta: string;
  last_assessed: string;
}

export interface IrrigationAdvice {
  success: boolean;
  crop_id: string;
  crop_name_en: string;
  crop_name_ta: string;
  growth_stage: string;
  soil_type: string;
  irrigation_method: string;
  status_code: string;
  status_title_en: string;
  status_title_ta: string;
  action_advice_en: string;
  action_advice_ta: string;
  reassess_after_hours: number;
  contributing_factors_en: string[];
  contributing_factors_ta: string[];
  method_guidance_en: string;
  method_guidance_ta: string;
  weather_snapshot: {
    temperature: number;
    humidity: number;
    precipitation_today_mm: number;
    rain_forecast_48h_mm: number;
    rain_probability: number;
    is_cached: boolean;
  };
  disclaimer_en: string;
  disclaimer_ta: string;
}

export interface FertilizerAdvice {
  success: boolean;
  crop_id: string;
  crop_name_en: string;
  crop_name_ta: string;
  growth_stage: string;
  has_soil_test: boolean;
  recommended_npk_ratio: string;
  soil_testing_advice_en: string;
  soil_testing_advice_ta: string;
  basal_application_en: string;
  basal_application_ta: string;
  stage_split_recommendations_en: Array<{ stage: string; action: string }>;
  stage_split_recommendations_ta: Array<{ stage: string; action: string }>;
  biofertilizer_guidance_en: string;
  biofertilizer_guidance_ta: string;
  observed_deficiency_assessment?: {
    reported_symptom?: string;
    nutrient?: string;
    nutrient_ta?: string;
    symptoms_en?: string;
    symptoms_ta?: string;
    correction_en?: string;
    correction_ta?: string;
    distinction_note_en?: string;
    distinction_note_ta?: string;
  };
  available_deficiency_options: Array<{ id: string; label_en: string; label_ta: string }>;
  reference: string;
  expert_consultation_en: string;
  expert_consultation_ta: string;
}

export interface SmartAlert {
  id: string;
  category: 'disease_risk' | 'weather_warning' | 'irrigation' | 'system';
  severity: 'high' | 'medium' | 'low';
  crop_id?: string;
  crop_name?: string;
  title_en: string;
  title_ta: string;
  message_en: string;
  message_ta: string;
  action_en?: string;
  action_ta?: string;
  read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  spoken_text?: string;
  topic?: string;
  timestamp: string;
}
