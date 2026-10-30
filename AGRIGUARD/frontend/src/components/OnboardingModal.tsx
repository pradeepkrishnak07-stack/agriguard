import React, { useState } from 'react';
import { Sprout, CheckCircle2, MapPin, Camera, Mic, ArrowRight, Globe } from 'lucide-react';
import { Language, FarmProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: Partial<FarmProfile>, selectedLang: Language) => void;
  initialLanguage: Language;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete, initialLanguage }) => {
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<Language>(initialLanguage);
  
  // Step 2 Form
  const [farmerName, setFarmerName] = useState('');
  const [district, setDistrict] = useState('Thanjavur, Tamil Nadu');
  const [cropType, setCropType] = useState('tomato');
  const [variety, setVariety] = useState('');
  const [acres, setAcres] = useState('');
  const [soilType, setSoilType] = useState('Red Loam');
  const [irrigationMethod, setIrrigationMethod] = useState('Drip Irrigation');

  if (!isOpen) return null;

  const isTa = lang === 'ta';

  const handleFinish = () => {
    const cropNameEn = cropType === 'rice' ? 'Rice / Paddy' : cropType === 'cotton' ? 'Cotton' : 'Tomato';
    const cropNameTa = cropType === 'rice' ? 'நெல்' : cropType === 'cotton' ? 'பருத்தி' : 'தக்காளி';

    onComplete({
      farmer_name: farmerName.trim() || (isTa ? "விவசாயி" : "Farmer"),
      location_name: district,
      active_crop_id: cropType,
      crops: [
        {
          id: `crop_${Date.now()}`,
          crop_id: cropType,
          crop_name_en: cropNameEn,
          crop_name_ta: cropNameTa,
          variety: variety || 'Standard',
          area_acres: acres || '1.0',
          soil_type: soilType,
          irrigation_method: irrigationMethod,
          growth_stage: 'Vegetative'
        }
      ]
    }, lang);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isTa ? "அக்ரிகார்ட் வரவேற்பு" : "Welcome to AGRIGUARD"}
              </h2>
              <p className="text-xs text-emerald-100">
                {isTa ? "படி " + step + " / 4" : "Step " + step + " of 4"}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full ${
                  s === step ? 'bg-white' : s < step ? 'bg-emerald-300' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: Choose Language */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <Globe className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">
                  Choose Preferred Language / உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்
                </h3>
                <p className="text-xs text-slate-500">
                  You can change this anytime from Settings.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setLang('ta')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    lang === 'ta'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-md'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-lg block mb-0.5">🌾</span>
                  <span className="text-sm block font-bold">தமிழ்</span>
                  <span className="text-[10px] text-slate-500">Tamil</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    lang === 'en'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-md'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-lg block mb-0.5">🌱</span>
                  <span className="text-sm block font-bold">English</span>
                  <span className="text-[10px] text-slate-500">English</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    lang === 'hi'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-md'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-lg block mb-0.5">🌿</span>
                  <span className="text-sm block font-bold">हिंदी</span>
                  <span className="text-[10px] text-slate-500">Hindi</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Farm Profile */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isTa ? "உங்கள் பண்ணை விவரங்களை உள்ளிடவும்" : "Set Up Your Farm Profile"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isTa ? "பயிர்களுக்கு ஏற்ப ஆலோசனை வழங்க இது உதவும்." : "Helps provide personalized crop disease and irrigation guidance."}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isTa ? "விவசாயி பெயர் (விருப்பப்பட்டால்)" : "Farmer Display Name (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder={isTa ? "எ.கா. முருகன்" : "e.g. Murugan"}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isTa ? "பண்ணை அமைவிடம் / மாவட்டம்" : "Farm District / Location"}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Thanjavur, Tamil Nadu">தஞ்சாவூர் (Thanjavur)</option>
                    <option value="Madurai, Tamil Nadu">மதுரை (Madurai)</option>
                    <option value="Coimbatore, Tamil Nadu">கோயம்புத்தூர் (Coimbatore)</option>
                    <option value="Tiruchirappalli, Tamil Nadu">திருச்சிராப்பள்ளி (Trichy)</option>
                    <option value="Salem, Tamil Nadu">சேலம் (Salem)</option>
                    <option value="Tirunelveli, Tamil Nadu">திருநெல்வேலி (Tirunelveli)</option>
                    <option value="Erode, Tamil Nadu">ஈரோடு (Erode)</option>
                    <option value="Dindigul, Tamil Nadu">திண்டுக்கல் (Dindigul)</option>
                    <option value="Theni, Tamil Nadu">தேனி (Theni)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {isTa ? "முக்கிய பயிர்" : "Primary Crop"}
                    </label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold"
                    >
                      <option value="tomato">தக்காளி (Tomato)</option>
                      <option value="rice">நெல் (Rice / Paddy)</option>
                      <option value="cotton">பருத்தி (Cotton)</option>
                      <option value="potato">உருளைக்கிழங்கு (Potato)</option>
                      <option value="corn">மக்காச்சோளம் (Corn)</option>
                      <option value="groundnut">நிலக்கடலை (Groundnut)</option>
                      <option value="chilli">மிளகாய் (Chilli)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {isTa ? "ரகம் (தெரிந்தால்)" : "Variety (If known)"}
                    </label>
                    <input
                      type="text"
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      placeholder={isTa ? "எ.கா. PKM-1 / ADT-53" : "e.g. PKM-1 / ADT-53"}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {isTa ? "மண் வகை" : "Soil Type"}
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="Red Loam">செம்மண் (Red Loam)</option>
                      <option value="Clay Soil">களிமண் (Clay Soil)</option>
                      <option value="Clay Loam">வண்டல் மண் (Clay Loam)</option>
                      <option value="Sandy Loam">மணல் கலந்த மண் (Sandy Loam)</option>
                      <option value="Black Cotton Soil">கரிசல் மண் (Black Soil)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {isTa ? "பாசன முறை" : "Irrigation Method"}
                    </label>
                    <select
                      value={irrigationMethod}
                      onChange={(e) => setIrrigationMethod(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="Drip Irrigation">சொட்டுநீர்ப் பாசனம் (Drip)</option>
                      <option value="Sprinkler">தெளிப்பு நீர் (Sprinkler)</option>
                      <option value="Flood / Furrow">வாய்க்கால் பாசனம் (Flood)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Permissions Explanation */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isTa ? "அனுமதிகள் பற்றிய விளக்கம்" : "Privacy & Device Permissions"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isTa ? "அக்ரிகார்ட் உங்கள் தனியுரிமையை மதிக்கிறது. அனுமதிகள் தேவையான போது மட்டுமே கேட்கப்படும்." : "AGRIGUARD respects farmer privacy. Permissions are requested only when you use specific tools."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <Camera className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">
                      {isTa ? "கேமரா (Camera)" : "Camera Access"}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {isTa ? "பாதிக்கப்பட்ட பயிர் இலையை புகைப்படம் எடுத்து நோய் கண்டறிய மட்டுமே பயன்படுத்தப்படும்." : "Used solely to take clear photos of crop leaves for AI disease identification."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <Mic className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">
                      {isTa ? "மைக்ரோஃபோன் (Microphone)" : "Microphone Access"}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {isTa ? "தமிழில் விவசாயக் கேள்விகளை குரல் மூலம் கேட்க மட்டுமே பயன்படும்." : "Used only when speaking farming questions aloud in Tamil or English."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">
                      {isTa ? "இருப்பிடம் (Location)" : "Location / Weather"}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {isTa ? "வானிலை முன்னறிவிப்பை பெற உங்கள் மாவட்டத்தை கைமுறையாகவே தேர்ந்தெடுத்துள்ளீர்கள்." : "Used to fetch local weather forecast and disease risks. You can keep your manually selected district."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Ready Confirmation */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {isTa ? "உங்கள் பண்ணை விவரம் தயார்!" : "Your Farm Profile is Ready!"}
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  {isTa
                    ? "அக்ரிகார்ட் உங்கள் பயிர் ஆரோக்கியத்தை கண்காணிக்கவும், சரியான முடிவுகளை எடுக்கவும் இப்போது தயாராக உள்ளது."
                    : "AGRIGUARD can now help you monitor crop health and make informed farming decisions."}
                </p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-left text-xs space-y-1 max-w-xs mx-auto">
                <p><span className="font-bold text-emerald-950">{isTa ? "பயிர்:" : "Selected Crop:"}</span> {cropType.toUpperCase()} ({soilType})</p>
                <p><span className="font-bold text-emerald-950">{isTa ? "மாவட்டம்:" : "District:"}</span> {district}</p>
                <p><span className="font-bold text-emerald-950">{isTa ? "பாசனம்:" : "Irrigation:"}</span> {irrigationMethod}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              {isTa ? "பின்செல்" : "Back"}
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors active:scale-95"
            >
              <span>{isTa ? "அடுத்து" : "Next"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors active:scale-95"
            >
              {isTa ? "தொடங்குங்கள்" : "Enter AGRIGUARD"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
