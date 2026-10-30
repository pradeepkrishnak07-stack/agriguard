import sys

with open('frontend/src/components/DiseaseDetectionScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add autoDetectCrop state
state_target = "  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);"
state_replacement = """  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
  const [autoDetectCrop, setAutoDetectCrop] = useState<boolean>(true);"""

if state_target in content:
    content = content.replace(state_target, state_replacement, 1)

# 2. Update loadScanRecord to safely check if (enriched)
load_target = """    if (!fullRes || !fullRes.soil_info) {
      const enriched = getEnrichedDiseaseData(record.crop_id, record.condition_title_en);
      fullRes = {
        success: true,
        is_reliable: true,
        is_healthy: record.is_healthy,
        crop_id: record.crop_id,
        crop_name_en: record.crop_name_en,
        crop_name_ta: record.crop_name_ta,
        crop_name_hi: record.crop_name_hi,
        condition_title_en: record.condition_title_en,
        condition_title_ta: record.condition_title_ta,
        condition_title_hi: record.condition_title_hi,
        confidence_score: record.confidence_score,
        confidence_percentage: Math.round(record.confidence_score * 100),
        confidence_level: record.confidence_score >= 0.8 ? 'High' : 'Moderate',
        model_version: record.model_version,
        pathogen: record.pathogen,
        image_preview_url: record.image_preview_url,
        explanation_en: enriched.disease_detail.explanation_en,
        explanation_ta: enriched.disease_detail.explanation_ta,
        explanation_hi: enriched.disease_detail.explanation_hi,
        common_symptoms_en: enriched.disease_detail.symptoms_en,
        common_symptoms_ta: enriched.disease_detail.symptoms_ta,
        common_symptoms_hi: enriched.disease_detail.symptoms_hi,
        soil_info: enriched.soil_info,
        causes_info: enriched.causes,
        organic_treatment: enriched.organic,
        chemical_treatment: enriched.chemical,
      };
    }"""

load_replacement = """    if (!fullRes || !fullRes.soil_info) {
      const enriched = getEnrichedDiseaseData(record.crop_id, record.condition_title_en);
      if (enriched) {
        fullRes = {
          success: true,
          is_reliable: true,
          is_healthy: record.is_healthy,
          crop_id: record.crop_id,
          crop_name_en: record.crop_name_en,
          crop_name_ta: record.crop_name_ta,
          crop_name_hi: record.crop_name_hi,
          condition_title_en: record.condition_title_en,
          condition_title_ta: record.condition_title_ta,
          condition_title_hi: record.condition_title_hi,
          confidence_score: record.confidence_score,
          confidence_percentage: Math.round(record.confidence_score * 100),
          confidence_level: record.confidence_score >= 0.8 ? 'High' : 'Moderate',
          model_version: record.model_version,
          pathogen: record.pathogen,
          image_preview_url: record.image_preview_url,
          explanation_en: enriched.disease_detail?.explanation_en,
          explanation_ta: enriched.disease_detail?.explanation_ta,
          explanation_hi: enriched.disease_detail?.explanation_hi,
          common_symptoms_en: enriched.disease_detail?.symptoms_en,
          common_symptoms_ta: enriched.disease_detail?.symptoms_ta,
          common_symptoms_hi: enriched.disease_detail?.symptoms_hi,
          soil_info: enriched.soil_info,
          causes_info: enriched.causes,
          organic_treatment: enriched.organic,
          chemical_treatment: enriched.chemical,
        };
      } else {
        fullRes = {
          success: true,
          is_reliable: true,
          is_healthy: record.is_healthy,
          crop_id: record.crop_id,
          crop_name_en: record.crop_name_en,
          crop_name_ta: record.crop_name_ta,
          crop_name_hi: record.crop_name_hi,
          condition_title_en: record.condition_title_en,
          condition_title_ta: record.condition_title_ta,
          condition_title_hi: record.condition_title_hi,
          confidence_score: record.confidence_score,
          confidence_percentage: Math.round(record.confidence_score * 100),
          confidence_level: record.confidence_score >= 0.8 ? 'High' : 'Moderate',
          model_version: record.model_version,
          pathogen: record.pathogen,
          image_preview_url: record.image_preview_url,
        };
      }
    }"""

if load_target in content:
    content = content.replace(load_target, load_replacement, 1)

# 3. Update handleRunAnalysis to use autoDetectCrop
analysis_target = "const res = await api.detectCropDisease(selectedFile, farmProfile.active_crop_id);"
analysis_replacement = "const res = await api.detectCropDisease(selectedFile, autoDetectCrop ? undefined : farmProfile.active_crop_id);"

if analysis_target in content:
    content = content.replace(analysis_target, analysis_replacement, 1)

# 4. Add Auto-detect Crop Toggle above or below the photo buttons
ui_target = """              {/* Two Main Options: Take Photo & Upload Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">"""

ui_replacement = """              {/* Auto-detect Plant Species Toggle */}
              <div className="max-w-md mx-auto flex items-center justify-between p-3 rounded-2xl bg-emerald-100/60 border border-emerald-300 text-xs">
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span className="font-extrabold text-slate-800 text-left">
                    {isTa ? 'அனைத்து பயிர்களையும் தானாகக் கண்டறி (38 பிரிவுகள்)' : isHi ? 'सभी फसलों का स्वतः निदान (38 वर्ग)' : 'Auto-detect Plant & Disease (All 38 Classes)'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                  <input
                    type="checkbox"
                    checked={autoDetectCrop}
                    onChange={(e) => setAutoDetectCrop(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Two Main Options: Take Photo & Upload Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">"""

if ui_target in content:
    content = content.replace(ui_target, ui_replacement, 1)

# 5. Scientific name display
scientific_target = "{result.crop_id === 'tomato' ? 'Solanum lycopersicum' : result.crop_id === 'rice' ? 'Oryza sativa' : 'Cultivated Flora'}"
scientific_replacement = """{
  result.crop_id === 'tomato' ? 'Solanum lycopersicum' :
  result.crop_id === 'corn' ? 'Zea mays' :
  result.crop_id === 'apple' ? 'Malus domestica' :
  result.crop_id === 'grape' ? 'Vitis vinifera' :
  result.crop_id === 'potato' ? 'Solanum tuberosum' :
  result.crop_id === 'orange' ? 'Citrus sinensis' :
  result.crop_id === 'peach' ? 'Prunus persica' :
  result.crop_id === 'cherry' ? 'Prunus avium' :
  result.crop_id === 'strawberry' ? 'Fragaria × ananassa' :
  result.crop_id === 'squash' ? 'Cucurbita pepo' :
  result.crop_id === 'soybean' ? 'Glycine max' :
  result.crop_id === 'blueberry' ? 'Vaccinium corymbosum' :
  result.crop_id === 'raspberry' ? 'Rubus idaeus' :
  result.crop_id === 'chilli' ? 'Capsicum annuum' :
  result.crop_id === 'rice' ? 'Oryza sativa' :
  result.crop_id === 'cotton' ? 'Gossypium hirsutum' :
  'Cultivated Flora'
}"""

if scientific_target in content:
    content = content.replace(scientific_target, scientific_replacement, 1)

with open('frontend/src/components/DiseaseDetectionScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("DiseaseDetectionScreen.tsx patched successfully!")
