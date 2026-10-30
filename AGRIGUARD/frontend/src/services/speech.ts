import { API_BASE_URL } from './api';

export class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private voices: SpeechSynthesisVoice[] = [];
  private voiceListeners: Array<(voices: SpeechSynthesisVoice[]) => void> = [];
  private audioPlayer: HTMLAudioElement | null = null;
  private isAudioMode = false;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }

    if (this.isSpeechSynthesisSupported()) {
      this.refreshVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.refreshVoices();
      };
    }
  }

  isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private refreshVoices(): void {
    if (!this.isSpeechSynthesisSupported()) return;
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        this.voices = v;
        this.voiceListeners.forEach(listener => {
          try {
            listener(this.voices);
          } catch (e) {}
        });
      }
    } catch (e) {
      console.warn("Could not retrieve speechSynthesis voices", e);
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSpeechSynthesisSupported()) return [];
    if (this.voices.length === 0) {
      this.refreshVoices();
    }
    return this.voices;
  }

  onVoicesLoaded(callback: (voices: SpeechSynthesisVoice[]) => void): () => void {
    this.voiceListeners.push(callback);
    if (this.voices.length > 0) {
      callback(this.voices);
    }
    return () => {
      this.voiceListeners = this.voiceListeners.filter(l => l !== callback);
    };
  }

  getVoiceForLanguage(lang: 'ta' | 'en' | 'hi'): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    if (lang === 'ta') {
      // 1. Exact ta-IN locale match
      const exactMatch = voices.find(v => {
        const l = v.lang.toLowerCase().replace('_', '-');
        return l === 'ta-in' || l === 'ta_in';
      });
      if (exactMatch) return exactMatch;

      // 2. Starts with ta (e.g. ta, ta-LK, ta-SG, ta-MY)
      const langMatch = voices.find(v => v.lang.toLowerCase().startsWith('ta'));
      if (langMatch) return langMatch;

      // 3. Name contains Tamil or Valluvar or Latha or தமிழ்
      const nameMatch = voices.find(v => {
        const n = v.name.toLowerCase();
        return (
          n.includes('tamil') ||
          n.includes('valluvar') ||
          n.includes('latha') ||
          n.includes('தமிழ்')
        );
      });
      if (nameMatch) return nameMatch;

      return null;
    }

    if (lang === 'hi') {
      // 1. Exact hi-IN match
      const exactMatch = voices.find(v => {
        const l = v.lang.toLowerCase().replace('_', '-');
        return l === 'hi-in' || l === 'hi_in';
      });
      if (exactMatch) return exactMatch;

      // 2. Starts with hi
      const langMatch = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
      if (langMatch) return langMatch;

      // 3. Name contains Hindi or Swara or Kalpana or हिन्दी or Madhur
      const nameMatch = voices.find(v => {
        const n = v.name.toLowerCase();
        return (
          n.includes('hindi') ||
          n.includes('swara') ||
          n.includes('kalpana') ||
          n.includes('हिन्दी') ||
          n.includes('madhur')
        );
      });
      if (nameMatch) return nameMatch;

      return null;
    }

    // English: prefer Indian English (en-IN), fallback to other English
    const enInMatch = voices.find(v => {
      const l = v.lang.toLowerCase().replace('_', '-');
      return l === 'en-in' || (l.startsWith('en') && v.name.toLowerCase().includes('india'));
    });
    if (enInMatch) return enInMatch;

    const anyEn = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    if (anyEn) return anyEn;

    return null;
  }

  isVoiceAvailable(lang: 'ta' | 'en' | 'hi'): boolean {
    if (lang === 'ta') {
      // Either browser has a Tamil voice OR backend TTS service is ready
      return !!this.getVoiceForLanguage('ta') || true;
    }
    return !!this.getVoiceForLanguage(lang);
  }

  startListening(
    lang: 'ta' | 'en' | 'hi',
    onResult: (text: string) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError("Speech recognition is not supported on this browser. Please use text input.");
      return false;
    }

    try {
      this.recognition.lang = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      this.recognition.onerror = () => {
        this.isListening = false;
        let msg = "Could not capture voice input. Please try again or type your question.";
        if (lang === 'ta') {
          msg = "குரலை சரியாகக் கேட்க முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது எழுதி அனுப்பவும்.";
        } else if (lang === 'hi') {
          msg = "आवाज सही ढंग से रिकॉर्ड नहीं हो सकी। कृपया पुनः प्रयास करें।";
        }
        onError(msg);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      this.isListening = false;
      onError("Voice input error. Please type your query.");
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  /**
   * Speaks the provided text in the requested language.
   * Guarantee: When Tamil is selected, NEVER speaks with an English TTS voice.
   * If browser lacks a native Tamil voice, uses high-fidelity audio stream from /api/speech/tts.
   */
  speak(
    text: string,
    lang: 'ta' | 'en' | 'hi',
    onEnd?: () => void,
    options?: {
      onStart?: () => void;
      onPause?: () => void;
      onResume?: () => void;
      onError?: (err?: string) => void;
    }
  ): boolean {
    if (!text || !text.trim()) {
      return false;
    }

    // Always cancel existing speech first (stops both WebSpeech and Audio)
    this.stopSpeaking();

    const trimmedText = text.trim();

    // 1. Check if browser has a genuine Tamil / Hindi voice
    const matchedVoice = this.getVoiceForLanguage(lang);

    // 2. If lang is Tamil and no browser Tamil voice exists, use high-fidelity backend TTS audio
    if (lang === 'ta' && !matchedVoice) {
      return this.playAudioStream(trimmedText, 'ta', onEnd, options);
    }

    // 3. If lang is Hindi and no browser Hindi voice exists, also fall back to backend TTS audio
    if (lang === 'hi' && !matchedVoice) {
      return this.playAudioStream(trimmedText, 'hi', onEnd, options);
    }

    // 4. Standard Web Speech API path with verified language voice
    if (!this.isSpeechSynthesisSupported()) {
      // Fall back to audio streaming if Web Speech is completely unsupported
      return this.playAudioStream(trimmedText, lang, onEnd, options);
    }

    try {
      const utterance = new SpeechSynthesisUtterance(trimmedText);
      utterance.lang = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95; // Clear, comfortable pacing for farmers
      utterance.pitch = 1.0;

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      this.isAudioMode = false;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (options?.onStart) options.onStart();
      };

      utterance.onpause = () => {
        if (options?.onPause) options.onPause();
      };

      utterance.onresume = () => {
        if (options?.onResume) options.onResume();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        // If Web Speech API fails, attempt audio stream fallback
        console.warn("[Speech] Web Speech API failed, attempting audio fallback");
        const fallbackSuccess = this.playAudioStream(trimmedText, lang, onEnd, options);
        if (!fallbackSuccess) {
          if (options?.onError) options.onError("Voice synthesis encountered an error.");
          if (onEnd) onEnd();
        }
      };

      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn("[Speech] Exception in Web Speech API, attempting audio fallback", e);
      return this.playAudioStream(trimmedText, lang, onEnd, options);
    }
  }

  /**
   * Plays native audio via HTML5 Audio using the backend TTS streaming endpoint
   */
  private playAudioStream(
    text: string,
    lang: 'ta' | 'en' | 'hi',
    onEnd?: () => void,
    options?: {
      onStart?: () => void;
      onPause?: () => void;
      onResume?: () => void;
      onError?: (err?: string) => void;
    }
  ): boolean {
    try {
      this.isAudioMode = true;
      const url = `${API_BASE_URL}/speech/tts?text=${encodeURIComponent(text)}&lang=${lang}`;
      const audio = new Audio(url);
      this.audioPlayer = audio;

      audio.onplay = () => {
        this.isSpeaking = true;
        if (options?.onStart) options.onStart();
      };

      audio.onpause = () => {
        if (!audio.ended && options?.onPause) {
          options.onPause();
        }
      };

      audio.onended = () => {
        this.isSpeaking = false;
        this.isAudioMode = false;
        this.audioPlayer = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        this.isSpeaking = false;
        this.isAudioMode = false;
        this.audioPlayer = null;
        const msg =
          lang === 'ta'
            ? 'இந்த சாதனத்தில் தமிழ் குரல் வழி விளக்கம் கிடைக்கவில்லை. இணைய இணைப்பை சரிபார்க்கவும்.'
            : 'Voice playback is currently unavailable on this device. Please check your network connection.';
        if (options?.onError) options.onError(msg);
        if (onEnd) onEnd();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("[Speech] Audio playback error:", err);
          this.isSpeaking = false;
          this.isAudioMode = false;
          this.audioPlayer = null;
          const msg =
            lang === 'ta'
              ? 'குரல் இயக்கத்தை தொடங்க முடியவில்லை. தயவுசெய்து மீண்டும் சொடுக்கவும்.'
              : 'Could not start audio playback. Please click to try again.';
          if (options?.onError) options.onError(msg);
          if (onEnd) onEnd();
        });
      }

      this.isSpeaking = true;
      return true;
    } catch (err: any) {
      console.error("[Speech] Fatal audio playback exception:", err);
      this.isSpeaking = false;
      this.isAudioMode = false;
      this.audioPlayer = null;
      if (options?.onError) options.onError("Voice playback failed.");
      return false;
    }
  }

  stopSpeaking(): void {
    if (this.audioPlayer) {
      try {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
      } catch (e) {}
      this.audioPlayer = null;
    }

    if (this.isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    this.isSpeaking = false;
    this.isAudioMode = false;
  }

  pauseSpeaking(): void {
    if (this.audioPlayer && !this.audioPlayer.paused) {
      try {
        this.audioPlayer.pause();
      } catch (e) {}
      return;
    }

    if (
      this.isSpeechSynthesisSupported() &&
      window.speechSynthesis.speaking &&
      !window.speechSynthesis.paused
    ) {
      try {
        window.speechSynthesis.pause();
      } catch (e) {}
    }
  }

  resumeSpeaking(): void {
    if (this.audioPlayer && this.audioPlayer.paused) {
      try {
        this.audioPlayer.play();
      } catch (e) {}
      return;
    }

    if (this.isSpeechSynthesisSupported() && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {}
    }
  }

  isSpeakingActive(): boolean {
    if (this.audioPlayer && !this.audioPlayer.paused && !this.audioPlayer.ended) {
      return true;
    }
    if (!this.isSpeechSynthesisSupported()) return false;
    return window.speechSynthesis.speaking && !window.speechSynthesis.paused;
  }

  isSpeakingPaused(): boolean {
    if (this.audioPlayer && this.audioPlayer.paused && !this.audioPlayer.ended && this.isSpeaking) {
      return true;
    }
    if (!this.isSpeechSynthesisSupported()) return false;
    return window.speechSynthesis.paused;
  }
}

export const speechService = new SpeechService();
