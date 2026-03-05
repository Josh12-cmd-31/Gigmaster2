import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Star, Clock, RotateCcw, Check, Shield, MessageSquare, User } from 'lucide-react';
import { safeFetch } from '../utils/api';

export default function GigDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    safeFetch(`/api/gigs/${id}`)
      .then(data => {
        if (data) setGig(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Gig details fetch error:', err);
        setIsLoading(false);
      });
  }, [id]);

  const handleOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const amount = activeTab === 'basic' ? gig.price_basic : activeTab === 'standard' ? gig.price_standard : gig.price_premium;
    try {
      await safeFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gig_id: gig.id,
          buyer_id: user.id,
          seller_id: gig.seller_id,
          amount
        }),
      });
      navigate('/buyer-dashboard');
    } catch (err) {
      console.error('Order error:', err);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/messages?userId=${gig.seller_id}`);
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">Loading...</div>;
  if (!gig) return <div className="max-w-7xl mx-auto px-4 py-20">Gig not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
              {gig.category}
            </div>
            <h1 className="text-4xl font-bold text-slate-900 leading-tight">{gig.title}</h1>
            <div className="flex items-center gap-4">
              <Link to={`/profile/${gig.seller_id}`} className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-primary transition-all">
                  {gig.seller_avatar ? <img src={gig.seller_avatar} alt={gig.seller_name} /> : <User className="w-6 h-6 text-slate-400" />}
                </div>
                <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{gig.seller_name}</span>
              </Link>
              <div className="h-4 w-px bg-slate-200"></div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-accent fill-accent" />
                <span className="font-bold text-slate-900">{gig.rating || '5.0'}</span>
                <span className="text-slate-400">({gig.reviews_count || '0'})</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100">
            <img 
              src={gig.image_url || `https://picsum.photos/seed/${gig.id}/1200/800`} 
              alt={gig.title} 
              className="w-full h-auto"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">About this gig</h2>
            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {gig.description}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-10 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">About the seller</h2>
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden">
                {gig.seller_avatar ? <img src={gig.seller_avatar} alt={gig.seller_name} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-slate-400 m-6" />}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">{gig.seller_name}</h3>
                <p className="text-slate-500">{gig.seller_bio || 'Professional freelancer dedicated to delivering high-quality work.'}</p>
                <button 
                  onClick={handleContact}
                  className="px-6 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Contact Me
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Order */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-24">
            <div className="flex border-b border-slate-100">
              {['basic', 'standard', 'premium'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 capitalize">{activeTab} Package</h3>
                <span className="text-2xl font-bold text-slate-900">
                  ${activeTab === 'basic' ? gig.price_basic : activeTab === 'standard' ? gig.price_standard : gig.price_premium}
                </span>
              </div>
              
              <p className="text-slate-500 text-sm">
                Perfect for small projects and quick turnarounds. High quality guaranteed.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Clock className="w-4 h-4" /> {gig.delivery_basic} Days Delivery
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <RotateCcw className="w-4 h-4" /> 3 Revisions
                </div>
              </div>

              <ul className="space-y-2">
                {['Source file', 'High resolution', 'Commercial use'].map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-secondary" /> {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={handleOrder}
                className="w-full btn-primary py-4 text-lg font-bold"
              >
                Continue (${activeTab === 'basic' ? gig.price_basic : activeTab === 'standard' ? gig.price_standard : gig.price_premium})
              </button>
              
              <div className="text-center">
                <button 
                  onClick={handleContact}
                  className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <MessageSquare className="w-4 h-4" /> Contact Seller
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Shield className="w-4 h-4" /> 100% Secure Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
