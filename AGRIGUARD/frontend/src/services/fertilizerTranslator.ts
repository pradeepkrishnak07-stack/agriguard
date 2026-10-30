/**
 * Dedicated Agronomic Spoken Text Translation & Formatting Service
 * Converts recommendations into natural spoken Tamil, Hindi, or English.
 * Strictly preserves:
 * - Fertilizer brand names and chemicals (Urea, SSP, MOP, FYM, Vermicompost, Neem Cake, Biofertilizer)
 * - Exact quantities and unit conversions (kg, tonnes, acres, hectares, cents)
 * - Scientific growth stages and agricultural precautions
 * - Currency and budget calculations
 */

export interface FertilizerRecommendationData {
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
    estimated_cost_inr?: number;
    [key: string]: any;
  }>;
  cost_analysis?: {
    estimated_total_cost_inr?: number;
    budget_inr?: number;
    is_within_budget?: boolean;
    comparison_en?: string;
    comparison_ta?: string;
    comparison_hi?: string;
  };
  schedule?: Array<{
    stage_en?: string;
    stage_ta?: string;
    stage_hi?: string;
    chemical_action_en?: string;
    chemical_action_ta?: string;
    chemical_action_hi?: string;
    organic_action_en?: string;
    organic_action_ta?: string;
    organic_action_hi?: string;
  }>;
  precautions_en?: string[];
  precautions_ta?: string[];
  precautions_hi?: string[];
  spoken_text_en?: string;
  spoken_text_ta?: string;
  spoken_text_hi?: string;
  [key: string]: any;
}

// Map English crop names to Tamil and Hindi
const CROP_MAP: Record<string, { ta: string; hi: string }> = {
  'rice': { ta: 'நெல்', hi: 'धान' },
  'paddy': { ta: 'நெல்', hi: 'धान' },
  'rice / paddy': { ta: 'நெல்', hi: 'धान' },
  'wheat': { ta: 'கோதுமை', hi: 'गेहूं' },
  'tomato': { ta: 'தக்காளி', hi: 'टमाटर' },
  'cotton': { ta: 'பருத்தி', hi: 'कपास' },
  'maize': { ta: 'மக்காச்சோளம்', hi: 'मक्का' },
  'corn': { ta: 'மக்காச்சோளம்', hi: 'मक्का' },
  'maize / corn': { ta: 'மக்காச்சோளம்', hi: 'मक्का' },
  'sugarcane': { ta: 'கரும்பு', hi: 'गन्ना' },
  'banana': { ta: 'வாழை', hi: 'केला' },
  'potato': { ta: 'உருளைக்கிழங்கு', hi: 'आलू' },
  'onion': { ta: 'வெங்காயம்', hi: 'प्याज' },
  'groundnut': { ta: 'நிலக்கடலை', hi: 'मूंगफली' },
  'peanut': { ta: 'நிலக்கடலை', hi: 'मूंगफली' },
  'soybean': { ta: 'சோயாபீன்', hi: 'सोयाबीन' },
  'chilli': { ta: 'மிளகாய்', hi: 'मिर्च' },
  'chili': { ta: 'மிளகாய்', hi: 'मिर्च' },
  'gram': { ta: 'கொண்டைக்கடலை', hi: 'चना' },
  'chickpea': { ta: 'கொண்டைக்கடலை', hi: 'चना' },
  'mustard': { ta: 'கடுகு', hi: 'सरसों' }
};

// Map growth stages
const STAGE_MAP: Record<string, { ta: string; hi: string }> = {
  'seedling': { ta: 'நாற்றுப் பருவம்', hi: 'अंकुरण / रोपाई अवस्था' },
  'germination': { ta: 'முளைப்புப் பருவம்', hi: 'अंकुरण अवस्था' },
  'vegetative': { ta: 'தழை வளர்ச்சிப் பருவம்', hi: 'वानस्पतिक वृद्धि अवस्था' },
  'vegetative growth': { ta: 'தழை வளர்ச்சிப் பருவம்', hi: 'वानस्पतिक वृद्धि अवस्था' },
  'flowering': { ta: 'பூக்கும் பருவம்', hi: 'फूल आने की अवस्था' },
  'fruiting': { ta: 'காய் பிடிக்கும் பருவம்', hi: 'फल विकास अवस्था' },
  'fruiting / maturity': { ta: 'காய் பிடிக்கும் மற்றும் முதிர்ச்சிப் பருவம்', hi: 'फल विकास और परिपक्वता अवस्था' },
  'maturity': { ta: 'முதிர்ச்சிப் பருவம்', hi: 'परिपक्वता अवस्था' }
};

// Map land units
const UNIT_MAP: Record<string, { ta: string; hi: string }> = {
  'acres': { ta: 'ஏக்கர்', hi: 'एकड़' },
  'acre': { ta: 'ஏக்கர்', hi: 'एकड़' },
  'hectares': { ta: 'ஹெக்டேர்', hi: 'हेक्टेयर' },
  'hectare': { ta: 'ஹெக்டேர்', hi: 'हेक्टेयर' },
  'cents': { ta: 'சென்ட்', hi: 'सेंट' },
  'cent': { ta: 'சென்ட்', hi: 'सेंट' },
  'gunthas': { ta: 'குந்தா', hi: 'गुंठा' },
  'guntha': { ta: 'குந்தா', hi: 'गुंठा' },
  'bighas': { ta: 'பிகா', hi: 'बीघा' },
  'bigha': { ta: 'பிகா', hi: 'बीघा' },
  'square meters': { ta: 'சதுர மீட்டர்', hi: 'वर्ग मीटर' }
};

/**
 * Sanitizes and cleans Tamil spoken text to ensure zero untranslated English words
 */
export function sanitizeTamilSpokenText(rawText: string): string {
  let text = rawText;

  const replacements: Array<[RegExp, string]> = [
    [/\bAcres\b/gi, 'ஏக்கர்'],
    [/\bAcre\b/gi, 'ஏக்கர்'],
    [/\bHectares\b/gi, 'ஹெக்டேர்'],
    [/\bHectare\b/gi, 'ஹெக்டேர்'],
    [/\bCents\b/gi, 'சென்ட்'],
    [/\bGunthas?\b/gi, 'குந்தா'],
    [/\bBighas?\b/gi, 'பிகா'],
    [/\bSquare meters?\b/gi, 'சதுர மீட்டர்'],
    [/\bSeedling\b/gi, 'நாற்றுப் பருவம்'],
    [/\bGermination\b/gi, 'முளைப்புப் பருவம்'],
    [/\bVegetative growth\b/gi, 'தழை வளர்ச்சிப் பருவம்'],
    [/\bVegetative\b/gi, 'தழை வளர்ச்சிப் பருவம்'],
    [/\bFlowering\b/gi, 'பூக்கும் பருவம்'],
    [/\bFruiting \/ Maturity\b/gi, 'காய் பிடிக்கும் மற்றும் முதிர்ச்சிப் பருவம்'],
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
    [/\bVermicompost\b/gi, 'மண்புழு உரம்'],
    [/\bNeem Cake\b/gi, 'வேப்பம் பிண்ணாக்கு'],
    [/\bBio-?fertilizers?\b/gi, 'உயிர் உரம்'],
    [/\bRupees\b/gi, 'ரூபாய்'],
    [/\bTonnes?\b/gi, 'டன்'],
    [/\bTons?\b/gi, 'டன்'],
    [/\bKg\b/gi, 'கிலோ'],
    [/\bDAP\b/gi, 'டிஏபி']
  ];

  for (const [pattern, rep] of replacements) {
    text = text.replace(pattern, rep);
  }

  // Replace currency symbol ₹ with 'ரூபாய்'
  text = text.replace(/₹\s*([0-9,]+)/g, '$1 ரூபாய்');

  return text.trim();
}

/**
 * Builds a natural, complete Tamil spoken text directly from recommendation data
 */
export function buildTamilSpokenRecommendation(rec: FertilizerRecommendationData): string {
  // Resolve crop name in Tamil
  const cropRaw = (rec.crop_name_en || rec.crop_info?.name_en || 'பயிர்').toLowerCase();
  const cropTa = rec.crop_name_ta || rec.crop_info?.name_ta || CROP_MAP[cropRaw]?.ta || rec.crop_info?.name_en || 'பயிர்';
  
  // Resolve growth stage in Tamil
  const rawStage = (rec.growth_stage || rec.crop_info?.growth_stage || 'vegetative').toLowerCase();
  const stageTa = rec.crop_info?.growth_stage_ta || STAGE_MAP[rawStage]?.ta || 'தழை வளர்ச்சிப் பருவம்';

  // Resolve land unit in Tamil
  const rawUnit = (rec.crop_info?.land_unit || 'acres').toLowerCase();
  const unitTa = UNIT_MAP[rawUnit]?.ta || 'ஏக்கர்';
  const landArea = rec.crop_info?.land_area || '1.0';

  // Extract fertilizers in pure Tamil
  const items: string[] = [];
  if (rec.active_plan_items && rec.active_plan_items.length > 0) {
    rec.active_plan_items.forEach(item => {
      const name = item.fertilizer_name_ta || item.name_ta || item.fertilizer_name_en || item.name_en || 'உரம்';
      const rawQty = item.quantity || (item.quantity_tonnes ? `${item.quantity_tonnes} tonnes` : `${item.quantity_kg || 0} kg`);
      const cleanQty = rawQty
        .replace(/tonnes?/gi, 'டன்')
        .replace(/tons?/gi, 'டன்')
        .replace(/kg/gi, 'கிலோ');
      items.push(`${name} ${cleanQty}`);
    });
  }

  const fertilizerListText = items.length > 0
    ? `பரிந்துரைக்கப்படும் உரங்கள்: ${items.join(', ')}.`
    : 'பயிர் வளர்ச்சிக்கு ஏற்ப சமச்சீர் தொழு உரம், யூரியா மற்றும் பொட்டாஷ் இட பரிந்துரைக்கப்படுகிறது.';

  // Cost and budget in Tamil
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

  // Application timing guidance
  const scheduleText = 'உரங்களை ஒரேயடியாக இடாமல், விதைக்கும் போது அடி உரமாகவும், 30 நாட்கள் கழித்து மேலுரமாகவும் பிரித்து இடவும்.';

  // Agricultural safety precautions in Tamil
  const precautionsText = 'முக்கிய பாதுகாப்பு: உரங்களைக் கையாளும் போது கையுறைகளை அணியவும். கனமழைக்கு முன்னரோ அல்லது ஈரமில்லாத வறண்ட நிலத்திலோ யூரியாவை ஒரேயடியாக இட வேண்டாம்.';

  // Assemble natural Tamil script
  const speechParts = [
    `${cropTa} பயிரின் ${landArea} ${unitTa} நிலத்திற்கான அதிகாரப்பூர்வ உரப் பரிந்துரை.`,
    `தற்போதைய வளர்ச்சிப் பருவம் ${stageTa}.`,
    fertilizerListText,
    scheduleText,
    budgetText,
    precautionsText
  ];

  return sanitizeTamilSpokenText(speechParts.join(' '));
}

/**
 * Builds natural Hindi spoken text from recommendation data
 */
export function buildHindiSpokenRecommendation(rec: FertilizerRecommendationData): string {
  const cropRaw = (rec.crop_name_en || rec.crop_info?.name_en || 'फसल').toLowerCase();
  const cropHi = rec.crop_name_hi || rec.crop_info?.name_hi || CROP_MAP[cropRaw]?.hi || 'फसल';

  const rawStage = (rec.growth_stage || rec.crop_info?.growth_stage || 'vegetative').toLowerCase();
  const stageHi = rec.crop_info?.growth_stage_hi || STAGE_MAP[rawStage]?.hi || 'वानस्पतिक वृद्धि अवस्था';

  const rawUnit = (rec.crop_info?.land_unit || 'acres').toLowerCase();
  const unitHi = UNIT_MAP[rawUnit]?.hi || 'एकड़';
  const landArea = rec.crop_info?.land_area || '1.0';

  const items: string[] = [];
  if (rec.active_plan_items && rec.active_plan_items.length > 0) {
    rec.active_plan_items.forEach(item => {
      const name = item.fertilizer_name_hi || item.name_hi || item.fertilizer_name_en || 'खाद';
      const rawQty = item.quantity || (item.quantity_tonnes ? `${item.quantity_tonnes} tonnes` : `${item.quantity_kg || 0} kg`);
      const cleanQty = rawQty
        .replace(/tonnes?/gi, 'टन')
        .replace(/tons?/gi, 'टन')
        .replace(/kg/gi, 'किग्रा');
      items.push(`${name} ${cleanQty}`);
    });
  }

  const fertilizerListText = items.length > 0
    ? `अनुशंसित उर्वरक: ${items.join(', ')}।`
    : 'संतुलित गोबर खाद, यूरिया, सुपर फॉस्फेट और पोटाश का उपयोग करें।';

  const estCost = rec.cost_analysis?.estimated_total_cost_inr || 0;
  const budget = rec.cost_analysis?.budget_inr || rec.crop_info?.fertilizer_budget_inr || 0;
  const isWithin = rec.cost_analysis?.is_within_budget ?? (estCost <= budget);
  const diff = Math.abs(estCost - budget);

  let budgetText = `अनुमानित कुल लागत ${estCost.toLocaleString()} रुपये है।`;
  if (budget > 0) {
    if (isWithin) {
      budgetText += ` यह आपके बजट ${budget.toLocaleString()} रुपये के भीतर है।`;
    } else {
      budgetText += ` यह आपके बजट ${budget.toLocaleString()} रुपये से ${diff.toLocaleString()} रुपये अधिक है।`;
    }
  }

  const speechParts = [
    `${cropHi} फसल के ${landArea} ${unitHi} खेत के लिए अनुशंसित खाद सलाह।`,
    `वर्तमान वृद्धि अवस्था ${stageHi} है।`,
    fertilizerListText,
    `खाद को एक साथ न देकर बेसल और टॉप ड्रेसिंग के रूप में बांट कर दें।`,
    budgetText,
    `सुरक्षा निर्देश: रासायनिक खाद डालते समय दस्ताने पहनें और तेज बारिश से पहले यूरिया न डालें।`
  ];

  return speechParts.join(' ');
}

/**
 * Builds natural English spoken text from recommendation data
 */
export function buildEnglishSpokenRecommendation(rec: FertilizerRecommendationData): string {
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
  ].filter(Boolean).join(' ');
}

import { buildFertilizerSpokenText } from './spokenContentBuilder';

/**
 * Master function to resolve spoken text for any language: 'ta', 'hi', or 'en'
 */
export function getSpokenRecommendationText(
  rec: FertilizerRecommendationData | null,
  lang: 'ta' | 'en' | 'hi'
): string {
  if (!rec) return '';

  // Use the comprehensive spokenContentBuilder to guarantee full Tamil coverage with nutrient deficiencies and precautions
  return buildFertilizerSpokenText(rec, lang);
}
