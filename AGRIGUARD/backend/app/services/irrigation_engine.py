from datetime import datetime
from typing import Dict, Any, Optional
from ..data.knowledge_base import CROPS
from .weather_service import weather_service
from .farm_store import farm_store

class IrrigationEngine:
    """
    Agricultural Irrigation Advisory Engine.
    Integrates crop evapotranspiration coefficients (Kc), growth stage water sensitivity,
    soil water-holding capacity, and precipitation forecasts.
    """

    SOIL_PROPERTIES = {
        "Clay Soil": {"water_retention": "High", "infiltration_rate": "Slow", "advice_en": "Retains moisture well; avoid over-irrigation to prevent root rot.", "advice_ta": "அதிக ஈரத்தை தக்கவைக்கும்; வேரழுகலைத் தடுக்க அதிக நீர் தேங்குவதை தவிர்க்கவும்."},
        "Clay Loam": {"water_retention": "Moderate to High", "infiltration_rate": "Moderate", "advice_en": "Optimal water retention for most vegetable and field crops.", "advice_ta": "காய்கறி மற்றும் தானிய பயிர்களுக்கு ஏற்ற சிறந்த மண்."},
        "Red Loam": {"water_retention": "Moderate", "infiltration_rate": "Good", "advice_en": "Drains well, requires steady periodic irrigation intervals.", "advice_ta": "நல்ல வடிகால் வசதி கொண்டது; சீரான இடைவெளியில் நீர்ப்பாசனம் தேவை."},
        "Sandy Loam": {"water_retention": "Low to Moderate", "infiltration_rate": "Fast", "advice_en": "Loses moisture rapidly; requires frequent light water applications.", "advice_ta": "ஈரப்பதம் வேகமாக வடியும்; அடிக்கடி குறைந்த அளவு நீர் பாய்ச்சவும்."},
        "Black Cotton Soil": {"water_retention": "Very High", "infiltration_rate": "Very Slow", "advice_en": "Cracks when dry and swells when wet. Maintain steady soil moisture.", "advice_ta": "காய்ந்தால் வெடிக்கும், ஈரத்தில் உப்பும்; சீரான ஈரத்தை பராமரிக்கவும்."}
    }

    IRRIGATION_METHODS = {
        "Drip Irrigation": {"efficiency": "90-95%", "tips_en": "Delivers water directly to root zone, minimizing fungal spore splashing on foliage.", "tips_ta": "வேர்ப்பகுதியில் நேரடியாக நீர் செலுத்துவதால் இலைகளில் நோய் பரவுவதைத் தடுக்கிறது."},
        "Sprinkler": {"efficiency": "70-80%", "tips_en": "Avoid operating during late evening to prevent wet leaves overnight.", "tips_ta": "இரவில் இலைகள் ஈரமாக இருப்பதைத் தடுக்க மாலை நேர தெளிப்பை தவிர்க்கவும்."},
        "Flood / Furrow": {"efficiency": "45-60%", "tips_en": "Ensure proper field leveling to avoid standing water pockets.", "tips_ta": "நீர் தேங்கி நிற்காதவாறு வயலை சமன்படுத்தவும்."}
    }

    def get_advice(
        self,
        crop_id: str,
        growth_stage: Optional[str] = None,
        soil_type: Optional[str] = None,
        irrigation_method: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        location_name: Optional[str] = None
    ) -> Dict[str, Any]:
        crop_info = CROPS.get(crop_id) or CROPS["tomato"]
        selected_crop_id = crop_info["id"]

        # Default stage, soil, method if not specified
        stages = crop_info.get("stages", ["Vegetative", "Flowering"])
        stage = growth_stage if growth_stage in stages else stages[1] if len(stages) > 1 else stages[0]
        soil = soil_type if soil_type in self.SOIL_PROPERTIES else crop_info.get("soil_types", ["Red Loam"])[0]
        method = irrigation_method if irrigation_method in self.IRRIGATION_METHODS else "Drip Irrigation"

        # Fetch actual local weather
        weather = weather_service.get_weather(lat, lon, location_name)
        curr = weather.get("current") or {}
        forecast = weather.get("forecast") or []

        temp = curr.get("temperature", 28.0)
        humidity = curr.get("humidity", 65)
        precip_today = curr.get("precipitation_mm", 0.0)
        
        # Forecast rain in next 48 hours
        rain_next_48h = sum(f.get("precipitation_mm", 0.0) for f in forecast[:2])
        rain_prob_max = max([f.get("precipitation_probability", 0) for f in forecast[:2]] or [0])

        kc = crop_info.get("kc_stages", {}).get(stage, 0.8)

        # Logic decision
        factors_en = []
        factors_ta = []

        factors_en.append(f"Crop growth stage: {stage} (Crop coefficient Kc: {kc}).")
        factors_ta.append(f"பயிர் வளர்ச்சிப் பருவம்: {stage} (நீர் தேவை காரணி: {kc}).")

        factors_en.append(f"Soil type: {soil} ({self.SOIL_PROPERTIES.get(soil, {}).get('water_retention', 'Moderate')} retention).")
        factors_ta.append(f"மண் வகை: {soil} ({self.SOIL_PROPERTIES.get(soil, {}).get('advice_ta', '')}).")

        status_en = "Normal Scheduled Irrigation"
        status_ta = "வழக்கமான நீர்ப்பாசனம்"
        status_code = "NORMAL"
        action_en = "Irrigate according to your standard scheduled cycle. Monitor topsoil moisture."
        action_ta = "வழக்கமான அட்டவணைப்படி நீர் பாய்ச்சவும். மேல்மண் ஈரப்பதத்தை கவனித்துக் கொள்ளவும்."
        reassess_hours = 24

        if rain_next_48h >= 15.0 or rain_prob_max >= 75 or precip_today >= 10.0:
            status_en = "Postpone Irrigation (Rain Forecast)"
            status_ta = "நீர்ப்பாசனத்தை தள்ளிவைக்கவும் (மழை எச்சரிக்கை)"
            status_code = "POSTPONE_RAIN"
            factors_en.append(f"Significant rainfall expected ({round(rain_next_48h, 1)} mm with {rain_prob_max}% probability).")
            factors_ta.append(f"கணிசமான மழை எதிர்பார்க்கப்படுகிறது ({round(rain_next_48h, 1)} மி.மீ, {rain_prob_max}% வாய்ப்பு).")
            action_en = f"Rain is forecast for your area ({round(rain_next_48h, 1)} mm expected). Check local soil moisture before your next irrigation and adjust watering according to the crop's needs."
            action_ta = f"உங்கள் பகுதியில் மழை எதிர்பார்க்கப்படுகிறது ({round(rain_next_48h, 1)} மி.மீ). அடுத்த நீர்ப்பாசனத்திற்கு முன் மண்ணின் ஈரப்பதத்தை பரிசோதித்து நீர்ப்பாசனத்தை மாற்றி அமைக்கவும்."
            reassess_hours = 12

        elif temp >= 35.0 and humidity <= 45:
            status_en = "Increased Water Demand (High Heat / Evaporation)"
            status_ta = "அதிகரித்த நீர் தேவை (வெப்பம் & ஆவியாதல் அதிகம்)"
            status_code = "INCREASE"
            factors_en.append(f"High atmospheric temperature ({temp}°C) and low humidity ({humidity}%) accelerate evapotranspiration.")
            factors_ta.append(f"அதிக வெப்பநிலை ({temp}°C) மற்றும் குறைந்த ஈரப்பதம் காரணமாக நீர் ஆவியாதல் அதிகரிக்கிறது.")
            action_en = "Irrigate in the early morning or evening hours to minimize evaporative water loss and prevent plant heat stress."
            action_ta = "நீர் ஆவியாவதைத் தடுக்க அதிகாலை அல்லது மாலை வேளையில் நீர் பாய்ச்சவும்; பயிர் வாடுவதைத் தடுக்கவும்."
            reassess_hours = 18

        elif stage in ("Flowering", "Flowering & Fruit Setting", "Panicle Initiation", "Flowering / Heading"):
            status_en = "Critical Stage Irrigation (Moisture Sensitive)"
            status_ta = "முக்கிய பருவம் — ஈரப்பதம் மிக அவசியம்"
            status_code = "CRITICAL_STAGE"
            factors_en.append("Flowering/Fruit formation is the most water-stress sensitive stage. Moisture stress now will cause flower drop.")
            factors_ta.append("பூக்கும் தருணம் நீர்த்தேவைக்கு மிக முக்கியமான பருவம். இத்தருணத்தில் வறட்சி ஏற்பட்டால் பூக்கள் உதிரும்.")
            action_en = "Ensure continuous optimum root-zone moisture. Do not let soil crack or dry out."
            action_ta = "வேர்ப்பகுதியில் தொடர்ந்து போதிய ஈரப்பதம் இருப்பதை உறுதி செய்யவும். மண் வெடிக்க விடாதீர்கள்."
            reassess_hours = 24

        # Real-time ESP32 Sensor Telemetry Integration
        live_sensor = farm_store.get_latest_soil_moisture()
        if live_sensor.get("is_online") and live_sensor.get("status") != "WAITING":
            sensor_pct = live_sensor.get("moisture_percentage", 0.0)
            if sensor_pct < 30.0 and status_code != "POSTPONE_RAIN":
                status_en = "Irrigate Now (Soil Moisture Deficit)"
                status_ta = "உடனடி நீர்ப்பாசனம் (மண் வறட்சி கண்டறியப்பட்டது)"
                status_code = "IRRIGATE_NOW"
                action_en = f"ESP32 live sensor reports low soil moisture ({sensor_pct}%). Irrigate immediately to protect root health."
                action_ta = f"ESP32 நேரலை சென்சார் குறைந்த ஈரப்பதத்தை ({sensor_pct}%) காட்டுகிறது. பயிர் வேர்களை பாதுகாக்க உடனே நீர் பாய்ச்சவும்."
                reassess_hours = 6
            elif sensor_pct > 75.0:
                status_en = "Postpone Irrigation (Soil Saturated)"
                status_ta = "நீர்ப்பாசனத்தை தள்ளிவைக்கவும் (மண்ணில் அதிக ஈரம்)"
                status_code = "POSTPONE_SATURATED"
                action_en = f"ESP32 sensor reports high moisture ({sensor_pct}%). Soil is saturated; delay watering to prevent root rot."
                action_ta = f"ESP32 சென்சார் அதிக ஈரப்பதத்தை ({sensor_pct}%) காட்டுகிறது. வேரழுகலைத் தவிர்க்க நீர் பாய்ச்சுவதை தள்ளிவைக்கவும்."
                reassess_hours = 12
            factors_en.insert(0, f"ESP32 live root-zone soil moisture: {sensor_pct}% ({live_sensor.get('status')}).")
            factors_ta.insert(0, f"ESP32 நேரலை மண் ஈரப்பதம்: {sensor_pct}% ({live_sensor.get('status')}).")

        method_info = self.IRRIGATION_METHODS.get(method, {})

        return {
            "success": True,
            "crop_id": selected_crop_id,
            "crop_name_en": crop_info["name_en"],
            "crop_name_ta": crop_info["name_ta"],
            "growth_stage": stage,
            "soil_type": soil,
            "irrigation_method": method,
            "status_code": status_code,
            "status_title_en": status_en,
            "status_title_ta": status_ta,
            "action_advice_en": action_en,
            "action_advice_ta": action_ta,
            "reassess_after_hours": reassess_hours,
            "contributing_factors_en": factors_en,
            "contributing_factors_ta": factors_ta,
            "method_guidance_en": method_info.get("tips_en", ""),
            "method_guidance_ta": method_info.get("tips_ta", ""),
            "soil_moisture": live_sensor,
            "weather_snapshot": {
                "temperature": temp,
                "humidity": humidity,
                "precipitation_today_mm": precip_today,
                "rain_forecast_48h_mm": round(rain_next_48h, 1),
                "rain_probability": rain_prob_max,
                "is_cached": weather.get("is_cached", False)
            },
            "disclaimer_en": "Notice: Irrigation guidance is estimated based on crop stage and meteorological forecast. Always verify actual physical soil moisture by hand feel before operating pumps.",
            "disclaimer_ta": "குறிப்பு: இது பயிர் பருவம் மற்றும் வானிலை அடிப்படையிலான வழிகாட்டல் மட்டுமே. நீர் பாய்ச்சும் முன் மண்ணை தொட்டுப் பார்த்து ஈரப்பதத்தை உறுதி செய்யவும்."
        }

irrigation_engine = IrrigationEngine()
