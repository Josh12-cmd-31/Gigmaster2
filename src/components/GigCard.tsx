import { Link } from 'react-router-dom';
import { Star, User } from 'lucide-react';

interface GigCardProps {
  gig: {
    id: number;
    title: string;
    price_basic: number;
    image_url: string;
    rating: number;
    reviews_count: number;
    seller_id: number;
    seller_name: string;
    seller_avatar?: string;
    created_at?: string;
  };
}

export default function GigCard({ gig }: GigCardProps) {
  const isNew = gig.created_at ? (
    (() => {
      // SQLite CURRENT_TIMESTAMP is 'YYYY-MM-DD HH:MM:SS' in UTC
      // Convert to ISO format 'YYYY-MM-DDTHH:MM:SSZ' for reliable parsing
      const isoString = gig.created_at.includes('T') ? gig.created_at : gig.created_at.replace(' ', 'T') + 'Z';
      const createdDate = new Date(isoString);
      const now = new Date();
      return (now.getTime() - createdDate.getTime()) < 24 * 60 * 60 * 1000;
    })()
  ) : false;

  return (
    <div className="card group">
      <Link to={`/gig/${gig.id}`} className="block">
        <div className="aspect-video overflow-hidden relative">
          <img 
            src={gig.image_url || `https://picsum.photos/seed/${gig.id}/400/300`} 
            alt={gig.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          {isNew && (
            <div className="absolute top-2 left-2 bg-secondary text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm uppercase tracking-wider">
              New
            </div>
          )}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
            From ${gig.price_basic}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/profile/${gig.seller_id}`} className="flex items-center gap-2 mb-3 hover:text-primary transition-colors">
          <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
            {gig.seller_avatar ? <img src={gig.seller_avatar} alt={gig.seller_name} /> : <User className="w-4 h-4 text-slate-400" />}
          </div>
          <span className="text-sm font-medium text-slate-700">{gig.seller_name}</span>
        </Link>
        <Link to={`/gig/${gig.id}`}>
          <h3 className="font-semibold text-slate-900 line-clamp-2 mb-4 group-hover:text-primary transition-colors">
            {gig.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-sm font-bold text-slate-900">{gig.rating || '5.0'}</span>
            <span className="text-xs text-slate-400">({gig.reviews_count || '0'})</span>
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Starting at <span className="text-sm font-bold text-slate-900 ml-1">${gig.price_basic}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
