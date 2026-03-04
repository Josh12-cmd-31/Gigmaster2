import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GigCard from '../components/GigCard';
import { User, MapPin, Calendar, Star, MessageSquare, ExternalLink, Tag } from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const [seller, setSeller] = useState<any>(null);
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
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
        
        const sellerGigs = allGigs.filter((g: any) => g.seller_id === Number(id));
        setGigs(sellerGigs);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-20">Loading...</div>;
  if (!seller) return <div className="max-w-7xl mx-auto px-4 py-20">Seller not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Sidebar */}
        <div className="space-y-8">
          <div className="card p-8 text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto overflow-hidden border-4 border-white shadow-lg">
                {seller.avatar ? <img src={seller.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-16 h-16 text-slate-400 m-8" />}
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{seller.name}</h1>
              <p className="text-slate-500">Professional Freelancer</p>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <span className="font-bold text-slate-900">{seller.rating}</span>
              <span className="text-slate-400">({seller.reviews} reviews)</span>
            </div>
            <button className="w-full btn-primary py-3">Contact Me</button>
            
            <div className="pt-6 border-t border-slate-100 space-y-4 text-left">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500"><MapPin className="w-4 h-4" /> From</div>
                <div className="font-bold text-slate-700">{seller.location}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500"><User className="w-4 h-4" /> Member since</div>
                <div className="font-bold text-slate-700">{seller.joined}</div>
              </div>
            </div>
          </div>

          <div className="card p-8 space-y-4">
            <h2 className="font-bold text-slate-900">Description</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{seller.bio || 'Expert freelancer with years of experience in the industry.'}</p>
            
            {seller.skills && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {seller.skills.split(',').map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {seller.portfolio_url && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <ExternalLink className="w-4 h-4" /> Portfolio
                </h3>
                <a 
                  href={seller.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-xs break-all"
                >
                  {seller.portfolio_url}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <h2 className="text-2xl font-bold text-slate-900">{seller.name}'s Gigs</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {gigs.map((gig: any) => <GigCard key={gig.id} gig={gig} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
