import React, { useState, useEffect } from 'react';
import {
  User, Smartphone, Mail, MapPin, Lock, Eye, EyeOff,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Loader2, Leaf, RefreshCw
} from 'lucide-react';
import { api, BackendHealthStatus } from '../services/api';

type AuthLanguage = 'ta' | 'en' | 'hi';

interface RegisterScreenProps {
  onRegistered: (token: string, user: any) => void;
  onNavigateLogin: () => void;
  initialLanguage: AuthLanguage;
}

const T: Record<AuthLanguage, Record<string, string>> = {
  ta: {
    title: 'புதிய கணக்கு உருவாக்கு',
    subtitle: 'AGRIGUARD-ல் பதிவு செய்யுங்கள்',
    fullName: 'முழு பெயர்',
    fullNamePlaceholder: 'உங்கள் முழு பெயர்',
    mobile: 'மொபைல் எண்',
    mobilePlaceholder: '10 இலக்க மொபைல் எண்',
    email: 'மின்னஞ்சல்',
    emailPlaceholder: 'உங்கள் மின்னஞ்சல்',
    state: 'மாநிலம்',
    statePlaceholder: 'மாநிலம் தேர்வு செய்யவும்',
    district: 'மாவட்டம்',
    districtPlaceholder: 'மாவட்டம் தேர்வு செய்யவும்',
    password: 'கடவுச்சொல்',
    passwordPlaceholder: 'குறைந்தது 6 எழுத்துகள்',
    confirmPassword: 'கடவுச்சொல் உறுதிப்படுத்தல்',
    confirmPasswordPlaceholder: 'கடவுச்சொல் மீண்டும் உள்ளிடவும்',
    createAccount: 'கணக்கு உருவாக்கு',
    backToLogin: 'உள்நுழைவுக்கு திரும்பு',
    alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    signIn: 'உள்நுழை',
    registering: 'பதிவு செய்கிறது...',
    successMsg: 'பதிவு வெற்றிகரமாக நடந்தது!',
    // Errors
    nameRequired: 'பெயர் குறைந்தது 2 எழுத்துகள் இருக்க வேண்டும்',
    mobileError: 'சரியான 10 இலக்க மொபைல் எண் உள்ளிடவும்',
    emailError: 'சரியான மின்னஞ்சல் முகவரி உள்ளிடவும்',
    stateRequired: 'மாநிலம் தேர்வு செய்யவும்',
    districtRequired: 'மாவட்டம் தேர்வு செய்யவும்',
    passwordError: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்',
    passwordMismatch: 'கடவுச்சொல்கள் பொருந்தவில்லை',
    mobileExists: 'இந்த மொபைல் எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது',
    emailExists: 'இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது',
    regFailed: 'பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
  },
  en: {
    title: 'Create Your Account',
    subtitle: 'Join AGRIGUARD today',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Your full name',
    mobile: 'Mobile Number',
    mobilePlaceholder: '10-digit mobile number',
    email: 'Email Address',
    emailPlaceholder: 'Your email address',
    state: 'State',
    statePlaceholder: 'Select your state',
    district: 'District',
    districtPlaceholder: 'Select your district',
    password: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    createAccount: 'Create Account',
    backToLogin: 'Back to Sign In',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
    registering: 'Creating account...',
    successMsg: 'Account created successfully!',
    nameRequired: 'Name must be at least 2 characters',
    mobileError: 'Enter a valid 10-digit mobile number',
    emailError: 'Enter a valid email address',
    stateRequired: 'Please select your state',
    districtRequired: 'Please select your district',
    passwordError: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    mobileExists: 'This mobile number is already registered',
    emailExists: 'This email address is already registered',
    regFailed: 'Registration failed. Please try again.',
  },
  hi: {
    title: 'नया खाता बनाएं',
    subtitle: 'AGRIGUARD में आज ही जुड़ें',
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'आपका पूरा नाम',
    mobile: 'मोबाइल नंबर',
    mobilePlaceholder: '10 अंकों का मोबाइल नंबर',
    email: 'ईमेल पता',
    emailPlaceholder: 'आपका ईमेल पता',
    state: 'राज्य',
    statePlaceholder: 'अपना राज्य चुनें',
    district: 'जिला',
    districtPlaceholder: 'अपना जिला चुनें',
    password: 'पासवर्ड',
    passwordPlaceholder: 'कम से कम 6 अक्षर',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    confirmPasswordPlaceholder: 'पासवर्ड दोबारा दर्ज करें',
    createAccount: 'खाता बनाएं',
    backToLogin: 'साइन इन पर वापस जाएं',
    alreadyHaveAccount: 'पहले से खाता है?',
    signIn: 'साइन इन करें',
    registering: 'खाता बन रहा है...',
    successMsg: 'खाता सफलतापूर्वक बनाया गया!',
    nameRequired: 'नाम कम से कम 2 अक्षर होना चाहिए',
    mobileError: 'सही 10 अंकों का मोबाइल नंबर दर्ज करें',
    emailError: 'सही ईमेल पता दर्ज करें',
    stateRequired: 'कृपया अपना राज्य चुनें',
    districtRequired: 'कृपया अपना जिला चुनें',
    passwordError: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
    passwordMismatch: 'पासवर्ड मेल नहीं खाते',
    mobileExists: 'यह मोबाइल नंबर पहले से पंजीकृत है',
    emailExists: 'यह ईमेल पता पहले से पंजीकृत है',
    regFailed: 'पंजीकरण विफल। कृपया पुनः प्रयास करें।',
  }
};

// India States and Districts
const INDIA_STATES: Record<string, string[]> = {
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Thanjavur', 'Tiruchirappalli', 'Tirunelveli', 'Vellore', 'Erode', 'Dindigul', 'Tirupur', 'Kancheepuram', 'Ramanathapuram', 'Nagapattinam', 'Cuddalore', 'Villupuram', 'Pudukottai', 'Sivaganga', 'Virudhunagar', 'Krishnagiri', 'Dharmapuri', 'Namakkal', 'Perambalur', 'Ariyalur', 'Karur', 'Nilgiris', 'Theni', 'Tenkasi', 'Kallakurichi', 'Ranipet', 'Chengalpattu', 'Tirupattur', 'Tiruvarur', 'Mayiladuthurai'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kakinada', 'Rajahmundry', 'Tirupati', 'Anantapur', 'Kadapa', 'Eluru', 'Ongole', 'Srikakulam', 'Vizianagaram', 'Chittoor', 'Krishna', 'West Godavari', 'East Godavari', 'Prakasam', 'Nellore', 'Alluri Sitharama Raju'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi', 'Tumakuru', 'Davangere', 'Ballari', 'Vijayapura', 'Dharwad', 'Shivamogga', 'Hassan', 'Kalaburagi', 'Raichur', 'Bidar', 'Haveri', 'Udupi', 'Kodagu', 'Chikkamagaluru'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Malappuram', 'Kannur', 'Kasaragod', 'Idukki', 'Kottayam', 'Wayanad', 'Pathanamthitta'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Satara', 'Jalgaon', 'Latur', 'Osmanabad', 'Nanded', 'Yavatmal', 'Akola', 'Raigad', 'Ratnagiri', 'Sindhudurg', 'Buldhana'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda', 'Medak', 'Rangareddy', 'Mahabubnagar', 'Adilabad', 'Sangareddy', 'Siddipet', 'Vikarabad', 'Mancherial', 'Rajanna Sircilla'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Mehsana', 'Kutch', 'Patan', 'Banaskantha', 'Sabarkantha'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Alwar', 'Ajmer', 'Bhilwara', 'Sikar', 'Barmer', 'Nagaur', 'Churu', 'Jhunjhunu', 'Hanumangarh', 'Sri Ganganagar'],
  'Uttar Pradesh': ['Lucknow', 'Agra', 'Varanasi', 'Kanpur', 'Allahabad', 'Meerut', 'Aligarh', 'Gorakhpur', 'Bareilly', 'Moradabad', 'Ghaziabad', 'Mathura', 'Muzaffarnagar', 'Firozabad', 'Rampur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Satna', 'Rewa', 'Dewas', 'Chhindwara', 'Ratlam', 'Vidisha', 'Khandwa', 'Mandsaur'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Gurdaspur', 'Ferozepur', 'Rupnagar', 'Mohali', 'Kapurthala', 'Faridkot', 'Mansa', 'Moga', 'Sangrur'],
  'Haryana': ['Gurugram', 'Faridabad', 'Rohtak', 'Hisar', 'Karnal', 'Panipat', 'Ambala', 'Yamunanagar', 'Sonipat', 'Bhiwani', 'Fatehabad', 'Jind', 'Kurukshetra', 'Mahendragarh'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Motihari', 'Samastipur', 'Hajipur', 'Madhubani', 'Sitamarhi'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling', 'Malda', 'Murshidabad', 'Nadia', 'Cooch Behar', 'North 24 Parganas', 'South 24 Parganas', 'Bardhaman', 'Medinipur'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Berhampur', 'Sambalpur', 'Balasore', 'Koraput', 'Mayurbhanj', 'Ganjam', 'Sundargarh', 'Jajpur', 'Angul', 'Kendrapara'],
  'Other': ['Other District'],
};

const LANG_OPTIONS: { code: AuthLanguage; label: string }[] = [
  { code: 'ta', label: 'தமிழ்' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
];

export function RegisterScreen({ onRegistered, onNavigateLogin, initialLanguage }: RegisterScreenProps) {
  const [lang, setLang] = useState<AuthLanguage>(initialLanguage);
  const t = T[lang];

  const [form, setForm] = useState({
    full_name: '',
    mobile: '',
    email: '',
    state: '',
    district: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const districts = form.state ? (INDIA_STATES[form.state] || []) : [];

  const update = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    setFieldErrors(p => ({ ...p, [field]: '' }));
    setGlobalError('');
    if (field === 'state') setForm(p => ({ ...p, state: value, district: '' }));
  };

  const handleMobileChange = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    update('mobile', digits.slice(0, 10));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.full_name.trim().length < 2) errs.full_name = t.nameRequired;
    if (!/^\d{10}$/.test(form.mobile.trim())) errs.mobile = t.mobileError;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = t.emailError;
    if (!form.state) errs.state = t.stateRequired;
    if (!form.district) errs.district = t.districtRequired;
    if (form.password.length < 6) errs.password = t.passwordError;
    if (form.password !== form.confirm_password) errs.confirm_password = t.passwordMismatch;
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const [healthStatus, setHealthStatus] = useState<BackendHealthStatus>({
    backendAvailable: false,
    databaseAvailable: false,
    authReady: false,
    status: 'checking'
  });

  const verifyHealth = async () => {
    setHealthStatus(prev => ({ ...prev, status: 'checking' }));
    const status = await api.checkBackendHealth(1);
    setHealthStatus(status);
  };

  useEffect(() => {
    verifyHealth();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setGlobalError('');
    setFieldErrors({});
    if (!validate()) return;
    setLoading(true);

    const result = await api.register({
      full_name: form.full_name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim().toLowerCase(),
      state: form.state.trim(),
      district: form.district.trim(),
      password: form.password,
      confirm_password: form.confirm_password,
      preferred_language: lang
    });

    setLoading(false);

    if (result.success && result.token && result.user) {
      setSuccess(true);
      localStorage.setItem('agriguard_auth_token', result.token);
      localStorage.setItem('agriguard_auth_user', JSON.stringify(result.user));
      setTimeout(() => onRegistered(result.token!, result.user), 1200);
    } else if (result.isBackendUnavailable) {
      setHealthStatus({
        backendAvailable: false,
        databaseAvailable: false,
        authReady: false,
        status: 'unavailable'
      });
      setGlobalError(
        lang === 'ta'
          ? 'சேவையகம் (Port 8001) இயங்கவில்லை. தயவுசெய்து backend சேவையை தொடங்கவும்.'
          : lang === 'hi'
          ? 'सर्वर (Port 8001) उपलब्ध नहीं है। कृपया बैकएंड सर्वर शुरू करें।'
          : 'Backend service is unavailable. Please verify the backend server is running on port 8001.'
      );
    } else if (result.isDbUnavailable) {
      setHealthStatus(prev => ({ ...prev, databaseAvailable: false, status: 'db_unavailable' }));
      setGlobalError(
        lang === 'ta'
          ? 'தரவுத்தளம் தற்காலிகமாக கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.'
          : 'Database service is temporarily unavailable. Please retry.'
      );
    } else {
      const msg =
        (lang === 'ta' && result.message_ta) ||
        (lang === 'hi' && result.message_hi) ||
        result.message ||
        t.regFailed;

      const errField = result.field;
      const errCode = result.error_code;

      if (errField === 'mobile' || errCode === 'DUPLICATE_MOBILE') {
        setFieldErrors(p => ({ ...p, mobile: msg }));
      } else if (errField === 'email' || errCode === 'DUPLICATE_EMAIL') {
        setFieldErrors(p => ({ ...p, email: msg }));
      } else if (errField === 'password') {
        setFieldErrors(p => ({ ...p, password: msg }));
      } else if (errField === 'confirm_password') {
        setFieldErrors(p => ({ ...p, confirm_password: msg }));
      } else {
        const msgLower = (msg || '').toLowerCase();
        if (msgLower.includes('mobile') || msgLower.includes('மொபைல்') || msgLower.includes('मोबाइल')) {
          setFieldErrors(p => ({ ...p, mobile: msg }));
        } else if (msgLower.includes('email') || msgLower.includes('மின்னஞ்சல்') || msgLower.includes('ईमेल')) {
          setFieldErrors(p => ({ ...p, email: msg }));
        } else {
          setGlobalError(msg || t.regFailed);
        }
      }
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-white/10 border ${fieldErrors[field] ? 'border-red-400' : 'border-white/20'} text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 flex flex-col items-center justify-start p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="p-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
            id="btn-back-to-login"
            aria-label="Back to login"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">{t.title}</h1>
              <p className="text-emerald-300 text-xs">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Language tabs */}
        <div className="flex gap-2 mb-5">
          {LANG_OPTIONS.map(opt => (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLang(opt.code)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                lang === opt.code
                  ? 'bg-emerald-400 text-emerald-950'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Success State */}
        {success && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-400/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <p className="text-emerald-300 font-semibold text-lg text-center">{t.successMsg}</p>
          </div>
        )}

        {/* Form Card */}
        {!success && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              {/* Global Error */}
              {globalError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{globalError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1" htmlFor="reg-fullname">{t.fullName}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    id="reg-fullname"
                    type="text"
                    value={form.full_name}
                    onChange={e => update('full_name', e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className={inputClass('full_name')}
                  />
                </div>
                {fieldErrors.full_name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.full_name}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1" htmlFor="reg-mobile">{t.mobile}</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    id="reg-mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.mobile}
                    onChange={e => handleMobileChange(e.target.value)}
                    placeholder={t.mobilePlaceholder}
                    className={inputClass('mobile')}
                  />
                </div>
                {fieldErrors.mobile && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.mobile}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1" htmlFor="reg-email">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    id="reg-email"
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className={inputClass('email')}
                  />
                </div>
                {fieldErrors.email && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.email}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1" htmlFor="reg-state">{t.state}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  <select
                    id="reg-state"
                    value={form.state}
                    onChange={e => { update('state', e.target.value); setForm(p => ({ ...p, state: e.target.value, district: '' })); }}
                    className={`${inputClass('state')} appearance-none cursor-pointer`}
                  >
                    <option value="" className="bg-emerald-950">{t.statePlaceholder}</option>
                    {Object.keys(INDIA_STATES).map(s => (
                      <option key={s} value={s} className="bg-emerald-950">{s}</option>
                    ))}
                  </select>
                </div>
                {fieldErrors.state && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.state}</p>}
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1" htmlFor="reg-district">{t.district}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  <select
                    id="reg-district"
                    value={form.district}
                    onChange={e => update('district', e.target.value)}
                    disabled={!form.state}
                    className={`${inputClass('district')} appearance-none cursor-pointer disabled:opacity-40`}
                  >
                    <option value="" className="bg-emerald-950">{t.districtPlaceholder}</option>
                    {districts.map(d => (
                      <option key={d} value={d} className="bg-emerald-950">{d}</option>
                    ))}
                  </select>
                </div>
                {fieldErrors.district && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.district}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1" htmlFor="reg-password">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`${inputClass('password')} pr-12`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1" htmlFor="reg-confirm-password">{t.confirmPassword}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirm_password}
                    onChange={e => update('confirm_password', e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder}
                    className={`${inputClass('confirm_password')} pr-12`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirm_password && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.confirm_password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="btn-register-submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:from-emerald-600 disabled:to-teal-600 text-emerald-950 font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] text-sm mt-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />{t.registering}</>
                ) : (
                  <>{t.createAccount} <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            {/* Back to sign in */}
            <div className="mt-5 text-center">
              <span className="text-white/50 text-sm">{t.alreadyHaveAccount} </span>
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-emerald-300 hover:text-emerald-200 text-sm font-semibold transition-colors"
              >
                {t.signIn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterScreen;
