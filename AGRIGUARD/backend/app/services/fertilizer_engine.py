import math
from typing import Dict, Any, Optional, List
from ..schemas.farm_schemas import FertilizerRecommendationInput

# Standard Recommended Baseline Rates (NPK kg per hectare and FYM tonnes/ha)
# Sources: TNAU Agritech Portal & ICAR Crop Production Manuals
CROP_DATA = {
    "tomato": {
        "name_en": "Tomato",
        "name_ta": "தக்காளி",
        "name_hi": "टमाटर",
        "n_kg_ha": 150, "p_kg_ha": 100, "k_kg_ha": 50,
        "fym_ton_ha": 25,
        "stages": ["Seedling", "Vegetative Growth", "Flowering", "Fruiting", "Maturity"],
        "basal_pct": {"n": 0.33, "p": 1.0, "k": 0.50},
        "vegetative_pct": {"n": 0.33, "p": 0.0, "k": 0.0},
        "flowering_pct": {"n": 0.34, "p": 0.0, "k": 0.50},
    },
    "rice": {
        "name_en": "Rice / Paddy",
        "name_ta": "நெல்",
        "name_hi": "धान / चावल",
        "n_kg_ha": 120, "p_kg_ha": 40, "k_kg_ha": 40,
        "fym_ton_ha": 12.5,
        "stages": ["Seedling", "Vegetative Growth", "Tillering", "Flowering", "Maturity"],
        "basal_pct": {"n": 0.25, "p": 1.0, "k": 0.25},
        "vegetative_pct": {"n": 0.50, "p": 0.0, "k": 0.25},
        "flowering_pct": {"n": 0.25, "p": 0.0, "k": 0.50},
    },
    "cotton": {
        "name_en": "Cotton",
        "name_ta": "பருத்தி",
        "name_hi": "कपास",
        "n_kg_ha": 80, "p_kg_ha": 40, "k_kg_ha": 40,
        "fym_ton_ha": 12.5,
        "stages": ["Seedling", "Vegetative Growth", "Flowering", "Fruiting", "Maturity"],
        "basal_pct": {"n": 0.25, "p": 1.0, "k": 0.50},
        "vegetative_pct": {"n": 0.50, "p": 0.0, "k": 0.0},
        "flowering_pct": {"n": 0.25, "p": 0.0, "k": 0.50},
    },
    "potato": {
        "name_en": "Potato",
        "name_ta": "உருளைக்கிழங்கு",
        "name_hi": "आलू",
        "n_kg_ha": 120, "p_kg_ha": 120, "k_kg_ha": 120,
        "fym_ton_ha": 20,
        "stages": ["Seedling", "Vegetative Growth", "Tuber Initiation", "Fruiting", "Maturity"],
        "basal_pct": {"n": 0.50, "p": 1.0, "k": 0.50},
        "vegetative_pct": {"n": 0.50, "p": 0.0, "k": 0.50},
        "flowering_pct": {"n": 0.0, "p": 0.0, "k": 0.0},
    },
    "corn": {
        "name_en": "Maize / Corn",
        "name_ta": "மக்காச்சோளம்",
        "name_hi": "मक्का",
        "n_kg_ha": 135, "p_kg_ha": 62.5, "k_kg_ha": 50,
        "fym_ton_ha": 12.5,
        "stages": ["Seedling", "Vegetative Growth", "Flowering", "Fruiting", "Maturity"],
        "basal_pct": {"n": 0.25, "p": 1.0, "k": 0.50},
        "vegetative_pct": {"n": 0.50, "p": 0.0, "k": 0.0},
        "flowering_pct": {"n": 0.25, "p": 0.0, "k": 0.50},
    },
    "groundnut": {
        "name_en": "Groundnut",
        "name_ta": "வேர்க்கடலை",
        "name_hi": "मूंगफली",
        "n_kg_ha": 25, "p_kg_ha": 50, "k_kg_ha": 75,
        "fym_ton_ha": 12.5,
        "stages": ["Seedling", "Vegetative Growth", "Flowering", "Fruiting", "Maturity"],
        "basal_pct": {"n": 1.0, "p": 1.0, "k": 1.0},
        "vegetative_pct": {"n": 0.0, "p": 0.0, "k": 0.0},
        "flowering_pct": {"n": 0.0, "p": 0.0, "k": 0.0},
    },
    "chilli": {
        "name_en": "Chilli",
        "name_ta": "மிளகாய்",
        "name_hi": "मिर्च",
        "n_kg_ha": 120, "p_kg_ha": 60, "k_kg_ha": 30,
        "fym_ton_ha": 20,
        "stages": ["Seedling", "Vegetative Growth", "Flowering", "Fruiting", "Maturity"],
        "basal_pct": {"n": 0.33, "p": 1.0, "k": 0.50},
        "vegetative_pct": {"n": 0.33, "p": 0.0, "k": 0.0},
        "flowering_pct": {"n": 0.34, "p": 0.0, "k": 0.50},
    },
    "sugarcane": {
        "name_en": "Sugarcane",
        "name_ta": "கரும்பு",
        "name_hi": "गन्ना",
        "n_kg_ha": 275, "p_kg_ha": 62.5, "k_kg_ha": 112.5,
        "fym_ton_ha": 25,
        "stages": ["Seedling", "Tillering", "Vegetative Growth", "Flowering", "Maturity"],
        "basal_pct": {"n": 0.10, "p": 1.0, "k": 0.0},
        "vegetative_pct": {"n": 0.60, "p": 0.0, "k": 0.50},
        "flowering_pct": {"n": 0.30, "p": 0.0, "k": 0.50},
    },
    "banana": {
        "name_en": "Banana",
        "name_ta": "வாழை",
        "name_hi": "केला",
        "n_kg_ha": 200, "p_kg_ha": 60, "k_kg_ha": 300,
        "fym_ton_ha": 20,
        "stages": ["Seedling", "Vegetative Growth", "Flowering", "Fruiting", "Maturity"],
        "basal_pct": {"n": 0.20, "p": 1.0, "k": 0.20},
        "vegetative_pct": {"n": 0.40, "p": 0.0, "k": 0.40},
        "flowering_pct": {"n": 0.40, "p": 0.0, "k": 0.40},
    },
    "wheat": {
        "name_en": "Wheat",
        "name_ta": "கோதுமை",
        "name_hi": "गेहूं",
        "n_kg_ha": 120, "p_kg_ha": 60, "k_kg_ha": 40,
        "fym_ton_ha": 10,
        "stages": ["Seedling", "Tillering", "Vegetative Growth", "Flowering", "Maturity"],
        "basal_pct": {"n": 0.50, "p": 1.0, "k": 1.0},
        "vegetative_pct": {"n": 0.50, "p": 0.0, "k": 0.0},
        "flowering_pct": {"n": 0.0, "p": 0.0, "k": 0.0},
    }
}

# Subsidized Indicative Price Table (INR per kg, official NBS/Govt indicative rates)
FERTILIZER_PRICES = {
    "urea": 6.0,          # ~Rs 266 per 45kg bag
    "dap": 27.0,          # ~Rs 1350 per 50kg bag
    "ssp": 10.0,          # ~Rs 500 per 50kg bag
    "mop": 34.0,          # ~Rs 1700 per 50kg bag
    "complex_19_19_19": 110.0, # Water soluble Rs 110/kg
    "fym": 1.5,           # Rs 1500 per tonne
    "vermicompost": 6.0,  # Rs 6/kg
    "neem_cake": 25.0,    # Rs 25/kg
    "biofertilizer": 40.0,# Rs 40/kg
    "zinc_sulphate": 50.0,# Rs 50/kg
    "borax": 90.0         # Rs 90/kg
}

class FertilizerEngine:
    """
    Expert Agricultural Fertilizer Recommendation Engine.
    Scales dosages to farmer's exact land area, adjusts for soil types,
    deducts already applied nutrients, diagnoses plant problems,
    respects preference (Organic/Chemical/Both), and analyzes budget.
    """

    def calculate_area_in_hectares(self, area: Optional[float], unit: Optional[str] = "Acre") -> float:
        try:
            val = float(area) if area is not None else 1.0
            safe_area = max(0.01, val if not math.isnan(val) else 1.0)
        except (ValueError, TypeError):
            safe_area = 1.0
        norm_unit = str(unit or "acre").strip().lower()
        if "hec" in norm_unit:
            return safe_area
        elif "cent" in norm_unit:
            return (safe_area / 100.0) * 0.404686
        elif "sq" in norm_unit or "metre" in norm_unit or "meter" in norm_unit:
            return safe_area / 10000.0
        else: # Default: Acre
            return safe_area * 0.404686

    def generate_recommendation(self, req: FertilizerRecommendationInput) -> Dict[str, Any]:
        crop_id_val = str(req.crop_id or "tomato").strip()
        crop_key = crop_id_val.lower()
        crop = CROP_DATA.get(crop_key)
        if not crop and req.crop_name:
            for k, v in CROP_DATA.items():
                if k in req.crop_name.lower() or v["name_en"].lower() in req.crop_name.lower():
                    crop = v
                    crop_key = k
                    break
        if not crop:
            # Fallback baseline with farmer's actual crop name
            display_name = req.crop_name or crop_id_val.title()
            crop = {
                **CROP_DATA["tomato"],
                "name_en": display_name,
                "name_ta": display_name,
                "name_hi": display_name,
            }

        ha = self.calculate_area_in_hectares(req.land_area, req.land_unit)
        acres = ha * 2.47105

        # Base NPK required for the farm area
        base_n = crop["n_kg_ha"] * ha
        base_p = crop["p_kg_ha"] * ha
        base_k = crop["k_kg_ha"] * ha

        # Adjust for Soil Type
        soil_type_norm = str(req.soil_type or "red soil").lower()
        soil_note_en = ""
        soil_note_ta = ""
        soil_note_hi = ""

        if "sandy" in soil_type_norm:
            # Sandy soils suffer nitrogen & potassium leaching
            base_n *= 1.10
            base_k *= 1.10
            soil_note_en = "Sandy soil prone to leaching: split nitrogen into more frequent doses."
            soil_note_ta = "மணல் பாங்கான நிலத்தில் சத்துக்கள் விரைவில் அடித்துச் செல்லப்படுவதால், தழைச்சத்தை பல தவணைகளாகப் பிரித்து இடவும்."
            soil_note_hi = "बलुई मिट्टी में पोषक तत्व जल्दी बह जाते हैं, अतः नाइट्रोजन को कई बार में दें।"
        elif "clay" in soil_type_norm:
            # Clay soil holds nutrients well, but can lock phosphorus
            soil_note_en = "Heavy clay soil: ensure adequate drainage; phosphorus is held securely."
            soil_note_ta = "களிமண் நிலம் சத்துக்களை நன்றாகப் பிடித்து வைத்துக்கொள்ளும்; நல்ல வடிகால் வசதி மிக முக்கியம்."
            soil_note_hi = "मटियार मिट्टी पोषक तत्वों को अच्छी तरह रोकती है; जल निकासी का ध्यान रखें।"
        elif "red" in soil_type_norm:
            soil_note_en = "Red loam: moderately acidic to neutral; single super phosphate (SSP) works best."
            soil_note_ta = "செம்மண் நிலம்: மணிச்சத்திற்கு சிங்கிள் சூப்பர் பாஸ்பேட் (SSP) மிகவும் ஏற்றது."
            soil_note_hi = "लाल दोमट मिट्टी: सिंगल सुपर फॉस्फेट (SSP) का प्रयोग सबसे उत्तम रहता है।"

        # Adjust for Soil Test results if available
        if req.soil_tested and req.soil_ph:
            if req.soil_ph < 6.0:
                soil_note_en += f" Soil pH ({req.soil_ph}) is acidic: apply Agricultural Lime / Dolomite @ {int(200 * ha)} kg before basal fertilizer."
                soil_note_ta += f" மண்ணின் pH ({req.soil_ph}) அமிலத்தன்மை கொண்டது: அடி உரம் இடுவதற்கு முன் {int(200 * ha)} கிலோ விவசாய சுண்ணாம்பு இடவும்."
                soil_note_hi += f" मिट्टी का pH ({req.soil_ph}) अम्लीय है: बुवाई से पहले {int(200 * ha)} किग्रा कृषि चूना डालें।"
            elif req.soil_ph > 8.0:
                soil_note_en += f" Soil pH ({req.soil_ph}) is alkaline: apply Gypsum @ {int(250 * ha)} kg to loosen soil and improve phosphorus availability."
                soil_note_ta += f" மண்ணின் pH ({req.soil_ph}) காரத்தன்மை கொண்டது: {int(250 * ha)} கிலோ ஜிப்சம் இடவும்."
                soil_note_hi += f" मिट्टी का pH ({req.soil_ph}) क्षारीय है: {int(250 * ha)} किग्रा जिप्सम का प्रयोग करें।"

        # Deduct already applied fertilizers (Question 7)
        already_applied_summary_en = []
        already_applied_summary_ta = []
        already_applied_summary_hi = []
        deducted_n = 0.0
        deducted_p = 0.0
        deducted_k = 0.0

        if req.already_applied and req.applied_fertilizers:
            for item in req.applied_fertilizers:
                if isinstance(item, dict):
                    name = str(item.get("name") or "").lower()
                    unit = str(item.get("unit") or "kg").lower()
                    try:
                        qty = float(item.get("quantity_kg", 0.0) or 0.0)
                    except (ValueError, TypeError):
                        qty = 0.0
                else:
                    name = str(getattr(item, "name", "") or "").lower()
                    unit = str(getattr(item, "unit", "kg") or "kg").lower()
                    try:
                        qty = float(getattr(item, "quantity_kg", 0.0) or 0.0)
                    except (ValueError, TypeError):
                        qty = 0.0
                if "bag" in unit:
                    qty = qty * (45.0 if "urea" in name else 50.0)
                elif "ton" in unit:
                    qty = qty * 1000.0
                if "urea" in name:
                    n_content = qty * 0.46
                    deducted_n += n_content
                    already_applied_summary_en.append(f"Deducted {n_content:.1f} kg N from previously applied Urea ({qty} kg)")
                    already_applied_summary_ta.append(f"ஏற்கனவே இட்ட யூரியா ({qty} கிலோ) மூலம் {n_content:.1f} கிலோ தழைச்சத்து கழிக்கப்பட்டது")
                    already_applied_summary_hi.append(f"पहले दिए गए यूरिया ({qty} किग्रा) से {n_content:.1f} किग्रा N घटाया गया")
                elif "dap" in name:
                    n_content = qty * 0.18
                    p_content = qty * 0.46
                    deducted_n += n_content
                    deducted_p += p_content
                    already_applied_summary_en.append(f"Deducted DAP nutrient contribution ({qty} kg)")
                    already_applied_summary_ta.append(f"ஏற்கனவே இட்ட டிஏபி ({qty} கிலோ) சத்துக்கள் கழிக்கப்பட்டன")
                    already_applied_summary_hi.append(f"पहले दिए गए डीएपी ({qty} किग्रा) के पोषक तत्व घटाए गए")
                elif "mop" in name or "potash" in name:
                    k_content = qty * 0.60
                    deducted_k += k_content
                    already_applied_summary_en.append(f"Deducted Potash nutrient contribution ({qty} kg)")
                    already_applied_summary_ta.append(f"ஏற்கனவே இட்ட பொட்டாஷ் ({qty} கிலோ) சத்துக்கள் கழிக்கப்பட்டன")
                    already_applied_summary_hi.append(f"पहले दिए गए पोटाश ({qty} किग्रा) के पोषक तत्व घटाए गए")

        net_n = max(5.0, base_n - deducted_n)
        net_p = max(5.0, base_p - deducted_p)
        net_k = max(5.0, base_k - deducted_k)

        # Convert net elemental N, P, K into commercial fertilizer products
        # Urea (46% N), SSP (16% P2O5), MOP (60% K2O)
        urea_needed_kg = round(net_n / 0.46, 1)
        ssp_needed_kg = round(net_p / 0.16, 1)
        mop_needed_kg = round(net_k / 0.60, 1)

        # Organic inputs: Farmyard Manure (FYM), Vermicompost, Bio-fertilizer
        fym_tonnes = round(crop["fym_ton_ha"] * ha, 2)
        vermicompost_kg = round(1000 * ha, 1)
        neem_cake_kg = round(150 * ha, 1)
        biofert_kg = max(2.0, round(5 * ha, 1))

        # Check Plant Symptoms (Question 9)
        deficiencies_diagnosed_en = []
        deficiencies_diagnosed_ta = []
        deficiencies_diagnosed_hi = []
        foliar_sprays_en = []
        foliar_sprays_ta = []
        foliar_sprays_hi = []

        for prob in req.plant_problems:
            prob_lower = prob.lower()
            if "yellow" in prob_lower:
                deficiencies_diagnosed_en.append("Nitrogen (N) or Iron deficiency suspected due to yellow foliar chlorosis.")
                deficiencies_diagnosed_ta.append("இலை மஞ்சளாதல் காரணமாக தழைச்சத்து (N) அல்லது இரும்புச்சத்து குறைபாடு இருக்கலாம்.")
                deficiencies_diagnosed_hi.append("पत्तियों का पीलापन नाइट्रोजन या लौह तत्व की कमी का संकेत हो सकता है।")
                foliar_sprays_en.append("Emergency foliar spray: 1% Urea (10 g/L) + micronutrient mixture to quickly correct chlorosis.")
                foliar_sprays_ta.append("அவசர இலைவழி தெளிப்பு: 1% யூரியா (10 கிராம்/லிட்டர்) + நுண்ணூட்டக் கலவை தெளிக்கவும்.")
                foliar_sprays_hi.append("पत्तियों पर 1% यूरिया (10 ग्राम/ली) + सूक्ष्म पोषक तत्वों का छिड़काव करें।")
            elif "flower" in prob_lower:
                deficiencies_diagnosed_en.append("Phosphorus or Boron deficiency suspected due to poor flowering and flower drop.")
                deficiencies_diagnosed_ta.append("பூக்கள் உதிர்தல் மற்றும் போதிய பூக்கள் இல்லாமை போரான் அல்லது மணிச்சத்து குறைபாட்டைக் குறிக்கிறது.")
                deficiencies_diagnosed_hi.append("कम फूल आना या फूलों का गिरना बोरोन या फॉस्फोरस की कमी दर्शाता है।")
                foliar_sprays_en.append("Spray Boron 20% (Solubor) @ 1 g/L and Planofix @ 0.25 mL/L at first flowering.")
                foliar_sprays_ta.append("பூக்கும் தருணத்தில் போரான் (Solubor) 1 கிராம்/லிட்டர் மற்றும் பிளனோபிக்ஸ் தெளிக்கவும்.")
                foliar_sprays_hi.append("फूल आने पर बोरोन 20% (1 ग्राम/ली) का छिड़काव करें।")
            elif "fruit" in prob_lower:
                deficiencies_diagnosed_en.append("Potassium (K) deficiency suspected affecting fruit size and quality.")
                deficiencies_diagnosed_ta.append("காய் உருவாவதில் குறைபாடு இருப்பது சாம்பல் சத்து (K) பற்றாக்குறையைக் காட்டுகிறது.")
                deficiencies_diagnosed_hi.append("फलों का विकास रुकना पोटाश (K) की कमी का संकेत है।")
                foliar_sprays_en.append("Spray Potassium Nitrate (13:0:45) @ 5 g/L during fruit enlargement.")
                foliar_sprays_ta.append("காய் பிடிக்கும் போது பொட்டாசியம் நைட்ரேட் (13:0:45) 5 கிராம்/லிட்டர் தெளிக்கவும்.")
                foliar_sprays_hi.append("फल बनने के समय पोटेशियम नाइट्रेट (13:0:45) 5 ग्राम/ली का छिड़काव करें।")
            elif "slow" in prob_lower:
                deficiencies_diagnosed_en.append("General root stress and phosphorus deficiency causing slow stunted growth.")
                deficiencies_diagnosed_ta.append("வேர் வளர்ச்சி குன்றி வளர்ச்சி தாமதமாவதால் மணிச்சத்து மற்றும் உயிர் உரம் தேவை.")
                deficiencies_diagnosed_hi.append("धीमी वृद्धि जड़ों की कमजोरी और फॉस्फोरस की कमी की वजह से हो सकती है।")

        # Compile Organic Plan
        organic_plan = [
            {
                "fertilizer_name_en": "Well-Decomposed Farmyard Manure (FYM)",
                "fertilizer_name_ta": "நன்கு மக்கிய தொழு உரம்",
                "fertilizer_name_hi": "सड़ी हुई गोबर की खाद (FYM)",
                "quantity": f"{fym_tonnes} tonnes" if fym_tonnes >= 1 else f"{int(fym_tonnes * 1000)} kg",
                "purpose_en": "Improves soil humus, moisture holding capacity, and beneficial soil microbes.",
                "purpose_ta": "மண்ணின் மட்கிய சத்தை அதிகரித்து நீர் பிடிப்புத் திறனை உயர்த்தும்.",
                "purpose_hi": "मिट्टी की जल धारण क्षमता और जीवांश में वृद्धि करता है।",
                "timing_en": "Basal application: incorporate into soil during final ploughing 15 days before planting.",
                "timing_ta": "அடி உரமாக கடைசி உழவின் போது மண்ணுடன் கலக்கவும்.",
                "timing_hi": "अंतिम जुताई के समय खेत में अच्छी तरह मिलाएं।",
                "estimated_cost_inr": round(fym_tonnes * 1000 * FERTILIZER_PRICES["fym"])
            },
            {
                "fertilizer_name_en": "Enriched Vermicompost",
                "fertilizer_name_ta": "மண்புழு உரம்",
                "fertilizer_name_hi": "केंचुआ खाद (वर्मीकम्पोस्ट)",
                "quantity": f"{vermicompost_kg} kg",
                "purpose_en": "Rich in plant-available enzymes, secondary nutrients, and micronutrients.",
                "purpose_ta": "செடிகளுக்குத் தேவையான என்சைம்கள் மற்றும் நுண்ணூட்டங்களை உடனடியாக அளிக்கும்.",
                "purpose_hi": "पौधों को सुलभ सूक्ष्म पोषक तत्व और एंजाइम प्रदान करता है।",
                "timing_en": "Apply around plant root zone at 25-30 days after planting.",
                "timing_ta": "நட்ட 25-30 வது நாளில் வேர்ப்பகுதியில் இட்டு மண் அணைக்கவும்.",
                "timing_hi": "बुवाई के 25-30 दिन बाद जड़ों के पास डालें।",
                "estimated_cost_inr": round(vermicompost_kg * FERTILIZER_PRICES["vermicompost"])
            },
            {
                "fertilizer_name_en": "Neem Cake (De-oiled)",
                "fertilizer_name_ta": "வேப்பம் பிண்ணாக்கு",
                "fertilizer_name_hi": "नीम की खली",
                "quantity": f"{neem_cake_kg} kg",
                "purpose_en": "Slows down nitrogen volatilization and repels soil-borne nematodes and termites.",
                "purpose_ta": "தழைச்சத்து ஆவியாவதைத் தடுத்து நூற்புழு மற்றும் கரையான் தாக்குதலைக் கட்டுப்படுத்தும்.",
                "purpose_hi": "नाइट्रोजन का क्षरण रोकता है तथा दीमक व सूत्रकृमि से सुरक्षा देता है।",
                "timing_en": "Mix with basal manure at planting.",
                "timing_ta": "அடி உரத்துடன் கலந்து விதைப்பதற்கு முன் இடவும்.",
                "timing_hi": "बुवाई के समय गोबर की खाद के साथ मिलाकर दें।",
                "estimated_cost_inr": round(neem_cake_kg * FERTILIZER_PRICES["neem_cake"])
            },
            {
                "fertilizer_name_en": "Biofertilizers (Azospirillum + Phosphobacteria)",
                "fertilizer_name_ta": "உயிர் உரங்கள் (அசோஸ்பைரில்லம் + பாஸ்போபாக்டீரியா)",
                "fertilizer_name_hi": "जैव उर्वरक (एज़ोस्पिरिलम + फॉस्फोबैक्टीरिया)",
                "quantity": f"{biofert_kg} kg",
                "purpose_en": "Fixes atmospheric nitrogen and solubilizes locked soil phosphorus.",
                "purpose_ta": "காற்றிலுள்ள தழைச்சத்தை நிலைநிறுத்தி, மண்ணில் உள்ள மணிச்சத்தை கரைத்து செடிக்கு அளிக்கும்.",
                "purpose_hi": "हवा से नाइट्रोजन खींचता है और मिट्टी के फॉस्फोरस को घुलनशील बनाता है।",
                "timing_en": "Mix with moist vermicompost and broadcast in moist soil.",
                "timing_ta": "ஈரமான மண்புழு உரத்துடன் கலந்து மண்ணில் ஈரம் இருக்கும் போது இடவும்.",
                "timing_hi": "नमी वाले खेत में केंचुआ खाद के साथ मिलाकर बुरकाव करें।",
                "estimated_cost_inr": round(biofert_kg * FERTILIZER_PRICES["biofertilizer"])
            }
        ]

        # Compile Chemical Plan
        chemical_plan = [
            {
                "fertilizer_name_en": "Neem Coated Urea (46% N)",
                "fertilizer_name_ta": "வேப்பம் பூசிய யூரியா (46% N)",
                "fertilizer_name_hi": "नीम लेपित यूरिया (46% N)",
                "quantity": f"{urea_needed_kg} kg",
                "purpose_en": "Essential for rapid vegetative growth, chlorophyll synthesis, and leafy canopy.",
                "purpose_ta": "இலைகளின் வளர்ச்சி, பச்சைய உருவாக்கம் மற்றும் புதிய கிளைகள் தோன்றுவதற்கு அத்தியாவசியம்.",
                "purpose_hi": "वानस्पतिक वृद्धि, हरियाली और तने के विकास के लिए आवश्यक।",
                "timing_en": "Apply in 2 to 3 equal splits (Basal, 30 days, 45 days) to minimize leaching.",
                "timing_ta": "2 அல்லது 3 சம தவணைகளாகப் பிரித்து (அடி உரம், 30-ம் நாள், 45-ம் நாள்) இடவும்.",
                "timing_hi": "2 से 3 बराबर किस्तों में दें ताकि खाद बर्बाद न हो।",
                "estimated_cost_inr": round(urea_needed_kg * FERTILIZER_PRICES["urea"])
            },
            {
                "fertilizer_name_en": "Single Super Phosphate - SSP (16% P2O5 + 11% Sulphur)",
                "fertilizer_name_ta": "சிங்கிள் சூப்பர் பாஸ்பேட் - SSP (16% P2O5)",
                "fertilizer_name_hi": "सिंगल सुपर फॉस्फेट - SSP",
                "quantity": f"{ssp_needed_kg} kg",
                "purpose_en": "Promotes deep root development, vigorous flowering, and early maturity. Supplies vital Sulphur.",
                "purpose_ta": "ஆழமான வேர் வளர்ச்சி, நிறைந்த பூக்கள் மற்றும் சீரான முதிர்ச்சிக்கு உதவும்.",
                "purpose_hi": "मजबूत जड़ों, अधिक फूलों और फसल के पकने के लिए जरूरी है।",
                "timing_en": "100% as basal application at final land preparation near root depth.",
                "timing_ta": "100% முழு அளவையும் அடி உரமாக விதைக்கும் போது வேர்ப்பகுதியில் இடவும்.",
                "timing_hi": "100% मात्रा बुवाई के समय जड़ों की गहराई में दें।",
                "estimated_cost_inr": round(ssp_needed_kg * FERTILIZER_PRICES["ssp"])
            },
            {
                "fertilizer_name_en": "Muriate of Potash - MOP (60% K2O)",
                "fertilizer_name_ta": "மியூரியேட் ஆப் பொட்டாஷ் - MOP (60% K2O)",
                "fertilizer_name_hi": "म्यूरेट ऑफ पोटाश - MOP",
                "quantity": f"{mop_needed_kg} kg",
                "purpose_en": "Strengthens stem against lodging, improves drought tolerance, pest resistance, and fruit weight.",
                "purpose_ta": "செடி சாயாமல் தாங்குதல், வறட்சி மற்றும் நோய் எதிர்ப்புத் திறன், காய் திரட்சிக்கு உதவும்.",
                "purpose_hi": "पौधे को कीट-रोग व सूखे से लड़ने की ताकत और फलों को चमक व वजन देता है।",
                "timing_en": "Apply 50% basal and 50% at flowering stage.",
                "timing_ta": "50% அடி உரமாக, மீதி 50% பூக்கும் தருணத்தில் இடவும்.",
                "timing_hi": "50% बुवाई पर और 50% फूल आने की अवस्था में दें।",
                "estimated_cost_inr": round(mop_needed_kg * FERTILIZER_PRICES["mop"])
            }
        ]

        # Calculate Total Estimated Cost based on Preference (Question 10)
        pref_norm = str(req.fertilizer_preference or "both").lower()
        active_plan_items = []

        if "organic" in pref_norm and "chemical" not in pref_norm and "both" not in pref_norm:
            active_plan_items = organic_plan
            est_cost = sum(item["estimated_cost_inr"] for item in organic_plan)
        elif "chemical" in pref_norm and "organic" not in pref_norm and "both" not in pref_norm:
            active_plan_items = chemical_plan
            est_cost = sum(item["estimated_cost_inr"] for item in chemical_plan)
        else: # Both Organic and Chemical (Integrated Nutrient Management)
            active_plan_items = organic_plan + chemical_plan
            est_cost = sum(item["estimated_cost_inr"] for item in active_plan_items)

        try:
            budget = float(req.fertilizer_budget_inr if req.fertilizer_budget_inr is not None else 5000.0)
            if budget <= 0:
                budget = 5000.0
        except (ValueError, TypeError):
            budget = 5000.0

        is_within_budget = est_cost <= budget
        budget_diff = abs(est_cost - budget)

        budget_comp_en = (
            f"Estimated total cost is ₹{est_cost:,.0f}, which is within your stated budget of ₹{budget:,.0f} (Savings: ₹{budget_diff:,.0f})."
            if is_within_budget else
            f"Estimated total cost is ₹{est_cost:,.0f}, which exceeds your stated budget of ₹{budget:,.0f} by ₹{budget_diff:,.0f}."
        )
        budget_comp_ta = (
            f"மதிப்பிடப்பட்ட மொத்த செலவு ₹{est_cost:,.0f}, இது உங்கள் ₹{budget:,.0f} பட்ஜெட்டுக்குள் அடங்குகிறது (மீதம்: ₹{budget_diff:,.0f})."
            if is_within_budget else
            f"மதிப்பிடப்பட்ட மொத்த செலவு ₹{est_cost:,.0f}, இது உங்கள் பட்ஜெட்டான ₹{budget:,.0f}-ஐ விட ₹{budget_diff:,.0f} அதிகமாக உள்ளது."
        )
        budget_comp_hi = (
            f"अनुमानित कुल लागत ₹{est_cost:,.0f} है, जो आपके बजट ₹{budget:,.0f} के भीतर है (बचत: ₹{budget_diff:,.0f})।"
            if is_within_budget else
            f"अनुमानित कुल लागत ₹{est_cost:,.0f} है, जो आपके बजट ₹{budget:,.0f} से ₹{budget_diff:,.0f} अधिक है।"
        )

        # Budget friendly alternatives if cost exceeds budget
        budget_alternatives_en = [
            "Use on-farm cow dung and compost instead of commercial FYM to save up to ₹1,500/acre.",
            "Choose Single Super Phosphate (SSP) instead of costly DAP; SSP supplies both Phosphorus and Sulphur.",
            "Apply Urea through fertigation or localized ring placement rather than broadcasting to reduce fertilizer wastage by 30%."
        ]
        budget_alternatives_ta = [
            "வெளிச்சந்தையில் தொழு உரம் வாங்குவதற்குப் பதிலாக பண்ணைக் கழிவு மற்றும் மாட்டுச் சாண உரத்தைப் பயன்படுத்துங்கள்.",
            "விலை உயர்ந்த டிஏபிக்கு பதிலாக சிங்கிள் சூப்பர் பாஸ்பேட் (SSP) பயன்படுத்துங்கள்; இது கந்தக சத்தையும் இலவசமாக வழங்குகிறது.",
            "யூரியாவை முழு வயலிலும் இறைக்காமல் செடியின் வேர்ப்பகுதியில் வளையமிட்டு இடுவதன் மூலம் 30% உரச் செலவைக் குறைக்கலாம்."
        ]
        budget_alternatives_hi = [
            "बाजार से खरीदने के बजाय घर की गोबर खाद व कंपोस्ट का प्रयोग कर खर्च घटाएं।",
            "डीएपी के स्थान पर सिंगल सुपर फॉस्फेट (SSP) का प्रयोग करें, जो सस्ता और गंधक युक्त है।",
            "यूरिया को फेंकने के बजाय पौधों की जड़ों के पास डालें, जिससे 30% बर्बादी बचती है।"
        ]

        # Stage-wise Application Schedule (Basal, Vegetative, Flowering, Fruiting)
        schedule = [
            {
                "stage_en": "Basal Application (At Sowing / Planting)",
                "stage_ta": "அடி உரம் (விதைக்கும் / நடும் போது)",
                "stage_hi": "बुवाई / रोपाई के समय (बेसल डोज)",
                "timing_en": f"Days 0 to 7 ({crop['stages'][0]})",
                "timing_ta": f"0 முதல் 7 நாட்கள் ({crop['stages'][0]})",
                "timing_hi": f"0 से 7 दिन ({crop['stages'][0]})",
                "organic_action_en": f"Apply {fym_tonnes} t FYM, {neem_cake_kg} kg Neem Cake, and {biofert_kg} kg Bio-fertilizer.",
                "organic_action_ta": f"{fym_tonnes} டன் தொழு உரம், {neem_cake_kg} கிலோ வேப்பம் பிண்ணாக்கு, {biofert_kg} கிலோ உயிர் உரம் இடவும்.",
                "organic_action_hi": f"{fym_tonnes} टन गोबर खाद, {neem_cake_kg} किग्रा नीम खली और {biofert_kg} किग्रा जैव उर्वरक दें।",
                "chemical_action_en": f"Apply {round(urea_needed_kg * 0.25, 1)} kg Urea, all {ssp_needed_kg} kg SSP, and {round(mop_needed_kg * 0.50, 1)} kg MOP.",
                "chemical_action_ta": f"{round(urea_needed_kg * 0.25, 1)} கிலோ யூரியா, முழு {ssp_needed_kg} கிலோ SSP, மற்றும் {round(mop_needed_kg * 0.50, 1)} கிலோ MOP இடவும்.",
                "chemical_action_hi": f"{round(urea_needed_kg * 0.25, 1)} किग्रा यूरिया, पूरा {ssp_needed_kg} किग्रा SSP और {round(mop_needed_kg * 0.50, 1)} किग्रा MOP डालें।"
            },
            {
                "stage_en": "First Top Dressing (Vegetative Growth)",
                "stage_ta": "முதல் மேலுரம் (செடி வளர்ச்சிப் பருவம்)",
                "stage_hi": "पहला टॉप ड्रेसिंग (वानस्पतिक वृद्धि)",
                "timing_en": f"Day 25 to 35 after planting ({crop['stages'][1] if len(crop['stages']) > 1 else 'Vegetative'})",
                "timing_ta": f"நட்ட 25 முதல் 35 நாட்கள் ({crop['stages'][1] if len(crop['stages']) > 1 else 'வளர்ச்சி'})",
                "timing_hi": f"रोपाई के 25 से 35 दिन बाद ({crop['stages'][1] if len(crop['stages']) > 1 else 'वृद्धि'})",
                "organic_action_en": f"Apply {vermicompost_kg} kg Vermicompost near root zone after hand weeding.",
                "organic_action_ta": f"களை எடுத்த பின் வேர்ப்பகுதியில் {vermicompost_kg} கிலோ மண்புழு உரம் இடவும்.",
                "organic_action_hi": f"निराई के बाद जड़ों के पास {vermicompost_kg} किग्रा केंचुआ खाद डालें।",
                "chemical_action_en": f"Top dress {round(urea_needed_kg * 0.40, 1)} kg Urea in moist soil.",
                "chemical_action_ta": f"மண்ணில் ஈரம் இருக்கும் போது {round(urea_needed_kg * 0.40, 1)} கிலோ யூரியா மேலுரமாக இடவும்.",
                "chemical_action_hi": f"खेत में पर्याप्त नमी होने पर {round(urea_needed_kg * 0.40, 1)} किग्रा यूरिया का बुरकाव करें।"
            },
            {
                "stage_en": "Second Top Dressing (Flowering & Fruit Set)",
                "stage_ta": "இரண்டாம் மேலுரம் (பூக்கும் & பிஞ்சுப் பருவம்)",
                "stage_hi": "दूसरा टॉप ड्रेसिंग (फूल व फल बनने पर)",
                "timing_en": f"Day 45 to 60 after planting ({crop['stages'][2] if len(crop['stages']) > 2 else 'Flowering'})",
                "timing_ta": f"நட்ட 45 முதல் 60 நாட்கள் ({crop['stages'][2] if len(crop['stages']) > 2 else 'பூக்கும் பருவம்'})",
                "timing_hi": f"रोपाई के 45 से 60 दिन बाद ({crop['stages'][2] if len(crop['stages']) > 2 else 'फूल अवस्था'})",
                "organic_action_en": "Foliar spray of Panchagavya 3% (30 mL/L) or Fish Amino Acid.",
                "organic_action_ta": "3% பஞ்சகவ்யா (30 மி.லி/லிட்டர்) அல்லது மீன் அமிலம் இலைகளில் தெளிக்கவும்.",
                "organic_action_hi": "3% पंचगव्य (30 मि.ली/लीटर) का पत्तियों पर छिड़काव करें।",
                "chemical_action_en": f"Apply remaining {round(urea_needed_kg * 0.35, 1)} kg Urea and {round(mop_needed_kg * 0.50, 1)} kg MOP.",
                "chemical_action_ta": f"மீதமுள்ள {round(urea_needed_kg * 0.35, 1)} கிலோ யூரியா மற்றும் {round(mop_needed_kg * 0.50, 1)} கிலோ MOP இடவும்.",
                "chemical_action_hi": f"बचा हुआ {round(urea_needed_kg * 0.35, 1)} किग्रा यूरिया और {round(mop_needed_kg * 0.50, 1)} किग्रा MOP दें।"
            }
        ]

        # Important Precautions
        precautions_en = [
            "Safe Handling: Always wear gloves and wash hands thoroughly after handling chemical fertilizers.",
            "Avoid Leaching: Do not apply heavy doses of Nitrogen (Urea) prior to heavy rains or in dry soil without subsequent light irrigation.",
            "Storage: Store fertilizers in a cool, dry, well-ventilated shed elevated on wooden pallets away from moisture.",
            "Soil Testing: Visual leaf symptoms like yellowing can stem from waterlogging, viral infection, or nematode damage. A laboratory soil test every 2 years provides exact scientific calibration.",
            "Price Disclaimer: Estimated costs reflect indicative retail prices. Actual market rates may vary based on local dealer stock and transport."
        ]
        precautions_ta = [
            "பாதுகாப்பான கையாளுதல்: உரங்களைக் கையாளும் போது கையுறைகளை அணியவும்; பின்னர் கைகளை சோப்பால் நன்கு கழுவவும்.",
            "கரைந்து வீணாவதைத் தவிர்க்க: கனமழைக்கு முன்னரோ அல்லது ஈரமில்லாத வறண்ட நிலத்திலோ யூரியாவை ஒரேயடியாக இட வேண்டாம்.",
            "சேமிப்பு முறை: உர மூட்டைகளை ஈரப்பதம் படாதவாறு மரப்பலகை மீது உலர்ந்த இடத்தில் சேமித்து வைக்கவும்.",
            "மண் பரிசோதனை: இலை மஞ்சளாதல் நீர் தேங்குவதாலும் அல்லது வைரஸ் நோயாலும் ஏற்படலாம். 2 வருடத்திற்கு ஒருமுறை மண் பரிசோதனை செய்வது மிக அவசியம்.",
            "விலை குறித்த குறிப்பு: மதிப்பீட்டு விலை அரசாங்க மானிய அடிப்படையிலானது. உள்ளூர் சில்லறை விற்பனை நிலையங்களில் விலை மாறுபடலாம்."
        ]
        precautions_hi = [
            "सुरक्षा: रासायनिक खाद का प्रयोग करते समय दस्ताने पहनें और कार्य के बाद हाथ अच्छी तरह धोएं।",
            "खाद की बर्बादी से बचाव: तेज बारिश से ठीक पहले या सूखी मिट्टी में यूरिया न डालें।",
            "भंडारण: खाद की बोरियों को सीलन से दूर लकड़ी के तख्तों पर सूखे व हवादार स्थान पर रखें।",
            "मिट्टी जांच: पत्तियों का पीलापन जलभराव या बीमारी से भी हो सकता है। 2 वर्ष में एक बार मिट्टी परीक्षण अवश्य कराएं।",
            "कीमत अस्वीकरण: अनुमानित लागत सरकारी दरों पर आधारित है। स्थानीय बाजार में दाम थोड़े भिन्न हो सकते हैं।"
        ]

        # Spoken Summary formulation for speech synthesis
        spoken_text_en = (
            f"Fertilizer recommendation for {crop['name_en']}, land area {req.land_area} {req.land_unit}. "
            f"Current growth stage is {req.growth_stage}. "
            f"Recommended baseline includes {fym_tonnes} tonnes of compost, {urea_needed_kg} kg Urea, "
            f"{ssp_needed_kg} kg Single Super Phosphate, and {mop_needed_kg} kg Potash. "
            f"Estimated total cost is {est_cost} Rupees. "
            f"{budget_comp_en}"
        )
        spoken_text_ta = (
            f"{crop['name_ta']} பயிரின் {req.land_area} {req.land_unit} நிலத்திற்கான உரப் பரிந்துரை. "
            f"தற்போதைய வளர்ச்சிப் பருவம் {req.growth_stage}. "
            f"பரிந்துரைக்கப்படும் உரங்கள்: {fym_tonnes} டன் தொழு உரம், {urea_needed_kg} கிலோ யூரியா, "
            f"{ssp_needed_kg} கிலோ சூப்பர் பாஸ்பேட் மற்றும் {mop_needed_kg} கிலோ பொட்டாஷ். "
            f"மதிப்பிடப்பட்ட மொத்த செலவு {est_cost} ரூபாய். "
            f"{budget_comp_ta}"
        )
        spoken_text_hi = (
            f"{crop['name_hi']} की फसल, क्षेत्रफल {req.land_area} {req.land_unit} के लिए खाद की सिफारिश। "
            f"वर्तमान अवस्था {req.growth_stage} है। "
            f"अनुशंसित खाद: {fym_tonnes} टन गोबर खाद, {urea_needed_kg} किग्रा यूरिया, "
            f"{ssp_needed_kg} किग्रा सुपर फॉस्फेट और {mop_needed_kg} किग्रा पोटाश। "
            f"अनुमानित कुल लागत {est_cost} रुपये है। "
            f"{budget_comp_hi}"
        )

        return {
            "success": True,
            "crop_id": crop_key,
            "crop_info": {
                "name_en": crop["name_en"],
                "name_ta": crop["name_ta"],
                "name_hi": crop["name_hi"],
                "growth_stage": req.growth_stage,
                "soil_type": req.soil_type,
                "soil_note_en": soil_note_en,
                "soil_note_ta": soil_note_ta,
                "soil_note_hi": soil_note_hi,
                "land_area": req.land_area,
                "land_unit": req.land_unit,
                "land_area_hectares": round(ha, 3),
                "land_area_acres": round(acres, 2),
                "crop_age_days": req.crop_age_days,
                "fertilizer_budget_inr": req.fertilizer_budget_inr,
                "irrigation_method": req.irrigation_method,
                "location": {
                    "state": req.state or "Tamil Nadu",
                    "district": req.district or "Thanjavur",
                    "village": req.village or ""
                }
            },
            "soil_test_info": {
                "tested": req.soil_tested,
                "ph": req.soil_ph,
                "nitrogen": req.soil_nitrogen,
                "phosphorus": req.soil_phosphorus,
                "potassium": req.soil_potassium
            },
            "deductions_applied": {
                "has_deductions": len(already_applied_summary_en) > 0,
                "notes_en": already_applied_summary_en,
                "notes_ta": already_applied_summary_ta,
                "notes_hi": already_applied_summary_hi
            },
            "nutrient_deficiencies_detected": {
                "detected": len(deficiencies_diagnosed_en) > 0,
                "diagnoses_en": deficiencies_diagnosed_en,
                "diagnoses_ta": deficiencies_diagnosed_ta,
                "diagnoses_hi": deficiencies_diagnosed_hi,
                "foliar_sprays_en": foliar_sprays_en,
                "foliar_sprays_ta": foliar_sprays_ta,
                "foliar_sprays_hi": foliar_sprays_hi
            },
            "preference": req.fertilizer_preference,
            "organic_plan": organic_plan,
            "chemical_plan": chemical_plan,
            "active_plan_items": active_plan_items,
            "schedule": schedule,
            "cost_analysis": {
                "estimated_total_cost_inr": est_cost,
                "budget_inr": budget,
                "is_within_budget": is_within_budget,
                "comparison_en": budget_comp_en,
                "comparison_ta": budget_comp_ta,
                "comparison_hi": budget_comp_hi,
                "budget_alternatives_en": budget_alternatives_en,
                "budget_alternatives_ta": budget_alternatives_ta,
                "budget_alternatives_hi": budget_alternatives_hi
            },
            "precautions_en": precautions_en,
            "precautions_ta": precautions_ta,
            "precautions_hi": precautions_hi,
            "spoken_text_en": spoken_text_en,
            "spoken_text_ta": spoken_text_ta,
            "spoken_text_hi": spoken_text_hi,
            "reference": "TNAU Agritech Portal & ICAR Recommended Fertilizer Schedules"
        }

fertilizer_engine = FertilizerEngine()
