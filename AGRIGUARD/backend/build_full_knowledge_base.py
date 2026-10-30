"""
Build complete knowledge_base.py for AGRIGUARD backend
Includes verified entries for all 38 PlantVillage categories and existing AGRIGUARD crops.
"""
import os
import sys

# Read the bottom part of existing knowledge_base.py
with open('app/data/knowledge_base.py', 'r', encoding='utf-8') as f:
    orig = f.read()

fg_idx = orig.find('FERTILIZER_GUIDELINES =')
if fg_idx == -1:
    raise ValueError("Could not find FERTILIZER_GUIDELINES in existing knowledge_base.py")

fertilizer_section = orig[fg_idx:]

script_content = '''"""
AGRIGUARD Agricultural Knowledge Base
Curated from Tamil Nadu Agricultural University (TNAU) Agritech Portal, ICAR institutes
(IIMR, IIVR, CPRI, CITH, NRCG, CCRI, IISR), and Central Insecticides Board & Registration Committee (CIBRC).
Supports comprehensive English, Tamil, and Hindi agricultural information for all 38 PlantVillage classes.
"""

CROPS = {
    "tomato": {
        "id": "tomato",
        "name_en": "Tomato",
        "name_ta": "தக்காளி",
        "name_hi": "टमाटर",
        "scientific_name": "Solanum lycopersicum",
        "water_requirement_mm": "400 - 600",
        "soil_types": ["Red Loam", "Clay Loam", "Black Soil"],
        "stages": ["Germination & Nursery", "Vegetative", "Flowering", "Fruit Formation & Harvest"],
        "kc_stages": {"Vegetative": 0.6, "Flowering": 1.15, "Harvest": 0.8},
        "npk_recommended_kg_ha": "150:100:50",
    },
    "corn": {
        "id": "corn",
        "name_en": "Corn / Maize",
        "name_ta": "மக்காச்சோளம்",
        "name_hi": "मक्का",
        "scientific_name": "Zea mays",
        "water_requirement_mm": "500 - 600",
        "soil_types": ["Well-drained Loam", "Red Soil", "Alluvial Loam"],
        "stages": ["Seedling", "Knee-high", "Tasseling & Silking", "Grain Filling", "Maturity"],
        "kc_stages": {"Knee-high": 0.7, "Tasseling & Silking": 1.2, "Grain Filling": 1.0},
        "npk_recommended_kg_ha": "135:62.5:50",
    },
    "potato": {
        "id": "potato",
        "name_en": "Potato",
        "name_ta": "உருளைக்கிழங்கு",
        "name_hi": "आलू",
        "scientific_name": "Solanum tuberosum",
        "water_requirement_mm": "450 - 550",
        "soil_types": ["Sandy Loam", "Silt Loam"],
        "stages": ["Sprouting", "Vegetative Growth", "Tuber Initiation", "Tuber Bulking & Maturity"],
        "kc_stages": {"Vegetative Growth": 0.5, "Tuber Bulking": 1.15, "Maturity": 0.75},
        "npk_recommended_kg_ha": "120:120:120",
    },
    "chilli": {
        "id": "chilli",
        "name_en": "Chilli / Bell Pepper",
        "name_ta": "மிளகாய் / குடைமிளகாய்",
        "name_hi": "मिर्च / शिमला मिर्च",
        "scientific_name": "Capsicum annuum",
        "water_requirement_mm": "500 - 650",
        "soil_types": ["Black Loam", "Red Loam", "Sandy Loam"],
        "stages": ["Nursery", "Vegetative", "Flowering & Fruit Setting", "Harvesting"],
        "kc_stages": {"Vegetative": 0.6, "Flowering & Fruit Setting": 1.1, "Harvesting": 0.85},
        "npk_recommended_kg_ha": "120:60:30",
    },
    "apple": {
        "id": "apple",
        "name_en": "Apple",
        "name_ta": "ஆப்பிள்",
        "name_hi": "सेब",
        "scientific_name": "Malus domestica",
        "water_requirement_mm": "650 - 800",
        "soil_types": ["Deep Loamy Soil", "Well-drained Clay Loam"],
        "stages": ["Dormancy", "Bud Break & Bloom", "Fruit Set", "Fruit Growth & Harvest"],
        "kc_stages": {"Bloom": 0.7, "Fruit Growth": 1.05, "Harvest": 0.8},
        "npk_recommended_kg_ha": "70:35:70",
    },
    "grape": {
        "id": "grape",
        "name_en": "Grape",
        "name_ta": "திராட்சை",
        "name_hi": "अंगूर",
        "scientific_name": "Vitis vinifera",
        "water_requirement_mm": "500 - 700",
        "soil_types": ["Gravelly Sandy Loam", "Well-drained Red Sandy Loam"],
        "stages": ["Pruning & Sprouting", "Flowering & Berry Set", "Berry Growth & Véraison", "Harvest"],
        "kc_stages": {"Flowering": 0.5, "Berry Growth": 0.85, "Harvest": 0.65},
        "npk_recommended_kg_ha": "100:60:150",
    },
    "orange": {
        "id": "orange",
        "name_en": "Orange / Citrus",
        "name_ta": "ஆரஞ்சு / எலுமிச்சை",
        "name_hi": "संतरा / नींबू वर्गीय",
        "scientific_name": "Citrus sinensis",
        "water_requirement_mm": "900 - 1200",
        "soil_types": ["Deep Red Loam", "Alluvial Sandy Loam"],
        "stages": ["Flushing & Flowering", "Fruit Set", "Fruit Enlargement", "Color Break & Harvest"],
        "kc_stages": {"Flushing": 0.7, "Fruit Enlargement": 0.8, "Harvest": 0.7},
        "npk_recommended_kg_ha": "120:40:80",
    },
    "peach": {
        "id": "peach",
        "name_en": "Peach",
        "name_ta": "பீச்",
        "name_hi": "आड़ू (पीच)",
        "scientific_name": "Prunus persica",
        "water_requirement_mm": "700 - 900",
        "soil_types": ["Sandy Loam", "Gravelly Loam"],
        "stages": ["Dormant", "Pink Bud & Bloom", "Pit Hardening", "Fruit Sizing & Harvest"],
        "kc_stages": {"Bloom": 0.6, "Fruit Sizing": 1.05, "Harvest": 0.8},
        "npk_recommended_kg_ha": "60:40:60",
    },
    "cherry": {
        "id": "cherry",
        "name_en": "Cherry",
        "name_ta": "செர்ரி",
        "name_hi": "चेरी",
        "scientific_name": "Prunus avium",
        "water_requirement_mm": "600 - 800",
        "soil_types": ["Well-drained Deep Loam", "Gravelly Loam"],
        "stages": ["Bud Swell", "Full Bloom", "Fruit Development", "Ripening & Harvest"],
        "kc_stages": {"Bloom": 0.65, "Fruit Development": 1.0, "Harvest": 0.75},
        "npk_recommended_kg_ha": "50:30:60",
    },
    "strawberry": {
        "id": "strawberry",
        "name_en": "Strawberry",
        "name_ta": "ஸ்ட்ராபெர்ரி",
        "name_hi": "स्ट्रॉबेरी",
        "scientific_name": "Fragaria ananassa",
        "water_requirement_mm": "400 - 500",
        "soil_types": ["Rich Sandy Loam with Organic Humus"],
        "stages": ["Vegetative Runnering", "Crown Growth & Flowering", "Fruit Development", "Harvest"],
        "kc_stages": {"Flowering": 0.65, "Fruit Development": 0.85, "Harvest": 0.75},
        "npk_recommended_kg_ha": "80:40:80",
    },
    "squash": {
        "id": "squash",
        "name_en": "Squash / Cucurbits",
        "name_ta": "பூசணி / சுரை",
        "name_hi": "कद्दू / स्क्वैश",
        "scientific_name": "Cucurbita pepo",
        "water_requirement_mm": "400 - 550",
        "soil_types": ["Sandy Loam", "Rich Alluvial Loam"],
        "stages": ["Seedling & Vine Extension", "Flowering & Fruit Set", "Fruit Swelling", "Harvest"],
        "kc_stages": {"Vine Extension": 0.5, "Fruit Swelling": 0.95, "Harvest": 0.75},
        "npk_recommended_kg_ha": "100:50:50",
    },
    "soybean": {
        "id": "soybean",
        "name_en": "Soybean",
        "name_ta": "சோயாபீன்",
        "name_hi": "सोयाबीन",
        "scientific_name": "Glycine max",
        "water_requirement_mm": "450 - 600",
        "soil_types": ["Well-drained Deep Loam", "Black Soil"],
        "stages": ["Emergence & Vegetative", "Flowering", "Pod Formation & Seed Fill", "Maturity"],
        "kc_stages": {"Vegetative": 0.4, "Pod Formation": 1.15, "Maturity": 0.5},
        "npk_recommended_kg_ha": "30:60:40",
    },
    "blueberry": {
        "id": "blueberry",
        "name_en": "Blueberry",
        "name_ta": "புளூபெர்ரி",
        "name_hi": "ब्लूबेरी",
        "scientific_name": "Cyanococcus",
        "water_requirement_mm": "500 - 700",
        "soil_types": ["Acidic Sandy Loam (pH 4.5 - 5.2)", "Peat Soil"],
        "stages": ["Bud Break", "Bloom", "Fruit Expansion & Color Change", "Harvest"],
        "kc_stages": {"Bloom": 0.55, "Fruit Expansion": 0.95, "Harvest": 0.75},
        "npk_recommended_kg_ha": "40:30:40",
    },
    "raspberry": {
        "id": "raspberry",
        "name_en": "Raspberry",
        "name_ta": "ராஸ்பெர்ரி",
        "name_hi": "रसभरी",
        "scientific_name": "Rubus idaeus",
        "water_requirement_mm": "500 - 650",
        "soil_types": ["Well-drained Sandy Loam rich in Humus"],
        "stages": ["Cane Emergence", "Flowering", "Berry Ripening", "Harvest"],
        "kc_stages": {"Flowering": 0.6, "Berry Ripening": 0.9, "Harvest": 0.7},
        "npk_recommended_kg_ha": "50:40:60",
    },
    "rice": {
        "id": "rice",
        "name_en": "Rice / Paddy",
        "name_ta": "நெல்",
        "name_hi": "धान / चावल",
        "scientific_name": "Oryza sativa",
        "water_requirement_mm": "1200 - 1500",
        "soil_types": ["Clay Soil", "Clay Loam", "Alluvial Soil"],
        "stages": ["Nursery", "Tillering", "Panicle Initiation", "Flowering / Heading", "Ripening"],
        "kc_stages": {"Tillering": 1.1, "Flowering / Heading": 1.3, "Ripening": 0.95},
        "npk_recommended_kg_ha": "120:40:40",
    },
    "cotton": {
        "id": "cotton",
        "name_en": "Cotton",
        "name_ta": "பருத்தி",
        "name_hi": "कपास",
        "scientific_name": "Gossypium hirsutum",
        "water_requirement_mm": "600 - 750",
        "soil_types": ["Black Cotton Soil", "Deep Loamy Soil"],
        "stages": ["Seedling", "Squaring", "Flowering & Boll Formation", "Boll Maturation & Bursting"],
        "kc_stages": {"Seedling": 0.45, "Flowering & Boll Formation": 1.2, "Boll Maturation": 0.75},
        "npk_recommended_kg_ha": "80:40:40",
    },
    "groundnut": {
        "id": "groundnut",
        "name_en": "Groundnut",
        "name_ta": "வேர்க்கடலை / நிலக்கடலை",
        "name_hi": "मूंगफली",
        "scientific_name": "Arachis hypogaea",
        "water_requirement_mm": "450 - 500",
        "soil_types": ["Red Sandy Loam", "Well-drained Loam"],
        "stages": ["Emergence & Vegetative", "Flowering & Pegging", "Pod Development", "Maturity"],
        "kc_stages": {"Vegetative": 0.45, "Flowering & Pegging": 1.05, "Pod Development": 0.8},
        "npk_recommended_kg_ha": "25:50:75",
    }
}
'''

# Load and format the diseases dictionary
from generate_diseases_data import DISEASES_DICT

diseases_code = "DISEASES = " + repr(DISEASES_DICT) + "\n\n"

full_file = script_content + "\n" + diseases_code + "\n" + fertilizer_section

with open('app/data/knowledge_base.py', 'w', encoding='utf-8') as f:
    f.write(full_file)

print("Updated app/data/knowledge_base.py successfully!")
