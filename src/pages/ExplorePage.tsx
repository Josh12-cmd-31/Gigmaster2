import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GigCard from '../components/GigCard';
import { Filter, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { safeFetch } from '../utils/api';

const CATEGORIES = [
  'All Categories',
  'Graphics & Design',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'Music & Audio',
  'Programming & Tech',
  'Business',
  'Lifestyle',
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || 'All Categories');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setIsLoading(true);
    const catParam = category === 'All Categories' ? '' : `category=${category}`;
    const searchParam = search ? `&search=${search}` : '';
    safeFetch(`/api/gigs?${catParam}${searchParam}`)
      .then(data => {
        if (data) setGigs(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Explore fetch error:', err);
        setIsLoading(false);
      });
  }, [category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {category === 'All Categories' ? 'Explore Services' : category}
          </h1>
          <p className="text-slate-500">Find the best talent for your next project</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search services..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
            <SlidersHorizontal className="w-6 h-6 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
              category === cat 
                ? 'bg-primary text-white shadow-lg' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="card h-80 animate-pulse bg-slate-100"></div>
          ))}
        </div>
      ) : gigs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gigs.map(gig => <GigCard key={gig.id} gig={gig} />)}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No services found</h3>
          <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
          <button 
            onClick={() => {setCategory('All Categories'); setSearch('');}}
            className="mt-6 text-primary font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
