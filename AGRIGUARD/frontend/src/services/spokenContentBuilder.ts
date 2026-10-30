import { DiseaseDetectionResult, Language, SoilRequirements, DiseaseCauses } from '../types';
import { calculateTreatmentDosage } from './diseaseKnowledge';

export interface SpokenFertilizerData {
  crop_info?: {
    name_en?: string;
    name_ta?: string;
    name_hi?: string;
    growth_stage?: string;
    growth_stage_ta?: string;
    growth_stage_hi?: string;
    soil_type?: string;
    land_area?: string | number;
    land_unit?: string;
    fertilizer_budget_inr?: number;
    [key: string]: any;
  };
  crop_name_en?: string;
  crop_name_ta?: string;
  crop_name_hi?: string;
  growth_stage?: string;
  nutrient_deficiency?: string;
  nutrient_deficiency_ta?: string;
  nutrient_deficiency_hi?: string;
  active_plan_items?: Array<{
    fertilizer_name_en?: string;
    fertilizer_name_ta?: string;
    fertilizer_name_hi?: string;
    name_en?: string;
    name_ta?: string;
    name_hi?: string;
    quantity?: string;
    quantity_kg?: number;
    quantity_tonnes?: number;
    unit?: string;
    purpose_en?: string;
    purpose_ta?: string;
    purpose_hi?: string;
    timing_en?: string;
    timing_ta?: string;
    timing_hi?: string;
    application_method_en?: string;
    application_method_ta?: string;
    [key: string]: any;
  }>;
  cost_analysis?: {
    estimated_total_cost_inr?: number;
    budget_inr?: number;
    is_within_budget?: boolean;
    comparison_en?: string;
    comparison_ta?: string;
    comparison_hi?: string;
    budget_alternatives_en?: string[];
    budget_alternatives_ta?: string[];
  };
  schedule?: Array<{
    stage_en?: string;
    stage_ta?: string;
    chemical_action_en?: string;
    chemical_action_ta?: string;
    organic_action_en?: string;
    organic_action_ta?: string;
  }>;
  precautions_en?: string[];
  precautions_ta?: string[];
  precautions_hi?: string[];
  spoken_text_en?: string;
  spoken_text_ta?: string;
  spoken_text_hi?: string;
  [key: string]: any;
}

// Crop Name translations
const CROP_MAP: Record<string, { ta: string; hi: string }> = {
  rice: { ta: 'நெல்', hi: 'धान' },
  paddy: { ta: 'நெல்', hi: 'धान' },
  'rice / paddy': { ta: 'நெல்', hi: 'धान' },
  wheat: { ta: 'கோதுமை', hi: 'गेहूं' },
  tomato: { ta: 'தக்காளி', hi: 'टमाटर' },
  cotton: { ta: 'பருத்தி', hi: 'कपास' },
  maize: { ta: 'மக்காச்சோளம்', hi: 'मक्का' },
  corn: { ta: 'மக்காச்சோளம்', hi: 'मक्का' },
  'corn_(maize)': { ta: 'மக்காச்சோளம்', hi: 'मक्का' },
  'corn / maize': { ta: 'மக்காச்சோளம்', hi: 'मक्का' },
  'maize / corn': { ta: 'மக்காச்சோளம்', hi: 'मक्का' },
  apple: { ta: 'ஆப்பிள்', hi: 'सेब' },
  grape: { ta: 'திராட்சை', hi: 'अंगूर' },
  orange: { ta: 'ஆரஞ்சு', hi: 'संतरा' },
  peach: { ta: 'பீச் பழம்', hi: 'आड़ू' },
  cherry: { ta: 'செர்ரி பழம்', hi: 'चेरी' },
  strawberry: { ta: 'ஸ்ட்ராபெர்ரி', hi: 'स्ट्रॉबेरी' },
  squash: { ta: 'பூசணி', hi: 'कद्दू' },
  soybean: { ta: 'சோயாபீன்', hi: 'सोयाबीन' },
  blueberry: { ta: 'புளூபெர்ரி', hi: 'ब्लूबेरी' },
  raspberry: { ta: 'ராஸ்பெர்ரி', hi: 'रास्पबेरी' },
  sugarcane: { ta: 'கரும்பு', hi: 'गन्ना' },
  banana: { ta: 'வாழை', hi: 'केला' },
  potato: { ta: 'உருளைக்கிழங்கு', hi: 'आलू' },
  onion: { ta: 'வெங்காயம்', hi: 'प्याज' },
  groundnut: { ta: 'நிலக்கடலை', hi: 'मूंगफली' },
  peanut: { ta: 'நிலக்கடலை', hi: 'मूंगफली' },
  chilli: { ta: 'மிளகாய்', hi: 'मिर्च' },
  chili: { ta: 'மிளகாய்', hi: 'मिर्च' },
  pepper: { ta: 'குடைமிளகாய்', hi: 'शिमला मिर्च' },
  pepper_bell: { ta: 'குடைமிளகாய்', hi: 'शिमला मिर्च' },
  'pepper,_bell': { ta: 'குடைமிளகாய்', hi: 'शिमला मिर्च' },
  gram: { ta: 'கொண்டைக்கடலை', hi: 'चना' },
  chickpea: { ta: 'கொண்டைக்கடலை', hi: 'चना' },
  mustard: { ta: 'கடுகு', hi: 'सरसों' }
};

// Growth Stage translations
const STAGE_MAP: Record<string, { ta: string; hi: string }> = {
  seedling: { ta: 'நாற்றுப் பருவம்', hi: 'अंकुरण / रोपाई अवस्था' },
  germination: { ta: 'முளைப்புப் பருவம்', hi: 'अंकुरण अवस्था' },
  vegetative: { ta: 'தழை வளர்ச்சிப் பருவம்', hi: 'वानस्पतिक वृद्धि अवस्था' },
  'vegetative growth': { ta: 'தழை வளர்ச்சிப் பருவம்', hi: 'वानस्पतिक वृद्धि अवस्था' },
  flowering: { ta: 'பூக்கும் பருவம்', hi: 'फूल आने की अवस्था' },
  fruiting: { ta: 'காய் பிடிக்கும் பருவம்', hi: 'फल विकास अवस्था' },
  'fruiting / maturity': { ta: 'காய் பிடிக்கும் மற்றும் முதிர்ச்சிப் பருவம்', hi: 'फल विकास और परिपक्वता अवस्था' },
  maturity: { ta: 'முதிர்ச்சிப் பருவம்', hi: 'परिपक्वता अवस्था' }
};

// Land units
const UNIT_MAP: Record<string, { ta: string; hi: string }> = {
  acres: { ta: 'ஏக்கர்', hi: 'एकड़' },
  acre: { ta: 'ஏக்கர்', hi: 'एकड़' },
  hectares: { ta: 'ஹெக்டேர்', hi: 'हेक्टेयर' },
  hectare: { ta: 'ஹெக்டேர்', hi: 'हेक्टेयर' },
  cents: { ta: 'சென்ட்', hi: 'सेंट' },
  cent: { ta: 'சென்ட்', hi: 'सेंट' },
  gunthas: { ta: 'குந்தா', hi: 'गुंठा' },
  guntha: { ta: 'குந்தா', hi: 'गुंठा' },
  bighas: { ta: 'பிகா', hi: 'बीघा' },
  bigha: { ta: 'பிகா', hi: 'बीघा' },
  sqm: { ta: 'சதுர மீட்டர்', hi: 'वर्ग मीटर' },
  'square meters': { ta: 'சதுர மீட்டர்', hi: 'वर्ग मीटर' }
};

// Common fertilizer phonetics in Tamil
export function cleanTamilSpokenText(raw: string): string {
  let text = raw;

  const replacements: Array<[RegExp, string]> = [
    [/\bAcres?\b/gi, 'ஏக்கர்'],
    [/\bHectares?\b/gi, 'ஹெக்டேர்'],
    [/\bCents?\b/gi, 'சென்ட்'],
    [/\bSquare meters?\b/gi, 'சதுர மீட்டர்'],
    [/\bSeedling\b/gi, 'நாற்றுப் பருவம்'],
    [/\bGermination\b/gi, 'முளைப்புப் பருவம்'],
    [/\bVegetative growth\b/gi, 'தழை வளர்ச்சிப் பருவம்'],
    [/\bVegetative\b/gi, 'தழை வளர்ச்சிப் பருவம்'],
    [/\bFlowering\b/gi, 'பூக்கும் பருவம்'],
    [/\bFruiting \/ Maturity\b/gi, 'காய் பிடிக்கும் பருவம்'],
    [/\bFruiting\b/gi, 'காய் பிடிக்கும் பருவம்'],
    [/\bMaturity\b/gi, 'முதிர்ச்சிப் பருவம்'],
    [/\bNeem Coated Urea\b/gi, 'வேப்பம் பூசிய யூரியா'],
    [/\bSingle Super Phosphate\b/gi, 'சிங்கிள் சூப்பர் பாஸ்பேட்'],
    [/\bMuriate of Potash\b/gi, 'பொட்டாஷ்'],
    [/\bUrea\b/gi, 'யூரியா'],
    [/\bPotash\b/gi, 'பொட்டாஷ்'],
    [/\bMOP\b/gi, 'பொட்டாஷ்'],
    [/\bSSP\b/gi, 'சூப்பர் பாஸ்பேட்'],
    [/\bFYM\b/gi, 'தொழு உரம்'],
    [/\bFarmyard Manure\b/gi, 'தொழு உரம்'],
    [/\bCompost\b/gi, 'மக்கிய தொழு உரம்'],
    [/\bVermicompost\b/gi, 'மண்புழு உரம்'],
    [/\bNeem Cake\b/gi, 'வேப்பம் பிண்ணாக்கு'],
    [/\bBio-?fertilizers?\b/gi, 'உயிர் உரம்'],
    [/\bRupees?\b/gi, 'ரூபாய்'],
    [/\bTonnes?\b/gi, 'டன்'],
    [/\bTons?\b/gi, 'டன்'],
    [/\bKg\b/gi, 'கிலோ'],
    [/\bDAP\b/gi, 'டிஏபி'],
    [/\bEarly Blight\b/gi, 'ஆரம்பக்கால இலைக் கருகல் நோய்'],
    [/\bLate Blight\b/gi, 'பிற்பருவ இலைக் கருகல் நோய்'],
    [/\bLeaf Mold\b/gi, 'இலை பூஞ்சை நோய்'],
    [/\bSeptoria\b/gi, 'செப்டோரியா இலைப்புள்ளி நோய்'],
    [/\bBacterial Spot\b/gi, 'பாக்டீரியா இலைப்புள்ளி நோய்'],
    [/\bHealthy Foliage\b/gi, 'ஆரோக்கியமான பயிர்'],
    [/\bHealthy\b/gi, 'ஆரோக்கியம்'],
    [/\bTomato\b/gi, 'தக்காளி'],
    [/\bRice\b/gi, 'நெல்'],
    [/\bPaddy\b/gi, 'நெல்'],
    [/\bPotato\b/gi, 'உருளைக்கிழங்கு'],
    [/\bCotton\b/gi, 'பருத்தி'],
    [/\bChilli\b/gi, 'மிளகாய்'],
    [/\bMaize\b/gi, 'மக்காச்சோளம்'],
    [/\bCorn\b/gi, 'மக்காச்சோளம்']
  ];

  for (const [pattern, rep] of replacements) {
    text = text.replace(pattern, rep);
  }

  // Format currency symbol ₹
  text = text.replace(/₹\s*([0-9,]+)/g, '$1 ரூபாய்');
  // Clean double spaces or orphaned punctuation
  text = text.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1');

  return text.trim();
}

/**
 * Builds comprehensive, highly structured spoken text for Plant Disease Prediction
 * Guaranteed to translate:
 * 1. Plant name
 * 2. Predicted disease name (with English technical name preserved for clarity)
 * 3. Disease symptoms
 * 4. Possible causes
 * 5. Prevention methods
 * 6. Organic treatment recommendations with exact calculated dosage for user's land area
 * 7. Chemical treatment recommendations with active ingredient and pre-harvest interval
 * 8. Safety precautions
 */
export function buildDiseaseSpokenText(
  result: DiseaseDetectionResult,
  lang: Language,
  options: {
    farmSize: number;
    farmSizeUnit: 'acres' | 'hectares' | 'sqm';
    treatmentPreference: 'organic' | 'chemical';
  }
): string {
  const isTa = lang === 'ta';
  const isHi = lang === 'hi';

  const { farmSize, farmSizeUnit, treatmentPreference } = options;
  const organicPlan = result.organic_treatment;
  const chemicalPlan = result.chemical_treatment;

  const dosage = calculateTreatmentDosage(
    farmSize,
    farmSizeUnit,
    organicPlan?.rate_kg_per_acre ?? 1.0,
    chemicalPlan?.rate_grams_per_acre ?? 400,
    organicPlan?.water_litres_per_acre ?? 200
  );

  const unitLabelTa =
    farmSizeUnit === 'acres' ? 'ஏக்கர்' : farmSizeUnit === 'hectares' ? 'ஹெக்டேர்' : 'சதுர மீட்டர்';
  const unitLabelHi =
    farmSizeUnit === 'acres' ? 'एकड़' : farmSizeUnit === 'hectares' ? 'हेक्टेयर' : 'वर्ग मीटर';

  // Handle uncertain or out-of-distribution leaf images cleanly without false diagnosis
  if (result.is_out_of_distribution || result.is_uncertain) {
    if (isTa) {
      return cleanTamilSpokenText(
        result.explanation_ta ||
          "கவனிக்கவும்: பதிவேற்றப்பட்ட இலை படத்தை தற்போதைய மாதிரியால் திட்டவட்டமாக வகைப்படுத்த முடியவில்லை. இது ஆதரிக்கப்படாத தாவர வகையாக இருக்கலாம் அல்லது படம் தெளிவின்றி இருக்கலாம். தெளிவான படத்தை பதிவேற்றவும் அல்லது உள்ளூர் வேளாண்மை அலுவலரை அணுகவும்."
      );
    }
    if (isHi) {
      return (
        result.explanation_hi ||
        "सूचना: अपलोड की गई पत्ती की तस्वीर को वर्तमान मॉडल द्वारा विश्वसनीय रूप से वर्गीकृत नहीं किया जा सकता है। कृपया स्पष्ट तस्वीर लें या स्थानीय कृषि विशेषज्ञ से परामर्श करें।"
      );
    }
    return (
      result.explanation_en ||
      "Notice: The uploaded leaf image cannot be reliably classified using the current model. It may belong to an unsupported plant species or have insufficient clarity. Please upload a clear photo taken in natural light or consult a local agricultural extension officer."
    );
  }

  if (isTa) {
    const cropTa = result.crop_name_ta || 'பயிர்';
    const conditionTa = result.condition_title_ta || (result.is_healthy ? 'ஆரோக்கியமான இலை' : 'நோய் பாதிப்பு');
    const conditionEn = result.condition_title_en || '';

    // 1. Plant & Condition Greeting
    const greeting = `${cropTa} பயிர்க்கான இலை நோய் ஆய்வு முடிவுகள்.`;
    const diagnosis = result.is_healthy
      ? `உங்கள் ${cropTa} பயிர் ஆரோக்கியமாக உள்ளது. இலைகளில் எவ்வித பூஞ்சை அல்லது பாக்டீரியா நோய் அறிகுறிகளும் இல்லை.`
      : `கண்டறியப்பட்ட நோய்: ${conditionTa}${conditionEn ? ` (${conditionEn})` : ''}. கணிப்பு துல்லியம் ${result.confidence_percentage || Math.round((result.confidence_score || 0.85) * 100)} சதவீதம்.`;

    // 2. Symptoms
    let symptomsText = '';
    const symptoms = result.common_symptoms_ta || [];
    if (!result.is_healthy && symptoms.length > 0) {
      symptomsText = `முக்கிய அறிகுறிகள்: ${symptoms.slice(0, 3).join('. ')}.`;
    }

    // 3. Causes
    let causesText = '';
    if (!result.is_healthy && result.causes_info?.primary_causes_ta?.length) {
      causesText = `சாத்தியமான காரணங்கள்: ${result.causes_info.primary_causes_ta.slice(0, 2).join(', ')}.`;
    }

    // 4. Prevention
    let preventionText = '';
    if (result.prevention_guidance_ta && result.prevention_guidance_ta.length > 0) {
      preventionText = `தடுப்பு முறைகள்: ${result.prevention_guidance_ta.slice(0, 2).join('. ')}.`;
    }

    // 5. Treatment Plan
    let treatmentText = '';
    if (result.is_healthy) {
      treatmentText = 'பரிந்துரை: இரசாயன மருந்து எதுவும் தேவையில்லை. வழக்கமான பாசனம் மற்றும் சீரான சத்து மேலாண்மையைத் தொடரவும்.';
    } else if (treatmentPreference === 'organic' && organicPlan) {
      const orgName = organicPlan.name_ta || organicPlan.name_en;
      const orgMethod = organicPlan.method_ta || 'மாலை வேளையில் இலைகளின் இருபுறமும் நன்கு படும்படி தெளிக்கவும்';
      const orgFreq = organicPlan.frequency_ta || '10 முதல் 12 நாட்கள் இடைவெளியில் தெளிக்கவும்';
      treatmentText = `பரிந்துரைக்கப்படும் இயற்கை தீர்வு: ${orgName}. உங்கள் ${farmSize} ${unitLabelTa} நிலத்திற்கு தேவையான அளவு ${dosage.organicQuantityFormatted}, ${dosage.waterQuantityFormatted} தண்ணீரில் கலக்க வேண்டும். ${orgMethod}. ${orgFreq}.`;
    } else if (chemicalPlan) {
      const chemName = chemicalPlan.product_name_ta || chemicalPlan.product_name_en;
      const chemIngredient = chemicalPlan.active_ingredient;
      const chemMethod = chemicalPlan.method_ta || 'கைத்தெளிப்பான் மூலம் இலைகளில் படும்படி தெளிக்கவும்';
      const phi = chemicalPlan.pre_harvest_interval_days ? `அறுவடைக்கு ${chemicalPlan.pre_harvest_interval_days} நாட்கள் முன் தெளிப்பதை நிறுத்தவும்.` : '';
      treatmentText = `பரிந்துரைக்கப்படும் இரசாயன சிகிச்சை: ${chemName}. செயலூக்க பொருள் ${chemIngredient}. உங்கள் ${farmSize} ${unitLabelTa} நிலத்திற்கு தேவையான அளவு ${dosage.chemicalQuantityFormatted}, ${dosage.waterQuantityFormatted} தண்ணீரில் கலக்க வேண்டும். ${chemMethod}. ${phi}`;
    }

    // 6. Safety Precautions
    const safetyText = result.is_healthy
      ? 'பாதுகாப்பு: களைகள் மற்றும் தேவையற்ற நீர்த்தேக்கத்தை தவிர்க்கவும்.'
      : 'பாதுகாப்பு எச்சரிக்கை: பூச்சிக்கொல்லி அல்லது மருந்து தெளிக்கும் போது கையுறை மற்றும் முகக்கவசம் அணியவும். காற்று வீசும் திசையில் மட்டுமே தெளிக்கவும்.';

    const parts = [greeting, diagnosis, symptomsText, causesText, preventionText, treatmentText, safetyText];
    return cleanTamilSpokenText(parts.filter(Boolean).join(' '));
  }

  if (isHi) {
    const cropHi = result.crop_name_hi || 'फसल';
    const conditionHi = result.condition_title_hi || (result.is_healthy ? 'स्वस्थ पत्ती' : 'रोग ग्रस्त');
    const conditionEn = result.condition_title_en || '';

    const greeting = `${cropHi} फसल के लिए रोग निदान परिणाम।`;
    const diagnosis = result.is_healthy
      ? `आपकी ${cropHi} की फसल स्वस्थ है। पत्तियों पर किसी भी बीमारी के लक्षण नहीं पाए गए हैं।`
      : `पहचाना गया रोग: ${conditionHi}${conditionEn ? ` (${conditionEn})` : ''}। विश्वसनीयता ${result.confidence_percentage || 85} प्रतिशत।`;

    let symptomsText = '';
    const symptoms = result.common_symptoms_hi || [];
    if (!result.is_healthy && symptoms.length > 0) {
      symptomsText = `मुख्य लक्षण: ${symptoms.slice(0, 3).join('। ')}।`;
    }

    let treatmentText = '';
    if (result.is_healthy) {
      treatmentText = 'सलाह: किसी भी रासायनिक छिड़काव की आवश्यकता नहीं है। सामान्य सिंचाई और पोषण जारी रखें।';
    } else if (treatmentPreference === 'organic' && organicPlan) {
      const orgName = organicPlan.name_hi || organicPlan.name_en;
      treatmentText = `अनुशंसित जैविक उपचार: ${orgName}। आपके ${farmSize} ${unitLabelHi} खेत के लिए ${dosage.organicQuantityFormatted} दवा को ${dosage.waterQuantityFormatted} पानी में मिलाकर शाम के समय छिड़कें।`;
    } else if (chemicalPlan) {
      const chemName = chemicalPlan.product_name_hi || chemicalPlan.product_name_en;
      treatmentText = `अनुशंसित रासायनिक उपचार: ${chemName}। आपके ${farmSize} ${unitLabelHi} खेत के लिए आवश्यक मात्रा ${dosage.chemicalQuantityFormatted}, ${dosage.waterQuantityFormatted} पानी में मिलाकर छिड़कें।`;
    }

    const safetyText = 'सुरक्षा निर्देश: दवा छिड़कते समय दस्ताने और मास्क का प्रयोग करें। तेज हवा में छिड़काव न करें।';
    return [greeting, diagnosis, symptomsText, treatmentText, safetyText].filter(Boolean).join(' ');
  }

  // English fallback
  const cropEn = result.crop_name_en || 'Crop';
  const conditionEn = result.condition_title_en || (result.is_healthy ? 'Healthy Foliage' : 'Disease detected');
  const greeting = `Disease diagnosis results for your ${cropEn}.`;
  const diagnosis = result.is_healthy
    ? `Your ${cropEn} foliage is healthy. No fungal or bacterial disease detected.`
    : `Identified condition: ${conditionEn}. Diagnostic confidence is ${result.confidence_percentage || 85} percent.`;

  let symptomsText = '';
  const symptoms = result.common_symptoms_en || [];
  if (!result.is_healthy && symptoms.length > 0) {
    symptomsText = `Observed symptoms: ${symptoms.slice(0, 3).join('. ')}.`;
  }

  let treatmentText = '';
  if (result.is_healthy) {
    treatmentText = 'Recommendation: No chemical intervention required. Maintain routine irrigation and balanced nutrition.';
  } else if (treatmentPreference === 'organic' && organicPlan) {
    treatmentText = `Recommended Organic Treatment: ${organicPlan.name_en}. For your ${farmSize} ${farmSizeUnit}, apply ${dosage.organicQuantityFormatted} dissolved in ${dosage.waterQuantityFormatted} of clean water. ${organicPlan.method_en}`;
  } else if (chemicalPlan) {
    treatmentText = `Recommended Chemical Solution: ${chemicalPlan.product_name_en}. Active ingredient: ${chemicalPlan.active_ingredient}. For your ${farmSize} ${farmSizeUnit}, apply ${dosage.chemicalQuantityFormatted} mixed in ${dosage.waterQuantityFormatted} water. Pre-harvest interval is ${chemicalPlan.pre_harvest_interval_days || 7} days.`;
  }

  const safetyText = 'Safety precaution: Always wear protective gloves and a face mask when spraying, and do not spray against strong wind.';
  return [greeting, diagnosis, symptomsText, treatmentText, safetyText].filter(Boolean).join(' ');
}

/**
 * Builds comprehensive, highly structured spoken text for Fertilizer Recommendation
 * Guaranteed to translate:
 * 1. Crop name
 * 2. Fertilizer name and purpose
 * 3. Nutrient deficiencies when identified
 * 4. Recommended quantities (exact numerical amounts preserved)
 * 5. Application method
 * 6. Application timing
 * 7. Land area and unit
 * 8. Important precautions
 */
export function buildFertilizerSpokenText(
  rec: SpokenFertilizerData | null,
  lang: Language
): string {
  if (!rec) return '';

  const isTa = lang === 'ta';
  const isHi = lang === 'hi';

  const rawCrop = (rec.crop_name_en || rec.crop_info?.name_en || 'crop').toLowerCase();
  const cropTa = rec.crop_name_ta || rec.crop_info?.name_ta || CROP_MAP[rawCrop]?.ta || rec.crop_info?.name_en || 'பயிர்';
  const cropHi = rec.crop_name_hi || rec.crop_info?.name_hi || CROP_MAP[rawCrop]?.hi || 'फसल';

  const rawStage = (rec.growth_stage || rec.crop_info?.growth_stage || 'vegetative').toLowerCase();
  const stageTa = rec.crop_info?.growth_stage_ta || STAGE_MAP[rawStage]?.ta || 'தழை வளர்ச்சிப் பருவம்';
  const stageHi = rec.crop_info?.growth_stage_hi || STAGE_MAP[rawStage]?.hi || 'वानस्पतिक अवस्था';

  const rawUnit = (rec.crop_info?.land_unit || 'acres').toLowerCase();
  const unitTa = UNIT_MAP[rawUnit]?.ta || 'ஏக்கர்';
  const unitHi = UNIT_MAP[rawUnit]?.hi || 'एकड़';
  const landArea = rec.crop_info?.land_area || '1.0';

  if (isTa) {
    // 1. Introduction
    const intro = `${cropTa} பயிரின் ${landArea} ${unitTa} நிலத்திற்கான அதிகாரப்பூர்வ உரப் பரிந்துரை. தற்போதைய வளர்ச்சிப் பருவம் ${stageTa}.`;

    // 2. Nutrient Deficiency (when identified)
    let deficiencyText = '';
    if (rec.nutrient_deficiency_ta) {
      deficiencyText = `கண்டறியப்பட்ட ஊட்டச்சத்துக் குறைபாடு: ${rec.nutrient_deficiency_ta}.`;
    } else if (rec.nutrient_deficiency) {
      deficiencyText = `கண்டறியப்பட்ட ஊட்டச்சத்துக் குறைபாடு: ${rec.nutrient_deficiency}.`;
    }

    // 3. Recommended Fertilizers and exact quantities
    const items: string[] = [];
    if (rec.active_plan_items && rec.active_plan_items.length > 0) {
      rec.active_plan_items.forEach(item => {
        const name = item.fertilizer_name_ta || item.name_ta || item.fertilizer_name_en || item.name_en || 'உரம்';
        const rawQty = item.quantity || (item.quantity_tonnes ? `${item.quantity_tonnes} டன்` : `${item.quantity_kg || 0} கிலோ`);
        const cleanQty = rawQty.toString().replace(/tonnes?/gi, 'டன்').replace(/tons?/gi, 'டன்').replace(/kg/gi, 'கிலோ');
        const purpose = item.purpose_ta ? ` (${item.purpose_ta})` : '';
        items.push(`${name} ${cleanQty}${purpose}`);
      });
    }

    const fertilizerListText = items.length > 0
      ? `பரிந்துரைக்கப்படும் உரங்கள்: ${items.join(', ')}.`
      : 'பயிர் வளர்ச்சிக்கு ஏற்ப சமச்சீர் தொழு உரம், யூரியா மற்றும் பொட்டாஷ் இட பரிந்துரைக்கப்படுகிறது.';

    // 4. Application Timing and Method
    const timingText = 'பயன்பாட்டு முறை: உரங்களை ஒரேயடியாக இடாமல், விதைக்கும் போது அடி உரமாகவும், 30 நாட்கள் கழித்து மேலுரமாகவும் பிரித்து இடவும்.';

    // 5. Cost and Budget Analysis
    const estCost = rec.cost_analysis?.estimated_total_cost_inr || 0;
    const budget = rec.cost_analysis?.budget_inr || rec.crop_info?.fertilizer_budget_inr || 0;
    const isWithin = rec.cost_analysis?.is_within_budget ?? (estCost <= budget);
    const diff = Math.abs(estCost - budget);

    let budgetText = `மதிப்பிடப்பட்ட மொத்த உரச் செலவு ${estCost.toLocaleString()} ரூபாய்.`;
    if (budget > 0) {
      if (isWithin) {
        budgetText += ` இது உங்கள் பட்ஜெட்டான ${budget.toLocaleString()} ரூபாய்க்குள் அடங்குகிறது.`;
      } else {
        budgetText += ` இது உங்கள் பட்ஜெட்டான ${budget.toLocaleString()} ரூபாயை விட ${diff.toLocaleString()} ரூபாய் அதிகமாக உள்ளது.`;
      }
    }

    // 6. Safety Precautions
    const precautionsText = 'முக்கிய பாதுகாப்பு வழிமுறைகள்: உரங்களைக் கையாளும் போது கையுறைகளை அணியவும். கனமழைக்கு முன்னரோ அல்லது ஈரமில்லாத வறண்ட நிலத்திலோ யூரியாவை ஒரேயடியாக இட வேண்டாம்.';

    const fullTamil = [intro, deficiencyText, fertilizerListText, timingText, budgetText, precautionsText]
      .filter(Boolean)
      .join(' ');

    return cleanTamilSpokenText(fullTamil);
  }

  if (isHi) {
    const intro = `${cropHi} फसल के ${landArea} ${unitHi} खेत के लिए अनुशंसित खाद सलाह। वर्तमान अवस्था ${stageHi} है।`;
    const items: string[] = [];
    if (rec.active_plan_items && rec.active_plan_items.length > 0) {
      rec.active_plan_items.forEach(item => {
        const name = item.fertilizer_name_hi || item.name_hi || item.fertilizer_name_en || 'खाद';
        const rawQty = item.quantity || (item.quantity_tonnes ? `${item.quantity_tonnes} टन` : `${item.quantity_kg || 0} किग्रा`);
        items.push(`${name} ${rawQty}`);
      });
    }

    const fertilizerListText = items.length > 0 ? `अनुशंसित उर्वरक: ${items.join(', ')}।` : 'संतुलित गोबर खाद, यूरिया और पोटाश का उपयोग करें।';
    const estCost = rec.cost_analysis?.estimated_total_cost_inr || 0;
    const budgetText = `अनुमानित कुल लागत ${estCost.toLocaleString()} रुपये है।`;
    const timingText = 'खाद को एक साथ न देकर बेसल और टॉप ड्रेसिंग के रूप में बांट कर दें।';
    const precautionsText = 'सुरक्षा निर्देश: खाद डालते समय दस्ताने पहनें और बारिश से ठीक पहले यूरिया न डालें।';

    return [intro, fertilizerListText, timingText, budgetText, precautionsText].filter(Boolean).join(' ');
  }

  // English
  const crop = rec.crop_name_en || rec.crop_info?.name_en || 'Crop';
  const stage = rec.growth_stage || rec.crop_info?.growth_stage || 'Vegetative growth';
  const area = rec.crop_info?.land_area || '1.0';
  const unit = rec.crop_info?.land_unit || 'Acres';

  const items: string[] = [];
  if (rec.active_plan_items && rec.active_plan_items.length > 0) {
    rec.active_plan_items.forEach(item => {
      const name = item.fertilizer_name_en || item.name_en || 'Fertilizer';
      const qty = item.quantity || (item.quantity_tonnes ? `${item.quantity_tonnes} tonnes` : `${item.quantity_kg || 0} kg`);
      items.push(`${name} (${qty})`);
    });
  }

  const estCost = rec.cost_analysis?.estimated_total_cost_inr || 0;
  const budget = rec.cost_analysis?.budget_inr || rec.crop_info?.fertilizer_budget_inr || 0;
  const isWithin = rec.cost_analysis?.is_within_budget ?? (estCost <= budget);
  const diff = Math.abs(estCost - budget);

  let budgetText = `Estimated total cost is ${estCost.toLocaleString()} Rupees.`;
  if (budget > 0) {
    if (isWithin) {
      budgetText += ` This is within your stated budget of ${budget.toLocaleString()} Rupees.`;
    } else {
      budgetText += ` This exceeds your stated budget of ${budget.toLocaleString()} Rupees by ${diff.toLocaleString()} Rupees.`;
    }
  }

  return [
    `Fertilizer recommendation for ${crop}, land area ${area} ${unit}.`,
    `Current growth stage is ${stage}.`,
    items.length > 0 ? `Recommended inputs include: ${items.join(', ')}.` : '',
    `Apply fertilizers in split doses according to basal and top dressing schedules.`,
    budgetText,
    `Precaution: Always wear gloves when handling chemical fertilizers and avoid heavy urea application before rains.`
  ]
    .filter(Boolean)
    .join(' ');
}
