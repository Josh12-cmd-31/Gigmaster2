import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenAI, Modality } from "@google/genai";
import { Volume2, VolumeX, Loader2, Play, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { pcmToWav } from '../utils/audio';

const SLIDES = [
  {
    title: "Welcome to GigMaster",
    description: "Your all-in-one freelance marketplace. We connect talented professionals with businesses looking to scale and innovate.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    color: "bg-primary"
  },
  {
    title: "Hire Expert Talent",
    description: "Browse thousands of specialized services—from logo design and web development to digital marketing and AI consulting.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    color: "bg-blue-600"
  },
  {
    title: "Start Your Business",
    description: "Turn your skills into income. Create your gig, set your own prices, and reach clients globally with ease.",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
    color: "bg-secondary"
  },
  {
    title: "Work with Confidence",
    description: "Enjoy secure payments, 24/7 support, and a protected environment where quality work is always rewarded.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    color: "bg-purple-600"
  }
];

export default function WelcomeVoice() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasSeen, setHasSeen] = useState(true); // Default to true until checked
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const welcomeText = `Welcome to GigMaster, ${user?.name || 'friend'}! We are thrilled to have you here. GigMaster is a premier freelance marketplace where talent meets opportunity. Whether you're looking to hire experts for your business or offering your professional services to the world, we've got you covered. Explore our diverse categories, from programming and design to marketing and lifestyle. Your journey to success starts right here!`;

  useEffect(() => {
    if (user) {
      const alreadySeen = localStorage.getItem(`welcome_video_seen_${user.id}`);
      if (!alreadySeen) {
        setHasSeen(false);
        setIsOpen(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (isPlaying) {
      const step = 100 / (5000 / 100); // 5 seconds per slide, 100ms interval
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setCurrentSlide(s => (s + 1) % SLIDES.length);
            return 0;
          }
          return prev + step;
        });
      }, 100);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying]);

  const startExperience = async () => {
    if (isLoading || isPlaying) return;
    
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: welcomeText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioUrl = pcmToWav(base64Audio);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setIsPlaying(true);
        audio.play().catch(err => {
          console.error("Audio playback error:", err);
          setIsPlaying(false);
          handleClose();
        });
        
        audio.onended = () => {
          setIsPlaying(false);
          handleClose();
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(true); // Fallback to just showing slides
      setTimeout(() => {
        handleClose();
      }, 20000); // 20 seconds total for 4 slides
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setHasSeen(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (user) {
      localStorage.setItem(`welcome_video_seen_${user.id}`, 'true');
    }
  };

  if (!user || hasSeen || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-5xl aspect-video bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!isPlaying && !isLoading ? (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/60 text-white text-center p-8">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-6 max-w-2xl"
            >
              <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Volume2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold">Welcome to the Future of Work</h2>
              <p className="text-xl text-slate-300">Take a 30-second tour to see how GigMaster can help you achieve your goals.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mx-auto">
                <button 
                  onClick={startExperience}
                  className="btn-secondary px-12 py-5 text-xl flex items-center gap-3 group"
                >
                  <Play className="w-6 h-6 fill-current" /> Start Introduction
                </button>
                <button 
                  onClick={handleClose}
                  className="px-8 py-5 text-lg font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Skip Tour
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}

        {isLoading && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-medium animate-pulse">Preparing your personal welcome...</p>
          </div>
        )}

        {/* Slideshow Content */}
        <div className="flex-grow relative overflow-hidden bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={SLIDES[currentSlide].image} 
                alt={SLIDES[currentSlide].title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text Content */}
        <div className="w-full md:w-[400px] p-12 flex flex-col justify-center bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className={`w-12 h-12 ${SLIDES[currentSlide].color} rounded-xl flex items-center justify-center text-white`}>
                <span className="font-bold text-xl">{currentSlide + 1}</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">{SLIDES[currentSlide].title}</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                {SLIDES[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 space-y-4">
            <div className="flex gap-2">
              {SLIDES.map((_, idx) => (
                <div 
                  key={idx} 
                  className="h-1.5 flex-grow bg-slate-100 rounded-full overflow-hidden"
                >
                  <div 
                    className={`h-full bg-primary transition-all duration-100 ease-linear ${idx === currentSlide ? '' : idx < currentSlide ? 'w-full' : 'w-0'}`}
                    style={{ width: idx === currentSlide ? `${progress}%` : undefined }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Scene {currentSlide + 1} of {SLIDES.length}</span>
              {isPlaying && <span>AI Narration Active</span>}
            </div>
          </div>

          {isPlaying && (
            <div className="mt-8 flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex-grow">
                <div className="text-xs font-bold text-primary">Listening to Guide</div>
                <div className="text-[10px] text-slate-500">Kore AI Voice</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
