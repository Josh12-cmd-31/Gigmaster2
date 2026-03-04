import { Link } from 'react-router-dom';
import { Search, ArrowRight, CheckCircle2, Zap, Shield, Star, Sparkles, Volume2, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GigCard from '../components/GigCard';
import WelcomeVoice from '../components/WelcomeVoice';
import { useEffect, useState } from 'react';

const CATEGORIES = [
  { name: 'Graphics & Design', icon: '🎨' },
  { name: 'Digital Marketing', icon: '📈' },
  { name: 'Writing & Translation', icon: '✍️' },
  { name: 'Video & Animation', icon: '🎥' },
  { name: 'Music & Audio', icon: '🎵' },
  { name: 'Programming & Tech', icon: '💻' },
  { name: 'AI Services', icon: '🤖' },
  { name: 'Business', icon: '💼' },
];

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1920'
];

export default function HomePage() {
  const [featuredGigs, setFeaturedGigs] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/gigs')
      .then(res => res.json())
      .then(data => setFeaturedGigs(data.slice(0, 4)));
  }, []);

  return (
    <div className="space-y-20 pb-20">
      <WelcomeVoice />
      {/* Hero Section */}
      <section className="relative min-h-[600px] py-24 overflow-hidden flex items-center">
        {/* Sliding Background Images */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 1.1, x: 100, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -100, rotate: -2 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-slate-900/60 z-10" />
              <img 
                src={HERO_IMAGES[currentImage]} 
                alt="Background" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white space-y-8"
            >
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                Find the perfect <span className="text-secondary">freelance</span> services for your business
              </h1>
              <p className="text-xl text-blue-100 max-w-lg">
                GigMaster connects businesses with talented freelancers to get work done faster and better.
              </p>
              
              <div className="flex items-center bg-white rounded-2xl p-2 shadow-2xl max-w-xl">
                <Search className="w-6 h-6 text-slate-400 ml-4" />
                <input 
                  type="text" 
                  placeholder='Try "logo design"' 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 px-4 py-3 text-lg"
                />
                <button className="bg-secondary hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-colors">
                  Search
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="text-blue-200">Popular:</span>
                {['Website Design', 'WordPress', 'Logo Design'].map(tag => (
                  <button key={tag} className="px-3 py-1 border border-blue-400/30 rounded-full hover:bg-white/10 transition-colors">
                    {tag}
                  </button>
                ))}
                <Link to="/ai-tutoring" className="px-3 py-1 border border-secondary text-secondary rounded-full hover:bg-secondary hover:text-white transition-all font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Voice Tutoring
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white/10">
                <img 
                  src="https://picsum.photos/seed/freelance/800/600" 
                  alt="Freelancer working" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl z-20 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-emerald-600 fill-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">4.9/5 Rating</div>
                  <div className="text-sm text-slate-500">From 10k+ clients</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentImage === idx ? 'w-8 bg-secondary' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Explore Categories</h2>
            <p className="text-slate-500">Find services across all industries</p>
          </div>
          <Link to="/categories" className="text-primary font-bold flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map(cat => (
            <Link 
              key={cat.name} 
              to={
                cat.name === 'AI Services' ? "/ai-tutoring" : 
                cat.name === 'Programming & Tech' ? "/web-dev-tools" :
                cat.name === 'Graphics & Design' ? "/logo-designer" :
                `/explore?category=${cat.name}`
              } 
              className="card p-6 text-center hover:border-primary transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <div className="text-sm font-bold text-slate-700 group-hover:text-primary">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Gigs */}
      <section className="bg-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Services</h2>
              <p className="text-slate-500">Hand-picked services by our experts</p>
            </div>
            <Link to="/explore" className="text-primary font-bold flex items-center gap-1 hover:underline">
              Explore More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {featuredGigs.length > 0 ? (
              featuredGigs.map(gig => <GigCard key={gig.id} gig={gig} />)
            ) : (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="card h-80 animate-pulse bg-white/50"></div>
              ))
            )}
          </div>

          {/* AI Tutoring Banner */}
          <div className="grid md:grid-cols-2 gap-8">
            <Link to="/ai-tutoring" className="block relative group overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-blue-900 p-1">
              <div className="relative bg-slate-900/40 backdrop-blur-sm rounded-[22px] p-8 md:p-10 flex flex-col items-start justify-between h-full transition-all group-hover:bg-transparent">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-200 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> New AI Service
                  </div>
                  <h2 className="text-3xl font-bold text-white">AI Voice Tutoring</h2>
                  <p className="text-blue-100 text-sm">
                    Interact with our advanced AI voice tutor for personalized guidance.
                  </p>
                </div>
                <div className="pt-6">
                  <span className="px-6 py-3 bg-white text-primary rounded-xl font-bold flex items-center gap-2 text-sm">
                    Try for Free <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/web-dev-tools" className="block relative group overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-1">
              <div className="relative bg-slate-900/40 backdrop-blur-sm rounded-[22px] p-8 md:p-10 flex flex-col items-start justify-between h-full transition-all group-hover:bg-transparent">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-200 uppercase tracking-wider">
                    <Code2 className="w-3 h-3" /> Dev Studio
                  </div>
                  <h2 className="text-3xl font-bold text-white">Web Dev Toolbox</h2>
                  <p className="text-slate-300 text-sm">
                    AI-powered tools to build websites faster. Components, palettes, and more.
                  </p>
                </div>
                <div className="pt-6">
                  <span className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 text-sm">
                    Open Toolbox <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why GigMaster */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              A whole world of freelance talent at your fingertips
            </h2>
            <div className="space-y-6">
              {[
                { title: 'The best for every budget', desc: 'Find high-quality services at every price point. No hourly rates, just project-based pricing.', icon: <Zap className="text-accent" /> },
                { title: 'Quality work done quickly', desc: 'Find the right freelancer to begin working on your project within minutes.', icon: <CheckCircle2 className="text-secondary" /> },
                { title: 'Protected payments, every time', desc: 'Always know what you\'ll pay upfront. Your payment isn\'t released until you approve the work.', icon: <Shield className="text-primary" /> },
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://picsum.photos/seed/business/800/800" 
              alt="Business collaboration" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
