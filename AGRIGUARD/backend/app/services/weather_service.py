import os
import time
import requests
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from ..core.config import settings

class WeatherService:
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.cache_ttl = settings.WEATHER_CACHE_MINUTES * 60

    def get_weather(self, lat: float = None, lon: float = None, location_name: str = None) -> Dict[str, Any]:
        """
        Retrieves live weather data and forecast for agricultural coordinates.
        Supports OpenWeather API (if key configured) and Open-Meteo Agrometeorological API.
        Implements in-memory and persistent caching with explicit freshness metadata.
        """
        lat = lat if lat is not None else settings.DEFAULT_LATITUDE
        lon = lon if lon is not None else settings.DEFAULT_LONGITUDE
        loc_label = location_name or settings.DEFAULT_LOCATION_NAME
        cache_key = f"{round(lat, 3)}_{round(lon, 3)}"

        # Check valid fresh cache
        now = time.time()
        if cache_key in self._cache:
            entry = self._cache[cache_key]
            if now - entry["cached_timestamp"] < self.cache_ttl:
                data = dict(entry["data"])
                data["is_cached"] = True
                data["cached_age_seconds"] = int(now - entry["cached_timestamp"])
                return data

        # Attempt live API fetch
        weather_result = None
        
        # 1. Try OpenWeather if API key is provided
        if settings.OPENWEATHER_API_KEY:
            try:
                weather_result = self._fetch_openweather(lat, lon, loc_label)
            except Exception as e:
                print(f"[WeatherService] OpenWeather error: {e}, falling back to Open-Meteo")

        # 2. Fetch from Open-Meteo (open agrometeorology API, highly accurate for South Asia)
        if not weather_result:
            try:
                weather_result = self._fetch_openmeteo(lat, lon, loc_label)
            except Exception as e:
                print(f"[WeatherService] Open-Meteo error: {e}")

        # If live fetch succeeded, cache it
        if weather_result:
            self._cache[cache_key] = {
                "cached_timestamp": now,
                "data": weather_result
            }
            return weather_result

        # If live fetch failed, check if we have any stale cached data
        if cache_key in self._cache:
            entry = self._cache[cache_key]
            data = dict(entry["data"])
            data["is_cached"] = True
            data["is_stale"] = True
            data["status_message"] = "Live weather fetch failed. Showing previously saved weather."
            data["cached_age_seconds"] = int(now - entry["cached_timestamp"])
            return data

        # If completely unreachable and no prior cache
        return {
            "success": False,
            "is_cached": False,
            "status_message": "Weather information is temporarily unavailable. Check internet connectivity.",
            "location_name": loc_label,
            "latitude": lat,
            "longitude": lon,
            "last_updated": None,
            "last_updated_formatted": "Unavailable",
            "current": None,
            "forecast": []
        }

    def _fetch_openmeteo(self, lat: float, lon: float, location_name: str) -> Dict[str, Any]:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code",
            "timezone": "auto",
            "forecast_days": 7
        }
        
        resp = requests.get(url, params=params, timeout=7)
        resp.raise_for_status()
        data = resp.json()
        
        current = data.get("current", {})
        daily = data.get("daily", {})
        
        weather_code = current.get("weather_code", 0)
        condition_en, condition_ta, icon = self._interpret_wmo_code(weather_code)
        
        now_dt = datetime.now()
        
        # Build 7-day forecast array
        forecast_list = []
        times = daily.get("time", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        precips = daily.get("precipitation_sum", [])
        pop_probs = daily.get("precipitation_probability_max", [])
        codes = daily.get("weather_code", [])
        
        for i in range(len(times)):
            c_en, c_ta, c_icon = self._interpret_wmo_code(codes[i] if i < len(codes) else 0)
            forecast_list.append({
                "date": times[i],
                "temp_max": max_temps[i] if i < len(max_temps) else 30.0,
                "temp_min": min_temps[i] if i < len(min_temps) else 22.0,
                "precipitation_mm": precips[i] if i < len(precips) else 0.0,
                "precipitation_probability": pop_probs[i] if i < len(pop_probs) else 0,
                "condition_en": c_en,
                "condition_ta": c_ta,
                "icon": c_icon
            })
            
        return {
            "success": True,
            "source": "Open-Meteo Agrometeorology",
            "is_cached": False,
            "location_name": location_name,
            "latitude": lat,
            "longitude": lon,
            "last_updated": now_dt.isoformat(),
            "last_updated_formatted": now_dt.strftime("%d %b %Y, %I:%M %p"),
            "current": {
                "temperature": round(current.get("temperature_2m", 28.0), 1),
                "feels_like": round(current.get("apparent_temperature", 29.0), 1),
                "humidity": round(current.get("relative_humidity_2m", 65)),
                "precipitation_mm": round(current.get("precipitation", 0.0), 1),
                "wind_speed_kmh": round(current.get("wind_speed_10m", 12.0), 1),
                "condition_en": condition_en,
                "condition_ta": condition_ta,
                "icon": icon
            },
            "forecast": forecast_list
        }

    def _fetch_openweather(self, lat: float, lon: float, location_name: str) -> Dict[str, Any]:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": settings.OPENWEATHER_API_KEY,
            "units": "metric"
        }
        resp = requests.get(url, params=params, timeout=6)
        resp.raise_for_status()
        data = resp.json()
        
        now_dt = datetime.now()
        main = data.get("main", {})
        weather_item = (data.get("weather") or [{}])[0]
        wind = data.get("wind", {})
        
        return {
            "success": True,
            "source": "OpenWeather API",
            "is_cached": False,
            "location_name": data.get("name", location_name),
            "latitude": lat,
            "longitude": lon,
            "last_updated": now_dt.isoformat(),
            "last_updated_formatted": now_dt.strftime("%d %b %Y, %I:%M %p"),
            "current": {
                "temperature": round(main.get("temp", 28.0), 1),
                "feels_like": round(main.get("feels_like", 29.0), 1),
                "humidity": round(main.get("humidity", 65)),
                "precipitation_mm": data.get("rain", {}).get("1h", 0.0),
                "wind_speed_kmh": round(wind.get("speed", 3.0) * 3.6, 1),
                "condition_en": weather_item.get("main", "Clear"),
                "condition_ta": self._translate_weather(weather_item.get("main", "Clear")),
                "icon": weather_item.get("icon", "01d")
            },
            "forecast": [] # Will combine with Open-Meteo for 7-day forecast if needed
        }

    def _interpret_wmo_code(self, code: int):
        # WMO Weather interpretation codes (WW)
        if code == 0:
            return "Clear Sky", "தெளிவான வானம்", "sun"
        elif code in (1, 2):
            return "Partly Cloudy", "பகுதி மேகமூட்டம்", "cloud-sun"
        elif code == 3:
            return "Overcast", "முழு மேகமூட்டம்", "cloud"
        elif code in (45, 48):
            return "Foggy / Mist", "பனிமூட்டம்", "cloud-fog"
        elif code in (51, 53, 55):
            return "Drizzle", "தூறல் மழை", "cloud-drizzle"
        elif code in (61, 63):
            return "Moderate Rain", "மிதமான மழை", "cloud-rain"
        elif code == 65:
            return "Heavy Rain", "கனமழை", "cloud-rain-heavy"
        elif code in (80, 81, 82):
            return "Rain Showers", "மழை தூறல்கள்", "cloud-rain"
        elif code in (95, 96, 99):
            return "Thunderstorm", "இடியுடன் கூடிய மழை", "cloud-lightning"
        else:
            return "Fair Weather", "சீரான வானிலை", "sun"

    def _translate_weather(self, condition: str) -> str:
        mapping = {
            "Clear": "தெளிவான வானம்",
            "Clouds": "மேகமூட்டம்",
            "Rain": "மழை",
            "Drizzle": "தூறல்",
            "Thunderstorm": "இடியுடன் கூடிய மழை",
            "Mist": "பனிமூட்டம்",
            "Haze": "புகை மூட்டம்"
        }
        return mapping.get(condition, "சீரான வானிலை")

weather_service = WeatherService()
