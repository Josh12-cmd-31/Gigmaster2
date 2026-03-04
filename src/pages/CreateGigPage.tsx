import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, DollarSign, Clock, Check, Loader2, Image as ImageIcon, Info } from 'lucide-react';

export default function CreateGigPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Graphics & Design',
    price_basic: '',
    price_standard: '',
    price_premium: '',
    delivery_basic: '3',
    image_url: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, image_url: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          seller_id: user?.id,
          price_basic: parseFloat(formData.price_basic),
          price_standard: parseFloat(formData.price_standard),
          price_premium: parseFloat(formData.price_premium),
          delivery_basic: parseInt(formData.delivery_basic)
        }),
      });
      if (res.ok) {
        // Redirect to home page so they can see it on the "main dashboard"
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Create a New Gig</h1>
        <p className="text-slate-500">Fill in the details to start selling your service</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-bold text-slate-700">Gig Title</label>
              <span title="A clear title helps buyers find your gig easily.">
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="I will do something amazing for you..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <p className="text-xs text-slate-400">Keep it catchy and clear. Start with "I will..."</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-bold text-slate-700">Category</label>
                <span title="Select the most relevant category for your service.">
                  <Info className="w-4 h-4 text-slate-400 cursor-help" />
                </span>
              </div>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {['Graphics & Design', 'Digital Marketing', 'Writing & Translation', 'Video & Animation', 'Music & Audio', 'Programming & Tech', 'Business', 'Lifestyle'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400">Choose the category that best fits your service.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-bold text-slate-700">Delivery Time (Days)</label>
                <span title="The total time you need to complete the work.">
                  <Info className="w-4 h-4 text-slate-400 cursor-help" />
                </span>
              </div>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={formData.delivery_basic}
                  onChange={e => setFormData({...formData, delivery_basic: e.target.value})}
                />
              </div>
              <p className="text-xs text-slate-400">How many days will it take to deliver the basic version?</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-bold text-slate-700">Description</label>
              <span title="Provide a detailed explanation of your service.">
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
              </span>
            </div>
            <textarea
              required
              rows={6}
              placeholder="Describe your service in detail..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
            <p className="text-xs text-slate-400">Explain what you offer. Be clear about what is included and what is not.</p>
          </div>
        </div>

        <div className="card p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Pricing Tiers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-bold text-slate-700">Basic Price ($)</label>
                <span title="The entry-level version of your service.">
                  <Info className="w-4 h-4 text-slate-400 cursor-help" />
                </span>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={formData.price_basic}
                  onChange={e => setFormData({...formData, price_basic: e.target.value})}
                />
              </div>
              <p className="text-[10px] text-slate-400">Entry-level version. Keep it affordable.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-bold text-slate-700">Standard Price ($)</label>
                <span title="The most popular version with more features.">
                  <Info className="w-4 h-4 text-slate-400 cursor-help" />
                </span>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={formData.price_standard}
                  onChange={e => setFormData({...formData, price_standard: e.target.value})}
                />
              </div>
              <p className="text-[10px] text-slate-400">Most popular version with more features.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-bold text-slate-700">Premium Price ($)</label>
                <span title="The full-featured, high-end version.">
                  <Info className="w-4 h-4 text-slate-400 cursor-help" />
                </span>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={formData.price_premium}
                  onChange={e => setFormData({...formData, price_premium: e.target.value})}
                />
              </div>
              <p className="text-[10px] text-slate-400">Full-featured, high-end version.</p>
            </div>
          </div>
        </div>

        <div className="card p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Gig Image</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-bold text-slate-700">Upload Image</label>
              <span title="Upload a high-quality image to showcase your work.">
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all overflow-hidden relative group">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="flex flex-col items-center text-white">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="font-bold">Change Image</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="mb-2 text-sm text-slate-700 font-bold">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">PNG, JPG or WebP (MAX. 800x400px)</p>
                  </div>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-xs text-slate-400 text-center">Provide a high-quality image to showcase your work. This is the first thing buyers will see.</p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
          <button type="submit" disabled={isLoading} className="btn-secondary px-12 py-4 flex items-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Publish Gig</>}
          </button>
        </div>
      </form>
    </div>
  );
}
