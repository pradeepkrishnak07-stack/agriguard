import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

logger = logging.getLogger("agriguard.endpoints")
from ..core.config import settings
from ..data.knowledge_base import CROPS, DISEASES, NUTRIENT_DEFICIENCIES
from ..services.weather_service import weather_service
from ..services.disease_risk_engine import disease_risk_engine
from ..services.disease_detector import disease_detector
from ..services.irrigation_engine import irrigation_engine
from ..services.fertilizer_engine import fertilizer_engine
from ..services.agri_assistant import agri_assistant
from ..services.gemini_assistant import GeminiAssistantError, ask_agriculture_question
from ..services.farm_store import farm_store
from ..services.auth_service import auth_service
from ..services.tts_service import tts_service
from ..schemas.farm_schemas import (
    ProfileUpdate, CropCreate, DiseaseRiskRequest,
    IrrigationRequest, FertilizerRequest, AssistantQueryRequest,
    FertilizerRecommendationInput, FertilizerAssistantRequest,
    SoilMoistureReadingCreate, SoilMoistureResponse
)
from ..schemas.auth_schemas import (
    RegisterRequest, LoginRequest, ForgotPasswordRequest,
    ResetPasswordRequest, AuthResponse, ForgotPasswordResponse
)

router = APIRouter()

@router.get("/health")
def health_check():
    """Lightweight liveness check that verifies backend process is responsive."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "model_version": settings.MODEL_VERSION,
        "supported_crops_count": len(CROPS),
        "supported_diseases_count": len(DISEASES),
        "weather_service": "Active (Open-Meteo & OpenWeather supported)",
        "offline_ready": True
    }

@router.get("/health/ready")
@router.get("/ready")
def readiness_check():
    """
    Readiness probe that distinguishes between backend availability and database accessibility.
    Returns HTTP 200 when ready for authentication and queries, or HTTP 503 if database storage is unavailable.
    """
    import datetime
    db_health = auth_service.check_db_health()
    is_ready = db_health.get("healthy", False)
    
    response_payload = {
        "status": "ready" if is_ready else "degraded",
        "backend": "healthy",
        "database": {
            "status": "healthy" if is_ready else "error",
            "users_count": db_health.get("users_count", 0),
            "writable": db_health.get("writable", False),
            "storage_dir": db_health.get("storage_dir", settings.DATA_DIR),
            "error": db_health.get("error")
        },
        "auth_service": "ready" if is_ready else "database_unavailable",
        "timestamp": datetime.datetime.now().isoformat()
    }
    
    if not is_ready:
        return JSONResponse(status_code=503, content=response_payload)
    return response_payload

@router.get("/weather/forecast")
def get_weather(lat: Optional[float] = None, lon: Optional[float] = None, location_name: Optional[str] = None):
    return weather_service.get_weather(lat, lon, location_name)

@router.post("/disease/detect")
async def detect_crop_disease(
    file: UploadFile = File(...),
    crop_hint: Optional[str] = Form(None),
    save_to_history: Optional[bool] = Form(True)
):
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read image file: {str(e)}")

    result = disease_detector.analyze_image(contents, file.filename or "leaf.jpg", crop_hint)

    # Save to history if diagnosis was successful & reliable
    if save_to_history and result.get("success") and result.get("is_reliable"):
        record = {
            "crop_id": result.get("crop_id"),
            "crop_name_en": result.get("crop_name_en"),
            "crop_name_ta": result.get("crop_name_ta"),
            "disease_id": result.get("disease_id"),
            "condition_title_en": result.get("condition_title_en"),
            "condition_title_ta": result.get("condition_title_ta"),
            "confidence_score": result.get("confidence_score"),
            "is_healthy": result.get("is_healthy"),
            "model_version": result.get("model_version"),
            "pathogen": result.get("pathogen"),
            "filename": file.filename
        }
        saved = farm_store.add_detection_record(record)
        result["saved_record_id"] = saved.get("id")

    return result

@router.post("/disease/risk")
def calculate_disease_risk(payload: DiseaseRiskRequest):
    return disease_risk_engine.assess_risk(
        crop_id=payload.crop_id,
        lat=payload.latitude,
        lon=payload.longitude,
        location_name=payload.location_name
    )

@router.get("/disease/info")
def get_supported_diseases(crop_id: Optional[str] = None):
    if crop_id:
        filtered = {k: v for k, v in DISEASES.items() if v["crop_id"] == crop_id}
        return {"crop_id": crop_id, "diseases": filtered}
    return {
        "crops": CROPS,
        "diseases": DISEASES
    }

@router.post("/irrigation/recommend")
def get_irrigation_recommendation(payload: IrrigationRequest):
    return irrigation_engine.get_advice(
        crop_id=payload.crop_id,
        growth_stage=payload.growth_stage,
        soil_type=payload.soil_type,
        irrigation_method=payload.irrigation_method,
        lat=payload.latitude,
        lon=payload.longitude,
        location_name=payload.location_name
    )

# ----------------- SOIL MOISTURE IOT SENSOR ENDPOINTS ----------------- #

@router.post("/sensor/soil-moisture", status_code=201)
def ingest_soil_moisture(payload: SoilMoistureReadingCreate):
    """
    Ingest real-time soil moisture telemetry from ESP32 DevKit V1.
    Accepts raw ADC, moisture percentage, status, and device metadata.
    Validates ranges, stores latest & history, and creates smart alerts on critical deficits.
    """
    try:
        data = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        record = farm_store.save_soil_moisture_reading(data)
        return {
            "success": True,
            "message": "Soil moisture reading ingested successfully",
            "record": record
        }
    except Exception as e:
        logger.exception(f"Error ingesting soil moisture: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process sensor data: {str(e)}")

@router.get("/sensor/soil-moisture/latest")
def get_latest_soil_moisture():
    """
    Fetch the latest soil moisture reading with live connectivity status (ONLINE / OFFLINE / WAITING).
    """
    try:
        return farm_store.get_latest_soil_moisture(offline_threshold_seconds=90)
    except Exception as e:
        logger.exception(f"Error fetching latest soil moisture: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sensor reading")

@router.get("/sensor/soil-moisture/history")
def get_soil_moisture_history(limit: Optional[int] = 50):
    """
    Fetch historical soil moisture readings for trends and analysis.
    """
    try:
        readings = farm_store.get_soil_moisture_history(limit=limit or 50)
        return {"success": True, "count": len(readings), "readings": readings}
    except Exception as e:
        logger.exception(f"Error fetching soil moisture history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sensor history")


@router.post("/fertilizer/recommend")
def get_fertilizer_guidance(payload: FertilizerRequest):
    try:
        input_data = FertilizerRecommendationInput(
            crop_id=payload.crop_id,
            growth_stage=payload.growth_stage or "Vegetative Growth",
            soil_type=payload.soil_type or "Red soil",
            land_area=payload.land_area or 1.0,
            land_unit=payload.land_unit or "Acre",
            crop_age_days=30,
            fertilizer_budget_inr=5000.0,
            irrigation_method="Drip irrigation",
            plant_problems=[payload.observed_deficiency_symptom] if payload.observed_deficiency_symptom else []
        )
        result = fertilizer_engine.generate_recommendation(input_data)
        if not result.get("success"):
            return JSONResponse(status_code=400, content=result)

        crop_info = result.get("crop_info", {})
        schedule = result.get("schedule", [])
        organic_plan_list = result.get("organic_plan", [])  # This is a list of product dicts
        chem_plan_list = result.get("chemical_plan", [])    # This is a list of product dicts
        deficiency_data = result.get("nutrient_deficiencies_detected", {})

        # Build basal text from schedule[0]
        basal = schedule[0] if schedule else {}
        basal_en = (basal.get("chemical_action_en") or "Apply FYM 25 t/ha, full Phosphorus and 25% Nitrogen & Potash at planting.").rstrip(".")
        basal_en += ". Organics: " + (basal.get("organic_action_en") or "Apply Neem Cake and Biofertilizer.")
        basal_ta = (basal.get("chemical_action_ta") or "கடைசி உழவின் போது தொழு உரம் 25 டன், முழு மணிச்சத்து மற்றும் கால் பங்கு தழை & சாம்பல் சத்து இடவும்.").rstrip(".")
        basal_ta += ". இயற்கை: " + (basal.get("organic_action_ta") or "வேப்பம் பிண்ணாக்கு மற்றும் உயிர் உரம் இடவும்.")

        # Stage split recommendations from all schedule items
        splits_en = [
            {"stage": item.get("stage_en", ""), "action": (item.get("chemical_action_en") or item.get("organic_action_en") or "")}
            for item in schedule
        ] or [
            {"stage": "Vegetative", "action": "Top-dress 50% Nitrogen after weeding."},
            {"stage": "Flowering", "action": "Apply remaining Nitrogen and Potash to support fruit formation."}
        ]
        splits_ta = [
            {"stage": item.get("stage_ta", ""), "action": (item.get("chemical_action_ta") or item.get("organic_action_ta") or "")}
            for item in schedule
        ] or [
            {"stage": "வளர்ச்சிப் பருவம்", "action": "களை எடுத்த பின் 50% தழைச்சத்து மேலுரமாக இடவும்."},
            {"stage": "பூக்கும் பருவம்", "action": "மீதி தழை மற்றும் பொட்டாஷ் உரம் இடவும்."}
        ]

        # Extract biofertilizer item from organic_plan list for guidance text
        biofert_item = next(
            (item for item in organic_plan_list if "biofertilizer" in item.get("fertilizer_name_en", "").lower() or
             "azospirillum" in item.get("fertilizer_name_en", "").lower()),
            None
        )
        bio_en = (
            (f"{biofert_item.get('fertilizer_name_en', '')} — {biofert_item.get('purpose_en', '')} {biofert_item.get('timing_en', '')}".strip())
            if biofert_item else
            "Apply Azospirillum and Phosphobacteria @ 2 kg/ha mixed with compost at planting. "
            "Trichoderma viride @ 2.5 kg/ha can be applied in furrows to prevent soil-borne diseases."
        )
        bio_ta = (
            (f"{biofert_item.get('fertilizer_name_ta', '')} — {biofert_item.get('purpose_ta', '')} {biofert_item.get('timing_ta', '')}".strip())
            if biofert_item else
            "அசோஸ்பைரில்லம் மற்றும் பாஸ்போபாக்டீரியா தலா 2 கிலோ/ஹெக்டர் தொழு உரத்துடன் கலந்து நடவு செய்யும்போது இடவும். "
            "ட்ரைக்கோடர்மா விரிடே 2.5 கிலோ/ஹெக்டர் மண்வழி நோய்களுக்கு எதிராக பயன்படுத்தலாம்."
        )

        # NPK ratio — derived from crop_info or fixed fallback
        urea_item = next((i for i in chem_plan_list if "urea" in i.get("fertilizer_name_en", "").lower()), None)
        ssp_item = next((i for i in chem_plan_list if "ssp" in i.get("fertilizer_name_en", "").lower() or "phosphate" in i.get("fertilizer_name_en", "").lower()), None)
        mop_item = next((i for i in chem_plan_list if "potash" in i.get("fertilizer_name_en", "").lower() or "mop" in i.get("fertilizer_name_en", "").lower()), None)
        urea_qty_str = urea_item.get("quantity", "") if urea_item else ""
        ssp_qty_str = ssp_item.get("quantity", "") if ssp_item else ""
        mop_qty_str = mop_item.get("quantity", "") if mop_item else ""
        def parse_kg(s): 
            import re
            m = re.search(r"[\d.]+", s)
            return float(m.group()) if m else 0
        n_urea = round(parse_kg(urea_qty_str) * 0.46) if urea_qty_str else 60
        p_ssp = round(parse_kg(ssp_qty_str) * 0.16) if ssp_qty_str else 40
        k_mop = round(parse_kg(mop_qty_str) * 0.60) if mop_qty_str else 20
        npk_ratio = f"{n_urea}:{p_ssp}:{k_mop} kg/ha" if (n_urea or p_ssp or k_mop) else "150:100:50 kg/ha"

        # Standard deficiency options
        available_deficiency_options = [
            {"id": "nitrogen", "label_en": "Nitrogen (N) — Lower leaf yellowing, stunted growth", "label_ta": "தழைச்சத்து — கீழ் இலை மஞ்சளாதல், வளர்ச்சி குன்றல்"},
            {"id": "phosphorus", "label_en": "Phosphorus (P) — Purple/bronze discoloration on leaf undersides", "label_ta": "மணிச்சத்து — இலை அடிப்பகுதியில் ஊதா அல்லது செம்பு நிறம்"},
            {"id": "potassium", "label_en": "Potassium (K) — Leaf edge scorching and tip burn", "label_ta": "சாம்பல் சத்து — இலை விளிம்பு கருகல் மற்றும் நுனி எரிதல்"},
            {"id": "zinc", "label_en": "Zinc (Zn) — Bleached interveinal bands, little leaf", "label_ta": "துத்தநாகம் — இலை நரம்புகளுக்கிடையே வெள்ளை வரிகள், சிறு இலை"},
            {"id": "iron", "label_en": "Iron (Fe) — Young leaf yellowing with green veins", "label_ta": "இரும்புச்சத்து — இளம் இலைகள் மஞ்சளாகி நரம்புகள் பச்சையாக இருத்தல்"},
            {"id": "sulphur", "label_en": "Sulphur (S) — Uniform yellowing of young leaves", "label_ta": "கந்தகம் — புதிய இலைகள் ஒரேமாதிரியாக மஞ்சளாதல்"}
        ]

        observed_deficiency_assessment = None
        diagnoses_en_list = deficiency_data.get("diagnoses_en", [])
        diagnoses_ta_list = deficiency_data.get("diagnoses_ta", [])
        foliar_en = deficiency_data.get("foliar_sprays_en", [])
        foliar_ta = deficiency_data.get("foliar_sprays_ta", [])
        if payload.observed_deficiency_symptom and diagnoses_en_list:
            symp = payload.observed_deficiency_symptom
            observed_deficiency_assessment = {
                "nutrient": symp.title(),
                "nutrient_ta": symp,
                "symptoms_en": diagnoses_en_list[0] if diagnoses_en_list else "",
                "symptoms_ta": diagnoses_ta_list[0] if diagnoses_ta_list else "",
                "correction_en": foliar_en[0] if foliar_en else "",
                "correction_ta": foliar_ta[0] if foliar_ta else "",
                "distinction_note_en": "Note: These symptoms can also be caused by diseases, nematodes, or waterlogging. Always verify with a field diagnosis before applying corrective inputs.",
                "distinction_note_ta": "குறிப்பு: இந்த அறிகுறிகள் நோய், நூல்புழு அல்லது நீர் தேங்குவதாலும் ஏற்படலாம். சரிசெய்யும் முன் வயலில் நேரில் ஆய்வு செய்யவும்."
            }

        return {
            "success": True,
            "crop_id": result.get("crop_id", payload.crop_id),
            "crop_name_en": crop_info.get("name_en", payload.crop_id.title()),
            "crop_name_ta": crop_info.get("name_ta", payload.crop_id),
            "growth_stage": crop_info.get("growth_stage", payload.growth_stage or "Vegetative Growth"),
            "has_soil_test": payload.has_soil_test,
            "recommended_npk_ratio": npk_ratio,
            "soil_testing_advice_en": "A laboratory soil test every 2 years provides exact fertilizer recommendations tailored to your field. Soil Health Card from your KVK is highly recommended.",
            "soil_testing_advice_ta": "இரண்டு வருடங்களுக்கு ஒருமுறை மண் பரிசோதனை செய்வது மண்ணின் தன்மைக்கேற்ற சரியான உர பரிந்துரையை வழங்கும். KVK-இல் இலவச மண் சுகாதார அட்டை பெறலாம்.",
            "basal_application_en": basal_en,
            "basal_application_ta": basal_ta,
            "stage_split_recommendations_en": splits_en,
            "stage_split_recommendations_ta": splits_ta,
            "biofertilizer_guidance_en": bio_en,
            "biofertilizer_guidance_ta": bio_ta,
            "observed_deficiency_assessment": observed_deficiency_assessment,
            "available_deficiency_options": available_deficiency_options,
            "reference": result.get("reference", "TNAU Agritech Portal & ICAR Recommended Fertilizer Schedules"),
            "expert_consultation_en": "Consult your local KVK (Krishi Vigyan Kendra) for calibrated Soil Test Crop Response (STCR) dosing and government subsidy schemes.",
            "expert_consultation_ta": "துல்லியமான உர அளவிற்கும் அரசு மானியத் திட்டங்களுக்கும் உங்கள் அருகில் உள்ள வேளாண் அறிவியல் மையத்தை (KVK) அணுகவும்."
        }
    except Exception as e:
        logger.exception(f"Error in /fertilizer/recommend: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "detail": f"Failed to recommend fertilizer: {str(e)}",
                "message": "Calculation error in fertilizer guidance module."
            }
        )

@router.post("/fertilizer/generate")
def generate_fertilizer_plan(payload: FertilizerRecommendationInput):
    try:
        result = fertilizer_engine.generate_recommendation(payload)
        if not result.get("success"):
            return JSONResponse(status_code=400, content=result)

        try:
            record = {
                "user_id": payload.user_id,
                "crop_id": payload.crop_id,
                "crop_name_en": result["crop_info"]["name_en"],
                "crop_name_ta": result["crop_info"]["name_ta"],
                "crop_name_hi": result["crop_info"]["name_hi"],
                "growth_stage": payload.growth_stage,
                "soil_type": payload.soil_type,
                "land_area": payload.land_area,
                "land_unit": payload.land_unit,
                "budget_inr": payload.fertilizer_budget_inr,
                "estimated_cost_inr": result["cost_analysis"]["estimated_total_cost_inr"],
                "preference": payload.fertilizer_preference,
                "input_payload": payload.dict(),
                "recommendation": dict(result)
            }
            saved = farm_store.add_fertilizer_record(record)
            result["saved_id"] = saved.get("id")
            result["saved_created_at"] = saved.get("created_at_formatted")
        except Exception as store_err:
            logger.warning(f"Failed to persist fertilizer recommendation history: {store_err}")

        return result
    except ValueError as ve:
        logger.warning(f"Invalid fertilizer input provided: {ve}")
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "detail": str(ve),
                "message": "Invalid input provided for fertilizer recommendation."
            }
        )
    except Exception as e:
        logger.exception(f"Error in generate_fertilizer_plan: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "detail": f"Failed to recommend fertilizer: {str(e)}",
                "message": "Server error while calculating fertilizer recommendation."
            }
        )

@router.get("/fertilizer/history")
def get_fertilizer_history(user_id: Optional[str] = None):
    return farm_store.get_fertilizer_history(user_id)

@router.get("/fertilizer/latest")
def get_latest_fertilizer_recommendation(user_id: Optional[str] = None):
    rec = farm_store.get_latest_fertilizer_record(user_id)
    if not rec:
        return {"success": False, "message": "No previous fertilizer recommendations found."}
    return {"success": True, "record": rec}

@router.delete("/fertilizer/history/{rec_id}")
def delete_fertilizer_record(rec_id: str, user_id: Optional[str] = None):
    success = farm_store.delete_fertilizer_record(rec_id, user_id)
    return {"success": success, "deleted_id": rec_id}

@router.post("/fertilizer/ask")
def ask_fertilizer_assistant(payload: FertilizerAssistantRequest):
    return agri_assistant.process_fertilizer_query(
        query=payload.query,
        context=payload.recommendation_context or payload.dict(),
        language=payload.language or "en"
    )

@router.post("/assistant/ask")
def ask_assistant(payload: AssistantQueryRequest):
    try:
        return ask_agriculture_question(
            query=payload.query,
            crop_hint=payload.crop_hint,
            language=payload.language,
            history=payload.history,
        )
    except GeminiAssistantError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

@router.get("/farm/profile")
def get_farm_profile():
    return farm_store.get_profile()

@router.post("/farm/profile")
def update_farm_profile(payload: ProfileUpdate):
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    return farm_store.update_profile(update_data)

@router.post("/farm/crop")
def add_farm_crop(payload: CropCreate):
    return farm_store.add_crop(payload.dict())

@router.delete("/farm/crop/{crop_entry_id}")
def delete_farm_crop(crop_entry_id: str):
    farm_store.delete_crop(crop_entry_id)
    return {"success": True, "deleted_id": crop_entry_id}

@router.get("/history/detections")
def get_detection_history():
    return farm_store.get_history()

@router.delete("/history/detections/{record_id}")
def delete_history_record(record_id: str):
    success = farm_store.delete_history_record(record_id)
    return {"success": success, "deleted_id": record_id}

@router.get("/alerts")
def get_smart_alerts():
    return farm_store.get_alerts()

@router.post("/alerts/read/{alert_id}")
def mark_alert_read(alert_id: str):
    return {"success": farm_store.mark_alert_read(alert_id), "alert_id": alert_id}

@router.get("/admin/metrics")
def get_admin_metrics():
    history = farm_store.get_history()
    alerts = farm_store.get_alerts()
    profile = farm_store.get_profile()
    
    return {
        "model_version": settings.MODEL_VERSION,
        "total_scans_logged": len(history),
        "registered_crops_count": len(profile.get("crops", [])),
        "active_alerts_count": len([a for a in alerts if not a.get("read")]),
        "weather_cache_status": "Healthy (TTL 30m)",
        "diagnostics": {
            "python_version": "3.10+",
            "supported_crops": list(CROPS.keys()),
            "disease_classes": list(DISEASES.keys())
        }
    }

# ----------------- AUTHENTICATION ENDPOINTS ----------------- #

@router.post("/auth/register")
def register(payload: RegisterRequest):
    data = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    result = auth_service.register_user(data)
    if not result.get("success"):
        return JSONResponse(status_code=400, content=result)
    return result

@router.post("/auth/login")
def login(payload: LoginRequest):
    credential = payload.mobile or payload.email or payload.identifier or payload.username or ""
    if not credential:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "field": "mobile",
                "message": "Please enter your mobile number or email address.",
                "message_ta": "உங்கள் மொபைல் எண் அல்லது மின்னஞ்சலை உள்ளிடவும்.",
                "message_hi": "कृपया अपना मोबाइल नंबर या ईमेल पता दर्ज करें।"
            }
        )
    result = auth_service.login_user(credential, payload.password)
    if not result.get("success"):
        return JSONResponse(status_code=401, content=result)
    return result

@router.post("/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    result = auth_service.request_password_reset(payload.email)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result)
    return result

@router.post("/auth/reset-password")
def reset_password(payload: ResetPasswordRequest):
    result = auth_service.reset_password(payload.token, payload.new_password, payload.confirm_password)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result)
    return result

@router.post("/auth/logout")
def logout():
    return {"success": True, "message": "Successfully logged out."}

@router.get("/speech/tts")
def text_to_speech(text: str, lang: Optional[str] = "ta"):
    """
    High-fidelity Text-to-Speech audio streaming endpoint.
    Converts Tamil ('ta'), Hindi ('hi'), or English ('en') text into natural, fluent audio.
    Supports HTTP range and audio streaming for instant mobile & web playback.
    """
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Missing 'text' query parameter")
    try:
        audio_stream = tts_service.synthesize(text=text, lang=lang or "ta")
        return StreamingResponse(audio_stream, media_type="audio/mpeg", headers={
            "Content-Disposition": f"inline; filename=speech_{lang or 'ta'}.mp3",
            "Cache-Control": "public, max-age=86400"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis error: {str(e)}")
