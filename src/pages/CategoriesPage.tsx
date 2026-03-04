import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { name: 'Graphics & Design', icon: '🎨', desc: 'Logo design, branding, illustrations, and more.' },
  { name: 'Digital Marketing', icon: '📈', desc: 'SEO, social media, email marketing, and ads.' },
  { name: 'Writing & Translation', icon: '✍️', desc: 'Articles, copywriting, proofreading, and translation.' },
  { name: 'Video & Animation', icon: '🎥', desc: 'Video editing, 2D/3D animation, and motion graphics.' },
  { name: 'Music & Audio', icon: '🎵', desc: 'Voiceover, mixing, mastering, and sound design.' },
  { name: 'Programming & Tech', icon: '💻', desc: 'Web dev, mobile apps, AI, and cybersecurity.' },
  { name: 'Business', icon: '💼', desc: 'Virtual assistant, data entry, and market research.' },
  { name: 'Lifestyle', icon: '🧘', desc: 'Fitness, gaming, wellness, and personal lessons.' },
];

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Explore All Categories</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Find exactly what you need from our wide range of professional services.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {CATEGORIES.map(cat => (
          <Link 
            key={cat.name} 
            to={`/explore?category=${cat.name}`}
            className="card p-8 hover:border-primary transition-all group flex flex-col items-center text-center"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
              {cat.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
              {cat.name}
            </h3>
            <p className="text-slate-500 text-sm mb-6 flex-grow">
              {cat.desc}
            </p>
            <div className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Explore <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
