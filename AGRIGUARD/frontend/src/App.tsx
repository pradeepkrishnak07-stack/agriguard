import React, { useState, useEffect } from 'react';
import { Language, FarmProfile, WeatherData, DetectionRecord, SmartAlert } from './types';
import { storageService } from './services/storage';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { OnboardingModal } from './components/OnboardingModal';

// Auth Screens
import { LoginScreen, AuthUser } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen';

// App Screens
import { HomeScreen } from './components/HomeScreen';
import { DiseaseDetectionScreen } from './components/DiseaseDetectionScreen';
import { DiseaseRiskScreen } from './components/DiseaseRiskScreen';
import { IrrigationScreen } from './components/IrrigationScreen';
import { FertilizerScreen } from './components/FertilizerScreen';
import { VoiceAssistantScreen } from './components/VoiceAssistantScreen';
import { AlertsScreen } from './components/AlertsScreen';
import { SettingsScreen } from './components/SettingsScreen';

type AuthScreen = 'login' | 'register' | 'forgot_password';

// Check if user is already logged in
function getStoredAuth(): { token: string; user: AuthUser } | null {
  try {
    const token = localStorage.getItem('agriguard_auth_token');
    const userRaw = localStorage.getItem('agriguard_auth_user');
    if (token && userRaw) {
      return { token, user: JSON.parse(userRaw) };
    }
  } catch {
    // ignore
  }
  return null;
}

export function App() {
  const [language, setLanguage] = useState<Language>(storageService.getLanguage());
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [farmProfile, setFarmProfile] = useState<FarmProfile>(storageService.getProfile());
  const [weather, setWeather] = useState<WeatherData | null>(storageService.getCachedWeather());
  const [detectionHistory, setDetectionHistory] = useState<DetectionRecord[]>(storageService.getHistory());
  const [alerts, setAlerts] = useState<SmartAlert[]>(storageService.getAlerts());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!storageService.isOnboarded());
  const [selectedScanForDetails, setSelectedScanForDetails] = useState<DetectionRecord | null>(null);

  // Auth state
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getStoredAuth());
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getStoredAuth()?.user || null);

  // Listen to network changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial data loading (only when authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      loadProfileAndWeather();
      loadHistoryAndAlerts();
    }
  }, [isAuthenticated]);

  const loadProfileAndWeather = async () => {
    try {
      const prof = await api.getProfile();
      setFarmProfile(prof);
      const w = await api.getWeather(prof.latitude, prof.longitude, prof.location_name);
      setWeather(w);
    } catch (e) {
      console.warn("Error loading profile or weather", e);
    }
  };

  const loadHistoryAndAlerts = async () => {
    try {
      const h = await api.getHistory();
      setDetectionHistory(h);
      const a = await api.getAlerts();
      setAlerts(a);
    } catch (e) {
      console.warn("Error loading history and alerts", e);
    }
  };

  const handleToggleLanguage = () => {
    const newLang: Language = language === 'ta' ? 'en' : language === 'en' ? 'hi' : 'ta';
    setLanguage(newLang);
    storageService.setLanguage(newLang);
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    storageService.setLanguage(lang);
  };

  const handleSelectCrop = (cropId: string) => {
    const updated = { ...farmProfile, active_crop_id: cropId };
    setFarmProfile(updated);
    storageService.saveProfile(updated);
    api.updateProfile({ active_crop_id: cropId });
  };

  const handleCompleteOnboarding = async (profileData: Partial<FarmProfile>, selectedLang: Language) => {
    storageService.setOnboarded(true);
    setShowOnboarding(false);
    handleSetLanguage(selectedLang);
    const updated = await api.updateProfile(profileData);
    setFarmProfile(updated);
    const w = await api.getWeather(updated.latitude, updated.longitude, updated.location_name);
    setWeather(w);
  };

  // Auth handlers
  const handleLogin = (token: string, user: AuthUser) => {
    setAuthUser(user);
    setIsAuthenticated(true);
    // Sync language from user's preference if available
    const userLang = (user.preferred_language === 'ta' || user.preferred_language === 'en' || user.preferred_language === 'hi') ? user.preferred_language as Language : language;
    handleSetLanguage(userLang);
  };

  const handleLogout = () => {
    localStorage.removeItem('agriguard_auth_token');
    localStorage.removeItem('agriguard_auth_user');
    setAuthUser(null);
    setIsAuthenticated(false);
    setAuthScreen('login');
  };

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  // ---- AUTH FLOW ----
  if (!isAuthenticated) {
    const authLang: 'ta' | 'en' | 'hi' = (language === 'ta' || language === 'en' || language === 'hi') ? language : 'en';
    const initLang = authLang;

    if (authScreen === 'register') {
      return (
        <RegisterScreen
          onRegistered={handleLogin}
          onNavigateLogin={() => setAuthScreen('login')}
          initialLanguage={initLang}
        />
      );
    }

    if (authScreen === 'forgot_password') {
      return (
        <ForgotPasswordScreen
          onNavigateLogin={() => setAuthScreen('login')}
          initialLanguage={initLang}
        />
      );
    }

    // Default: login
    return (
      <LoginScreen
        onLogin={handleLogin}
        onNavigateRegister={() => setAuthScreen('register')}
        onNavigateForgotPassword={() => setAuthScreen('forgot_password')}
        initialLanguage={initLang}
      />
    );
  }

  // ---- MAIN APP (Authenticated) ----
  return (
    <div className="min-h-screen bg-[#f2f6f2] flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Agricultural Navbar */}
      <Navbar
        language={language}
        onToggleLanguage={handleToggleLanguage}
        isOnline={isOnline}
        crops={farmProfile.crops}
        activeCropId={farmProfile.active_crop_id}
        onSelectCrop={handleSelectCrop}
        unreadAlertsCount={unreadAlertsCount}
        onOpenAlerts={() => setCurrentTab('alerts' as TabType)}
      />

      {/* Offline / Cached Data Notification Banner */}
      <OfflineBanner
        isOnline={isOnline}
        isCachedWeather={!!weather?.is_cached}
        lastUpdatedFormatted={weather?.last_updated_formatted}
        language={language}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-5">
        {currentTab === 'home' && (
          <HomeScreen
            language={language}
            weather={weather}
            farmProfile={farmProfile}
            detectionHistory={detectionHistory}
            alerts={alerts}
            authUser={authUser}
            onNavigate={(tab) => {
              if (tab !== 'detect') {
                setSelectedScanForDetails(null);
              }
              setCurrentTab(tab);
            }}
            onRefreshWeather={loadProfileAndWeather}
            onViewScanDetails={(scan) => {
              setSelectedScanForDetails(scan);
              setCurrentTab('detect');
            }}
          />
        )}

        {currentTab === 'detect' && (
          <DiseaseDetectionScreen
            language={language}
            farmProfile={farmProfile}
            detectionHistory={detectionHistory}
            onHistoryUpdated={loadHistoryAndAlerts}
            initialSelectedScan={selectedScanForDetails}
            onClearInitialSelectedScan={() => setSelectedScanForDetails(null)}
            onSetLanguage={handleSetLanguage}
          />
        )}

        {currentTab === 'risk' && (
          <DiseaseRiskScreen
            language={language}
            farmProfile={farmProfile}
          />
        )}

        {currentTab === 'irrigation' && (
          <IrrigationScreen
            language={language}
            farmProfile={farmProfile}
          />
        )}

        {currentTab === 'fertilizer' && (
          <FertilizerScreen
            language={language}
            farmProfile={farmProfile}
            authUser={authUser}
            onSetLanguage={handleSetLanguage}
          />
        )}

        {currentTab === 'assistant' && (
          <VoiceAssistantScreen
            language={language}
            farmProfile={farmProfile}
          />
        )}



        {(currentTab as string) === 'alerts' && (
          <AlertsScreen
            language={language}
            alerts={alerts}
            onAlertsUpdated={loadHistoryAndAlerts}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            language={language}
            onSetLanguage={handleSetLanguage}
            farmProfile={farmProfile}
            onProfileUpdated={(updated) => setFarmProfile(updated)}
            onLogout={handleLogout}
            authUser={authUser}
          />
        )}
      </main>

      {/* Mobile-Friendly Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        language={language}
      />

      {/* Onboarding Flow Modal for first-time farmer setup */}
      <OnboardingModal
        isOpen={showOnboarding}
        initialLanguage={language}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}

export default App;
