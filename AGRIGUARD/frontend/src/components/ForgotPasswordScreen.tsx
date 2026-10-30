import React, { useState } from 'react';
import {
  Mail, Lock, Eye, EyeOff, ChevronLeft,
  AlertCircle, CheckCircle2, Loader2, Leaf, KeyRound, RefreshCw
} from 'lucide-react';
import { API_BASE_URL as API_BASE } from '../services/api';

type AuthLanguage = 'ta' | 'en' | 'hi';

interface ForgotPasswordScreenProps {
  onNavigateLogin: () => void;
  initialLanguage: AuthLanguage;
}

const T: Record<AuthLanguage, Record<string, string>> = {
  ta: {
    title: 'கடவுச்சொல் மறந்துவிட்டதா?',
    subtitle: 'கவலைப்படாதீர்கள், நாங்கள் உதவுகிறோம்',
    stepEmail: 'மின்னஞ்சல் சரிபார்ப்பு',
    stepReset: 'கடவுச்சொல் மாற்று',
    emailLabel: 'பதிவுசெய்த மின்னஞ்சல்',
    emailPlaceholder: 'உங்கள் மின்னஞ்சல் முகவரி',
    sendOTP: 'OTP அனுப்பு',
    sending: 'அனுப்புகிறது...',
    otpSentMsg: 'OTP உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டது.',
    otpHint: '(சேவை கட்டமைப்பில்: OTP நேரடியாக காட்டப்படும்)',
    tokenLabel: 'சரிபார்ப்பு குறியீடு (OTP)',
    tokenPlaceholder: 'OTP குறியீடு உள்ளிடவும்',
    newPasswordLabel: 'புதிய கடவுச்சொல்',
    newPasswordPlaceholder: 'புதிய கடவுச்சொல்',
    confirmPasswordLabel: 'கடவுச்சொல் உறுதிப்படுத்தல்',
    confirmPasswordPlaceholder: 'கடவுச்சொல் மீண்டும் உள்ளிடவும்',
    resetPassword: 'கடவுச்சொல் மாற்று',
    resetting: 'மாற்றுகிறது...',
    backToLogin: 'உள்நுழைவுக்கு திரும்பு',
    tryAgain: 'மீண்டும் முயற்சி',
    successTitle: 'கடவுச்சொல் மாற்றப்பட்டது!',
    successMsg: 'உங்கள் கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது. உள்நுழைக.',
    goToLogin: 'உள்நுழை',
    emailError: 'சரியான மின்னஞ்சல் முகவரி உள்ளிடவும்',
    emailNotFound: 'இந்த மின்னஞ்சல் பதிவு செய்யப்படவில்லை.',
    tokenError: 'OTP குறியீடு உள்ளிடவும்',
    passwordError: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்',
    passwordMismatch: 'கடவுச்சொல்கள் பொருந்தவில்லை',
    resetFailed: 'கடவுச்சொல் மாற்று தோல்வியடைந்தது.',
    sendFailed: 'OTP அனுப்புவதில் தோல்வி.',
  },
  en: {
    title: 'Forgot Password?',
    subtitle: "No worries, we'll help you reset it",
    stepEmail: 'Verify Email',
    stepReset: 'Reset Password',
    emailLabel: 'Registered Email',
    emailPlaceholder: 'Your registered email address',
    sendOTP: 'Send OTP',
    sending: 'Sending...',
    otpSentMsg: 'An OTP has been sent to your email.',
    otpHint: '(In dev mode, the OTP/token is shown below)',
    tokenLabel: 'Verification Code (OTP)',
    tokenPlaceholder: 'Enter the OTP code',
    newPasswordLabel: 'New Password',
    newPasswordPlaceholder: 'Your new password',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter new password',
    resetPassword: 'Reset Password',
    resetting: 'Resetting...',
    backToLogin: 'Back to Sign In',
    tryAgain: 'Try Again',
    successTitle: 'Password Reset!',
    successMsg: 'Your password has been changed successfully. Sign in to continue.',
    goToLogin: 'Sign In Now',
    emailError: 'Enter a valid email address',
    emailNotFound: 'This email is not registered with AGRIGUARD.',
    tokenError: 'Enter the OTP code',
    passwordError: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    resetFailed: 'Password reset failed. Check the OTP and try again.',
    sendFailed: 'Failed to send OTP. Please try again.',
  },
  hi: {
    title: 'पासवर्ड भूल गए?',
    subtitle: 'चिंता न करें, हम आपकी मदद करेंगे',
    stepEmail: 'ईमेल सत्यापन',
    stepReset: 'पासवर्ड रीसेट',
    emailLabel: 'पंजीकृत ईमेल',
    emailPlaceholder: 'आपका पंजीकृत ईमेल पता',
    sendOTP: 'OTP भेजें',
    sending: 'भेज रहे हैं...',
    otpSentMsg: 'आपके ईमेल पर OTP भेजा गया है।',
    otpHint: '(डेव मोड में: OTP नीचे दिखाया जाएगा)',
    tokenLabel: 'सत्यापन कोड (OTP)',
    tokenPlaceholder: 'OTP कोड दर्ज करें',
    newPasswordLabel: 'नया पासवर्ड',
    newPasswordPlaceholder: 'आपका नया पासवर्ड',
    confirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
    confirmPasswordPlaceholder: 'नया पासवर्ड दोबारा दर्ज करें',
    resetPassword: 'पासवर्ड रीसेट करें',
    resetting: 'रीसेट हो रहा है...',
    backToLogin: 'साइन इन पर वापस जाएं',
    tryAgain: 'फिर से प्रयास करें',
    successTitle: 'पासवर्ड रीसेट हो गया!',
    successMsg: 'आपका पासवर्ड सफलतापूर्वक बदल दिया गया है।',
    goToLogin: 'अभी साइन इन करें',
    emailError: 'सही ईमेल पता दर्ज करें',
    emailNotFound: 'यह ईमेल AGRIGUARD में पंजीकृत नहीं है।',
    tokenError: 'OTP कोड दर्ज करें',
    passwordError: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
    passwordMismatch: 'पासवर्ड मेल नहीं खाते',
    resetFailed: 'पासवर्ड रीसेट विफल। OTP जांचें और पुनः प्रयास करें।',
    sendFailed: 'OTP भेजने में विफल। कृपया पुनः प्रयास करें।',
  }
};

type Step = 'email' | 'reset' | 'success';

export function ForgotPasswordScreen({ onNavigateLogin, initialLanguage }: ForgotPasswordScreenProps) {
  const [lang, setLang] = useState<AuthLanguage>(initialLanguage);
  const t = T[lang];

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devToken, setDevToken] = useState(''); // Show token in dev for testing
  const [otpSentNote, setOtpSentNote] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldErrors({ email: t.emailError });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
        signal: AbortSignal.timeout(8000),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        setError(
          lang === 'ta'
            ? 'சேவையகம் (Port 8001) கிடைக்கவில்லை.'
            : 'Backend service is unavailable on port 8001.'
        );
        return;
      }
      if (res.ok && data?.success) {
        setOtpSentNote(t.otpSentMsg);
        if (data.reset_token) setDevToken(data.reset_token); // dev fallback
        setStep('reset');
      } else {
        let msg = '';
        if (typeof data.detail === 'string') {
          msg = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          msg = data.detail[0]?.msg || '';
        } else if (data.detail && typeof data.detail === 'object') {
          msg = (lang === 'ta' && data.detail.message_ta) ||
                (lang === 'hi' && data.detail.message_hi) ||
                data.detail.message || '';
        } else {
          msg = data.message || '';
        }

        if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('email')) {
          setFieldErrors({ email: t.emailNotFound });
        } else {
          setError(msg || t.sendFailed);
        }
      }
    } catch {
      setError(
        lang === 'ta'
          ? 'சேவையகத்தை இணைக்க முடியவில்லை. இணைய இணைப்பு அல்லது சேவையகத்தை சரிபார்க்கவும்.'
          : lang === 'hi'
          ? 'सर्वर से कनेक्ट नहीं हो सका। कृपया अपना नेटवर्क जांचें।'
          : 'Unable to reach the server. Please check your network or verify the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs: Record<string, string> = {};
    if (!token.trim()) errs.token = t.tokenError;
    if (newPassword.length < 6) errs.newPassword = t.passwordError;
    if (newPassword !== confirmPassword) errs.confirmPassword = t.passwordMismatch;
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), new_password: newPassword, confirm_password: confirmPassword }),
        signal: AbortSignal.timeout(8000),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        setError(
          lang === 'ta'
            ? 'சேவையகம் (Port 8001) கிடைக்கவில்லை.'
            : 'Backend service is unavailable on port 8001.'
        );
        return;
      }
      if (res.ok && data?.success) {
        setStep('success');
      } else {
        let msg = '';
        if (typeof data.detail === 'string') {
          msg = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          msg = data.detail[0]?.msg || t.resetFailed;
        } else if (data.detail && typeof data.detail === 'object') {
          msg = (lang === 'ta' && data.detail.message_ta) ||
                (lang === 'hi' && data.detail.message_hi) ||
                data.detail.message || t.resetFailed;
        } else {
          msg = data.message || t.resetFailed;
        }
        setError(msg);
      }
    } catch {
      setError(
        lang === 'ta'
          ? 'சேவையகத்தை இணைக்க முடியவில்லை. இணைய இணைப்பு அல்லது சேவையகத்தை சரிபார்க்கவும்.'
          : lang === 'hi'
          ? 'सर्वर से कनेक्ट नहीं हो सका। कृपया अपना नेटवर्क जांचें।'
          : 'Unable to reach the server. Please check your network or verify the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-white/10 border ${fieldErrors[field] ? 'border-red-400' : 'border-white/20'} text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="p-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
            aria-label="Back"
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

        {/* Step Indicator */}
        {step !== 'success' && (
          <div className="flex gap-2 mb-5">
            {(['email', 'reset'] as Step[]).map((s, i) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all ${
                  step === s ? 'bg-emerald-400 text-emerald-950' :
                  i < (['email', 'reset'] as Step[]).indexOf(step) ? 'bg-emerald-600 text-white' :
                  'bg-white/10 text-white/40'
                }`}>{i + 1}</div>
                <span className={`text-xs font-medium ${step === s ? 'text-emerald-300' : 'text-white/40'}`}>
                  {i === 0 ? t.stepEmail : t.stepReset}
                </span>
                {i === 0 && <div className={`flex-1 h-px ${step === 'reset' ? 'bg-emerald-400' : 'bg-white/10'} transition-all`} />}
              </div>
            ))}
          </div>
        )}

        {/* Step: Email */}
        {step === 'email' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSendOTP} className="space-y-4" noValidate>
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5" htmlFor="forgot-email">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setFieldErrors({}); }}
                    placeholder={t.emailPlaceholder}
                    className={inputClass('email')}
                  />
                </div>
                {fieldErrors.email && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.email}</p>}
              </div>
              <button
                type="submit"
                id="btn-send-otp"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:from-emerald-600 disabled:to-teal-600 text-emerald-950 font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />{t.sending}</> : <><KeyRound className="w-5 h-5" />{t.sendOTP}</>}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button type="button" onClick={onNavigateLogin} className="text-emerald-300 hover:text-emerald-200 text-sm font-medium transition-colors">
                {t.backToLogin}
              </button>
            </div>
          </div>
        )}

        {/* Step: Reset Password */}
        {step === 'reset' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
            {/* OTP Sent confirmation */}
            <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300 text-sm mb-4">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div>
                <span>{otpSentNote}</span>
                {devToken && (
                  <div className="mt-1 text-xs text-emerald-200 bg-emerald-900/40 rounded p-1.5 font-mono break-all">
                    {t.otpHint}<br/>
                    <strong>Token:</strong> {devToken}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleReset} className="space-y-4" noValidate>
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
              )}

              {/* OTP Token */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5" htmlFor="forgot-token">{t.tokenLabel}</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="forgot-token"
                    type="text"
                    value={token}
                    onChange={e => { setToken(e.target.value); setFieldErrors(p => ({...p, token: ''})); }}
                    placeholder={t.tokenPlaceholder}
                    className={inputClass('token')}
                  />
                </div>
                {fieldErrors.token && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.token}</p>}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5" htmlFor="forgot-newpwd">{t.newPasswordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="forgot-newpwd"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setFieldErrors(p => ({...p, newPassword: ''})); }}
                    placeholder={t.newPasswordPlaceholder}
                    className={`${inputClass('newPassword')} pr-12`}
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.newPassword && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.newPassword}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5" htmlFor="forgot-confirmpwd">{t.confirmPasswordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="forgot-confirmpwd"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(p => ({...p, confirmPassword: ''})); }}
                    placeholder={t.confirmPasswordPlaceholder}
                    className={`${inputClass('confirmPassword')} pr-12`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                id="btn-reset-password"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:from-emerald-600 disabled:to-teal-600 text-emerald-950 font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />{t.resetting}</> : <><RefreshCw className="w-5 h-5" />{t.resetPassword}</>}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button type="button" onClick={() => setStep('email')} className="text-white/50 hover:text-emerald-300 text-sm transition-colors">
                ← {t.tryAgain}
              </button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-5 text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-400/20 flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">{t.successTitle}</h2>
              <p className="text-white/60 text-sm mt-2">{t.successMsg}</p>
            </div>
            <button
              type="button"
              id="btn-go-to-login"
              onClick={onNavigateLogin}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-emerald-950 font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/30 hover:scale-[1.02]"
            >
              {t.goToLogin}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordScreen;
