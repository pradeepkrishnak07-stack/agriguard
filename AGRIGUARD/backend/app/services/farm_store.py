import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from ..core.config import settings

class FarmStore:
    """
    Persistent file-backed and SQLite-compatible store for farmer profile,
    crop fields, detection history, and smart alerts.
    """

    def __init__(self):
        self.profile_path = os.path.join(settings.DATA_DIR, "farm_profile.json")
        self.history_path = os.path.join(settings.DATA_DIR, "detection_history.json")
        self.alerts_path = os.path.join(settings.DATA_DIR, "alerts.json")
        self.fertilizer_history_path = os.path.join(settings.DATA_DIR, "fertilizer_recommendations.json")
        self.soil_moisture_path = os.path.join(settings.DATA_DIR, "soil_moisture.json")
        self._init_defaults()

    def _init_defaults(self):
        if not os.path.exists(self.soil_moisture_path):
            self._save_json(self.soil_moisture_path, {"latest": None, "history": []})
        if not os.path.exists(self.fertilizer_history_path):
            self._save_json(self.fertilizer_history_path, [])
        if not os.path.exists(self.profile_path):
            default_profile = {
                "farmer_name": "Ramu Gounder",
                "phone": "",
                "preferred_language": "ta",
                "location_name": "Thanjavur, Tamil Nadu",
                "latitude": settings.DEFAULT_LATITUDE,
                "longitude": settings.DEFAULT_LONGITUDE,
                "crops": [
                    {
                        "id": "crop_1",
                        "crop_id": "tomato",
                        "crop_name_en": "Tomato",
                        "crop_name_ta": "தக்காளி",
                        "variety": "PKM-1 / Shivam",
                        "area_acres": "1.5",
                        "planting_date": "2026-09-15",
                        "growth_stage": "Flowering & Fruit Setting",
                        "soil_type": "Red Loam",
                        "irrigation_method": "Drip Irrigation"
                    },
                    {
                        "id": "crop_2",
                        "crop_id": "rice",
                        "crop_name_en": "Rice / Paddy",
                        "crop_name_ta": "நெல்",
                        "variety": "ADT-53",
                        "area_acres": "3.0",
                        "planting_date": "2026-09-01",
                        "growth_stage": "Tillering",
                        "soil_type": "Clay Loam",
                        "irrigation_method": "Flood / Furrow"
                    }
                ],
                "active_crop_id": "tomato",
                "created_at": datetime.now().isoformat()
            }
            self._save_json(self.profile_path, default_profile)

        if not os.path.exists(self.history_path):
            self._save_json(self.history_path, [])

        if not os.path.exists(self.alerts_path):
            # Seed with authentic initial agronomic alerts
            initial_alerts = [
                {
                    "id": "alert_init_1",
                    "category": "disease_risk",
                    "severity": "high",
                    "crop_id": "tomato",
                    "crop_name": "தக்காளி (Tomato)",
                    "title_en": "Elevated Early Blight Risk",
                    "title_ta": "ஆரம்பக்கால கருகல் நோய் அபாய எச்சரிக்கை",
                    "message_en": "Recent high humidity (>85%) and 26°C temperatures increase leaf fungal risk. Inspect lower foliage.",
                    "message_ta": "அதிக ஈரப்பதம் (85% மேல்) மற்றும் 26°C வெப்பநிலை காரணமாக இலைக்கருகல் நோய் பரவும் சூழல் உள்ளது. கீழ் இலைகளை கண்காணிக்கவும்.",
                    "action_en": "Spray 5% NSKE or Pseudomonas as prophylactic protection.",
                    "action_ta": "5% வேப்பங்கொட்டை சாறு அல்லது சூடோமோனாஸ் முன்னெச்சரிக்கையாக தெளிக்கவும்.",
                    "read": False,
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "alert_init_2",
                    "category": "weather_warning",
                    "severity": "medium",
                    "crop_id": "all",
                    "crop_name": "General Farm",
                    "title_en": "Rain Expected in 48h",
                    "title_ta": "அடுத்த 48 மணி நேரத்தில் மழை வாய்ப்பு",
                    "message_en": "Rainfall forecast for your district. Postpone scheduled chemical spraying.",
                    "message_ta": "உங்கள் வட்டாரத்தில் மழை பெய்ய வாய்ப்புள்ளது. திட்டமிட்ட பூச்சிக்கொல்லி தெளிப்பை தள்ளிவைக்கவும்.",
                    "action_en": "Verify drain channels to prevent root-zone waterlogging.",
                    "action_ta": "நீர் தேங்காதவாறு வடிகால் வாய்க்கால்களை தூர்வாரவும்.",
                    "read": False,
                    "created_at": datetime.now().isoformat()
                }
            ]
            self._save_json(self.alerts_path, initial_alerts)

    def _read_json(self, path: str) -> Any:
        import time
        for attempt in range(3):
            try:
                if os.path.exists(path):
                    with open(path, "r", encoding="utf-8") as f:
                        return json.load(f)
                break
            except Exception:
                if attempt < 2:
                    time.sleep(0.05)
                    continue
        return {}

    def _save_json(self, path: str, data: Any):
        import time
        tmp_path = f"{path}.tmp.{os.getpid()}_{int(time.time()*1000)}"
        try:
            os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp_path, path)
        except Exception as e:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass
            print(f"[FarmStore] Error writing {path}: {e}")

    # Farm Profile Methods
    def get_profile(self) -> Dict[str, Any]:
        return self._read_json(self.profile_path)

    def update_profile(self, data: Dict[str, Any]) -> Dict[str, Any]:
        current = self.get_profile()
        current.update(data)
        current["updated_at"] = datetime.now().isoformat()
        self._save_json(self.profile_path, current)
        return current

    def add_crop(self, crop_data: Dict[str, Any]) -> Dict[str, Any]:
        profile = self.get_profile()
        crops = profile.get("crops", [])
        crop_data["id"] = f"crop_{uuid.uuid4().hex[:8]}"
        crops.append(crop_data)
        profile["crops"] = crops
        self._save_json(self.profile_path, profile)
        return crop_data

    def delete_crop(self, crop_entry_id: str) -> bool:
        profile = self.get_profile()
        crops = [c for c in profile.get("crops", []) if c.get("id") != crop_entry_id]
        profile["crops"] = crops
        self._save_json(self.profile_path, profile)
        return True

    # Detection History Methods
    def get_history(self) -> List[Dict[str, Any]]:
        history = self._read_json(self.history_path)
        if isinstance(history, list):
            return history
        return []

    def add_detection_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        history = self.get_history()
        record["id"] = f"scan_{uuid.uuid4().hex[:8]}"
        record["timestamp"] = datetime.now().isoformat()
        record["timestamp_formatted"] = datetime.now().strftime("%d %b %Y, %I:%M %p")
        history.insert(0, record)
        # Cap history to 50 items
        if len(history) > 50:
            history = history[:50]
        self._save_json(self.history_path, history)
        return record

    def delete_history_record(self, record_id: str) -> bool:
        history = self.get_history()
        history = [h for h in history if h.get("id") != record_id]
        self._save_json(self.history_path, history)
        return True

    # Smart Alerts Methods
    def get_alerts(self) -> List[Dict[str, Any]]:
        alerts = self._read_json(self.alerts_path)
        if isinstance(alerts, list):
            return alerts
        return []

    def mark_alert_read(self, alert_id: str) -> bool:
        alerts = self.get_alerts()
        for a in alerts:
            if a.get("id") == alert_id:
                a["read"] = True
                break
        self._save_json(self.alerts_path, alerts)
        return True

    def add_alert(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        alerts = self.get_alerts()
        if not isinstance(alerts, list):
            alerts = []
        if "id" not in alert:
            alert["id"] = f"alert_sm_{uuid.uuid4().hex[:6]}"
        if "created_at" not in alert:
            alert["created_at"] = datetime.now().isoformat()
        alerts.insert(0, alert)
        if len(alerts) > 50:
            alerts = alerts[:50]
        self._save_json(self.alerts_path, alerts)
        return alert

    # Fertilizer Recommendation History Methods
    def get_fertilizer_history(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        history = self._read_json(self.fertilizer_history_path)
        if not isinstance(history, list):
            return []
        if user_id:
            # Filter strictly by authenticated user id to prevent cross-farmer data leakage
            return [h for h in history if str(h.get("user_id")) == str(user_id)]
        return []

    def get_latest_fertilizer_record(self, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not user_id:
            return None
        history = self.get_fertilizer_history(user_id)
        return history[0] if len(history) > 0 else None

    def add_fertilizer_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        all_history = self._read_json(self.fertilizer_history_path)
        if not isinstance(all_history, list):
            all_history = []
        
        record["id"] = f"fert_rec_{uuid.uuid4().hex[:8]}"
        record["created_at"] = datetime.now().isoformat()
        record["created_at_formatted"] = datetime.now().strftime("%d %b %Y, %I:%M %p")
        all_history.insert(0, record)
        
        # Keep up to 100 historical recommendations
        if len(all_history) > 100:
            all_history = all_history[:100]
            
        self._save_json(self.fertilizer_history_path, all_history)
        return record

    def delete_fertilizer_record(self, record_id: str, user_id: Optional[str] = None) -> bool:
        all_history = self._read_json(self.fertilizer_history_path)
        if not isinstance(all_history, list) or not user_id:
            return False
            
        original_len = len(all_history)
        all_history = [
            h for h in all_history 
            if not (h.get("id") == record_id and str(h.get("user_id")) == str(user_id))
        ]
            
        self._save_json(self.fertilizer_history_path, all_history)
        return len(all_history) < original_len

    # Soil Moisture Telemetry Methods (ESP32 Integration)
    def save_soil_moisture_reading(self, data: Dict[str, Any]) -> Dict[str, Any]:
        store = self._read_json(self.soil_moisture_path)
        if not isinstance(store, dict):
            store = {"latest": None, "history": []}

        now = datetime.now()
        pct = float(data.get("moisture_percentage", 0.0))
        status = data.get("status")
        if not status or status not in ("DRY", "MOIST", "WET"):
            if pct < 30.0:
                status = "DRY"
            elif pct > 70.0:
                status = "WET"
            else:
                status = "MOIST"

        # Formulate agronomic advice
        if status == "DRY":
            advice_en = "Soil is critically dry (<30%). Immediate irrigation recommended."
            advice_ta = "மண் அதிக வறட்சியாக உள்ளது (<30%). உடனடி நீர்ப்பாசனம் செய்யவும்."
            advice_hi = "मिट्टी बहुत सूखी है (<30%)। तुरंत सिंचाई की सिफारिश की जाती है।"
        elif status == "WET":
            advice_en = "Soil is saturated (>70%). Postpone irrigation to avoid root rot."
            advice_ta = "மண்ணில் அதிக நீர் உள்ளது (>70%). வேரழுகலைத் தவிர்க்க நீர்ப்பாசனத்தை தள்ளிவைக்கவும்."
            advice_hi = "मिट्टी अत्यधिक गीली है (>70%)। जड़ गलन से बचने के लिए पानी देना टालें।"
        else:
            advice_en = "Soil moisture is in the optimal range (30-70%). Continue scheduled watering."
            advice_ta = "மண்ணின் ஈரப்பதம் உகந்த அளவில் உள்ளது (30-70%). வழக்கமான பாசனத்தை தொடரவும்."
            advice_hi = "मिट्टी की नमी इष्टतम सीमा (30-70%) में है। सामान्य सिंचाई जारी रखें।"

        record = {
            "id": f"sm_{uuid.uuid4().hex[:8]}",
            "device_id": data.get("device_id", "esp32_devkit_v1"),
            "raw_adc": int(data.get("raw_adc", 0)),
            "moisture_percentage": round(pct, 1),
            "status": status,
            "sensor_pin": data.get("sensor_pin", "GPIO34"),
            "battery_level": data.get("battery_level"),
            "temperature_c": data.get("temperature_c"),
            "created_at": now.isoformat(),
            "created_at_formatted": now.strftime("%d %b %Y, %I:%M:%S %p"),
            "advice_en": advice_en,
            "advice_ta": advice_ta,
            "advice_hi": advice_hi,
        }

        # Update latest and history
        store["latest"] = record
        history = store.get("history", [])
        if not isinstance(history, list):
            history = []
        history.insert(0, record)
        if len(history) > 100:
            history = history[:100]
        store["history"] = history
        self._save_json(self.soil_moisture_path, store)

        # Trigger smart alert if soil is critically dry or waterlogged
        try:
            if pct < 20.0:
                self.add_alert({
                    "category": "irrigation",
                    "severity": "high",
                    "crop_id": "all",
                    "crop_name": "Active Field",
                    "title_en": "Critical Soil Moisture Deficit",
                    "title_ta": "மண்ணில் மிகக் குறைந்த ஈரப்பதம்",
                    "message_en": f"ESP32 sensor detected soil moisture at {round(pct, 1)}%. Root zone is parched.",
                    "message_ta": f"ESP32 சென்சார் மண் ஈரம் {round(pct, 1)}% ஆக குறைந்துள்ளதாக எச்சரிக்கிறது. உடனடி நீர் தேவை.",
                    "action_en": "Start irrigation immediately to prevent crop wilting.",
                    "action_ta": "பயிர் வாடுவதைத் தடுக்க உடனே நீர் பாய்ச்சவும்.",
                    "read": False,
                })
            elif pct > 85.0:
                self.add_alert({
                    "category": "irrigation",
                    "severity": "medium",
                    "crop_id": "all",
                    "crop_name": "Active Field",
                    "title_en": "Soil Waterlogging Warning",
                    "title_ta": "மண்ணில் அதிக நீர் தேக்கம்",
                    "message_en": f"ESP32 sensor detected high saturation ({round(pct, 1)}%).",
                    "message_ta": f"ESP32 சென்சார் அதிக ஈரப்பதத்தை ({round(pct, 1)}%) கண்டறிந்துள்ளது.",
                    "action_en": "Ensure drain channels are open and suspend irrigation.",
                    "action_ta": "வடிகால் வாய்க்கால்களை திறந்துவிட்டு நீர்ப்பாசனத்தை நிறுத்தவும்.",
                    "read": False,
                })
        except Exception:
            pass

        return record

    def get_latest_soil_moisture(self, offline_threshold_seconds: int = 90) -> Dict[str, Any]:
        store = self._read_json(self.soil_moisture_path)
        latest = store.get("latest") if isinstance(store, dict) else None

        if not latest:
            return {
                "success": True,
                "device_id": "esp32_devkit_v1",
                "raw_adc": 0,
                "moisture_percentage": 0.0,
                "status": "WAITING",
                "connectivity_status": "WAITING",
                "is_online": False,
                "last_updated": None,
                "last_updated_formatted": "Waiting for sensor data...",
                "seconds_since_update": None,
                "sensor_pin": "GPIO34",
                "advice_en": "Waiting for first ESP32 sensor transmission...",
                "advice_ta": "ESP32 சென்சாரின் முதல் தகவலுக்காக காத்திருக்கிறது...",
                "advice_hi": "ESP32 सेंसर के पहले डेटा की प्रतीक्षा है..."
            }

        seconds_since = None
        is_online = False
        try:
            created_at_str = latest.get("created_at")
            if created_at_str:
                created_dt = datetime.fromisoformat(created_at_str)
                seconds_since = max(0, int((datetime.now() - created_dt).total_seconds()))
                is_online = seconds_since <= offline_threshold_seconds
        except Exception:
            is_online = False

        connectivity = "ONLINE" if is_online else "OFFLINE"

        return {
            "success": True,
            "device_id": latest.get("device_id", "esp32_devkit_v1"),
            "raw_adc": latest.get("raw_adc", 0),
            "moisture_percentage": latest.get("moisture_percentage", 0.0),
            "status": latest.get("status", "MOIST"),
            "connectivity_status": connectivity,
            "is_online": is_online,
            "last_updated": latest.get("created_at"),
            "last_updated_formatted": latest.get("created_at_formatted"),
            "seconds_since_update": seconds_since,
            "sensor_pin": latest.get("sensor_pin", "GPIO34"),
            "battery_level": latest.get("battery_level"),
            "temperature_c": latest.get("temperature_c"),
            "advice_en": latest.get("advice_en"),
            "advice_ta": latest.get("advice_ta"),
            "advice_hi": latest.get("advice_hi"),
        }

    def get_soil_moisture_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        store = self._read_json(self.soil_moisture_path)
        if isinstance(store, dict):
            history = store.get("history", [])
            if isinstance(history, list):
                return history[:limit]
        return []

farm_store = FarmStore()
