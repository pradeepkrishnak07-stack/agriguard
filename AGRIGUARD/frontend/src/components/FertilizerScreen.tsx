import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical, CheckCircle2, AlertTriangle,
  Layers, Leaf, DollarSign, Volume2,
  VolumeX, Pause, Play, Send, Sparkles,
  ChevronDown, ChevronUp, Clock, Eye,
  Trash2, Plus, ArrowRight, ShieldAlert, Check
} from 'lucide-react';
import { Language, FarmProfile } from '../types';
import { AuthUser } from './LoginScreen';
import { api } from '../services/api';
import { speechService } from '../services/speech';
import { getSpokenRecommendationText } from '../services/fertilizerTranslator';

interface FertilizerScreenProps {
  language: Language;
  farmProfile: FarmProfile;
  authUser?: AuthUser | null;
  onSetLanguage?: (lang: Language) => void;
}

interface AppliedFertilizer {
  name: string;
  quantity_kg: number;
  unit: string;
  date_or_days_ago?: string;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  topic?: string;
  timestamp: string;
}

const COMMON_CROPS = [
  { id: 'tomato', name_en: 'Tomato', name_ta: 'தக்காளி', name_hi: 'टमाटर', icon: '🍅' },
  { id: 'rice', name_en: 'Rice / Paddy', name_ta: 'நெல்', name_hi: 'धान / चावल', icon: '🌾' },
  { id: 'cotton', name_en: 'Cotton', name_ta: 'பருத்தி', name_hi: 'कपास', icon: '☁️' },
  { id: 'potato', name_en: 'Potato', name_ta: 'உருளைக்கிழங்கு', name_hi: 'आलू', icon: '🥔' },
  { id: 'corn', name_en: 'Maize / Corn', name_ta: 'மக்காச்சோளம்', name_hi: 'मक्का', icon: '🌽' },
  { id: 'groundnut', name_en: 'Groundnut', name_ta: 'வேர்க்கடலை', name_hi: 'मूंगफली', icon: '🥜' },
  { id: 'chilli', name_en: 'Chilli', name_ta: 'மிளகாய்', name_hi: 'मिर्च', icon: '🌶️' },
  { id: 'sugarcane', name_en: 'Sugarcane', name_ta: 'கரும்பு', name_hi: 'गन्ना', icon: '🎋' },
  { id: 'banana', name_en: 'Banana', name_ta: 'வாழை', name_hi: 'केला', icon: '🍌' },
  { id: 'wheat', name_en: 'Wheat', name_ta: 'கோதுமை', name_hi: 'गेहूं', icon: '🌾' }
];

const SOIL_TYPES = [
  { id: 'Red soil', label_en: 'Red soil', label_ta: 'செம்மண்', label_hi: 'लाल मिट्टी' },
  { id: 'Black soil', label_en: 'Black soil', label_ta: 'கரிசல் மண்', label_hi: 'काली मिट्टी' },
  { id: 'Sandy soil', label_en: 'Sandy soil', label_ta: 'மணல் மண்', label_hi: 'बलुई मिट्टी' },
  { id: 'Clay soil', label_en: 'Clay soil', label_ta: 'களிமண்', label_hi: 'मटियार / चिकनी मिट्टी' },
  { id: 'Loamy soil', label_en: 'Loamy soil', label_ta: 'வண்டல் / இருமண்', label_hi: 'दोमट मिट्टी' },
  { id: 'Other', label_en: 'Other', label_ta: 'பிற மண் வகை', label_hi: 'अन्य' },
  { id: 'Not sure', label_en: 'Not sure', label_ta: 'தெரியவில்லை', label_hi: 'निश्चित नहीं' }
];

const IRRIGATION_METHODS = [
  { id: 'Drip irrigation', label_en: 'Drip irrigation', label_ta: 'சொட்டுநீர்ப் பாசனம்', label_hi: 'टपक सिंचाई (ड्रिप)' },
  { id: 'Sprinkler irrigation', label_en: 'Sprinkler irrigation', label_ta: 'தெளிப்பு நீர்ப் பாசனம்', label_hi: 'फव्वारा सिंचाई' },
  { id: 'Flood irrigation', label_en: 'Flood irrigation', label_ta: 'வாய்க்கால் / பாய்த்துப் பாசனம்', label_hi: 'प्लावन / खुला पानी' },
  { id: 'Furrow irrigation', label_en: 'Furrow irrigation', label_ta: 'சால் பாசனம்', label_hi: 'नाली / कुंड सिंचाई' },
  { id: 'Other', label_en: 'Other', label_ta: 'பிற முறை', label_hi: 'अन्य' }
];

const PLANT_PROBLEM_OPTIONS = [
  { id: 'yellow_leaves', label_en: 'Yellow leaves', label_ta: 'இலை மஞ்சளாதல்', label_hi: 'पत्तियों का पीलापन' },
  { id: 'poor_flowering', label_en: 'Poor flowering', label_ta: 'குறைந்த பூக்கள் / பூ உதிர்தல்', label_hi: 'कम फूल आना / गिरना' },
  { id: 'poor_fruit', label_en: 'Poor fruit development', label_ta: 'காய் பிடிப்பதில் குறைபாடு', label_hi: 'फलों का कमजोर विकास' },
  { id: 'slow_growth', label_en: 'Slow growth', label_ta: 'வளர்ச்சி குன்றுதல்', label_hi: 'धीमी बढ़वार' },
  { id: 'other_symptoms', label_en: 'Other symptoms', label_ta: 'பிற அறிகுறிகள்', label_hi: 'अन्य लक्षण' },
  { id: 'no_problems', label_en: 'No problems', label_ta: 'எந்த பிரச்சனையும் இல்லை', label_hi: 'कोई समस्या नहीं' }
];

const FERTILIZER_PREFERENCES = [
  {
    id: 'Organic fertilizers',
    title_en: 'Organic fertilizers',
    title_ta: 'இயற்கை உரங்கள்',
    title_hi: 'जैविक उर्वरक',
    desc_en: 'FYM, Vermicompost, Neem Cake & Biofertilizers',
    desc_ta: 'தொழு உரம், மண்புழு உரம், வேப்பம் பிண்ணாக்கு',
    desc_hi: 'गोबर खाद, केंचुआ खाद व नीम खली'
  },
  {
    id: 'Chemical fertilizers',
    title_en: 'Chemical fertilizers',
    title_ta: 'ரசாயன உரங்கள்',
    title_hi: 'रासायनिक उर्वरक',
    desc_en: 'Targeted NPK, Urea, SSP & MOP',
    desc_ta: 'யூரியா, சூப்பர் பாஸ்பேட், பொட்டாஷ்',
    desc_hi: 'यूरिया, एसएसपी, एमओपी व डीएपी'
  },
  {
    id: 'Both organic and chemical fertilizers',
    title_en: 'Both organic & chemical',
    title_ta: 'இரண்டும் கலந்த சமச்சீர் முறை',
    title_hi: 'जैविक और रासायनिक दोनों',
    desc_en: 'Integrated Nutrient Management (Recommended)',
    desc_ta: 'அதிக விளைச்சலுக்கான ஒருங்கிணைந்த ஊட்டச்சத்து',
    desc_hi: 'अधिक पैदावार के लिए एकीकृत पोषण'
  }
];

export const FertilizerScreen: React.FC<FertilizerScreenProps> = ({
  language,
  farmProfile,
  authUser,
  onSetLanguage
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>(language);

  // Sync external language prop
  useEffect(() => {
    setSelectedLang(language);
  }, [language]);

  const handleLangChange = (lang: Language) => {
    // Cancel any existing speech immediately so previous language does not continue
    speechService.stopSpeaking();
    setSpeechState('idle');
    setSpeechError(null);
    setSelectedLang(lang);
    if (onSetLanguage) onSetLanguage(lang);
  };

  const isTa = selectedLang === 'ta';
  const isHi = selectedLang === 'hi';

  // 13 Questionnaire Form States
  // Q1: Crop
  const activeCrop = farmProfile.crops.find(c => c.crop_id === farmProfile.active_crop_id) || farmProfile.crops[0];
  const [cropId, setCropId] = useState<string>(activeCrop?.crop_id || 'tomato');
  const [cropName, setCropName] = useState<string>(activeCrop?.crop_name_en || 'Tomato');
  const [isCustomCrop, setIsCustomCrop] = useState<boolean>(false);

  // Q2: Growth Stage
  const [growthStage, setGrowthStage] = useState<string>('Vegetative growth');

  // Q3: Cultivated Land Size
  const [landArea, setLandArea] = useState<string>('1.0');
  const [landUnit, setLandUnit] = useState<string>('Acres');

  // Q4: Soil Type
  const [soilType, setSoilType] = useState<string>('Red soil');

  // Q5: Soil Tested
  const [soilTested, setSoilTested] = useState<boolean>(false);

  // Q6: Soil pH and NPK
  const [soilPh, setSoilPh] = useState<string>('');
  const [soilN, setSoilN] = useState<string>('');
  const [soilP, setSoilP] = useState<string>('');
  const [soilK, setSoilK] = useState<string>('');

  // Q7: Already applied fertilizer
  const [alreadyApplied, setAlreadyApplied] = useState<boolean>(false);

  // Q8: Applied fertilizers
  const [appliedFertilizers, setAppliedFertilizers] = useState<AppliedFertilizer[]>([
    { name: 'Urea', quantity_kg: 50, unit: 'kg', date_or_days_ago: '15 days ago' }
  ]);

  // Q9: Irrigation method
  const [irrigationMethod, setIrrigationMethod] = useState<string>('Drip irrigation');

  // Q10: Plant problems
  const [plantProblems, setPlantProblems] = useState<string[]>([]);
  const [symptomDescription, setSymptomDescription] = useState<string>('');

  // Q11: Fertilizer preference
  const [fertilizerPreference, setFertilizerPreference] = useState<string>('Both organic and chemical fertilizers');

  // Q12: How long ago planted
  const [plantingTimingMode, setPlantingTimingMode] = useState<'days' | 'date'>('days');
  const [cropAgeDays, setCropAgeDays] = useState<string>('30');
  const [plantingDate, setPlantingDate] = useState<string>('');

  // Q13: Approximate fertilizer budget
  const [fertilizerBudget, setFertilizerBudget] = useState<string>('5000');

  // Execution & UI State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recommendationResult, setRecommendationResult] = useState<any | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<any | null>(null);

  // Previous Recommendations State
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [showHistorySection, setShowHistorySection] = useState<boolean>(false);

  // Speech Assistant State
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Follow-up Text Assistant State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAskingAssistant, setIsAskingAssistant] = useState<boolean>(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Growth Stage Options based on Crop
  const getGrowthStageOptions = (cId: string) => {
    const cid = cId.toLowerCase();
    if (cid.includes('rice') || cid.includes('paddy')) {
      return ['Seedling', 'Tillering', 'Vegetative growth', 'Flowering', 'Maturity'];
    }
    if (cid.includes('potato')) {
      return ['Seedling', 'Vegetative growth', 'Tuber Initiation', 'Fruiting', 'Maturity'];
    }
    if (cid.includes('sugarcane')) {
      return ['Seedling', 'Tillering', 'Vegetative growth', 'Flowering', 'Maturity'];
    }
    return ['Seedling', 'Vegetative growth', 'Flowering', 'Fruiting', 'Maturity'];
  };

  // Load Previous Recommendations for Authenticated User
  const loadHistory = async () => {
    const userId = authUser?.id || farmProfile.farmer_name;
    if (!userId) return;
    setIsLoadingHistory(true);
    try {
      const records = await api.getFertilizerHistory(userId);
      setHistoryList(records || []);
    } catch (err) {
      console.warn("Could not load fertilizer history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [authUser?.id]);

  // Handle Plant Problem Toggle
  const handleToggleProblem = (id: string) => {
    if (id === 'no_problems') {
      if (plantProblems.includes('no_problems')) {
        setPlantProblems([]);
      } else {
        setPlantProblems(['no_problems']);
      }
      return;
    }

    setPlantProblems(prev => {
      const filtered = prev.filter(p => p !== 'no_problems');
      if (filtered.includes(id)) {
        return filtered.filter(p => p !== id);
      } else {
        return [...filtered, id];
      }
    });
  };

  // Handle Applied Fertilizer Row Add/Remove/Change
  const handleAddAppliedFertilizer = () => {
    setAppliedFertilizers(prev => [
      ...prev,
      { name: 'DAP', quantity_kg: 25, unit: 'kg', date_or_days_ago: '' }
    ]);
  };

  const handleRemoveAppliedFertilizer = (idx: number) => {
    setAppliedFertilizers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateAppliedFertilizer = (idx: number, field: keyof AppliedFertilizer, val: any) => {
    setAppliedFertilizers(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  // Form Validation and Submission
  const handleSubmitForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    // Validation
    const effectiveCropName = isCustomCrop ? cropName.trim() : (COMMON_CROPS.find(c => c.id === cropId)?.name_en || cropName);
    if (!effectiveCropName) {
      setErrorMessage(isTa ? "பயிரின் பெயரை உள்ளிடவும் அல்லது தேர்வு செய்யவும்." : isHi ? "कृपया फसल का नाम चुनें या दर्ज करें।" : "Please select or enter the crop name.");
      return;
    }

    const parsedArea = parseFloat(landArea);
    if (isNaN(parsedArea) || parsedArea <= 0) {
      setErrorMessage(isTa ? "சரியான நிலப்பரப்பளவை உள்ளிடவும் (0-க்கு மேல்)." : isHi ? "कृपया वैध खेत का आकार दर्ज करें (0 से अधिक)।" : "Please enter a valid cultivated land size greater than 0.");
      return;
    }

    const parsedBudget = parseFloat(fertilizerBudget);
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setErrorMessage(isTa ? "உங்கள் உத்தேச உர பட்ஜெட்டை உள்ளிடவும்." : isHi ? "कृपया अपना अनुमानित बजट दर्ज करें।" : "Please enter your approximate fertilizer budget in Rupees.");
      return;
    }

    let effectiveCropAge = parseInt(cropAgeDays, 10);
    if (plantingTimingMode === 'date' && plantingDate) {
      const planted = new Date(plantingDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - planted.getTime());
      effectiveCropAge = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    if (isNaN(effectiveCropAge) || effectiveCropAge < 0) {
      effectiveCropAge = 30;
    }

    // Build Payload
    const userId = authUser?.id || farmProfile.farmer_name || 'usr_default';
    const payload = {
      crop_id: isCustomCrop ? 'custom' : cropId,
      crop_name: effectiveCropName,
      growth_stage: growthStage,
      land_area: parsedArea,
      land_unit: landUnit,
      soil_type: soilType,
      soil_tested: soilTested,
      soil_ph: soilPh ? parseFloat(soilPh) : null,
      soil_nitrogen: soilN || null,
      soil_phosphorus: soilP || null,
      soil_potassium: soilK || null,
      already_applied: alreadyApplied,
      applied_fertilizers: alreadyApplied ? appliedFertilizers : [],
      irrigation_method: irrigationMethod,
      plant_problems: plantProblems,
      symptom_description: symptomDescription.trim() || null,
      fertilizer_preference: fertilizerPreference,
      crop_age_days: effectiveCropAge,
      planting_date: plantingTimingMode === 'date' ? plantingDate : null,
      fertilizer_budget_inr: parsedBudget,
      user_id: userId,
      preferred_language: selectedLang
    };

    setIsSubmitting(true);
    try {
      console.log("Submitting fertilizer recommendation payload:", payload);
      const result = await api.generateFertilizerPlan(payload);
      console.log("Recommendation received:", result);
      if (result && result.success) {
        setRecommendationResult(result);
        setSubmittedAnswers(payload);
        // Refresh previous recommendations list
        loadHistory();
        // Reset chat
        setChatMessages([]);
        // Scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        throw new Error(result?.message || "Recommendation generation failed.");
      }
    } catch (err: any) {
      console.error("Submission failed", err);
      const isNet = err.isNetworkError || err.message === 'BACKEND_UNAVAILABLE' || err.status === 502 || err.status === 503 || err.status === 504;
      if (isNet) {
        setErrorMessage(
          isTa
            ? "உரப் பரிந்துரை சேவையகத்தை இணைக்க முடியவில்லை (Port 8001). உங்கள் பதில்கள் பாதுகாக்கப்பட்டுள்ளன. தயவுசெய்து பேக்எண்ட் சர்வர் இயங்குகிறதா என சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
            : isHi
            ? "उर्वरक सिफारिश बैकएंड सेवा (पोर्ट 8001) से संपर्क नहीं हो सका। आपके उत्तर सुरक्षित हैं; कृपया सुनिश्चित करें कि बैकएंड चल रहा है और पुनः प्रयास करें।"
            : "Could not connect to the fertilizer recommendation backend service on port 8001. Your answers are preserved; please ensure the backend server is running and click Retry."
        );
      } else {
        setErrorMessage(
          err.message ||
          (isTa
            ? "உரப் பரிந்துரையை உருவாக்குவதில் பிழை ஏற்பட்டது. தயவுசெய்து உள்ளிட்ட விவரங்களைச் சரிபார்க்கவும்."
            : isHi
            ? "उर्वरक सिफारिश तैयार करने में विफलता। कृपया दर्ज किए गए विवरणों की जांच करें।"
            : "Failed to generate fertilizer recommendation. Please verify the entered details.")
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // View Saved Recommendation Details
  const handleViewSavedRecommendation = (savedRecord: any) => {
    setRecommendationResult(savedRecord.recommendation);
    setSubmittedAnswers(savedRecord.input_payload || {
      crop_name: savedRecord.crop_name_en,
      growth_stage: savedRecord.growth_stage,
      land_area: savedRecord.land_area,
      land_unit: savedRecord.land_unit,
      soil_type: savedRecord.soil_type,
      fertilizer_budget_inr: savedRecord.budget_inr,
      fertilizer_preference: savedRecord.preference,
      crop_age_days: savedRecord.recommendation?.crop_info?.crop_age_days || 30
    });
    setChatMessages([]);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Delete Saved Recommendation Record
  const handleDeleteSavedRecord = async (recId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = authUser?.id || farmProfile.farmer_name;
    if (!userId) return;
    const confirmed = window.confirm(
      isTa
        ? "இந்த சேமிக்கப்பட்ட உரப் பரிந்துரையை நிச்சயமாக நீக்க வேண்டுமா?"
        : isHi
        ? "क्या आप वाकई इस सहेजी गई सिफारिश को हटाना चाहते हैं?"
        : "Are you sure you want to delete this saved recommendation?"
    );
    if (!confirmed) return;

    await api.deleteFertilizerRecord(recId, userId);
    loadHistory();
    if (recommendationResult?.saved_id === recId) {
      setRecommendationResult(null);
    }
  };

  // -------------------------------------------------------------
  // SPEECH SYNTHESIS ENGINE (Listen to Recommendation)
  // -------------------------------------------------------------
  // Listen for voices that load asynchronously using browser voice-loading events
  useEffect(() => {
    const unsubscribe = speechService.onVoicesLoaded((voices) => {
      const taVoice = speechService.getVoiceForLanguage('ta');
      if (taVoice) {
        console.log(`[TTS] Asynchronous voice loaded. Tamil voice ready: ${taVoice.name}`);
      }
    });

    return () => {
      unsubscribe();
      speechService.stopSpeaking();
    };
  }, []);

  const handleListenRecommendation = () => {
    setSpeechError(null);
    // Cancel existing speech before starting a new recommendation
    speechService.stopSpeaking();

    // Builds fully translated Tamil, Hindi, or English spoken text preserving exact quantities, units, and agronomic guidance
    const textToSpeak = getSpokenRecommendationText(recommendationResult, selectedLang);
    if (!textToSpeak) return;

    const started = speechService.speak(
      textToSpeak,
      selectedLang,
      () => setSpeechState('idle'),
      {
        onStart: () => {
          setSpeechState('playing');
          setSpeechError(null);
        },
        onPause: () => setSpeechState('paused'),
        onResume: () => setSpeechState('playing'),
        onError: (err) => {
          setSpeechState('idle');
          setSpeechError(
            err ||
              (selectedLang === 'ta'
                ? "குரல் வழி பரிந்துரையை இயக்குவதில் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்."
                : "Could not play fertilizer recommendation speech. Please try again.")
          );
        }
      }
    );

    if (!started) {
      setSpeechState('idle');
    }
  };

  const handlePauseSpeech = () => {
    speechService.pauseSpeaking();
    setSpeechState('paused');
  };

  const handleResumeSpeech = () => {
    speechService.resumeSpeaking();
    setSpeechState('playing');
  };

  const handleStopSpeech = () => {
    speechService.stopSpeaking();
    setSpeechState('idle');
  };

  // -------------------------------------------------------------
  // FOLLOW-UP TEXT ASSISTANT
  // -------------------------------------------------------------
  const handleSendAssistantQuery = async (queryText?: string) => {
    const q = (queryText || chatInput).trim();
    if (!q || !recommendationResult) return;

    setAssistantError(null);
    setChatInput('');

    // Append user message immediately
    const userMsg: ChatMessage = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);

    setIsAskingAssistant(true);
    try {
      const response = await api.askFertilizerAssistant(q, recommendationResult, selectedLang);
      const replyText = selectedLang === 'ta'
        ? response.reply_ta || response.reply_en
        : selectedLang === 'hi'
        ? response.reply_hi || response.reply_en
        : response.reply_en;

      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: replyText,
        topic: selectedLang === 'ta' ? response.topic_ta : selectedLang === 'hi' ? response.topic_hi : response.topic_en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Assistant reply failed", err);
      setAssistantError(
        isTa
          ? "உதவியாளரிடமிருந்து பதில் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
          : isHi
          ? "सहायक से उत्तर प्राप्त नहीं हो सका। पुनः प्रयास करें।"
          : "Could not retrieve answer from assistant. Please try again."
      );
    } finally {
      setIsAskingAssistant(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER COMPONENT
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 pb-36 text-slate-800">
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADING & LANGUAGE SELECTOR (Section A)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative leaf pattern */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-4 bottom-2 text-white/5 pointer-events-none select-none text-9xl font-black">
          🌱
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100 border border-white/20">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
              <span>TNAU & ICAR Scientific Schedules</span>
            </div>

            {/* Language Selector: English, Tamil, Hindi */}
            <div className="inline-flex items-center bg-black/30 backdrop-blur-md p-1 rounded-2xl border border-white/15">
              <button
                type="button"
                onClick={() => handleLangChange('en')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedLang === 'en'
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLangChange('ta')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedLang === 'ta'
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => handleLangChange('hi')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedLang === 'hi'
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              <span>FERTILIZER RECOMMENDATION</span>
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-2xl font-medium leading-relaxed">
              {isTa
                ? "பயிர் பருவம், நிலப்பரப்பளவு, மண் பரிசோதனை மற்றும் முந்தைய உர இடுதலைக் கருத்தில் கொண்ட துல்லிய அறிவியல் உரப் பரிந்துரை."
                : isHi
                ? "फसल चरण, खेत के आकार, मिट्टी जांच और पहले दी गई खाद पर आधारित सटीक वैज्ञानिक पोषक तत्व प्रबंधन।"
                : "Personalized NPK dosing, organic manure schedules, deficiency diagnosis, and budget-optimized application plans for your farm."}
            </p>
          </div>

          {/* Quick Stats or Previous History Badge */}
          {historyList.length > 0 && (
            <div className="pt-2 flex items-center justify-between border-t border-white/15">
              <button
                type="button"
                onClick={() => setShowHistorySection(!showHistorySection)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/15 transition-all"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-300" />
                <span>
                  {isTa
                    ? `முந்தைய பரிந்துரைகள் (${historyList.length})`
                    : isHi
                    ? `पिछली सिफारिशें (${historyList.length})`
                    : `Previous Recommendations (${historyList.length})`}
                </span>
                {showHistorySection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <span className="text-[11px] text-emerald-200/80 font-medium">
                Farmer: <strong className="text-white">{authUser?.full_name || farmProfile.farmer_name || 'Active Farmer'}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PREVIOUS RECOMMENDATIONS SECTION (Section G)
          ───────────────────────────────────────────────────────────── */}
      {showHistorySection && historyList.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>{isTa ? "உங்கள் சேமிக்கப்பட்ட உரப் பரிந்துரைகள்" : isHi ? "आपकी सहेजी गई उर्वरक सिफारिशें" : "Your Saved Fertilizer Recommendations"}</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {historyList.length} {isTa ? "பதிவுகள்" : isHi ? "रिकॉर्ड" : "records"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {historyList.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-50 hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200 transition-all flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-base">🌱</span>
                      <span>{isTa ? rec.crop_name_ta : isHi ? rec.crop_name_hi : rec.crop_name_en}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {rec.land_area} {rec.land_unit} • {rec.growth_stage} • {rec.soil_type}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ₹{rec.estimated_cost_inr?.toLocaleString() || rec.budget_inr?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {rec.created_at_formatted || 'Saved'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewSavedRecommendation(rec)}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1 transition-all shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isTa ? "விவரம் காண்க" : isHi ? "विवरण देखें" : "VIEW DETAILS"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSavedRecord(rec.id, e)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          THE 13 QUESTIONS FORM (Section B)
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-5">
        {/* Error Alert if validation or connection failed */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm animate-shake">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
            <button
              type="button"
              onClick={() => handleSubmitForm()}
              disabled={isSubmitting}
              className="shrink-0 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition-colors self-end sm:self-center"
            >
              {isTa ? "மீண்டும் முயற்சி செய்" : isHi ? "पुनः प्रयास करें" : "Retry"}
            </button>
          </div>
        )}

        {/* ── QUESTION 1: Crop Name ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
                1
              </span>
              <label className="text-sm font-bold text-slate-900">
                {isTa ? "நீங்கள் என்ன பயிர் சாகுபடி செய்கிறீர்கள்?" : isHi ? "आप कौन सी फसल उगा रहे हैं?" : "What crop are you growing?"}
              </label>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Required
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {COMMON_CROPS.map((c) => {
              const isSelected = !isCustomCrop && cropId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setIsCustomCrop(false);
                    setCropId(c.id);
                    setCropName(c.name_en);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30 font-bold'
                      : 'border-slate-200 hover:border-emerald-300 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xl mb-1">{c.icon}</span>
                  <span className="text-xs font-bold leading-tight">
                    {isTa ? c.name_ta : isHi ? c.name_hi : c.name_en}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCustomCrop}
                onChange={(e) => setIsCustomCrop(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>{isTa ? "பட்டியலில் இல்லாத பிற பயிர் (பெயரை தட்டச்சு செய்க)" : isHi ? "सूची में नहीं है (अन्य फसल का नाम लिखें)" : "Growing another crop? Enter custom crop name"}</span>
            </label>

            {isCustomCrop && (
              <input
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder={isTa ? "எ.கா: கத்தரி, வெண்டை, வெங்காயம்..." : isHi ? "उदा: बैंगन, भिंडी, प्याज..." : "e.g. Brinjal, Okra, Onion..."}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              />
            )}
          </div>
        </div>

        {/* ── QUESTION 2: Growth Stage ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
              2
            </span>
            <label className="text-sm font-bold text-slate-900">
              {isTa ? "உங்கள் பயிரின் தற்போதைய வளர்ச்சி நிலை என்ன?" : isHi ? "आपकी फसल की वर्तमान वृद्धि अवस्था क्या है?" : "What is the current growth stage of your crop?"}
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {getGrowthStageOptions(cropId).map((stg) => {
              const isSelected = growthStage.toLowerCase() === stg.toLowerCase();
              return (
                <button
                  key={stg}
                  type="button"
                  onClick={() => setGrowthStage(stg)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-700 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {stg}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── QUESTION 3: Cultivated Land Size ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
              3
            </span>
            <label className="text-sm font-bold text-slate-900">
              {isTa ? "உங்கள் சாகுபடி நிலத்தின் பரப்பளவு எவ்வளவு?" : isHi ? "आपके खेती योग्य खेत का आकार क्या है?" : "What is the size of your cultivated land?"}
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <input
                type="number"
                step="0.05"
                min="0.01"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                placeholder="1.0"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              />
            </div>
            <div>
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              >
                <option value="Acres">{isTa ? "ஏக்கர் (Acres)" : isHi ? "एकड़ (Acres)" : "Acres"}</option>
                <option value="Hectares">{isTa ? "ஹெக்டேர் (Hectares)" : isHi ? "हेक्टेयर (Hectares)" : "Hectares"}</option>
                <option value="Cents">{isTa ? "சென்ட் (Cents)" : isHi ? "सेंट (Cents)" : "Cents"}</option>
                <option value="Square metres">{isTa ? "சதுர மீட்டர் (Square metres)" : isHi ? "वर्ग मीटर (Square metres)" : "Square metres"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── QUESTION 4: Soil Type ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
              4
            </span>
            <label className="text-sm font-bold text-slate-900">
              {isTa ? "உங்கள் நிலத்தின் மண் வகை என்ன?" : isHi ? "आपके खेत की मिट्टी का प्रकार क्या है?" : "What type of soil do you have?"}
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {SOIL_TYPES.map((st) => {
              const isSelected = soilType === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSoilType(st.id)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {isTa ? st.label_ta : isHi ? st.label_hi : st.label_en}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── QUESTION 5: Have you tested your soil recently? ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
              5
            </span>
            <label className="text-sm font-bold text-slate-900">
              {isTa ? "சமீபத்தில் மண் பரிசோதனை செய்துள்ளீர்களா?" : isHi ? "क्या आपने हाल ही में मिट्टी परीक्षण कराया है?" : "Have you tested your soil recently?"}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setSoilTested(true)}
              className={`p-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                soilTested
                  ? 'border-emerald-600 bg-emerald-700 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isTa ? "ஆம் (Yes)" : isHi ? "हाँ (Yes)" : "Yes"}</span>
            </button>
            <button
              type="button"
              onClick={() => setSoilTested(false)}
              className={`p-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                !soilTested
                  ? 'border-emerald-600 bg-emerald-700 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{isTa ? "இல்லை (No)" : isHi ? "नहीं (No)" : "No"}</span>
            </button>
          </div>
        </div>

        {/* ── QUESTION 6: Soil pH and NPK levels (Optional) ── */}
        <div className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all space-y-3 ${
          soilTested ? 'border-emerald-400 ring-2 ring-emerald-500/10 shadow-sm' : 'border-slate-200 opacity-90'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
                6
              </span>
              <div>
                <label className="text-sm font-bold text-slate-900 block">
                  {isTa ? "மண்ணின் pH மற்றும் NPK அளவுகள் (இருந்தால் குறிப்பிடவும்):" : isHi ? "मिट्टी का pH और NPK स्तर (यदि उपलब्ध हो):" : "What are the soil pH and NPK levels, if available?"}
                </label>
                <p className="text-[11px] text-slate-500">
                  {soilTested
                    ? (isTa ? "மண் பரிசோதனை அட்டையிலுள்ள அளவுகளை உள்ளிடவும்." : isHi ? "मृदा स्वास्थ्य कार्ड से विवरण दर्ज करें।" : "Enter numbers/levels from your Soil Health Card.")
                    : (isTa ? "விருப்பத்திற்குரியது: மண் பரிசோதனை செய்யவில்லை எனில் காலியாக விடலாம்." : isHi ? "वैकल्पिक: यदि जांच रिपोर्ट नहीं है तो खाली छोड़ दें।" : "Optional: Leave blank if you do not have soil-test results.")}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Optional
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Soil pH
              </label>
              <input
                type="number"
                step="0.1"
                min="3.0"
                max="10.0"
                value={soilPh}
                onChange={(e) => setSoilPh(e.target.value)}
                placeholder="e.g. 6.5"
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Nitrogen (N)
              </label>
              <input
                type="text"
                value={soilN}
                onChange={(e) => setSoilN(e.target.value)}
                placeholder="Low / Med / High"
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Phosphorus (P)
              </label>
              <input
                type="text"
                value={soilP}
                onChange={(e) => setSoilP(e.target.value)}
                placeholder="Low / Med / High"
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Potassium (K)
              </label>
              <input
                type="text"
                value={soilK}
                onChange={(e) => setSoilK(e.target.value)}
                placeholder="Low / Med / High"
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* ── QUESTION 7: Have you already applied any fertilizer? ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
              7
            </span>
            <label className="text-sm font-bold text-slate-900">
              {isTa ? "ஏற்கனவே ஏதேனும் உரம் இட்டுள்ளீர்களா?" : isHi ? "क्या आपने पहले ही कोई खाद डाली है?" : "Have you already applied any fertilizer?"}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setAlreadyApplied(true)}
              className={`p-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                alreadyApplied
                  ? 'border-emerald-600 bg-emerald-700 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isTa ? "ஆம் (Yes)" : isHi ? "हाँ (Yes)" : "Yes"}</span>
            </button>
            <button
              type="button"
              onClick={() => setAlreadyApplied(false)}
              className={`p-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                !alreadyApplied
                  ? 'border-emerald-600 bg-emerald-700 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{isTa ? "இல்லை (No)" : isHi ? "नहीं (No)" : "No"}</span>
            </button>
          </div>
        </div>

        {/* ── QUESTION 8: Which fertilizers applied and in what quantities? ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
                8
              </span>
              <div>
                <label className="text-sm font-bold text-slate-900 block">
                  {isTa ? "எந்தெந்த உரங்களை எவ்வளவு அளவில் இட்டுள்ளீர்கள்?" : isHi ? "आपने कौन सी खाद और कितनी मात्रा में डाली है?" : "Which fertilizers have you applied, and in what quantities?"}
                </label>
                <p className="text-[11px] text-slate-500">
                  {alreadyApplied
                    ? (isTa ? "அதிகப்படியான அல்லது இரட்டிப்பு உரத்தைத் தவிர்க்க இவை கணக்கில் கொள்ளப்படும்." : isHi ? "ताकि जरूरत से ज्यादा खाद डालने से बचा जा सके।" : "Prevents duplicate or excessive fertilizer application.")
                    : (isTa ? "உரம் இடவில்லை எனில் இப்பகுதியை தவிர்க்கலாம்." : isHi ? "यदि खाद नहीं डाली है तो इसे छोड़ सकते हैं।" : "If no fertilizer has been applied, you may skip these fields.")}
                </p>
              </div>
            </div>
          </div>

          {alreadyApplied ? (
            <div className="space-y-3 pt-1">
              {appliedFertilizers.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Fertilizer Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateAppliedFertilizer(idx, 'name', e.target.value)}
                      placeholder="e.g. Urea, DAP, MOP"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Quantity</label>
                    <input
                      type="number"
                      step="1"
                      value={item.quantity_kg}
                      onChange={(e) => handleUpdateAppliedFertilizer(idx, 'quantity_kg', parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Unit</label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleUpdateAppliedFertilizer(idx, 'unit', e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                    >
                      <option value="kg">kg</option>
                      <option value="bags">bags</option>
                      <option value="tonnes">tonnes</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Date / Days Ago</label>
                    <input
                      type="text"
                      value={item.date_or_days_ago || ''}
                      onChange={(e) => handleUpdateAppliedFertilizer(idx, 'date_or_days_ago', e.target.value)}
                      placeholder="10 days ago"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    {appliedFertilizers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAppliedFertilizer(idx)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddAppliedFertilizer}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isTa ? "+ மற்றொரு உரத்தைச் சேர்க்க" : isHi ? "+ एक और खाद जोड़ें" : "+ Add Another Fertilizer"}</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 italic">
              ℹ️ {isTa ? "முன்னர் உரங்கள் எதுவும் இடப்படவில்லை என தேர்வு செய்துள்ளீர்கள் (தவிர்க்கப்பட்டது)." : isHi ? "पहले कोई खाद नहीं डाली गई है (छोड़ा गया)।" : "No prior fertilizers recorded; baseline nutritional schedule will be provided without deductions."}
            </div>
          )}
        </div>

        {/* ── QUESTION 9: Irrigation Method ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
              9
            </span>
            <label className="text-sm font-bold text-slate-900">
              {isTa ? "நீங்கள் எந்த பாசன முறையைப் பயன்படுத்துகிறீர்கள்?" : isHi ? "आप किस सिंचाई विधि का उपयोग करते हैं?" : "What irrigation method do you use?"}
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {IRRIGATION_METHODS.map((im) => {
              const isSelected = irrigationMethod === im.id;
              return (
                <button
                  key={im.id}
                  type="button"
                  onClick={() => setIrrigationMethod(im.id)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {isTa ? im.label_ta : isHi ? im.label_hi : im.label_en}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── QUESTION 10: Plant Problems ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
              10
            </span>
            <div>
              <label className="text-sm font-bold text-slate-900 block">
                {isTa ? "செடிகளில் ஏதேனும் குறைபாடுகளை கவனிக்கிறீர்களா?" : isHi ? "क्या आपको पौधों में कोई समस्या या लक्षण दिख रहे हैं?" : "Are you noticing any problems with your plants?"}
              </label>
              <p className="text-[11px] text-slate-500">
                {isTa ? "ஒன்றுக்கும் மேற்பட்டவற்றைத் தேர்வு செய்யலாம்" : isHi ? "एक से अधिक चुन सकते हैं" : "Select all that apply"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {PLANT_PROBLEM_OPTIONS.map((prob) => {
              const isSelected = plantProblems.includes(prob.id);
              return (
                <button
                  key={prob.id}
                  type="button"
                  onClick={() => handleToggleProblem(prob.id)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center gap-2 ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center text-[10px] ${
                    isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && "✓"}
                  </span>
                  <span>{isTa ? prob.label_ta : isHi ? prob.label_hi : prob.label_en}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              {isTa ? "கூடுதல் அறிகுறிகளை விவரிக்கவும் (விருப்பம்):" : isHi ? "अतिरिक्त लक्षणों का विवरण (वैकल्पिक):" : "Describe additional symptoms (Optional):"}
            </label>
            <input
              type="text"
              value={symptomDescription}
              onChange={(e) => setSymptomDescription(e.target.value)}
              placeholder={isTa ? "எ.கா: இலை நுனி கருகல், அடிப்பகுதி இலைகள் விழுதல்..." : isHi ? "उदा: पत्तियों के किनारे सूखना, निचली पत्तियां गिरना..." : "e.g. leaf tip scorch, lower leaf drop..."}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
            />
          </div>
        </div>

        {/* ── QUESTION 11: Fertilizer Preference ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
              11
            </span>
            <label className="text-sm font-bold text-slate-900">
              {isTa ? "இயற்கை உரங்களை விரும்புகிறீர்களா, ரசாயன உரங்களா, அல்லது இரண்டையுமா?" : isHi ? "आप जैविक खाद पसंद करते हैं, रासायनिक, या दोनों?" : "Do you prefer organic fertilizers, chemical fertilizers, or both?"}
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {FERTILIZER_PREFERENCES.map((pref) => {
              const isSelected = fertilizerPreference === pref.id;
              return (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => setFertilizerPreference(pref.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">
                      {isTa ? pref.title_ta : isHi ? pref.title_hi : pref.title_en}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {isTa ? pref.desc_ta : isHi ? pref.desc_hi : pref.desc_en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── QUESTION 12: Crop Age / Planting Date ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
              12
            </span>
            <label className="text-sm font-bold text-slate-900">
              {isTa ? "பயிரை நட்டு அல்லது விதைத்து எத்தனை நாட்கள் ஆகின்றன?" : isHi ? "फसल की बुवाई/रोपाई किए कितने दिन हो चुके हैं?" : "How long ago did you plant the crop?"}
            </label>
          </div>

          <div className="flex items-center gap-3 pt-1 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer font-bold">
              <input
                type="radio"
                name="plantingMode"
                checked={plantingTimingMode === 'days'}
                onChange={() => setPlantingTimingMode('days')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>{isTa ? "நாட்களின் எண்ணிக்கை" : isHi ? "दिनों की संख्या" : "Number of Days"}</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-bold">
              <input
                type="radio"
                name="plantingMode"
                checked={plantingTimingMode === 'date'}
                onChange={() => setPlantingTimingMode('date')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>{isTa ? "விதைத்த / நட்ட தேதி" : isHi ? "बुवाई की तारीख" : "Planting Date"}</span>
            </label>
          </div>

          <div className="pt-1">
            {plantingTimingMode === 'days' ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="400"
                  value={cropAgeDays}
                  onChange={(e) => setCropAgeDays(e.target.value)}
                  placeholder="30"
                  className="w-full sm:w-48 text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                />
                <span className="text-xs font-bold text-slate-600">{isTa ? "நாட்கள்" : isHi ? "दिन" : "days since planting"}</span>
              </div>
            ) : (
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full sm:w-64 text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              />
            )}
          </div>
        </div>

        {/* ── QUESTION 13: Fertilizer Budget ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
              13
            </span>
            <label className="text-sm font-bold text-slate-900">
              {isTa ? "உங்கள் உத்தேச உர பட்ஜெட் எவ்வளவு?" : isHi ? "आपका अनुमानित उर्वरक बजट क्या है?" : "What is your approximate fertilizer budget?"}
            </label>
          </div>

          <div className="space-y-2 pt-1">
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                step="100"
                min="100"
                value={fertilizerBudget}
                onChange={(e) => setFertilizerBudget(e.target.value)}
                placeholder="2000"
                className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-bold"
              />
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-2 pt-1">
              {['2000', '5000', '10000', '20000'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFertilizerBudget(preset)}
                  className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                >
                  ₹{parseInt(preset).toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            SUBMIT BUTTON (Section C)
            ───────────────────────────────────────────────────────────── */}
        <div className="pt-2">
          <button
            id="get-fertilizer-recommendation-btn"
            type="button"
            onClick={() => handleSubmitForm()}
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2.5 ${
              isSubmitting
                ? 'bg-emerald-800 opacity-80 cursor-wait'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] shadow-emerald-700/25'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>
                  {isTa
                    ? "உர பரிந்துரை கணக்கிடப்படுகிறது..."
                    : isHi
                    ? "उर्वरक सिफारिश तैयार हो रही है..."
                    : "GENERATING RECOMMENDATION..."}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>
                  {isTa
                    ? "உரப் பரிந்துரை பெறுக"
                    : isHi
                    ? "उर्वरक अनुशंसा प्राप्त करें"
                    : "GET FERTILIZER RECOMMENDATION"}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RESULTS SECTION: SUBMITTED INFO + AI RECOMMENDATION (Section D)
          ───────────────────────────────────────────────────────────── */}
      {recommendationResult && (
        <div ref={resultsRef} id="fertilizer-recommendation-results" className="space-y-6 pt-4 border-t-2 border-emerald-600/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <FlaskConical className="w-7 h-7 text-emerald-700" />
              <span>YOUR FERTILIZER RECOMMENDATION</span>
            </h2>

            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
            >
              {isTa ? "படிவத்தை மாற்றுக" : isHi ? "प्रश्नावली बदलें" : "Edit Inputs"}
            </button>
          </div>

          {/* ──────────────── Section 1: Your Submitted Information ──────────────── */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isTa ? "பிரிவு 1: நீங்கள் அளித்த பண்ணை தகவல்கள்" : isHi ? "खंड 1: आपके द्वारा दी गई जानकारी" : "Section 1: Your Submitted Information"}</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                Verified Inputs
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-medium mb-0.5">Crop Name</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  🌱 {submittedAnswers?.crop_name || recommendationResult?.crop_info?.name_en}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-medium mb-0.5">Growth Stage</span>
                <span className="font-bold text-slate-900">
                  {submittedAnswers?.growth_stage || recommendationResult?.crop_info?.growth_stage}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-medium mb-0.5">Cultivated Land Size</span>
                <span className="font-bold text-slate-900">
                  {submittedAnswers?.land_area || recommendationResult?.crop_info?.land_area} {submittedAnswers?.land_unit || recommendationResult?.crop_info?.land_unit}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-medium mb-0.5">Soil Type</span>
                <span className="font-bold text-slate-900">
                  {submittedAnswers?.soil_type || recommendationResult?.crop_info?.soil_type}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-medium mb-0.5">Soil Test Results</span>
                <span className="font-bold text-slate-900">
                  {submittedAnswers?.soil_tested
                    ? `pH: ${submittedAnswers.soil_ph || 'Normal'} | NPK: ${submittedAnswers.soil_nitrogen || '-'}/${submittedAnswers.soil_phosphorus || '-'}/${submittedAnswers.soil_potassium || '-'}`
                    : (isTa ? "பரிசோதனை செய்யப்படவில்லை" : isHi ? "परीक्षण नहीं हुआ" : "Not Tested")}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-medium mb-0.5">Irrigation Method</span>
                <span className="font-bold text-slate-900">
                  {submittedAnswers?.irrigation_method || recommendationResult?.crop_info?.irrigation_method}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-medium mb-0.5">Fertilizers Already Applied</span>
                <span className="font-bold text-slate-900">
                  {submittedAnswers?.already_applied && submittedAnswers?.applied_fertilizers?.length > 0
                    ? submittedAnswers.applied_fertilizers.map((a: any) => `${a.name} (${a.quantity_kg}kg)`).join(', ')
                    : (isTa ? "ஏதுமில்லை" : isHi ? "कोई नहीं" : "None")}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-medium mb-0.5">Reported Plant Problems</span>
                <span className="font-bold text-slate-900">
                  {submittedAnswers?.plant_problems?.length > 0
                    ? submittedAnswers.plant_problems.join(', ')
                    : (isTa ? "பிரச்சனைகள் இல்லை" : isHi ? "कोई समस्या नहीं" : "No problems")}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-medium mb-0.5">Budget vs Stated</span>
                <span className="font-extrabold text-emerald-800">
                  ₹{submittedAnswers?.fertilizer_budget_inr?.toLocaleString() || recommendationResult?.cost_analysis?.budget_inr?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* ──────────────── Section 2: AI-Generated Fertilizer Recommendation ──────────────── */}
          <div className="space-y-4">
            {/* Deductions banner if previous fertilizers were deducted */}
            {recommendationResult.deductions_applied?.has_deductions && (
              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>{isTa ? "முந்தைய உரம் காரணமாக சத்துக்கள் கழிக்கப்பட்டன:" : isHi ? "पहले दी गई खाद के कारण कटौती:" : "Nutrient Deductions Applied:"}</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                  {(isTa ? recommendationResult.deductions_applied.notes_ta : isHi ? recommendationResult.deductions_applied.notes_hi : recommendationResult.deductions_applied.notes_en).map((note: string, idx: number) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Active Recommended Fertilizers List */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-700" />
                    <span>{isTa ? "பரிந்துரைக்கப்படும் உரங்கள் & அளவுகள்" : isHi ? "अनुशंसित उर्वरक और खुराक" : "Recommended Fertilizer Plan & Quantities"}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preference: <strong>{recommendationResult.preference}</strong>
                  </p>
                </div>
                <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 font-extrabold px-3 py-1 rounded-xl text-xs">
                  Area: {recommendationResult.crop_info?.land_area} {recommendationResult.crop_info?.land_unit}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(recommendationResult.active_plan_items || []).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {isTa ? item.fertilizer_name_ta : isHi ? item.fertilizer_name_hi : item.fertilizer_name_en}
                        </h4>
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg shrink-0">
                          {item.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {isTa ? item.purpose_ta : isHi ? item.purpose_hi : item.purpose_en}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        ⏱️ {isTa ? item.timing_ta : isHi ? item.timing_hi : item.timing_en}
                      </span>
                      <span className="font-extrabold text-slate-800">
                        ₹{item.estimated_cost_inr?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage-wise Application Schedule */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>{isTa ? "பயிரின் வளர்ச்சிப் பருவ உர அட்டவணை" : isHi ? "अवस्था-वार खाद देने का कार्यक्रम" : "Stage-Wise Split Application Schedule"}</span>
              </h3>

              <div className="space-y-3">
                {(recommendationResult.schedule || []).map((sch: any, idx: number) => (
                  <div key={idx} className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-emerald-950 font-black text-sm">
                        {isTa ? sch.stage_ta : isHi ? sch.stage_hi : sch.stage_en}
                      </span>
                      <span className="text-emerald-800 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                        {isTa ? sch.timing_ta : isHi ? sch.timing_hi : sch.timing_en}
                      </span>
                    </div>
                    {sch.chemical_action_en && (
                      <p className="text-slate-700">
                        <strong className="text-emerald-900">{isTa ? "உர அளவு:" : isHi ? "रासायनिक खुराक:" : "Chemical:"}</strong> {isTa ? sch.chemical_action_ta : isHi ? sch.chemical_action_hi : sch.chemical_action_en}
                      </p>
                    )}
                    {sch.organic_action_en && (
                      <p className="text-slate-700">
                        <strong className="text-emerald-900">{isTa ? "இயற்கை:" : isHi ? "जैविक खुराक:" : "Organic:"}</strong> {isTa ? sch.organic_action_ta : isHi ? sch.organic_action_hi : sch.organic_action_en}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cost and Budget Analysis */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>{isTa ? "செலவு மற்றும் பட்ஜெட் பகுப்பாய்வு" : isHi ? "लागत और बजट विश्लेषण" : "Cost and Budget Analysis"}</span>
                </h3>
                <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                  recommendationResult.cost_analysis?.is_within_budget
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-amber-100 text-amber-950'
                }`}>
                  {recommendationResult.cost_analysis?.is_within_budget ? "Within Budget" : "Exceeds Budget"}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                {isTa
                  ? recommendationResult.cost_analysis?.comparison_ta
                  : isHi
                  ? recommendationResult.cost_analysis?.comparison_hi
                  : recommendationResult.cost_analysis?.comparison_en}
              </div>

              {/* Budget alternatives if over budget */}
              {!recommendationResult.cost_analysis?.is_within_budget && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-slate-700 block">
                    {isTa ? "செலவைக் குறைப்பதற்கான மாற்று வழிகள்:" : isHi ? "लागत घटाने के किफायती उपाय:" : "Budget-Friendly Alternatives:"}
                  </span>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                    {(isTa ? recommendationResult.cost_analysis?.budget_alternatives_ta : isHi ? recommendationResult.cost_analysis?.budget_alternatives_hi : recommendationResult.cost_analysis?.budget_alternatives_en || []).map((alt: string, i: number) => (
                      <li key={i}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Important Precautions */}
            <div className="bg-amber-50/60 rounded-3xl p-5 sm:p-6 border border-amber-200/80 space-y-2.5">
              <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>{isTa ? "முக்கிய பாதுகாப்பு எச்சரிக்கைகள்" : isHi ? "महत्वपूर्ण सावधानियां" : "Important Agricultural Precautions"}</span>
              </h3>
              <ul className="list-disc list-inside text-xs text-amber-950/90 space-y-1 leading-relaxed pl-1">
                {(isTa ? recommendationResult.precautions_ta : isHi ? recommendationResult.precautions_hi : recommendationResult.precautions_en || []).map((prec: string, idx: number) => (
                  <li key={idx}>{prec}</li>
                ))}
              </ul>
              <div className="pt-2 text-[11px] text-slate-500 italic border-t border-amber-200/60">
                Official Reference: {recommendationResult.reference || "Tamil Nadu Agricultural University (TNAU) Agritech Portal"}
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                AI ASSISTANT TO READ THE RECOMMENDATION (Section E)
                ───────────────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-5 h-5 text-emerald-300" />
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    {isTa ? "பரிந்துரையைக் கேட்க" : isHi ? "सिफारिश सुनें (AI वाइस)" : "LISTEN TO RECOMMENDATION"}
                  </h3>
                </div>

                {/* In-Recommendation Language Selector */}
                <div className="inline-flex items-center bg-black/40 p-1 rounded-xl border border-white/20 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleLangChange('en')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedLang === 'en' ? 'bg-white text-emerald-950 shadow-xs' : 'text-white/80'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLangChange('ta')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedLang === 'ta' ? 'bg-white text-emerald-950 shadow-xs' : 'text-white/80'
                    }`}
                  >
                    தமிழ்
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLangChange('hi')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedLang === 'hi' ? 'bg-white text-emerald-950 shadow-xs' : 'text-white/80'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              <p className="text-xs text-emerald-100/90 leading-relaxed">
                {isTa
                  ? "மேலே திரையில் காட்டப்பட்டுள்ள உங்கள் பயிருக்கான உண்மையான உரப் பரிந்துரையை தேர்ந்தெடுக்கப்பட்ட மொழியில் குரல் வழியே கேட்கலாம்."
                  : isHi
                  ? "स्क्रीन पर प्रदर्शित आपकी वास्तविक उर्वरक सिफारिश को चुनी गई भाषा में आवाज के रूप में सुनें।"
                  : "Click below to listen to the actual generated fertilizer recommendation in your selected language."}
              </p>

              {/* Speech Controls: Listen, Pause, Resume, Stop */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {speechState === 'idle' && (
                  <button
                    type="button"
                    onClick={handleListenRecommendation}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isTa ? "பரிந்துரையைக் கேட்க" : isHi ? "सिफारिश सुनें" : "LISTEN TO RECOMMENDATION"}</span>
                  </button>
                )}

                {speechState === 'playing' && (
                  <>
                    <button
                      type="button"
                      onClick={handlePauseSpeech}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                      <Pause className="w-4 h-4 fill-current" />
                      <span>{isTa ? "இடைநிறுத்து" : isHi ? "रोकें (Pause)" : "PAUSE"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStopSpeech}
                      className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
                    >
                      <VolumeX className="w-4 h-4" />
                      <span>{isTa ? "நிறுத்து" : isHi ? "समाप्त करें" : "STOP"}</span>
                    </button>
                  </>
                )}

                {speechState === 'paused' && (
                  <>
                    <button
                      type="button"
                      onClick={handleResumeSpeech}
                      className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isTa ? "தொடர்க" : isHi ? "पुनः चलाएं" : "RESUME"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStopSpeech}
                      className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
                    >
                      <VolumeX className="w-4 h-4" />
                      <span>{isTa ? "நிறுத்து" : isHi ? "समाप्त करें" : "STOP"}</span>
                    </button>
                  </>
                )}
              </div>

              {/* Speech Error Banner */}
              {speechError && (
                <div className="p-3 bg-red-900/60 border border-red-500/50 rounded-xl text-white text-xs flex items-center justify-between gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-4 h-4 text-red-300 shrink-0" />
                    <span className="font-medium">{speechError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleListenRecommendation}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[11px] shrink-0 transition-colors"
                  >
                    {isTa ? 'மீண்டும் முயற்சிக்க' : isHi ? 'पुनः प्रयास करें' : 'Retry'}
                  </button>
                </div>
              )}
            </div>

            {/* ─────────────────────────────────────────────────────────────
                FOLLOW-UP QUESTION TEXT BAR (Section F)
                ───────────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    ASK YOUR FERTILIZER ASSISTANT
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                  Active Context: {recommendationResult.crop_info?.name_en}
                </span>
              </div>

              {/* Suggested Questions Quick Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500">
                  {isTa ? "சுலபமாக கேட்க பரிந்துரைக்கப்படும் கேள்விகள்:" : isHi ? "सुझाए गए प्रश्न:" : "Quick Suggested Questions:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    isTa ? "இந்த உரம் ஏன் பரிந்துரைக்கப்பட்டது?" : isHi ? "यह खाद क्यों सुझाई गई है?" : "Why is this fertilizer recommended?",
                    isTa ? "இது என் பயிருக்கு எவ்வாறு பொருத்தமானது?" : isHi ? "यह मेरी फसल के लिए कैसे उपयुक्त है?" : "Why is this fertilizer suitable for my crop?",
                    isTa ? "இதை எப்போது இட வேண்டும்?" : isHi ? "इसे कब डालना चाहिए?" : "When should I apply it?",
                    isTa ? "NPK என்றால் என்ன?" : isHi ? "NPK का क्या अर्थ है?" : "What does NPK mean?",
                    isTa ? "பட்ஜெட்டுக்கு இது எப்படி பொருந்தும்?" : isHi ? "यह बजट में कैसे बैठेगा?" : "How does this recommendation fit my budget?",
                    isTa ? "தமிழில் விளக்கம் தருக" : isHi ? "हिंदी में समझाएं" : "Can you explain this recommendation in Tamil?"
                  ].map((chipPrompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendAssistantQuery(chipPrompt)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 rounded-lg text-[11px] font-medium border border-slate-200 transition-colors"
                    >
                      {chipPrompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Thread */}
              {chatMessages.length > 0 && (
                <div className="space-y-3 pt-2 max-h-80 overflow-y-auto pr-1">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-emerald-700 text-white rounded-br-xs shadow-xs font-medium'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs'
                      }`}>
                        {msg.topic && (
                          <div className="text-[10px] font-bold text-emerald-800 uppercase mb-1">
                            {msg.topic}
                          </div>
                        )}
                        <div>{msg.text}</div>
                        <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Loading Indicator */}
              {isAskingAssistant && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold p-2 bg-emerald-50 rounded-xl animate-pulse">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {isTa
                      ? "உர உதவியாளர் பதிலளிக்கிறது..."
                      : isHi
                      ? "उर्वरक सहायक सोच रहा है..."
                      : "Fertilizer assistant is generating explanation..."}
                  </span>
                </div>
              )}

              {/* Assistant Error Message */}
              {assistantError && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  {assistantError}
                </div>
              )}

              {/* Text Input & Send */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendAssistantQuery();
                    }
                  }}
                  placeholder={isTa ? "உங்கள் உரப் பரிந்துரை குறித்த எந்த சந்தேகத்தையும் கேளுங்கள்..." : isHi ? "अपनी उर्वरक सिफारिश के बारे में कोई भी प्रश्न पूछें..." : "Ask any doubt about your fertilizer recommendation..."}
                  className="flex-1 text-xs sm:text-sm p-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => handleSendAssistantQuery()}
                  disabled={!chatInput.trim() || isAskingAssistant}
                  className="p-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl shadow-xs transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
