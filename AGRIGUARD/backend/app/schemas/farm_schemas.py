from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator

class ProfileUpdate(BaseModel):
    farmer_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    active_crop_id: Optional[str] = None

class CropCreate(BaseModel):
    crop_id: str
    crop_name_en: str
    crop_name_ta: str
    variety: Optional[str] = "Local / Standard"
    area_acres: Optional[str] = "1.0"
    planting_date: Optional[str] = None
    growth_stage: Optional[str] = "Vegetative"
    soil_type: Optional[str] = "Red Loam"
    irrigation_method: Optional[str] = "Drip Irrigation"

class DiseaseRiskRequest(BaseModel):
    crop_id: str = "tomato"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None

class IrrigationRequest(BaseModel):
    crop_id: str = "tomato"
    growth_stage: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_method: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None

class FertilizerRequest(BaseModel):
    crop_id: str = "tomato"
    growth_stage: Optional[str] = None
    observed_deficiency_symptom: Optional[str] = None
    has_soil_test: bool = False
    soil_type: Optional[str] = None
    land_area: Optional[float] = None
    land_unit: Optional[str] = "Acre"
    nitrogen_ppm: Optional[float] = None
    phosphorus_ppm: Optional[float] = None
    potassium_ppm: Optional[float] = None
    ph: Optional[float] = None

class AppliedFertilizerItem(BaseModel):
    name: str = "Urea"
    quantity_kg: float = 0.0
    unit: Optional[str] = "kg"
    date_or_days_ago: Optional[str] = None

class SoilTestDetail(BaseModel):
    tested: bool = False
    ph: Optional[float] = None
    nitrogen_level: Optional[str] = None  # Low, Medium, High or kg/ha
    phosphorus_level: Optional[str] = None
    potassium_level: Optional[str] = None

class FertilizerRecommendationInput(BaseModel):
    # Question 1: What crop are you growing?
    crop_id: str = "tomato"
    crop_name: Optional[str] = None
    
    # Question 2: What is the current growth stage of your crop?
    growth_stage: Optional[str] = "Vegetative growth"
    
    # Question 3: What type of soil do you have?
    soil_type: Optional[str] = "Red soil"
    
    # Question 4: What is the size of your cultivated land?
    land_area: Optional[float] = 1.0
    land_unit: Optional[str] = "Acre"  # Acre, Hectare, Cent, Square Metre
    
    # Question 5: Have you tested your soil recently?
    soil_tested: bool = False
    soil_ph: Optional[float] = None
    soil_nitrogen: Optional[str] = None
    soil_phosphorus: Optional[str] = None
    soil_potassium: Optional[str] = None
    
    # Question 6: What is your location?
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    
    # Question 7: Have you already applied any fertilizer?
    already_applied: bool = False
    applied_fertilizers: Optional[List[AppliedFertilizerItem]] = []
    
    # Question 8: What irrigation method do you use?
    irrigation_method: Optional[str] = "Drip irrigation"
    
    # Question 9: Are you noticing any problems with your plants?
    plant_problems: Optional[List[str]] = []
    symptom_description: Optional[str] = None
    
    # Question 10: Do you prefer organic, chemical, or both types of fertilizers?
    fertilizer_preference: Optional[str] = "Both organic and chemical fertilizers"
    
    # Question 11: How long ago did you plant the crop?
    crop_age_days: Optional[int] = 30
    planting_date: Optional[str] = None
    
    # Question 12: What is your approximate fertilizer budget?
    fertilizer_budget_inr: Optional[float] = 5000.0
    
    # Authenticated user ID association
    user_id: Optional[str] = None
    preferred_language: Optional[str] = "en"

class AssistantConversationTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=1500)

class AssistantQueryRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    crop_hint: Optional[str] = Field(default=None, max_length=160)
    language: Literal["en", "ta", "hi"] = "en"
    history: List[AssistantConversationTurn] = Field(default_factory=list, max_length=10)

    @field_validator("query")
    @classmethod
    def query_must_contain_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Please enter an agriculture question.")
        return value

class FertilizerAssistantRequest(BaseModel):
    query: str
    language: Optional[str] = "en"
    crop_name: Optional[str] = None
    growth_stage: Optional[str] = None
    land_area: Optional[float] = None
    land_unit: Optional[str] = "Acre"
    soil_type: Optional[str] = None
    budget_inr: Optional[float] = None
    estimated_cost_inr: Optional[float] = None
    preference: Optional[str] = None
    active_plan_summary: Optional[str] = None
    recommendation_context: Optional[Dict[str, Any]] = None

class SoilMoistureReadingCreate(BaseModel):
    device_id: str = Field(default="esp32_devkit_v1", max_length=64)
    raw_adc: int = Field(ge=0, le=4095, description="12-bit ADC reading on ESP32 (0-4095)")
    moisture_percentage: float = Field(ge=0.0, le=100.0, description="Calibrated moisture percentage (0-100%)")
    status: Optional[Literal["DRY", "MOIST", "WET"]] = None
    sensor_pin: Optional[str] = Field(default="GPIO34", max_length=16)
    battery_level: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    temperature_c: Optional[float] = None

    @field_validator("raw_adc")
    @classmethod
    def validate_adc(cls, v: int) -> int:
        if not (0 <= v <= 4095):
            raise ValueError("raw_adc must be between 0 and 4095 for ESP32 12-bit ADC.")
        return v

    @field_validator("moisture_percentage")
    @classmethod
    def validate_percentage(cls, v: float) -> float:
        return round(max(0.0, min(100.0, float(v))), 1)

class SoilMoistureResponse(BaseModel):
    success: bool = True
    device_id: str
    raw_adc: int
    moisture_percentage: float
    status: Literal["DRY", "MOIST", "WET"]
    connectivity_status: Literal["ONLINE", "OFFLINE", "WAITING"]
    is_online: bool
    last_updated: Optional[str] = None
    last_updated_formatted: Optional[str] = None
    seconds_since_update: Optional[int] = None
    sensor_pin: str = "GPIO34"
    advice_en: Optional[str] = None
    advice_ta: Optional[str] = None
    advice_hi: Optional[str] = None

