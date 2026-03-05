import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Star, MapPin, Calendar, Globe, Mail, MessageSquare, Briefcase, Award, ExternalLink, Clock } from 'lucide-react';
import { safeFetch } from '../utils/api';
import GigCard from '../components/GigCard';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      safeFetch(`/api/users/${id}`),
      safeFetch(`/api/gigs/seller/${id}`)
    ]).then(([userData, gigsData]) => {
      if (userData) setProfile(userData);
      if (gigsData) setGigs(gigsData);
      setIsLoading(false);
    }).catch(err => {
      console.error('Profile fetch error:', err);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">User not found</h2>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    );
  }

  const skills = profile.skills ? profile.skills.split(',').map((s: string) => s.trim()) : [];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header / Cover Area */}
      <div className="h-48 bg-gradient-to-r from-primary/20 to-blue-600/20 border-b border-slate-200"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Info */}
          <div className="space-y-6">
            <div className="card p-8 text-center lg:text-left">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 mx-auto lg:mx-0">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{profile.name}</h1>
              <p className="text-slate-500 mb-6 capitalize">{profile.role}</p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                <button className="btn-primary flex-grow">Contact Me</button>
                <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-slate-100 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>United States</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <User className="w-4 h-4" />
                  <span>Member since {new Date(profile.created_at).getFullYear()}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>Avg. Response Time: 1 hour</span>
                </div>
              </div>
            </div>

            {profile.role === 'seller' && (
              <div className="card p-8">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? skills.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                      {skill}
                    </span>
                  )) : (
                    <p className="text-slate-400 text-sm italic">No skills listed</p>
                  )}
                </div>
              </div>
            )}

            {profile.portfolio_url && (
              <div className="card p-8">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Portfolio
                </h3>
                <a 
                  href={profile.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                >
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{profile.portfolio_url}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">About Me</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed">
                  {profile.bio || "No bio provided yet."}
                </p>
              </div>
              
              {profile.experience && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Experience
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {profile.experience}
                  </p>
                </div>
              )}
            </div>

            {profile.role === 'seller' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">My Gigs</h2>
                  <span className="text-slate-400 text-sm font-bold">{gigs.length} Gigs</span>
                </div>
                
                {gigs.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {gigs.map((gig: any) => (
                      <GigCard key={gig.id} gig={gig} />
                    ))}
                  </div>
                ) : (
                  <div className="card p-12 text-center text-slate-500 italic">
                    This seller hasn't published any gigs yet.
                  </div>
                )}
              </div>
            )}

            {profile.role === 'buyer' && (
              <div className="card p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">My Needs</h2>
                <p className="text-slate-600 leading-relaxed">
                  {profile.bio ? `I am looking for talented freelancers to help with: ${profile.bio}` : "I haven't specified my needs yet."}
                </p>
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <div className="text-2xl font-bold text-slate-900">0</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orders</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <div className="text-2xl font-bold text-slate-900">0</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reviews</div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
