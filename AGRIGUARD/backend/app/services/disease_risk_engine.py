from datetime import datetime
from typing import Dict, Any, List
from ..data.knowledge_base import CROPS, DISEASES
from .weather_service import weather_service

class DiseaseRiskEngine:
    """
    Modular Agrometeorological Disease Risk Prediction Engine.
    Uses epidemiological thresholds established by TNAU, ICAR, and FAO for crop pathogen forewarning.
    Calculates disease susceptibility before visible foliar symptoms appear.
    """

    def assess_risk(self, crop_id: str, lat: float = None, lon: float = None, location_name: str = None) -> Dict[str, Any]:
        crop_info = CROPS.get(crop_id)
        if not crop_info:
            return {
                "success": False,
                "error": f"Crop '{crop_id}' is not currently configured for risk forecasting."
            }

        # Retrieve actual weather forecast
        weather = weather_service.get_weather(lat, lon, location_name)
        now_dt = datetime.now()

        if not weather.get("success") and not weather.get("is_cached"):
            return {
                "success": False,
                "crop_id": crop_id,
                "crop_name_en": crop_info["name_en"],
                "crop_name_ta": crop_info["name_ta"],
                "risk_category": "Unknown",
                "risk_category_ta": "தெரியவில்லை",
                "error": "Weather data is currently unavailable to compute disease risk. Check connection."
            }

        curr = weather.get("current") or {}
        forecast = weather.get("forecast") or []

        temp = curr.get("temperature", 28.0)
        humidity = curr.get("humidity", 65)
        precipitation = curr.get("precipitation_mm", 0.0)

        # 3-day forecast outlook
        next_3_days_rain = sum(f.get("precipitation_mm", 0.0) for f in forecast[:3])
        max_forecast_humidity = max([humidity] + [85 if f.get("precipitation_probability", 0) > 60 else 65 for f in forecast[:3]])

        # Find all diseases associated with this crop
        crop_diseases = [d for d in DISEASES.values() if d["crop_id"] == crop_id and "healthy" not in d["id"]]

        disease_risks: List[Dict[str, Any]] = []
        overall_score = 0  # 0 to 10 scale
        primary_contributing_factors = []
        primary_contributing_factors_ta = []

        for d in crop_diseases:
            cond = d.get("favorable_conditions", {})
            t_min = cond.get("temp_min", 20.0)
            t_max = cond.get("temp_max", 30.0)
            h_min = cond.get("humidity_min", 75.0)

            # Calculate individual pathogen risk score
            score = 0
            factors = []
            factors_ta = []

            # Temperature factor
            if t_min <= temp <= t_max:
                score += 3.5
                factors.append(f"Current temperature ({temp}°C) is in the optimal pathogen range ({t_min}-{t_max}°C).")
                factors_ta.append(f"தற்போதைய வெப்பநிலை ({temp}°C) பூஞ்சை பெருக்கத்திற்கு உகந்த அளவில் உள்ளது.")
            elif abs(temp - t_min) <= 3 or abs(temp - t_max) <= 3:
                score += 1.5

            # Humidity factor
            if humidity >= h_min:
                score += 3.5
                factors.append(f"High relative humidity ({humidity}%) meets threshold (>{h_min}%).")
                factors_ta.append(f"அதிக ஈரப்பதம் ({humidity}%) நோய்க்கிருமி பரவ ஏதுவாக உள்ளது.")
            elif humidity >= h_min - 10:
                score += 2.0
                factors.append(f"Elevated humidity ({humidity}%) approaching critical levels.")
                factors_ta.append(f"ஈரப்பதம் ({humidity}%) எச்சரிக்கை அளவை எட்டுகிறது.")

            # Precipitation / leaf wetness factor
            if precipitation > 2.0 or next_3_days_rain > 10.0:
                score += 3.0
                factors.append(f"Forecast precipitation ({round(next_3_days_rain, 1)} mm) provides prolonged free moisture on leaf canopy.")
                factors_ta.append(f"எதிர்பார்க்கப்படும் மழை ({round(next_3_days_rain, 1)} மி.மீ) இலைகளில் ஈரத்தை நீடிக்கச் செய்யும்.")

            if score > overall_score:
                overall_score = score

            # Determine disease-level classification
            if score >= 7.0:
                cat = "High"
                cat_ta = "அதிக அபாயம்"
            elif score >= 4.0:
                cat = "Moderate"
                cat_ta = "மிதமான அபாயம்"
            else:
                cat = "Low"
                cat_ta = "குறைந்த அபாயம்"

            disease_risks.append({
                "disease_id": d["id"],
                "disease_name_en": d["name_en"],
                "disease_name_ta": d["name_ta"],
                "pathogen": d["pathogen"],
                "risk_level": cat,
                "risk_level_ta": cat_ta,
                "score": round(score, 1),
                "factors_en": factors,
                "factors_ta": factors_ta,
                "prevention_en": d["prevention_en"][:2],
                "prevention_ta": d["prevention_ta"][:2]
            })

            for f in factors:
                if f not in primary_contributing_factors:
                    primary_contributing_factors.append(f)
            for f_ta in factors_ta:
                if f_ta not in primary_contributing_factors_ta:
                    primary_contributing_factors_ta.append(f_ta)

        # Overall risk level
        if overall_score >= 7.0:
            final_risk = "High"
            final_risk_ta = "அதிக அபாயம்"
            color_badge = "red"
            summary_en = f"Weather conditions over the next 48-72 hours strongly favor disease development in {crop_info['name_en']}. Preventive action recommended."
            summary_ta = f"அடுத்த 48-72 மணி நேர வானிலை {crop_info['name_ta']} பயிரில் நோய் பரவ ஏதுவாக உள்ளது. உடனடி பாதுகாப்பு நடவடிக்கை தேவை."
        elif overall_score >= 4.0:
            final_risk = "Moderate"
            final_risk_ta = "மிதமான அபாயம்"
            color_badge = "amber"
            summary_en = f"Elevated humidity and temperatures create moderately favorable conditions. Regularly scout your field for early symptoms."
            summary_ta = f"ஈரப்பதம் மற்றும் வெப்பநிலையால் மிதமான நோய் அபாயம் உள்ளது. பயிரை தவறாமல் கண்காணித்து வாருங்கள்."
        else:
            final_risk = "Low"
            final_risk_ta = "குறைந்த அபாயம்"
            color_badge = "green"
            summary_en = f"Current weather is not conducive for major outbreaks in {crop_info['name_en']}. Continue routine field management."
            summary_ta = f"தற்போதைய வானிலையில் தீவிர நோய் பரவும் சூழல் இல்லை. வழக்கமான பயிர் பராமரிப்பைத் தொடரலாம்."

        return {
            "success": True,
            "crop_id": crop_id,
            "crop_name_en": crop_info["name_en"],
            "crop_name_ta": crop_info["name_ta"],
            "location_name": weather.get("location_name", "Local Farm"),
            "forecast_period": "Next 48 - 72 Hours",
            "forecast_period_ta": "அடுத்த 48 - 72 மணி நேரம்",
            "risk_category": final_risk,
            "risk_category_ta": final_risk_ta,
            "color_badge": color_badge,
            "overall_score_out_of_10": round(overall_score, 1),
            "summary_en": summary_en,
            "summary_ta": summary_ta,
            "contributing_factors_en": primary_contributing_factors if primary_contributing_factors else ["Weather parameters remain within safe ranges."],
            "contributing_factors_ta": primary_contributing_factors_ta if primary_contributing_factors_ta else ["வானிலை காரணிகள் இயல்பான பாதுகாப்பான அளவில் உள்ளன."],
            "weather_snapshot": {
                "temperature_c": temp,
                "humidity_percent": humidity,
                "precipitation_mm": precipitation,
                "forecast_3day_rain_mm": round(next_3_days_rain, 1),
                "is_cached_weather": weather.get("is_cached", False),
                "last_weather_update": weather.get("last_updated_formatted", "Recent")
            },
            "assessed_diseases": disease_risks,
            "disclaimer_en": "Notice: Weather-based disease prediction estimates epidemiological risk; it does not confirm physical disease presence. Inspect leaves before applying any treatments.",
            "disclaimer_ta": "குறிப்பு: வானிலை அடிப்படையிலான நோய் அபாயம் என்பது சாத்தியக்கூறைக் குறிக்கிறது; அது நோயை உறுதி செய்யவில்லை. மருந்து தெளிக்கும் முன் இலைகளை நேரில் ஆய்வு செய்யவும்.",
            "last_assessed": now_dt.strftime("%d %b %Y, %I:%M %p")
        }

disease_risk_engine = DiseaseRiskEngine()
