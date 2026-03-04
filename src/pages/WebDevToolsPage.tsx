import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Code2, 
  Palette, 
  Type, 
  Globe, 
  Copy, 
  Check, 
  Sparkles, 
  Layout, 
  Smartphone, 
  Monitor,
  RefreshCw,
  Download
} from 'lucide-react';

type Tool = 'component' | 'colors' | 'typography' | 'seo' | 'tailwind';

export default function WebDevToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool>('component');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Color Palette State
  const [palette, setPalette] = useState([
    { name: 'Primary', hex: '#3B82F6' },
    { name: 'Secondary', hex: '#10B981' },
    { name: 'Accent', hex: '#F59E0B' },
    { name: 'Background', hex: '#F8FAFC' },
    { name: 'Text', hex: '#0F172A' },
  ]);

  // Tailwind Config State
  const [tailwindConfig, setTailwindConfig] = useState(`/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}`);

  const generateComponent = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ 
          text: `Generate a modern, responsive React component using Tailwind CSS based on this description: ${prompt}. 
                 Return ONLY the code block. Use Lucide-react for icons if needed.` 
        }],
      });
      setGeneratedCode(response.text || '');
    } catch (error) {
      console.error('Generation Error:', error);
      setGeneratedCode('// Error generating component. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTailwindConfig = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ 
          text: `Generate a professional tailwind.config.js file based on these colors: ${palette.map(p => `${p.name}: ${p.hex}`).join(', ')}. 
                 Include modern theme extensions. Return ONLY the code block.` 
        }],
      });
      setTailwindConfig(response.text || '');
    } catch (error) {
      console.error('Config Generation Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePalette = () => {
    const randomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setPalette(palette.map(p => ({ ...p, hex: randomHex() })));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-300 uppercase tracking-wider">
                <Code2 className="w-3 h-3" /> Developer Studio
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">Web Dev Toolbox</h1>
              <p className="text-slate-400 text-lg max-w-2xl">
                Customizable AI-powered tools to accelerate your web development workflow. 
                Generate components, palettes, and SEO strategies in seconds.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <div className="text-2xl font-bold">10+</div>
                <div className="text-xs text-slate-500 uppercase">Tools</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <div className="text-2xl font-bold">AI</div>
                <div className="text-xs text-slate-500 uppercase">Powered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: 'component', name: 'AI Component Gen', icon: <Layout className="w-5 h-5" /> },
              { id: 'colors', name: 'Palette Generator', icon: <Palette className="w-5 h-5" /> },
              { id: 'typography', name: 'Font Pairings', icon: <Type className="w-5 h-5" /> },
              { id: 'seo', name: 'SEO Optimizer', icon: <Globe className="w-5 h-5" /> },
              { id: 'tailwind', name: 'Tailwind Config', icon: <Code2 className="w-5 h-5" /> },
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as Tool)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTool === tool.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-2' 
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tool.icon}
                {tool.name}
              </button>
            ))}
          </div>

          {/* Tool Workspace */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[600px]">
              <AnimatePresence mode="wait">
                {activeTool === 'component' && (
                  <motion.div
                    key="component"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-8 space-y-8"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-slate-900">AI Component Generator</h2>
                      <p className="text-slate-500 text-sm">Describe a component and let AI write the React + Tailwind code for you.</p>
                    </div>

                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. A modern pricing table with 3 tiers and a toggle for monthly/yearly"
                        className="flex-grow bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-primary focus:ring-0 transition-all"
                      />
                      <button 
                        onClick={generateComponent}
                        disabled={isGenerating || !prompt.trim()}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
                      >
                        {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        Generate
                      </button>
                    </div>

                    {generatedCode && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <button className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"><Monitor className="w-4 h-4" /></button>
                            <button className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"><Smartphone className="w-4 h-4" /></button>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(generatedCode)}
                            className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy Code'}
                          </button>
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto">
                          <pre className="text-blue-300 font-mono text-sm leading-relaxed">
                            {generatedCode}
                          </pre>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTool === 'colors' && (
                  <motion.div
                    key="colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-8 space-y-8"
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Palette Generator</h2>
                        <p className="text-slate-500 text-sm">Generate and customize color schemes for your next project.</p>
                      </div>
                      <button 
                        onClick={generatePalette}
                        className="p-4 bg-primary text-white rounded-2xl hover:bg-blue-700 transition-all"
                      >
                        <RefreshCw className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-5 gap-4">
                      {palette.map((color, idx) => (
                        <div key={idx} className="space-y-3">
                          <div 
                            className="h-48 rounded-2xl shadow-inner flex items-end p-4 group cursor-pointer"
                            style={{ backgroundColor: color.hex }}
                            onClick={() => copyToClipboard(color.hex)}
                          >
                            <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to Copy
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-400 uppercase">{color.name}</div>
                            <div className="text-lg font-mono font-bold text-slate-900">{color.hex}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                        <Download className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Export Palette</h3>
                        <p className="text-slate-500 text-sm">Download as CSS variables, Tailwind config, or JSON.</p>
                      </div>
                      <div className="flex gap-2">
                        {['CSS', 'Tailwind', 'JSON'].map(format => (
                          <button key={format} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:border-primary transition-all">
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTool === 'typography' && (
                  <motion.div
                    key="typography"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-8 space-y-8"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-slate-900">Font Pairings</h2>
                      <p className="text-slate-500 text-sm">Curated typography combinations for different website moods.</p>
                    </div>

                    <div className="grid gap-6">
                      {[
                        { name: 'Modern Tech', head: 'Inter', body: 'JetBrains Mono', desc: 'Clean, precise, and highly legible.' },
                        { name: 'Editorial Luxury', head: 'Playfair Display', body: 'Source Sans Pro', desc: 'Elegant, sophisticated, and timeless.' },
                        { name: 'Creative Brutalist', head: 'Space Grotesk', body: 'Inter', desc: 'Bold, unconventional, and high energy.' },
                      ].map((pair, idx) => (
                        <div key={idx} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-primary transition-all">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="font-bold text-slate-900">{pair.name}</h3>
                              <p className="text-xs text-slate-500">{pair.desc}</p>
                            </div>
                            <button className="text-primary font-bold text-sm hover:underline">Use Pairing</button>
                          </div>
                          <div className="space-y-4">
                            <div className="text-4xl font-bold text-slate-900" style={{ fontFamily: pair.head }}>
                              The quick brown fox jumps over the lazy dog.
                            </div>
                            <div className="text-lg text-slate-600 leading-relaxed" style={{ fontFamily: pair.body }}>
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTool === 'seo' && (
                  <motion.div
                    key="seo"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-8 space-y-8"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-slate-900">SEO Optimizer</h2>
                      <p className="text-slate-500 text-sm">Generate meta tags and social sharing previews for your website.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">Page Title</label>
                          <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3" placeholder="e.g. My Awesome Portfolio" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                          <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 h-32" placeholder="Describe your website for search engines..." />
                        </div>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold">Generate Meta Tags</button>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase">Google Preview</label>
                        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
                          <div className="text-blue-700 text-xl hover:underline cursor-pointer">My Awesome Portfolio</div>
                          <div className="text-emerald-700 text-sm">https://myportfolio.com</div>
                          <div className="text-slate-600 text-sm line-clamp-2">
                            This is how your website will appear in Google search results. Make it catchy and informative!
                          </div>
                        </div>

                        <label className="text-xs font-bold text-slate-400 uppercase pt-4 block">Social Preview</label>
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                          <div className="aspect-video bg-slate-100 flex items-center justify-center">
                            <Globe className="w-12 h-12 text-slate-300" />
                          </div>
                          <div className="p-4 space-y-1">
                            <div className="text-xs text-slate-400 uppercase">myportfolio.com</div>
                            <div className="font-bold text-slate-900">My Awesome Portfolio</div>
                            <div className="text-sm text-slate-500 line-clamp-1">A brief description of your site for social media.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTool === 'tailwind' && (
                  <motion.div
                    key="tailwind"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-8 space-y-8"
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Tailwind Config Generator</h2>
                        <p className="text-slate-500 text-sm">Generate a professional tailwind.config.js based on your brand colors.</p>
                      </div>
                      <button 
                        onClick={generateTailwindConfig}
                        disabled={isGenerating}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all"
                      >
                        {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Regenerate Config
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">tailwind.config.js</span>
                        <button 
                          onClick={() => copyToClipboard(tailwindConfig)}
                          className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copied!' : 'Copy Config'}
                        </button>
                      </div>
                      <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto">
                        <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
                          {tailwindConfig}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
