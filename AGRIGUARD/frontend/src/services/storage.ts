import { FarmProfile, DetectionRecord, WeatherData, SmartAlert, Language } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'agriguard_farm_profile',
  WEATHER: 'agriguard_cached_weather',
  HISTORY: 'agriguard_scan_history',
  ALERTS: 'agriguard_alerts',
  LANGUAGE: 'agriguard_language',
  ONBOARDED: 'agriguard_onboarded',
};

const DEFAULT_PROFILE: FarmProfile = {
  farmer_name: "முருகன் (Murugan)",
  phone: "",
  preferred_language: 'ta',
  location_name: "Thanjavur, Tamil Nadu",
  latitude: 10.7870,
  longitude: 79.1378,
  active_crop_id: "tomato",
  crops: [
    {
      id: "crop_tomato_1",
      crop_id: "tomato",
      crop_name_en: "Tomato",
      crop_name_ta: "தக்காளி",
      variety: "PKM-1 / Shivam",
      area_acres: "1.5",
      planting_date: "2026-09-15",
      growth_stage: "Flowering & Fruit Setting",
      soil_type: "Red Loam",
      irrigation_method: "Drip Irrigation"
    },
    {
      id: "crop_rice_2",
      crop_id: "rice",
      crop_name_en: "Rice / Paddy",
      crop_name_ta: "நெல்",
      variety: "ADT-53",
      area_acres: "3.0",
      planting_date: "2026-09-01",
      growth_stage: "Tillering",
      soil_type: "Clay Loam",
      irrigation_method: "Flood / Furrow"
    }
  ],
  created_at: new Date().toISOString()
};

export const storageService = {
  getProfile(): FarmProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Storage error reading profile", e);
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: FarmProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error("Storage error saving profile", e);
    }
  },

  getLanguage(): Language {
    try {
      const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
      if (lang === 'en' || lang === 'ta' || lang === 'hi') return lang;
    } catch (e) {}
    return 'ta'; // Default to Tamil for primary target audience
  },

  setLanguage(lang: Language): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {}
  },

  isOnboarded(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  },

  setOnboarded(value: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, String(value));
  },

  getCachedWeather(): WeatherData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEATHER);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return null;
  },

  saveCachedWeather(weather: WeatherData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(weather));
    } catch (e) {}
  },

  getHistory(): DetectionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [];
  },

  addHistory(record: DetectionRecord): void {
    try {
      const list = this.getHistory();
      list.unshift(record);
      // Keep up to 40 scans offline
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list.slice(0, 40)));
    } catch (e) {}
  },

  deleteHistory(id: string): void {
    try {
      const list = this.getHistory().filter(h => h.id !== id);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list));
    } catch (e) {}
  },

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  },

  getAlerts(): SmartAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [];
  },

  saveAlerts(alerts: SmartAlert[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {}
  },

  markAlertRead(id: string): void {
    const alerts = this.getAlerts();
    for (const a of alerts) {
      if (a.id === id) a.read = true;
    }
    this.saveAlerts(alerts);
  },

  getStorageStats(): { historyCount: number; hasWeather: boolean; cropsCount: number } {
    const profile = this.getProfile();
    const history = this.getHistory();
    const weather = this.getCachedWeather();
    return {
      historyCount: history.length,
      hasWeather: !!weather,
      cropsCount: profile.crops.length
    };
  }
};
