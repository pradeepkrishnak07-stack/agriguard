"""
AGRIGUARD Complete PlantVillage Dataset Model Training Pipeline
Trains on all 38 classes of the PlantVillage dataset across 14 crop species.
Implements 55 invariant visual pathology feature extraction, stratified splitting,
multi-model comparative evaluation, and saves the verified model pipeline,
authoritative class mapping, and held-out evaluation metrics.
"""

import os
import sys
import json
import time
import argparse
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Tuple, Any, Optional

import numpy as np
import cv2
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier, ExtraTreesClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
from tqdm import tqdm

IMG_SIZE = (128, 128)

# Authoritative 38-class PlantVillage Taxonomy Mapping
PLANTVILLAGE_TAXONOMY = {
    "Apple___Apple_scab": {
        "crop_id": "apple",
        "crop_name_en": "Apple",
        "crop_name_ta": "ஆப்பிள்",
        "crop_name_hi": "सेब",
        "disease_id": "apple_scab",
        "condition_title_en": "Apple Scab (Venturia inaequalis)",
        "condition_title_ta": "ஆப்பிள் செதில் நோய் (ஸ்கேப்)",
        "condition_title_hi": "सेब का स्कैब रोग",
        "pathogen": "Venturia inaequalis (Ascomycete Fungus)",
        "is_healthy": False
    },
    "Apple___Black_rot": {
        "crop_id": "apple",
        "crop_name_en": "Apple",
        "crop_name_ta": "ஆப்பிள்",
        "crop_name_hi": "सेब",
        "disease_id": "apple_black_rot",
        "condition_title_en": "Apple Black Rot (Botryosphaeria)",
        "condition_title_ta": "ஆப்பிள் கருப்பு அழுகல் நோய்",
        "condition_title_hi": "सेब का काला सड़न रोग",
        "pathogen": "Botryosphaeria obtusa (Fungus)",
        "is_healthy": False
    },
    "Apple___Cedar_apple_rust": {
        "crop_id": "apple",
        "crop_name_en": "Apple",
        "crop_name_ta": "ஆப்பிள்",
        "crop_name_hi": "सेब",
        "disease_id": "apple_cedar_apple_rust",
        "condition_title_en": "Cedar Apple Rust (Gymnosporangium)",
        "condition_title_ta": "ஆப்பிள் துரு நோய்",
        "condition_title_hi": "सेब का रतुआ रोग",
        "pathogen": "Gymnosporangium juniperi-virginianae (Fungus)",
        "is_healthy": False
    },
    "Apple___healthy": {
        "crop_id": "apple",
        "crop_name_en": "Apple",
        "crop_name_ta": "ஆப்பிள்",
        "crop_name_hi": "सेब",
        "disease_id": "apple_healthy",
        "condition_title_en": "Healthy Apple Leaf",
        "condition_title_ta": "ஆரோக்கியமான ஆப்பிள் இலை",
        "condition_title_hi": "स्वस्थ सेब की पत्ती",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    },
    "Blueberry___healthy": {
        "crop_id": "blueberry",
        "crop_name_en": "Blueberry",
        "crop_name_ta": "புளூபெர்ரி",
        "crop_name_hi": "ब्लूबेरी",
        "disease_id": "blueberry_healthy",
        "condition_title_en": "Healthy Blueberry Leaf",
        "condition_title_ta": "ஆரோக்கியமான புளூபெர்ரி இலை",
        "condition_title_hi": "स्वस्थ ब्लूबेरी की पत्ती",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    },
    "Cherry_(including_sour)___Powdery_mildew": {
        "crop_id": "cherry",
        "crop_name_en": "Cherry",
        "crop_name_ta": "செர்ரி",
        "crop_name_hi": "चेरी",
        "disease_id": "cherry_powdery_mildew",
        "condition_title_en": "Cherry Powdery Mildew (Podosphaera)",
        "condition_title_ta": "செர்ரி சாம்பல் நோய்",
        "condition_title_hi": "चेरी का चूर्णिल आसिता (पाउडरी मिल्ड्यू) रोग",
        "pathogen": "Podosphaera clandestina (Fungus)",
        "is_healthy": False
    },
    "Cherry_(including_sour)___healthy": {
        "crop_id": "cherry",
        "crop_name_en": "Cherry",
        "crop_name_ta": "செர்ரி",
        "crop_name_hi": "चेरी",
        "disease_id": "cherry_healthy",
        "condition_title_en": "Healthy Cherry Leaf",
        "condition_title_ta": "ஆரோக்கியமான செர்ரி இலை",
        "condition_title_hi": "स्वस्थ चेरी की पत्ती",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "crop_id": "corn",
        "crop_name_en": "Corn / Maize",
        "crop_name_ta": "மக்காச்சோளம்",
        "crop_name_hi": "मक्का",
        "disease_id": "corn_cercospora_leaf_spot",
        "condition_title_en": "Corn Gray Leaf Spot (Cercospora)",
        "condition_title_ta": "மக்காச்சோள சாம்பல் இலைப்புள்ளி நோய்",
        "condition_title_hi": "मक्का का ग्रे लीफ स्पॉट रोग",
        "pathogen": "Cercospora zeae-maydis (Fungus)",
        "is_healthy": False
    },
    "Corn_(maize)___Common_rust_": {
        "crop_id": "corn",
        "crop_name_en": "Corn / Maize",
        "crop_name_ta": "மக்காச்சோளம்",
        "crop_name_hi": "मक्का",
        "disease_id": "corn_common_rust",
        "condition_title_en": "Corn Common Rust (Puccinia sorghi)",
        "condition_title_ta": "மக்காச்சோள துரு நோய்",
        "condition_title_hi": "मक्का का सामान्य रतुआ (रस्ट) रोग",
        "pathogen": "Puccinia sorghi (Fungus)",
        "is_healthy": False
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "crop_id": "corn",
        "crop_name_en": "Corn / Maize",
        "crop_name_ta": "மக்காச்சோளம்",
        "crop_name_hi": "मक्का",
        "disease_id": "corn_northern_leaf_blight",
        "condition_title_en": "Corn Northern Leaf Blight (Exserohilum)",
        "condition_title_ta": "மக்காச்சோள வடக்கு இலைக் கருகல் நோய்",
        "condition_title_hi": "मक्का का उत्तरी पत्ती झुलसा रोग",
        "pathogen": "Exserohilum turcicum (Fungus)",
        "is_healthy": False
    },
    "Corn_(maize)___healthy": {
        "crop_id": "corn",
        "crop_name_en": "Corn / Maize",
        "crop_name_ta": "மக்காச்சோளம்",
        "crop_name_hi": "मक्का",
        "disease_id": "corn_healthy",
        "condition_title_en": "Healthy Corn Foliage",
        "condition_title_ta": "ஆரோக்கியமான மக்காச்சோள இலை",
        "condition_title_hi": "स्वस्थ मक्के की पत्ती",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    },
    "Grape___Black_rot": {
        "crop_id": "grape",
        "crop_name_en": "Grape",
        "crop_name_ta": "திராட்சை",
        "crop_name_hi": "अंगूर",
        "disease_id": "grape_black_rot",
        "condition_title_en": "Grape Black Rot (Guignardia)",
        "condition_title_ta": "திராட்சை கருப்பு அழுகல் நோய்",
        "condition_title_hi": "अंगूर का ब्लैक रॉट रोग",
        "pathogen": "Guignardia bidwellii (Fungus)",
        "is_healthy": False
    },
    "Grape___Esca_(Black_Measles)": {
        "crop_id": "grape",
        "crop_name_en": "Grape",
        "crop_name_ta": "திராட்சை",
        "crop_name_hi": "अंगूर",
        "disease_id": "grape_esca",
        "condition_title_en": "Grape Esca (Black Measles)",
        "condition_title_ta": "திராட்சை எஸ்கா (கருப்பு தட்டம்மை) நோய்",
        "condition_title_hi": "अंगूर का एस्का (ब्लैक मीजल्स) रोग",
        "pathogen": "Phaeomoniella chlamydospora & Fomitiporia (Fungal Complex)",
        "is_healthy": False
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "crop_id": "grape",
        "crop_name_en": "Grape",
        "crop_name_ta": "திராட்சை",
        "crop_name_hi": "अंगूर",
        "disease_id": "grape_leaf_blight",
        "condition_title_en": "Grape Leaf Blight (Isariopsis)",
        "condition_title_ta": "திராட்சை இலைக் கருகல் நோய்",
        "condition_title_hi": "अंगूर का पत्ती झुलसा रोग",
        "pathogen": "Pseudocercospora cladosporioides (Fungus)",
        "is_healthy": False
    },
    "Grape___healthy": {
        "crop_id": "grape",
        "crop_name_en": "Grape",
        "crop_name_ta": "திராட்சை",
        "crop_name_hi": "अंगूर",
        "disease_id": "grape_healthy",
        "condition_title_en": "Healthy Grape Foliage",
        "condition_title_ta": "ஆரோக்கியமான திராட்சை இலை",
        "condition_title_hi": "स्वस्थ अंगूर की पत्ती",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    },
    "Orange___Haunglongbing_(Citrus_greening)": {
        "crop_id": "orange",
        "crop_name_en": "Orange / Citrus",
        "crop_name_ta": "ஆரஞ்சு / எலுமிச்சை",
        "crop_name_hi": "संतरा / नींबू वर्गीय",
        "disease_id": "orange_citrus_greening",
        "condition_title_en": "Citrus Greening (Huanglongbing)",
        "condition_title_ta": "சிட்ரஸ் கிரீனிங் (ஹுவாங்லாங்பிங்) நோய்",
        "condition_title_hi": "सिट्रस ग्रीनिंग (हुआंगलोंगबिंग) रोग",
        "pathogen": "Candidatus Liberibacter asiaticus (Bacterium, Vector: Citrus Psyllid)",
        "is_healthy": False
    },
    "Peach___Bacterial_spot": {
        "crop_id": "peach",
        "crop_name_en": "Peach",
        "crop_name_ta": "பீச்",
        "crop_name_hi": "आड़ू (पीच)",
        "disease_id": "peach_bacterial_spot",
        "condition_title_en": "Peach Bacterial Spot (Xanthomonas)",
        "condition_title_ta": "பீச் பாக்டீரியா இலைப்புள்ளி நோய்",
        "condition_title_hi": "आड़ू का जीवाणु धब्बा रोग",
        "pathogen": "Xanthomonas arboricola pv. pruni (Bacterium)",
        "is_healthy": False
    },
    "Peach___healthy": {
        "crop_id": "peach",
        "crop_name_en": "Peach",
        "crop_name_ta": "பீச்",
        "crop_name_hi": "आड़ू (पीच)",
        "disease_id": "peach_healthy",
        "condition_title_en": "Healthy Peach Leaf",
        "condition_title_ta": "ஆரோக்கியமான பீச் இலை",
        "condition_title_hi": "स्वस्थ आड़ू की पत्ती",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    },
    "Pepper,_bell___Bacterial_spot": {
        "crop_id": "chilli",
        "crop_name_en": "Bell Pepper / Chilli",
        "crop_name_ta": "குடைமிளகாய் / மிளகாய்",
        "crop_name_hi": "शिमला मिर्च / मिर्च",
        "disease_id": "chilli_bacterial_spot",
        "condition_title_en": "Bacterial Spot (Xanthomonas)",
        "condition_title_ta": "பாக்டீரியா இலைப்புள்ளி நோய்",
        "condition_title_hi": "जीवाणु धब्बा रोग",
        "pathogen": "Xanthomonas campestris pv. vesicatoria (Bacterium)",
        "is_healthy": False
    },
    "Pepper,_bell___healthy": {
        "crop_id": "chilli",
        "crop_name_en": "Bell Pepper / Chilli",
        "crop_name_ta": "குடைமிளகாய் / மிளகாய்",
        "crop_name_hi": "शिमला मिर्च / मिर्च",
        "disease_id": "chilli_healthy",
        "condition_title_en": "Healthy Bell Pepper Leaf",
        "condition_title_ta": "ஆரோக்கியமான மிளகாய் இலை",
        "condition_title_hi": "स्वस्थ मिर्च की पत्ती",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    },
    "Potato___Early_blight": {
        "crop_id": "potato",
        "crop_name_en": "Potato",
        "crop_name_ta": "உருளைக்கிழங்கு",
        "crop_name_hi": "आलू",
        "disease_id": "potato_early_blight",
        "condition_title_en": "Potato Early Blight (Alternaria)",
        "condition_title_ta": "உருளை ஆரம்பக்கால இலைக் கருகல் நோய்",
        "condition_title_hi": "आलू का अगेती झुलसा रोग",
        "pathogen": "Alternaria solani (Fungus)",
        "is_healthy": False
    },
    "Potato___Late_blight": {
        "crop_id": "potato",
        "crop_name_en": "Potato",
        "crop_name_ta": "உருளைக்கிழங்கு",
        "crop_name_hi": "आलू",
        "disease_id": "potato_late_blight",
        "condition_title_en": "Potato Late Blight (Phytophthora)",
        "condition_title_ta": "உருளை பிற்பருவ இலைக் கருகல் நோய்",
        "condition_title_hi": "आलू का पछेती झुलसा रोग",
        "pathogen": "Phytophthora infestans (Oomycete)",
        "is_healthy": False
    },
    "Potato___healthy": {
        "crop_id": "potato",
        "crop_name_en": "Potato",
        "crop_name_ta": "உருளைக்கிழங்கு",
        "crop_name_hi": "आलू",
        "disease_id": "potato_healthy",
        "condition_title_en": "Healthy Potato Foliage",
        "condition_title_ta": "ஆரோக்கியமான உருளைக்கிழங்கு இலை",
        "condition_title_hi": "स्वस्थ आलू की पत्तियां",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    },
    "Raspberry___healthy": {
        "crop_id": "raspberry",
        "crop_name_en": "Raspberry",
        "crop_name_ta": "ராஸ்பெர்ரி",
        "crop_name_hi": "रसभरी",
        "disease_id": "raspberry_healthy",
        "condition_title_en": "Healthy Raspberry Leaf",
        "condition_title_ta": "ஆரோக்கியமான ராஸ்பெர்ரி இலை",
        "condition_title_hi": "स्वस्थ रसभरी की पत्ती",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    },
    "Soybean___healthy": {
        "crop_id": "soybean",
        "crop_name_en": "Soybean",
        "crop_name_ta": "சோயாபீன்",
        "crop_name_hi": "सोयाबीन",
        "disease_id": "soybean_healthy",
        "condition_title_en": "Healthy Soybean Leaf",
        "condition_title_ta": "ஆரோக்கியமான சோயாபீன் இலை",
        "condition_title_hi": "स्वस्थ सोयाबीन की पत्ती",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    },
    "Squash___Powdery_mildew": {
        "crop_id": "squash",
        "crop_name_en": "Squash / Cucurbits",
        "crop_name_ta": "பூசணி / சுரை",
        "crop_name_hi": "कद्दू / स्क्वैश",
        "disease_id": "squash_powdery_mildew",
        "condition_title_en": "Squash Powdery Mildew (Podosphaera)",
        "condition_title_ta": "பூசணி சாம்பல் நோய்",
        "condition_title_hi": "कद्दू का चूर्णिल आसिता रोग",
        "pathogen": "Podosphaera xanthii (Fungus)",
        "is_healthy": False
    },
    "Strawberry___Leaf_scorch": {
        "crop_id": "strawberry",
        "crop_name_en": "Strawberry",
        "crop_name_ta": "ஸ்ட்ராபெர்ரி",
        "crop_name_hi": "स्ट्रॉबेरी",
        "disease_id": "strawberry_leaf_scorch",
        "condition_title_en": "Strawberry Leaf Scorch (Diplocarpon)",
        "condition_title_ta": "ஸ்ட்ராபெர்ரி இலை தீய்ந்த நோய்",
        "condition_title_hi": "स्ट्रॉबेरी का लीफ स्कॉर्च रोग",
        "pathogen": "Diplocarpon earlianum (Fungus)",
        "is_healthy": False
    },
    "Strawberry___healthy": {
        "crop_id": "strawberry",
        "crop_name_en": "Strawberry",
        "crop_name_ta": "ஸ்ட்ராபெர்ரி",
        "crop_name_hi": "स्ट्रॉबेरी",
        "disease_id": "strawberry_healthy",
        "condition_title_en": "Healthy Strawberry Leaf",
        "condition_title_ta": "ஆரோக்கியமான ஸ்ட்ராபெர்ரி இலை",
        "condition_title_hi": "स्वस्थ स्ट्रॉबेरी की पत्ती",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    },
    "Tomato___Bacterial_spot": {
        "crop_id": "tomato",
        "crop_name_en": "Tomato",
        "crop_name_ta": "தக்காளி",
        "crop_name_hi": "टमाटर",
        "disease_id": "tomato_bacterial_spot",
        "condition_title_en": "Tomato Bacterial Spot (Xanthomonas)",
        "condition_title_ta": "தக்காளி பாக்டீரியா இலைப்புள்ளி நோய்",
        "condition_title_hi": "टमाटर का जीवाणु धब्बा रोग",
        "pathogen": "Xanthomonas perforans (Bacterium)",
        "is_healthy": False
    },
    "Tomato___Early_blight": {
        "crop_id": "tomato",
        "crop_name_en": "Tomato",
        "crop_name_ta": "தக்காளி",
        "crop_name_hi": "टमाटर",
        "disease_id": "tomato_early_blight",
        "condition_title_en": "Tomato Early Blight (Alternaria)",
        "condition_title_ta": "தக்காளி ஆரம்பக்கால இலைக் கருகல் நோய்",
        "condition_title_hi": "टमाटर का अगेती झुलसा रोग",
        "pathogen": "Alternaria solani (Fungus)",
        "is_healthy": False
    },
    "Tomato___Late_blight": {
        "crop_id": "tomato",
        "crop_name_en": "Tomato",
        "crop_name_ta": "தக்காளி",
        "crop_name_hi": "टमाटर",
        "disease_id": "tomato_late_blight",
        "condition_title_en": "Tomato Late Blight (Phytophthora)",
        "condition_title_ta": "தக்காளி பிற்பருவ இலைக் கருகல் நோய்",
        "condition_title_hi": "टमाटर का पछेती झुलसा रोग",
        "pathogen": "Phytophthora infestans (Oomycete)",
        "is_healthy": False
    },
    "Tomato___Leaf_Mold": {
        "crop_id": "tomato",
        "crop_name_en": "Tomato",
        "crop_name_ta": "தக்காளி",
        "crop_name_hi": "टमाटर",
        "disease_id": "tomato_leaf_mold",
        "condition_title_en": "Tomato Leaf Mold (Passalora fulva)",
        "condition_title_ta": "தக்காளி இலை பூஞ்சை நோய்",
        "condition_title_hi": "टमाटर का पत्ती फफूंद रोग",
        "pathogen": "Passalora fulva (Fungus)",
        "is_healthy": False
    },
    "Tomato___Septoria_leaf_spot": {
        "crop_id": "tomato",
        "crop_name_en": "Tomato",
        "crop_name_ta": "தக்காளி",
        "crop_name_hi": "टमाटर",
        "disease_id": "tomato_septoria_leaf_spot",
        "condition_title_en": "Tomato Septoria Leaf Spot",
        "condition_title_ta": "தக்காளி செப்டோரியா இலைப்புள்ளி நோய்",
        "condition_title_hi": "टमाटर का सेप्टोरिया पत्ती धब्बा रोग",
        "pathogen": "Septoria lycopersici (Fungus)",
        "is_healthy": False
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "crop_id": "tomato",
        "crop_name_en": "Tomato",
        "crop_name_ta": "தக்காளி",
        "crop_name_hi": "टमाटर",
        "disease_id": "tomato_spider_mites",
        "condition_title_en": "Tomato Two-Spotted Spider Mite Damage",
        "condition_title_ta": "தக்காளி சிவப்பு சிலந்திப் பேன் தாக்குதல்",
        "condition_title_hi": "टमाटर का लाल मकड़ी (माइट) प्रकोप",
        "pathogen": "Tetranychus urticae (Arachnid Pest)",
        "is_healthy": False
    },
    "Tomato___Target_Spot": {
        "crop_id": "tomato",
        "crop_name_en": "Tomato",
        "crop_name_ta": "தக்காளி",
        "crop_name_hi": "टमाटर",
        "disease_id": "tomato_target_spot",
        "condition_title_en": "Tomato Target Spot (Corynespora)",
        "condition_title_ta": "தக்காளி இலக்கு புள்ளி நோய்",
        "condition_title_hi": "टमाटर का टारगेट स्पॉट रोग",
        "pathogen": "Corynespora cassiicola (Fungus)",
        "is_healthy": False
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "crop_id": "tomato",
        "crop_name_en": "Tomato",
        "crop_name_ta": "தக்காளி",
        "crop_name_hi": "टमाटर",
        "disease_id": "tomato_yellow_leaf_curl",
        "condition_title_en": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "condition_title_ta": "தக்காளி மஞ்சள் இலை சுருள் வைரஸ் நோய்",
        "condition_title_hi": "टमाटर का पीली पत्ती मरोड़िया वायरस रोग",
        "pathogen": "Tomato Yellow Leaf Curl Geminivirus (Vector: Whitefly)",
        "is_healthy": False
    },
    "Tomato___Tomato_mosaic_virus": {
        "crop_id": "tomato",
        "crop_name_en": "Tomato",
        "crop_name_ta": "தக்காளி",
        "crop_name_hi": "टमाटर",
        "disease_id": "tomato_mosaic_virus",
        "condition_title_en": "Tomato Mosaic Virus (ToMV)",
        "condition_title_ta": "தக்காளி மொசைக் வைரஸ் நோய்",
        "condition_title_hi": "टमाटर का मोज़ेक वायरस रोग",
        "pathogen": "Tomato Mosaic Tobamovirus (ToMV)",
        "is_healthy": False
    },
    "Tomato___healthy": {
        "crop_id": "tomato",
        "crop_name_en": "Tomato",
        "crop_name_ta": "தக்காளி",
        "crop_name_hi": "टमाटर",
        "disease_id": "tomato_healthy",
        "condition_title_en": "Healthy Tomato Foliage",
        "condition_title_ta": "ஆரோக்கியமான தக்காளி இலை",
        "condition_title_hi": "स्वस्थ टमाटर की पत्ती",
        "pathogen": "None (Healthy Foliage)",
        "is_healthy": True
    }
}

from app.services.ml_feature_extractor import extract_pathology_features, TOTAL_FEATURE_DIM, IMG_SIZE


def find_dataset_directory(candidate_path: Optional[str] = None) -> str:
    """
    Locates the actual PlantVillage dataset directory inside the AGRIGUARD workspace.
    """
    search_paths = []
    if candidate_path:
        search_paths.append(candidate_path)

    # Project workspace paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    search_paths.extend([
        os.path.join(base_dir, "dataset", "PlantVillage-Dataset-master", "PlantVillage-Dataset-master", "raw", "color"),
        os.path.join(base_dir, "dataset", "PlantVillage-Dataset-master", "raw", "color"),
        os.path.join(base_dir, "dataset", "raw", "color"),
        os.path.join(base_dir, "dataset", "PlantVillage"),
        os.path.join(base_dir, "dataset"),
    ])

    env_dir = os.environ.get("PLANT_DATASET_DIR")
    if env_dir:
        search_paths.insert(0, env_dir)

    for p in search_paths:
        if os.path.exists(p) and os.path.isdir(p):
            subdirs = [d for d in os.listdir(p) if os.path.isdir(os.path.join(p, d))]
            # Check if this folder has Tomato and Corn classes
            has_tomato = any("Tomato" in d for d in subdirs)
            has_corn = any("Corn" in d for d in subdirs)
            if has_tomato and has_corn:
                return p
            # Check nested folders
            nested_check = os.path.join(p, "PlantVillage-Dataset-master", "PlantVillage-Dataset-master", "raw", "color")
            if os.path.exists(nested_check):
                return nested_check

    raise FileNotFoundError(
        f"Could not locate PlantVillage raw/color directory with classes across tested paths:\n"
        + "\n".join(search_paths)
    )


def extract_single_image(img_path: str) -> Optional[np.ndarray]:
    """Helper to load image and extract features."""
    try:
        img = cv2.imread(img_path)
        if img is None:
            return None
        return extract_pathology_features(img)
    except Exception:
        return None


def load_dataset_features(dataset_path: str, max_samples_per_class: int = 150) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """
    Scans class folders and extracts the 55-dimensional feature vectors.
    Uses multi-threaded parallel extraction for optimal performance.
    """
    print(f"\nScanning dataset directory: {dataset_path}")
    subdirs = sorted([d for d in os.listdir(dataset_path) if os.path.isdir(os.path.join(dataset_path, d))])

    # Filter to valid classes present in taxonomy
    valid_classes = [d for d in subdirs if d in PLANTVILLAGE_TAXONOMY]
    print(f"Found {len(valid_classes)} verified PlantVillage classes matching taxonomy.")

    X_list = []
    y_list = []

    for class_name in valid_classes:
        class_dir = os.path.join(dataset_path, class_name)
        image_files = [f for f in os.listdir(class_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if max_samples_per_class and len(image_files) > max_samples_per_class:
            np.random.seed(42)
            image_files = list(np.random.choice(image_files, max_samples_per_class, replace=False))

        img_paths = [os.path.join(class_dir, f) for f in image_files]
        with ThreadPoolExecutor(max_workers=8) as executor:
            features = list(executor.map(extract_single_image, img_paths))

        valid_feats = [f for f in features if f is not None]
        for f in valid_feats:
            X_list.append(f)
            y_list.append(class_name)

        print(f"  - [{class_name[:40]}]: Loaded {len(valid_feats)} valid feature vectors")

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list)
    return X, y, valid_classes


def train_and_evaluate(
    dataset_path: str,
    output_dir: str,
    max_samples_per_class: int = 150,
    test_size: float = 0.2
):
    print("=" * 70)
    print("AGRIGUARD — COMPLETE PLANTVILLAGE DATASET TRAINING PIPELINE")
    print("=" * 70)
    print(f"Dataset root: {dataset_path}")
    print(f"Output model directory: {output_dir}")
    print(f"Max samples per class: {max_samples_per_class}")
    print(f"Held-out test split ratio: {test_size * 100:.0f}%")

    os.makedirs(output_dir, exist_ok=True)

    # 1. Feature Extraction
    t0 = time.time()
    X, y, unique_classes = load_dataset_features(dataset_path, max_samples_per_class=max_samples_per_class)
    extraction_time = time.time() - t0
    print(f"\nFeature extraction complete in {extraction_time:.1f}s. Total feature vectors: {len(X)}")

    # 2. Encoding and Stratified Splitting
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded,
        test_size=test_size,
        random_state=42,
        stratify=y_encoded
    )

    print(f"\nStratified Data Split (No data leakage):")
    print(f"  - Training samples: {len(X_train)} across {len(unique_classes)} classes")
    print(f"  - Held-out evaluation samples: {len(X_test)} across {len(unique_classes)} classes")

    # 3. Feature Scaling (Fitted ONLY on training data to prevent leakage)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 4. Model Training and Comparison
    models = {
        "HistGradientBoostingClassifier": HistGradientBoostingClassifier(
            max_iter=160,
            learning_rate=0.08,
            max_leaf_nodes=31,
            random_state=42
        ),
        "RandomForestClassifier(n=200)": RandomForestClassifier(
            n_estimators=200,
            max_depth=25,
            min_samples_split=2,
            random_state=42,
            n_jobs=-1
        ),
        "ExtraTreesClassifier(n=150)": ExtraTreesClassifier(
            n_estimators=150,
            max_depth=25,
            random_state=42,
            n_jobs=-1
        )
    }

    results = {}
    best_model_name = None
    best_acc = -1.0
    best_clf = None

    print("\n" + "=" * 70)
    print("MODEL TRAINING & COMPARATIVE HELD-OUT EVALUATION")
    print("=" * 70)

    for name, clf in models.items():
        t_start = time.time()
        print(f"\nTraining {name} on {len(X_train)} samples...")
        clf.fit(X_train_scaled, y_train)
        fit_time = time.time() - t_start

        y_pred = clf.predict(X_test_scaled)
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
        rec = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))

        results[name] = {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "fit_time_seconds": round(fit_time, 2)
        }

        print(f"  {name} Held-Out Results ({fit_time:.1f}s):")
        print(f"    - Accuracy:  {acc * 100:.2f}%")
        print(f"    - Precision: {prec * 100:.2f}%")
        print(f"    - Recall:    {rec * 100:.2f}%")
        print(f"    - F1-Score:  {f1 * 100:.2f}%")

        if acc > best_acc:
            best_acc = acc
            best_model_name = name
            best_clf = clf

    print("\n" + "=" * 70)
    print(f"CHAMPION MODEL SELECTED: {best_model_name} (Held-Out Accuracy: {best_acc * 100:.2f}%)")
    print("=" * 70)

    # Detailed report for champion
    y_champion_pred = best_clf.predict(X_test_scaled)
    cls_report = classification_report(
        y_test, y_champion_pred,
        target_names=unique_classes,
        output_dict=True,
        zero_division=0
    )
    cm = confusion_matrix(y_test, y_champion_pred).tolist()

    # 5. Save Model Pipeline
    model_path = os.path.join(output_dir, "plant_disease_model.joblib")
    pipeline_data = {
        "model": best_clf,
        "scaler": scaler,
        "label_encoder": label_encoder,
        "classes": unique_classes,
        "model_name": best_model_name,
        "accuracy": best_acc,
        "feature_dim": TOTAL_FEATURE_DIM,
        "img_size": IMG_SIZE,
        "num_classes": len(unique_classes),
        "trained_at": datetime.utcnow().isoformat()
    }
    joblib.dump(pipeline_data, model_path, compress=3)
    print(f"\n[OK] Saved trained model pipeline to: {model_path}")

    # 6. Build and Save Authoritative Class Mapping
    class_mapping = {}
    for idx, class_name in enumerate(unique_classes):
        meta = PLANTVILLAGE_TAXONOMY[class_name]
        class_mapping[str(idx)] = {
            "class_index": idx,
            "raw_class_name": class_name,
            **meta
        }

    mapping_path = os.path.join(output_dir, "class_mapping.json")
    with open(mapping_path, "w", encoding="utf-8") as f:
        json.dump(class_mapping, f, indent=2, ensure_ascii=False)
    print(f"[OK] Saved authoritative 38-class mapping to: {mapping_path}")

    # 7. Save Comprehensive Training Metrics
    metrics_path = os.path.join(output_dir, "training_metrics.json")
    metrics_data = {
        "champion_model": best_model_name,
        "accuracy": best_acc,
        "precision": results[best_model_name]["precision"],
        "recall": results[best_model_name]["recall"],
        "f1_score": results[best_model_name]["f1_score"],
        "num_classes": len(unique_classes),
        "total_samples": len(X),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "comparative_results": results,
        "classification_report": cls_report,
        "confusion_matrix": cm,
        "classes": unique_classes,
        "timestamp": datetime.utcnow().isoformat()
    }
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2, ensure_ascii=False)
    print(f"[OK] Saved held-out evaluation metrics to: {metrics_path}")

    return {
        "accuracy": best_acc,
        "model_name": best_model_name,
        "num_classes": len(unique_classes),
        "train_samples": len(X_train),
        "test_samples": len(X_test)
    }


def main():
    parser = argparse.ArgumentParser(description="Train AGRIGUARD Plant Disease Model on PlantVillage dataset")
    parser.add_argument("--dataset-dir", type=str, default=None, help="Path to PlantVillage raw/color folder")
    parser.add_argument("--output-dir", type=str, default=None, help="Output directory for saved model artifacts")
    parser.add_argument("--samples-per-class", type=int, default=150, help="Max images per class for balanced training")
    args = parser.parse_args()

    dataset_path = find_dataset_directory(args.dataset_dir)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_dir = args.output_dir or os.path.join(base_dir, "backend", "app", "models")

    train_and_evaluate(dataset_path, output_dir, max_samples_per_class=args.samples_per_class)


if __name__ == "__main__":
    main()
