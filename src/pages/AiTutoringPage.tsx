import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality } from "@google/genai";
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, BookOpen, Sparkles, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pcmToWav } from '../utils/audio';

export default function AiTutoringPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [subject, setSubject] = useState('General Learning');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const handleVoiceInput = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [
            {
              parts: [
                { inlineData: { data: base64Audio, mimeType: 'audio/webm' } },
                { text: "Transcribe this audio exactly. Return only the transcribed text, nothing else." }
              ]
            }
          ]
        });

        const transcribedText = response.text?.trim();
        if (transcribedText) {
          handleSend(transcribedText);
        }
      };
    } catch (error) {
      console.error("Transcription error:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const subjects = [
    { name: 'General Learning', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Programming', icon: <Brain className="w-4 h-4" /> },
    { name: 'Languages', icon: <BookOpen className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user' as const, text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `You are a professional AI Tutor specializing in ${subject}. Help the student with their query: ${text}` }] }],
        config: {
          responseModalities: isVoiceEnabled ? [Modality.AUDIO] : undefined,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const aiText = response.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);

      if (isVoiceEnabled) {
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const audioUrl = pcmToWav(base64Audio);
          const audio = new Audio(audioUrl);
          audio.play().catch(err => console.error("Audio play error:", err));
          audio.onended = () => URL.revokeObjectURL(audioUrl);
        }
      }
    } catch (error) {
      console.error('Tutoring Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: "I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            AI Voice Tutor
          </h1>
          <p className="text-slate-500">Personalized learning powered by advanced AI</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          {subjects.map(s => (
            <button
              key={s.name}
              onClick={() => setSubject(s.name)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                subject === s.name ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s.icon}
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <Volume2 className="w-10 h-10 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Start your learning session</h3>
                <p className="text-slate-500">Ask me anything about {subject}</p>
              </div>
            </div>
          )}
          
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{m.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTranscribing && (
            <div className="flex justify-end">
              <div className="bg-primary/10 p-4 rounded-2xl rounded-tr-none flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-sm text-primary font-medium">Transcribing your voice...</span>
              </div>
            </div>
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`p-3 rounded-xl transition-all ${
                isVoiceEnabled ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'
              }`}
              title={isVoiceEnabled ? "Voice Output Enabled" : "Voice Output Disabled"}
            >
              {isVoiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            <div className="flex-grow relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder={`Ask about ${subject}...`}
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 pr-16 focus:border-primary focus:ring-0 transition-all font-medium"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <button
              className={`p-4 rounded-full transition-all ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
              }`}
              onClick={toggleListening}
              disabled={isTranscribing || isTyping}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">
            Powered by Gemini 2.5 Flash Native Audio
          </p>
        </div>
      </div>
    </div>
  );
}
