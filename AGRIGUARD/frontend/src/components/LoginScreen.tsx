import React, { useState, useEffect } from 'react';
import {
  Eye, EyeOff, Smartphone, Lock, Globe, Leaf,
  ChevronRight, AlertCircle, Loader2, CheckCircle2, RefreshCw
} from 'lucide-react';
import { Language } from '../types';
import { api, BackendHealthStatus } from '../services/api';

type AuthLanguage = 'ta' | 'en' | 'hi';

interface LoginScreenProps {
  onLogin: (token: string, user: AuthUser) => void;
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  initialLanguage: AuthLanguage;
}

export interface AuthUser {
  id: string;
  full_name: string;
  mobile: string;
  email: string;
  state: string;
  district: string;
  preferred_language: string;
}

const T: Record<AuthLanguage, Record<string, string>> = {
  ta: {
    appName: 'AGRIGUARD',
    tagline: 'AI விவசாய உதவியாளர்',
    welcomeBack: 'மீண்டும் வரவேற்கிறோம்!',
    signInSubtitle: 'உங்கள் கணக்கில் உள்நுழைக',
    mobileLabel: 'மொபைல் எண்',
    mobilePlaceholder: '10 இலக்க மொபைல் எண்',
    passwordLabel: 'கடவுச்சொல்',
    passwordPlaceholder: 'உங்கள் கடவுச்சொல்',
    signIn: 'உள்நுழை',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டீர்களா?',
    noAccount: 'கணக்கு இல்லையா?',
    createAccount: 'புதிய கணக்கு திறக்க',
    selectLanguage: 'மொழி தேர்வு',
    mobileError: 'சரியான 10 இலக்க மொபைல் எண் உள்ளிடவும்',
    passwordError: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்',
    loginFailed: 'உள்நுழைவு தோல்வியடைந்தது. மொபைல் அல்லது கடவுச்சொல் தவறு.',
    signingIn: 'உள்நுழைகிறது...',
    offlineNote: 'இணைப்பு இல்லாமல் நீங்கள் முன்பு உள்நுழைந்திருந்தால், தொடரலாம்.',
  },
  en: {
    appName: 'AGRIGUARD',
    tagline: 'AI Farmer Companion',
    welcomeBack: 'Welcome Back!',
    signInSubtitle: 'Sign in to your farm account',
    mobileLabel: 'Mobile Number',
    mobilePlaceholder: '10-digit mobile number',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Your password',
    signIn: 'Sign In',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    createAccount: 'Create Account',
    selectLanguage: 'Select Language',
    mobileError: 'Enter a valid 10-digit mobile number',
    passwordError: 'Password must be at least 6 characters',
    loginFailed: 'Login failed. Check your mobile number or password.',
    signingIn: 'Signing in...',
    offlineNote: 'If you signed in before, you can continue offline.',
  },
  hi: {
    appName: 'AGRIGUARD',
    tagline: 'AI किसान सहायक',
    welcomeBack: 'फिर से स्वागत है!',
    signInSubtitle: 'अपने खाते में साइन इन करें',
    mobileLabel: 'मोबाइल नंबर',
    mobilePlaceholder: '10 अंकों का मोबाइल नंबर',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'आपका पासवर्ड',
    signIn: 'साइन इन करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    noAccount: 'खाता नहीं है?',
    createAccount: 'खाता बनाएं',
    selectLanguage: 'भाषा चुनें',
    mobileError: 'सही 10 अंकों का मोबाइल नंबर दर्ज करें',
    passwordError: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
    loginFailed: 'लॉगिन विफल। मोबाइल या पासवर्ड गलत है।',
    signingIn: 'साइन इन हो रहा है...',
    offlineNote: 'यदि आपने पहले साइन इन किया है, तो आप ऑफलाइन जारी रख सकते हैं।',
  }
};

const LANG_OPTIONS: { code: AuthLanguage; label: string; flag: string }[] = [
  { code: 'ta', label: 'தமிழ்', flag: '🌾' },
  { code: 'en', label: 'English', flag: '🌿' },
  { code: 'hi', label: 'हिन्दी', flag: '🌱' },
];

export function LoginScreen({
  onLogin,
  onNavigateRegister,
  onNavigateForgotPassword,
  initialLanguage
}: LoginScreenProps) {
  const [lang, setLang] = useState<AuthLanguage>(initialLanguage);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ mobile?: string; password?: string }>({});
  const [healthStatus, setHealthStatus] = useState<BackendHealthStatus>({
    backendAvailable: false,
    databaseAvailable: false,
    authReady: false,
    status: 'checking'
  });

  const t = T[lang];

  const verifyHealth = async () => {
    setHealthStatus(prev => ({ ...prev, status: 'checking' }));
    const status = await api.checkBackendHealth(1);
    setHealthStatus(status);
  };

  useEffect(() => {
    verifyHealth();
  }, []);

  const validate = () => {
    const errs: { mobile?: string; password?: string } = {};
    const trimmed = mobile.trim();
    if (trimmed.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        errs.mobile = lang === 'ta' ? 'சரியான மின்னஞ்சல் உள்ளிடவும்' : lang === 'hi' ? 'सही ईमेल पता दर्ज करें' : 'Enter a valid email address';
      }
    } else {
      if (!/^\d{10}$/.test(trimmed)) {
        errs.mobile = t.mobileError;
      }
    }
    if (password.length < 6) errs.password = t.passwordError;
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    if (!validate()) return;
    setLoading(true);

    const isEmail = mobile.trim().includes('@');
    const result = await api.login({
      mobile: isEmail ? undefined : mobile.trim(),
      email: isEmail ? mobile.trim().toLowerCase() : undefined,
      password
    });

    setLoading(false);

    if (result.success && result.token && result.user) {
      localStorage.setItem('agriguard_auth_token', result.token);
      localStorage.setItem('agriguard_auth_user', JSON.stringify(result.user));
      onLogin(result.token, result.user);
    } else if (result.isBackendUnavailable) {
      setHealthStatus({
        backendAvailable: false,
        databaseAvailable: false,
        authReady: false,
        status: 'unavailable'
      });
      setError(
        lang === 'ta'
          ? 'சேவையகம் (Port 8001) இயங்கவில்லை. தயவுசெய்து backend சேவையை தொடங்கவும்.'
          : lang === 'hi'
          ? 'सर्वर (Port 8001) उपलब्ध नहीं है। कृपया बैकएंड सर्वर शुरू करें।'
          : 'Backend service is unavailable. Please verify the backend server is running on port 8001.'
      );
    } else if (result.isDbUnavailable) {
      setHealthStatus(prev => ({ ...prev, databaseAvailable: false, status: 'db_unavailable' }));
      setError(
        lang === 'ta'
          ? 'தரவுத்தளம் தற்காலிகமாக கிடைக்கவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'Database service is temporarily unavailable. Please retry.'
      );
    } else {
      const msg =
        (lang === 'ta' && result.message_ta) ||
        (lang === 'hi' && result.message_hi) ||
        result.message ||
        t.loginFailed;

      if (result.field === 'mobile') {
        setFieldErrors(p => ({ ...p, mobile: msg }));
      } else if (result.field === 'password') {
        setFieldErrors(p => ({ ...p, password: msg }));
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-600/5 blur-3xl" />
        {/* Decorative leaf patterns */}
        <svg className="absolute top-8 left-8 text-emerald-700/20 w-32 h-32" viewBox="0 0 100 100" fill="currentColor">
          <path d="M10 90 C30 70 80 60 90 10 C60 20 20 50 10 90Z" />
        </svg>
        <svg className="absolute bottom-12 right-12 text-teal-700/20 w-24 h-24" viewBox="0 0 100 100" fill="currentColor">
          <path d="M10 90 C30 70 80 60 90 10 C60 20 20 50 10 90Z" />
        </svg>
      </div>

      {/* Language Selector */}
      <div className="relative z-10 flex gap-2 mb-8">
        {LANG_OPTIONS.map(opt => (
          <button
            key={opt.code}
            onClick={() => setLang(opt.code)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              lang === opt.code
                ? 'bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-400/30 scale-105'
                : 'bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm'
            }`}
          >
            <span>{opt.flag}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/30 mb-4">
            <Leaf className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t.appName}</h1>
          <p className="text-emerald-300 text-sm mt-1 font-medium">{t.tagline}</p>
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-white">{t.welcomeBack}</h2>
            <p className="text-white/60 text-sm mt-1">{t.signInSubtitle}</p>
          </div>
        </div>

        {/* Backend Connection Status Pill */}
        <div className="flex items-center justify-center mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border ${
            healthStatus.status === 'ready'
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
              : healthStatus.status === 'checking'
              ? 'bg-amber-500/15 border-amber-400/30 text-amber-200'
              : healthStatus.status === 'db_unavailable'
              ? 'bg-yellow-500/20 border-yellow-400/40 text-yellow-200'
              : 'bg-red-500/20 border-red-400/40 text-red-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              healthStatus.status === 'ready'
                ? 'bg-emerald-400 animate-pulse'
                : healthStatus.status === 'checking'
                ? 'bg-amber-400 animate-ping'
                : healthStatus.status === 'db_unavailable'
                ? 'bg-yellow-400'
                : 'bg-red-400'
            }`} />
            <span>
              {healthStatus.status === 'ready'
                ? t.backendReady || 'Backend Ready (Port 8001)'
                : healthStatus.status === 'checking'
                ? t.checkingBackend || 'Checking backend...'
                : healthStatus.status === 'db_unavailable'
                ? 'Database Unavailable'
                : t.backendUnavailable || 'Backend Unavailable (Port 8001)'}
            </span>
            {healthStatus.status === 'unavailable' && (
              <button
                type="button"
                onClick={verifyHealth}
                className="ml-1 underline hover:text-white transition-colors"
              >
                {t.retryBackend || 'Retry'}
              </button>
            )}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Global Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5" htmlFor="login-mobile">
                {t.mobileLabel}
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="login-mobile"
                  type="text"
                  value={mobile}
                  onChange={e => { setMobile(e.target.value); setFieldErrors(p => ({...p, mobile: ''})); }}
                  placeholder={t.mobilePlaceholder}
                  className={`w-full bg-white/10 border ${fieldErrors.mobile ? 'border-red-400' : 'border-white/20'} text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all`}
                />
              </div>
              {fieldErrors.mobile && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.mobile}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5" htmlFor="login-password">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: ''})); }}
                  placeholder={t.passwordPlaceholder}
                  className={`w-full bg-white/10 border ${fieldErrors.password ? 'border-red-400' : 'border-white/20'} text-white placeholder-white/30 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onNavigateForgotPassword}
                className="text-emerald-300 hover:text-emerald-200 text-sm font-medium transition-colors"
              >
                {t.forgotPassword}
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:from-emerald-600 disabled:to-teal-600 text-emerald-950 font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:scale-[1.02] active:scale-[0.98] text-sm"
              id="btn-login-submit"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> {t.signingIn}</>
              ) : (
                <>{t.signIn} <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">{t.noAccount}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Create Account */}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="w-full flex items-center justify-center gap-2 bg-transparent border border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10 font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm"
            id="btn-navigate-register"
          >
            {t.createAccount} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Offline note */}
        <p className="text-center text-white/40 text-xs mt-4 px-4">{t.offlineNote}</p>
      </div>
    </div>
  );
}

export default LoginScreen;
