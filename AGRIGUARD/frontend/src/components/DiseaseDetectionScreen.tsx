import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Upload, RefreshCw, CheckCircle2, AlertTriangle,
  Info, ShieldCheck, Trash2, ChevronRight, FileText, HelpCircle,
  Volume2, VolumeX, Pause, Play, Square, Send, Mic, MicOff,
  Leaf, FlaskConical, Calendar, Clock, Sparkles, Droplets,
  Layers, AlertCircle, X, ExternalLink, ShieldAlert, Check,
  ArrowRight, Shield, Stethoscope, Sprout
} from 'lucide-react';
import {
  Language,
  DiseaseDetectionResult,
  DetectionRecord,
  FarmProfile,
  SoilRequirements,
  DiseaseCauses,
  OrganicTreatmentPlan,
  ChemicalTreatmentPlan
} from '../types';
import { translations } from '../i18n';
import { api } from '../services/api';
import { speechService } from '../services/speech';
import { calculateTreatmentDosage, getEnrichedDiseaseData } from '../services/diseaseKnowledge';
import { buildDiseaseSpokenText } from '../services/spokenContentBuilder';

interface DiseaseDetectionScreenProps {
  language: Language;
  farmProfile: FarmProfile;
  detectionHistory: DetectionRecord[];
  onHistoryUpdated: () => void;
  initialSelectedScan?: DetectionRecord | null;
  onClearInitialSelectedScan?: () => void;
  onSetLanguage?: (lang: Language) => void;
}

interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface DiseaseResultErrorBoundaryProps {
  language: Language;
  children: React.ReactNode;
}

class DiseaseResultErrorBoundary extends React.Component<
  DiseaseResultErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Disease result rendering error', error, info);
  }

  render() {
    if (this.state.hasError) {
      const message = this.props.language === 'ta'
        ? 'கணிப்பு முடிவைக் காட்ட முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது தெளிவான படத்தைப் பதிவேற்றவும்.'
        : this.props.language === 'hi'
        ? 'निदान परिणाम नहीं दिखाया जा सका। कृपया पुनः प्रयास करें या स्पष्ट छवि अपलोड करें।'
        : 'The prediction result could not be displayed. Please try again or upload a clear image.';

      return (
        <div role="alert" className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          {message}
        </div>
      );
    }

    return this.props.children;
  }
}

function safeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

const MODEL_SUPPORTED_CROPS = new Set([
  'apple', 'blueberry', 'cherry', 'chilli', 'corn', 'grape', 'orange', 'peach',
  'potato', 'raspberry', 'soybean', 'squash', 'strawberry', 'tomato'
]);

export const DiseaseDetectionScreen: React.FC<DiseaseDetectionScreenProps> = ({
  language,
  farmProfile,
  detectionHistory,
  onHistoryUpdated,
  initialSelectedScan,
  onClearInitialSelectedScan,
  onSetLanguage
}) => {
  const t = translations[language] || translations.en;
  const isTa = language === 'ta';
  const isHi = language === 'hi';

  // File and Camera state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
  const topPredictions = Array.isArray(result?.top_predictions)
    ? result.top_predictions.filter((prediction) =>
        prediction &&
        typeof prediction.crop_name === 'string' &&
        typeof prediction.disease_name === 'string' &&
        typeof prediction.percentage === 'number'
      )
    : [];
  const commonSymptoms = safeStringArray(
    isTa ? result?.common_symptoms_ta : isHi ? result?.common_symptoms_hi || result?.common_symptoms_en : result?.common_symptoms_en
  );
  const suitableSoils = safeStringArray(
    isTa ? result?.soil_info?.suitable_soils_ta : isHi ? result?.soil_info?.suitable_soils_hi : result?.soil_info?.suitable_soils_en
  );
  const primaryCauses = safeStringArray(
    isTa ? result?.causes_info?.primary_causes_ta : isHi ? result?.causes_info?.primary_causes_hi : result?.causes_info?.primary_causes_en
  );
  const organicPrecautions = safeStringArray(
    isTa ? result?.organic_treatment?.precautions_ta : isHi ? result?.organic_treatment?.precautions_hi : result?.organic_treatment?.precautions_en
  );
  const chemicalPpe = safeStringArray(
    isTa ? result?.chemical_treatment?.ppe_required_ta : isHi ? result?.chemical_treatment?.ppe_required_hi : result?.chemical_treatment?.ppe_required_en
  );
  const chemicalPrecautions = safeStringArray(
    isTa ? result?.chemical_treatment?.precautions_ta : isHi ? result?.chemical_treatment?.precautions_hi : result?.chemical_treatment?.precautions_en
  );

  // Treatment State
  const [treatmentPreference, setTreatmentPreference] = useState<'organic' | 'chemical'>('organic');
  const [farmSize, setFarmSize] = useState<number>(() => {
    return farmProfile.acreage && farmProfile.acreage > 0 ? farmProfile.acreage : 1;
  });
  const [farmSizeUnit, setFarmSizeUnit] = useState<'acres' | 'hectares' | 'sqm'>('acres');

  // Speech State
  const [speechLang, setSpeechLang] = useState<Language>(language);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Assistant State
  const [assistantQuery, setAssistantQuery] = useState<string>('');
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);
  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
  const [autoDetectCrop, setAutoDetectCrop] = useState<boolean>(true);
  const [selectedCropId, setSelectedCropId] = useState<string>(() => farmProfile.active_crop_id || farmProfile.crops[0]?.crop_id || '');

  // DOM Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCrop = farmProfile.crops.find(c => c.crop_id === farmProfile.active_crop_id) || farmProfile.crops[0];

  // Sync speech language when global language changes
  useEffect(() => {
    setSpeechLang(language);
  }, [language]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Load initialSelectedScan when provided from HomeScreen or History
  useEffect(() => {
    if (initialSelectedScan) {
      loadScanRecord(initialSelectedScan);
    }
  }, [initialSelectedScan]);

  const loadScanRecord = (record: DetectionRecord) => {
    // If full_result was saved, use it; otherwise enrich from knowledge base
    let fullRes = record.full_result;
    if (!fullRes || !fullRes.soil_info) {
      const enriched = getEnrichedDiseaseData(record.crop_id, record.full_result?.disease_id || record.disease_id || record.condition_title_en);
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
    }

    setResult(fullRes);
    if (record.image_preview_url) {
      setPreviewUrl(record.image_preview_url);
    }
    setSelectedFile(null);
    setAnalysisError(null);

    // Scroll smoothly to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const acceptedExtension = /\.(jpe?g|png|webp)$/i.test(file.name);
      const isSupportedType = acceptedTypes.includes(file.type.toLowerCase()) || acceptedExtension;
      const validationError = !isSupportedType
        ? (isTa ? 'JPEG, PNG அல்லது WEBP படத்தைத் தேர்ந்தெடுக்கவும்.' : isHi ? 'कृपया JPEG, PNG या WEBP छवि चुनें।' : 'Choose a JPEG, PNG, or WEBP image.')
        : file.size < 3 * 1024
        ? (isTa ? 'படக் கோப்பு மிகவும் சிறியது. குறைந்தது 3 KB அளவுள்ள தெளிவான படத்தைத் தேர்ந்தெடுக்கவும்.' : isHi ? 'छवि फ़ाइल बहुत छोटी है। कम से कम 3 KB की स्पष्ट छवि चुनें।' : 'The image is too small. Choose a clear image of at least 3 KB.')
        : file.size > 15 * 1024 * 1024
        ? (isTa ? 'படக் கோப்பு 15 MB-ஐ விட அதிகம். சிறிய படத்தைத் தேர்ந்தெடுக்கவும்.' : isHi ? 'छवि फ़ाइल 15 MB से बड़ी है। छोटी छवि चुनें।' : 'The image exceeds the 15 MB limit. Choose a smaller image.')
        : null;

      if (validationError) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        setAnalysisError(validationError);
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setAnalysisError(null);
      speechService.stopSpeaking();
      setIsSpeaking(false);
      setIsPaused(false);
      if (onClearInitialSelectedScan) {
        onClearInitialSelectedScan();
      }
    }
  };

  // Clear / Remove image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setAnalysisError(null);
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (onClearInitialSelectedScan) {
      onClearInitialSelectedScan();
    }
  };

  // Run AI Disease Identification
  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      setAnalysisError(t.detect_no_image_warning);
      return;
    }
    if (!autoDetectCrop && !selectedCropId) {
      setAnalysisError(
        isTa
          ? 'முதலில் பயிரைத் தேர்ந்தெடுக்கவும்.'
          : isHi
          ? 'पहले फसल चुनें।'
          : 'Select a crop before starting identification.'
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setResult(null);
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);

    try {
      const cropHint = !autoDetectCrop || !MODEL_SUPPORTED_CROPS.has(selectedCropId)
        ? selectedCropId
        : undefined;
      const res = await api.detectCropDisease(selectedFile, cropHint);
      if (res.success) {
        setResult(res);
        onHistoryUpdated();
        // Scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        setResult(null);
        setAnalysisError(
          isTa
            ? res?.message_ta || res?.message || "இலையை பகுப்பாய்வு செய்வதில் சிக்கல் ஏற்பட்டது."
            : isHi
            ? res?.message_hi || res?.message || "पत्ती का विश्लेषण करने में समस्या आई।"
            : res?.message || "Failed to analyze the leaf image."
        );
      }
    } catch (err: unknown) {
      console.error("Analysis error", err);
      setAnalysisError(
        err instanceof Error && err.message
          ? err.message
          : isTa
          ? "பகுப்பாய்வு பிழை. தயவுசெய்து மீண்டும் ஒரு தெளிவான படத்தை எடுக்கவும்."
          : isHi
          ? "विश्लेषण त्रुटि। कृपया पुनः स्पष्ट तस्वीर लें।"
          : "Diagnostic analysis error. Please upload a clear photo taken in natural light."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Dosage calculations for current farm size
  const organicPlan = result?.organic_treatment;
  const chemicalPlan = result?.chemical_treatment;

  const dosage = calculateTreatmentDosage(
    farmSize,
    farmSizeUnit,
    organicPlan?.rate_kg_per_acre ?? 1.5,
    chemicalPlan?.rate_grams_per_acre ?? 500,
    organicPlan?.water_litres_per_acre ?? 200
  );

  // -------------------------------------------------------------
  // SPEECH / SPEAKER SYNTHESIS
  // -------------------------------------------------------------
  const handleStartSpeaking = () => {
    if (!result) return;

    if (isPaused) {
      speechService.resumeSpeaking();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    setSpeechError(null);
    const currentLang = speechLang;

    // Build rich, fully-translated spoken text including plant name, disease diagnosis, symptoms, causes, prevention, exact calculated dosages, and safety precautions
    const fullSpeech = buildDiseaseSpokenText(result, currentLang, {
      farmSize,
      farmSizeUnit,
      treatmentPreference
    });

    if (!fullSpeech) return;

    setIsSpeaking(true);
    setIsPaused(false);

    const started = speechService.speak(
      fullSpeech,
      currentLang,
      () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      {
        onStart: () => {
          setIsSpeaking(true);
          setIsPaused(false);
          setSpeechError(null);
        },
        onPause: () => {
          setIsPaused(true);
        },
        onResume: () => {
          setIsPaused(false);
          setIsSpeaking(true);
        },
        onError: (err) => {
          setIsSpeaking(false);
          setIsPaused(false);
          setSpeechError(
            err ||
              (currentLang === 'ta'
                ? "குரல் வழி விளக்கத்தை இயக்குவதில் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்."
                : "Could not play spoken explanation. Please try again.")
          );
        }
      }
    );

    if (!started) {
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const handlePauseSpeaking = () => {
    speechService.pauseSpeaking();
    setIsPaused(true);
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // -------------------------------------------------------------
  // VOICE & TEXT ASSISTANT
  // -------------------------------------------------------------
  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || assistantQuery).trim();
    if (!q || isAssistantLoading) return;

    const userMsg: AssistantMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAssistantMessages(prev => [...prev, userMsg]);
    setAssistantQuery('');
    setIsAssistantLoading(true);
    setAssistantError(null);

    // Contextual crop and disease hint
    const diseaseContext = result
      ? `${result.crop_name_en || activeCrop?.crop_name_en || 'Crop'} with ${result.condition_title_en || 'disease'}. Pathogen: ${result.pathogen || 'Unknown'}`
      : activeCrop?.crop_name_en || 'Crop';
    const history = assistantMessages
      .slice(-10)
      .map((message) => ({
        role: message.sender,
        content: message.text
      }));

    try {
      const resp = await api.askAssistant(q, diseaseContext, language, history);
      const answer = isTa ? resp.reply_ta : isHi ? (resp.reply_hi || resp.reply_en) : resp.reply_en;

      const botMsg: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAssistantMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error("Assistant Q&A error", e);
      setAssistantError(
        e instanceof Error
          ? e.message
          : isTa
          ? "உதவியாளர் சேவையுடன் இணைக்க முடியவில்லை. இணைய இணைப்பை சரிபார்க்கவும்."
          : isHi
          ? "सहायक सेवा उपलब्ध नहीं है। कृपया इंटरनेट कनेक्शन जांचें।"
          : "Assistant service is currently unavailable. Please verify your connection."
      );
    } finally {
      setIsAssistantLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleToggleMic = () => {
    if (isMicListening) {
      speechService.stopListening();
      setIsMicListening(false);
      return;
    }

    const started = speechService.startListening(
      language,
      (transcript) => {
        setAssistantQuery(transcript);
        setIsMicListening(false);
        handleSendMessage(transcript);
      },
      (err) => {
        setIsMicListening(false);
        setAssistantError(err);
      },
      () => {
        setIsMicListening(false);
      }
    );

    if (started) {
      setIsMicListening(true);
      setAssistantError(null);
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.deleteHistory(id);
    onHistoryUpdated();
  };

  // Quick suggestion questions
  const quickQuestions = isTa
    ? [
        "இந்த நோயின் ஆரம்பக்கால அறிகுறிகள் என்ன?",
        "இயற்கை கரைசலை எப்படி தயாரிப்பது?",
        "மழைக்காலத்தில் மருந்து தெளிக்கலாமா?",
        "சிகிச்சைக்குப் பின் பயிரை எப்படி பராமரிக்க வேண்டும்?"
      ]
    : isHi
    ? [
        "इस रोग के शुरुआती लक्षण क्या हैं?",
        "जैविक घोल कैसे तैयार करें?",
        "क्या बारिश के मौसम में छिड़काव कर सकते हैं?",
        "उपचार के बाद फसल की देखभाल कैसे करें?"
      ]
    : [
        "What are the earliest signs of this disease?",
        "How to prepare the organic spray?",
        "Can I apply treatments during rainy weather?",
        "What post-treatment care does the crop need?"
      ];

  return (
    <div className="space-y-6 pb-28">
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADING: DISEASE DETECTION
          Natural agricultural green theme, responsive header
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg border border-emerald-700/50 relative overflow-hidden">
        {/* Subtle decorative leaf watermark */}
        <div className="absolute -right-6 -bottom-6 text-white/5 pointer-events-none">
          <Leaf className="w-48 h-48" strokeWidth={1} />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider text-emerald-200">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isTa ? 'AI தாவர நோய் ஆய்வு' : isHi ? 'AI पादप रोग निदान' : 'AI Plant Pathology'}</span>
            </span>

            {/* Active Crop Badge */}
            {activeCrop && (
              <div className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs border border-white/10 text-emerald-200 font-semibold">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isTa ? activeCrop.crop_name_ta : isHi ? activeCrop.crop_name_hi || activeCrop.crop_name_en : activeCrop.crop_name_en}</span>
                {activeCrop.variety && (
                  <span className="text-white/70 text-[11px]">({activeCrop.variety})</span>
                )}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t.detect_heading}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
              {isTa
                ? 'உங்கள் பயிரின் பாதிக்கப்பட்ட இலையை புகைப்படம் எடுக்கவும். எங்களின் அதிநவீன AI மாதிரி நோயை அடையாளம் கண்டு துல்லியமான இயற்கை மற்றும் இரசாயன தீர்வுகளை வழங்குகிறது.'
                : isHi
                ? 'अपनी फसल की प्रभावित पत्ती की तस्वीर लें। हमारा उन्नत AI मॉडल रोग की पहचान कर सटीक जैविक व रासायनिक उपचार बताता है।'
                : 'Photograph an affected crop leaf to instantly identify plant species, detect foliar pathogens, assess soil suitability, and compute calibrated organic or chemical treatment dosages.'}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          IMAGE SELECTION: TWO MAIN OPTIONS (CAMERA / UPLOAD)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          id="file-input-upload"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          id="camera-input-capture"
        />

        {!previewUrl ? (
          /* Empty / Initial Selection State */
          <div className="space-y-4">
            <div className="border-2 border-dashed border-emerald-300 rounded-3xl p-6 sm:p-8 text-center space-y-4 bg-emerald-50/40 transition-colors hover:bg-emerald-50/70">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
                <Camera className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  {isTa ? 'இலையின் புகைப்படத்தைத் தேர்ந்தெடுக்கவும்' : isHi ? 'पत्ती की तस्वीर चुनें या खींचें' : 'Select Leaf Image for Diagnosis'}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  {t.detect_instructions}
                </p>
              </div>

              {/* Auto-detect Plant Species Toggle */}
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

              {!autoDetectCrop && (
                <div className="max-w-md mx-auto p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="font-bold text-slate-800">
                      {isTa ? 'கவனிக்க வேண்டிய பயிர்:' : isHi ? 'लक्षित फसल:' : 'Focus Crop:'}
                    </span>
                  </div>
                  <select
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                    className="bg-white border border-amber-300 text-slate-800 font-semibold py-1.5 px-3 rounded-xl shadow-xs text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">{isTa ? 'பயிரைத் தேர்ந்தெடுக்கவும்' : isHi ? 'फसल चुनें' : 'Select crop'}</option>
                    <option value="tomato">{isTa ? 'தக்காளி (Tomato)' : isHi ? 'टमाटर (Tomato)' : 'Tomato'}</option>
                    <option value="corn">{isTa ? 'மக்காச்சோளம் (Corn)' : isHi ? 'मक्का (Corn)' : 'Corn / Maize'}</option>
                    <option value="potato">{isTa ? 'உருளைக்கிழங்கு (Potato)' : isHi ? 'आलू (Potato)' : 'Potato'}</option>
                    <option value="chilli">{isTa ? 'மிளகாய் (Chilli)' : isHi ? 'मिर्च (Chilli)' : 'Chilli / Pepper'}</option>
                    <option value="rice">{isTa ? 'நெல் (Rice / Paddy)' : isHi ? 'धान (Rice)' : 'Rice / Paddy'}</option>
                    <option value="grape">{isTa ? 'திராட்சை (Grape)' : isHi ? 'अंगूर (Grape)' : 'Grape'}</option>
                    <option value="apple">{isTa ? 'ஆப்பிள் (Apple)' : isHi ? 'सेब (Apple)' : 'Apple'}</option>
                    <option value="peach">{isTa ? 'பீச் (Peach)' : isHi ? 'आड़ू (Peach)' : 'Peach'}</option>
                    <option value="orange">{isTa ? 'ஆரஞ்சு (Orange)' : isHi ? 'संतरा (Orange)' : 'Orange / Citrus'}</option>
                    <option value="strawberry">{isTa ? 'ஸ்ட்ராபெரி (Strawberry)' : isHi ? 'स्ट्रॉबेरी (Strawberry)' : 'Strawberry'}</option>
                    <option value="squash">{isTa ? 'பூசணி (Squash)' : isHi ? 'कद्दू (Squash)' : 'Squash / Cucurbit'}</option>
                    <option value="cucumber">{isTa ? 'வெள்ளரி (Cucumber) ⚠️' : isHi ? 'खीरा (Cucumber) ⚠️' : 'Cucumber ⚠️ (Not in dataset)'}</option>
                    <option value="soybean">{isTa ? 'சோயாபீன் (Soybean)' : isHi ? 'सोयाबीन (Soybean)' : 'Soybean'}</option>
                  </select>
                </div>
              )}

              {/* Two Main Options: Take Photo & Upload Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                {/* 1. Take a Photo */}
                <button
                  type="button"
                  id="btn-take-photo"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold py-3.5 px-5 rounded-2xl shadow-md shadow-emerald-800/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  <span>{t.detect_take_photo}</span>
                </button>

                {/* 2. Upload Image / File */}
                <button
                  type="button"
                  id="btn-upload-file"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-emerald-300 text-xs sm:text-sm font-bold py-3.5 px-5 rounded-2xl shadow-xs transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Upload className="w-5 h-5 text-emerald-700" />
                  <span>{t.detect_upload_image}</span>
                </button>
              </div>
            </div>

            {/* Validation Notice when user attempts to analyze without image */}
            {analysisError && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-semibold">{analysisError}</span>
              </div>
            )}
          </div>
        ) : (
          /* Preview Selected Image State */
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 bg-slate-900 flex items-center justify-center max-h-96 shadow-inner">
              <img
                src={previewUrl}
                alt="Selected Crop Leaf Preview"
                className="object-contain max-h-96 w-full"
              />

              {/* Floating Action Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1.5 bg-black/60 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md transition-all active:scale-95 shadow-md"
                  title={t.detect_remove_image}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.detect_remove_image}</span>
                </button>
              </div>
            </div>

            {/* Controls Bar Below Preview */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>{t.detect_change_image}</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors"
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>{t.detect_camera_btn}</span>
                </button>
              </div>

              {/* Prominent Identify Disease Button */}
              <button
                type="button"
                id="btn-identify-disease"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !selectedFile}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-2xl shadow-md shadow-emerald-800/25 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.detect_analyzing}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.detect_identify_btn}</span>
                  </>
                )}
              </button>
            </div>

            {/* Inline Error or Notice */}
            {analysisError && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-semibold">{analysisError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ANALYSIS RESULTS SECTION (Organized, Easy-to-read Cards)
          ───────────────────────────────────────────────────────────── */}
      {result && (
        <DiseaseResultErrorBoundary language={language}>
        <div ref={resultsRef} className="space-y-5 animate-fade-in">
          {/* Header Bar with Language Speaker Button & Language Selector */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  {isTa ? 'குரல் வழி விளக்கம்' : isHi ? 'ऑडियो विवरण' : 'Spoken Audio Explanation'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isTa ? 'முடிவுகளையும் சிகிச்சை விவரங்களையும் கேட்கவும்' : isHi ? 'निदान और उपचार विवरण सुनें' : 'Listen to diagnosis & treatment instructions'}
                </p>
              </div>
            </div>

            {/* Audio Controls & Language Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Audio Language Dropdown Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Lang:</span>
                <select
                  value={speechLang}
                  onChange={(e) => {
                    const l = e.target.value as Language;
                    setSpeechLang(l);
                    if (onSetLanguage) onSetLanguage(l);
                    if (isSpeaking) {
                      speechService.stopSpeaking();
                      setIsSpeaking(false);
                      setIsPaused(false);
                    }
                    setSpeechError(null);
                  }}
                  className="bg-transparent font-bold text-emerald-800 outline-none cursor-pointer text-xs"
                >
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>

              {/* Play / Listen Button */}
              {!isSpeaking ? (
                <button
                  type="button"
                  id="btn-listen-results"
                  onClick={handleStartSpeaking}
                  className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.speaker_listen}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  {isPaused ? (
                    <button
                      type="button"
                      onClick={handleStartSpeaking}
                      className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t.speaker_resume}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePauseSpeaking}
                      className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>{t.speaker_pause}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStopSpeaking}
                    className="flex items-center gap-1 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{t.speaker_stop}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Speech Error Notice */}
          {speechError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-semibold">{speechError}</span>
              </div>
              <button
                type="button"
                onClick={handleStartSpeaking}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shrink-0 transition-colors"
              >
                {isTa ? 'மீண்டும் முயற்சிக்கவும்' : isHi ? 'पुनः प्रयास करें' : 'Retry'}
              </button>
            </div>
          )}

          {/* Uncertainty / Failure Notice */}
          {(!result.success || result.is_uncertain) && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-amber-950">
                    {isTa ? 'துல்லிய கணிப்புக்கு கூடுதல் ஆய்வு தேவை' : isHi ? 'अनिश्चित परिणाम — अतिरिक्त जांच की आवश्यकता' : 'Inconclusive or Uncertain Diagnosis'}
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {isTa
                      ? result.message_ta || "இந்த கோணத்தில் அல்லது வெளிச்சத்தில் நோயை திட்டவட்டமாக உறுதிப்படுத்த முடியவில்லை. தவறான சிகிச்சையைத் தவிர்க்க கீழே உள்ள வழிகாட்டுதலைப் பின்பற்றவும்."
                      : isHi
                      ? result.message_hi || "इस कोण अथवा प्रकाश में रोग की निश्चित पुष्टि नहीं हो सकी। गलत उपचार से बचने के लिए आगे निरीक्षण करें।"
                      : result.message || "The model cannot confidently identify the disease from this angle or lighting. Further inspection is strongly advised before treatment."}
                  </p>
                </div>
              </div>
              <div className="bg-white/90 p-4 rounded-2xl text-xs text-slate-700 space-y-1.5 border border-amber-200">
                <p className="font-bold text-slate-900">
                  {isTa ? 'பரிந்துரைக்கப்படும் வழிமுறைகள்:' : isHi ? 'अनुशंसित कदम:' : 'Recommended Farmer Actions:'}
                </p>
                <p>• {isTa ? 'நேரடி சூரிய ஒளி இல்லாத போது நல்ல இயற்கை வெளிச்சத்தில் மீண்டும் படம் எடுக்கவும்.' : isHi ? 'कड़क धूप के बजाय अप्रत्यक्ष प्राकृतिक रोशनी में पुनः फोटो खींचें।' : 'Retake the photo in bright, indirect daylight without harsh reflective glare.'}</p>
                <p>• {isTa ? 'இலையின் நோய் தாக்கிய புள்ளிகளை 15 முதல் 20 செ.மீ அருகிலிருந்து தெளிவாக படம் பிடிக்கவும்.' : isHi ? 'पत्ती के धब्बों या झुलसे हुए हिस्से को 15-20 सेमी की दूरी से केंद्रित करें।' : 'Hold camera 15-20 cm away, focusing cleanly on necrotic lesions or lesion margins.'}</p>
                <p>• {isTa ? 'சந்தேகம் நீடித்தால் உங்கள் வட்டார வேளாண்மை அலுவலரை அல்லது வேளாண் அறிவியல் மையத்தை (KVK) அணுகவும்.' : isHi ? 'संदेह की स्थिति में अपने नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।' : 'If uncertainty persists, consult your local Agricultural Extension Officer or KVK.'}</p>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              A. PLANT IDENTIFICATION & B. DISEASE IDENTIFICATION CARD
              ───────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            {/* Status Header Banner */}
            <div className={`p-5 text-white flex flex-wrap items-center justify-between gap-3 ${
              result.is_healthy
                ? 'bg-gradient-to-r from-emerald-700 to-green-700'
                : 'bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-sm">
                  {result.is_healthy ? (
                    <CheckCircle2 className="w-7 h-7" strokeWidth={2.5} />
                  ) : (
                    <AlertTriangle className="w-7 h-7" strokeWidth={2.5} />
                  )}
                </div>
                <div>
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-200 bg-black/20 px-2 py-0.5 rounded-md mb-1">
                    {result.is_healthy
                      ? (isTa ? 'ஆரோக்கியமான நிலை' : isHi ? 'स्वस्थ फसल' : 'Healthy Leaf')
                      : result.error_code === 'UNSUPPORTED_PLANT'
                      ? (isTa ? 'ஆதரிக்கப்படாத பயிர்' : isHi ? 'असमर्थित फसल' : 'Plant Not Supported')
                      : (isTa ? 'நோய் காரணி கண்டறியப்பட்டது' : isHi ? 'रोग का पता चला' : 'Disease Detected')}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black">
                    {isTa ? result.condition_title_ta : isHi ? result.condition_title_hi || result.condition_title_en : result.condition_title_en}
                  </h3>
                </div>
              </div>

              {/* Confidence Pill */}
              <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-2xl text-right">
                <span className="block text-[10px] uppercase tracking-wider text-emerald-100 font-bold">
                  {isTa ? 'துல்லியம்' : isHi ? 'सटीकता' : 'Confidence'}
                </span>
                <span className="text-base sm:text-lg font-black text-white">
                  {result.confidence_percentage ?? Math.round((result.confidence_score ?? 0.88) * 100)}%
                </span>
              </div>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="p-5 sm:p-6 space-y-5 text-xs">
              {/* Plant / Crop Identification Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-emerald-50/70 p-3.5 border border-emerald-100">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 block mb-1">
                    🌱 {isTa ? 'பயிர் அடையாளம்' : isHi ? 'पहचानी गई फसल' : 'Identified Plant'}
                  </span>
                  <p className="text-sm font-black text-emerald-950">
                    {isTa ? result.crop_name_ta : isHi ? result.crop_name_hi || result.crop_name_en : result.crop_name_en}
                  </p>
                  <p className="text-[11px] text-emerald-800 italic mt-0.5">
                    {
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
  result.crop_id === 'cucumber' ? 'Cucumis sativus' :
  result.crop_id === 'rice' ? 'Oryza sativa' :
  result.crop_id === 'cotton' ? 'Gossypium hirsutum' :
  'Cultivated Flora'
}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                    🦠 {isTa ? 'நோய்க்கிருமி வகை' : isHi ? 'रोगजनक (पैथोजन)' : 'Pathogen'}
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    {result.pathogen || (result.is_healthy ? (isTa ? 'இல்லை (ஆரோக்கியமானது)' : isHi ? 'कोई नहीं (स्वस्थ)' : 'None (Healthy)') : 'Fungal Pathogen')}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                    🔬 {isTa ? 'மாதிரி பதிப்பு' : isHi ? 'मॉडल संस्करण' : 'AI Model'}
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    {result.model_version || 'AgriGuard-Vision-v2.4'}
                  </p>
                </div>
              </div>

              {/* Top Candidate Predictions (if available) */}
              {topPredictions.length > 1 && (
                <div className="rounded-2xl bg-emerald-50/50 p-3.5 border border-emerald-100 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">
                    📊 {isTa ? 'வகுப்பு சாத்தியக்கூறுகள் (Top Class Candidates)' : isHi ? 'संभावित श्रेणियां' : 'Top Class Candidates'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {topPredictions.map((pred, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white border border-emerald-200/60 shadow-2xs">
                        <span className="font-semibold text-slate-800 truncate pr-2">
                          {pred.crop_name} — {pred.disease_name}
                        </span>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md text-[11px] shrink-0">
                          {pred.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disease Explanation */}
              {result.explanation_en && (
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-1">
                  <h5 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-700" />
                    <span>{isTa ? 'நோய் பற்றிய சுருக்கம்' : isHi ? 'रोग का विवरण' : 'Disease Overview'}</span>
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {isTa ? result.explanation_ta : isHi ? result.explanation_hi || result.explanation_en : result.explanation_en}
                  </p>
                </div>
              )}

              {/* Symptoms and Visible Signs */}
              {commonSymptoms.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>{t.detect_symptoms}</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {commonSymptoms.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span className="text-slate-700 text-xs leading-relaxed">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              C. SUITABLE SOIL INFORMATION CARD
              ───────────────────────────────────────────────────────── */}
          {result.soil_info && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {t.soil_info_title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isTa ? 'பயிர் வளர்ச்சிக்கு உகந்த மண் மற்றும் அதன் முக்கிய தேவைகள்' : isHi ? 'फसल की वृद्धि के लिए उपयुक्त मिट्टी व आवश्यकताएं' : 'Optimal soil types, pH levels, and healthy root conditions'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Suitable Soil Types */}
                <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-200/70 space-y-1.5">
                  <span className="font-extrabold text-amber-950 block">
                    🪴 {isTa ? 'பரிந்துரைக்கப்படும் மண் வகைகள்:' : isHi ? 'उपयुक्त मिट्टी के प्रकार:' : 'Suitable Soil Types:'}
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {suitableSoils.map((soil, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{soil}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-amber-200/60 mt-2">
                    <span className="font-bold text-amber-900 text-[11px]">
                      {isTa ? 'மண் கார அமிலத்தன்மை (pH): ' : isHi ? 'पीएच मान (pH Range): ' : 'Ideal pH Range: '}
                    </span>
                    <span className="font-mono font-bold text-emerald-800">{result.soil_info.ph_range}</span>
                  </div>
                </div>

                {/* Soil Growth Requirements */}
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-1.5">
                  <span className="font-extrabold text-slate-900 block">
                    🌱 {isTa ? 'ஆரோக்கியமான வளர்ச்சித் தேவைகள்:' : isHi ? 'विकास हेतु बुनियादी आवश्यकताएं:' : 'Basic Growth Requirements:'}
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {isTa ? result.soil_info.requirements_ta : isHi ? result.soil_info.requirements_hi : result.soil_info.requirements_en}
                  </p>
                </div>
              </div>

              {/* Unsuitable Soil Impact Explanation */}
              <div className="rounded-2xl bg-red-50/60 p-4 border border-red-200/70 text-xs space-y-1">
                <span className="font-extrabold text-red-950 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-700" />
                  <span>{isTa ? 'தவறான மண் அமைப்பினால் பயிருக்கு ஏற்படும் பாதிப்புகள்:' : isHi ? 'अनुपयुक्त मिट्टी का फसल पर दुष्प्रभाव:' : 'Impact of Unsuitable Soil Conditions:'}</span>
                </span>
                <p className="text-red-900/90 leading-relaxed text-[11px]">
                  {isTa ? result.soil_info.unsuitable_impact_ta : isHi ? result.soil_info.unsuitable_impact_hi : result.soil_info.unsuitable_impact_en}
                </p>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              D. POSSIBLE CAUSES CARD
              ───────────────────────────────────────────────────────── */}
          {result.causes_info && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold">
                  <CloudRainIcon className="w-5 h-5 text-sky-800" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {t.causes_title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isTa ? 'நோய் உருவாவதற்கான சுற்றுச்சூழல் மற்றும் வேளாண் காரணிகள்' : isHi ? 'रोग पनपने के संभावित मौसमी व कृषि कारण' : 'Foliar moisture, temperature ranges, and agronomic factors'}
                  </p>
                </div>
              </div>

              {/* Primary Causes List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {primaryCauses.map((cause, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-sky-600 mt-1 shrink-0" />
                    <span className="text-slate-800 font-semibold leading-relaxed">{cause}</span>
                  </div>
                ))}
              </div>

              {/* Weather Factors */}
              <div className="rounded-2xl bg-sky-50/70 p-3.5 border border-sky-100 text-xs space-y-1">
                <span className="font-extrabold text-sky-950 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-700" />
                  <span>{isTa ? 'வானிலை & ஈரப்பதம் காரணிகள்:' : isHi ? 'मौसम व नमी के कारक:' : 'Weather & Environmental Triggers:'}</span>
                </span>
                <p className="text-sky-900 text-[11px] leading-relaxed">
                  {isTa ? result.causes_info.weather_factors_ta : isHi ? result.causes_info.weather_factors_hi : result.causes_info.weather_factors_en}
                </p>
              </div>

              {/* Mandatory Disclaimer */}
              <div className="rounded-2xl bg-slate-100/80 p-3 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>{isTa ? result.causes_info.disclaimer_ta : isHi ? result.causes_info.disclaimer_hi : result.causes_info.disclaimer_en}</p>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              3. TREATMENT SELECTION: ORGANIC OR CHEMICAL
              Large, clearly labelled buttons + Land area dose scaling
              ───────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-300 shadow-lg space-y-6">
            <div className="text-center space-y-1.5 max-w-lg mx-auto">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                {isTa ? 'சிகிச்சை விருப்பம்' : isHi ? 'उपचार चयन' : 'Treatment Protocol'}
              </span>
              <h3 className="text-base sm:text-xl font-black text-slate-900">
                {t.treatment_preference_title}
              </h3>
              <p className="text-xs text-slate-500">
                {isTa
                  ? 'பரிந்துரைக்கப்பட்ட இயற்கை அல்லது இரசாயன சிகிச்சையைத் தேர்ந்தெடுத்து உங்கள் நிலத்திற்கான சரியான அளவைப் பெறவும்.'
                  : isHi
                  ? 'अपनी पसंद का जैविक या रासायनिक उपचार चुनें और खेत के क्षेत्रफल अनुसार सटीक मात्रा प्राप्त करें।'
                  : 'Select your preferred solution to compute calibrated dosage and schedule based on your farm area.'}
              </p>
            </div>

            {/* Two Large Treatment Selection Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: Organic Solution */}
              <button
                type="button"
                id="btn-select-organic"
                onClick={() => setTreatmentPreference('organic')}
                className={`relative flex items-center gap-4 p-5 rounded-3xl border-2 text-left transition-all ${
                  treatmentPreference === 'organic'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/30'
                    : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  treatmentPreference === 'organic'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <Leaf className="w-7 h-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm sm:text-base font-black text-slate-900">
                      {t.treatment_organic_btn}
                    </h4>
                    {treatmentPreference === 'organic' && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isTa ? 'உயிரியல் பூஞ்சைக்கொல்லிகள், வேப்பெண்ணெய் & பஞ்சகவ்யா' : isHi ? 'जैविक कीटनाशक, नीम तेल व जैव नियंत्रक' : 'Bio-fungicides, botanicals, and microbial antagonists'}
                  </p>
                </div>
              </button>

              {/* Option 2: Chemical Solution */}
              <button
                type="button"
                id="btn-select-chemical"
                onClick={() => setTreatmentPreference('chemical')}
                className={`relative flex items-center gap-4 p-5 rounded-3xl border-2 text-left transition-all ${
                  treatmentPreference === 'chemical'
                    ? 'border-sky-600 bg-sky-50/80 shadow-md ring-2 ring-sky-500/30'
                    : 'border-slate-200 hover:border-sky-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  treatmentPreference === 'chemical'
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-100 text-sky-800'
                }`}>
                  <FlaskConical className="w-7 h-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm sm:text-base font-black text-slate-900">
                      {t.treatment_chemical_btn}
                    </h4>
                    {treatmentPreference === 'chemical' && (
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isTa ? 'அங்கீகரிக்கப்பட்ட இரசாயன மருந்துகள் & பூஞ்சைக்கொல்லிகள்' : isHi ? 'प्रमाणित कवकनाशी व सटीक रासायनिक घोल' : 'Registered fungicides, active ingredients, and label rates'}
                  </p>
                </div>
              </button>
            </div>

            {/* Farm Land Area Input & Unit Selector */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-700" />
                  <span>{t.farm_size_label}</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {isTa ? 'சரியான மருந்து மற்றும் நீர் அளவைக் கணக்கிட' : isHi ? 'सटीक दवा व पानी की मात्रा हेतु' : 'For accurate dosage and spray volume'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Number input */}
                <div className="relative">
                  <input
                    type="number"
                    min="0.05"
                    step="0.25"
                    value={farmSize}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFarmSize(isNaN(val) || val <= 0 ? 1 : val);
                    }}
                    className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm font-extrabold text-slate-900 outline-none transition-all"
                    placeholder="1.0"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold uppercase">
                    {farmSizeUnit}
                  </span>
                </div>

                {/* Units Selector (Acres / Hectares / Square metres) */}
                <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFarmSizeUnit('acres')}
                    className={`py-2 rounded-lg transition-all ${
                      farmSizeUnit === 'acres'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.unit_acres}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFarmSizeUnit('hectares')}
                    className={`py-2 rounded-lg transition-all ${
                      farmSizeUnit === 'hectares'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.unit_hectares}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFarmSizeUnit('sqm')}
                    className={`py-2 rounded-lg transition-all ${
                      farmSizeUnit === 'sqm'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.unit_sqm}
                  </button>
                </div>
              </div>
            </div>

            {/* Scaled Treatment Guidance Details */}
            {treatmentPreference === 'organic' && organicPlan && (
              <div className="rounded-3xl bg-emerald-50/60 p-5 border border-emerald-200 space-y-4 animate-fade-in text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                      {isTa ? 'உயிரியல் தீர்வு' : isHi ? 'जैविक उपचार' : 'Organic Protocol'}
                    </span>
                    <h4 className="text-base font-black text-emerald-950">
                      {isTa ? organicPlan.name_ta : isHi ? organicPlan.name_hi : organicPlan.name_en}
                    </h4>
                  </div>
                </div>

                {/* Scaled Quantity Highlight Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-3.5 border border-emerald-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      ⚖️ {isTa ? 'தேவையான இயற்கை பொருள் அளவு' : isHi ? 'आवश्यक जैविक सामग्री' : 'Required Quantity'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-emerald-800">
                      {dosage.organicQuantityFormatted}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ({organicPlan.rate_per_acre})
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white p-3.5 border border-emerald-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      💧 {isTa ? 'கரைக்க தேவையான தண்ணீர்' : isHi ? 'पानी की आवश्यकता' : 'Water Required'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-sky-800">
                      {dosage.waterQuantityFormatted}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ({isTa ? 'முழு இலை நனையும்படி தெளிக்கவும்' : isHi ? 'पत्तियों को भिगोने हेतु' : 'Full canopy coverage'})
                    </span>
                  </div>
                </div>

                {/* Application Specifics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-white/80 p-3.5 border border-emerald-100 space-y-1">
                    <span className="font-extrabold text-emerald-950 block">
                      🧪 {isTa ? 'தேவையான உட்பொருட்கள்:' : isHi ? 'घटक / सामग्री:' : 'Ingredients Required:'}
                    </span>
                    <p className="text-slate-700">
                      {isTa ? organicPlan.ingredients_ta : isHi ? organicPlan.ingredients_hi : organicPlan.ingredients_en}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-3.5 border border-emerald-100 space-y-1">
                    <span className="font-extrabold text-emerald-950 block">
                      🚿 {isTa ? 'தெளிக்கும் முறை:' : isHi ? 'छिड़काव की विधि:' : 'Application Method:'}
                    </span>
                    <p className="text-slate-700">
                      {isTa ? organicPlan.method_ta : isHi ? organicPlan.method_hi : organicPlan.method_en}
                    </p>
                  </div>
                </div>

                {/* Schedules & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-800">
                  <div className="rounded-2xl bg-white/80 p-3 border border-emerald-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      ⏱️ {isTa ? 'இடைவெளி' : isHi ? 'अंतराल' : 'Interval'}
                    </span>
                    <span className="font-bold text-emerald-900">
                      {organicPlan.intervals_days} {isTa ? 'நாட்கள்' : isHi ? 'दिन' : 'days'}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-3 border border-emerald-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      📅 {isTa ? 'கால அளவு' : isHi ? 'कुल अवधि' : 'Expected Period'}
                    </span>
                    <span className="font-bold text-emerald-900">
                      {organicPlan.expected_duration_days} {isTa ? 'நாட்கள்' : isHi ? 'दिन' : 'days'}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-3 border border-emerald-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      🔄 {isTa ? 'அலைவரிசை' : isHi ? 'आवृत्ति' : 'Frequency'}
                    </span>
                    <span className="font-bold text-emerald-900 truncate block">
                      {isTa ? organicPlan.frequency_ta : isHi ? organicPlan.frequency_hi : organicPlan.frequency_en}
                    </span>
                  </div>
                </div>

                {/* Precautions */}
                <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200/80 space-y-1.5">
                  <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-800" />
                    <span>{isTa ? 'பாதுகாப்பு வழிமுறைகள்:' : isHi ? 'सावधानियां:' : 'Precautions & Safety:'}</span>
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {organicPrecautions.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {treatmentPreference === 'chemical' && chemicalPlan && (
              <div className="rounded-3xl bg-sky-50/60 p-5 border border-sky-200 space-y-4 animate-fade-in text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-sky-700 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                      {isTa ? 'இரசாயன முறை' : isHi ? 'रासायनिक उपचार' : 'Chemical Protocol'}
                    </span>
                    <h4 className="text-base font-black text-sky-950">
                      {isTa ? chemicalPlan.product_name_ta : isHi ? chemicalPlan.product_name_hi : chemicalPlan.product_name_en}
                    </h4>
                    <p className="text-[11px] text-sky-800 font-semibold mt-0.5">
                      {isTa ? 'செயலூக்க பொருள்: ' : isHi ? 'सक्रिय घटक: ' : 'Active Ingredient: '}
                      <span className="italic">{chemicalPlan.active_ingredient}</span>
                    </p>
                  </div>
                </div>

                {/* Scaled Quantity Highlight Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-3.5 border border-sky-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      ⚖️ {isTa ? 'தேவையான மருந்து அளவு' : isHi ? 'दवा की आवश्यक मात्रा' : 'Required Dosage'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-sky-900">
                      {dosage.chemicalQuantityFormatted}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ({chemicalPlan.approved_rate_per_acre})
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white p-3.5 border border-sky-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      💧 {isTa ? 'கரைக்க தேவையான தண்ணீர்' : isHi ? 'पानी की आवश्यकता' : 'Water Volume'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-sky-900">
                      {dosage.waterQuantityFormatted}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ({isTa ? 'முழு இலை நனையும்படி தெளிக்கவும்' : isHi ? 'पत्तियों को भिगोने हेतु' : 'Calibrated spray volume'})
                    </span>
                  </div>
                </div>

                {/* Method & Pre-harvest Interval */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-white/80 p-3.5 border border-sky-100 space-y-1">
                    <span className="font-extrabold text-sky-950 block">
                      🚿 {isTa ? 'தெளிக்கும் முறை:' : isHi ? 'छिड़काव की विधि:' : 'Application Method:'}
                    </span>
                    <p className="text-slate-700">
                      {isTa ? chemicalPlan.method_ta : isHi ? chemicalPlan.method_hi : chemicalPlan.method_en}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-3.5 border border-sky-100 space-y-1">
                    <span className="font-extrabold text-red-950 block">
                      ⏱️ {isTa ? 'அறுவடைக்கு முந்தைய இடைவெளி (PHI):' : isHi ? 'कटाई पूर्व सुरक्षित अंतराल (PHI):' : 'Pre-Harvest Interval (PHI):'}
                    </span>
                    <p className="text-red-700 font-extrabold">
                      {chemicalPlan.pre_harvest_interval_days} {isTa ? 'நாட்கள் அறுவடை செய்யக்கூடாது' : isHi ? 'दिन कटाई न करें' : 'days before harvest'}
                    </p>
                  </div>
                </div>

                {/* Required PPE Equipment */}
                <div className="rounded-2xl bg-white/90 p-4 border border-sky-200 space-y-1.5">
                  <span className="font-extrabold text-slate-900 block">
                    🥽 {isTa ? 'அவசியமான பாதுகாப்பு உடைகள் (PPE):' : isHi ? 'आवश्यक सुरक्षा उपकरण (PPE):' : 'Required Protective Equipment (PPE):'}
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {chemicalPpe.map((ppe, idx) => (
                      <span key={idx} className="bg-sky-100 text-sky-900 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        ✓ {ppe}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Precautions */}
                <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200 space-y-1.5">
                  <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>{isTa ? 'எச்சரிக்கைகள் & முன்னெச்சரிக்கைகள்:' : isHi ? 'सावधानियां व चेतावनी:' : 'Precautions & Environmental Warnings:'}</span>
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {chemicalPrecautions.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                C. PERSONALIZED FINAL TREATMENT PLAN SUMMARY
                Clear checklist & execution plan for the farmer
                ───────────────────────────────────────────────────────── */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 p-5 sm:p-6 text-white space-y-4 shadow-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-black">
                  {t.final_plan_title}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. What treatment */}
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                    1. {isTa ? 'பரிந்துரைக்கப்பட்ட சிகிச்சை' : isHi ? 'अनुशंसित उपचार' : 'Recommended Treatment'}
                  </span>
                  <p className="font-bold text-white">
                    {treatmentPreference === 'organic'
                      ? (isTa ? organicPlan?.name_ta : isHi ? organicPlan?.name_hi : organicPlan?.name_en)
                      : (isTa ? chemicalPlan?.product_name_ta : isHi ? chemicalPlan?.product_name_hi : chemicalPlan?.product_name_en)}
                  </p>
                </div>

                {/* 2. How much */}
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                    2. {isTa ? 'நிலத்திற்கான அளவு' : isHi ? 'खेत हेतु कुल मात्रा' : 'Dose for Your Land Area'}
                  </span>
                  <p className="font-black text-amber-300 text-sm">
                    {treatmentPreference === 'organic'
                      ? `${dosage.organicQuantityFormatted} (${dosage.waterQuantityFormatted} நீர்)`
                      : `${dosage.chemicalQuantityFormatted} (${dosage.waterQuantityFormatted} நீர்)`}
                  </p>
                </div>

                {/* 3. How to apply */}
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                    3. {isTa ? 'தெளிக்கும் முறை' : isHi ? 'प्रयोग विधि' : 'Application Method'}
                  </span>
                  <p className="text-emerald-100 text-[11px]">
                    {treatmentPreference === 'organic'
                      ? (isTa ? organicPlan?.method_ta : isHi ? organicPlan?.method_hi : organicPlan?.method_en)
                      : (isTa ? chemicalPlan?.method_ta : isHi ? chemicalPlan?.method_hi : chemicalPlan?.method_en)}
                  </p>
                </div>

                {/* 4. Schedule & Days */}
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                    4. {isTa ? 'இடைவெளி & கால அளவு' : isHi ? 'अंतराल व अवधि' : 'Interval & Duration'}
                  </span>
                  <p className="text-emerald-100 text-[11px]">
                    {treatmentPreference === 'organic'
                      ? `${organicPlan?.intervals_days} ${isTa ? 'நாட்கள் இடைவெளியில், மொத்தம்' : isHi ? 'दिन के अंतराल पर, कुल' : 'days interval, total'} ${organicPlan?.expected_duration_days} ${isTa ? 'நாட்கள் வரை' : isHi ? 'दिनों तक' : 'days'}`
                      : `${chemicalPlan?.interval_days} ${isTa ? 'நாட்கள் இடைவெளியில், மொத்தம்' : isHi ? 'दिन के अंतराल पर, कुल' : 'days interval, total'} ${chemicalPlan?.duration_days} ${isTa ? 'நாட்கள்' : isHi ? 'दिन' : 'days'}`}
                  </p>
                </div>
              </div>

              {/* Disclaimer reminder */}
              <p className="text-[11px] text-emerald-200/80 italic text-center pt-1">
                {isTa
                  ? 'விவசாயிகள் பாதுகாப்பு உபகரணங்களை கட்டாயம் அணிய வேண்டும். ஏதேனும் சந்தேகம் இருந்தால் வட்டார வேளாண் அலுவலரை அணுகவும்.'
                  : isHi
                  ? 'सुरक्षात्मक उपाय अवश्य अपनाएं। अधिक जानकारी हेतु कृषि अधिकारी से सलाह लें।'
                  : 'Always observe recommended PPE and safety intervals. Consult your local agricultural officer for severe infestations.'}
              </p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              5. VOICE ASSISTANT AND TEXT SEARCH BAR
              Multilingual follow-up questions contextualized to scan
              ───────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {isTa ? 'நோய் குறித்த கூடுதல் கேள்விகள்' : isHi ? 'इस रोग से जुड़े अन्य सवाल' : 'Ask Anything About This Disease'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isTa ? 'அறிகுறிகள், சிகிச்சை முறைகள், மண் அல்லது தடுப்பு முறைகள் பற்றி கேட்கலாம்' : isHi ? 'लक्षण, जैविक या रासायनिक उपचार के बारे में सीधे पूछें' : 'Ask follow-up questions on symptoms, spray timing, soil, or care'}
                </p>
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((qq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(qq)}
                  className="rounded-full bg-slate-100 hover:bg-emerald-100 border border-slate-200 hover:border-emerald-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:text-emerald-900 transition-colors"
                >
                  {qq}
                </button>
              ))}
            </div>

            {/* Conversation Messages Thread */}
            {assistantMessages.length > 0 && (
              <div className="space-y-3 max-h-72 overflow-y-auto p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                {assistantMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                        msg.sender === 'user'
                          ? 'bg-emerald-700 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-none'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <span className={`block text-[9px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isAssistantLoading && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs italic p-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>{isTa ? 'பதில் பெறப்படுகிறது...' : isHi ? 'उत्तर तैयार हो रहा है...' : 'Formulating agricultural advice...'}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Error Message */}
            {assistantError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{assistantError}</span>
              </div>
            )}

            {/* Text Input + Mic Button + Send Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-voice-mic"
                onClick={handleToggleMic}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                  isMicListening
                    ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/30'
                    : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'
                }`}
                title={isMicListening ? "Stop Listening" : "Speak your question"}
              >
                {isMicListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={t.ask_anything_placeholder}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                type="button"
                id="btn-send-assistant-msg"
                onClick={() => handleSendMessage()}
                disabled={!assistantQuery.trim() || isAssistantLoading}
                className="w-11 h-11 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        </DiseaseResultErrorBoundary>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. SAVED DETECTION HISTORY SECTION & VIEW FULL DETAILS
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              {t.detect_history_title} ({detectionHistory.length})
            </h3>
          </div>
        </div>

        {detectionHistory.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            {isTa ? "சேமிக்கப்பட்ட ஆய்வுகள் எதுவும் இல்லை." : isHi ? "कोई सहेजा गया स्कैन नहीं है।" : "No saved scan entries yet."}
          </p>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {detectionHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => loadScanRecord(item)}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.image_preview_url ? (
                    <img
                      src={item.image_preview_url}
                      alt={item.condition_title_en}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      item.is_healthy ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.is_healthy ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {isTa ? item.condition_title_ta : isHi ? item.condition_title_hi || item.condition_title_en : item.condition_title_en}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      🌱 {isTa ? item.crop_name_ta : isHi ? item.crop_name_hi || item.crop_name_en : item.crop_name_en} • {item.timestamp_formatted || item.timestamp}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {Math.round(item.confidence_score * 100)}%
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadScanRecord(item);
                    }}
                    className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                    title={t.view_full_details}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteHistory(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title={t.delete_btn}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// CloudRain Icon helper
const CloudRainIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M16 14v6" />
    <path d="M8 14v6" />
    <path d="M12 16v6" />
  </svg>
);

export default DiseaseDetectionScreen;
