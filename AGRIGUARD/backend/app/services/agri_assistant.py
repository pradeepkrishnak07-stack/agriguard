import re
from typing import Dict, Any, List
from ..data.knowledge_base import CROPS, DISEASES, FERTILIZER_GUIDELINES

class AgriAssistant:
    """
    Bilingual (Tamil & English) Conversational Agronomy Assistant.
    Provides verified agricultural guidance tailored to smallholder farmers,
    grounded in TNAU and ICAR package of practices.
    """

    def process_query(self, query: str, crop_hint: str = "tomato", language: str = "ta") -> Dict[str, Any]:
        text = (query or "").strip().lower()
        if not text:
            return {
                "success": False,
                "reply_en": "Please type or speak your farming question.",
                "reply_ta": "உங்கள் விவசாயக் கேள்வியைப் பேசவும் அல்லது எழுதவும்.",
                "spoken_text": "உங்கள் விவசாயக் கேள்வியைப் பேசவும் அல்லது எழுதவும்." if language == "ta" else "Please ask your farming question."
            }

        # 1. Disease prevention queries (e.g. "தக்காளி செடியில் நோய் வராமல் இருக்க என்ன செய்ய வேண்டும்?")
        if any(w in text for w in ["நோய் வராமல்", "கருகல்", "பூஞ்சை", "நோய்", "disease", "blight", "fungus", "prevent disease"]):
            if "நெல்" in text or "rice" in text or "paddy" in text:
                ans_en = "To prevent blast and sheath blight in rice: Treat seeds with Pseudomonas fluorescens (10 g/kg). Avoid excessive urea application. Apply urea in 3-4 split doses combined with potash. Spray Pseudomonas (2.5 kg/ha) at tillering stage."
                ans_ta = "நெல் பயிரில் குலை நோய் மற்றும் இலைக்கருகல் வராமல் தடுக்க: ஒரு கிலோ விதைக்கு 10 கிராம் சூடோமோனாஸ் கலந்து விதை நேர்த்தி செய்யவும். யூரியாவை ஒரே நேரத்தில் இடாமல், பொட்டாஷ் உரத்துடன் கலந்து 3-4 தவணைகளாக இடவும். தூர்கட்டும் பருவத்தில் சூடோமோனாஸ் தெளிக்கவும்."
            else:
                ans_en = "To prevent diseases in tomato: Maintain proper 60x45 cm plant spacing for good airflow. Use drip irrigation so foliage stays dry. Apply 5% Neem Seed Kernel Extract (NSKE) or Pseudomonas fluorescens (5 g/L) every 15 days as a preventive shield."
                ans_ta = "தக்காளி செடியில் நோய் வராமல் இருக்க: செடிகளுக்கு இடையே 60x45 செ.மீ இடைவெளி விட்டு நல்ல காற்றோட்டம் தரவும். இலைகள் நனையாதவாறு சொட்டுநீர்ப் பாசனம் செய்யவும். 15 நாட்களுக்கு ஒருமுறை சூடோமோனாஸ் (5 கிராம்/லிட்டர்) அல்லது 5% வேப்பங்கொட்டை கரைசல் முன்னெச்சரிக்கையாக தெளிக்கவும்."
            return self._build_response(ans_en, ans_ta, language, "Disease Prevention", "நோய் தடுப்பு முறை")

        # 2. Fertilizer queries (e.g. "உரம் எப்போது இட வேண்டும்?", "fertilizer timing")
        if any(w in text for w in ["உரம்", "யூரியா", "fertilizer", "urea", "dap", "potash", "manure"]):
            if "நெல்" in text or "rice" in text:
                ans_en = "For rice: Apply all Phosphorus and 25% Nitrogen & Potassium as basal before transplanting. Top-dress 50% Nitrogen and 25% Potash during active tillering (20-25 days), and the final split at panicle initiation (40-45 days)."
                ans_ta = "நெல் பயிருக்கு: நடவுக்கு முன் அடி உரமாக முழு மணிச்சத்து, 25% தழைச்சத்து மற்றும் 25% சாம்பல் சத்து இடவும். நட்ட 20-25 நாளில் தூர்கட்டும் பருவத்தில் 50% தழைச்சத்து இடவும். கதிர் உருவாகும் 40-45 நாளில் கடைசி தவணை உரம் இடவும்."
            else:
                ans_en = "For tomato: Apply Farmyard Manure (25 t/ha) with full Phosphorus and 25% Nitrogen/Potash as basal dose. Top-dress remaining Nitrogen and Potash in two splits: at 30 days after transplanting and at flowering (45 days)."
                ans_ta = "தக்காளிக்கு: நடவின் போது மக்கிய தொழு உரம், முழு மணிச்சத்து, கால் பங்கு தழைச்சத்து மற்றும் பொட்டாஷ் அடி உரமாக இடவும். நட்ட 30-ம் நாள் வளர்ச்சிப் பருவத்திலும், 45-ம் நாள் பூக்கும் பருவத்திலும் மீதி தழை மற்றும் பொட்டாஷ் உரங்களை இடவும்."
            return self._build_response(ans_en, ans_ta, language, "Fertilizer Schedule", "உர அட்டவணை")

        # 3. Irrigation queries (e.g. "தண்ணீர் எப்போது பாய்ச்ச வேண்டும்?", "water schedule")
        if any(w in text for w in ["தண்ணீர்", "நீர்ப்பாசனம்", "water", "irrigation", "irrigate", "watering"]):
            ans_en = "Irrigate based on soil moisture and forecast rain. Avoid watering during mid-day heat to reduce evaporation. During critical flowering and fruit development, ensure consistent moisture without waterlogging."
            ans_ta = "மண்ணின் ஈரப்பதம் மற்றும் மழை வாய்ப்பை கவனித்து நீர் பாய்ச்சவும். நண்பகல் வெயிலில் பாய்ச்சாமல் அதிகாலை அல்லது மாலையில் நீர் பாய்ச்சவும். பூக்கும் மற்றும் காய் பிடிக்கும் பருவத்தில் நிலம் காய்ந்து வெடிக்காமல் சீரான ஈரம் காப்பது அவசியம்."
            return self._build_response(ans_en, ans_ta, language, "Watering Advice", "நீர்ப்பாசன ஆலோசனை")

        # 4. Rain & Pesticide queries (e.g. "மழை வரும்போது பூச்சிக்கொல்லி அடிக்கலாமா?")
        if any(w in text for w in ["மழை வரும்போது மருந்து", "rain pesticide", "மழை மருந்து", "spray rain"]):
            ans_en = "Do not spray pesticides or fungicides if rain is expected within 4 to 6 hours. Rain will wash off the active chemical, wasting money and contaminating local runoff. Wait for clear weather and dry leaves."
            ans_ta = "அடுத்த 4 முதல் 6 மணி நேரத்திற்குள் மழை வர வாய்ப்பிருந்தால் பூச்சிக்கொல்லி அல்லது பூஞ்சைக்கொல்லி மருந்துகளை தெளிக்க வேண்டாம். மழை நீரினால் மருந்து அடித்துச் செல்லப்பட்டு வீணாகிவிடும். இலைகள் காய்ந்த பின் தெளிக்கவும்."
            return self._build_response(ans_en, ans_ta, language, "Spraying Advice", "மருந்து தெளிப்பு எச்சரிக்கை")

        # 5. Organic farming / Bio-control queries
        if any(w in text for w in ["இயற்கை", "organic", "பஞ்சகாவ்யா", "panchagavya", "வேப்ப எண்ணெய்", "neem"]):
            ans_en = "Organic crop protection: Spray 3% Panchagavya solution (30 mL/L) to boost plant vigor. For sucking pests, spray 2% Neem oil with soap nut solution. Apply Trichoderma viride to soil to control root rot."
            ans_ta = "இயற்கை வழி வேளாண்மை: பயிர் வளர்ச்சிக்கு 3% பஞ்சகாவ்யா (30 மி.லி/லிட்டர்) தெளிக்கவும். அசுவினி போன்ற சாறு உறிஞ்சும் பூச்சிகளுக்கு 2% வேப்பெண்ணெய் கரைசல் தெளிக்கவும். வேரழுகல் நோயைத் தடுக்க டிரைக்கோடெர்மா விரிடி இடவும்."
            return self._build_response(ans_en, ans_ta, language, "Organic Practices", "இயற்கை வேளாண்மை")

        # 6. Leaf yellowing / Chlorosis / Nutrient deficiency queries (e.g. "என்னுடைய தக்காளி செடியில் இலைகள் மஞ்சள் நிறமாக மாறுகிறது. இதற்கு என்ன காரணம்?")
        if any(w in text for w in ["மஞ்சள்", "மஞ்சள் நிறம்", "மஞ்சளாக", "yellow", "yellowing", "chlorosis", "पीली", "पीला", "पीले"]):
            if "தக்காளி" in text or "tomato" in text or crop_hint == "tomato":
                ans_en = (
                    "Common reasons for yellow leaves in tomato plants:\n"
                    "1. Nitrogen Deficiency: Older, bottom leaves turn uniformly pale yellow. Remedy: Spray 1% Urea solution (10 g/L water) or top-dress balanced nitrogen.\n"
                    "2. Overwatering & Poor Drainage: Causes root suffocation and pale yellow drooping leaves. Ensure proper drainage and avoid waterlogging.\n"
                    "3. Early Blight (Alternaria solani): Brown spots with yellow halos on lower foliage. Remedy: Spray Mancozeb (2 g/L) or Copper Oxychloride.\n"
                    "4. Tomato Leaf Curl Virus (spread by Whiteflies): Leaves turn yellow, stunted, and curl upwards. Remedy: Install yellow sticky traps and spray 2% Neem oil."
                )
                ans_ta = (
                    "தக்காளி செடியில் இலைகள் மஞ்சள் நிறமாக மாறுவதற்கு முக்கிய காரணங்கள்:\n"
                    "1. தழைச்சத்து (நைட்ரஜன்) குறைபாடு: முதிர்ந்த கீழ் இலைகள் சீராக வெளிர் மஞ்சள் நிறமாக மாறும். தீர்வு: 10 லிட்டர் தண்ணீரில் 100 கிராம் யூரியா (1%) கலந்து இலைகளில் தெளிக்கவும்.\n"
                    "2. அதிக நீர் அல்லது நீர் தேக்கம்: வேர் சுவாசம் பாதிக்கப்பட்டு இலைகள் வாடி மஞ்சளாகும். நிலத்தில் நீர் தேங்காமல் வடிகால் வசதி செய்து, மண் ஈரம் குறையும் வரை நீர்ப்பாசனத்தைக் கட்டுப்படுத்தவும்.\n"
                    "3. இலைக்கருகல் நோய் (Early Blight): கீழ் இலைகளில் வளையங்களுடன் கூடிய பழுப்புப் புள்ளிகளைச் சுற்றி மஞ்சள் வளையம் தோன்றும். தீர்வு: மேன்கோசெப் (2 கிராம்/லிட்டர்) தெளிக்கவும்.\n"
                    "4. இலை சுருட்டல் நச்சுயிரி (Tomato Leaf Curl Virus): வெள்ளை ஈக்களால் பரவி இலைகள் மஞ்சள் நிறமாகி மேல்நோக்கி சுருளும். தீர்வு: மஞ்சள் நிற ஒட்டும் பொறி வைத்து, வேப்ப எண்ணெய் (3 மி.லி/லிட்டர்) தெளிக்கவும்."
                )
                ans_hi = (
                    "टमाटर के पौधों में पत्तियां पीली होने के मुख्य कारण:\n"
                    "1. नाइट्रोजन की कमी: निचली पुरानी पत्तियां पीली हो जाती हैं। समाधान: 1% यूरिया घोल (10 ग्राम/लीटर) का छिड़काव करें।\n"
                    "2. अधिक जलभराव: जड़ों को हवा न मिलने से पत्तियां पीली पड़ती हैं। उचित जल निकासी करें।\n"
                    "3. अगेती झुलसा: धब्बों के चारों ओर पीला छल्ला बनता है। समाधान: मैंकोजेब (2 ग्राम/लीटर) का छिड़काव करें।\n"
                    "4. पर्ण कुंचन विषाणु (Leaf Curl): पत्तियां पीली होकर ऊपर मुड़ती हैं। समाधान: 2% नीम तेल छिड़कें।"
                )
                return self._build_response(ans_en, ans_ta, language, "Leaf Yellowing Diagnosis", "இலை மஞ்சள் நிறமாவதற்கான காரணங்கள்", ans_hi, "पत्तियों के पीलेपन का निदान")
            elif "நெல்" in text or "rice" in text or "paddy" in text or crop_hint == "rice":
                ans_en = (
                    "Yellowing in rice leaves is usually due to:\n"
                    "1. Nitrogen Deficiency: Tips of older leaves turn yellow along the midrib in an inverted 'V' shape. Remedy: Apply 25-30 kg/acre Urea top-dressing.\n"
                    "2. Zinc Deficiency (Khaira): Dusty brown spots appear on yellowing middle leaves. Remedy: Foliar spray of Zinc Sulphate (5 g/L).\n"
                    "3. Iron Chlorosis: Young leaves turn pale yellow or white. Remedy: Spray Ferrous Sulphate (10 g/L)."
                )
                ans_ta = (
                    "நெல் பயிரில் இலைகள் மஞ்சள் நிறமாவதற்கான முக்கிய காரணங்கள்:\n"
                    "1. தழைச்சத்து குறைபாடு: முதிர்ந்த இலைகள் நுனியில் இருந்து நரம்பு வழியாக 'V' வடிவில் மஞ்சள் நிறமாகும். தீர்வு: ஏக்கருக்கு 25-30 கிலோ யூரியா மேலுரமாக இடவும்.\n"
                    "2. துத்தநாக (Zinc) குறைபாடு: நடு இலைகள் மஞ்சள் நிறமாகி துரு போன்ற பழுப்பு புள்ளிகள் தோன்றும். தீர்வு: ஜிங்க் சல்பேட் (5 கிராம்/லிட்டர்) தெளிக்கவும்.\n"
                    "3. இரும்புச்சத்து குறைபாடு: இளம் குருத்து இலைகள் வெளிறி மஞ்சள் அல்லது வெள்ளையாக மாறும். தீர்வு: அன்னபேதி (10 கிராம்/லிட்டர்) தெளிக்கவும்."
                )
                ans_hi = (
                    "धान में पत्तियों के पीलेपन के मुख्य कारण:\n"
                    "1. नाइट्रोजन की कमी: पुरानी पत्तियां नोक से 'V' आकार में पीली होती हैं। यूरिया की टॉप ड्रेसिंग करें।\n"
                    "2. जिंक की कमी (खैरा रोग): पत्तियों पर कत्थई धब्बे बनते हैं। जिंक सल्फेट (5 ग्राम/लीटर) छिड़कें।\n"
                    "3. आयरन की कमी: नई पत्तियां पीली या सफेद होती हैं। फेरस सल्फेट का छिड़काव करें।"
                )
                return self._build_response(ans_en, ans_ta, language, "Rice Chlorosis Diagnosis", "நெல் இலை மஞ்சள் நிறக் குறைபாடு", ans_hi, "धान में पीलेपन का निदान")
            else:
                ans_en = "Leaf yellowing (chlorosis) is primarily caused by nitrogen or iron deficiency, root-zone waterlogging, or sap-sucking pests. Inspect leaf undersides for pests, improve soil drainage, and apply balanced NPK."
                ans_ta = "இலைகள் மஞ்சள் நிறமாவது பொதுவாக தழைச்சத்து குறைபாடு, அதிக நீர் தேக்கம் அல்லது சாறு உறிஞ்சும் பூச்சிகளால் ஏற்படுகிறது. இலைகளின் அடிப்பகுதியில் பூச்சிகள் உள்ளதா எனப் பார்த்து, நீர் தேங்காமல் பாதுகாத்து, சமச்சீர் உரம் இடவும்."
                ans_hi = "पत्तियों का पीला पड़ना नाइट्रोजन की कमी, जलभराव या रस चूसक कीटों के कारण होता है। खेत में पानी न भरने दें और संतुलित खाद दें।"
                return self._build_response(ans_en, ans_ta, language, "Nutrient Diagnosis", "ஊட்டச்சத்து குறைபாடு", ans_hi, "पोषक तत्व निदान")

        # 7. Fallback with helpful direction
        ans_en = f"I am your AGRIGUARD farming assistant. You can ask me about crop diseases, prevention methods, fertilizer schedules, watering advice, or organic sprays for {CROPS.get(crop_hint, {}).get('name_en', 'your crops')}."
        ans_ta = f"நான் உங்கள் அக்ரிகார்ட் விவசாய உதவியாளர். பயிர் நோய்கள், தடுப்பு முறைகள், உர அட்டவணை, நீர்ப்பாசனம் அல்லது இயற்கை பூச்சி மேலாண்மை பற்றி என்னிடம் கேட்கலாம்."
        ans_hi = f"मैं आपका एग्रीगार्ड कृषि सहायक हूँ। आप मुझसे फसल रोगों, रोकथाम के तरीकों, खाद, सिंचाई और जैविक उपचार के बारे में पूछ सकते हैं।"
        return self._build_response(ans_en, ans_ta, language, "AGRIGUARD Assistant", "விவசாய வழிகாட்டி", ans_hi, "कृषि सहायक")

    def process_fertilizer_query(self, query: str, context: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        text = (query or "").strip().lower()
        lang = language if language in ["ta", "en", "hi"] else "en"

        if not text:
            msg_en = "Please enter your question about the fertilizer recommendation."
            msg_ta = "உங்கள் உரப் பரிந்துரை குறித்த கேள்வியை உள்ளிடவும்."
            msg_hi = "कृपया उर्वरक अनुशंसा के बारे में अपना प्रश्न लिखें।"
            return self._build_response(msg_en, msg_ta, lang, "Fertilizer Assistant", "உர வழிகாட்டி", msg_hi, "उर्वरक सहायक")

        # Extract context fields safely
        rec = context.get("recommendation") if isinstance(context.get("recommendation"), dict) else context
        crop_info = rec.get("crop_info", {})
        crop_name_en = crop_info.get("name_en") or context.get("crop_name") or "Your crop"
        crop_name_ta = crop_info.get("name_ta") or crop_name_en
        crop_name_hi = crop_info.get("name_hi") or crop_name_en
        growth_stage = crop_info.get("growth_stage") or context.get("growth_stage") or "Vegetative"
        land_area = crop_info.get("land_area") or context.get("land_area") or 1.0
        land_unit = crop_info.get("land_unit") or context.get("land_unit") or "Acre"
        budget = crop_info.get("fertilizer_budget_inr") or context.get("budget_inr") or 0.0
        cost_analysis = rec.get("cost_analysis", {})
        est_cost = cost_analysis.get("estimated_total_cost_inr") or context.get("estimated_cost_inr") or 0.0
        active_items = rec.get("active_plan_items", [])
        schedule = rec.get("schedule", [])
        
        # Build active fertilizer names string
        item_names_en = ", ".join([i.get("fertilizer_name_en", "") for i in active_items if i.get("fertilizer_name_en")]) or "Urea, SSP, MOP and Organic Manure"
        item_names_ta = ", ".join([i.get("fertilizer_name_ta", "") for i in active_items if i.get("fertilizer_name_ta")]) or "யூரியா, SSP, MOP மற்றும் தொழு உரம்"
        item_names_hi = ", ".join([i.get("fertilizer_name_hi", "") for i in active_items if i.get("fertilizer_name_hi")]) or "यूरिया, एसएसपी, एमओपी और जैविक खाद"

        ans_en = ""
        ans_ta = ""
        ans_hi = ""
        topic_en = "Fertilizer Guidance"
        topic_ta = "உர ஆலோசனை"
        topic_hi = "उर्वरक सलाह"

        # 1. Budget questions: "How does this recommendation fit my budget?", "budget", "cost", "விலை", "செலவு", "बजट"
        if any(w in text for w in ["budget", "cost", "price", "afford", "expensive", "cheap", "பட்ஜெட்", "செலவு", "விலை", "बजट", "लागत", "खर्च"]):
            diff = abs(est_cost - budget)
            if est_cost <= budget:
                ans_en = f"Good news! The estimated total cost of ₹{est_cost:,.0f} is within your stated budget of ₹{budget:,.0f}, giving you an estimated savings of ₹{diff:,.0f}. You can invest these savings in certified bio-fertilizers or protective micronutrient sprays."
                ans_ta = f"மகிழ்ச்சியான செய்தி! மதிப்பிடப்பட்ட மொத்த செலவு ₹{est_cost:,.0f}, உங்கள் பட்ஜெட்டான ₹{budget:,.0f}-க்குள் அடங்குகிறது (சேமிப்பு: ₹{diff:,.0f}). இந்த சேமிப்பை உயிர் உரங்கள் அல்லது நுண்ணூட்ட சத்து தெளிப்பிற்கு பயன்படுத்தலாம்."
                ans_hi = f"अच्छी खबर! अनुमानित कुल लागत ₹{est_cost:,.0f} आपके बजट ₹{budget:,.0f} के भीतर है (बचत: ₹{diff:,.0f})। इस बचत का उपयोग आप जैव उर्वरक या सूक्ष्म पोषक तत्वों के लिए कर सकते हैं।"
            else:
                ans_en = f"The estimated total cost (₹{est_cost:,.0f}) exceeds your stated budget of ₹{budget:,.0f} by ₹{diff:,.0f}. To reduce costs: 1) Use on-farm well-decomposed cow dung/compost instead of purchasing commercial FYM (saves up to ₹1,500/acre). 2) Choose Single Super Phosphate (SSP) over expensive DAP. 3) Apply Urea in ring-placement near root zones instead of broadcasting to cut fertilizer loss by 30%."
                ans_ta = f"மதிப்பிடப்பட்ட மொத்த செலவு ₹{est_cost:,.0f}, உங்கள் பட்ஜெட்டான ₹{budget:,.0f}-ஐ விட ₹{diff:,.0f} அதிகம். செலவைக் குறைக்க: 1) வெளிச்சந்தையில் தொழு உரம் வாங்குவதற்குப் பதிலாக பண்ணை மாட்டுச் சாண உரத்தைப் பயன்படுத்துங்கள். 2) டிஏபிக்கு பதிலாக குறைந்த விலையில் கந்தகம் கொண்ட SSP பயன்படுத்துங்கள். 3) யூரியாவை தூவாமல் வேர்ப்பகுதியில் வளையமிட்டு இடுவதன் மூலம் 30% விரயத்தை தவிர்க்கலாம்."
                ans_hi = f"अनुमानित कुल लागत ₹{est_cost:,.0f} आपके बजट ₹{budget:,.0f} से ₹{diff:,.0f} अधिक है। लागत घटाने के उपाय: 1) बाजार से गोबर खाद खरीदने के बजाय खेत की खाद प्रयोग करें (₹1,500/एकड़ तक बचत)। 2) महंगे डीएपी के स्थान पर एसएसपी (SSP) चुनें। 3) यूरिया को छिड़कने के बजाय जड़ों के पास दें जिससे 30% बर्बादी बचे।"
            topic_en = "Budget & Cost Optimization"
            topic_ta = "பட்ஜெட் & செலவு மேலாண்மை"
            topic_hi = "बजट और लागत प्रबंधन"

        # 2. "What does NPK mean?", "npk", "என்.பி.கே", "एनपीके"
        elif any(w in text for w in ["what does npk mean", "npk mean", "what is npk", "npk", "தழை", "மணி", "சாம்பல்", "एनपीके"]):
            ans_en = (
                "NPK represents the three primary macronutrients essential for all plant life:\n"
                "• N (Nitrogen): Drives lush vegetative growth, green leaf canopy, and chlorophyll synthesis. Crucial in early stages.\n"
                "• P (Phosphorus): Stimulates deep root establishment, vigorous flowering, and early crop maturity.\n"
                "• K (Potassium / Potash): Builds stalk strength, provides drought & disease resistance, and improves fruit size, shine, and storage quality."
            )
            ans_ta = (
                "NPK என்பது தாவரங்களுக்கு தேவையான மூன்று முதன்மை சத்துக்கள்:\n"
                "• N (தழைச்சத்து - நைட்ரஜன்): இலைகளின் பசுமை வளர்ச்சி, பச்சைய உருவாக்கம் மற்றும் புதிய தளிர்களுக்கு அத்தியாவசியம்.\n"
                "• P (மணிச்சத்து - பாஸ்பரஸ்): ஆழமான வேர் வளர்ச்சி, பூக்கள் தோன்றுதல் மற்றும் சீரான பயிர் முதிர்ச்சிக்கு தேவை.\n"
                "• K (சாம்பல் சத்து - பொட்டாசியம்): தண்டு உறுதி, வறட்சி மற்றும் நோய் எதிர்ப்புத் திறன், காய்/தானிய திரட்சி மற்றும் எடைக்கு மிக முக்கியம்."
            )
            ans_hi = (
                "NPK पौधों के लिए आवश्यक तीन मुख्य प्राथमिक पोषक तत्व हैं:\n"
                "• N (नाइट्रोजन): पत्तियों की हरियाली, वानस्पतिक विकास और क्लोरोफिल निर्माण के लिए जरूरी है।\n"
                "• P (फॉस्फोरस): जड़ों के मजबूत विकास, भरपूर फूल आने और फसल पकने में मदद करता है।\n"
                "• K (पोटैशियम / पोटाश): तने की मजबूती, सूखा व कीट-रोग प्रतिरोधक क्षमता और फल व दाने की चमक व वजन बढ़ाता है।"
            )
            topic_en = "NPK Primary Nutrients Explained"
            topic_ta = "NPK முதன்மை சத்துக்களின் விளக்கம்"
            topic_hi = "NPK पोषक तत्वों का महत्व"

        # 3. "When should I apply it?", "timing", "schedule", "when to apply", "எப்போது இட வேண்டும்", "நேரம்", "कब डालें"
        elif any(w in text for w in ["when should i apply", "when to apply", "timing", "schedule", "stage", "எப்போது", "காலம்", "தவணை", "कब डालें", "कब देना"]):
            basal_text_en = schedule[0].get("timing_en", "Basal (Days 0-7)") if len(schedule) > 0 else "Basal at planting"
            basal_act_en = schedule[0].get("chemical_action_en", "") or schedule[0].get("organic_action_en", "") if len(schedule) > 0 else ""
            veg_text_en = schedule[1].get("timing_en", "Vegetative Stage (Day 25-35)") if len(schedule) > 1 else "Vegetative Top Dressing"
            veg_act_en = schedule[1].get("chemical_action_en", "") or schedule[1].get("organic_action_en", "") if len(schedule) > 1 else ""
            flow_text_en = schedule[2].get("timing_en", "Flowering Stage (Day 45-60)") if len(schedule) > 2 else "Flowering Top Dressing"
            flow_act_en = schedule[2].get("chemical_action_en", "") or schedule[2].get("organic_action_en", "") if len(schedule) > 2 else ""

            ans_en = (
                f"Application schedule for your {crop_name_en} ({land_area} {land_unit}):\n"
                f"1. {basal_text_en}: Apply entire Phosphorus (SSP), organic manure, and 25% Nitrogen & 50% Potash as basal dose in the root zone.\n"
                f"2. {veg_text_en}: Top-dress 40% Urea in moist soil after hand weeding to spur vegetative canopy.\n"
                f"3. {flow_text_en}: Apply remaining 35% Urea and 50% MOP to support flower retention and fruit enlargement."
            )
            ans_ta = (
                f"உங்கள் {crop_name_ta} பயிரின் உர அட்டவணை ({land_area} {land_unit}):\n"
                f"1. அடி உரம் (விதைக்கும் / நடும் போது): முழு மணிச்சத்து (SSP), மக்கிய தொழு உரம் மற்றும் கால் பங்கு தழை & பொட்டாஷ் உரங்களை இடவும்.\n"
                f"2. முதல் மேலுரம் (நட்ட 25-35 வது நாள்): களை எடுத்த பின் மண்ணில் ஈரம் இருக்கும் போது 40% யூரியா மேலுரமாக இடவும்.\n"
                f"3. இரண்டாம் மேலுரம் (பூக்கும் / காய் பிடிக்கும் பருவம்): மீதி 35% யூரியா மற்றும் 50% பொட்டாஷ் உரம் இட்டு காய் திரட்சியை அதிகரிக்கவும்."
            )
            ans_hi = (
                f"आपकी {crop_name_hi} फसल के लिए खाद डालने का समय ({land_area} {land_unit}):\n"
                f"1. बुवाई/रोपाई के समय (बेसल डोज): पूरा एसएसपी (फॉस्फोरस), गोबर की खाद और 25% यूरिया व 50% पोटाश डालें।\n"
                f"2. पहली टॉप ड्रेसिंग (25-35 दिन बाद): निराई के बाद नमी वाले खेत में 40% यूरिया दें।\n"
                f"3. दूसरी टॉप ड्रेसिंग (फूल व फल बनने पर): बचा हुआ 35% यूरिया और 50% पोटाश देकर फल का विकास तेज करें।"
            )
            topic_en = "Application Schedule & Timing"
            topic_ta = "உரமிடும் கால அட்டவணை"
            topic_hi = "खाद देने का सही समय"

        # 4. "Why is this fertilizer recommended?" / "Why urea/ssp/mop/fym"
        elif any(w in text for w in ["why is this fertilizer recommended", "why recommended", "why urea", "why ssp", "why mop", "why fym", "ஏன் பரிந்துரைக்கப்பட்டது", "ஏன் இந்த உரம்", "यह खाद क्यों"]):
            ans_en = (
                f"This plan is scientifically calibrated for {crop_name_en} across {land_area} {land_unit} based on TNAU/ICAR agronomic standards:\n"
                f"• {item_names_en} was selected to supply required elemental nutrients without toxic excess.\n"
                f"• Single Super Phosphate (SSP) is recommended because it provides both Phosphorus (16%) for root vigor and Sulphur (11%) for protein synthesis at lower cost than DAP.\n"
                f"• Neem-Coated Urea prevents rapid nitrogen volatilization and matches crop uptake stages.\n"
                f"• Muriate of Potash (MOP) ensures thick cell walls, lodging prevention, and high-grade produce."
            )
            ans_ta = (
                f"இந்த உரப் பரிந்துரை {land_area} {land_unit} {crop_name_ta} பயிருக்காக TNAU/ICAR தரநிலைகளின்படி கணக்கிடப்பட்டுள்ளது:\n"
                f"• {item_names_ta} பயிரின் முழுமையான சமச்சீர் ஊட்டச்சத்து தேவையை பூர்த்தி செய்கிறது.\n"
                f"• சிங்கிள் சூப்பர் பாஸ்பேட் (SSP) மணிச்சத்து (16%) உடன் 11% கந்தக சத்தையும் வழங்குவதால் டிஏபியை விட சிறந்தது.\n"
                f"• வேப்பம் பூசிய யூரியா தழைச்சத்து ஆவியாவதைத் தடுத்து செடிக்கு சீராக கிடைக்கிறது.\n"
                f"• பொட்டாஷ் உரம் தண்டு உறுதியை தந்து காய் திரட்சிக்கும், பூச்சி-நோய் எதிர்ப்புக்கும் இன்றியமையாதது."
            )
            ans_hi = (
                f"यह सिफारिश आपकी {crop_name_hi} फसल ({land_area} {land_unit}) के लिए कृषि वैज्ञानिक मानकों पर आधारित है:\n"
                f"• अनुशंसित खाद: {item_names_hi}।\n"
                f"• सिंगल सुपर फॉस्फेट (SSP) जड़ों को ताकत देने के साथ-साथ 11% गंधक (सल्फर) भी प्रदान करता है।\n"
                f"• नीम लेपित यूरिया धीरे-धीरे घुलकर पौधों को लगातार नाइट्रोजन देता है।\n"
                f"• पोटाश (MOP) तने को गिरने से बचाता है और फलों के आकार व वजन में भारी सुधार करता है।"
            )
            topic_en = "Scientific Rationale for Recommendation"
            topic_ta = "பரிந்துரைக்கப்பட்ட உரங்களின் அறிவியல் பின்னணி"
            topic_hi = "उर्वरक सिफारिश का वैज्ञानिक आधार"

        # 5. "Why is this fertilizer suitable for my crop?"
        elif any(w in text for w in ["suitable for my crop", "suitable", "fit my crop", "பயிருக்கு ஏற்றது", "பொருத்தமானது", "फसल के लिए उपयुक्त"]):
            ans_en = (
                f"{crop_name_en} has high nutrient extraction during the {growth_stage} phase. "
                f"For {land_area} {land_unit}, providing balanced N, P, and K combined with organic carbon supports root penetration, "
                f"prevents early blossom drop, and satisfies crop-specific transpiration demand under {crop_info.get('irrigation_method', 'current irrigation')}."
            )
            ans_ta = (
                f"{crop_name_ta} பயிர் தற்போதைய {growth_stage} பருவத்தில் அதிக அளவு சத்துக்களை கிரகிக்கும் தன்மை கொண்டது. "
                f"உங்கள் {land_area} {land_unit} நிலத்தில் சமச்சீர் N, P, K மற்றும் தொழு உரம் அளிப்பது பூக்கள் உதிர்வதைத் தடுத்து, "
                f"{crop_info.get('irrigation_method', 'பாசன')} முறையில் சிறந்த விளைச்சலை உறுதி செய்கிறது."
            )
            ans_hi = (
                f"{crop_name_hi} फसल {growth_stage} अवस्था में तेजी से पोषक तत्व ग्रहण करती है। "
                f"आपके {land_area} {land_unit} खेत में संतुलित एनपीके और जैविक खाद देने से फूलों का झड़ना रुकता है "
                f"और {crop_info.get('irrigation_method', 'सिंचाई')} के साथ फसल की पैदावार में उल्लेखनीय वृद्धि होती है।"
            )
            topic_en = "Crop Suitability Analysis"
            topic_ta = "பயிருக்கு ஏற்ற தன்மை ஆய்வு"
            topic_hi = "फसल उपयुक्तता विश्लेषण"

        # 6. "Can you explain this recommendation in Tamil?" / "தமிழில் விளக்கம்"
        elif any(w in text for w in ["tamil", "தமிழில்", "தமிழ்"]):
            ans_en = f"Here is your fertilizer summary in Tamil: {rec.get('spoken_text_ta', 'பரிந்துரைக்கப்பட்ட உரங்களை தவணைகளாக இடவும்.')}"
            ans_ta = (
                f"உங்கள் {crop_name_ta} பயிரின் {land_area} {land_unit} நிலத்திற்கான முழு உர வழிகாட்டல்:\n"
                f"1. அடி உரம்: கடைசி உழவின் போது தொழு உரம், முழு மணிச்சத்து (SSP), கால் பங்கு தழை மற்றும் பொட்டாஷ் இடவும்.\n"
                f"2. முதல் மேலுரம்: நட்ட 25-35 நாட்களில் களை எடுத்த பின் 40% யூரியா இடவும்.\n"
                f"3. இரண்டாம் மேலுரம்: பூக்கும் போது மீதமுள்ள யூரியா மற்றும் பொட்டாஷ் இடவும்.\n"
                f"மதிப்பிடப்பட்ட மொத்த செலவு ₹{est_cost:,.0f} ஆகும்."
            )
            ans_hi = f"तमिल में सारांश: {rec.get('spoken_text_ta', '')}"
            topic_en = "Tamil Explanation"
            topic_ta = "முழு உர பரிந்துரை (தமிழ்)"
            topic_hi = "तमिल में विवरण"

        # 7. "Can you explain this recommendation in Hindi?" / "हिंदी में"
        elif any(w in text for w in ["hindi", "हिंदी", "हिन्दी"]):
            ans_en = f"Here is your fertilizer summary in Hindi: {rec.get('spoken_text_hi', 'अनुशंसित खाद को समय पर दें।')}"
            ans_ta = f"ஹிந்தியில் விளக்கம்: {rec.get('spoken_text_hi', '')}"
            ans_hi = (
                f"आपकी {crop_name_hi} फसल ({land_area} {land_unit}) की संपूर्ण खाद सलाह:\n"
                f"1. बेसल डोज (बुवाई पर): पूरा एसएसपी (फॉस्फोरस), गोबर की खाद और 25% यूरिया व 50% पोटाश डालें।\n"
                f"2. पहली टॉप ड्रेसिंग (25-35 दिन बाद): निराई के बाद 40% यूरिया नमी वाले खेत में दें।\n"
                f"3. दूसरी टॉप ड्रेसिंग (फूल आने पर): बचा हुआ यूरिया व पोटाश दें।\n"
                f"अनुमानित कुल लागत लगभग ₹{est_cost:,.0f} है।"
            )
            topic_en = "Hindi Explanation"
            topic_ta = "ஹிந்தி விளக்கம்"
            topic_hi = "संपूर्ण उर्वरक सलाह (हिंदी)"

        # 8. Precautions / mixing / safety
        elif any(w in text for w in ["mix", "precaution", "safety", "danger", "கலக்கலாமா", "பாதுகாப்பு", "सावधानी", "मिला सकते"]):
            ans_en = (
                "Critical safety & fertilizer compatibility guidelines:\n"
                "• Bio-fertilizers (Azospirillum, Trichoderma): Never mix directly with chemical fertilizers or fungicides; maintain a 15-day gap.\n"
                "• Urea Handling: Do not broadcast Urea on dry soil or immediately before torrential rain to prevent massive volatilization and runoff.\n"
                "• Personal Safety: Always wear gloves while handling fertilizers and wash hands with soap after farm operations."
            )
            ans_ta = (
                "முக்கிய பாதுகாப்பு மற்றும் உரக் கலவை எச்சரிக்கைகள்:\n"
                "• உயிர் உரங்கள் (அசோஸ்பைரில்லம், பாஸ்போபாக்டீரியா): இவற்றை ஒருபோதும் ரசாயன உரம் அல்லது பூஞ்சைக்கொல்லியுடன் கலக்கக் கூடாது; 15 நாட்கள் இடைவெளி தேவை.\n"
                "• யூரியா பாதுகாப்பு: வறண்ட நிலத்திலோ அல்லது கனமழைக்கு முன்னரோ யூரியாவை வயலில் இட வேண்டாம்; அது ஆவியாகி வீணாகிவிடும்.\n"
                "• மனித பாதுகாப்பு: உரங்களைக் கையாளும் போது கையுறை அணியவும், பணி முடிந்ததும் கைகளை சோப்பால் நன்கு கழுவவும்."
            )
            ans_hi = (
                "उर्वरक प्रयोग व सुरक्षा संबंधी जरूरी सावधानियां:\n"
                "• जैव उर्वरक (एज़ोस्पिरिलम, ट्राइकोडर्मा): इन्हें कभी भी रासायनिक खाद या कीटनाशक के साथ न मिलाएं; 15 दिन का अंतर रखें।\n"
                "• यूरिया प्रयोग: तेज बारिश से ठीक पहले या सूखी मिट्टी में यूरिया न डालें ताकि खाद बर्बाद न हो।\n"
                "• व्यक्तिगत सुरक्षा: खाद डालते समय दस्ताने पहनें और कार्य के बाद हाथ साबुन से धोएं।"
            )
            topic_en = "Fertilizer Compatibility & Safety"
            topic_ta = "உரக் கலவை & பாதுகாப்பு முறைகள்"
            topic_hi = "खाद प्रयोग और सुरक्षा निर्देश"

        # 9. Fallback tailored to the farmer's crop and growth stage
        else:
            ans_en = (
                f"Regarding your {crop_name_en} ({growth_stage} stage, {land_area} {land_unit}): "
                f"The recommended plan prioritizes balanced root and shoot nutrition using {item_names_en}. "
                f"Always apply fertilizers when adequate soil moisture is present, and consult your local KVK for Soil Test Crop Response (STCR) calibrations."
            )
            ans_ta = (
                f"உங்கள் {crop_name_ta} பயிரின் {growth_stage} பருவம் ({land_area} {land_unit}) தொடர்பாக: "
                f"பரிந்துரைக்கப்பட்ட திட்டம் {item_names_ta} மூலம் சமச்சீர் ஊட்டச்சத்தை வழங்குகிறது. "
                f"மண்ணில் போதிய ஈரம் இருக்கும் போது மட்டுமே உரங்களை இடவும்; துல்லிய அளவிற்கு உள்ளூர் வேளாண் அதிகாரியை அணுகவும்."
            )
            ans_hi = (
                f"आपकी {crop_name_hi} फसल ({growth_stage} अवस्था, {land_area} {land_unit}) के संबंध में: "
                f"अनुशंसित योजना {item_names_hi} के माध्यम से संतुलित पोषण देती है। "
                f"हमेशा खेत में पर्याप्त नमी होने पर ही खाद डालें और सटीक मात्रा के लिए नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।"
            )

        resp = self._build_response(ans_en, ans_ta, lang, topic_en, topic_ta, ans_hi, topic_hi)
        resp["ai_engine_note"] = "Agronomic Knowledge Engine (TNAU/ICAR Guidelines) active. Configure GEMINI_API_KEY in backend environment to enable external LLM reasoning."
        return resp

    def _build_response(self, text_en: str, text_ta: str, lang: str, topic_en: str, topic_ta: str, text_hi: str = None, topic_hi: str = None) -> Dict[str, Any]:
        hi_text = text_hi or text_en
        hi_topic = topic_hi or "कृषि सलाह"
        spoken = text_ta if lang == "ta" else hi_text if lang == "hi" else text_en
        return {
            "success": True,
            "topic_en": topic_en,
            "topic_ta": topic_ta,
            "topic_hi": hi_topic,
            "reply_en": text_en,
            "reply_ta": text_ta,
            "reply_hi": hi_text,
            "spoken_text": spoken,
            "reference": "Tamil Nadu Agricultural University (TNAU) & ICAR Agritech Repository."
        }

agri_assistant = AgriAssistant()

