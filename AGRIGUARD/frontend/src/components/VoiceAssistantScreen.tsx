import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Send, Volume2, Square, RotateCcw, LoaderCircle,
  Bot, User, Sparkles, AlertCircle
} from 'lucide-react';
import { Language, FarmProfile, ChatMessage } from '../types';
import { translations } from '../i18n';
import { speechService } from '../services/speech';
import { api } from '../services/api';

interface VoiceAssistantScreenProps {
  language: Language;
  farmProfile: FarmProfile;
}

export const VoiceAssistantScreen: React.FC<VoiceAssistantScreenProps> = ({ language, farmProfile }) => {
  const t = translations[language];
  const isTa = language === 'ta';
  const isHi = language === 'hi';

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCrop = farmProfile.crops.find(c => c.crop_id === farmProfile.active_crop_id) || farmProfile.crops[0];
  const cropHint = activeCrop
    ? [
        language === 'ta' ? activeCrop.crop_name_ta : language === 'hi' ? activeCrop.crop_name_hi : activeCrop.crop_name_en,
        activeCrop.growth_stage ? `Growth stage: ${activeCrop.growth_stage}` : '',
        activeCrop.soil_type ? `Soil: ${activeCrop.soil_type}` : '',
        activeCrop.area_acres ? `Area: ${activeCrop.area_acres} acres` : ''
      ].filter(Boolean).join('; ').slice(0, 160)
    : undefined;

  const quickPrompts = isTa ? [
    "தக்காளி செடியில் நோய் வராமல் இருக்க என்ன செய்ய வேண்டும்?",
    "நெல் பயிருக்கு உரம் எப்போது இட வேண்டும்?",
    "மழை வரும்போது மருந்து அடிக்கலாமா?",
    "இயற்கை முறையில் பூச்சிகளை கட்டுப்படுத்துவது எப்படி?"
  ] : isHi ? [
    "टमाटर में रोगों से बचाव कैसे करें?",
    "धान में खाद कब डालनी चाहिए?",
    "बारिश की संभावना हो तो क्या सिंचाई रोकनी चाहिए?",
    "कीटों के लिए कौन-से जैविक तरीके अपनाएं?"
  ] : [
    "How to prevent early blight in tomato?",
    "When should I apply fertilizer for rice?",
    "Can I spray pesticide when rain is expected?",
    "What organic practices protect crops from pests?"
  ];

  // Initialize with helpful greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greetingText = isTa
        ? `வணக்கம்! நான் உங்கள் அக்ரிகார்ட் விவசாய உதவியாளர். ${activeCrop?.crop_name_ta || 'உங்கள் பயிர்'} பராமரிப்பு, நோய் தடுப்பு, உரம் அல்லது நீர்ப்பாசனம் பற்றி என்னிடம் குரல் மூலமாகவோ அல்லது எழுதியோ கேட்கலாம்.`
        : isHi
        ? `नमस्ते! मैं आपका AGRIGUARD कृषि सहायक हूं। फसल, रोग, खाद या सिंचाई के बारे में पूछें।`
        : `Hello! I am your AGRIGUARD farming assistant. Ask me anything about crop diseases, fertilizers, or irrigation for ${activeCrop?.crop_name_en || 'your crops'}.`;

      setMessages([
        {
          id: 'welcome_1',
          sender: 'assistant',
          text: greetingText,
          spoken_text: greetingText,
          topic: isTa ? "வரவேற்பு" : isHi ? "स्वागत है" : "Welcome",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartVoice = () => {
    setErrorMessage(null);
    const supported = speechService.isSpeechRecognitionSupported();
    if (!supported) {
      setErrorMessage(
        isTa
          ? "உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரவு இல்லை. தயவுசெய்து கீழே எழுதி அனுப்பவும்."
          : isHi
          ? "इस ब्राउज़र में आवाज़ से लिखना उपलब्ध नहीं है। कृपया अपना प्रश्न लिखें।"
          : "Speech recognition is not supported on this browser. Please type your question."
      );
      return;
    }

    setIsListening(true);
    speechService.startListening(
      language,
      (text) => {
        setIsListening(false);
        if (text) {
          handleSendQuery(text);
        }
      },
      (err) => {
        setIsListening(false);
        setErrorMessage(err);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleStopVoice = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;
    const history = messages
      .filter((message) => message.id !== 'welcome_1')
      .slice(-10)
      .map((message) => ({
        role: message.sender,
        content: message.text
      }));

    // Add user message
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await api.askAssistant(textToSend, cropHint, language, history);

      const botText = isTa ? res.reply_ta : language === 'hi' ? res.reply_hi : res.reply_en;
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: botText,
        spoken_text: res.spoken_text || botText,
        topic: isTa ? res.topic_ta : language === 'hi' ? res.topic_hi : res.topic_en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);

      // Automatically speak response
      handleSpeak(botMsg.spoken_text || botText);
    } catch (e) {
      console.error("Error asking assistant", e);
      setErrorMessage(
        e instanceof Error
          ? e.message
          : isTa
          ? 'விவசாய உதவியாளர் தற்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.'
          : isHi
          ? 'कृषि सहायक अभी उपलब्ध नहीं है। कृपया फिर से प्रयास करें।'
          : 'The agriculture assistant is unavailable. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    setActiveSpeechText(text);
    setIsSpeaking(true);
    speechService.speak(text, language, () => {
      setIsSpeaking(false);
    });
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleRepeatLast = () => {
    if (activeSpeechText) {
      handleSpeak(activeSpeechText);
    } else {
      const lastBot = [...messages].reverse().find(m => m.sender === 'assistant');
      if (lastBot?.spoken_text) {
        handleSpeak(lastBot.spoken_text);
      }
    }
  };

  return (
    <div className="space-y-4 pb-28 max-w-2xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Title */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {t.assistant_title}
              </h2>
              <p className="text-[11px] text-slate-500">
                {isTa ? "தமிழில் பேசுங்கள் அல்லது எழுதுங்கள்" : isHi ? "हिंदी में बोलें या लिखें" : "Speak or type in Tamil, English, or Hindi"}
              </p>
            </div>
          </div>

          {/* Audio Controls */}
          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t.assistant_stop_audio}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error alert if voice recognition failed */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-start gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Conversation History Area */}
      <div className="flex-1 overflow-y-auto space-y-3 p-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white text-xs ${
                msg.sender === 'user' ? 'bg-emerald-600' : 'bg-purple-600'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm space-y-1.5 ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              {msg.topic && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  🏷️ {msg.topic}
                </span>
              )}
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              
              <div className="flex items-center justify-between text-[10px] opacity-70 pt-1">
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => handleSpeak(msg.spoken_text || msg.text)}
                    className="p-1 hover:text-emerald-700 flex items-center gap-1"
                    title={t.assistant_play_audio}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs p-2" role="status">
            <LoaderCircle className="w-4 h-4 animate-spin text-emerald-600" />
            <span>{isTa ? 'பதில் பெறப்படுகிறது...' : isHi ? 'उत्तर तैयार हो रहा है...' : 'Getting agricultural guidance...'}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      {messages.length <= 2 && (
        <div className="space-y-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            {t.assistant_quick_prompts}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendQuery(q)}
                disabled={isLoading}
                className="bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-medium text-left transition-colors"
              >
                🌾 {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Mic & Text Input Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-md space-y-2 shrink-0">
        {/* Large Speaking Indicator */}
        {isListening && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-center flex items-center justify-center gap-2 text-xs font-bold text-red-700 animate-pulse">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
            <span>{t.assistant_mic_listening}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Large Microphone Button */}
          <button
            type="button"
            onClick={isListening ? handleStopVoice : handleStartVoice}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 ${
              isListening
                ? 'bg-red-600 text-white animate-bounce'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title={t.assistant_mic_start}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            placeholder={isTa ? "விவசாயக் கேள்வியை எழுதவும்..." : t.assistant_input_placeholder}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition-all"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendQuery()}
            disabled={!inputQuery.trim() || isLoading}
            className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-emerald-700 disabled:bg-slate-200 text-white flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-95"
            title={t.assistant_send}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
