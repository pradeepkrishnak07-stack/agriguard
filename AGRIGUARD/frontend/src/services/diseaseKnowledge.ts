import { DiseaseDetectionResult, SoilRequirements, DiseaseCauses, OrganicTreatmentPlan, ChemicalTreatmentPlan } from '../types';

export interface CropDiseaseMeta {
  crop_id: string;
  crop_name_en: string;
  crop_name_ta: string;
  crop_name_hi: string;
  scientific_name: string;
  soil_info: SoilRequirements;
  diseases: Record<string, {
    disease_id: string;
    name_en: string;
    name_ta: string;
    name_hi: string;
    is_healthy: boolean;
    pathogen: string;
    explanation_en: string;
    explanation_ta: string;
    explanation_hi: string;
    symptoms_en: string[];
    symptoms_ta: string[];
    symptoms_hi: string[];
    causes: DiseaseCauses;
    organic: OrganicTreatmentPlan;
    chemical: ChemicalTreatmentPlan;
  }>;
}

export const CROP_DISEASE_KNOWLEDGE: Record<string, CropDiseaseMeta> = {
  tomato: {
    crop_id: 'tomato',
    crop_name_en: 'Tomato',
    crop_name_ta: 'தக்காளி',
    crop_name_hi: 'टमाटर',
    scientific_name: 'Solanum lycopersicum',
    soil_info: {
      suitable_soils_en: ['Well-drained Red Loam', 'Clay Loam', 'Rich Sandy Loam with Organic Compost'],
      suitable_soils_ta: ['நல்ல வடிகால் வசதியுள்ள செம்மண்', 'வண்டல் கலந்த களிமண்', 'மக்கிய உரம் கலந்த மணற்பாங்கான நிலம்'],
      suitable_soils_hi: ['अच्छी जल निकासी वाली लाल दोमट मिट्टी', 'बलुई दोमट मिट्टी', 'जीवांश युक्त मटियार दोमट'],
      ph_range: '6.0 - 7.0 (Slightly acidic to neutral)',
      requirements_en: 'Tomatoes require deep, friable, fertile topsoil rich in humus. Good subsoil drainage is critical to prevent root suffocation.',
      requirements_ta: 'தக்காளி வேர்கள் ஆழமாக ஊடுருவக்கூடிய, மட்கிய சத்து நிறைந்த தளர்வான மண் தேவை. வேரழுகலைத் தடுக்க வடிகால் வசதி மிக முக்கியம்.',
      requirements_hi: 'टमाटर की खेती के लिए भुरभुरी, उपजाऊ और कार्बनिक पदार्थों से भरपूर मिट्टी आवश्यक है। जड़ों के विकास हेतु जल निकासी अनिवार्य है।',
      unsuitable_impact_en: 'Poorly drained, waterlogged soils starve roots of oxygen and trigger damping-off, Pythium root rot, and early foliar chlorosis. Saline or alkaline soils (pH > 8.0) lock out phosphorus and micronutrients like iron and zinc.',
      unsuitable_impact_ta: 'நீர் தேங்கும் கடின களிமண் வேருக்கு பிராணவாயு கிடைக்காமல் செய்து வேரழுகல் மற்றும் இலை மஞ்சளாதலை உருவாக்கும். காரத்தன்மை கொண்ட மண்ணில் (pH > 8.0) பயிருக்கு பாஸ்பரஸ் மற்றும் துத்தநாக சத்துக்கள் கிடைக்காது.',
      unsuitable_impact_hi: 'जलभराव वाली भारी मिट्टी में जड़ों को ऑक्सीजन नहीं मिलती, जिससे जड़ गलन रोग तेजी से पनपता है। क्षारीय मिट्टी में पोषक तत्वों की भारी कमी हो जाती है।'
    },
    diseases: {
      tomato_early_blight: {
        disease_id: 'tomato_early_blight',
        name_en: 'Tomato Early Blight',
        name_ta: 'தக்காளி ஆரம்பக்கால இலைக் கருகல் நோய்',
        name_hi: 'टमाटर का अगेती झुलसा रोग (अर्ली ब्लाइट)',
        is_healthy: false,
        pathogen: 'Alternaria solani (Fungal pathogen)',
        explanation_en: 'Early blight is a common destructive fungal disease characterized by concentric target-board brown rings on older lower foliage, causing premature leaf drop and sunscald on developing fruit.',
        explanation_ta: 'ஆரம்பக்கால கருகல் நோய் ஆல்டர்னேரியா பூஞ்சையால் ஏற்படுகிறது. முதிர்ந்த கீழ் இலைகளில் வளைய வடிவிலான கரும்பழுப்பு புள்ளிகளை உண்டாக்கி, இலைகளை உதிரச் செய்கிறது.',
        explanation_hi: 'अगेती झुलसा एक सामान्य फफूंद जनित रोग है, जिसमें निचली पुरानी पत्तियों पर छल्लेदार भूरे धब्बे बनते हैं और पत्तियां समय से पहले सूखकर गिर जाती हैं।',
        symptoms_en: [
          'Circular to irregular dark brown spots with concentric target-board rings on older lower leaves',
          'Yellow chlorotic halos surrounding necrotic leaf spots',
          'Lower foliage turns brittle, brown, and dries up prematurely',
          'Collar rot or dark sunken cankers at the stem base near the soil line'
        ],
        symptoms_ta: [
          'கீழ் இலைகளில் வட்ட அல்லது ஒழுங்கற்ற கரும்பழுப்பு நிற இலக்கு பலகை போன்ற வளையப் புள்ளிகள்',
          'புள்ளிகளைச் சுற்றி தெளிவான மஞ்சள் நிற வளையம் தோன்றுதல்',
          'முதிர்ந்த இலைகள் காய்ந்து முறிந்து உதிர்ந்து விடுதல்',
          'மண் மட்டத்திற்கு அருகில் உள்ள தண்டுப் பகுதியில் கருமையான பள்ளங்கள் ஏற்படுதல்'
        ],
        symptoms_hi: [
          'पुरानी निचली पत्तियों पर संकेन्द्री छल्लों वाले गहरे भूरे गोलाकार धब्बे',
          'धब्बों के चारों ओर पीले रंग का स्पष्ट घेरा (क्लोरोटिक हेलो)',
          'पत्तियों का मुरझाना, भूरा होना और असमय झड़ना',
          'तने के निचले हिस्से पर काले धंसे हुए घाव'
        ],
        causes: {
          primary_causes_en: [
            'Alternaria solani fungal spores overwintering in infected crop residues or solanaceous weeds',
            'Splash dispersal from soil to lower foliage during irrigation or rain showers',
            'Plant stress due to heavy fruit load or nutrient deficiency'
          ],
          primary_causes_ta: [
            'மண்ணில் உள்ள முந்தைய பயிர்க் கழிவுகளில் பூஞ்சை வித்துக்கள் தங்கி இருத்தல்',
            'நீர்ப்பாசனம் அல்லது மழை நீர் துளிகள் மண்ணிலிருந்து கீழ் இலைகளுக்குத் தெறித்தல்',
            'சத்து குறைபாடு மற்றும் காய் பிடிக்கும் பருவத்தில் செடிக்கு ஏற்படும் சோர்வு'
          ],
          primary_causes_hi: [
            'मिट्टी और पुरानी फसल के अवशेषों में फफूंद के बीजाणुओं की मौजूदगी',
            'सिंचाई या बारिश की बूंदों से मिट्टी के बीजाणुओं का निचली पत्तियों पर छिटकना',
            'पौधों में पोषण की कमी और अधिक फल लगने का दबाव'
          ],
          weather_factors_en: 'Warm temperatures (24°C - 30°C) with prolonged relative humidity (>80%) and frequent leaf wetness for 6-8 continuous hours.',
          weather_factors_ta: 'மிதமான வெப்பநிலை (24°C - 30°C), அதிக காற்றில் ஈரப்பதம் (80% மேல்) மற்றும் இலைகளில் தொடர்ந்து 6-8 மணி நேரம் பனி அல்லது ஈரம் தங்குதல்.',
          weather_factors_hi: 'गर्म तापमान (24°C से 30°C), 80% से अधिक हवा की नमी और पत्तियों पर 6 से 8 घंटे तक पानी की बूंदों का टिके रहना।',
          disclaimer_en: 'Visual leaf diagnosis identifies characteristic symptoms. Confirm with local soil and weather history before high-cost interventions.',
          disclaimer_ta: 'புகைப்பட ஆய்வு இலை அறிகுறிகளைக் கண்டறிகிறது. அதிக செலவு செய்வதற்கு முன் களச் சூழலையும் கருத்தில் கொள்ளவும்.',
          disclaimer_hi: 'फोटो विश्लेषण पत्तियों के लक्षणों को पहचानता है। उपचार से पहले स्थानीय खेत की स्थिति का भी ध्यान रखें।'
        },
        organic: {
          name_en: 'Neem Seed Kernel Extract (NSKE 5%) + Pseudomonas fluorescens',
          name_ta: '5% வேப்பங்கொட்டை சாறு (NSKE) + சூடோமோனாஸ் புளோரசன்ஸ்',
          name_hi: '5% नीम बीज अर्क (NSKE) + स्यूडोमोनास फ्लोरोसेंस',
          ingredients_en: '5 kg well-dried neem seed powder or 1 kg talc-based Pseudomonas fluorescens (2x10^8 CFU/g) + natural sticker (soap nut or khadi soap 100g).',
          ingredients_ta: 'நன்கு உலர்ந்த வேப்பங்கொட்டை தூள் 5 கிலோ அல்லது சூடோமோனாஸ் புளோரசன்ஸ் 1 கிலோ + இயற்கை ஒட்டும் திரவம் (காதர் சோப் 100 கிராம்).',
          ingredients_hi: '5 किलो सूखा नीम बीज चूर्ण या 1 किलो स्यूडोमोनास पाउडर + 100 ग्राम प्राकृतिक चिपचिपा घोल (साबुन पानी)।',
          rate_per_acre: '1.0 kg Pseudomonas fluorescens or 2.5 kg NSKE powder per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
          method_en: 'Mix the bio-agent thoroughly with 200 Litres of clean, chlorine-free water. Strain through muslin cloth and spray thoroughly on both upper and lower leaf surfaces during late afternoon (after 4:00 PM).',
          method_ta: '200 லிட்டர் சுத்தமான தண்ணீரில் கலந்து, மெல்லிய துணியால் வடிகட்டி, மாலை 4 மணிக்கு மேல் இலைகளின் மேல் மற்றும் கீழ் பரப்பில் படும்படி நன்கு தெளிக்கவும்.',
          method_hi: '200 लीटर साफ पानी में अच्छी तरह मिलाकर कपड़े से छान लें और शाम 4 बजे के बाद पत्तियों के दोनों तरफ अच्छी तरह छिड़कें।',
          frequency_en: 'Apply every 10 to 12 days for 3 consecutive rounds',
          frequency_ta: '10 முதல் 12 நாட்கள் இடைவெளியில் 3 முறை தெளிக்கவும்',
          frequency_hi: '10 से 12 दिनों के अंतराल पर कुल 3 बार छिड़काव करें',
          intervals_days: 10,
          expected_duration_days: 30,
          precautions_en: [
            'Do not mix bio-agents (Pseudomonas) with chemical copper or synthetic bactericides within 5 days',
            'Spray only during calm winds and mild sun to preserve living bacterial cultures',
            'Remove severely diseased lower leaves and bury them outside the field before spraying'
          ],
          precautions_ta: [
            'சூடோமோனாஸ் போன்ற உயிர் உரங்களை ரசாயன மருந்துகளுடன் சேர்த்து கலக்கக் கூடாது',
            'அதிக வெயில் இல்லாத மாலை வேளையில் மட்டுமே தெளிக்க வேண்டும்',
            'அதிகம் கருகிய கீழ் இலைகளைப் பறித்து வயலுக்கு வெளியே தீயிட்டு அழிக்கவும்'
          ],
          precautions_hi: [
            'जैविक फफूंदनाशी को किसी भी रासायनिक दवा के साथ न मिलाएं',
            'धूप ढलने के बाद ही छिड़काव करें ताकि लाभदायक जीवाणु जीवित रहें',
            'ज्यादा सड़ी हुई निचली पत्तियों को तोड़कर खेत से दूर नष्ट कर दें'
          ]
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP (or Chlorothalonil 75% WP)',
          name_ta: 'மேன்கோசெப் 75% WP (Mancozeb 75% WP)',
          name_hi: 'मैंकोजेब 75% WP (Mancozeb 75% WP)',
          product_name_ta: 'மேன்கோசெப் 75% WP (Mancozeb 75% WP)',
          product_name_hi: 'मैंकोजेब 75% WP (Mancozeb 75% WP)',
          active_ingredient: 'Mancozeb 75% Wettable Powder (Dithiocarbamate contact fungicide)',
          approved_rate_per_acre: '400 - 500 grams per acre (2.0 - 2.5 grams per Litre of water)',
          rate_grams_per_acre: 450,
          water_litres_per_acre: 200,
          method_en: 'Dissolve 450g of Mancozeb 75% WP into 200 Litres of clean water using a knapsack sprayer with hollow cone nozzle. Spray uniformly across the plant canopy until leaves are uniformly moist without excessive dripping.',
          method_ta: '200 லிட்டர் தண்ணீரில் 450 கிராம் மேன்கோசெப் கலந்து, கைத்தெளிப்பான் மூலம் இலைகள் முழுவதும் நனையும்படி சீராக தெளிக்கவும்.',
          method_hi: '200 लीटर पानी में 450 ग्राम मैंकोजेब पाउडर घोलें और नैपसैक स्प्रेयर से पूरी फसल पर समान रूप से छिड़कें।',
          interval_days: 12,
          duration_days: 24,
          ppe_required_en: [
            'N95 protective face mask or chemical respirator',
            'Nitrile or neoprene chemical-resistant gloves',
            'Safety goggles or eye shield',
            'Long-sleeved cotton shirt, full trousers, and rubber gumboots'
          ],
          ppe_required_ta: [
            'மூக்கு மற்றும் வாயை மூடும் முகக்கவசம் (N95 Mask)',
            'கைகளுக்கு ரப்பர் கையுறைகள்',
            'கண்களுக்கு பாதுகாப்பு கண்ணாடி',
            'முழுக்கை சட்டை, நீண்ட கால்சட்டை மற்றும் ரப்பர் காலணிகள்'
          ],
          ppe_required_hi: [
            'नाक और मुंह के लिए मास्क',
            'हाथों में रबर के दस्ताने',
            'आंखों के लिए सुरक्षात्मक चश्मा',
            'पूरी आस्तीन के कपड़े और रबर के जूते'
          ],
          pre_harvest_interval_days: 7,
          precautions_en: [
            'Pre-Harvest Interval (PHI): Minimum 7 days. Do not pick harvestable tomatoes within 7 days after spraying.',
            'Do not spray against the direction of prevailing wind or near open wells, ponds, or animal feed.',
            'Wash sprayer thoroughly and bathe with soap immediately after application.'
          ],
          precautions_ta: [
            'அறுவடைக்கு முந்தைய இடைவெளி (PHI): 7 நாட்கள். மருந்து தெளித்த 7 நாட்களுக்குள் காய்களை அறுவடை செய்யக்கூடாது.',
            'காற்று வீசும் திசைக்கு எதிராக மருந்து தெளிக்கக் கூடாது; நீர்நிலைகள் அருகில் தெளிப்பதைத் தவிர்க்கவும்.',
            'தெளித்த பின் கைகளை சோப்பு போட்டு நன்கு கழுவ வேண்டும்.'
          ],
          precautions_hi: [
            'तुड़ाई पूर्व अंतराल (PHI): कम से कम 7 दिन। छिड़काव के 7 दिनों तक टमाटर न तोड़ें।',
            'हवा की उल्टी दिशा में छिड़काव न करें और जल स्रोतों को दूषित होने से बचाएं।',
            'काम खत्म होने के बाद हाथ-मुंह साबुन से अच्छी तरह धोएं।'
          ]
        }
      },

      tomato_late_blight: {
        disease_id: 'tomato_late_blight',
        name_en: 'Tomato Late Blight',
        name_ta: 'தக்காளி பிற்பருவ இலைக் கருகல் நோய்',
        name_hi: 'टमाटर का पछेती झुलसा रोग (लेट ब्लाइट)',
        is_healthy: false,
        pathogen: 'Phytophthora infestans (Oomycete water mold)',
        explanation_en: 'Late blight is a fast-spreading, highly destructive water mold disease that causes large water-soaked dark lesions on leaves, stems, and fruits. Under cool, humid conditions, it can destroy an entire field within 3 to 5 days.',
        explanation_ta: 'பிற்பருவ கருகல் நோய் மிக வேகமாக பரவக்கூடிய பூஞ்சை போன்ற உயிரினத்தால் ஏற்படுகிறது. இலைகள் மற்றும் காய்களில் நீர் ஊறிய கரும்பச்சை புள்ளிகளை உண்டாக்கி சில நாட்களில் பயிரை அழிக்கக்கூடியது.',
        explanation_hi: 'पछेती झुलसा एक अत्यंत विनाशकारी रोग है जो ठंडे और नम मौसम में तेजी से फैलता है। यह 3 से 5 दिनों में पूरे खेत को झुलसा सकता है।',
        symptoms_en: [
          'Large, irregular water-soaked pale to dark brown oily lesions on leaves and stems',
          'Delicate white cottony/downy mold visible on the underside of infected leaves during humid mornings',
          'Firm, rough, greasy brown patches on green and ripening fruits',
          'Entire crop canopy appears frost-bitten, burnt, and collapses rapidly under wet weather'
        ],
        symptoms_ta: [
          'இலைகள் மற்றும் தண்டுகளில் நீர் ஊறிய ஒழுங்கற்ற கரும்பச்சை மற்றும் பழுப்பு நிற புள்ளிகள்',
          'ஈரப்பதமான காலை வேளையில் இலைகளின் அடிப்பகுதியில் வெள்ளை நிற பஞ்சு போன்ற பூஞ்சை படலம்',
          'பச்சை காய்களில் தடிமனான, கரும்பழுப்பு நிற அழுகல் திட்டுகள்',
          'குளிர்ந்த ஈரப்பதமான சூழலில் பயிர் தீயில் கருகியது போல் வேகமாக சாய்ந்து விடுதல்'
        ],
        symptoms_hi: [
          'पत्तियों और तनों पर पानी से भीगे हुए बड़े, गहरे भूरे धब्बे',
          'सुबह की नमी में पत्ती के निचले हिस्से पर सफेद रुई जैसी फफूंद',
          'हरे फलों पर कड़े और भूरे रंग के धब्बे जो तेजी से सड़ते हैं',
          'खेत में पौधे इस तरह दिखते हैं जैसे पाले से जल गए हों'
        ],
        causes: {
          primary_causes_en: [
            'Airborne sporangia of Phytophthora infestans carried by wind currents from neighboring fields',
            'Infected volunteer potato or tomato seedlings acting as early-season reservoir hosts',
            'Excessive foliage wetness from heavy dews or unseasonal monsoon rainfall'
          ],
          primary_causes_ta: [
            'காற்றின் மூலம் அண்டை வயல்களிலிருந்து பூஞ்சை வித்துக்கள் பரவுதல்',
            'முந்தைய பயிரிலிருந்து முளைத்த தன்னார்வ பயிர்களில் கிருமி தங்கி இருத்தல்',
            'அதிக பனிப்பொழிவு அல்லது தொடர் மழை நீரினால் இலைகள் நனைந்து இருத்தல்'
          ],
          primary_causes_hi: [
            'हवा द्वारा पड़ोसी खेतों से बीजाणुओं का तेजी से फैलना',
            'खेत में पिछले मौसम के रोगग्रस्त पौधों के बचे हुए अवशेष',
            'लगातार भारी ओस या बेमौसम बारिश से पत्तियों का भीगा रहना'
          ],
          weather_factors_en: 'Cool daytime temperatures (15°C - 22°C), high relative humidity (>90%), and prolonged overcast foggy weather with wet leaves for 10+ hours.',
          weather_factors_ta: 'குளிர்ந்த வானிலை (15°C - 22°C), மிக அதிக காற்றில் ஈரப்பதம் (90% மேல்) மற்றும் 10 மணி நேரத்திற்கு மேல் தொடர் மேகமூட்டம் அல்லது பனிப்பொழிவு.',
          weather_factors_hi: 'ठंडा तापमान (15°C से 22°C), अत्यधिक आर्द्रता (90% से अधिक) और लगातार 10 घंटे से अधिक कोहरा या नमी।',
          disclaimer_en: 'Late blight can decimate yields rapidly. Immediate field scouting and preventative barrier sprays are essential upon visual confirmation.',
          disclaimer_ta: 'பிற்பருவ கருகல் வேகமாக பரவக்கூடியது. அறிகுறி தெரிந்தவுடன் காலம் தாழ்த்தாமல் கள ஆய்வு செய்து மருந்து தெளிக்கவும்.',
          disclaimer_hi: 'यह रोग बहुत तेजी से फैलता है, इसलिए लक्षण दिखते ही तुरंत रोकथाम के उपाय करना आवश्यक है।'
        },
        organic: {
          name_en: 'Trichoderma viride + Copper Soap (or Bordeaux Mixture 1%)',
          name_ta: 'டிரைக்கோடெர்மா விரிடி + போர்டோ கலவை 1%',
          name_hi: 'ट्राइकोडर्मा विरिडी + बोर्डो मिश्रण 1%',
          ingredients_en: 'Copper Sulphate 1 kg + Quicklime (hydrated lime) 1 kg in 100 Litres of water, or Talc-based Trichoderma viride 1 kg + organic spreader.',
          ingredients_ta: 'மயில் துத்தம் 1 கிலோ + நீற்று சுண்ணாம்பு 1 கிலோ + 100 லிட்டர் தண்ணீர் (போர்டோ கலவை) அல்லது டிரைக்கோடெர்மா விரிடி 1 கிலோ.',
          ingredients_hi: 'नीला थोथा 1 किलो + बुझा हुआ चूना 1 किलो (बोर्डो मिश्रण) या ट्राइकोडर्मा विरिडी 1 किलो प्रति एकड़।',
          rate_per_acre: '1.0 kg bio-fungicide or 1% Bordeaux mixture per acre in 200 Litres',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
          method_en: 'Prepare fresh neutral 1% Bordeaux mixture. Spray thoroughly on upper and lower surfaces, especially covering stems and fruit clusters during morning hours.',
          method_ta: 'புதிதாக தயாரித்த 1% போர்டோ கலவையை 200 லிட்டர் நீரில் கலந்து, இலைகள் மற்றும் காய்கள் மீது படும்படி காலை வேளையில் தெளிக்கவும்.',
          method_hi: 'ताजा तैयार 1% बोर्डो मिश्रण को 200 लीटर पानी में घोलकर सुबह के समय पौधों के सभी भागों पर समान रूप से छिड़कें।',
          frequency_en: 'Spray at 7-day intervals during wet weather',
          frequency_ta: 'ஈரப்பதமான காலங்களில் 7 நாட்கள் இடைவெளியில் தெளிக்கவும்',
          frequency_hi: 'अधिक नमी वाले मौसम में हर 7 दिन के अंतराल पर छिड़कें',
          intervals_days: 7,
          expected_duration_days: 21,
          precautions_en: [
            'Do not prepare Bordeaux mixture in iron or metal vessels; use only plastic or earthen pots',
            'Test pH of Bordeaux mixture using a clean iron nail before spraying to verify neutrality',
            'Uproot and deeply bury heavily infected plants before spraying'
          ],
          precautions_ta: [
            'போர்டோ கலவையை இரும்பு பாத்திரத்தில் தயாரிக்கக் கூடாது; பிளாஸ்டிக் அல்லது மண்பாண்டங்களைப் பயன்படுத்தவும்',
            'கலவையின் அமிலத்தன்மையை துருப்பிடிக்காத இரும்பு ஆணி கொண்டு சோதித்த பின் தெளிக்கவும்',
            'கடுமையாக பாதிக்கப்பட்ட செடிகளைப் பிடுங்கி மண்ணில் புதைத்து விடவும்'
          ],
          precautions_hi: [
            'बोर्डो मिश्रण को लोहे या धातु के बर्तनों में न बनाएं, केवल प्लास्टिक या मिट्टी के बर्तन इस्तेमाल करें',
            'छिड़काव से पहले साफ लोहे की कील डालकर जांच लें कि घोल अम्लीय न हो',
            'पूरी तरह सड़ चुके पौधों को उखाड़कर जमीन में गहरा दबा दें'
          ]
        },
        chemical: {
          product_name_en: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ)',
          name_ta: 'மெட்டலாக்சில் + மேன்கோசெப் (Ridomil MZ)',
          name_hi: 'मेटालेक्सिल + मैंकोजेब (रिडोमिल एमजेड)',
          product_name_ta: 'மெட்டலாக்சில் + மேன்கோசெப் (Ridomil MZ)',
          product_name_hi: 'मेटालेक्सिल + मैंकोजेब (रिडोमिल एमजेड)',
          active_ingredient: 'Metalaxyl-M 4% + Mancozeb 64% WP (Systemic & Contact dual-action fungicide)',
          approved_rate_per_acre: '400 - 500 grams per acre (2.0 - 2.5 grams per Litre)',
          rate_grams_per_acre: 500,
          water_litres_per_acre: 200,
          method_en: 'Mix 500 grams in 200 Litres of water. Spray using a high-pressure motorized or knapsack sprayer to ensure penetrating coverage through dense canopies.',
          method_ta: '200 லிட்டர் தண்ணீரில் 500 கிராம் மருந்தை நன்கு கரைத்து, பயிர் இலைகள் முழுவதும் நனையுமாறு தெளிக்கவும்.',
          method_hi: '200 लीटर पानी में 500 ग्राम रिडोमिल घोलकर नैपसैक स्प्रेयर से घनी पत्तियों के अंदर तक अच्छी तरह छिड़काव करें।',
          interval_days: 10,
          duration_days: 20,
          ppe_required_en: [
            'Nitrile chemical protective gloves',
            'Full particulate respirator or N95 mask',
            'Wrap-around eye protection goggles',
            'Full body protective suit and rubber footwear'
          ],
          ppe_required_ta: [
            'பாதுகாப்பு ரப்பர் கையுறைகள்',
            'சுவாசப் பாதுகாப்பு முகக்கவசம்',
            'கண் பாதுகாப்பு கண்ணாடி',
            'முழு உடல் பாதுகாப்பு உடை மற்றும் காலணிகள்'
          ],
          ppe_required_hi: [
            'रासायनिक प्रतिरोधी दस्ताने',
            'सुरक्षात्मक मास्क',
            'आंखों का चश्मा',
            'पूरी आस्तीन के कपड़े और जूते'
          ],
          pre_harvest_interval_days: 14,
          precautions_en: [
            'Pre-Harvest Interval (PHI): 14 days. Metalaxyl is systemic; avoid harvesting fruit within 14 days of spraying.',
            'Do not apply more than 2 consecutive sprays of Metalaxyl to prevent pathogen resistance development.',
            'Keep livestock and pets away from treated field for at least 48 hours.'
          ],
          precautions_ta: [
            'அறுவடைக்கு முந்தைய இடைவெளி (PHI): 14 நாட்கள். மருந்து தெளித்த 14 நாட்களுக்கு காய்களைப் பறிக்கக் கூடாது.',
            'பூஞ்சை எதிர்ப்புத் திறன் உருவாவதைத் தடுக்க தொடர்ந்து இரண்டு முறைக்கு மேல் இந்த மருந்தை தெளிக்கக் கூடாது.',
            'கால்நடைகளை தெளிக்கப்பட்ட வயலில் 48 மணி நேரத்திற்கு மேய விடாதீர்கள்.'
          ],
          precautions_hi: [
            'तुड़ाई पूर्व अंतराल (PHI): 14 दिन। इस अवधि में फल बिल्कुल न तोड़ें।',
            'दवा के प्रति फफूंद में प्रतिरोधक क्षमता न बने, इसलिए लगातार दो बार से अधिक यह दवा न छिड़कें।',
            'छिड़काव के 48 घंटे बाद तक मवेशियों को खेत में न जाने दें।'
          ]
        }
      },

      tomato_healthy: {
        disease_id: 'tomato_healthy',
        name_en: 'Healthy Tomato Leaf',
        name_ta: 'ஆரோக்கியமான தக்காளி இலை',
        name_hi: 'स्वस्थ टमाटर की पत्ती',
        is_healthy: true,
        pathogen: 'None (Plant tissue is fully healthy)',
        explanation_en: 'The leaf shows normal dark green color, healthy vascular structure, and no visible fungal or bacterial lesions. Continue standard preventive farm care.',
        explanation_ta: 'இலை நல்ல பசுமையாகவும், புள்ளிகள் அல்லது பூஞ்சை பாதிப்புகள் இன்றியும் ஆரோக்கியமாக உள்ளது. வழக்கமான பராமரிப்பைத் தொடரவும்.',
        explanation_hi: 'पत्ती पूरी तरह हरी, साफ और स्वस्थ है। इसमें किसी फफूंद या जीवाणु के लक्षण नहीं हैं। सामान्य देखरेख जारी रखें।',
        symptoms_en: [
          'Uniform vibrant green coloration without chlorosis',
          'Intact leaf margins and undamaged turgid lamina',
          'Smooth leaf surfaces with no mold, sporulation, or necrotic lesions'
        ],
        symptoms_ta: [
          'மஞ்சளாதல் இல்லாத சீரான அடர்பச்சை நிறம்',
          'சேதமடையாத ஆரோக்கியமான இலை விளிம்புகள்',
          'பூஞ்சை அல்லது புள்ளிகள் அற்ற சுத்தமான இலைப்பரப்பு'
        ],
        symptoms_hi: [
          'बिना किसी पीलेपन के एकसमान गहरा हरा रंग',
          'पत्तियों के किनारे पूरी तरह स्वस्थ और साबुत',
          'सतह पर किसी भी प्रकार के धब्बे या फफूंद का अभाव'
        ],
        causes: {
          primary_causes_en: ['Adequate crop nutrition, balanced moisture, and timely preventative maintenance.'],
          primary_causes_ta: ['சரியான ஊட்டச்சத்து மேலாண்மை, சீரான பாசனம் மற்றும் முறையான பராமரிப்பு.'],
          primary_causes_hi: ['संतुलित खाद, उचित जल प्रबंधन और समय पर की गई रोकथाम।'],
          weather_factors_en: 'Ideal growing conditions (20°C - 30°C) with good solar radiation and well-managed relative humidity.',
          weather_factors_ta: 'சீரான தட்பவெப்பநிலை, நல்ல சூரிய ஒளி மற்றும் முறையான வடிகால் வசதி.',
          weather_factors_hi: 'अनुकूल तापमान, पर्याप्त धूप और अच्छी जल निकासी।',
          disclaimer_en: 'Regular field scouting twice a week ensures ongoing crop vigor and early prevention.',
          disclaimer_ta: 'வாரம் இருமுறை பயிரை உன்னிப்பாக கவனித்து வருவது தொடர்ந்து நல்ல மகசூலைத் தரும்.',
          disclaimer_hi: 'सप्ताह में दो बार खेत का निरीक्षण करते रहें ताकि फसल स्वस्थ बनी रहे।'
        },
        organic: {
          name_en: 'Preventive Panchagavya 3% or Neem Oil 2% Foliar Spray',
          name_ta: 'முன்னெச்சரிக்கை 3% பஞ்சகாவ்யா அல்லது 2% வேப்பெண்ணெய் கரைசல்',
          name_hi: 'निवारक 3% पंचगव्य या 2% नीम तेल छिड़काव',
          ingredients_en: 'Panchagavya 6 Litres or Pure cold-pressed Neem Oil 4 Litres + Khadi soap 200g in 200 Litres water per acre.',
          ingredients_ta: 'பஞ்சகாவ்யா 6 லிட்டர் அல்லது தூய வேப்பெண்ணெய் 4 லிட்டர் + காதர் சோப் கரைசல் 200 லிட்டர் நீரில் கலக்கவும்.',
          ingredients_hi: 'पंचगव्य 6 लीटर या शुद्ध नीम तेल 4 लीटर प्रति 200 लीटर पानी प्रति एकड़।',
          rate_per_acre: '6 Litres Panchagavya or 4 Litres Neem Oil per acre',
          rate_kg_per_acre: 6.0,
          water_litres_per_acre: 200,
          method_en: 'Spray once every 15 days in the early morning to sustain leaf luster, boost natural phytoalexins, and deter sucking pests.',
          method_ta: '15 நாட்களுக்கு ஒருமுறை அதிகாலையில் தெளித்து பயிரின் நோய் எதிர்ப்புச் சக்தியை அதிகரிக்கவும்.',
          method_hi: 'महीने में दो बार सुबह के समय छिड़काव करें जिससे पौधों की रोग प्रतिरोधक क्षमता बनी रहे।',
          frequency_en: 'Once every 15 days during vegetative and flowering stages',
          frequency_ta: 'வளர்ச்சி மற்றும் பூக்கும் பருவத்தில் 15 நாட்களுக்கு ஒருமுறை',
          frequency_hi: 'वृद्धि और फूल आने के समय हर 15 दिन में एक बार',
          intervals_days: 15,
          expected_duration_days: 45,
          precautions_en: ['No toxic residue. Safe for natural predators and honeybees.'],
          precautions_ta: ['நச்சுத்தன்மை அற்றது. நன்மை செய்யும் பூச்சிகளுக்கு முழு பாதுகாப்பு தரும்.'],
          precautions_hi: ['यह पूरी तरह सुरक्षित है और मित्र कीटों को नुकसान नहीं पहुंचाता।']
        },
        chemical: {
          product_name_en: 'None Required (Foliage is Healthy)',
          product_name_ta: 'தேவைப்படவில்லை (பயிர் ஆரோக்கியமாக உள்ளது)',
          product_name_hi: 'आवश्यक नहीं (फसल स्वस्थ है)',
          active_ingredient: 'None (Chemical fungicide not required)',
          approved_rate_per_acre: '0 g/acre',
          rate_grams_per_acre: 0,
          water_litres_per_acre: 0,
          method_en: 'No chemical intervention required. Continue standard cultural maintenance and clean irrigation.',
          method_ta: 'ரசாயன மருந்துகள் தேவையில்லை. வழக்கமான பாசனம் மற்றும் ஊட்டச்சத்து மேலாண்மையை தொடரவும்.',
          method_hi: 'किसी रासायनिक दवा की आवश्यकता नहीं है। सामान्य सिंचाई और पोषण जारी रखें।',
          interval_days: 0,
          duration_days: 0,
          ppe_required_en: ['None required'],
          ppe_required_ta: ['எதுவுமில்லை'],
          ppe_required_hi: ['कोई नहीं'],
          pre_harvest_interval_days: 0,
          precautions_en: ['Maintain crop scouting twice weekly.'],
          precautions_ta: ['வாரம் இருமுறை பயிரைக் கண்காணிக்கவும்.'],
          precautions_hi: ['सप्ताह में दो बार खेत का निरीक्षण करें।']
        }
      },
      tomato_bacterial_spot: {
        disease_id: 'tomato_bacterial_spot',
        name_en: 'Tomato Bacterial Spot',
        name_ta: 'தக்காளி பாக்டீரியா இலைப்புள்ளி நோய்',
        name_hi: 'टमाटर का जीवाणु धब्बा रोग',
        is_healthy: false,
        pathogen: 'Xanthomonas perforans (Bacterial pathogen)',
        explanation_en: 'Bacterial spot causes water-soaked greasy spots that turn dark brown with chlorotic halos, defoliating plants and leaving scabby raised lesions on green fruit.',
        explanation_ta: 'பாக்டீரியா இலைப்புள்ளி சாந்தோமோனாஸ் பாக்டீரியாவால் ஏற்படுகிறது. இலைகளில் எண்ணெய் போன்ற கரும்பழுப்பு புள்ளிகளை உண்டாக்கி, இலைகளை உதிரச் செய்கிறது.',
        explanation_hi: 'जीवाणु धब्बा रोग में पत्तियों पर तैलीय काले-भूरे धब्बे बनते हैं और फल पर खुरदरे मस्सेदार धब्बे हो जाते हैं।',
        symptoms_en: [
            'Small (1-3 mm) dark brown water-soaked circular spots with yellow halos',
            'Absence of concentric target rings',
            'Premature leaf defoliation during rainy humid weather'
        ],
        symptoms_ta: [
            '1-3 மி.மீ அளவில் சிறிய நீர் ஊறிய கரும்பழுப்பு புள்ளிகள்',
            'இலைகளில் வளையங்கள் இல்லாத புள்ளிகள்',
            'மழைக்காலத்தில் இலைகள் கொட்டி செடி வெறிச்சோடுதல்'
        ],
        symptoms_hi: [
            '1-3 मिमी के तैलीय काले धब्बे जिनके चारों ओर पीला घेरा होता है',
            'संकेन्द्री छल्लों का अभाव',
            'पत्तियों का तेजी से झड़ना'
        ],
        causes: {
            primary_causes_en: ['Seed-borne Xanthomonas bacteria or splash from infected crop debris'],
            primary_causes_ta: ['விதையில் இருக்கும் பாக்டீரியா அல்லது மழைக் காற்று மூலம் பரவுதல்'],
            primary_causes_hi: ['संक्रमित बीज या बारिश के छींटों से फैलाव'],
            weather_factors_en: 'Warm temperatures (25-30°C) with wind-driven rain or sprinkler watering.',
            weather_factors_ta: 'வெப்பமான ஈரப்பதம் மற்றும் மழைக் காற்று.',
            weather_factors_hi: 'गर्म तापमान (25-30°C) व तेज बारिश।',
            disclaimer_en: 'Bacterial diagnosis confirmed through visual symptomology.',
            disclaimer_ta: 'அறிகுறிகள் மூலம் பாக்டீரியா நோய் உறுதி செய்யப்பட்டது.',
            disclaimer_hi: 'लक्षणों के आधार पर जीवाणु रोग की पहचान।'
        },
        organic: {
            name_en: 'Neem Seed Kernel Extract (5%) + Pseudomonas fluorescens',
            name_ta: '5% வேப்பங்கொட்டை சாறு + சூடோமோனாஸ் புளோரசன்ஸ்',
            name_hi: '5% नीम अर्क + स्यूडोमोनास फ्लोरोसेंस',
            ingredients_en: '1 kg Pseudomonas fluorescens + 2.5 kg NSKE powder per acre.',
            ingredients_ta: 'சூடோமோனாஸ் 1 கிலோ + வேப்பங்கொட்டை சாறு.',
            ingredients_hi: '1 किलो स्यूडोमोनास पाउडर + नीम का काढ़ा।',
            rate_per_acre: '1.0 kg Pseudomonas fluorescens per acre',
            rate_kg_per_acre: 1.0,
            water_litres_per_acre: 200,
            method_en: 'Mix in 200 Litres of water and spray thoroughly in early morning.',
            method_ta: '200 லிட்டர் தண்ணீரில் கலந்து அதிகாலை வேளையில் தெளிக்கவும்.',
            method_hi: '200 लीटर पानी में मिलाकर सुबह के समय छिड़कें।',
            frequency_en: 'Apply every 10 days for 3 rounds',
            frequency_ta: '10 நாட்கள் இடைவெளியில் 3 முறை தெளிக்கவும்',
            frequency_hi: '10 दिन के अंतराल पर 3 बार छिड़कें',
            intervals_days: 10,
            expected_duration_days: 30,
            precautions_en: ['Do not mix bio-agents with chemical copper on the same day'],
            precautions_ta: ['காப்பர் மருந்துகளுடன் உயிர் உரங்களை ஒன்றாகக் கலக்கக் கூடாது'],
            precautions_hi: ['तांबे वाले रसायनों के साथ जैव एजेंट न मिलाएं']
        },
        chemical: {
            product_name_en: 'Copper Oxychloride 50% WP + Streptocycline',
            product_name_ta: 'காப்பர் ஆக்சிகுளோரைடு 50% WP + ஸ்ட்ரெப்டோசைக்ளின்',
            product_name_hi: 'कॉपर ऑक्सीक्लोराइड 50% WP + स्ट्रेप्टोसाइक्लिन',
            active_ingredient: 'Copper Oxychloride 50% WP (2.5 g/L) + Streptomycin sulphate 90% (0.1 g/L)',
            approved_rate_per_acre: '500 grams Copper Oxychloride + 20 grams Streptocycline per acre',
            rate_grams_per_acre: 500,
            water_litres_per_acre: 200,
            method_en: 'Dissolve in 200 Litres of water and spray on whole foliage upon first symptom appearance.',
            method_ta: '200 லிட்டர் நீரில் கலந்து இலைகள் மீது நன்கு தெளிக்கவும்.',
            method_hi: '200 लीटर पानी में घोलकर पत्तियों पर समान रूप से छिड़कें।',
            interval_days: 12,
            duration_days: 24,
            ppe_required_en: ['Rubber gloves, face mask, eye protection'],
            ppe_required_ta: ['கையுறைகள் மற்றும் முகக்கவசம்'],
            ppe_required_hi: ['दस्ताने व मास्क'],
            pre_harvest_interval_days: 5,
            precautions_en: ['Pre-Harvest Interval: 5 days. Wear protective gloves.'],
            precautions_ta: ['அறுவடைக்கு முன் 5 நாட்கள் இடைவெளி தேவை.'],
            precautions_hi: ['तुड़ाई पूर्व अंतराल: 5 दिन।']
        }
      },
      tomato_septoria_leaf_spot: {
        disease_id: 'tomato_septoria_leaf_spot',
        name_en: 'Tomato Septoria Leaf Spot',
        name_ta: 'தக்காளி செப்டோரியா இலைப்புள்ளி நோய்',
        name_hi: 'टमाटर का सेप्टोरिया पत्ती धब्बा रोग',
        is_healthy: false,
        pathogen: 'Septoria lycopersici (Fungal pathogen)',
        explanation_en: 'Septoria leaf spot produces circular lesions with gray centers and black fruiting bodies (pycnidia), triggering bottom-up defoliation.',
        explanation_ta: 'செப்டோரியா இலைகளில் சாம்பல் நிற புள்ளிகளையும் கருப்பு வித்துக்கூடுகளையும் உண்டாக்கி இலைகளை உதிரச் செய்கிறது.',
        explanation_hi: 'सेप्टोरिया रोग में पत्तियों पर काले किनारों वाले धूसर धब्बे बनते हैं और पत्तियां सूखकर गिरती हैं।',
        symptoms_en: [
            'Numerous circular spots (1.5-3 mm) with dark brown margins and gray centers',
            'Tiny black specks (pycnidia) in lesion centers',
            'Severe defoliation starting from the lower canopy'
        ],
        symptoms_ta: [
            'சாம்பல் மையப்பகுதியுடன் கூடிய வட்டப் புள்ளிகள்',
            'புள்ளிகளின் மத்தியில் சிறிய கருப்பு வித்துக்கள்',
            'கீழ் இலைகள் வேகமாக உதிர்ந்து போதல்'
        ],
        symptoms_hi: [
            'धूसर केंद्र वाले छोटे गोलाकार धब्बे',
            'धब्बों के बीच में छोटे काले दाने (पिकनीडिया)',
            'निचली पत्तियों का असमय गिरना'
        ],
        causes: {
            primary_causes_en: ['Infected solanaceous crop debris and rain splash dispersal'],
            primary_causes_ta: ['மண்ணில் உள்ள பூஞ்சை வித்துக்கள் மழைநீரால் தெறித்தல்'],
            primary_causes_hi: ['मिट्टी में फफूंद अवशेष व पानी के छींटे'],
            weather_factors_en: 'Moderate temperatures (20-25°C) with prolonged wet leaves.',
            weather_factors_ta: 'மிதமான குளிர் மற்றும் இலை ஈரம்.',
            weather_factors_hi: 'हल्की ठंड व पत्तियों का गीला रहना।',
            disclaimer_en: 'Confirm with field inspection before spraying.',
            disclaimer_ta: 'வயல் ஆய்வு செய்து உறுதி செய்யவும்.',
            disclaimer_hi: 'खेत का निरीक्षण अवश्य करें।'
        },
        organic: {
            name_en: 'Trichoderma harzianum @ 5 g/L + NSKE 5%',
            name_ta: 'டிரைக்கோடெர்மா ஹார்சியானம் + வேப்பங்கொட்டை சாறு',
            name_hi: 'ट्राइकोडर्मा + नीम अर्क',
            ingredients_en: '1 kg bio-fungicide powder per acre in 200 L water.',
            ingredients_ta: 'உயிர் பூஞ்சைக்கொல்லி 1 கிலோ ஏக்கருக்கு.',
            ingredients_hi: '1 किलो ट्राइकोडर्मा पाउडर।',
            rate_per_acre: '1.0 kg bio-fungicide per acre',
            rate_kg_per_acre: 1.0,
            water_litres_per_acre: 200,
            method_en: 'Spray late afternoon ensuring full underside coverage.',
            method_ta: 'மாலை வேளையில் இலைகள் நனையும்படி தெளிக்கவும்.',
            method_hi: 'शाम के समय पत्तियों के दोनों ओर छिड़कें।',
            frequency_en: 'Every 12 days for 2 rounds',
            frequency_ta: '12 நாட்கள் இடைவெளியில் 2 முறை',
            frequency_hi: '12 दिन के अंतराल पर 2 बार',
            intervals_days: 12,
            expected_duration_days: 24,
            precautions_en: ['Store bio-agent in cool dry place'],
            precautions_ta: ['உயிர் உரங்களை குளிர்ந்த இடத்தில் வைக்கவும்'],
            precautions_hi: ['सूखे व ठंडे स्थान पर रखें']
        },
        chemical: {
            product_name_en: 'Chlorothalonil 75% WP (Kavach)',
            product_name_ta: 'குளோரோதலோனில் 75% WP (கவாச்)',
            product_name_hi: 'क्लोरोथैलोनिल 75% WP (कवच)',
            active_ingredient: 'Chlorothalonil 75% Wettable Powder',
            approved_rate_per_acre: '400 grams per acre (2.0 g/L)',
            rate_grams_per_acre: 400,
            water_litres_per_acre: 200,
            method_en: 'Mix 400g in 200L water and spray promptly upon initial leaf spot appearance.',
            method_ta: '400 கிராம் மருந்தை 200 லிட்டர் நீரில் கலந்து தெளிக்கவும்.',
            method_hi: '400 ग्राम दवा 200 लीटर पानी में मिलाकर छिड़कें।',
            interval_days: 10,
            duration_days: 20,
            ppe_required_en: ['Protective mask and gloves'],
            ppe_required_ta: ['முகக்கவசம் மற்றும் கையுறைகள்'],
            ppe_required_hi: ['मास्क व दस्ताने'],
            pre_harvest_interval_days: 5,
            precautions_en: ['Observe 5-day PHI.'],
            precautions_ta: ['அறுவடைக்கு 5 நாட்கள் முன் தெளிக்கவும்.'],
            precautions_hi: ['तुड़ाई से 5 दिन पहले प्रयोग रोकें।']
        }
      },
      tomato_spider_mites: {
        disease_id: 'tomato_spider_mites',
        name_en: 'Two-Spotted Spider Mite Damage',
        name_ta: 'தக்காளி சிவப்பு சிலந்திப் பேன் தாக்குதல்',
        name_hi: 'टमाटर लाल मकड़ी (माइट) प्रकोप',
        is_healthy: false,
        pathogen: 'Tetranychus urticae (Arachnid Pest)',
        explanation_en: 'Spider mites suck sap from the undersides of leaves, producing speckled yellow stippling, webbing, and bronzed desiccated foliage.',
        explanation_ta: 'சிவப்பு சிலந்திப் பேன்கள் இலைச்சாற்றை உறிஞ்சி மெல்லிய சிலந்தி வலையை அமைத்து இலைகளை கருகச் செய்கின்றன.',
        explanation_hi: 'लाल मकड़ी पत्तियों का रस चूसकर बारीक जाले बनाती है जिससे पत्तियां कांस्य रंग की होकर सूख जाती हैं।',
        symptoms_en: [
            'Speckled yellow-white stippling on upper leaf surfaces',
            'Fine silken webbing on undersides of leaves',
            'Leaves turn dull bronze, curl, and drop prematurely'
        ],
        symptoms_ta: [
            'இலையின் மேல் பரப்பில் மஞ்சள் புள்ளிகள்',
            'இலையின் அடியில் மெல்லிய சிலந்தி வலைகள்',
            'இலைகள் பழுப்பு நிறமாகி சுருங்குதல்'
        ],
        symptoms_hi: [
            'पत्तियों पर पीले-सफेद महीन बिंदु',
            'निचली सतह पर बारीक जाले',
            'पत्तियों का कांस्य रंग होकर गिरना'
        ],
        causes: {
            primary_causes_en: ['Hot, dry weather and dusty field borders favoring rapid mite reproduction'],
            primary_causes_ta: ['அதிக வெப்பம் மற்றும் வறண்ட காற்று'],
            primary_causes_hi: ['गर्म व सूखा मौसम और धूल'],
            weather_factors_en: 'Hot, dry conditions (>30°C and <50% RH).',
            weather_factors_ta: 'வெப்பமான வறண்ட வானிலை.',
            weather_factors_hi: 'अधिक तापमान व कम नमी।',
            disclaimer_en: 'Inspect leaf undersides with a hand lens to confirm mite presence.',
            disclaimer_ta: 'பூதக்கண்ணாடி கொண்டு இலையின் அடியில் சிலந்திகளை உறுதி செய்யவும்.',
            disclaimer_hi: 'लेंस से पत्तियों के नीचे मकड़ी की जांच करें।'
        },
        organic: {
            name_en: 'Neem Oil (10,000 ppm) @ 3 mL/L + Wetting Agent',
            name_ta: 'வேப்ப எண்ணெய் (10,000 ppm) + ஒட்டும் திரவம்',
            name_hi: 'नीम तेल (10,000 ppm) + साबुन पानी',
            ingredients_en: '600 mL Neem oil per acre mixed with soap nut solution.',
            ingredients_ta: 'ஏக்கருக்கு 600 மி.லி வேப்பெண்ணெய்.',
            ingredients_hi: '600 मिली नीम तेल प्रति एकड़।',
            rate_per_acre: '0.6 Litres per acre (3 mL/L)',
            rate_kg_per_acre: 0.6,
            water_litres_per_acre: 200,
            method_en: 'Direct spray nozzle upward to thoroughly soak undersides of leaves.',
            method_ta: 'இலைகளின் அடியில் படும்படி கீழ்நோக்கி தெளிக்கவும்.',
            method_hi: 'पत्तियों के नीचे की तरफ अच्छी तरह छिड़कें।',
            frequency_en: 'Repeat after 7 days for 2 rounds',
            frequency_ta: '7 நாட்கள் இடைவெளியில் 2 முறை',
            frequency_hi: '7 दिन के अंतराल पर 2 बार',
            intervals_days: 7,
            expected_duration_days: 14,
            precautions_en: ['Spray in late evening to prevent leaf scorch in hot sun'],
            precautions_ta: ['வெயில் இல்லாத மாலை வேளையில் தெளிக்கவும்'],
            precautions_hi: ['शाम के समय ही छिड़काव करें']
        },
        chemical: {
            product_name_en: 'Spiromesifen 22.9% SC (Oberon)',
            product_name_ta: 'ஸ்பைரோமெசிபேன் 22.9% SC (ஒபரோன்)',
            product_name_hi: 'स्पाइरोमेसिफेन 22.9% SC (ओबेरॉन)',
            active_ingredient: 'Spiromesifen 22.9% Suspension Concentrate (Lipid synthesis inhibitor)',
            approved_rate_per_acre: '200 mL per acre (1.0 mL/L)',
            rate_grams_per_acre: 200,
            water_litres_per_acre: 200,
            method_en: 'Mix 200 mL in 200 L water and spray thoroughly on leaf undersides.',
            method_ta: '200 மி.லி மருந்தை 200 லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்.',
            method_hi: '200 मिली दवा 200 लीटर पानी में घोलकर छिड़कें।',
            interval_days: 14,
            duration_days: 28,
            ppe_required_en: ['Gloves, mask, gumboots'],
            ppe_required_ta: ['கையுறைகள், முகக்கவசம்'],
            ppe_required_hi: ['दस्ताने व मास्क'],
            pre_harvest_interval_days: 3,
            precautions_en: ['Pre-Harvest Interval: 3 days.'],
            precautions_ta: ['அறுவடைக்கு 3 நாட்கள் முன் வரை மட்டுமே.'],
            precautions_hi: ['तुड़ाई पूर्व अंतराल: 3 दिन।']
        }
      },
      tomato_target_spot: {
        disease_id: 'tomato_target_spot',
        name_en: 'Tomato Target Spot',
        name_ta: 'தக்காளி இலக்கு புள்ளி நோய்',
        name_hi: 'टमाटर का टारगेट स्पॉट रोग',
        is_healthy: false,
        pathogen: 'Corynespora cassiicola (Fungus)',
        explanation_en: 'Corynespora target spot develops circular brown spots with concentric rings and yellow halos on foliage and sunken dark lesions on green fruit.',
        explanation_ta: 'இலக்கு புள்ளி நோய் இலைகளில் வட்ட வளையப் புள்ளிகளை உண்டாக்கி காய்களிலும் அழுகலை உருவாக்குகிறது.',
        explanation_hi: 'टारगेट स्पॉट रोग में पत्तियों पर छल्लेदार गोल धब्बे और फल पर गहरे घाव बनते हैं।',
        symptoms_en: [
            'Concentric circular brown target spots (5-10 mm)',
            'Chlorotic yellow halos surrounding lesions',
            'Severe foliar blight during warm humid weather'
        ],
        symptoms_ta: [
            '5-10 மி.மீ அளவில் இலக்கு பலகை போன்ற வட்ட வளையப் புள்ளிகள்',
            'புள்ளிகளைச் சுற்றி மஞ்சள் வளையம்',
            'இலைகள் வேகமாக கருகி உதிர்ந்து போதல்'
        ],
        symptoms_hi: [
            '5-10 मिमी के संकेन्द्री छल्लेदार धब्बे',
            'धब्बों के चारों ओर पीला घेरा',
            'पत्तियों का तेजी से झुलसना'
        ],
        causes: {
            primary_causes_en: ['Infected crop residue and fungal spores dispersed by wind and rain'],
            primary_causes_ta: ['பயிர்க் கழிவுகள் மற்றும் காற்றில் பரவும் வித்துக்கள்'],
            primary_causes_hi: ['हवा व बारिश से फैलने वाले फफूंद बीजाणु'],
            weather_factors_en: 'Warm humid weather (25-30°C) with prolonged moisture.',
            weather_factors_ta: 'வெப்பம் மற்றும் காற்றில் அதிக ஈரப்பதம்.',
            weather_factors_hi: 'गर्म व आर्द्र मौसम।',
            disclaimer_en: 'Visual symptoms resemble early blight; look for distinct fruit lesions.',
            disclaimer_ta: 'ஆரம்பக்கால கருகல் போலவே தோன்றும்; கவனமாக சோதிக்கவும்.',
            disclaimer_hi: 'अगेती झुलसा जैसे लक्षण, फल के धब्बों से पहचानें।'
        },
        organic: {
            name_en: 'Pseudomonas fluorescens @ 5 g/L',
            name_ta: 'சூடோமோனாஸ் புளோரசன்ஸ் 5 கிராம்/லிட்டர்',
            name_hi: 'स्यूडोमोनास फ्लोरोसेंस',
            ingredients_en: '1 kg bio-agent powder per acre in 200 L water.',
            ingredients_ta: 'சூடோமோனாஸ் 1 கிலோ ஏக்கருக்கு.',
            ingredients_hi: '1 किलो स्यूडोमोनास पाउडर।',
            rate_per_acre: '1.0 kg per acre',
            rate_kg_per_acre: 1.0,
            water_litres_per_acre: 200,
            method_en: 'Foliar spray during late afternoon.',
            method_ta: 'மாலை வேளையில் தெளிக்கவும்.',
            method_hi: 'शाम के समय छिड़काव करें।',
            frequency_en: 'Every 10 days for 3 rounds',
            frequency_ta: '10 நாட்கள் இடைவெளியில் 3 முறை',
            frequency_hi: '10 दिन के अंतराल पर 3 बार',
            intervals_days: 10,
            expected_duration_days: 30,
            precautions_en: ['Do not mix with copper sprays'],
            precautions_ta: ['காப்பர் மருந்துகளுடன் கலக்கக் கூடாது'],
            precautions_hi: ['कॉपर कवकनाशी के साथ न मिलाएं']
        },
        chemical: {
            product_name_en: 'Mancozeb 75% WP or Azoxystrobin 23% SC',
            product_name_ta: 'மேன்கோசெப் 75% WP அல்லது அசோக்சிஸ்ட்ரோபின்',
            product_name_hi: 'मैनकोजेब 75% WP या एजोक्सीस्ट्रोबिन',
            active_ingredient: 'Mancozeb 75% WP (2 g/L) or Azoxystrobin 23% SC (1 mL/L)',
            approved_rate_per_acre: '400 grams Mancozeb or 200 mL Azoxystrobin per acre',
            rate_grams_per_acre: 400,
            water_litres_per_acre: 200,
            method_en: 'Dissolve in 200 L water and spray immediately upon early lesion detection.',
            method_ta: '200 லிட்டர் நீரில் கலந்து இலைகள் மீது தெளிக்கவும்.',
            method_hi: '200 लीटर पानी में घोलकर छिड़कें।',
            interval_days: 10,
            duration_days: 20,
            ppe_required_en: ['Gloves and mask'],
            ppe_required_ta: ['கையுறைகள் மற்றும் முகக்கவசம்'],
            ppe_required_hi: ['दस्ताने व मास्क'],
            pre_harvest_interval_days: 5,
            precautions_en: ['Observe 5-day PHI.'],
            precautions_ta: ['அறுவடைக்கு 5 நாட்கள் முன் தெளிக்கவும்.'],
            precautions_hi: ['तुड़ाई पूर्व अंतराल: 5 दिन।']
        }
      },
      tomato_yellow_leaf_curl: {
        disease_id: 'tomato_yellow_leaf_curl',
        name_en: 'Tomato Yellow Leaf Curl Virus (TYLCV)',
        name_ta: 'தக்காளி மஞ்சள் இலை சுருள் வைரஸ் நோய்',
        name_hi: 'टमाटर का पीली पत्ती मरोड़िया वायरस रोग',
        is_healthy: false,
        pathogen: 'Tomato Yellow Leaf Curl Begomovirus (Vector: Whitefly Bemisia tabaci)',
        explanation_en: 'TYLCV is transmitted by whiteflies and causes severe upward leaf curling, yellowing, stunting, and near total fruit drop.',
        explanation_ta: 'வெள்ளை ஈக்கள் மூலம் பரவும் இந்த வைரஸ் இலைகளை மேல்நோக்கி சுருட்டி மஞ்சள் நிறமாக்கி செடியை மலடாக்குகிறது.',
        explanation_hi: 'सफेद मक्खी द्वारा फैलने वाला यह वायरस पत्तियों को ऊपर की ओर मोड़कर पीला कर देता है और फल नहीं लगने देता।',
        symptoms_en: [
            'Severe upward curling and cupping of leaflets',
            'Prominent yellow chlorosis along leaf margins',
            'Extreme plant stunting and flower abortion'
        ],
        symptoms_ta: [
            'இலைகள் மேல்நோக்கி படகு வடிவில் சுருங்குதல்',
            'இலை நரம்புகளுக்கு இடையே தீவிர மஞ்சள் நிறம்',
            'செடி வளர்ச்சி குன்றி பூக்கள் உதிர்ந்து போதல்'
        ],
        symptoms_hi: [
            'पत्तियों का ऊपर की ओर मुड़ना (कप आकार)',
            'पत्तियों पर तेज पीलापन',
            'पौधे का बौना होना व फूलों का गिरना'
        ],
        causes: {
            primary_causes_en: ['Transmission by Bemisia tabaci whiteflies from nearby infected solanaceous fields'],
            primary_causes_ta: ['வெள்ளை ஈக்கள் மூலமாக வைரஸ் பரவுதல்'],
            primary_causes_hi: ['सफेद मक्खी द्वारा वायरस का फैलाव'],
            weather_factors_en: 'Warm, dry weather (>30°C) favoring rapid whitefly migration.',
            weather_factors_ta: 'வெப்பமான வறண்ட வானிலையில் வெள்ளை ஈக்கள் பெருகுதல்.',
            weather_factors_hi: 'गर्म व सूखा मौसम।',
            disclaimer_en: 'Viruses have no chemical cure; control the whitefly insect vector promptly.',
            disclaimer_ta: 'வைரஸை குணப்படுத்த மருந்து இல்லை; வெள்ளை ஈயை கட்டுப்படுத்துவதே தீர்வு.',
            disclaimer_hi: 'वायरस की दवा नहीं होती, सफेद मक्खी की रोकथाम ही उपाय है।'
        },
        organic: {
            name_en: 'Yellow Sticky Traps (20/acre) + Neem Oil (10,000 ppm) @ 3 mL/L',
            name_ta: 'மஞ்சள் நிற ஒட்டும் பொறிகள் (20/ஏக்கர்) + வேப்ப எண்ணெய்',
            name_hi: 'पीले चिपचिपे कार्ड (20/एकड़) + नीम तेल',
            ingredients_en: '20 yellow sticky traps + 600 mL Neem oil per acre.',
            ingredients_ta: '20 மஞ்சள் பொறிகள் மற்றும் 600 மி.லி வேப்பெண்ணெய்.',
            ingredients_hi: '20 पीले कार्ड व 600 मिली नीम तेल।',
            rate_per_acre: '0.6 Litres Neem oil + 20 Traps per acre',
            rate_kg_per_acre: 0.6,
            water_litres_per_acre: 200,
            method_en: 'Install yellow traps at canopy level and spray Neem oil every 7 days.',
            method_ta: 'பயிர் மட்டத்தில் மஞ்சள் பொறிகளை வைத்து வாரம் ஒருமுறை வேப்பெண்ணெய் தெளிக்கவும்.',
            method_hi: 'पौधों की ऊंचाई पर पीले कार्ड लगाएं और नीम तेल का छिड़काव करें।',
            frequency_en: 'Weekly monitoring and application',
            frequency_ta: 'வாரம் ஒருமுறை',
            frequency_hi: 'साप्ताहिक छिड़काव',
            intervals_days: 7,
            expected_duration_days: 28,
            precautions_en: ['Uproot and bury heavily infected plants immediately (rogueing)'],
            precautions_ta: ['பாதிக்கப்பட்ட செடிகளை உடனே பிடுங்கி மண்ணில் புதைக்கவும்'],
            precautions_hi: ['गंभीर रूप से बीमार पौधों को उखाड़कर नष्ट करें']
        },
        chemical: {
            product_name_en: 'Thiamethoxam 25% WG (Actara) or Acetamiprid 20% SP',
            product_name_ta: 'தையமீத்தாக்சம் 25% WG அல்லது அசிட்டமிப்ரிட்',
            product_name_hi: 'थियामेथोक्सम 25% WG (अकटारा) या एसिटामिप्रिड',
            active_ingredient: 'Thiamethoxam 25% Water Dispersible Granules (Systemic Neonicotinoid)',
            approved_rate_per_acre: '60 grams per acre (0.3 g/L)',
            rate_grams_per_acre: 60,
            water_litres_per_acre: 200,
            method_en: 'Dissolve 60g in 200L water and spray to eliminate whitefly vector colonies.',
            method_ta: '60 கிராம் மருந்தை 200 லிட்டர் நீரில் கலந்து வெள்ளை ஈக்கள் மீது தெளிக்கவும்.',
            method_hi: '60 ग्राम दवा 200 लीटर पानी में मिलाकर सफेद मक्खी पर छिड़कें।',
            interval_days: 14,
            duration_days: 28,
            ppe_required_en: ['Protective gloves and respirator mask'],
            ppe_required_ta: ['கையுறைகள் மற்றும் முகக்கவசம்'],
            ppe_required_hi: ['दस्ताने व मास्क'],
            pre_harvest_interval_days: 5,
            precautions_en: ['Avoid spraying during peak honeybee foraging hours (early morning).'],
            precautions_ta: ['தேனீக்கள் நடமாட்டம் இருக்கும் காலை வேளையில் தெளிப்பதைத் தவிர்க்கவும்.'],
            precautions_hi: ['मधुमक्खियों के भ्रमण के समय छिड़काव न करें।']
        }
      },
      tomato_mosaic_virus: {
        disease_id: 'tomato_mosaic_virus',
        name_en: 'Tomato Mosaic Virus (ToMV)',
        name_ta: 'தக்காளி மொசைக் வைரஸ் நோய்',
        name_hi: 'टमाटर का मोज़ेक वायरस रोग',
        is_healthy: false,
        pathogen: 'Tomato Mosaic Tobamovirus (Mechanically transmitted)',
        explanation_en: 'ToMV is easily spread by contact and causes alternating light and dark green mosaic mottle, leaf distortion, and internal fruit browning.',
        explanation_ta: 'தொடுதல் மற்றும் கவாத்து மூலம் பரவும் இந்த வைரஸ் இலைகளில் மொசைக் திட்டுகளையும் செடி குன்றுதலையும் உண்டாக்குகிறது.',
        explanation_hi: 'यह वायरस संपर्क द्वारा तेजी से फैलता है और पत्तियों पर हल्के व गहरे हरे रंग के चितकबरे धब्बे बनाता है।',
        symptoms_en: [
            'Mottling of alternating light and dark green mosaic patches',
            'Leaf puckering and strap-like fern leaf distortion',
            'Stunted plant growth and reduced fruit yield'
        ],
        symptoms_ta: [
            'இலைகளில் வெளிர் மற்றும் அடர் பச்சை நிற மொசைக் திட்டுகள்',
            'இலைகள் சுருங்கி மெல்லிய நாடா போல் மாறுதல்',
            'செடி வளர்ச்சி குன்றுதல்'
        ],
        symptoms_hi: [
            'हल्के व गहरे हरे रंग के चितकबरे धब्बे',
            'पत्तियों का सिकुड़ना व विकृत होना',
            'पौधे की बढ़वार रुकना'
        ],
        causes: {
            primary_causes_en: ['Mechanical transmission via hands, tools, stakes, or infected seed'],
            primary_causes_ta: ['கைகள், கவாத்து கத்தரிக்கோல் அல்லது விதைகள் வழியாக பரவுதல்'],
            primary_causes_hi: ['हाथ, औजार या दूषित बीज द्वारा फैलाव'],
            weather_factors_en: 'Can spread under any temperature regime through physical handling.',
            weather_factors_ta: 'எந்த சீதோஷ்ண நிலையிலும் பரவக்கூடியது.',
            weather_factors_hi: 'शारीरिक संपर्क से किसी भी मौसम में फैलाव।',
            disclaimer_en: 'Sanitation is the only cure; viricides do not exist.',
            disclaimer_ta: 'கைகளை சுத்தமாக வைத்திருப்பதே தீர்வு; வைரஸ் மருந்துகள் இல்லை.',
            disclaimer_hi: 'स्वच्छता ही एकमात्र उपाय है।'
        },
        organic: {
            name_en: '10% Diluted Skimmed Milk Spray + Tool Sanitization',
            name_ta: '10% பால் கரைசல் தெளிப்பு + கருவிகள் சுத்தம் செய்தல்',
            name_hi: '10% मलाई रहित दूध का घोल + औजारों की सफाई',
            ingredients_en: '2 Litres non-fat skimmed milk in 20 Litres water for tools and foliage.',
            ingredients_ta: 'கொழுப்பில்லாத பால் 2 லிட்டர்.',
            ingredients_hi: '2 लीटर बिना मलाई का दूध।',
            rate_per_acre: '2.0 Litres per acre equivalent',
            rate_kg_per_acre: 2.0,
            water_litres_per_acre: 200,
            method_en: 'Spray seedlings before transplanting; dip cutting shears frequently in milk.',
            method_ta: 'நாற்று நடும் முன் தெளிக்கவும்; கத்தரிக்கோலை பாலில் முக்கி எடுக்கவும்.',
            method_hi: 'रोपाई से पहले पौध पर छिड़कें और औजारों को डुबोएं।',
            frequency_en: 'At nursery stage and during pruning',
            frequency_ta: 'நாற்றங்காலில் மற்றும் கவாத்தின் போது',
            frequency_hi: 'कटाई-छंटाई के समय',
            intervals_days: 14,
            expected_duration_days: 28,
            precautions_en: ['Strictly forbid smoking or chewing tobacco inside tomato fields'],
            precautions_ta: ['புகையிலை பொருட்களை தக்காளி வயலில் பயன்படுத்தக் கூடாது'],
            precautions_hi: ['खेत में तंबाकू या बीड़ी का प्रयोग वर्जित रखें']
        },
        chemical: {
            product_name_en: 'Tool Disinfectant: 10% Household Bleach or 20% TSP',
            product_name_ta: 'கருவி சுத்திகரிப்பு: 10% பிளீச்சிங் கரைசல்',
            product_name_hi: 'औजार सैनिटाइजर: 10% ब्लीच घोल',
            active_ingredient: 'Sodium hypochlorite 10% solution or Trisodium phosphate',
            approved_rate_per_acre: '0 g/acre (Applied only to shears, stakes, and crates)',
            rate_grams_per_acre: 0,
            water_litres_per_acre: 10,
            method_en: 'Do not spray bleach directly onto tomato plants. Use exclusively to sterilize pruning shears and stakes.',
            method_ta: 'செடிகள் மீது தெளிக்கக் கூடாது; கத்தரிக்கோல் மற்றும் முட்டுக் கம்புகளை மட்டுமே கழுவ வேண்டும்.',
            method_hi: 'पौधों पर न छिड़कें; केवल औजार धोने के लिए प्रयोग करें।',
            interval_days: 7,
            duration_days: 28,
            ppe_required_en: ['Rubber gloves and safety glasses'],
            ppe_required_ta: ['கையுறைகள் மற்றும் கண்ணாடி'],
            ppe_required_hi: ['दस्ताने व चश्मा'],
            pre_harvest_interval_days: 0,
            precautions_en: ['Rogue out symptomatic infected plants and destroy outside field.'],
            precautions_ta: ['நோய் தாக்கிய செடிகளை பிடுங்கி வயலுக்கு வெளியே எரிக்கவும்.'],
            precautions_hi: ['बीमार पौधों को उखाड़कर तुरंत नष्ट करें।']
        }
      },
      tomato_leaf_mold: {
        disease_id: 'tomato_leaf_mold',
        name_en: 'Tomato Leaf Mold',
        name_ta: 'தக்காளி இலை பூஞ்சை நோய்',
        name_hi: 'टमाटर का पत्ती फफूंद रोग',
        is_healthy: false,
        pathogen: 'Passalora fulva (Fungus)',
        explanation_en: 'Leaf mold thrives under high humidity (>85%), producing pale yellow spots on the upper leaf surface and olive green velvety mold on the underside.',
        explanation_ta: 'அதிக ஈரப்பதத்தில் தோன்றும் இலை பூஞ்சை நோய், இலையின் மேல் மஞ்சள் புள்ளிகளையும் அடியில் ஆலிவ் பச்சை நிற பூஞ்சையையும் உண்டாக்குகிறது.',
        explanation_hi: 'यह रोग उच्च आर्द्रता में पत्तियों की ऊपरी सतह पर पीले धब्बे और निचली सतह पर मखमली फफूंद बनाता है।',
        symptoms_en: [
            'Pale green to yellow spots on upper leaf surface',
            'Olive green to velvety brown mold growth on lower leaf surface',
            'Leaves wither and drop prematurely'
        ],
        symptoms_ta: [
            'இலையின் மேல் வெளிர் மஞ்சள் புள்ளிகள்',
            'இலையின் அடியில் ஆலிவ் பச்சை நிற பூஞ்சை படிவம்',
            'இலைகள் காய்ந்து உதிர்தல்'
        ],
        symptoms_hi: [
            'ऊपरी सतह पर पीले धब्बे',
            'निचली सतह पर जैतून जैसे हरे-भूरे मखमली जाले',
            'पत्तियों का सूखकर गिरना'
        ],
        causes: {
            primary_causes_en: ['High relative humidity in dense polyhouses or continuous cloudy wet spells'],
            primary_causes_ta: ['அதிக ஈரப்பதம் மற்றும் காற்றோட்டமின்மை'],
            primary_causes_hi: ['अधिक नमी व खराब हवा का संचार'],
            weather_factors_en: 'Humidity >85% and temperatures 20-25°C.',
            weather_factors_ta: '85% மேல் ஈரப்பதம் மற்றும் 20-25°C வெப்பம்.',
            weather_factors_hi: '85% से अधिक नमी व 20-25°C तापमान।',
            disclaimer_en: 'Improve canopy ventilation before high-cost chemical interventions.',
            disclaimer_ta: 'காற்றோட்டத்தை மேம்படுத்தி ஈரப்பதத்தைக் குறைக்கவும்.',
            disclaimer_hi: 'हवा का संचार सुधारें।'
        },
        organic: {
            name_en: 'Pseudomonas fluorescens @ 5 g/L + Canopy Pruning',
            name_ta: 'சூடோமோனாஸ் புளோரசன்ஸ் + கீழ் கிளை கவாத்து',
            name_hi: 'स्यूडोमोनास फ्लोरोसेंस + कटाई-छंटाई',
            ingredients_en: '1 kg bio-agent powder per acre.',
            ingredients_ta: 'சூடோமோனாஸ் 1 கிலோ ஏக்கருக்கு.',
            ingredients_hi: '1 किलो स्यूडोमोनास पाउडर।',
            rate_per_acre: '1.0 kg per acre',
            rate_kg_per_acre: 1.0,
            water_litres_per_acre: 200,
            method_en: 'Prune bottom sucker leaves up to 30 cm from ground and spray foliage thoroughly.',
            method_ta: 'கீழ் கிளைகளை நீக்கிவிட்டு இலைகள் மீது மருந்து தெளிக்கவும்.',
            method_hi: 'निचली पत्तियों की छंटाई करें और घोल का छिड़काव करें।',
            frequency_en: 'Apply every 10 days for 2 rounds',
            frequency_ta: '10 நாட்கள் இடைவெளியில் 2 முறை',
            frequency_hi: '10 दिन के अंतराल पर 2 बार',
            intervals_days: 10,
            expected_duration_days: 20,
            precautions_en: ['Ensure adequate cross ventilation'],
            precautions_ta: ['நல்ல காற்றோட்டத்தை உறுதி செய்யவும்'],
            precautions_hi: ['हवा का आवागमन बनाए रखें']
        },
        chemical: {
            product_name_en: 'Mancozeb 75% WP (Dithane M-45)',
            product_name_ta: 'மேன்கோசெப் 75% WP (டைத்தேன் எம்-45)',
            product_name_hi: 'मैनकोजेब 75% WP (डाइथेन एम-45)',
            active_ingredient: 'Mancozeb 75% Wettable Powder (Dithiocarbamate)',
            approved_rate_per_acre: '400 grams per acre (2.0 g/L)',
            rate_grams_per_acre: 400,
            water_litres_per_acre: 200,
            method_en: 'Dissolve 400g in 200L water and spray evenly over canopy.',
            method_ta: '400 கிராம் மருந்தை 200 லிட்டர் நீரில் கலந்து தெளிக்கவும்.',
            method_hi: '400 ग्राम दवा 200 लीटर पानी में घोलकर छिड़कें।',
            interval_days: 10,
            duration_days: 20,
            ppe_required_en: ['Gloves and mask'],
            ppe_required_ta: ['கையுறைகள் மற்றும் முகக்கவசம்'],
            ppe_required_hi: ['दस्ताने व मास्क'],
            pre_harvest_interval_days: 5,
            precautions_en: ['Pre-Harvest Interval: 5 days.'],
            precautions_ta: ['அறுவடைக்கு 5 நாட்கள் முன் வரை.'],
            precautions_hi: ['तुड़ाई पूर्व अंतराल: 5 दिन।']
        }
      }
    }
  },

  rice: {
    crop_id: 'rice',
    crop_name_en: 'Rice / Paddy',
    crop_name_ta: 'நெல்',
    crop_name_hi: 'धान / चावल',
    scientific_name: 'Oryza sativa',
    soil_info: {
      suitable_soils_en: ['Heavy Clay Soil', 'Clay Loam', 'River Alluvial Soil with Low Water Permeability'],
      suitable_soils_ta: ['களிமண்', 'வண்டல் மண்', 'களி கலந்த வண்டல் மண்'],
      suitable_soils_hi: ['चिकनी मिट्टी', 'मटियार दोमट', 'जलोढ़ मिट्टी'],
      ph_range: '5.5 - 6.5 (Slightly acidic)',
      requirements_en: 'Paddy thrives in soils with low percolation rate that can maintain 2 to 5 cm standing water without drying out.',
      requirements_ta: 'நீர் தேங்கி நிற்கும் களிமண் நிலங்கள் நெல் பயிருக்கு உகந்தவை. வயலில் 2-5 செ.மீ நீர் நிற்க வேண்டும்.',
      requirements_hi: 'धान की फसल के लिए ऐसी भारी मिट्टी चाहिए जो पानी रोक सके और 2 से 5 सेमी पानी बना रहे।',
      unsuitable_impact_en: 'Highly porous sandy soils cause excessive percolation, water stress, and nutrient leaching, which severely intensifies blast disease. Strongly alkaline soils trigger zinc deficiency (Khaira disease).',
      unsuitable_impact_ta: 'மணற்பாங்கான நிலங்களில் நீர் நிற்காமல் உரம் அடித்துச் செல்லப்பட்டு குலை நோய் தீவிரமாகும். கார நிலங்களில் துத்தநாக குறைபாடு ஏற்படும்.',
      unsuitable_impact_hi: 'बलुई मिट्टी में पानी और खाद बह जाती है, जिससे झोंका (ब्लास्ट) रोग बढ़ता है और जिंक की भारी कमी होती है।'
    },
    diseases: {
      rice_blast: {
        disease_id: 'rice_blast',
        name_en: 'Rice Blast Disease',
        name_ta: 'நெல் குலை நோய் / வெடிப்பு நோய்',
        name_hi: 'धान का झोंका रोग (ब्लास्ट)',
        is_healthy: false,
        pathogen: 'Magnaporthe oryzae (Pyricularia oryzae)',
        explanation_en: 'Rice blast is one of the most destructive diseases of rice. It creates diamond- or eye-shaped lesions with gray centers, and can rot panicle necks causing total grain sterility.',
        explanation_ta: 'நெல் குலை நோய் மேக்னாபோர்தே பூஞ்சையால் ஏற்படுகிறது. இலைகளில் கண் வடிவ புள்ளிகளை உண்டாக்கி, கதிர் கழுத்தை உடைத்து மணிகளைப் பதராக்கும்.',
        explanation_hi: 'धान का झोंका रोग फफूंद से होता है। यह पत्तियों पर आंख या नाव के आकार के धब्बे बनाता है और बालियों की गर्दन तोड़कर दाने नहीं भरने देता।',
        symptoms_en: [
          'Spindle-shaped or diamond-shaped lesions with grey centers and reddish-brown margins on leaves',
          'Lesions enlarge and coalesce causing entire leaf blades to wither and burn',
          'Blackish-brown necrosis at panicle neck causing the entire seedhead to snap off (neck blast)',
          'Chaffy, sterile panicles with empty grain husks'
        ],
        symptoms_ta: [
          'இலைகளில் கண் வடிவிலான கதிர் வடிவ புள்ளிகள்; நடுவில் சாம்பல் நிறமும் விளிம்பில் பழுப்பு நிறமும் இருத்தல்',
          'புள்ளிகள் இணைந்து இலைகள் கருகி எரிந்தது போல் தோன்றுதல்',
          'கதிர் வெளிவரும் கழுத்துப் பகுதியில் கருமையான அழுகல் ஏற்பட்டு கதிர் ஒடிந்து தொங்குதல்',
          'மணிகள் பதராகி நெல் விளைச்சல் பெருமளவு குறைதல்'
        ],
        symptoms_hi: [
          'पत्तियों पर नाव या आंख के आकार के धब्बे, जिनके बीच का हिस्सा राख जैसा और किनारे भूरे होते हैं',
          'धब्बे आपस में मिलकर पूरी पत्ती को सुखा देते हैं',
          'बाली के जोड़ पर काला सड़न का निशान जिससे बाली टूटकर लटक जाती है (गर्दन तोड़)',
          'बालियां सफेद और थोथी रह जाती हैं'
        ],
        causes: {
          primary_causes_en: [
            'Excessive or late-season application of Nitrogen (Urea) fertilizers',
            'Dense planting with restricted air movement in the canopy',
            'Windborne fungal conidia from infected straw piles or adjacent fields'
          ],
          primary_causes_ta: [
            'தழைச்சத்து (யூரியா) உரத்தை அளவுக்கு அதிகமாக அல்லது தாமதமாக இடுதல்',
            'அடர்ந்து நடுவதால் காற்றோட்டம் குறைதல்',
            'நோயுற்ற வைக்கோல் அல்லது அண்டை வயல்களிலிருந்து பூஞ்சை வித்துக்கள் பரவுதல்'
          ],
          primary_causes_hi: [
            'यूरिया खाद का जरूरत से ज्यादा छिड़काव',
            'पौधों का बहुत घना होना और हवा का न चलना',
            'हवा द्वारा फफूंद के बीजाणुओं का फैलाव'
          ],
          weather_factors_en: 'Cool night temperatures (18°C - 24°C), high relative humidity (>90%), and continuous heavy morning dew on leaves.',
          weather_factors_ta: 'குளிர்ந்த இரவு நேரம் (18°C - 24°C), அதிக காற்றில் ஈரப்பதம் (90% மேல்) மற்றும் தொடர் பனிப்பொழிவு.',
          weather_factors_hi: 'रात का ठंडा मौसम (18°C से 24°C), 90% से ज्यादा नमी और लगातार ओस की बूंदें।',
          disclaimer_en: 'Confirm with your local agricultural extension service for regional blast warnings.',
          disclaimer_ta: 'வட்டார வேளாண்மை அலுவலகத்தின் நோய் எச்சரிக்கையையும் கவனத்தில் கொள்ளவும்.',
          disclaimer_hi: 'कृषि विभाग की स्थानीय चेतावनी पर भी ध्यान दें।'
        },
        organic: {
          name_en: 'Pseudomonas fluorescens 0.2% Foliar Spray + Neem Cake Soil Application',
          name_ta: 'சூடோமோனாஸ் புளோரசன்ஸ் 0.2% இலைவழித் தெளிப்பு',
          name_hi: 'स्यूडोमोनास फ्लोरोसेंस 0.2% छिड़काव',
          ingredients_en: 'Talc formulation Pseudomonas fluorescens 1 kg per acre in 200 Litres clean water.',
          ingredients_ta: 'ஒரு ஏக்கருக்கு 1 கிலோ சூடோமோனாஸ் தூள் 200 லிட்டர் தண்ணீரில் கலக்கவும்.',
          ingredients_hi: '1 किलो स्यूडोमोनास पाउडर 200 लीटर पानी प्रति एकड़।',
          rate_per_acre: '1.0 kg per acre in 200 Litres water',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
          method_en: 'Spray at active tillering stage (25-30 DAT) and repeat at boot leaf stage during late afternoon.',
          method_ta: 'தூர்கட்டும் பருவத்திலும் (25-30 நாட்கள்) மீண்டும் கதிர் வெளிவரும் பருவத்திலும் மாலை வேளையில் தெளிக்கவும்.',
          method_hi: 'कल्ले फूटते समय और बाली निकलने से पहले शाम के समय अच्छी तरह छिड़कें।',
          frequency_en: '2 rounds at 15-day intervals',
          frequency_ta: '15 நாட்கள் இடைவெளியில் 2 முறை தெளிக்கவும்',
          frequency_hi: '15 दिन के अंतराल पर 2 बार छिड़काव करें',
          intervals_days: 15,
          expected_duration_days: 30,
          precautions_en: ['Avoid mixing with synthetic fungicides within 5 days.'],
          precautions_ta: ['ரசாயன மருந்துகளுடன் சேர்த்து கலக்கக் கூடாது.'],
          precautions_hi: ['रासायनिक दवाओं के साथ न मिलाएं।']
        },
        chemical: {
          product_name_en: 'Tricyclazole 75% WP (Beam / Baan)',
          name_ta: 'டிரைசைக்ளசோல் 75% WP (Tricyclazole 75% WP)',
          name_hi: 'ट्राइसाइक्लाजोल 75% WP (Tricyclazole 75% WP)',
          product_name_ta: 'டிரைசைக்ளசோல் 75% WP (Tricyclazole 75% WP)',
          product_name_hi: 'ट्राइसाइक्लाजोल 75% WP (Tricyclazole 75% WP)',
          active_ingredient: 'Tricyclazole 75% Wettable Powder (Systemic melanin biosynthesis inhibitor)',
          approved_rate_per_acre: '120 - 160 grams per acre (0.6 - 0.8 grams per Litre)',
          rate_grams_per_acre: 150,
          water_litres_per_acre: 200,
          method_en: 'Dissolve 150 grams in 200 Litres of water and spray immediately upon observing initial diamond spots.',
          method_ta: '200 லிட்டர் தண்ணீரில் 150 கிராம் கலந்து, நோய் அறிகுறி கண்டவுடன் இலைகள் மீது தெளிக்கவும்.',
          method_hi: '200 लीटर पानी में 150 ग्राम घोलें और लक्षण दिखते ही तुरंत छिड़कें।',
          interval_days: 14,
          duration_days: 28,
          ppe_required_en: ['Rubber gloves, face mask, eye protection, and gumboots'],
          ppe_required_ta: ['கையுறைகள், முகக்கவசம், கண்ணாடி மற்றும் காலணிகள்'],
          ppe_required_hi: ['दस्ताने, मास्क, चश्मा और जूते'],
          pre_harvest_interval_days: 21,
          precautions_en: [
            'Pre-Harvest Interval (PHI): 21 days for paddy harvest.',
            'Do not drain spray water into fish ponds or livestock drinking streams.'
          ],
          precautions_ta: [
            'அறுவடைக்கு முந்தைய இடைவெளி: 21 நாட்கள்.',
            'மருந்து கலந்த வயல் நீரை மீன் குட்டைகளில் பாய்ச்சக் கூடாது.'
          ],
          precautions_hi: [
            'तुड़ाई पूर्व अंतराल: 21 दिन। मछली पालन वाले तालाबों में पानी न जाने दें।'
          ]
        }
      }
    }
  },

  potato: {
    crop_id: 'potato',
    crop_name_en: 'Potato',
    crop_name_ta: 'உருளைக்கிழங்கு',
    crop_name_hi: 'आलू',
    scientific_name: 'Solanum tuberosum',
    soil_info: {
      suitable_soils_en: ['Well-drained Sandy Loam', 'Rich Silt Loam with High Organic Matter'],
      suitable_soils_ta: ['வடிகால் வசதியுள்ள மணல் கலந்த வண்டல் மண்'],
      suitable_soils_hi: ['बलुई दोमट मिट्टी', 'जीवांश युक्त उपजाऊ दोमट मिट्टी'],
      ph_range: '5.2 - 6.4 (Slightly Acidic to Neutral)',
      requirements_en: 'Requires loose, friable, well-aerated soil; waterlogging causes rapid tuber rot and Rhizoctonia.',
      requirements_ta: 'தண்ணீர் தேங்காத மிருதுவான பொலபொலப்பான மண் தேவை.',
      requirements_hi: 'जलभराव से कंद सड़न होती है, इसलिए अच्छी जल निकासी आवश्यक है।',
      unsuitable_impact_en: 'Heavy clay and waterlogged soils cause tuber asphyxiation, enlarged lenticels, and bacterial soft rot.',
      unsuitable_impact_ta: 'களிமண் மற்றும் நீர் தேங்கும் நிலத்தில் கிழங்கு அழுகல் மற்றும் கிருமித் தொற்று ஏற்படும்.',
      unsuitable_impact_hi: 'भारी मिट्टी और जलभराव से कंद सड़ जाते हैं।'
    },
    diseases: {
      potato_early_blight: {
        disease_id: 'potato_early_blight',
        name_en: 'Potato Early Blight',
        name_ta: 'உருளைக்கிழங்கு ஆரம்பக்கால இலைக் கருகல் நோய்',
        name_hi: 'आलू का अगेती झुलसा रोग (अर्ली ब्लाइट)',
        is_healthy: false,
        pathogen: 'Alternaria solani (Fungal pathogen)',
        explanation_en: 'Early blight causes dark brown concentric target-board spots on potato foliage, progressing from bottom older leaves upwards and reducing tuber sizing.',
        explanation_ta: 'ஆரம்பக்கால கருகல் கீழ் இலைகளில் வட்ட வளையப் புள்ளிகளை உண்டாக்கி கிழங்குகள் பருப்பதைத் தடுக்கிறது.',
        explanation_hi: 'अगेती झुलसा पुरानी निचली पत्तियों पर छल्लेदार गोल धब्बे बनाता है, जिससे कंदों का आकार छोटा रह जाता है।',
        symptoms_en: [
          'Dark brown to black angular spots with concentric target-board rings on lower leaves',
          'Chlorotic yellow halos encircling necrotic spots',
          'Brittle foliage drying up and drooping prematurely',
          'Sunken dark irregular corky lesions on tubers'
        ],
        symptoms_ta: [
          'கீழ் இலைகளில் வட்ட அல்லது ஒழுங்கற்ற கரும்பழுப்பு நிற வளையப் புள்ளிகள்',
          'புள்ளிகளைச் சுற்றி தெளிவான மஞ்சள் வளையம்',
          'இலைகள் காய்ந்து முறிந்து உதிர்ந்து விடுதல்',
          'கிழங்குகளில் பள்ளமான பழுப்பு அழுகல் புள்ளிகள்'
        ],
        symptoms_hi: [
          'निचली पत्तियों पर संकेन्द्री छल्लेदार गहरे भूरे धब्बे',
          'धब्बों के चारों ओर पीले रंग का घेरा',
          'पत्तियों का सूखकर असमय गिरना',
          'कंदों पर धंसे हुए कड़े भूरे घाव'
        ],
        causes: {
          primary_causes_en: ['Overwintering spores in old potato haulms and solanaceous crop residues'],
          primary_causes_ta: ['பழைய உருளைக்கிழங்கு தாள்கள் மற்றும் மண்ணில் உள்ள பூஞ்சை வித்துக்கள்'],
          primary_causes_hi: ['पुरानी फसल के अवशेषों और मिट्टी में मौजूद फफूंद बीजाणु'],
          weather_factors_en: 'Warm humid weather (22°C - 28°C) with intermittent rain and dew.',
          weather_factors_ta: 'மிதமான வெப்பநிலை மற்றும் அதிக ஈரப்பதம்.',
          weather_factors_hi: '22°C से 28°C तापमान और पत्तियों पर नमी।',
          disclaimer_en: 'Preventive foliar treatment at canopy closure protects tuber yield.',
          disclaimer_ta: 'செடி மூடும் பருவத்தில் முன்னெச்சரிக்கையாக மருந்து தெளிப்பது கிழங்கின் எடையைப் பாதுகாக்கும்.',
          disclaimer_hi: 'पौधों के फैलने पर तुरंत रोकथाम करें।'
        },
        organic: {
          name_en: 'Trichoderma viride 1 kg or NSKE 5% Foliar Spray',
          name_ta: 'டிரைக்கோடெர்மா விரிடி 1 கிலோ அல்லது 5% வேப்பங்கொட்டை சாறு',
          name_hi: 'ट्राइकोडर्मा विरिडी 1 किलो या 5% नीम अर्क',
          ingredients_en: 'Trichoderma viride 1 kg + 200g khadi soap sticker in 200 Litres water per acre.',
          ingredients_ta: 'டிரைக்கோடெர்மா விரிடி 1 கிலோ + இயற்கை ஒட்டும் திரவம் 200 லிட்டர் நீரில்.',
          ingredients_hi: '1 किलो ट्राइकोडर्मा विरिडी 200 लीटर पानी में।',
          rate_per_acre: '1.0 kg bio-fungicide per acre in 200 Litres water',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
          method_en: 'Spray on upper and lower leaf surfaces during late afternoon hours.',
          method_ta: 'மாலையில் இலைகளின் இருபுறமும் நன்கு படும்படி தெளிக்கவும்.',
          method_hi: 'शाम के समय पत्तियों के दोनों तरफ अच्छी तरह छिड़कें।',
          frequency_en: 'Every 10-12 days at first symptom emergence',
          frequency_ta: 'அறிகுறி கண்டவுடன் 10-12 நாட்கள் இடைவெளியில்',
          frequency_hi: 'लक्षण दिखते ही 10-12 दिन के अंतराल पर',
          intervals_days: 12,
          expected_duration_days: 24,
          precautions_en: ['Use chlorine-free clean water for bio-fungicide suspension.'],
          precautions_ta: ['குளோரின் இல்லாத சுத்தமான தண்ணீரைப் பயன்படுத்தவும்.'],
          precautions_hi: ['साफ पानी का ही प्रयोग करें।']
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP (Dithane M-45) or Chlorothalonil 75% WP',
          product_name_ta: 'மேன்கோசெப் 75% WP (டைத்தேன் எம்-45)',
          product_name_hi: 'मैनकोजेब 75% WP (डाइथेन एम-45)',
          active_ingredient: 'Mancozeb 75% Wettable Powder (Dithiocarbamate)',
          approved_rate_per_acre: '400 - 500 grams per acre (2.0 - 2.5 g/L)',
          rate_grams_per_acre: 400,
          water_litres_per_acre: 200,
          method_en: 'Mix 400g in 200 L water and spray thoroughly before canopy closes.',
          method_ta: '400 கிராம் மருந்தை 200 லிட்டர் தண்ணீரில் கலந்து முழு பயிரிலும் தெளிக்கவும்.',
          method_hi: '400 ग्राम दवा 200 लीटर पानी में घोलकर छिड़कें।',
          interval_days: 10,
          duration_days: 20,
          ppe_required_en: ['Protective gloves, face mask, eye protection, gumboots'],
          ppe_required_ta: ['கையுறைகள், முகக்கவசம் மற்றும் காலணிகள்'],
          ppe_required_hi: ['दस्ताने, मास्क व जूते'],
          pre_harvest_interval_days: 7,
          precautions_en: ['Pre-Harvest Interval (PHI): 7 days. Do not spray within 7 days of harvest.'],
          precautions_ta: ['அறுவடைக்கு 7 நாட்கள் முன் வரை மட்டுமே தெளிக்கலாம்.'],
          precautions_hi: ['तुड़ाई पूर्व अंतराल: 7 दिन।']
        }
      },

      potato_late_blight: {
        disease_id: 'potato_late_blight',
        name_en: 'Potato Late Blight',
        name_ta: 'உருளைக்கிழங்கு பிற்பருவக் கருகல் நோய்',
        name_hi: 'आलू का पछेती झुलसा रोग (लेट ब्लाइट)',
        is_healthy: false,
        pathogen: 'Phytophthora infestans (Oomycete water mold)',
        explanation_en: 'Late blight is the most devastating disease of potato in hill regions (Nilgiris/Kodaikanal/Himalayas), spreading within days and destroying both vines and tubers.',
        explanation_ta: 'மலைப்பகுதிகளில் உருளைக்கிழங்கை தாக்கும் மிகக் கொடிய நோய். சில நாட்களில் பயிரை முழுமையாக அழித்து கிழங்கையும் அழுகச் செய்யும்.',
        explanation_hi: 'पहाड़ी व मैदानी दोनों क्षेत्रों में आलू का सबसे विनाशकारी रोग, जो 3 से 5 दिन में पूरी फसल नष्ट कर सकता है।',
        symptoms_en: [
          'Water-soaked irregular blackish-brown spots on leaf margins and tips',
          'Delicate white fungal downy mildew on leaf undersides in humid mornings',
          'Fast blackened collapse of entire vine canopy as if scorched by frost',
          'Dry granular reddish-brown rot spreading underneath the tuber skin'
        ],
        symptoms_ta: [
          'இலை நுனி மற்றும் ஓரங்களில் நீர் ஊறிய கருமைப் புள்ளிகள்',
          'காலை வேளையில் இலைகளின் அடியில் வெள்ளை நிற பூஞ்சை வளர்தல்',
          'செடிகள் பனியில் கருகியது போல் வேகமாக சாய்ந்து விடுதல்',
          'கிழங்கின் தோலுக்கு அடியில் பழுப்பு நிற துகள் அழுகல் ஏற்படுதல்'
        ],
        symptoms_hi: [
          'पत्तियों के किनारों पर पानी से भीगे हुए काले-भूरे धब्बे',
          'सुबह की नमी में पत्ती के नीचे सफेद फफूंद',
          'पाले की तरह पूरी बेल का झुलसकर गिर जाना',
          'कंद के छिलके के नीचे दानेदार भूरी सड़न'
        ],
        causes: {
          primary_causes_en: ['Airborne sporangia blown from infected volunteer tubers or adjacent seed crops'],
          primary_causes_ta: ['காற்றினால் பரவும் வித்துக்கள் மற்றும் பாதிக்கப்பட்ட விதைக்கிழங்குகள்'],
          primary_causes_hi: ['हवा द्वारा फैलने वाले बीजाणु और संक्रमित बीज कंद'],
          weather_factors_en: 'Cool temperatures (12°C - 18°C), continuous fog, and relative humidity >90%.',
          weather_factors_ta: 'குளிர்ந்த தட்பவெப்பநிலை (12°C - 18°C) மற்றும் தொடர் பனிமூட்டம்.',
          weather_factors_hi: 'ठंडा तापमान (12°C से 18°C), अत्यधिक कोहरा व 90% से अधिक नमी।',
          disclaimer_en: 'Dehaulming (cutting vines) 10 days before harvest is critical to protect tubers.',
          disclaimer_ta: 'அறுவடைக்கு 10 நாட்களுக்கு முன் செடியின் தாள்களை வெட்டி அகற்றுவது கிழங்கு அழுகலைத் தடுக்கும்.',
          disclaimer_hi: 'खुदाई से 10 दिन पहले पौधों की कटाई (डीहॉल्मिंग) अवश्य करें।'
        },
        organic: {
          name_en: 'Bordeaux Mixture 1% or Copper Soap Spray',
          name_ta: '1% போர்டோ கலவை தெளிப்பு',
          name_hi: '1% बोर्डो मिश्रण छिड़काव',
          ingredients_en: 'Copper Sulphate 1 kg + Hydrated Lime 1 kg in 100 Litres water (freshly prepared neutral solution).',
          ingredients_ta: 'மயில் துத்தம் 1 கிலோ + நீற்று சுண்ணாம்பு 1 கிலோ + 100 லிட்டர் தண்ணீர்.',
          ingredients_hi: '1 किलो नीला थोथा + 1 किलो बुझा हुआ चूना 100 लीटर पानी में।',
          rate_per_acre: '1.0 kg copper sulphate + 1.0 kg lime per acre in 200 Litres water',
          rate_kg_per_acre: 2.0,
          water_litres_per_acre: 200,
          method_en: 'Spray thoroughly on foliage before predicted wet spells and heavy hill fog.',
          method_ta: 'பனிமூட்டம் மற்றும் மழை தொடங்குவதற்கு முன்பே முன்னெச்சரிக்கையாக தெளிக்கவும்.',
          method_hi: 'कोहरा या बारिश शुरू होने से पहले ही अच्छी तरह छिड़कें।',
          frequency_en: 'Every 7 days during continuous fog',
          frequency_ta: 'பனிமூட்டமான நாட்களில் 7 நாட்களுக்கு ஒருமுறை',
          frequency_hi: 'लगातार कोहरे में हर 7 दिन में',
          intervals_days: 7,
          expected_duration_days: 21,
          precautions_en: ['Test with clean knife for neutral reaction before spraying.'],
          precautions_ta: ['கத்தியை முக்கிப் பார்த்து நடுநிலை உறுதி செய்த பின் தெளிக்கவும்.'],
          precautions_hi: ['घोल का परीक्षण करके ही छिड़कें।']
        },
        chemical: {
          product_name_en: 'Cymoxanil 8% + Mancozeb 64% WP (Curzate) or Dimethomorph 50% WP',
          product_name_ta: 'சைமாக்சனில் + மேன்கோசெப் அல்லது டைமெத்தோமார்ஃப்',
          product_name_hi: 'साइमोक्सानिल + मैनकोजेब (कर्जेट) या डाइमेथोमोर्फ',
          active_ingredient: 'Cymoxanil 8% + Mancozeb 64% WP (Systemic + Contact Oomyceticide)',
          approved_rate_per_acre: '400 - 500 grams per acre (2.0 - 2.5 g/L)',
          rate_grams_per_acre: 450,
          water_litres_per_acre: 200,
          method_en: 'Dissolve 450g in 200L water. Apply immediately at first appearance of greasy leaf lesions.',
          method_ta: '450 கிராம் மருந்தை 200 லிட்டர் நீரில் கலந்து உடனே தெளிக்கவும்.',
          method_hi: '450 ग्राम दवा 200 लीटर पानी में घोलकर लक्षण दिखते ही छिड़कें।',
          interval_days: 7,
          duration_days: 14,
          ppe_required_en: ['Gloves, mask, gumboots, chemical apron'],
          ppe_required_ta: ['கையுறைகள், முகக்கவசம் மற்றும் காலணிகள்'],
          ppe_required_hi: ['दस्ताने, मास्क व सुरक्षात्मक कपड़े'],
          pre_harvest_interval_days: 10,
          precautions_en: ['Pre-Harvest Interval (PHI): 10 days. Dehaulm vines before tuber harvest.'],
          precautions_ta: ['அறுவடைக்கு 10 நாட்கள் முன் வரை; கிழங்கு எடுக்கும் முன் தாள்களை வெட்டவும்.'],
          precautions_hi: ['तुड़ाई पूर्व अंतराल: 10 दिन। खुदाई से पहले बेल काटें।']
        }
      },

      potato_healthy: {
        disease_id: 'potato_healthy',
        name_en: 'Healthy Potato Foliage',
        name_ta: 'ஆரோக்கியமான உருளைக்கிழங்கு இலை',
        name_hi: 'स्वस्थ आलू की पत्तियां',
        is_healthy: true,
        pathogen: 'None (Plant is healthy and vigorous)',
        explanation_en: 'Leaves display deep vibrant green color, sturdy stems, and no signs of blight, wilt, or insect feeding. Maintain hill earthing-up and balanced fertilizer splits.',
        explanation_ta: 'இலைகள் நல்ல பசுமையாகவும், நோய்த் தாக்கமின்றியும் ஆரோக்கியமாக உள்ளன. தொடர்ந்து மண் அணைத்து வரவும்.',
        explanation_hi: 'पत्तियां हरी और स्वस्थ हैं। कोई झुलसा या सड़न नहीं है। नियमित मिट्टी चढ़ाने का कार्य जारी रखें।',
        symptoms_en: [
          'Vibrant deep green foliage without marginal browning',
          'Sturdy succulent stems with active vegetative growth',
          'Clean leaf underside free of white downy mildew or aphid colonies'
        ],
        symptoms_ta: [
          'கருகல் இல்லாத அடர்பச்சை இலைகள்',
          'வீரியமான தண்டு மற்றும் பக்கக்கிளை வளர்ச்சி',
          'பூஞ்சை அல்லது பூச்சி இல்லாத சுத்தமான இலைப்பரப்பு'
        ],
        symptoms_hi: [
          'बिना किसी धब्बे के गहरी हरी पत्तियां',
          'मजबूत तने और सामान्य बढ़वार',
          'पत्ती के नीचे किसी फफूंद या कीट का न होना'
        ],
        causes: {
          primary_causes_en: ['Certified disease-free seed tubers, balanced NPK, and optimal soil aeration.'],
          primary_causes_ta: ['சான்றளிக்கப்பட்ட விதைக்கிழங்குகள் மற்றும் சீரான உர மேலாண்மை.'],
          primary_causes_hi: ['प्रमाणित स्वस्थ बीज कंद और संतुलित पोषण।'],
          weather_factors_en: 'Cool, sunny days with well-drained soil moisture.',
          weather_factors_ta: 'மிதமான குளிர் மற்றும் நல்ல வடிகால் வசதி.',
          weather_factors_hi: 'अनुकूल ठंडा मौसम और पर्याप्त धूप।',
          disclaimer_en: 'Scout weekly for blight outbreaks during sudden overcast rainy spells.',
          disclaimer_ta: 'திடீர் மழையின் போது வாரம் ஒருமுறை கருகல் நோய் வருகிறதா என சோதிக்கவும்.',
          disclaimer_hi: 'बादल छाने पर समय-समय पर खेत की जांच करते रहें।'
        },
        organic: {
          name_en: 'Preventive Neem Oil 2% or Cow Dung Filtrate Foliar Spray',
          name_ta: 'முன்னெச்சரிக்கை 2% வேப்பெண்ணெய் கரைசல்',
          name_hi: 'निवारक 2% नीम तेल छिड़काव',
          ingredients_en: 'Pure cold-pressed Neem Oil 4 Litres + Khadi soap 200g in 200 Litres water per acre.',
          ingredients_ta: 'வேப்பெண்ணெய் 4 லிட்டர் + காதர் சோப் 200 கிராம் 200 லிட்டர் நீரில்.',
          ingredients_hi: '4 लीटर नीम तेल 200 लीटर पानी में।',
          rate_per_acre: '4 Litres Neem Oil per acre in 200 Litres water',
          rate_kg_per_acre: 4.0,
          water_litres_per_acre: 200,
          method_en: 'Spray every 15 days in the early morning to build systemic vigor and repel leafhopper vectors.',
          method_ta: '15 நாட்களுக்கு ஒருமுறை அதிகாலையில் தெளிக்கவும்.',
          method_hi: 'हर 15 दिन में सुबह छिड़काव करें।',
          frequency_en: 'Every 15 days during vegetative growth',
          frequency_ta: 'வளர்ச்சிப் பருவத்தில் 15 நாட்களுக்கு ஒருமுறை',
          frequency_hi: 'हर 15 दिन में एक बार',
          intervals_days: 15,
          expected_duration_days: 45,
          precautions_en: ['Safe for soil biology and beneficial insects.'],
          precautions_ta: ['மண் நுண்ணுயிரிகளுக்கு நன்மை பயக்கும்.'],
          precautions_hi: ['पर्यावरण के लिए पूर्णतः सुरक्षित।']
        },
        chemical: {
          product_name_en: 'None Required (Potato Crop is Healthy)',
          product_name_ta: 'தேவைப்படவில்லை (பயிர் ஆரோக்கியமாக உள்ளது)',
          product_name_hi: 'आवश्यक नहीं (फसल स्वस्थ है)',
          active_ingredient: 'None (Chemical fungicide not required)',
          approved_rate_per_acre: '0 g/acre',
          rate_grams_per_acre: 0,
          water_litres_per_acre: 0,
          method_en: 'No chemical sprays required. Continue timely earthing-up to avoid tuber greening.',
          method_ta: 'ரசாயன மருந்துகள் தேவையில்லை. தொடர்ந்து மண் அணைத்து வரவும்.',
          method_hi: 'रासायनिक छिड़काव की आवश्यकता नहीं है। मिट्टी चढ़ाने का कार्य जारी रखें।',
          interval_days: 0,
          duration_days: 0,
          ppe_required_en: ['None required'],
          ppe_required_ta: ['எதுவுமில்லை'],
          ppe_required_hi: ['कोई नहीं'],
          pre_harvest_interval_days: 0,
          precautions_en: ['Avoid water stagnation in furrows.'],
          precautions_ta: ['பாத்திகளில் நீர் தேங்காமல் பார்த்துக் கொள்ளவும்.'],
          precautions_hi: ['खेत में पानी जमा न होने दें।']
        }
      }
    }
  },

  chilli: {
    crop_id: 'chilli',
    crop_name_en: 'Bell Pepper / Chilli',
    crop_name_ta: 'குடைமிளகாய் / மிளகாய்',
    crop_name_hi: 'शिमला मिर्च / मिर्च',
    scientific_name: 'Capsicum annuum',
    soil_info: {
      suitable_soils_en: ['Well-drained Sandy Loam', 'Clay Loam with High Organic Matter'],
      suitable_soils_ta: ['வடிகால் வசதியுள்ள செம்மண் அல்லது மணல் கலந்த வண்டல் மண்'],
      suitable_soils_hi: ['बलुई दोमट व अच्छी जल निकासी वाली दोमट मिट्टी'],
      ph_range: '6.0 - 7.5 (Neutral to Slightly Acidic)',
      requirements_en: 'Extremely sensitive to waterlogging; requires well-drained fertile loamy soil rich in organic matter.',
      requirements_ta: 'தண்ணீர் தேங்காத செழிப்பான வண்டல் மண் அல்லது செம்மண் தேவை.',
      requirements_hi: 'जलभराव के प्रति अत्यधिक संवेदनशील; अच्छी जल निकासी वाली दोमट मिट्टी आवश्यक है।',
      unsuitable_impact_en: 'Waterlogged or poorly drained soils trigger Phytophthora root rot, sudden wilting, and flower shedding.',
      unsuitable_impact_ta: 'நீர் தேங்கினால் வேரழுகல் ஏற்பட்டு செடிகள் வாடி உதிர்ந்து விடும்.',
      unsuitable_impact_hi: 'अतिरिक्त पानी से जड़ गलन और पौधों का अचानक मुरझाना होता है।'
    },
    diseases: {
      chilli_bacterial_spot: {
        disease_id: 'chilli_bacterial_spot',
        name_en: 'Bacterial Spot (Xanthomonas)',
        name_ta: 'மிளகாய் பாக்டீரியா இலைப்புள்ளி நோய்',
        name_hi: 'शिमला मिर्च / मिर्च का जीवाणु धब्बा रोग',
        is_healthy: false,
        pathogen: 'Xanthomonas campestris pv. vesicatoria (Bacterial pathogen)',
        explanation_en: 'Bacterial spot causes water-soaked angular leaf spots, raised scab-like lesions on pods, and extensive defoliation during warm rainy spells.',
        explanation_ta: 'பாக்டீரியா இலைப்புள்ளி நோய் இலைகளில் நீர் ஊறிய புள்ளிகளையும், காய்களில் கொப்புளங்களையும் உண்டாக்கி இலைகளை உதிரச் செய்கிறது.',
        explanation_hi: 'यह जीवाणु रोग पत्तियों पर पानी से भीगे धब्बे और फलों पर खुरदरे घाव बनाता है, जिससे भारी पतझड़ होता है।',
        symptoms_en: [
          'Small circular to irregular water-soaked spots turning dark brown with oily margins',
          'Raised pustular or warty scab lesions on leaf undersides and pepper pods',
          'Severe progressive defoliation leaving bare stems and sunscalded fruits',
          'Cracked, unmarketable diseased pods'
        ],
        symptoms_ta: [
          'இலைகளில் ஒழுங்கற்ற சிறிய நீர் ஊறிய கரும்பழுப்பு புள்ளிகள்',
          'இலையின் அடியில் மற்றும் காய்களில் சொறி போன்ற கொப்புளங்கள்',
          'இலைகள் அனைத்தும் உதிர்ந்து செடி வெறிச்சோடுதல்',
          'காய்கள் வெடித்து சந்தை மதிப்பு இழத்தல்'
        ],
        symptoms_hi: [
          'पत्तियों पर छोटे गहरे भूरे पानी से भीगे धब्बे',
          'पत्ती के नीचे और फल पर उभरे हुए मस्सेदार घाव',
          'भारी पतझड़ और फलों का खराब होना',
          'फलों का फटना और दागदार होना'
        ],
        causes: {
          primary_causes_en: ['Seed-borne inoculum and splash dispersal from infected crop residues during storms'],
          primary_causes_ta: ['விதை வழியாகவும் மழை நீர் தெறிப்பதன் மூலமும் பரவும் பாக்டீரியா'],
          primary_causes_hi: ['संक्रमित बीज और बारिश की बूंदों के छिटकने से फैलाव'],
          weather_factors_en: 'Warm, rainy weather (24°C - 32°C) with high relative humidity and overhead irrigation.',
          weather_factors_ta: 'வெப்பமான ஈரப்பதம் மற்றும் தெளிப்பு நீர் பாசனம்.',
          weather_factors_hi: '24°C से 32°C तापमान और अत्यधिक नमी।',
          disclaimer_en: 'Switching to drip irrigation drastically reduces bacterial splash.',
          disclaimer_ta: 'சொட்டுநீர்ப் பாசனம் அமைப்பது இந்நோயைத் தடுக்கும் சிறந்த வழியாகும்.',
          disclaimer_hi: 'ड्रिप सिंचाई अपनाने से रोग का फैलाव रुकता है।'
        },
        organic: {
          name_en: 'Pseudomonas fluorescens 5 g/L + Neem Seed Kernel Extract 5%',
          name_ta: 'சூடோமோனாஸ் 5 கிராம் + 5% வேப்பங்கொட்டை சாறு',
          name_hi: 'स्यूडोमोनास 5 ग्राम + 5% नीम अर्क',
          ingredients_en: '1.0 kg Pseudomonas fluorescens powder + 200g khadi soap sticker in 200 Litres water per acre.',
          ingredients_ta: 'சூடோமோனாஸ் 1 கிலோ + இயற்கை ஒட்டும் திரவம் 200 லிட்டர் தண்ணீரில்.',
          ingredients_hi: '1 किलो स्यूडोमोनास पाउडर 200 लीटर पानी में।',
          rate_per_acre: '1.0 kg bio-agent powder per acre in 200 Litres water',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
          method_en: 'Spray foliage thoroughly during late afternoon hours upon initial leaf spotting.',
          method_ta: 'மாலை வேளையில் இலைகள் மீது நன்கு படும்படி தெளிக்கவும்.',
          method_hi: 'शाम के समय पत्तियों पर अच्छी तरह छिड़कें।',
          frequency_en: 'Every 10-12 days for 2-3 rounds',
          frequency_ta: '10-12 நாட்கள் இடைவெளியில் 2-3 முறை',
          frequency_hi: '10-12 दिन के अंतराल पर 2-3 बार',
          intervals_days: 10,
          expected_duration_days: 25,
          precautions_en: ['Avoid tank-mixing live bio-agents with copper bactericides.'],
          precautions_ta: ['சூடோமோனாஸுடன் காப்பர் மருந்துகளைக் கலந்து தெளிக்கக் கூடாது.'],
          precautions_hi: ['जैव कवकनाशी को कॉपर के साथ न मिलाएं।']
        },
        chemical: {
          product_name_en: 'Copper Oxychloride 50% WP + Streptocycline 100 ppm',
          product_name_ta: 'காப்பர் ஆக்சிகுளோரைடு 50% WP + ஸ்ட்ரெப்டோசைக்ளின்',
          product_name_hi: 'कॉपर ऑक्सीक्लोराइड 50% WP + स्ट्रेप्टोसाइक्लिन',
          active_ingredient: 'Copper Oxychloride 50% WP + Streptomycin Sulphate 90% + Tetracycline Hydrochloride 10%',
          approved_rate_per_acre: '500g Copper Oxychloride + 20g Streptocycline per acre in 200 L water',
          rate_grams_per_acre: 500,
          water_litres_per_acre: 200,
          method_en: 'Dissolve 500g COC and 20g Streptocycline in 200L clean water. Spray thoroughly over entire canopy.',
          method_ta: '500 கிராம் காப்பர் + 20 கிராம் ஸ்ட்ரெப்டோசைக்ளின் 200 லிட்டர் நீரில் கலந்து தெளிக்கவும்.',
          method_hi: '500 ग्राम कॉपर ऑक्सीक्लोराइड व 20 ग्राम स्ट्रेप्टोसाइक्लिन 200 लीटर पानी में घोलकर छिड़कें।',
          interval_days: 12,
          duration_days: 24,
          ppe_required_en: ['Nitrile gloves, face mask, eye protection, gumboots'],
          ppe_required_ta: ['கையுறைகள், முகக்கவசம் மற்றும் காலணிகள்'],
          ppe_required_hi: ['दस्ताने, मास्क व सुरक्षा चश्मा'],
          pre_harvest_interval_days: 5,
          precautions_en: ['Pre-Harvest Interval (PHI): 5 days. Do not spray during peak noon heat.'],
          precautions_ta: ['அறுவடைக்கு 5 நாட்கள் முன் வரை; நண்பகல் வெயிலில் தெளிப்பதைத் தவிர்க்கவும்.'],
          precautions_hi: ['तुड़ाई पूर्व अंतराल: 5 दिन। तेज धूप में न छिड़कें।']
        }
      },

      chilli_healthy: {
        disease_id: 'chilli_healthy',
        name_en: 'Healthy Pepper / Chilli Foliage',
        name_ta: 'ஆரோக்கியமான குடைமிளகாய் / மிளகாய் இலை',
        name_hi: 'स्वस्थ शिमला मिर्च / मिर्च की पत्तियां',
        is_healthy: true,
        pathogen: 'None (Plant is healthy and vigorous)',
        explanation_en: 'Leaves show uniform glossy green color, healthy budding, and no curling or spotting. Continue standard irrigation and pest monitoring.',
        explanation_ta: 'இலைகள் பளபளப்பான பச்சை நிறத்துடன், பூச்சிகள் அல்லது கருகல் பாதிப்பின்றி ஆரோக்கியமாக உள்ளன.',
        explanation_hi: 'पत्तियां चमकदार, हरी और स्वस्थ हैं। कोई मरोड़िया या धब्बा रोग नहीं है। सामान्य देखभाल जारी रखें।',
        symptoms_en: [
          'Uniform glossy deep green foliage',
          'Smooth lamina without curling, mottling, or chlorosis',
          'Erect healthy stems with vigorous flower bud formation'
        ],
        symptoms_ta: [
          'சீரான பளபளப்பான அடர்பச்சை இலைகள்',
          'சுருட்டல் அல்லது புள்ளிகள் இல்லாத ஆரோக்கியமான இலைப்பரப்பு',
          'செழிப்பான தண்டு மற்றும் மொட்டு வளர்ச்சி'
        ],
        symptoms_hi: [
          'एकसमान चमकदार हरी पत्तियां',
          'बिना किसी सिकुड़न या पीलेपन के स्वस्थ सतह',
          'पौधों की अच्छी बढ़वार व फूल-कलियां'
        ],
        causes: {
          primary_causes_en: ['Optimal soil moisture, balanced nutrition, and absence of thrips/whitefly vectors.'],
          primary_causes_ta: ['சீரான பாசனம், ஊட்டச்சத்து மற்றும் சாறு உறிஞ்சும் பூச்சிகள் இல்லாத சூழல்.'],
          primary_causes_hi: ['उचित सिंचाई, संतुलित खाद और कीटों का अभाव।'],
          weather_factors_en: 'Warm days (20°C - 30°C) with good solar radiation and well-aerated soil.',
          weather_factors_ta: 'நல்ல சூரிய ஒளி மற்றும் மிதமான வெப்பம்.',
          weather_factors_hi: 'अनुकूल तापमान और अच्छी धूप।',
          disclaimer_en: 'Scout twice weekly for thrips and mites during warm flowering weather.',
          disclaimer_ta: 'பூக்கும் காலத்தில் பேன் மற்றும் சிலந்தி தாக்குதல் வராமல் கண்காணிக்கவும்.',
          disclaimer_hi: 'फूल आने के समय कीटों की नियमित निगरानी रखें।'
        },
        organic: {
          name_en: 'Prophylactic 5% Neem Seed Kernel Extract (NSKE) Foliar Spray',
          name_ta: 'முன்னெச்சரிக்கை 5% வேப்பங்கொட்டை சாறு',
          name_hi: 'निवारक 5% नीम बीज अर्क छिड़काव',
          ingredients_en: '5 kg neem seed powder + 200g khadi soap in 200 Litres water per acre.',
          ingredients_ta: 'வேப்பங்கொட்டை தூள் 5 கிலோ + காதர் சோப் 200 கிராம் 200 லிட்டர் தண்ணீரில்.',
          ingredients_hi: '5 किलो नीम बीज चूर्ण 200 लीटर पानी में।',
          rate_per_acre: '2.5 kg active NSKE per acre in 200 Litres water',
          rate_kg_per_acre: 2.5,
          water_litres_per_acre: 200,
          method_en: 'Spray at 15-day intervals in early morning to deter vectors and boost natural defense.',
          method_ta: '15 நாட்களுக்கு ஒருமுறை அதிகாலையில் தெளித்து பூச்சிகளை விரட்டவும்.',
          method_hi: 'हर 15 दिन में सुबह छिड़कें जिससे रस चूसक कीट दूर रहें।',
          frequency_en: 'Once every 15 days',
          frequency_ta: '15 நாட்களுக்கு ஒருமுறை',
          frequency_hi: 'हर 15 दिन में एक बार',
          intervals_days: 15,
          expected_duration_days: 45,
          precautions_en: ['Safe for bees and natural ladybird predators.'],
          precautions_ta: ['நன்மை செய்யும் பூச்சிகளுக்கு முழு பாதுகாப்பு தரும்.'],
          precautions_hi: ['मित्र कीटों के लिए पूरी तरह सुरक्षित।']
        },
        chemical: {
          product_name_en: 'None Required (Foliage is Healthy)',
          product_name_ta: 'தேவைப்படவில்லை (பயிர் ஆரோக்கியமாக உள்ளது)',
          product_name_hi: 'आवश्यक नहीं (फसल स्वस्थ है)',
          active_ingredient: 'None (Chemical treatment not required)',
          approved_rate_per_acre: '0 g/acre',
          rate_grams_per_acre: 0,
          water_litres_per_acre: 0,
          method_en: 'No chemical interventions required. Maintain regular irrigation and weed-free field bunds.',
          method_ta: 'ரசாயன மருந்துகள் தேவையில்லை. வழக்கமான பாசனத்தை தொடரவும்.',
          method_hi: 'रासायनिक छिड़काव की आवश्यकता नहीं है। नियमित सिंचाई व निराई-गुड़ाई जारी रखें।',
          interval_days: 0,
          duration_days: 0,
          ppe_required_en: ['None required'],
          ppe_required_ta: ['எதுவுமில்லை'],
          ppe_required_hi: ['कोई नहीं'],
          pre_harvest_interval_days: 0,
          precautions_en: ['Maintain crop scouting twice weekly.'],
          precautions_ta: ['வாரம் இருமுறை பயிரைக் கண்காணிக்கவும்.'],
          precautions_hi: ['सप्ताह में दो बार खेत का निरीक्षण करें।']
        }
      }
    }
  },
  corn: {
    crop_id: 'corn',
    crop_name_en: 'Corn / Maize',
    crop_name_ta: 'மக்காச்சோளம்',
    crop_name_hi: 'मक्का',
    scientific_name: 'Zea mays',
    soil_info: {
      suitable_soils_en: [
            "Well-drained Fertile Sandy Loam",
            "Deep Silt Loam",
            "Red Loam with High Organic Matter"
          ],
      suitable_soils_ta: [
            "நல்ல வடிகால் வசதியுள்ள மணற்பாங்கான செம்மண்",
            "வண்டல் கலந்த நிலம்",
            "மட்கிய சத்து நிறைந்த வண்டல் மண்"
          ],
      suitable_soils_hi: [
            "अच्छी जल निकासी वाली दोमट मिट्टी",
            "बलुई दोमट",
            "जीवांश युक्त गहरी जलोढ़ मिट्टी"
          ],
      ph_range: '6.0 - 7.5 (Neutral to slightly acidic)',
      requirements_en: 'Maize prefers deep, well-aerated, moisture-retentive loamy soils with good organic matter. Water stagnation for even 24 hours causes severe root asphyxiation.',
      requirements_ta: 'மக்காச்சோளத்திற்கு ஆழமான, தளர்வான, ஈரப்பதத்தைத் தக்கவைக்கும் மண் தேவை. 24 மணி நேரத்திற்கு மேல் நீர் தேங்கினால் பயிர் மூச்சுத்திணறி அழுகிவிடும்.',
      requirements_hi: 'मक्का के लिए अच्छी जल निकासी वाली भुरभुरी मिट्टी आवश्यक है। 24 घंटे से अधिक जलभराव से जड़ें सड़ने लगती हैं।',
      unsuitable_impact_en: 'Heavy waterlogged clay suffocates roots and triggers Pythium stalk rot. Alkaline soils (pH > 8.0) cause severe zinc deficiency (white bud).',
      unsuitable_impact_ta: 'கடின களிமண்ணில் நீர் தேங்கி தண்டு அழுகலை உருவாக்கும். கார மண்ணில் (pH > 8.0) துத்தநாக சத்துக் குறைபாடு ஏற்பட்டு வெண் குருத்து தோன்றும்.',
      unsuitable_impact_hi: 'भारी मटियार मिट्टी में जलभराव से तना गलन रोग होता है। क्षारीय मिट्टी में जस्ते (जिंक) की भारी कमी हो जाती है।'
    },
    diseases: {
      corn_cercospora_leaf_spot: {
        disease_id: 'corn_cercospora_leaf_spot',
        name_en: 'Corn Gray Leaf Spot (Cercospora)',
        name_ta: 'மக்காச்சோள சாம்பல் இலைப்புள்ளி நோய்',
        name_hi: 'मक्का का ग्रे लीफ स्पॉट रोग',
        is_healthy: false,
        pathogen: 'Cercospora zeae-maydis (Fungus)',
        explanation_en: 'If rectangular lesions reach the ear leaf or higher before silking, spray immediately to protect grain filling.',
        explanation_ta: 'கதிர் வெளிவரும் பருவத்தில் கதிர் இலைக்கு மேல் நோய் பரவினால் உடனே பரிந்துரைக்கப்பட்ட பூஞ்சைக்கொல்லியை தெளிக்கவும்.',
        explanation_hi: 'मक्का का ग्रे लीफ स्पॉट रोग',
        symptoms_en: [
            "Small, tan spots with yellow halos that elongate into rectangular, narrow brown lesions delimited by leaf veins.",
            "Lesions expand to 1.5 to 6 cm in length, giving mature leaves a striped, blighted appearance.",
            "Severe blight causes extensive premature canopy death and stalk lodging."
          ],
        symptoms_ta: [
            "இலை நரம்புகளுக்கு இடையே செவ்வக வடிவ சாம்பல்-பழுப்பு நிற புள்ளிகள் தோன்றும்.",
            "புள்ளிகள் நீளவாக்கில் விரிவடைந்து இலை முழுவதும் கருகிய தோற்றத்தை உண்டாக்கும்.",
            "தீவிர பாதிப்பில் இலைகள் காய்ந்து தண்டு சாய்ந்து மகசூல் பெருமளவு குறையும்."
          ],
        symptoms_hi: [
            "पत्तियों की नसों के बीच आयताकार भूरे धब्बे बनते हैं।",
            "धब्बे आपस में मिलकर पूरी पत्ती को झुलसा देते हैं।",
            "गंभीर स्थिति में पत्तियां समय से पहले सूख जाती हैं और तना गिर जाता है।"
          ],
        causes: {
          primary_causes_en: [
            "Plant certified Gray Leaf Spot-tolerant maize hybrids.",
            "Deep plow infected stubble or practice 2-year rotation with non-host crops like soybean or groundnut.",
            "Avoid excessive nitrogen application and maintain balanced potash nutrition to strengthen stalk rind."
          ],
          primary_causes_ta: [
            "நோய் எதிர்ப்புத் திறன் கொண்ட மக்காச்சோள கலப்பின விதைகளைப் பயன்படுத்தவும்.",
            "அறுவடைக்கு பின் முந்தைய பயிர்க் கழிவுகளை ஆழமாக உழுது அழிக்கவும்; மாற்றுப் பயிர் சுழற்சி செய்யவும்.",
            "சீரான சாம்பல் சத்து இட்டு தண்டு வலிமையை அதிகரிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm temperatures (24-30°C) with persistent high relative humidity (>90%) and frequent overcast dew spells.',
          weather_factors_ta: 'மிதமான வெப்பம் (24-30°C) மற்றும் தொடர் காற்றில் ஈரப்பதம் (90% மேல்).',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-IIMR & TNAU Agritech Portal',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-IIMR & TNAU Agritech Portal',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.0 kg / L per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Cercospora zeae-maydis (Fungus)',
          approved_rate_per_acre: '200.0 grams per acre in 200 L water',
          rate_grams_per_acre: 200.0,
          water_litres_per_acre: 200,
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
        }
      },
      corn_common_rust: {
        disease_id: 'corn_common_rust',
        name_en: 'Corn Common Rust (Puccinia sorghi)',
        name_ta: 'மக்காச்சோள துரு நோய்',
        name_hi: 'मक्का का सामान्य रतुआ (रस्ट) रोग',
        is_healthy: false,
        pathogen: 'Puccinia sorghi (Fungus)',
        explanation_en: 'Scout fields during whorl and tassel emergence. Chemical control is economically justified if pustules appear before silking.',
        explanation_ta: 'கதிர் வெளிவரும் முன் துருப்புள்ளிகள் தென்பட்டால் உடனே மேன்கோசெப் தெளித்து கட்டுப்படுத்தவும்.',
        explanation_hi: 'मक्का का सामान्य रतुआ (रस्ट) रोग',
        symptoms_en: [
            "Small, circular to elongate golden-brown to cinnamon-brown powdery pustules (uredinia) scattered on both upper and lower leaf surfaces.",
            "Pustules rupture the leaf epidermis, releasing reddish-brown airborne urediniospores.",
            "Infected leaves turn yellow, chlorotic, and dry prematurely under heavy disease pressure."
          ],
        symptoms_ta: [
            "இலையின் இருபுறமும் செம்பழுப்பு அல்லது துரு போன்ற துகள்கள் நிறைந்த கொப்புளங்கள் தோன்றும்.",
            "கொப்புளங்கள் வெடித்து செம்பழுப்பு நிற வித்துக்கள் வெளியேறும்.",
            "பாதிக்கப்பட்ட இலைகள் மஞ்சள் நிறமாகி காய்ந்து உதிரும்."
          ],
        symptoms_hi: [
            "पत्ती की दोनों सतहों पर लाल-भूरे रंग के उभरे हुए चूर्ण जैसे फफोले (पस्ट्यूल्स) बनते हैं।",
            "फफोले फटने पर भूरे रंग का पाउडर निकलता है।",
            "पत्तियां पीली पड़कर सूखने लगती हैं।"
          ],
        causes: {
          primary_causes_en: [
            "Use rust-resistant hybrid varieties suited for winter and rabi sowing.",
            "Plant early to escape peak cool humid weather conducive for spore germination.",
            "Maintain optimal plant spacing to allow sun penetration and rapid leaf drying."
          ],
          primary_causes_ta: [
            "துரு நோய் எதிர்ப்பு திறன் கொண்ட கலப்பின விதைகளை தேர்வு செய்யவும்.",
            "பருவத்திற்கு ஏற்றவாறு சரியான காலத்தில் விதைப்பு செய்யவும்; தாமத விதைப்பை தவிர்க்கவும்.",
            "நல்ல காற்றோட்டம் கிடைக்க போதிய இடைவெளி விட்டு நடவு செய்யவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Cool to moderate temperatures (16-24°C) with high relative humidity (>95%) and 6 hours of continuous dew.',
          weather_factors_ta: 'குளிர்ந்த இரவு தட்பவெப்பநிலை (16-24°C) மற்றும் அதிக பனிப்பொழிவு.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: Tamil Nadu Agricultural University (TNAU)',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: Tamil Nadu Agricultural University (TNAU)',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.0 kg / L per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Puccinia sorghi (Fungus)',
          approved_rate_per_acre: '400.0 grams per acre in 200 L water',
          rate_grams_per_acre: 400.0,
          water_litres_per_acre: 200,
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
        }
      },
      corn_northern_leaf_blight: {
        disease_id: 'corn_northern_leaf_blight',
        name_en: 'Corn Northern Leaf Blight (Exserohilum)',
        name_ta: 'மக்காச்சோள வடக்கு இலைக் கருகல் நோய்',
        name_hi: 'मक्का का उत्तरी पत्ती झुलसा रोग',
        is_healthy: false,
        pathogen: 'Exserohilum turcicum (Fungus)',
        explanation_en: 'Control is critical if lesions appear before silking. Spray early to prevent defoliation during kernel filling.',
        explanation_ta: 'கதிர் வைக்கும் முன் நோய் தாக்கினால் உடனே மருந்து தெளித்து இலைகளைப் பாதுகாக்கவும்.',
        explanation_hi: 'मक्का का उत्तरी पत्ती झुलसा रोग',
        symptoms_en: [
            "Large, elongated, cigar-shaped or spindle-shaped grayish-green to tan lesions (2.5 to 15 cm long).",
            "Lesions start on lower foliage and spread rapidly upward under humid weather.",
            "Dark olive-green velvety fungal sporulation visible inside lesions during damp mornings."
          ],
        symptoms_ta: [
            "சுருட்டு வடிவிலான நீள்வட்ட சாம்பல்-பச்சை அல்லது வெளிர் பழுப்பு நிற கருகல் புள்ளிகள் (2.5 முதல் 15 செ.மீ) தோன்றும்.",
            "புள்ளிகள் கீழ் இலைகளில் தொடங்கி மேல் இலைகளுக்கு வேகமாகப் பரவும்.",
            "ஈரப்பதமான காலங்களில் புள்ளிகளின் மத்தியில் அடர் ஆலிவ்-பச்சை பூஞ்சை படிவம் காணப்படும்."
          ],
        symptoms_hi: [
            "पत्तियों पर सिगार के आकार के बड़े (2.5 से 15 सेमी) भूरे-धूसर रंग के लंबे धब्बे बनते हैं।",
            "निचली पत्तियों से शुरू होकर रोग तेजी से ऊपर की ओर फैलता है।",
            "पूरी पत्ती झुलसकर सूख जाती है।"
          ],
        causes: {
          primary_causes_en: [
            "Choose certified Ht-gene resistant maize hybrids.",
            "Practice deep plowing of crop residues to bury overwintering chlamydospores.",
            "Rotate crops with non-graminaceous crops for at least one season."
          ],
          primary_causes_ta: [
            "நோய் எதிர்ப்பு திறன் கொண்ட ரகங்களை பயிரிடவும்.",
            "பயிர்க் கழிவுகளை ஆழமாக உழுது மண்ணில் மக்கச் செய்யவும்.",
            "பயிர் சுழற்சி முறையைக் கடைப்பிடிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Moderate temperatures (18-27°C) with persistent dampness, heavy morning dew, and overcast skies.',
          weather_factors_ta: 'மிதமான வெப்பநிலை (18-27°C), காலை பனி மற்றும் தொடர் மேகமூட்டம்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-Indian Institute of Maize Research (IIMR)',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-Indian Institute of Maize Research (IIMR)',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.0 kg / L per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Exserohilum turcicum (Fungus)',
          approved_rate_per_acre: '400.0 grams per acre in 200 L water',
          rate_grams_per_acre: 400.0,
          water_litres_per_acre: 200,
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
        }
      },
      corn_healthy: {
        disease_id: 'corn_healthy',
        name_en: 'Healthy Corn Foliage',
        name_ta: 'ஆரோக்கியமான மக்காச்சோள இலை',
        name_hi: 'स्वस्थ मक्के की पत्ती',
        is_healthy: false,
        pathogen: 'None (Plant is healthy and vigorous)',
        explanation_en: 'Crop is healthy. Ensure adequate irrigation during silking to maximize cob filling.',
        explanation_ta: 'பயிர் ஆரோக்கியமாக உள்ளது. கதிர் முதிர்ச்சி அடையும் வரை சீரான பாசனம் செய்யவும்.',
        explanation_hi: 'स्वस्थ मक्के की पत्ती',
        symptoms_en: [
            "Broad, arching vibrant green leaves with sturdy midribs and no chlorotic or necrotic spots.",
            "Clean leaf blades without fungal pustules, striping, or insect chewing damage.",
            "Vigorous stem and tassel emergence."
          ],
        symptoms_ta: [
            "புள்ளிகள் மற்றும் கருகல் இல்லாத அகன்ற அடர்பச்சை இலைகள்.",
            "பூஞ்சை கொப்புளங்களோ பூச்சி தாக்குதலோ இல்லாத ஆரோக்கியமான பயிர்.",
            "வீரியமான தண்டு மற்றும் கதிர் வளர்ச்சி."
          ],
        symptoms_hi: [
            "बिना किसी धब्बे के चौड़ी हरी पत्तियां।",
            "पौधा मजबूत और स्वस्थ है।"
          ],
        causes: {
          primary_causes_en: [
            "Maintain scheduled split application of Nitrogen (basal, knee-high, and tasseling stages).",
            "Monitor weekly for Fall Armyworm (Spodoptera frugiperda) and stem borer.",
            "Avoid moisture stress during the critical tasseling and silking window."
          ],
          primary_causes_ta: [
            "பரிந்துரைக்கப்பட்ட தழைச்சத்தை பிரித்து இடவும் (அடி உரம், முழங்கால் பருவம், கதிர் பருவம்).",
            "படைப்புழு தாக்குதல் உள்ளதா என வாரம் ஒருமுறை கண்காணிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Well-drained fertile loam with adequate sunshine and balanced soil moisture.',
          weather_factors_ta: 'நல்ல வடிகால் வசதியுள்ள மண் மற்றும் போதுமான சூரிய வெளிச்சம்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-IIMR',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-IIMR',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '0.0 kg / L per acre',
          rate_kg_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'None (Plant is healthy and vigorous)',
          approved_rate_per_acre: '0.0 grams per acre in 200 L water',
          rate_grams_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        }
      }
    }
  },
  apple: {
    crop_id: 'apple',
    crop_name_en: 'Apple',
    crop_name_ta: 'ஆப்பிள்',
    crop_name_hi: 'सेब',
    scientific_name: 'Malus domestica',
    soil_info: {
      suitable_soils_en: [
            "Deep Well-drained Loam",
            "Gravelly Loam with High Humus",
            "Mountain Sandy Clay Loam"
          ],
      suitable_soils_ta: [
            "ஆழமான நல்ல வடிகால் வசதியுள்ள செம்மண்",
            "மலைப்பாங்கான வண்டல் மண்",
            "மட்கிய இலை உரம் மிகுந்த மண்"
          ],
      suitable_soils_hi: [
            "गहरी, अच्छी जल निकासी वाली दोमट मिट्टी",
            "ह्यूमस युक्त पहाड़ी बलुई मिट्टी"
          ],
      ph_range: '6.0 - 6.8 (Slightly acidic)',
      requirements_en: 'Apples require deep soils (minimum 1.5m root depth) with high organic humus and good subsurface aeration.',
      requirements_ta: 'ஆப்பிள் மரங்களின் வேர்கள் ஆழமாக ஊடுருவக்கூடிய, சத்து மிகுந்த, நல்ல வடிகால் வசதியுள்ள மலைமண் மிக அவசியம்.',
      requirements_hi: 'सेब की खेती के लिए कम से कम 1.5 मीटर गहरी, जैविक पदार्थों से भरपूर दोमट मिट्टी सबसे उपयुक्त है।',
      unsuitable_impact_en: 'Poor drainage causes Phytophthora root rot (collar rot). Calcareous soils with pH > 7.5 lock out iron, causing severe foliar chlorosis.',
      unsuitable_impact_ta: 'வடிகால் வசதி இல்லையெனில் வேரழுகல் நோய் தாக்கும். கார மண்ணில் இரும்பு சத்து கிடைக்காமல் இலைகள் வெளுக்கும்.',
      unsuitable_impact_hi: 'जलभराव से जड़ सड़न रोग होता है और अधिक चूने वाली मिट्टी में लोहे की कमी से पत्तियां पीली पड़ जाती हैं।'
    },
    diseases: {
      apple_scab: {
        disease_id: 'apple_scab',
        name_en: 'Apple Scab (Venturia inaequalis)',
        name_ta: 'ஆப்பிள் செதில் நோய் (ஸ்கேப்)',
        name_hi: 'सेब का स्कैब रोग',
        is_healthy: false,
        pathogen: 'Venturia inaequalis (Ascomycete Fungus)',
        explanation_en: 'Timing is paramount. Protective sprays must precede rain events during early bud-burst to petal fall.',
        explanation_ta: 'மொட்டு வெடிக்கும் பருவம் முதல் பூவிதழ் உதிரும் பருவம் வரை மழைக்கு முன் பாதுகாப்பு மருந்து தெளிப்பது அவசியம்.',
        explanation_hi: 'सेब का स्कैब रोग',
        symptoms_en: [
            "Olive-green to velvety dull brown circular spots on leaves that turn dark brown to black and corky with age.",
            "Infected leaves become curled, puckered, yellowed, and drop prematurely.",
            "Fruit develops scabby, corky dark spots that crack and stunt fruit development."
          ],
        symptoms_ta: [
            "இலைகளில் ஆலிவ்-பச்சை அல்லது வெல்வெட் போன்ற அடர் பழுப்பு நிற வட்ட புள்ளிகள் தோன்றும்.",
            "முதிர்ந்த புள்ளிகள் காய்ந்து மரக்கட்டை போல் கடினமாகும்; இலைகள் சுருங்கி உதிரும்.",
            "காய்களில் சொறி போன்ற விரிசல் கொண்ட கருப்பு புள்ளிகள் ஏற்பட்டு காய் வளர்ச்சி குன்றும்."
          ],
        symptoms_hi: [
            "पत्तियों पर जैतूनी हरे व मखमली भूरे रंग के धब्बे बनते हैं जो बाद में काले हो जाते हैं।",
            "पत्तियां मुड़कर समय से पहले गिर जाती हैं।",
            "फलों पर पपड़ीदार खुरदुरे काले धब्बे पड़ते हैं और फल फट जाते हैं।"
          ],
        causes: {
          primary_causes_en: [
            "Prune canopy annually to facilitate sunlight penetration and rapid drying of leaves.",
            "Shred and plow fallen orchard leaves in autumn to disrupt overwintering pseudothecia.",
            "Plant scab-resistant cultivars where commercially viable."
          ],
          primary_causes_ta: [
            "மரங்களில் நல்ல காற்றோட்டம் மற்றும் சூரிய வெளிச்சம் பட கிளைகளை கவாத்து செய்யவும்.",
            "இலையுதிர் காலத்தில் கீழே விழும் இலைகளை சேகரித்து எரிக்கவும் அல்லது உழுது மக்கச் செய்யவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Cool, wet spring weather (12-24°C) with continuous foliage wetness for 9 or more hours.',
          weather_factors_ta: 'குளிர்ந்த மழைக்காலம் (12-24°C) மற்றும் இலைகளில் தொடர்ந்து 9 மணி நேரத்திற்கு மேல் ஈரம் தங்குதல்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-CITH Srinagar & TNAU Horticulture',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-CITH Srinagar & TNAU Horticulture',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.5 kg / L per acre',
          rate_kg_per_acre: 1.5,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Venturia inaequalis (Ascomycete Fungus)',
          approved_rate_per_acre: '500.0 grams per acre in 200 L water',
          rate_grams_per_acre: 500.0,
          water_litres_per_acre: 200,
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
        }
      },
      apple_black_rot: {
        disease_id: 'apple_black_rot',
        name_en: 'Apple Black Rot (Botryosphaeria)',
        name_ta: 'ஆப்பிள் கருப்பு அழுகல் நோய்',
        name_hi: 'सेब का काला सड़न रोग',
        is_healthy: false,
        pathogen: 'Botryosphaeria obtusa (Fungus)',
        explanation_en: 'Eradicate cankers and mummies before spring bud break to reduce primary inoculum by over 80%.',
        explanation_ta: 'வசந்த காலத்திற்கு முன்பே மரத்தின் காயங்களை சுத்தப்படுத்தி பசை பூசுவது நோயை 80% கட்டுப்படுத்தும்.',
        explanation_hi: 'सेब का काला सड़न रोग',
        symptoms_en: [
            "Frogeye leaf spots: small purple specks expanding into circular lesions with light brown centers and distinct dark purple margins.",
            "Black sunken limb cankers on branches and trunk with cracked bark.",
            "Firm brown rot on fruit that darkens to coal-black, mummifying on the branch."
          ],
        symptoms_ta: [
            "இலைகளில் தவளைக் கண் போன்ற புள்ளிகள் (மத்தியில் வெளிர் பழுப்பு, விளிம்பில் அடர் ஊதா) தோன்றும்.",
            "மரக் கிளைகளில் கருமையான பள்ளங்கள் மற்றும் பட்டை வெடிப்புகள் ஏற்படும்.",
            "காய்கள் கருப்பாக அழுகி மரத்திலேயே காய்ந்து சுருங்கி தொங்கும்."
          ],
        symptoms_hi: [
            "पत्तियों पर मेंढक की आंख जैसे गोल धब्बे बनते हैं (किनारे बैंगनी, बीच में भूरे)।",
            "टहनियों पर काले धंसे हुए घाव बनते हैं।",
            "फल सड़कर कोयले जैसे काले हो जाते हैं।"
          ],
        causes: {
          primary_causes_en: [
            "Prune out dead wood, fire-blight infected twigs, and cankered limbs during winter dormancy.",
            "Remove and destroy all mummified fruit hanging on trees or lying on orchard floor.",
            "Prevent bark injury from equipment and maintain balanced tree nutrition."
          ],
          primary_causes_ta: [
            "குளிர்காலத்தில் காய்ந்த மற்றும் நோயுற்ற கிளைகளை வெட்டி அகற்றவும்.",
            "மரத்திலுள்ள சுருங்கிய அழுகிய பழங்களை சேகரித்து அழிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm, humid weather (20-27°C) and presence of fire-blight cankers or wounded bark.',
          weather_factors_ta: 'மிதமான வெப்பம் (20-27°C) மற்றும் காயம்பட்ட மரப்பட்டைகள்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: Cornell Tree Fruit Extension & ICAR-CITH',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: Cornell Tree Fruit Extension & ICAR-CITH',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.0 kg / L per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Botryosphaeria obtusa (Fungus)',
          approved_rate_per_acre: '500.0 grams per acre in 200 L water',
          rate_grams_per_acre: 500.0,
          water_litres_per_acre: 200,
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
        }
      },
      apple_cedar_apple_rust: {
        disease_id: 'apple_cedar_apple_rust',
        name_en: 'Cedar Apple Rust (Gymnosporangium)',
        name_ta: 'ஆப்பிள் துரு நோய்',
        name_hi: 'सेब का रतुआ रोग',
        is_healthy: false,
        pathogen: 'Gymnosporangium juniperi-virginianae (Heteroecious Rust Fungus)',
        explanation_en: 'Protection is required only from pink bud until 2-3 weeks after petal fall when juniper aeciospores are actively blowing.',
        explanation_ta: 'பூ மொட்டு பருவம் முதல் பூவிதழ் உதிர்ந்து 3 வாரங்கள் வரை பாதுகாப்பு தெளிப்பு மிகவும் அவசியம்.',
        explanation_hi: 'सेब का रतुआ रोग',
        symptoms_en: [
            "Bright orange-yellow circular spots with red borders on upper leaf surface.",
            "Underside of lesions develops cylindrical raised tube-like fungal aecia structures that release powdery brown spores.",
            "Fruit lesions are raised, orange-yellow, and cause distortion."
          ],
        symptoms_ta: [
            "இலையின் மேல்புறத்தில் பிரகாசமான ஆரஞ்சு-மஞ்சள் நிற வட்ட புள்ளிகள் தோன்றும்.",
            "இலையின் அடிப்பகுதியில் சிறிய குழாய் போன்ற வித்து அமைப்புகள் உருவாகும்.",
            "காய்களில் ஆரஞ்சு நிற தழும்புகள் ஏற்பட்டு காய் வடிவம் மாறும்."
          ],
        symptoms_hi: [
            "पत्ती की ऊपरी सतह पर चमकीले नारंगी-पीले धब्बे बनते हैं।",
            "पत्ती के नीचे नली जैसे उभार बनते हैं।",
            "फल विकृत हो जाते हैं।"
          ],
        causes: {
          primary_causes_en: [
            "Remove Eastern red cedar and ornamental junipers within 1 to 2 km radius of the orchard.",
            "Plant rust-immune or resistant apple cultivars.",
            "Prune galls on nearby ornamental junipers before gelatinous spore horns form in spring."
          ],
          primary_causes_ta: [
            "ஆப்பிள் தோட்டத்திற்கு அருகில் உள்ள சிடார்/ஜூனிபர் மரங்களை அகற்றவும்.",
            "துரு நோய் எதிர்ப்பு ரகங்களைத் தேர்ந்தெடுக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Presence of alternate host cedar/juniper trees nearby with wet spring weather (10-24°C).',
          weather_factors_ta: 'சுற்றுவட்டாரத்தில் ஜூனிபர்/சிடார் மரங்கள் இருத்தல் மற்றும் வசந்த கால ஈரப்பதம்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: Penn State Extension & ICAR-CITH',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: Penn State Extension & ICAR-CITH',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '2.0 kg / L per acre',
          rate_kg_per_acre: 2.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Gymnosporangium juniperi-virginianae (Heteroecious Rust Fungus)',
          approved_rate_per_acre: '500.0 grams per acre in 200 L water',
          rate_grams_per_acre: 500.0,
          water_litres_per_acre: 200,
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
        }
      },
      apple_healthy: {
        disease_id: 'apple_healthy',
        name_en: 'Healthy Apple Foliage',
        name_ta: 'ஆரோக்கியமான ஆப்பிள் இலை',
        name_hi: 'स्वस्थ सेब की पत्ती',
        is_healthy: false,
        pathogen: 'None (Plant is healthy)',
        explanation_en: 'Trees are healthy. Ensure post-bloom calcium sprays to prevent bitter pit in fruit.',
        explanation_ta: 'மரங்கள் ஆரோக்கியமாக உள்ளன. பழங்களில் கசப்பு புள்ளி வராமல் தடுக்க கால்சியம் தெளிக்கவும்.',
        explanation_hi: 'स्वस्थ सेब की पत्ती',
        symptoms_en: [
            "Lush, dark green leaves with smooth margins and no lesions, mildew, or chlorosis.",
            "Sturdy spurs and shoots with vigorous fruit development.",
            "No pest or mite stippling."
          ],
        symptoms_ta: [
            "புள்ளிகள் மற்றும் கருகல் இல்லாத ஆரோக்கியமான அடர்பச்சை இலைகள்.",
            "வலுவான கிளைகள் மற்றும் சீரான காய் வளர்ச்சி."
          ],
        symptoms_hi: [
            "स्वच्छ और हरी पत्तियां, बिना किसी रोग के लक्षण।"
          ],
        causes: {
          primary_causes_en: [
            "Maintain annual winter pruning and balanced NPK + Boron/Zinc micro-nutrients.",
            "Monitor weekly with pheromone traps for codling moth and leaf miners.",
            "Maintain drip irrigation and orchard mulching."
          ],
          primary_causes_ta: [
            "வருடாந்திர கவாத்து மற்றும் சீரான நுண்ணூட்டச்சத்து மேலாண்மை செய்யவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Temperate climate with adequate winter chilling hours and well-drained orchard soil.',
          weather_factors_ta: 'மிதமான குளிர் தட்பவெப்பநிலை மற்றும் நல்ல வடிகால் வசதி.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-CITH Srinagar',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-CITH Srinagar',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '0.0 kg / L per acre',
          rate_kg_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'None (Plant is healthy)',
          approved_rate_per_acre: '0.0 grams per acre in 200 L water',
          rate_grams_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        }
      }
    }
  },
  grape: {
    crop_id: 'grape',
    crop_name_en: 'Grape',
    crop_name_ta: 'திராட்சை',
    crop_name_hi: 'अंगूर',
    scientific_name: 'Vitis vinifera',
    soil_info: {
      suitable_soils_en: [
            "Well-drained Sandy Loam",
            "Gravelly Red Sandy Soil",
            "Alluvial Deep Loam"
          ],
      suitable_soils_ta: [
            "வடிகால் வசதியுள்ள மணற்பாங்கான செம்மண்",
            "வண்டல் மண்",
            "சரளை கலந்த செம்மண்"
          ],
      suitable_soils_hi: [
            "अच्छी जल निकास वाली बलुई दोमट",
            "कंकड़युक्त लाल दोमट मिट्टी"
          ],
      ph_range: '6.5 - 7.5 (Neutral to slightly alkaline)',
      requirements_en: 'Grapevines thrive in permeable, gravelly or sandy loam soils that prevent wet feet and allow extensive root spread.',
      requirements_ta: 'திராட்சை பயிருக்கு வேர்களில் நீர் தேங்காத, இலகுவான வடிகால் நிலம் மிக அவசியமாகும்.',
      requirements_hi: 'अंगूर के लिए जल निकासी वाली हल्की बलुई दोमट मिट्टी सबसे उपयुक्त है।',
      unsuitable_impact_en: 'Heavy clay restricts root aeration and triggers fanleaf degeneration. Saline soils cause severe marginal leaf scorch.',
      unsuitable_impact_ta: 'களிமண் நிலத்தில் வேர் வளர்ச்சி தடைபடும். உவர் நிலத்தில் இலை ஓரங்கள் கருகி உதிரும்.',
      unsuitable_impact_hi: 'भारी चिकनी मिट्टी में जड़ें नहीं फैलतीं और खारी मिट्टी में पत्तियों के किनारे सूखने लगते हैं।'
    },
    diseases: {
      grape_black_rot: {
        disease_id: 'grape_black_rot',
        name_en: 'Grape Black Rot (Guignardia)',
        name_ta: 'திராட்சை கருப்பு அழுகல் நோய்',
        name_hi: 'अंगूर का ब्लैक रॉट (काला सड़न) रोग',
        is_healthy: false,
        pathogen: 'Guignardia bidwellii (Fungus)',
        explanation_en: 'Berries become highly resistant to black rot once sugar accumulation begins (veraison). Early protection is critical.',
        explanation_ta: 'திராட்சை மணி இனிப்பு வைக்கும் முன் (பூ பூத்த 4 வாரங்களுக்குள்) தெளிப்பது முழு பாதுகாப்பு தரும்.',
        explanation_hi: 'अंगूर का ब्लैक रॉट (काला सड़न) रोग',
        symptoms_en: [
            "Small, circular reddish-brown leaf spots that enlarge and develop a distinct ring of tiny black pycnidia (pimples) near the margin.",
            "Infected berries develop light brown water-soaked spots, turn dark purple-black, and shrivel into hard, wrinkled mummies in 48 hours."
          ],
        symptoms_ta: [
            "இலைகளில் செம்பழுப்பு நிற வட்ட புள்ளிகள் தோன்றி, அதன் விளிம்புகளில் கருப்பு நிற துகள்கள் உருவாகும்.",
            "திராட்சை மணிகள் பழுப்பு நிறமாகி சுருங்கி, 48 மணி நேரத்தில் கருப்பு நிறத்தில் காய்ந்து வற்றலாகி கொடியில் தொங்கும்."
          ],
        symptoms_hi: [
            "पत्तियों पर लाल-भूरे रंग के गोल धब्बे बनते हैं जिनके किनारों पर काले दाने दिखते हैं।",
            "अंगूर के दाने भूरे होकर सिकुड़ जाते हैं और काले व सूखे हो जाते हैं।"
          ],
        causes: {
          primary_causes_en: [
            "Prune dormant canes and bury or burn all mummified grape clusters on trellises or ground.",
            "Shoot-position and canopy-manage to ensure maximum air movement through fruiting zone.",
            "Plant rows oriented to maximize prevailing wind drying."
          ],
          primary_causes_ta: [
            "கொடிகளில் உள்ள காய்ந்த அழுகிய திராட்சை வற்றல்களை சேகரித்து எரிக்கவும்.",
            "கொடிப் பந்தலில் நல்ல காற்றோட்டம் கிடைக்க தேவையற்ற இலைகளை கழிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm, wet conditions (21-27°C) with 7 or more hours of continuous leaf wetness.',
          weather_factors_ta: 'மிதமான வெப்பம் (21-27°C) மற்றும் இலைகளில் 7 மணி நேரத்திற்கு மேல் ஈரம் தங்குதல்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-NRCG Pune & TNAU Agritech',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-NRCG Pune & TNAU Agritech',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '2.0 kg / L per acre',
          rate_kg_per_acre: 2.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Guignardia bidwellii (Fungus)',
          approved_rate_per_acre: '500.0 grams per acre in 200 L water',
          rate_grams_per_acre: 500.0,
          water_litres_per_acre: 200,
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
        }
      },
      grape_esca: {
        disease_id: 'grape_esca',
        name_en: 'Grape Esca (Black Measles)',
        name_ta: 'திராட்சை எஸ்கா (கருப்பு தட்டம்மை) நோய்',
        name_hi: 'अंगूर का एस्का (ब्लैक मीजल्स) रोग',
        is_healthy: false,
        pathogen: 'Phaeomoniella chlamydospora & Fomitiporia (Fungal Complex)',
        explanation_en: 'Esca is a systemic trunk disease with no curative spray. Trunk wound protection and cordon retraining are primary controls.',
        explanation_ta: 'எஸ்கா தண்டு நோய் என்பதால் தெளிப்பு மருந்துகளால் குணப்படுத்த முடியாது; வெட்டுக் காயங்களை பூசுவதே ஒரே தீர்வு.',
        explanation_hi: 'अंगूर का एस्का (ब्लैक मीजल्स) रोग',
        symptoms_en: [
            "Tiger-stripe foliar symptoms: interveinal chlorosis and necrosis with green bands remaining along primary veins.",
            "Apoplexy: sudden rapid wilting and collapse of entire vines during hot dry summer days.",
            "Black measles on berries: small dark purple to brown flecks scattered over the fruit skin."
          ],
        symptoms_ta: [
            "புலி வரி போன்ற இலை அறிகுறிகள்: இலை நரம்புகளுக்கு இடையே மஞ்சள் மற்றும் பழுப்பு நிற வரிகள் தோன்றும்.",
            "கோடை வெயிலில் திடீரென முழுக் கொடியும் வாடி இறந்து போகும் (அப்போப்ளெக்சி).",
            "திராட்சை பழங்களின் தோலில் அம்மை போன்ற கருப்பு புள்ளிகள் தோன்றும்."
          ],
        symptoms_hi: [
            "पत्तियों पर बाघ की धारियों (टाइगर स्ट्राइप) जैसे पीले और भूरे धब्बे बनते हैं।",
            "गर्मी में अचानक पूरी बेल मुरझाकर सूख जाती है।",
            "फलों पर चेचक जैसे गहरे बैंगनी धब्बे पड़ते हैं।"
          ],
        causes: {
          primary_causes_en: [
            "Prune late in the dormant season during dry weather when wound healing is rapid.",
            "Treat large pruning cuts immediately with wound sealant containing Trichoderma or Thiophanate-methyl.",
            "Sanitize pruning shears with 70% alcohol or 10% bleach between vines."
          ],
          primary_causes_ta: [
            "மழை இல்லாத வறண்ட நாட்களில் மட்டுமே கவாத்து செய்யவும்.",
            "பெரிய வெட்டு காயங்களில் டிரைக்கோடெர்மா பசை அல்லது களிம்பு பூசவும்.",
            "கத்தரிக்கோலை ஆல்கஹால் கொண்டு கிருமி நீக்கம் செய்யவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Mature vineyards (>8 years old) with pruning wounds exposed to rain and high summer evapotranspiration.',
          weather_factors_ta: 'பழைய திராட்சை தோட்டங்கள் மற்றும் மழையில் நனையும் கவாத்து வெட்டு காயங்கள்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-NRCG Pune',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-NRCG Pune',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.0 kg / L per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 100,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Phaeomoniella chlamydospora & Fomitiporia (Fungal Complex)',
          approved_rate_per_acre: '250.0 grams per acre in 200 L water',
          rate_grams_per_acre: 250.0,
          water_litres_per_acre: 100,
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
        }
      },
      grape_leaf_blight: {
        disease_id: 'grape_leaf_blight',
        name_en: 'Grape Leaf Blight (Isariopsis)',
        name_ta: 'திராட்சை இலைக் கருகல் நோய்',
        name_hi: 'अंगूर का पत्ती झुलसा रोग',
        is_healthy: false,
        pathogen: 'Pseudocercospora cladosporioides / Isariopsis clavispora (Fungus)',
        explanation_en: 'Maintain healthy canopy cover through post-harvest to allow adequate carbohydrate storage in rootstocks.',
        explanation_ta: 'அறுவடைக்கு பின்னும் இலைகள் உதிராமல் பாதுகாக்க மருந்து தெளிப்பது அடுத்த பருவ விளைச்சலுக்கு உதவும்.',
        explanation_hi: 'अंगूर का पत्ती झुलसा रोग',
        symptoms_en: [
            "Irregular large brown to black necrotic blotches with yellow margins on leaves.",
            "Severe infection leads to widespread premature defoliation exposing bunches to sunburn.",
            "Dull brown spots may also develop on pedicels and cluster stems."
          ],
        symptoms_ta: [
            "இலைகளில் ஒழுங்கற்ற பெரிய பழுப்பு நிற கருகல் திட்டுகள் தோன்றும்.",
            "இலைகள் காய்ந்து முன்கூட்டியே உதிர்வதால் திராட்சை குலைகள் வெயிலில் வெம்பி சேதமடையும்."
          ],
        symptoms_hi: [
            "पत्तियों पर अनियमित बड़े भूरे-काले धब्बे बनते हैं।",
            "पत्तियां गिर जाने से फल धूप से झुलस जाते हैं।"
          ],
        causes: {
          primary_causes_en: [
            "Improve trellis canopy ventilation by leaf thinning around cluster zones.",
            "Practice balanced nutrition and avoid excess nitrogen which creates dense, humid canopy.",
            "Collect and burn infected fallen leaves."
          ],
          primary_causes_ta: [
            "குலைகளைச் சுற்றியுள்ள அதிகப்படியான இலைகளை அகற்றி காற்றோட்டத்தை அதிகரிக்கவும்.",
            "விழுந்த இலைகளை சேகரித்து அழிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'High temperature (25-32°C) combined with intermittent rains and dense canopy microclimate.',
          weather_factors_ta: 'அதிக வெப்பநிலை (25-32°C) மற்றும் விட்டுவிட்டு பெய்யும் மழை.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: Tamil Nadu Agricultural University (TNAU)',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: Tamil Nadu Agricultural University (TNAU)',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.0 kg / L per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Pseudocercospora cladosporioides / Isariopsis clavispora (Fungus)',
          approved_rate_per_acre: '500.0 grams per acre in 200 L water',
          rate_grams_per_acre: 500.0,
          water_litres_per_acre: 200,
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
        }
      },
      grape_healthy: {
        disease_id: 'grape_healthy',
        name_en: 'Healthy Grape Foliage',
        name_ta: 'ஆரோக்கியமான திராட்சை இலை',
        name_hi: 'स्वस्थ अंगूर की पत्ती',
        is_healthy: false,
        pathogen: 'None (Healthy Foliage)',
        explanation_en: 'Canopy is healthy. Ensure cluster thinning if set is too heavy to maintain berry size.',
        explanation_ta: 'கொடி ஆரோக்கியமாக உள்ளது. மணி பருமன் அதிகரிக்க அதிகப்படியான குலைகளைக் கழிக்கவும்.',
        explanation_hi: 'स्वस्थ अंगूर की पत्ती',
        symptoms_en: [
            "Deep green, 5-lobed vigorous leaves with clear margins and no downy/powdery mildew or leaf spots.",
            "Uniform shoot elongation and vibrant berry clusters on well-maintained trellises."
          ],
        symptoms_ta: [
            "பூஞ்சை அல்லது புள்ளிகள் இல்லாத ஆரோக்கியமான அடர்பச்சை இலைகள்.",
            "பந்தலில் செழிப்பாக படர்ந்துள்ள கொடிகள் மற்றும் திராட்சை மணிகள்."
          ],
        symptoms_hi: [
            "स्वच्छ, हरी पत्तियां बिना किसी रोग के लक्षण।"
          ],
        causes: {
          primary_causes_en: [
            "Continue canopy training and shoot pinching.",
            "Monitor weekly for thrips, mealybugs, and downy mildew.",
            "Maintain balanced fertigation schedule based on petiole nutrient analysis."
          ],
          primary_causes_ta: [
            "கொடி பயிற்சி மற்றும் நுனி கிள்ளுதல் தொடரவும்.",
            "அசுவினி மற்றும் மாவுப்பூச்சிகள் உள்ளதா என கண்காணிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm sunny days with moderate humidity and deep well-drained loamy soil with drip fertigation.',
          weather_factors_ta: 'நல்ல சூரிய வெளிச்சம் மற்றும் சொட்டுநீர்ப் பாசனம்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-NRCG Pune',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-NRCG Pune',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '0.0 kg / L per acre',
          rate_kg_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'None (Healthy Foliage)',
          approved_rate_per_acre: '0.0 grams per acre in 200 L water',
          rate_grams_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        }
      }
    }
  },
  orange: {
    crop_id: 'orange',
    crop_name_en: 'Orange / Citrus',
    crop_name_ta: 'ஆரஞ்சு / எலுமிச்சை',
    crop_name_hi: 'संतरा / नींबू वर्गीय',
    scientific_name: 'Citrus sinensis',
    soil_info: {
      suitable_soils_en: [
            "Deep Well-drained Loam",
            "Red Loam with Good Subsoil Permeability"
          ],
      suitable_soils_ta: [
            "ஆழமான நல்ல வடிகால் உள்ள செம்மண்",
            "வண்டல் கலந்த மணல் மண்"
          ],
      suitable_soils_hi: [
            "गहरी, उपजाऊ और जल निकास युक्त दोमट मिट्टी"
          ],
      ph_range: '6.0 - 7.5',
      requirements_en: 'Citrus needs deep, well-aerated soil without a hard subsoil pan or high water table.',
      requirements_ta: 'எலுமிச்சை, ஆரஞ்சு மரங்களுக்கு கடின பாறை இல்லாத, ஆழமான செம்மண் நிலம் தேவை.',
      requirements_hi: 'संतरे और नींबू वर्गीय फसलों के लिए गहरी और भुरभुरी मिट्टी आवश्यक है।',
      unsuitable_impact_en: 'High water tables trigger Phytophthora gummosis. Calcareous soils induce severe zinc and iron deficiencies.',
      unsuitable_impact_ta: 'நீர் தேங்கினால் பிசின் ஒழுகும் நோய் தாக்கும். கார மண்ணில் நுண்ணூட்டச் சத்துக் குறைபாடு தோன்றும்.',
      unsuitable_impact_hi: 'जलभराव से तने से गोंद निकलने का रोग (गमोसिस) होता है।'
    },
    diseases: {
      orange_citrus_greening: {
        disease_id: 'orange_citrus_greening',
        name_en: 'Citrus Greening (Huanglongbing)',
        name_ta: 'சிட்ரஸ் கிரீனிங் (ஹுவாங்லாங்பிங்) நோய்',
        name_hi: 'सिट्रस ग्रीनिंग (हुआंगलोंगबिंग) रोग',
        is_healthy: false,
        pathogen: 'Candidatus Liberibacter asiaticus (Fastidious Phloem Bacterium, Vector: Asian Citrus Psyllid)',
        explanation_en: 'HLB has no cure. Control vectors aggressively during each flush and eliminate symptomatic reservoir trees immediately.',
        explanation_ta: 'கிரீனிங் நோயை குணப்படுத்த முடியாது; சைலிட் பூச்சியைக் கட்டுப்படுத்துவதும் நோயுற்ற மரங்களை அகற்றுவதுமே பரவலைத் தடுக்கும்.',
        explanation_hi: 'सिट्रस ग्रीनिंग (हुआंगलोंगबिंग) रोग',
        symptoms_en: [
            "Asymmetric blotchy mottle on leaves (chlorotic yellow patches crossing the primary veins irregularly).",
            "Yellow shoots appearing suddenly in one branch of an otherwise green tree (yellow dragon).",
            "Upright, small, hardened leaves with zinc-deficiency-like symptoms that do not respond to fertilizer.",
            "Small, lopsided, bitter fruit with aborted dark seeds; fruit stays green at the stylar end."
          ],
        symptoms_ta: [
            "இலை நரம்புகளைத் தாண்டி ஒழுங்கற்ற முறையில் தோன்றும் சமச்சீரற்ற மஞ்சள்-பச்சை மங்கலான திட்டுகள்.",
            "பச்சை மரத்தில் ஒரு கிளை மட்டும் திடீரென மஞ்சள் நிறமாக மாறுதல் (மஞ்சள் டிராகன்).",
            "துத்தநாக குறைபாடு போன்று செங்குத்தாக நிற்கும் சிறிய, தடித்த இலைகள்.",
            "ஒருபுறம் சாய்ந்த, கசப்புச் சுவையுடைய பழங்கள்; பழத்தின் அடிப்பகுதி பழுக்காமல் பச்சையாகவே இருத்தல்."
          ],
        symptoms_hi: [
            "पत्तियों पर अनियमित रूप से पीले-हरे धब्बे (असममित ब्लॉची मोटल) बनते हैं।",
            "पूरे हरे पेड़ में कोई एक टहनी अचानक पीली पड़ जाती है।",
            "फल टेढ़े-मेढ़े, छोटे, कड़वे और पकने पर भी नीचे से हरे रहते हैं।"
          ],
        causes: {
          primary_causes_en: [
            "Plant only certified disease-free budwood from registered screenhouse nurseries.",
            "Aggressively scout and control the Asian Citrus Psyllid (Diaphorina citri) vector using yellow sticky traps.",
            "Promptly rogue out (uproot and burn) severely infected trees to eliminate bacterial reservoirs."
          ],
          primary_causes_ta: [
            "சான்றளிக்கப்பட்ட நர்சரிகளிலிருந்து பெறப்பட்ட ஆரோக்கியமான ஒட்டுக்கன்றுகளை மட்டுமே நடவு செய்யவும்.",
            "சைலிட் பூச்சிகளைக் கட்டுப்படுத்த மஞ்சள் நிற ஒட்டும் பொறிகளைப் பயன்படுத்தவும்.",
            "தீவிரமாக பாதிக்கப்பட்ட மரங்களை உடனே வேரோடு பிடுங்கி தீயிட்டு அழிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm humid conditions (22-30°C) with active vegetative flushing that attracts the Asian Citrus Psyllid vector.',
          weather_factors_ta: 'புதிய தளிர் விடும் பருவம் மற்றும் ஆசிய சிட்ரஸ் சைலிட் பூச்சிகள் பரவுதல்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-CCRI Nagpur & TNAU Horticulture',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-CCRI Nagpur & TNAU Horticulture',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.0 kg / L per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Candidatus Liberibacter asiaticus (Fastidious Phloem Bacterium, Vector: Asian Citrus Psyllid)',
          approved_rate_per_acre: '60.0 grams per acre in 200 L water',
          rate_grams_per_acre: 60.0,
          water_litres_per_acre: 200,
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
        }
      }
    }
  },
  peach: {
    crop_id: 'peach',
    crop_name_en: 'Peach',
    crop_name_ta: 'பீச்',
    crop_name_hi: 'आड़ू (पीच)',
    scientific_name: 'Prunus persica',
    soil_info: {
      suitable_soils_en: [
            "Deep Sandy Loam",
            "Gravelly Well-drained Loam"
          ],
      suitable_soils_ta: [
            "ஆழமான மணற்பாங்கான வண்டல் மண்",
            "மலை வடிகால் மண்"
          ],
      suitable_soils_hi: [
            "गहरी बलुई दोमट मिट्टी"
          ],
      ph_range: '6.0 - 6.5',
      requirements_en: 'Peaches are very sensitive to wet feet and demand exceptionally well-drained topsoil.',
      requirements_ta: 'பீச் பழ மரங்கள் நீர் தேங்குவதை தாங்காது; மிகச் சிறந்த வடிகால் தேவை.',
      requirements_hi: 'आड़ू की फसल के लिए अत्यधिक जल निकासी वाली हल्की मिट्टी चाहिए।',
      unsuitable_impact_en: 'Wet soils cause root asphyxiation within 48 hours and induce root rot.',
      unsuitable_impact_ta: '48 மணி நேர நீர் தேக்கம் வேர்களை அழுகச் செய்து மரத்தை அழித்துவிடும்.',
      unsuitable_impact_hi: 'जलभराव से 48 घंटे में जड़ें नष्ट हो जाती हैं।'
    },
    diseases: {
      peach_bacterial_spot: {
        disease_id: 'peach_bacterial_spot',
        name_en: 'Peach Bacterial Spot (Xanthomonas)',
        name_ta: 'பீச் பாக்டீரியா இலைப்புள்ளி நோய்',
        name_hi: 'आड़ू का जीवाणु धब्बा रोग',
        is_healthy: false,
        pathogen: 'Xanthomonas arboricola pv. pruni (Bacterium)',
        explanation_en: 'Dormant copper sprays are the foundation of control. Avoid high copper concentrations once leaves emerge.',
        explanation_ta: 'இலை துளிர்ப்பதற்கு முன் காப்பர் மருந்து தெளிப்பது நோயைக் கட்டுப்படுத்தும் முதன்மை நடவடிக்கையாகும்.',
        explanation_hi: 'आड़ू का जीवाणु धब्बा रोग',
        symptoms_en: [
            "Small, water-soaked, angular polygonal spots on leaves that turn purple-brown and drop out, creating a shothole appearance.",
            "Leaves turn yellow and defoliate, severely weakening the tree.",
            "Fruit exhibits sunken, dark brown cracked craters with gum exudation."
          ],
        symptoms_ta: [
            "இலைகளில் சிறிய கோண வடிவ புள்ளிகள் தோன்றி, காய்ந்து உதிர்ந்து துப்பாக்கி குண்டு துளைத்தது போன்ற ஓட்டைகள் (ஷாட்-ஹோல்) ஏற்படும்.",
            "இலைகள் மஞ்சளாகி உதிரும்; காய்களில் பசை வழியும் வெடிப்புப் பள்ளங்கள் தோன்றும்."
          ],
        symptoms_hi: [
            "पत्तियों पर कोणीय भूरे धब्बे बनते हैं जो सूखकर गिर जाते हैं और पत्ती में छेद हो जाते हैं (शॉट-होल)।",
            "पत्तियां पीली होकर गिर जाती हैं और फलों पर गहरे गड्ढे बन जाते हैं।"
          ],
        causes: {
          primary_causes_en: [
            "Plant bacterial spot-resistant peach varieties.",
            "Plant windbreaks around orchards to reduce wind-blown sand abrasion that opens infection courts.",
            "Avoid excessive summer pruning that stimulates late tender succulent growth."
          ],
          primary_causes_ta: [
            "நோய் எதிர்ப்பு திறன் கொண்ட ரகங்களை நடவு செய்யவும்.",
            "தோட்டத்தைச் சுற்றி காற்று தடுப்பு மரங்களை வளர்க்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm, windy, wet spring weather (20-29°C) with blowing sandy soils causing micro-abrasions.',
          weather_factors_ta: 'ஈரப்பதமான வசந்த காலம் மற்றும் மணல் கலந்த காற்று இலைகளை உரசுதல்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: Clemson Extension & ICAR-CITH',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: Clemson Extension & ICAR-CITH',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.0 kg / L per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Xanthomonas arboricola pv. pruni (Bacterium)',
          approved_rate_per_acre: '500.0 grams per acre in 200 L water',
          rate_grams_per_acre: 500.0,
          water_litres_per_acre: 200,
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
        }
      },
      peach_healthy: {
        disease_id: 'peach_healthy',
        name_en: 'Healthy Peach Foliage',
        name_ta: 'ஆரோக்கியமான பீச் இலை',
        name_hi: 'स्वस्थ आड़ू की पत्ती',
        is_healthy: false,
        pathogen: 'None (Healthy Foliage)',
        explanation_en: 'Foliage is healthy. Ensure adequate thinning to achieve good fruit size and prevent limb breakage.',
        explanation_ta: 'பயிர் ஆரோக்கியமாக உள்ளது. பழங்கள் பெருக்க போதுமான காய்களை கவாத்து செய்யவும்.',
        explanation_hi: 'स्वस्थ आड़ू की पत्ती',
        symptoms_en: [
            "Glossy lanceolate green leaves without shot-holes, leaf curl, or cankers.",
            "Strong shoot growth and expanding velvety green fruit."
          ],
        symptoms_ta: [
            "துளைகள் அல்லது கருகல் இல்லாத பளபளப்பான அடர்பச்சை இலைகள்.",
            "ஆரோக்கியமான தண்டு மற்றும் காய் வளர்ச்சி."
          ],
        symptoms_hi: [
            "स्वच्छ, हरी पत्तियां बिना किसी रोग के लक्षण।"
          ],
        causes: {
          primary_causes_en: [
            "Maintain balanced stone-fruit pruning and fruit thinning (1 fruit per 15-20 cm of shoot).",
            "Monitor for oriental fruit moth and peach tree borers.",
            "Maintain drip irrigation and weed control."
          ],
          primary_causes_ta: [
            "சீரான கவாத்து மற்றும் பழங்களை கழித்து விடுதல் (15 செ.மீ-க்கு ஒரு காய்)."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Deep, gravelly, well-drained loamy soil with full sunlight and adequate winter chilling hours.',
          weather_factors_ta: 'நல்ல வடிகால் வசதியுள்ள மண் மற்றும் போதுமான குளிர்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-CITH',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-CITH',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '0.0 kg / L per acre',
          rate_kg_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'None (Healthy Foliage)',
          approved_rate_per_acre: '0.0 grams per acre in 200 L water',
          rate_grams_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        }
      }
    }
  },
  cherry: {
    crop_id: 'cherry',
    crop_name_en: 'Cherry',
    crop_name_ta: 'செர்ரி',
    crop_name_hi: 'चेरी',
    scientific_name: 'Prunus avium',
    soil_info: {
      suitable_soils_en: [
            "Deep Well-drained Sandy Loam",
            "Gravelly Mountain Soil"
          ],
      suitable_soils_ta: [
            "ஆழமான வடிகால் கொண்ட மலை மண்"
          ],
      suitable_soils_hi: [
            "पहाड़ी ढलानों वाली गहरी दोमट"
          ],
      ph_range: '6.0 - 7.0',
      requirements_en: 'Cherries need deep, fertile, moisture-retentive but open-structured mountain loams.',
      requirements_ta: 'செர்ரி மரங்களுக்கு ஆழமான சத்துள்ள மலை வண்டல் மண் தேவை.',
      requirements_hi: 'चेरी के लिए जैविक पदार्थों से भरपूर पहाड़ी दोमट मिट्टी उपयुक्त है।',
      unsuitable_impact_en: 'Poor drainage leads to crown gall and root rot diseases.',
      unsuitable_impact_ta: 'வடிகால் குறைபாடு வேரழுகல் நோயை உண்டாக்கும்.',
      unsuitable_impact_hi: 'खराब जल निकासी से जड़ों में गांठे और गलन की समस्या आती है।'
    },
    diseases: {
      cherry_powdery_mildew: {
        disease_id: 'cherry_powdery_mildew',
        name_en: 'Cherry Powdery Mildew (Podosphaera)',
        name_ta: 'செர்ரி சாம்பல் நோய்',
        name_hi: 'चेरी का चूर्णिल आसिता (पाउडரி मिल्ड्यू) रोग',
        is_healthy: false,
        pathogen: 'Podosphaera clandestina (Fungus)',
        explanation_en: 'Initiate control at shuck fall. Once mildew is established on expanding green fruit, eradication is impossible.',
        explanation_ta: 'பூவிதழ் உதிர்ந்த உடனே முதல் தெளிப்பை மேற்கொள்ளவும்; காய் பிடித்த பின் கட்டுப்படுத்துவது கடினம்.',
        explanation_hi: 'चेरी का चूर्णिल आसिता (पाउडரி मिल्ड्यू) रोग',
        symptoms_en: [
            "White, talcum-like powdery fungal patches on young foliage and succulent shoot tips.",
            "Infected leaves cup, curl upward, distort, and become brittle.",
            "Green developing fruit gets coated with white mycelium, causing deformation and unmarketable fruit."
          ],
        symptoms_ta: [
            "இளம் இலைகள் மற்றும் தளிர்களில் வெள்ளை மாவு போன்ற பூஞ்சை படிவம் தோன்றும்.",
            "இலைகள் மேல்நோக்கி சுருண்டு உருமாறும்.",
            "பிஞ்சு காய்களில் வெள்ளை பூஞ்சை படர்ந்து காய் சொறியாகி அழுகும்."
          ],
        symptoms_hi: [
            "पत्तियों और टहनियों पर सफेद पाउडर जैसी फफूंद जम जाती है।",
            "पत्तियां ऊपर की ओर मुड़ जाती हैं।",
            "फलों पर सफेद पाउडर जमने से फल खराब हो जाते हैं।"
          ],
        causes: {
          primary_causes_en: [
            "Prune inner canopy vigorously to enhance airflow and light penetration.",
            "Avoid excessive late-season nitrogen applications that stimulate late succulent flush.",
            "Monitor water shoots and sucker growth weekly."
          ],
          primary_causes_ta: [
            "மரத்தின் உட்பகுதியில் நல்ல காற்றோட்டம் கிடைக்க கிளைகளை கவாத்து செய்யவும்.",
            "அதிகப்படியான தழைச்சத்து உரமிடுவதை தவிர்க்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm, dry daytime temperatures (20-28°C) accompanied by humid nights and dense shade.',
          weather_factors_ta: 'மிதமான வெப்பமான பகல் மற்றும் அதிக ஈரப்பதமான இரவு.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: University of California Statewide IPM Program & ICAR-CITH',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: University of California Statewide IPM Program & ICAR-CITH',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.5 kg / L per acre',
          rate_kg_per_acre: 1.5,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Podosphaera clandestina (Fungus)',
          approved_rate_per_acre: '200.0 grams per acre in 200 L water',
          rate_grams_per_acre: 200.0,
          water_litres_per_acre: 200,
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
        }
      },
      cherry_healthy: {
        disease_id: 'cherry_healthy',
        name_en: 'Healthy Cherry Foliage',
        name_ta: 'ஆரோக்கியமான செர்ரி இலை',
        name_hi: 'स्वस्थ चेरी की पत्ती',
        is_healthy: false,
        pathogen: 'None (Healthy Foliage)',
        explanation_en: 'Foliage is healthy. Maintain netting or bird deterrents as fruit approaches veraison.',
        explanation_ta: 'பயிர் ஆரோக்கியமாக உள்ளது. பழம் பழுக்கும் போது பறவை வலைகளை அமைக்கவும்.',
        explanation_hi: 'स्वस्थ चेरी की पत्ती',
        symptoms_en: [
            "Vibrant, uniformly green foliage with serrated margins and no powdery mildew or shothole lesions.",
            "Clean shoots and healthy expanding fruit clusters."
          ],
        symptoms_ta: [
            "சாம்பல் படிவமோ துளைகளோ இல்லாத அடர்பச்சை இலைகள்.",
            "ஆரோக்கியமான தளிர் மற்றும் காய் வளர்ச்சி."
          ],
        symptoms_hi: [
            "स्वच्छ, हरी पत्तियां बिना किसी रोग के लक्षण।"
          ],
        causes: {
          primary_causes_en: [
            "Maintain balanced stone-fruit fertilization.",
            "Regular scouting for cherry fruit fly and aphids.",
            "Manage orchard floor weeds."
          ],
          primary_causes_ta: [
            "சீரான உர மேலாண்மை மற்றும் களை கட்டுப்பாடு செய்யவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Adequate winter chilling with warm, dry ripening summers and well-drained orchard soil.',
          weather_factors_ta: 'நல்ல வடிகால் வசதியுள்ள மண் மற்றும் சீரான தட்பவெப்பநிலை.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-CITH',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-CITH',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '0.0 kg / L per acre',
          rate_kg_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'None (Healthy Foliage)',
          approved_rate_per_acre: '0.0 grams per acre in 200 L water',
          rate_grams_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        }
      }
    }
  },
  strawberry: {
    crop_id: 'strawberry',
    crop_name_en: 'Strawberry',
    crop_name_ta: 'ஸ்ட்ராபெர்ரி',
    crop_name_hi: 'स्ट्रॉबेरी',
    scientific_name: 'Fragaria ananassa',
    soil_info: {
      suitable_soils_en: [
            "Rich Sandy Loam with High Organic Matter",
            "Raised Bed Compost Soil"
          ],
      suitable_soils_ta: [
            "மக்கிய உரம் கலந்த மணற்பாங்கான செம்மண்",
            "மேட்டுப்பாத்தி வடிகால் மண்"
          ],
      suitable_soils_hi: [
            "जीवांश युक्त बलुई दोमट"
          ],
      ph_range: '5.5 - 6.5 (Mildly acidic)',
      requirements_en: 'Strawberries have shallow root systems and need fertile, compost-rich soil with raised bed drainage.',
      requirements_ta: 'ஸ்ட்ராபெரி மேலோட்டமான வேர்களைக் கொண்டது; மேட்டுப்பாத்தி சாகுபடிக்கு ஏற்ற மண் தேவை.',
      requirements_hi: 'स्ट्रॉबेरी के लिए उठी हुई क्यारियों में भुरभुरी व उपजाऊ मिट्टी चाहिए।',
      unsuitable_impact_en: 'Water stagnation causes red stele and black root rot within days.',
      unsuitable_impact_ta: 'நீர் தேங்கினால் சிவப்பு வேர் அழுகல் நோய் தாக்கும்.',
      unsuitable_impact_hi: 'जलभराव से जड़ें सड़ जाती हैं।'
    },
    diseases: {
      strawberry_leaf_scorch: {
        disease_id: 'strawberry_leaf_scorch',
        name_en: 'Strawberry Leaf Scorch (Diplocarpon)',
        name_ta: 'ஸ்ட்ராபெர்ரி இலை தீய்ந்த நோய்',
        name_hi: 'स्ट्रॉबेरी का लीफ स्कॉर्च रोग',
        is_healthy: false,
        pathogen: 'Diplocarpon earlianum (Fungus)',
        explanation_en: 'Prompt removal of older infected leaves reduces disease spread by over 70%. Ensure beds have excellent drainage.',
        explanation_ta: 'பாதிக்கப்பட்ட பழைய இலைகளை உடனுக்குடன் அகற்றுவது நோய் பரவுவதை 70% தடுக்கும்.',
        explanation_hi: 'स्ट्रॉबेरी का लीफ स्कॉर्च रोग',
        symptoms_en: [
            "Numerous small, irregular dark purple to red spots on upper leaf surfaces.",
            "Unlike leaf spot, scorch spots never develop white or gray centers.",
            "Spots coalesce rapidly, causing entire leaf blades to look scorched, dry, and curl upward."
          ],
        symptoms_ta: [
            "இலையின் மேல்புறத்தில் எண்ணற்ற சிறிய ஒழுங்கற்ற அடர் ஊதா அல்லது செம்பழுப்பு புள்ளிகள் தோன்றும்.",
            "புள்ளிகள் ஒன்றுசேர்ந்து முழு இலையும் தீயில் கருகியது போல் சுருண்டு காய்ந்து விடும்."
          ],
        symptoms_hi: [
            "पत्तियों पर गहरे बैंगनी व लाल रंग के छोटे-छोटे धब्बे बनते हैं।",
            "पूरी पत्ती जली हुई सी दिखती है और ऊपर की ओर मुड़ जाती है।"
          ],
        causes: {
          primary_causes_en: [
            "Plant certified, disease-free strawberry runners on raised beds with black plastic mulch.",
            "Avoid overhead sprinkler irrigation; always use sub-surface drip.",
            "Renovate beds after harvest by mowing, raking, and destroying old infected foliage."
          ],
          primary_causes_ta: [
            "சான்றளிக்கப்பட்ட நாற்றுகளை மேட்டுப்பாத்தியில் நிலப்போர்வை அமைத்து நடவு செய்யவும்.",
            "சொட்டுநீர்ப் பாசனம் மட்டுமே பயன்படுத்தவும்; அறுவடைக்கு பின் பழைய இலைகளை வெட்டி அழிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm, rainy weather (20-28°C) with persistent leaf wetness from overhead watering or morning fog.',
          weather_factors_ta: 'மிதமான வெப்பம் மற்றும் மழை அல்லது பனி ஈரப்பதம்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-CITH & TNAU Horticulture',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-CITH & TNAU Horticulture',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.0 kg / L per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Diplocarpon earlianum (Fungus)',
          approved_rate_per_acre: '400.0 grams per acre in 200 L water',
          rate_grams_per_acre: 400.0,
          water_litres_per_acre: 200,
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
        }
      },
      strawberry_healthy: {
        disease_id: 'strawberry_healthy',
        name_en: 'Healthy Strawberry Foliage',
        name_ta: 'ஆரோக்கியமான ஸ்ட்ராபெர்ரி இலை',
        name_hi: 'स्वस्थ स्ट्रॉबेरी की पत्ती',
        is_healthy: false,
        pathogen: 'None (Healthy Foliage)',
        explanation_en: 'Foliage is healthy. Ensure adequate potassium and calcium fertigation during fruit development.',
        explanation_ta: 'பயிர் ஆரோக்கியமாக உள்ளது. பழம் வளரும் பருவத்தில் பொட்டாசியம் மற்றும் கால்சியம் உரமிடவும்.',
        explanation_hi: 'स्वस्थ स्ट्रॉबेरी की पत्ती',
        symptoms_en: [
            "Vibrant green, trifoliate leaves with serrated edges and no leaf spots, scorch, or powdery mildew.",
            "Sturdy crowns, active runnering, and vigorous flower/fruit trusses."
          ],
        symptoms_ta: [
            "புள்ளிகள் அல்லது கருகல் இல்லாத பளபளப்பான அடர்பச்சை இலைகள்.",
            "வீரியமான தளிர் மற்றும் பூ, காய் வளர்ச்சி."
          ],
        symptoms_hi: [
            "स्वच्छ, हरी पत्तियां बिना किसी रोग के लक्षण।"
          ],
        causes: {
          primary_causes_en: [
            "Maintain plastic mulching to prevent soil splashing onto fruit.",
            "Scout weekly for two-spotted spider mites and thrips.",
            "Maintain balanced fertigation with calcium and potassium."
          ],
          primary_causes_ta: [
            "மண்ணிலிருந்து காய் மீது நீர் தெறிக்காமல் இருக்க நிலப்போர்வை பராமரிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Cool, sunny climate with raised bed mulch and well-drained sandy loam soil.',
          weather_factors_ta: 'மிதமான குளிர், நல்ல சூரிய ஒளி மற்றும் மேட்டுப்பாத்தி சொட்டுநீர்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-CITH',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-CITH',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '0.0 kg / L per acre',
          rate_kg_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'None (Healthy Foliage)',
          approved_rate_per_acre: '0.0 grams per acre in 200 L water',
          rate_grams_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        }
      }
    }
  },
  squash: {
    crop_id: 'squash',
    crop_name_en: 'Squash / Cucurbits',
    crop_name_ta: 'பூசணி / சுரை',
    crop_name_hi: 'कद्दू / स्क्वैश',
    scientific_name: 'Cucurbita pepo',
    soil_info: {
      suitable_soils_en: [
            "Well-drained Fertile Sandy Loam",
            "Rich Alluvial Loam"
          ],
      suitable_soils_ta: [
            "வண்டல் கலந்த மணற்பாங்கான நிலம்",
            "செம்மண்"
          ],
      suitable_soils_hi: [
            "उपजाऊ बलुई दोमट मिट्टी"
          ],
      ph_range: '6.0 - 6.8',
      requirements_en: 'Cucurbits thrive in warm, fertile, humus-rich soil with rapid drainage.',
      requirements_ta: 'பூசணி வகைகளுக்கு நல்ல வடிகால் வசதியும் அங்கக சத்தும் உள்ள நிலம் தேவை.',
      requirements_hi: 'कद्दू वर्गीय फसलों के लिए अच्छी जल निकासी वाली गर्म मिट्टी चाहिए।',
      unsuitable_impact_en: 'Poor drainage triggers damping-off and sudden Fusarium wilt.',
      unsuitable_impact_ta: 'வடிகால் இல்லையெனில் நாற்று அழுகல் மற்றும் வாடல் நோய் தாக்கும்.',
      unsuitable_impact_hi: 'जलभराव से उकठा (मुरझान) रोग तेजी से फैलता है।'
    },
    diseases: {
      squash_powdery_mildew: {
        disease_id: 'squash_powdery_mildew',
        name_en: 'Squash Powdery Mildew (Podosphaera)',
        name_ta: 'பூசணி சாம்பல் நோய்',
        name_hi: 'कद्दू का चूर्णिल आसिता (पाउडरी मिल्ड्यू) रोग',
        is_healthy: false,
        pathogen: 'Podosphaera xanthii (Fungus)',
        explanation_en: 'Start spraying immediately upon finding a single lesion on the underside of older crown leaves. Spray both leaf surfaces.',
        explanation_ta: 'முதல் வெள்ளை புள்ளி தெரிந்த உடனேயே இலைகளின் இருபுறமும் நன்கு படும்படி தெளிக்கவும்.',
        explanation_hi: 'कद्दू का चूर्णिल आसिता (पाउडरी मिल्ड्यू) रोग',
        symptoms_en: [
            "White talcum-like powdery spots on both upper and lower leaf surfaces, petioles, and stems.",
            "Spots expand and coalesce into a continuous white felt, causing leaves to turn brown, dry, and shrivel.",
            "Premature defoliation exposes fruit to sunscald and reduces fruit brix (sugar content)."
          ],
        symptoms_ta: [
            "இலையின் இருபுறமும், இலைக்காம்பு மற்றும் தண்டுகளில் வெள்ளை மாவு போன்ற பூஞ்சை படலம் தோன்றும்.",
            "பூஞ்சை படலம் இலை முழுவதும் பரவி இலை காய்ந்து சருகாகும்.",
            "இலைகள் உதிர்வதால் காய்கள் வெயிலில் வெம்பி தரம் குறையும்."
          ],
        symptoms_hi: [
            "पत्तियों की दोनों सतहों और तनों पर सफेद पाउडर के धब्बे बनते हैं।",
            "पत्तियां सूखकर भूरी हो जाती हैं।",
            "फलों पर धूप लगने से गुणवत्ता घट जाती है।"
          ],
        causes: {
          primary_causes_en: [
            "Select powdery mildew-resistant squash and pumpkin hybrids.",
            "Maintain wide plant spacing (1.5-2.0 m between rows) to promote sunlight penetration and air movement.",
            "Avoid overhead sprinkler irrigation; use drip irrigation to keep canopy dry."
          ],
          primary_causes_ta: [
            "சாம்பல் நோய் எதிர்ப்புத் திறன் கொண்ட கலப்பின விதைகளைப் பயன்படுத்தவும்.",
            "போதிய இடைவெளி விட்டு நடவு செய்து நல்ல காற்றோட்டம் கிடைக்கச் செய்யவும்; சொட்டுநீர்ப் பாசனம் அமைக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm, dry daytime temperatures (22-30°C) with high relative humidity at night and dense shade under lush foliage.',
          weather_factors_ta: 'மிதமான வெப்பமான பகல் மற்றும் அதிக ஈரப்பதமான இரவு.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: Tamil Nadu Agricultural University (TNAU)',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: Tamil Nadu Agricultural University (TNAU)',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.5 kg / L per acre',
          rate_kg_per_acre: 1.5,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Podosphaera xanthii (Fungus)',
          approved_rate_per_acre: '200.0 grams per acre in 200 L water',
          rate_grams_per_acre: 200.0,
          water_litres_per_acre: 200,
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
        }
      }
    }
  },
  soybean: {
    crop_id: 'soybean',
    crop_name_en: 'Soybean',
    crop_name_ta: 'சோயாபீன்',
    crop_name_hi: 'सोयाबीन',
    scientific_name: 'Glycine max',
    soil_info: {
      suitable_soils_en: [
            "Fertile Loam",
            "Clay Loam",
            "Deep Black Cotton Soil"
          ],
      suitable_soils_ta: [
            "வண்டல் மண்",
            "கரிசல் மண்",
            "செம்மண்"
          ],
      suitable_soils_hi: [
            "उपजाऊ दोमट और गहरी काली मिट्टी"
          ],
      ph_range: '6.0 - 7.0',
      requirements_en: 'Soybean requires well-aerated, fertile loam with high moisture-holding capacity for nodulation.',
      requirements_ta: 'சோயாபீன்ஸ் வேர் முடிச்சுகள் உருவாக நல்ல காற்றோட்டமும் ஈரப்பதமும் உள்ள மண் தேவை.',
      requirements_hi: 'सोयाबीन के लिए अच्छी नमी धारण करने वाली उपजाऊ काली या दोमट मिट्टी चाहिए।',
      unsuitable_impact_en: 'Crusting and waterlogging inhibit seedling emergence and nodulation.',
      unsuitable_impact_ta: 'நிலம் இறுகி நீர் தேங்கினால் முளைப்புத்திறன் மற்றும் வேர் முடிச்சு பாதிக்கும்.',
      unsuitable_impact_hi: 'जलभराव से बीजों का अंकुरण और ग्रंथियों का निर्माण रुक जाता है।'
    },
    diseases: {
      soybean_healthy: {
        disease_id: 'soybean_healthy',
        name_en: 'Healthy Soybean Foliage',
        name_ta: 'ஆரோக்கியமான சோயாபீன் இலை',
        name_hi: 'स्वस्थ सोयाबीन की पत्ती',
        is_healthy: false,
        pathogen: 'None (Healthy Foliage)',
        explanation_en: 'Foliage is healthy. Ensure adequate soil moisture during pod filling stage.',
        explanation_ta: 'பயிர் ஆரோக்கியமாக உள்ளது. நெற்று பிடிக்கும் பருவத்தில் வறட்சி ஏற்படாமல் பார்த்துக் கொள்ளவும்.',
        explanation_hi: 'स्वस्थ सोयाबीन की पत्ती',
        symptoms_en: [
            "Trifoliate leaves displaying rich uniform green color with no yellow mosaic, rust, or bacterial pustules.",
            "Sturdy stems with abundant nodulation and prolific pod clusters."
          ],
        symptoms_ta: [
            "மஞ்சள் மொசைக் அல்லது துரு இல்லாத அடர்பச்சை இலைகள்.",
            "வேர்களில் பாக்டீரியா முடிச்சுகள் மற்றும் செழிப்பான நெற்றுக்கள் கொண்ட ஆரோக்கியமான பயிர்."
          ],
        symptoms_hi: [
            "स्वच्छ, हरी पत्तियां बिना किसी रोग के लक्षण।"
          ],
        causes: {
          primary_causes_en: [
            "Inoculate seed with Bradyrhizobium japonicum @ 5 g/kg seed before sowing.",
            "Maintain weed-free conditions during the first 45 days.",
            "Monitor weekly for stem fly, semilooper, and whitefly vectors."
          ],
          primary_causes_ta: [
            "விதை நேர்த்திக்கு ரைசோபியம் மற்றும் பாஸ்போபாக்டீரியா பயன்படுத்தவும்.",
            "முதல் 45 நாட்கள் களை இல்லாமல் பராமரிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm monsoon climate with well-aerated black or deep loamy soil.',
          weather_factors_ta: 'மிதமான வெப்பம் மற்றும் நல்ல வடிகால் வசதியுள்ள கரிசல் மண்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-IISR Indore',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-IISR Indore',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '0.0 kg / L per acre',
          rate_kg_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'None (Healthy Foliage)',
          approved_rate_per_acre: '0.0 grams per acre in 200 L water',
          rate_grams_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        }
      }
    }
  },
  blueberry: {
    crop_id: 'blueberry',
    crop_name_en: 'Blueberry',
    crop_name_ta: 'புளூபெர்ரி',
    crop_name_hi: 'ब्लूबेरी',
    scientific_name: 'Cyanococcus',
    soil_info: {
      suitable_soils_en: [
            "Acidic Sandy Peat",
            "Humus-rich Acidic Loam"
          ],
      suitable_soils_ta: [
            "அமிலத்தன்மை கொண்ட கரிசல் மண்",
            "இலை மட்கிய மண்"
          ],
      suitable_soils_hi: [
            "अम्लीय रेतीली मिट्टी"
          ],
      ph_range: '4.5 - 5.5 (Acidic)',
      requirements_en: 'Blueberries strictly require highly acidic, organic soils with excellent aeration.',
      requirements_ta: 'புளூபெர்ரி பயிருக்கு அதிக அமிலத்தன்மை (pH 4.5 - 5.5) கொண்ட மண் கட்டாயம் தேவை.',
      requirements_hi: 'ब्लूबेरी के लिए अधिक अम्लीय (pH 4.5-5.5) और कार्बनिक मिट्टी चाहिए।',
      unsuitable_impact_en: 'Soils with pH > 5.5 cause severe iron chlorosis and vine decline.',
      unsuitable_impact_ta: 'pH 5.5 க்கு மேல் இருந்தால் இரும்பு சத்துக் குறைபாடு ஏற்பட்டு இலைகள் வெளுக்கும்.',
      unsuitable_impact_hi: 'अधिक pH पर लोहे की भारी कमी से पौधे सूख जाते हैं।'
    },
    diseases: {
      blueberry_healthy: {
        disease_id: 'blueberry_healthy',
        name_en: 'Healthy Blueberry Foliage',
        name_ta: 'ஆரோக்கியமான புளூபெர்ரி இலை',
        name_hi: 'स्वस्थ ब्लूबेरी की पत्ती',
        is_healthy: false,
        pathogen: 'None (Healthy Foliage)',
        explanation_en: 'Foliage is healthy. Ensure soil pH remains below 5.2 to avoid micronutrient lockout.',
        explanation_ta: 'பயிர் ஆரோக்கியமாக உள்ளது. மண் pH 5.2-க்கு கீழ் இருப்பதை உறுதி செய்யவும்.',
        explanation_hi: 'स्वस्थ ब्लूबेरी की पत्ती',
        symptoms_en: [
            "Glossy, ovate deep-green foliage without red flecking or marginal scorch.",
            "Vigorous canes with abundant flower clusters and berry set."
          ],
        symptoms_ta: [
            "பளபளப்பான அடர்பச்சை இலைகள், கருகல் அல்லது புள்ளிகள் இல்லை.",
            "ஆரோக்கியமான கிளைகள் மற்றும் செழிப்பான பழக் கொத்துக்கள்."
          ],
        symptoms_hi: [
            "चमकदार हरी पत्तियां और स्वस्थ पौधा।"
          ],
        causes: {
          primary_causes_en: [
            "Test soil pH annually; apply elemental sulfur if pH rises above 5.3 to prevent iron chlorosis.",
            "Mulch heavily with pine bark or sawdust (7-10 cm deep) to retain moisture and suppress weeds.",
            "Maintain drip irrigation with low-salinity water."
          ],
          primary_causes_ta: [
            "மண் அமிலத்தன்மையை (pH 4.5-5.2) ஆண்டுதோறும் பரிசோதிக்கவும்.",
            "மரத்தூள் அல்லது மரப்பட்டை கொண்டு நிலப்போர்வை அமைக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Acidic soils with pH 4.5 to 5.2 rich in organic matter (peat moss/pine bark) and uniform drip moisture.',
          weather_factors_ta: 'அமிலத்தன்மை கொண்ட மண் (pH 4.5 - 5.2) மற்றும் சீரான ஈரப்பதம்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-NRC Orchids & Temperate Berries',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-NRC Orchids & Temperate Berries',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '0.0 kg / L per acre',
          rate_kg_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'None (Healthy Foliage)',
          approved_rate_per_acre: '0.0 grams per acre in 200 L water',
          rate_grams_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        }
      }
    }
  },
  raspberry: {
    crop_id: 'raspberry',
    crop_name_en: 'Raspberry',
    crop_name_ta: 'ராஸ்பெர்ரி',
    crop_name_hi: 'रसभरी',
    scientific_name: 'Rubus idaeus',
    soil_info: {
      suitable_soils_en: [
            "Well-drained Sandy Loam",
            "Humus-rich Loam"
          ],
      suitable_soils_ta: [
            "வடிகால் உள்ள மணற்பாங்கான செம்மண்"
          ],
      suitable_soils_hi: [
            "जल निकासी वाली बलुई दोमट"
          ],
      ph_range: '6.0 - 6.5',
      requirements_en: 'Raspberries require fertile, friable soil with rapid drainage to protect roots from waterlogging.',
      requirements_ta: 'ராஸ்பெர்ரி வேர்கள் அழுகாமல் இருக்க விரைவான வடிகால் வசதி தேவை.',
      requirements_hi: 'रास्पबेरी के लिए जड़ों में पानी न ठहरने वाली भुरभुरी मिट्टी चाहिए।',
      unsuitable_impact_en: 'Poor drainage triggers severe Phytophthora root rot.',
      unsuitable_impact_ta: 'நீர் தேங்கினால் பைட்டோபthorா வேரழுகல் தாக்கும்.',
      unsuitable_impact_hi: 'जलभराव से जड़ गलन रोग होता है।'
    },
    diseases: {
      raspberry_healthy: {
        disease_id: 'raspberry_healthy',
        name_en: 'Healthy Raspberry Foliage',
        name_ta: 'ஆரோக்கியமான ராஸ்பெர்ரி இலை',
        name_hi: 'स्वस्थ रसभरी की पत्ती',
        is_healthy: false,
        pathogen: 'None (Healthy Foliage)',
        explanation_en: 'Canopy is healthy. Ensure post-harvest sanitation to protect next season primocanes.',
        explanation_ta: 'தோட்டம் ஆரோக்கியமாக உள்ளது. வழக்கமான பராமரிப்பை தொடரவும்.',
        explanation_hi: 'स्वस्थ रसभरी की पत्ती',
        symptoms_en: [
            "Compound pinnate leaves with bright green color and no rust, cane blight, or mosaic mottling.",
            "Erect, vigorous primocanes with healthy lateral fruiting branches."
          ],
        symptoms_ta: [
            "கருகல் அல்லது புள்ளிகள் இல்லாத ஆரோக்கியமான இலைகள் மற்றும் செழிப்பான கிளைகள்."
          ],
        symptoms_hi: [
            "स्वच्छ और स्वस्थ पत्तियां।"
          ],
        causes: {
          primary_causes_en: [
            "Prune floricanes immediately after fruiting to improve airflow.",
            "Maintain organic mulching and drip irrigation.",
            "Scout for cane borers."
          ],
          primary_causes_ta: [
            "காய் பிடித்து முடிந்த பழைய கிளைகளை வெட்டி அகற்றவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Cool temperate climate, well-drained fertile loam rich in organic matter, and trellis support.',
          weather_factors_ta: 'மிதமான குளிர் மற்றும் நல்ல வடிகால் வசதி.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-CITH Srinagar',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-CITH Srinagar',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '0.0 kg / L per acre',
          rate_kg_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'None (Healthy Foliage)',
          approved_rate_per_acre: '0.0 grams per acre in 200 L water',
          rate_grams_per_acre: 0.0,
          water_litres_per_acre: 0,
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
        }
      }
    }
  },
  cotton: {
    crop_id: 'cotton',
    crop_name_en: 'Cotton',
    crop_name_ta: 'பருத்தி',
    crop_name_hi: 'कपास',
    scientific_name: 'Gossypium hirsutum',
    soil_info: {
      suitable_soils_en: [
            "Deep Black Cotton Soil (Vertisol)",
            "Well-drained Fertile Red Loam"
          ],
      suitable_soils_ta: [
            "ஆழமான கரிசல் மண்",
            "நல்ல வடிகால் வசதியுள்ள செம்மண்"
          ],
      suitable_soils_hi: [
            "गहरी काली मिट्टी (कपास की मिट्टी)",
            "उपजाऊ लाल दोमट"
          ],
      ph_range: '6.5 - 8.0',
      requirements_en: 'Cotton develops a deep taproot and requires deep, moisture-retentive soils with warm soil temperatures.',
      requirements_ta: 'பருத்தி ஆணிவேர் கொண்டது; ஆழமான, ஈரப்பதத்தைத் தக்கவைக்கும் கரிசல் மண் மிக சிறந்தது.',
      requirements_hi: 'कपास के लिए गहरी नमी रोकने वाली काली मिट्टी सर्वोत्तम होती है।',
      unsuitable_impact_en: 'Waterlogged soils cause square dropping and severe root asphyxiation.',
      unsuitable_impact_ta: 'நீர் தேங்கினால் பூ மற்றும் சப்பைகள் உதிர்ந்து மகசூல் குறையும்.',
      unsuitable_impact_hi: 'जलभराव से कलियां और फूल गिर जाते हैं।'
    },
    diseases: {
      cotton_bacterial_blight: {
        disease_id: 'cotton_bacterial_blight',
        name_en: 'Cotton Bacterial Blight (Angular Leaf Spot)',
        name_ta: 'பருத்தி பாக்டீரியா இலைக்கருகல் / கோண இலைப்புள்ளி நோய்',
        name_hi: 'कपास का जीवाणु झुलसा रोग',
        is_healthy: false,
        pathogen: 'Xanthomonas citri pv. malvacearum (Bacterium)',
        explanation_en: 'If black arm stem lesions appear, avoid high-speed tractor inter-cultivation that can mechanically fracture infected stems.',
        explanation_ta: 'தண்டுகளில் கருப்பு காயம் இருந்தால் கிளைகள் முறியாமல் கவனமாக கையாளுங்கள்.',
        explanation_hi: 'कपास का जीवाणु झुलसा रोग',
        symptoms_en: [
            "Angular water-soaked spots bounded by leaf veinlets on foliage.",
            "Spots turn dark reddish-brown to black and lesions spread along main veins (vein blight).",
            "Black arm symptoms on stems causing branches to snap; dark water-soaked round lesions on bolls."
          ],
        symptoms_ta: [
            "இலை நரம்புகளுக்கு இடையே நீர் ஊறிய கோண வடிவ புள்ளிகள் தோன்றும்.",
            "புள்ளிகள் கரும்பழுப்பு நிறமாக மாறி நரம்புகளின் வழியே பரவும் (நரம்பு கருகல்).",
            "தண்டுகளில் கருப்பு காயம் (Black arm) ஏற்பட்டு கிளைகள் முறியும்; காய்களில் அழுகல் ஏற்படும்."
          ],
        symptoms_hi: [
            "पत्तियों की नसों के बीच कोणीय जलसिक्त धब्बे बनते हैं।",
            "टहनियों पर काले घाव (ब्लैक आर्म) बनते हैं और गूलर सड़ जाते हैं।"
          ],
        causes: {
          primary_causes_en: [
            "Acid delinting of cotton seed with commercial sulfuric acid (100 ml/kg seed) destroys seed-borne bacteria.",
            "Treat delinted seed with Streptocycline @ 1 g/litre or Carboxin.",
            "Burn infected crop residue after picking."
          ],
          primary_causes_ta: [
            "அமில விதை நேர்த்தி செய்யப்பட்ட சான்றளிக்கப்பட்ட விதைகளைப் பயன்படுத்தவும்.",
            "அறுவடைக்கு பின் முந்தைய பயிர்க் கழிவுகளை எரிக்கவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm temperatures (30-35°C), high humidity (>85%), wind-driven rain, and cloudy weather.',
          weather_factors_ta: 'அதிக வெப்பநிலை (30-35°C) மற்றும் காற்றுடன் கூடிய மழை.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-CICR & TNAU',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-CICR & TNAU',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.0 kg / L per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Xanthomonas citri pv. malvacearum (Bacterium)',
          approved_rate_per_acre: '520.0 grams per acre in 200 L water',
          rate_grams_per_acre: 520.0,
          water_litres_per_acre: 200,
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
        }
      }
    }
  },
  groundnut: {
    crop_id: 'groundnut',
    crop_name_en: 'Groundnut',
    crop_name_ta: 'வேர்க்கடலை / நிலக்கடலை',
    crop_name_hi: 'मूंगफली',
    scientific_name: 'Arachis hypogaea',
    soil_info: {
      suitable_soils_en: [
            "Well-drained Sandy Loam",
            "Red Sandy Soil with Good Calcium Content"
          ],
      suitable_soils_ta: [
            "வடிகால் உள்ள மணற்பாங்கான செம்மண்",
            "சுண்ணாம்புச் சத்து நிறைந்த மணல் நிலம்"
          ],
      suitable_soils_hi: [
            "भुरभुरी बलुई दोमट",
            "कैल्शियम युक्त हल्की मिट्टी"
          ],
      ph_range: '6.0 - 7.0',
      requirements_en: 'Groundnut requires loose, friable topsoil to facilitate effortless peg penetration and pod development.',
      requirements_ta: 'நிலக்கடலையில் விழுதுகள் எளிதில் மண்ணுக்குள் இறங்கி காய் பிடிக்க தளர்வான மணற்பாங்கான நிலம் மிக அவசியம்.',
      requirements_hi: 'मूंगफली की सुइयां (पेग) आसानी से मिट्टी में धंस सकें, इसके लिए भुरभुरी मिट्टी चाहिए।',
      unsuitable_impact_en: 'Hard crusting clay prevents pegging and results in empty pods (pops).',
      unsuitable_impact_ta: 'கடின களிமண்ணில் விழுதுகள் இறங்க முடியாமல் சொத்தை அல்லது பதர் காய்கள் உருவாகும்.',
      unsuitable_impact_hi: 'कठोर मिट्टी में फलियां नहीं बन पातीं और पोच रह जाती हैं।'
    },
    diseases: {
      groundnut_tikka: {
        disease_id: 'groundnut_tikka',
        name_en: 'Groundnut Tikka Leaf Spot',
        name_ta: 'நிலக்கடலை டிக்கா இலைப்புள்ளி நோய்',
        name_hi: 'मूंगफली का टिक्का रोग',
        is_healthy: false,
        pathogen: 'Cercospora arachidicola (Early) & Phaeoisariopsis personata (Late) (Fungi)',
        explanation_en: 'Start spraying when lower leaves show first spotting around 35-40 days after sowing. Protect leaves to ensure pod filling.',
        explanation_ta: 'விதைத்த 35-40 நாட்களில் கீழ் இலைகளில் புள்ளிகள் தோன்றிய உடனே முதல் தெளிப்பை மேற்கொள்ளவும்.',
        explanation_hi: 'मूंगफली का टिक्का रोग',
        symptoms_en: [
            "Early leaf spot: circular reddish-brown spots with prominent bright yellow halo on upper leaf surface.",
            "Late leaf spot: smaller, nearly circular, dark brown to black spots with negligible yellow halo.",
            "Severe infection causes extensive premature defoliation, leaving bare stems and reducing pod yield by up to 50%."
          ],
        symptoms_ta: [
            "இலைகளில் வட்ட வடிவ பழுப்பு நிற புள்ளிகள் சுற்றிலும் மஞ்சள் வளையத்துடன் தோன்றும் (டிக்கா நோய்).",
            "தீவிர பாதிப்பில் இலைகள் முழுவதும் காய்ந்து உதிர்ந்து செடிகள் குச்சி போல் நிற்கும்; காய்களின் எடை குறையும்."
          ],
        symptoms_hi: [
            "पत्तियों पर पीले घेरे वाले गोल गहरे भूरे धब्बे बनते हैं।",
            "पत्तियां तेजी से सूखकर गिर जाती हैं जिससे पैदावार आधी रह जाती है।"
          ],
        causes: {
          primary_causes_en: [
            "Treat seeds with Trichoderma viride @ 4 g/kg or Mancozeb @ 2 g/kg seed before sowing.",
            "Rotate groundnut with non-leguminous crops like sorghum or pearl millet.",
            "Practice deep summer plowing to bury infected debris."
          ],
          primary_causes_ta: [
            "விதை நேர்த்திக்கு டிரைக்கோடெர்மா 4 கிராம்/கிலோ அல்லது மேன்கோசெப் 2 கிராம்/கிலோ பயன்படுத்தவும்.",
            "சோளம் அல்லது கம்பு பயிருடன் பயிர் சுழற்சி செய்யவும்."
          ],
          primary_causes_hi: [
            "हवा और बारिश के पानी से फैलने वाले जीवाणु व फफूंद के बीजाणु"
          ],
          weather_factors_en: 'Warm, humid weather (25-30°C) with prolonged relative humidity (>80%) and persistent dew.',
          weather_factors_ta: 'மிதமான வெப்பம் (25-30°C) மற்றும் அதிக காற்றில் ஈரப்பதம்.',
          weather_factors_hi: 'अनुकूल आर्द्र मौसम और पत्तियों पर नमी।',
          disclaimer_en: 'Field diagnosis based on verified visual symptoms. Source: ICAR-DGR & TNAU Agritech',
          disclaimer_ta: 'அங்கீகரிக்கப்பட்ட கள ஆய்வு மற்றும் பரிந்துரைகள். ஆதாரம்: ICAR-DGR & TNAU Agritech',
          disclaimer_hi: 'प्रमाणित कृषि दिशानिर्देशों पर आधारित उपचार।'
        },
        organic: {
          name_en: 'Neem Oil 10,000 ppm / Bio-formulation',
          name_ta: 'வேப்பெண்ணெய் கரைசல் 10000 ppm / உயிர் உரங்கள்',
          name_hi: 'नीम तेल घोल / जैव कवकनाशी',
          ingredients_en: 'Neem seed kernel extract / Trichoderma viride',
          ingredients_ta: 'வேப்பங்கொட்டை சாறு அல்லது டிரைக்கோடெர்மா விரிடி',
          ingredients_hi: 'नीम का तेल या ट्राइकोडर्मा विरिडी',
          rate_per_acre: '1.0 kg / L per acre',
          rate_kg_per_acre: 1.0,
          water_litres_per_acre: 200,
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
        },
        chemical: {
          product_name_en: 'Mancozeb 75% WP / Approved Fungicide',
          product_name_ta: 'மேன்கோசெப் 75% WP / பரிந்துரைக்கப்பட்ட மருந்து',
          product_name_hi: 'मैनकोजेब 75% WP / अनुमोदित दवा',
          active_ingredient: 'Cercospora arachidicola (Early) & Phaeoisariopsis personata (Late) (Fungi)',
          approved_rate_per_acre: '400.0 grams per acre in 200 L water',
          rate_grams_per_acre: 400.0,
          water_litres_per_acre: 200,
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
        }
      }
    }
  }
};

/**
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
  const diseaseDetail = normalizedDisease
    ? cropMeta.diseases[normalizedDisease]
    : undefined;

  if (!diseaseDetail || diseaseDetail.disease_id !== normalizedDisease) return null;

  return {
    crop_meta: cropMeta,
    disease_detail: diseaseDetail,
    soil_info: cropMeta.soil_info,
    causes: diseaseDetail.causes,
    organic: diseaseDetail.organic,
    chemical: diseaseDetail.chemical,
  };
}

export function calculateTreatmentDosage(
  areaValue: number,
  areaUnit: 'acres' | 'hectares' | 'sqm',
  rateKgPerAcre: number,
  chemicalGramsPerAcre: number,
  waterPerAcre: number = 200
): {
  areaInAcres: number;
  organicQuantityFormatted: string;
  chemicalQuantityFormatted: string;
  waterQuantityFormatted: string;
  waterLitres: number;
} {
  const safeArea = Math.max(0.01, isNaN(areaValue) || areaValue <= 0 ? 1 : areaValue);

  let areaInAcres = safeArea;
  if (areaUnit === 'hectares') {
    areaInAcres = safeArea * 2.47105;
  } else if (areaUnit === 'sqm') {
    areaInAcres = safeArea / 4046.86;
  }

  // Organic calculation
  const totalOrganicKg = rateKgPerAcre * areaInAcres;
  let organicFormatted = '';
  if (totalOrganicKg < 1) {
    organicFormatted = `${Math.round(totalOrganicKg * 1000)} grams`;
  } else {
    organicFormatted = `${totalOrganicKg.toFixed(2)} kg`;
  }

  // Chemical calculation
  const totalChemGrams = chemicalGramsPerAcre * areaInAcres;
  let chemFormatted = '';
  if (chemicalGramsPerAcre <= 0) {
    chemFormatted = '0 g (None required)';
  } else if (totalChemGrams < 1000) {
    chemFormatted = `${Math.round(totalChemGrams)} grams`;
  } else {
    chemFormatted = `${(totalChemGrams / 1000).toFixed(2)} kg`;
  }

  // Water calculation (baseline 200 L per acre)
  const totalWaterL = Math.max(10, Math.round(waterPerAcre * areaInAcres));
  const waterFormatted = `${totalWaterL} Litres`;

  return {
    areaInAcres: Number(areaInAcres.toFixed(2)),
    organicQuantityFormatted: organicFormatted,
    chemicalQuantityFormatted: chemFormatted,
    waterQuantityFormatted: waterFormatted,
    waterLitres: totalWaterL,
  };
}
