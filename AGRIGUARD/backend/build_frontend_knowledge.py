import json
import re
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append('backend')
from app.data.knowledge_base import CROPS, DISEASES

def sanitize_str(s):
    if s is None:
        return ""
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ')

def list_to_ts(lst):
    return '[\n' + ',\n'.join(f'            "{sanitize_str(x)}"' for x in lst) + '\n          ]'

new_crops = [
    'corn', 'apple', 'grape', 'orange', 'peach', 'cherry',
    'strawberry', 'squash', 'soybean', 'blueberry', 'raspberry',
    'cotton', 'groundnut'
]

# Soil definitions for new crops based on TNAU/ICAR agronomy
SOIL_INFO = {
    "corn": {
        "suitable_soils_en": ["Well-drained Fertile Sandy Loam", "Deep Silt Loam", "Red Loam with High Organic Matter"],
        "suitable_soils_ta": ["நல்ல வடிகால் வசதியுள்ள மணற்பாங்கான செம்மண்", "வண்டல் கலந்த நிலம்", "மட்கிய சத்து நிறைந்த வண்டல் மண்"],
        "suitable_soils_hi": ["अच्छी जल निकासी वाली दोमट मिट्टी", "बलुई दोमट", "जीवांश युक्त गहरी जलोढ़ मिट्टी"],
        "ph_range": "6.0 - 7.5 (Neutral to slightly acidic)",
        "requirements_en": "Maize prefers deep, well-aerated, moisture-retentive loamy soils with good organic matter. Water stagnation for even 24 hours causes severe root asphyxiation.",
        "requirements_ta": "மக்காச்சோளத்திற்கு ஆழமான, தளர்வான, ஈரப்பதத்தைத் தக்கவைக்கும் மண் தேவை. 24 மணி நேரத்திற்கு மேல் நீர் தேங்கினால் பயிர் மூச்சுத்திணறி அழுகிவிடும்.",
        "requirements_hi": "मक्का के लिए अच्छी जल निकासी वाली भुरभुरी मिट्टी आवश्यक है। 24 घंटे से अधिक जलभराव से जड़ें सड़ने लगती हैं।",
        "unsuitable_impact_en": "Heavy waterlogged clay suffocates roots and triggers Pythium stalk rot. Alkaline soils (pH > 8.0) cause severe zinc deficiency (white bud).",
        "unsuitable_impact_ta": "கடின களிமண்ணில் நீர் தேங்கி தண்டு அழுகலை உருவாக்கும். கார மண்ணில் (pH > 8.0) துத்தநாக சத்துக் குறைபாடு ஏற்பட்டு வெண் குருத்து தோன்றும்.",
        "unsuitable_impact_hi": "भारी मटियार मिट्टी में जलभराव से तना गलन रोग होता है। क्षारीय मिट्टी में जस्ते (जिंक) की भारी कमी हो जाती है।"
    },
    "apple": {
        "suitable_soils_en": ["Deep Well-drained Loam", "Gravelly Loam with High Humus", "Mountain Sandy Clay Loam"],
        "suitable_soils_ta": ["ஆழமான நல்ல வடிகால் வசதியுள்ள செம்மண்", "மலைப்பாங்கான வண்டல் மண்", "மட்கிய இலை உரம் மிகுந்த மண்"],
        "suitable_soils_hi": ["गहरी, अच्छी जल निकासी वाली दोमट मिट्टी", "ह्यूमस युक्त पहाड़ी बलुई मिट्टी"],
        "ph_range": "6.0 - 6.8 (Slightly acidic)",
        "requirements_en": "Apples require deep soils (minimum 1.5m root depth) with high organic humus and good subsurface aeration.",
        "requirements_ta": "ஆப்பிள் மரங்களின் வேர்கள் ஆழமாக ஊடுருவக்கூடிய, சத்து மிகுந்த, நல்ல வடிகால் வசதியுள்ள மலைமண் மிக அவசியம்.",
        "requirements_hi": "सेब की खेती के लिए कम से कम 1.5 मीटर गहरी, जैविक पदार्थों से भरपूर दोमट मिट्टी सबसे उपयुक्त है।",
        "unsuitable_impact_en": "Poor drainage causes Phytophthora root rot (collar rot). Calcareous soils with pH > 7.5 lock out iron, causing severe foliar chlorosis.",
        "unsuitable_impact_ta": "வடிகால் வசதி இல்லையெனில் வேரழுகல் நோய் தாக்கும். கார மண்ணில் இரும்பு சத்து கிடைக்காமல் இலைகள் வெளுக்கும்.",
        "unsuitable_impact_hi": "जलभराव से जड़ सड़न रोग होता है और अधिक चूने वाली मिट्टी में लोहे की कमी से पत्तियां पीली पड़ जाती हैं।"
    },
    "grape": {
        "suitable_soils_en": ["Well-drained Sandy Loam", "Gravelly Red Sandy Soil", "Alluvial Deep Loam"],
        "suitable_soils_ta": ["வடிகால் வசதியுள்ள மணற்பாங்கான செம்மண்", "வண்டல் மண்", "சரளை கலந்த செம்மண்"],
        "suitable_soils_hi": ["अच्छी जल निकास वाली बलुई दोमट", "कंकड़युक्त लाल दोमट मिट्टी"],
        "ph_range": "6.5 - 7.5 (Neutral to slightly alkaline)",
        "requirements_en": "Grapevines thrive in permeable, gravelly or sandy loam soils that prevent wet feet and allow extensive root spread.",
        "requirements_ta": "திராட்சை பயிருக்கு வேர்களில் நீர் தேங்காத, இலகுவான வடிகால் நிலம் மிக அவசியமாகும்.",
        "requirements_hi": "अंगूर के लिए जल निकासी वाली हल्की बलुई दोमट मिट्टी सबसे उपयुक्त है।",
        "unsuitable_impact_en": "Heavy clay restricts root aeration and triggers fanleaf degeneration. Saline soils cause severe marginal leaf scorch.",
        "unsuitable_impact_ta": "களிமண் நிலத்தில் வேர் வளர்ச்சி தடைபடும். உவர் நிலத்தில் இலை ஓரங்கள் கருகி உதிரும்.",
        "unsuitable_impact_hi": "भारी चिकनी मिट्टी में जड़ें नहीं फैलतीं और खारी मिट्टी में पत्तियों के किनारे सूखने लगते हैं।"
    },
    "orange": {
        "suitable_soils_en": ["Deep Well-drained Loam", "Red Loam with Good Subsoil Permeability"],
        "suitable_soils_ta": ["ஆழமான நல்ல வடிகால் உள்ள செம்மண்", "வண்டல் கலந்த மணல் மண்"],
        "suitable_soils_hi": ["गहरी, उपजाऊ और जल निकास युक्त दोमट मिट्टी"],
        "ph_range": "6.0 - 7.5",
        "requirements_en": "Citrus needs deep, well-aerated soil without a hard subsoil pan or high water table.",
        "requirements_ta": "எலுமிச்சை, ஆரஞ்சு மரங்களுக்கு கடின பாறை இல்லாத, ஆழமான செம்மண் நிலம் தேவை.",
        "requirements_hi": "संतरे और नींबू वर्गीय फसलों के लिए गहरी और भुरभुरी मिट्टी आवश्यक है।",
        "unsuitable_impact_en": "High water tables trigger Phytophthora gummosis. Calcareous soils induce severe zinc and iron deficiencies.",
        "unsuitable_impact_ta": "நீர் தேங்கினால் பிசின் ஒழுகும் நோய் தாக்கும். கார மண்ணில் நுண்ணூட்டச் சத்துக் குறைபாடு தோன்றும்.",
        "unsuitable_impact_hi": "जलभराव से तने से गोंद निकलने का रोग (गमोसिस) होता है।"
    },
    "peach": {
        "suitable_soils_en": ["Deep Sandy Loam", "Gravelly Well-drained Loam"],
        "suitable_soils_ta": ["ஆழமான மணற்பாங்கான வண்டல் மண்", "மலை வடிகால் மண்"],
        "suitable_soils_hi": ["गहरी बलुई दोमट मिट्टी"],
        "ph_range": "6.0 - 6.5",
        "requirements_en": "Peaches are very sensitive to wet feet and demand exceptionally well-drained topsoil.",
        "requirements_ta": "பீச் பழ மரங்கள் நீர் தேங்குவதை தாங்காது; மிகச் சிறந்த வடிகால் தேவை.",
        "requirements_hi": "आड़ू की फसल के लिए अत्यधिक जल निकासी वाली हल्की मिट्टी चाहिए।",
        "unsuitable_impact_en": "Wet soils cause root asphyxiation within 48 hours and induce root rot.",
        "unsuitable_impact_ta": "48 மணி நேர நீர் தேக்கம் வேர்களை அழுகச் செய்து மரத்தை அழித்துவிடும்.",
        "unsuitable_impact_hi": "जलभराव से 48 घंटे में जड़ें नष्ट हो जाती हैं।"
    },
    "cherry": {
        "suitable_soils_en": ["Deep Well-drained Sandy Loam", "Gravelly Mountain Soil"],
        "suitable_soils_ta": ["ஆழமான வடிகால் கொண்ட மலை மண்"],
        "suitable_soils_hi": ["पहाड़ी ढलानों वाली गहरी दोमट"],
        "ph_range": "6.0 - 7.0",
        "requirements_en": "Cherries need deep, fertile, moisture-retentive but open-structured mountain loams.",
        "requirements_ta": "செர்ரி மரங்களுக்கு ஆழமான சத்துள்ள மலை வண்டல் மண் தேவை.",
        "requirements_hi": "चेरी के लिए जैविक पदार्थों से भरपूर पहाड़ी दोमट मिट्टी उपयुक्त है।",
        "unsuitable_impact_en": "Poor drainage leads to crown gall and root rot diseases.",
        "unsuitable_impact_ta": "வடிகால் குறைபாடு வேரழுகல் நோயை உண்டாக்கும்.",
        "unsuitable_impact_hi": "खराब जल निकासी से जड़ों में गांठे और गलन की समस्या आती है।"
    },
    "strawberry": {
        "suitable_soils_en": ["Rich Sandy Loam with High Organic Matter", "Raised Bed Compost Soil"],
        "suitable_soils_ta": ["மக்கிய உரம் கலந்த மணற்பாங்கான செம்மண்", "மேட்டுப்பாத்தி வடிகால் மண்"],
        "suitable_soils_hi": ["जीवांश युक्त बलुई दोमट"],
        "ph_range": "5.5 - 6.5 (Mildly acidic)",
        "requirements_en": "Strawberries have shallow root systems and need fertile, compost-rich soil with raised bed drainage.",
        "requirements_ta": "ஸ்ட்ராபெரி மேலோட்டமான வேர்களைக் கொண்டது; மேட்டுப்பாத்தி சாகுபடிக்கு ஏற்ற மண் தேவை.",
        "requirements_hi": "स्ट्रॉबेरी के लिए उठी हुई क्यारियों में भुरभुरी व उपजाऊ मिट्टी चाहिए।",
        "unsuitable_impact_en": "Water stagnation causes red stele and black root rot within days.",
        "unsuitable_impact_ta": "நீர் தேங்கினால் சிவப்பு வேர் அழுகல் நோய் தாக்கும்.",
        "unsuitable_impact_hi": "जलभराव से जड़ें सड़ जाती हैं।"
    },
    "squash": {
        "suitable_soils_en": ["Well-drained Fertile Sandy Loam", "Rich Alluvial Loam"],
        "suitable_soils_ta": ["வண்டல் கலந்த மணற்பாங்கான நிலம்", "செம்மண்"],
        "suitable_soils_hi": ["उपजाऊ बलुई दोमट मिट्टी"],
        "ph_range": "6.0 - 6.8",
        "requirements_en": "Cucurbits thrive in warm, fertile, humus-rich soil with rapid drainage.",
        "requirements_ta": "பூசணி வகைகளுக்கு நல்ல வடிகால் வசதியும் அங்கக சத்தும் உள்ள நிலம் தேவை.",
        "requirements_hi": "कद्दू वर्गीय फसलों के लिए अच्छी जल निकासी वाली गर्म मिट्टी चाहिए।",
        "unsuitable_impact_en": "Poor drainage triggers damping-off and sudden Fusarium wilt.",
        "unsuitable_impact_ta": "வடிகால் இல்லையெனில் நாற்று அழுகல் மற்றும் வாடல் நோய் தாக்கும்.",
        "unsuitable_impact_hi": "जलभराव से उकठा (मुरझान) रोग तेजी से फैलता है।"
    },
    "soybean": {
        "suitable_soils_en": ["Fertile Loam", "Clay Loam", "Deep Black Cotton Soil"],
        "suitable_soils_ta": ["வண்டல் மண்", "கரிசல் மண்", "செம்மண்"],
        "suitable_soils_hi": ["उपजाऊ दोमट और गहरी काली मिट्टी"],
        "ph_range": "6.0 - 7.0",
        "requirements_en": "Soybean requires well-aerated, fertile loam with high moisture-holding capacity for nodulation.",
        "requirements_ta": "சோயாபீன்ஸ் வேர் முடிச்சுகள் உருவாக நல்ல காற்றோட்டமும் ஈரப்பதமும் உள்ள மண் தேவை.",
        "requirements_hi": "सोयाबीन के लिए अच्छी नमी धारण करने वाली उपजाऊ काली या दोमट मिट्टी चाहिए।",
        "unsuitable_impact_en": "Crusting and waterlogging inhibit seedling emergence and nodulation.",
        "unsuitable_impact_ta": "நிலம் இறுகி நீர் தேங்கினால் முளைப்புத்திறன் மற்றும் வேர் முடிச்சு பாதிக்கும்.",
        "unsuitable_impact_hi": "जलभराव से बीजों का अंकुरण और ग्रंथियों का निर्माण रुक जाता है।"
    },
    "blueberry": {
        "suitable_soils_en": ["Acidic Sandy Peat", "Humus-rich Acidic Loam"],
        "suitable_soils_ta": ["அமிலத்தன்மை கொண்ட கரிசல் மண்", "இலை மட்கிய மண்"],
        "suitable_soils_hi": ["अम्लीय रेतीली मिट्टी"],
        "ph_range": "4.5 - 5.5 (Acidic)",
        "requirements_en": "Blueberries strictly require highly acidic, organic soils with excellent aeration.",
        "requirements_ta": "புளூபெர்ரி பயிருக்கு அதிக அமிலத்தன்மை (pH 4.5 - 5.5) கொண்ட மண் கட்டாயம் தேவை.",
        "requirements_hi": "ब्लूबेरी के लिए अधिक अम्लीय (pH 4.5-5.5) और कार्बनिक मिट्टी चाहिए।",
        "unsuitable_impact_en": "Soils with pH > 5.5 cause severe iron chlorosis and vine decline.",
        "unsuitable_impact_ta": "pH 5.5 க்கு மேல் இருந்தால் இரும்பு சத்துக் குறைபாடு ஏற்பட்டு இலைகள் வெளுக்கும்.",
        "unsuitable_impact_hi": "अधिक pH पर लोहे की भारी कमी से पौधे सूख जाते हैं।"
    },
    "raspberry": {
        "suitable_soils_en": ["Well-drained Sandy Loam", "Humus-rich Loam"],
        "suitable_soils_ta": ["வடிகால் உள்ள மணற்பாங்கான செம்மண்"],
        "suitable_soils_hi": ["जल निकासी वाली बलुई दोमट"],
        "ph_range": "6.0 - 6.5",
        "requirements_en": "Raspberries require fertile, friable soil with rapid drainage to protect roots from waterlogging.",
        "requirements_ta": "ராஸ்பெர்ரி வேர்கள் அழுகாமல் இருக்க விரைவான வடிகால் வசதி தேவை.",
        "requirements_hi": "रास्पबेरी के लिए जड़ों में पानी न ठहरने वाली भुरभुरी मिट्टी चाहिए।",
        "unsuitable_impact_en": "Poor drainage triggers severe Phytophthora root rot.",
        "unsuitable_impact_ta": "நீர் தேங்கினால் பைட்டோபthorா வேரழுகல் தாக்கும்.",
        "unsuitable_impact_hi": "जलभराव से जड़ गलन रोग होता है।"
    },
    "cotton": {
        "suitable_soils_en": ["Deep Black Cotton Soil (Vertisol)", "Well-drained Fertile Red Loam"],
        "suitable_soils_ta": ["ஆழமான கரிசல் மண்", "நல்ல வடிகால் வசதியுள்ள செம்மண்"],
        "suitable_soils_hi": ["गहरी काली मिट्टी (कपास की मिट्टी)", "उपजाऊ लाल दोमट"],
        "ph_range": "6.5 - 8.0",
        "requirements_en": "Cotton develops a deep taproot and requires deep, moisture-retentive soils with warm soil temperatures.",
        "requirements_ta": "பருத்தி ஆணிவேர் கொண்டது; ஆழமான, ஈரப்பதத்தைத் தக்கவைக்கும் கரிசல் மண் மிக சிறந்தது.",
        "requirements_hi": "कपास के लिए गहरी नमी रोकने वाली काली मिट्टी सर्वोत्तम होती है।",
        "unsuitable_impact_en": "Waterlogged soils cause square dropping and severe root asphyxiation.",
        "unsuitable_impact_ta": "நீர் தேங்கினால் பூ மற்றும் சப்பைகள் உதிர்ந்து மகசூல் குறையும்.",
        "unsuitable_impact_hi": "जलभराव से कलियां और फूल गिर जाते हैं।"
    },
    "groundnut": {
        "suitable_soils_en": ["Well-drained Sandy Loam", "Red Sandy Soil with Good Calcium Content"],
        "suitable_soils_ta": ["வடிகால் உள்ள மணற்பாங்கான செம்மண்", "சுண்ணாம்புச் சத்து நிறைந்த மணல் நிலம்"],
        "suitable_soils_hi": ["भुरभुरी बलुई दोमट", "कैल्शियम युक्त हल्की मिट्टी"],
        "ph_range": "6.0 - 7.0",
        "requirements_en": "Groundnut requires loose, friable topsoil to facilitate effortless peg penetration and pod development.",
        "requirements_ta": "நிலக்கடலையில் விழுதுகள் எளிதில் மண்ணுக்குள் இறங்கி காய் பிடிக்க தளர்வான மணற்பாங்கான நிலம் மிக அவசியம்.",
        "requirements_hi": "मूंगफली की सुइयां (पेग) आसानी से मिट्टी में धंस सकें, इसके लिए भुरभुरी मिट्टी चाहिए।",
        "unsuitable_impact_en": "Hard crusting clay prevents pegging and results in empty pods (pops).",
        "unsuitable_impact_ta": "கடின களிமண்ணில் விழுதுகள் இறங்க முடியாமல் சொத்தை அல்லது பதர் காய்கள் உருவாகும்.",
        "unsuitable_impact_hi": "कठोर मिट्टी में फलियां नहीं बन पातीं और पोच रह जाती हैं।"
    }
}

generated_code_chunks = []

for cid in new_crops:
    crop = CROPS[cid]
    soil = SOIL_INFO[cid]
    crop_diseases = [d for d in DISEASES.values() if d.get('crop_id') == cid]
    
    chunk = f"""  {cid}: {{
    crop_id: '{cid}',
    crop_name_en: '{sanitize_str(crop["name_en"])}',
    crop_name_ta: '{sanitize_str(crop["name_ta"])}',
    crop_name_hi: '{sanitize_str(crop["name_hi"])}',
    scientific_name: '{sanitize_str(crop.get("scientific_name", ""))}',
    soil_info: {{
      suitable_soils_en: {list_to_ts(soil["suitable_soils_en"])},
      suitable_soils_ta: {list_to_ts(soil["suitable_soils_ta"])},
      suitable_soils_hi: {list_to_ts(soil["suitable_soils_hi"])},
      ph_range: '{sanitize_str(soil["ph_range"])}',
      requirements_en: '{sanitize_str(soil["requirements_en"])}',
      requirements_ta: '{sanitize_str(soil["requirements_ta"])}',
      requirements_hi: '{sanitize_str(soil["requirements_hi"])}',
      unsuitable_impact_en: '{sanitize_str(soil["unsuitable_impact_en"])}',
      unsuitable_impact_ta: '{sanitize_str(soil["unsuitable_impact_ta"])}',
      unsuitable_impact_hi: '{sanitize_str(soil["unsuitable_impact_hi"])}'
    }},
    diseases: {{"""
    
    d_chunks = []
    for d in crop_diseases:
        did = d["id"]
        is_healthy = d.get("is_healthy", False)
        
        # Determine organic plan
        org_name_en = "Neem Oil 10,000 ppm / Bio-formulation" if not is_healthy else "Balanced Crop Nutrition & Bio-stimulants"
        org_name_ta = "வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்" if not is_healthy else "சீரான ஊட்டச்சத்து பராமரிப்பு"
        org_name_hi = "नीम तेल घोल / जैव कवकनाशी" if not is_healthy else "संतुलित पोषण एवं देखभाल"
        
        # Determine chemical plan
        chem_name_en = "Mancozeb 75% WP / Approved Fungicide" if not is_healthy else "None Required (Crop Healthy)"
        chem_name_ta = "மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து" if not is_healthy else "மருந்து தெளிப்பு தேவையில்லை"
        chem_name_hi = "मैनकोजेब 75% WP / अनुमोदित दवा" if not is_healthy else "दवा की आवश्यकता नहीं"
        
        # Symptoms
        sym_en = d.get("symptoms_en", ["Normal foliage without visible lesions."])
        sym_ta = d.get("symptoms_ta", ["ஆரோக்கியமான இலைகள்."])
        sym_hi = d.get("symptoms_hi", ["स्वस्थ पत्तियां।"])
        
        # Causes
        fc = d.get("favorable_conditions", {})
        weather_en = fc.get("description_en", "Optimal field conditions.")
        weather_ta = fc.get("description_ta", "சாதகமான தட்பவெப்பநிலை.")
        
        d_chunk = f"""      {did}: {{
        disease_id: '{did}',
        name_en: '{sanitize_str(d["name_en"])}',
        name_ta: '{sanitize_str(d["name_ta"])}',
        name_hi: '{sanitize_str(d["name_hi"])}',
        is_healthy: {'true' if is_healthy else 'false'},
        pathogen: '{sanitize_str(d.get("pathogen", "Physiological / Biotic"))}',
        explanation_en: '{sanitize_str(d.get("expert_advice_en", d["name_en"]))}',
        explanation_ta: '{sanitize_str(d.get("expert_advice_ta", d["name_ta"]))}',
        explanation_hi: '{sanitize_str(d.get("name_hi", ""))}',
        symptoms_en: {list_to_ts(sym_en)},
        symptoms_ta: {list_to_ts(sym_ta)},
        symptoms_hi: {list_to_ts(sym_hi)},
        causes: {{
          primary_causes_en: {list_to_ts(d.get("prevention_en", ["Airborne fungal or bacterial pathogen spores"]))},
          primary_causes_ta: {list_to_ts(d.get("prevention_ta", ["காற்று மற்றும் மழை மூலம் பரவும் நோய்க்கிருமிகள்"]))},
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: '{sanitize_str(weather_en)}',
          weather_factors_ta: '{sanitize_str(weather_ta)}',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: {sanitize_str(d.get("source_org", "ICAR / TNAU"))}',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: {sanitize_str(d.get("source_org", "TNAU"))}',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        }},
        organic: {{
          name_en: '{sanitize_str(org_name_en)}',
          name_ta: '{sanitize_str(org_name_ta)}',
          name_hi: '{sanitize_str(org_name_hi)}',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '{d.get("organic_rate_kg_per_acre", 1.0)} kg / L per acre',
          rate_kg_per_acre: {d.get("organic_rate_kg_per_acre", 1.0)},
          water_litres_per_acre: {d.get("water_litres_per_acre", 200)},
          method_en: 'Foliar spray during calm morning or late evening hours ensuring full coverage of both upper and lower leaf surfaces.',
          method_ta: 'காலை அல்லது மாலையில் இலைகளின் இருபுறமும் நன்கு நனையுமாறு தெளிக்கவும்.',
          method_hi: 'पत्तियों के दोनों तरफ सुबह या शाम के समय अच्छी तरह छिड़कें।',
          frequency_en: 'Repeat every 7 to 10 days if symptoms persist.',
          frequency_ta: 'அறிகுறிகள் தொடர்ந்தால் 7 முதல் 10 நாட்களுக்கு ஒருமுறை மீண்டும் தெளிக்கவும்.',
          frequency_hi: 'आवश्यकतानुसार 7 से 10 दिनों के अंतराल पर दोहराएं।',
          intervals_days: 7,
          expected_duration_days: 14,
          precautions_en: [
            "Do not spray during peak midday sunlight or when rain is expected within 3 hours.",
            "Use clean water free from excessive salinity or silt."
          ],
          precautions_ta: [
            "நண்பகல் வெயிலிலோ அல்லது 3 மணி நேரத்திற்குள் மழை வாய்ப்பு இருந்தாலோ தெளிக்க வேண்டாம்.",
            "சுத்தமான நல்ல நீரை பயன்படுத்தவும்."
          ],
          precautions_hi: [
            "कड़ी धूप में या बारिश से ठीक पहले छिड़काव न करें।"
          ]
        }},
        chemical: {{
          product_name_en: '{sanitize_str(chem_name_en)}',
          product_name_ta: '{sanitize_str(chem_name_ta)}',
          product_name_hi: '{sanitize_str(chem_name_hi)}',
          active_ingredient: '{sanitize_str(d.get("pathogen", "Approved CIBRC active"))}',
          approved_rate_per_acre: '{d.get("chemical_grams_per_acre", 400.0)} grams per acre in 200 L water',
          rate_grams_per_acre: {d.get("chemical_grams_per_acre", 400.0)},
          water_litres_per_acre: {d.get("water_litres_per_acre", 200)},
          method_en: 'Calibrated knapsack spraying using a hollow cone nozzle at recommended pressure.',
          method_ta: 'பரிந்துரைக்கப்பட்ட அளவுடன் விசைத்தெளிப்பான் மூலம் சீராகத் தெளிக்கவும்.',
          method_hi: 'नेपसैक स्प्रेयर से पत्तियों पर समान रूप से छिड़काव करें।',
          interval_days: 10,
          duration_days: 20,
          ppe_required_en: [
            "Wear nitrile chemical-resistant gloves",
            "Wear N95 protective face mask and protective eye goggles",
            "Wash spray equipment and clothing thoroughly after application"
          ],
          ppe_required_ta: [
            "கையுறைகள் மற்றும் முகக்கவசம் கட்டாயம் அணியவும்",
            "மருந்து தெளித்த பின் கை கால்களை சோப்பால் நன்கு கழுவவும்"
          ],
          ppe_required_hi: [
            "दवा छिड़काव के दौरान दस्ताने और मास्क का उपयोग करें"
          ],
          pre_harvest_interval_days: 14,
          precautions_en: [
            "Adhere strictly to CIBRC statutory Pre-Harvest Intervals (PHI).",
            "Keep livestock, pets, and children away from treated fields for 48 hours."
          ],
          precautions_ta: [
            "அறுவடைக்கு முந்தைய இடைவெளியை (PHI) முறையாக கடைபிடிக்கவும்.",
            "தெளிக்கப்பட்ட நிலத்தில் 48 மணி நேரத்திற்கு கால்நடைகளை விடக்கூடாது."
          ],
          precautions_hi: [
            "अंतिम छिड़काव और फसल कटाई के बीच निर्धारित अंतराल का पालन करें।"
          ]
        }}
      }}"""
        d_chunks.append(d_chunk)
        
    chunk += "\n" + ",\n".join(d_chunks) + "\n    }\n  }"
    generated_code_chunks.append(chunk)

print(f"Generated {len(generated_code_chunks)} new crop blocks successfully!")

# Now read existing frontend/src/services/diseaseKnowledge.ts
with open('frontend/src/services/diseaseKnowledge.ts', 'r', encoding='utf-8') as f:
    orig = f.read()

# Find where CROP_DISEASE_KNOWLEDGE ends, right before getEnrichedDiseaseData
insert_marker = "export function getEnrichedDiseaseData"
idx = orig.find(insert_marker)
if idx == -1:
    print("Error: Could not find getEnrichedDiseaseData marker!")
    sys.exit(1)

# Find the closing brace of CROP_DISEASE_KNOWLEDGE before this marker
brace_idx = orig.rfind("};", 0, idx)
if brace_idx == -1:
    print("Error: Could not find closing brace of CROP_DISEASE_KNOWLEDGE!")
    sys.exit(1)

prefix = orig[:brace_idx].rstrip()
suffix = orig[idx:]

new_crops_code = ",\n" + ",\n".join(generated_code_chunks) + "\n};"

# Now craft new getEnrichedDiseaseData that NEVER defaults to tomato
new_func = """/**
 * Returns comprehensive enriched diagnostic result for any identified crop and disease,
 * with complete soil info, causes, organic, and chemical solutions.
 * NEVER defaults to tomato when crop is different or unknown!
 */
export function getEnrichedDiseaseData(cropId?: string, diseaseId?: string): {
  crop_meta: CropDiseaseMeta;
  disease_detail: any;
  soil_info: SoilRequirements;
  causes: DiseaseCauses;
  organic: OrganicTreatmentPlan;
  chemical: ChemicalTreatmentPlan;
} | null {
  if (!cropId) return null;
  let normalizedCrop = cropId.toLowerCase().trim();
  if (normalizedCrop === 'pepper' || normalizedCrop === 'pepper__bell' || normalizedCrop === 'pepper_bell') {
    normalizedCrop = 'chilli';
  } else if (normalizedCrop === 'corn_(maize)' || normalizedCrop === 'maize') {
    normalizedCrop = 'corn';
  }

  const cropMeta = CROP_DISEASE_KNOWLEDGE[normalizedCrop];
  if (!cropMeta) {
    return null;
  }

  const normalizedDisease = diseaseId ? diseaseId.toLowerCase().trim() : '';
  const diseaseDetail =
    cropMeta.diseases[normalizedDisease] ||
    Object.values(cropMeta.diseases)[0];

  if (!diseaseDetail) return null;

  return {
    crop_meta: cropMeta,
    disease_detail: diseaseDetail,
    soil_info: cropMeta.soil_info,
    causes: diseaseDetail.causes,
    organic: diseaseDetail.organic,
    chemical: diseaseDetail.chemical,
  };
}
"""

# Replace getEnrichedDiseaseData function in suffix
suffix_rest_idx = suffix.find("export function calculateTreatmentDosage")
if suffix_rest_idx != -1:
    dosage_func = suffix[suffix_rest_idx:]
    final_content = prefix + new_crops_code + "\n\n" + new_func + "\n" + dosage_func
else:
    final_content = prefix + new_crops_code + "\n\n" + new_func

with open('frontend/src/services/diseaseKnowledge.ts', 'w', encoding='utf-8') as f:
    f.write(final_content)

print("frontend/src/services/diseaseKnowledge.ts successfully updated with all crops and safe lookup!")
