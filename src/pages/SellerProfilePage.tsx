import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GigCard from '../components/GigCard';
import { User, Star, MapPin, Calendar, MessageSquare, ExternalLink, Tag } from 'lucide-react';

export default function SellerProfilePage() {
  const { id } = useParams();
  const [seller, setSeller] = useState<any>(null);
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const [userRes, gigsRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/gigs`)
        ]);
        
        const userData = await userRes.json();
        const allGigs = await gigsRes.json();
        
        if (userRes.ok) {
          setSeller(userData);
        }
        
        const sellerGigs = allGigs.filter((g: any) => g.seller_id === parseInt(id!));
        setGigs(sellerGigs);
      } catch (error) {
        console.error('Error fetching seller data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerData();
  }, [id]);

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">Loading...</div>;
  if (!seller) return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Seller not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Column: Profile Info */}
        <div className="space-y-8">
          <div className="card p-8 text-center space-y-6">
            <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto overflow-hidden">
              {seller.avatar ? <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" /> : <User className="w-16 h-16 text-slate-400 m-8" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{seller.name}</h1>
              <p className="text-slate-500">Professional Freelancer</p>
            </div>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 text-accent fill-accent" />)}
              <span className="ml-2 font-bold text-slate-900">5.0</span>
            </div>
            <button className="w-full btn-primary py-3">Contact Me</button>
            
            <div className="border-t border-slate-100 pt-6 space-y-4 text-left">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500"><MapPin className="w-4 h-4" /> From</div>
                <div className="font-bold text-slate-700">United States</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500"><Calendar className="w-4 h-4" /> Member since</div>
                <div className="font-bold text-slate-700">Jan 2024</div>
              </div>
            </div>
          </div>

          <div className="card p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Description</h2>
            <p className="text-slate-600 leading-relaxed">{seller.bio || 'Professional freelancer dedicated to delivering high-quality work.'}</p>
            
            {seller.skills && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {seller.skills.split(',').map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {seller.portfolio_url && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Portfolio
                </h3>
                <a 
                  href={seller.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm break-all"
                >
                  {seller.portfolio_url}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Gigs */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-3xl font-bold text-slate-900">{seller.name}'s Gigs</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {gigs.map((gig: any) => <GigCard key={gig.id} gig={gig} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
