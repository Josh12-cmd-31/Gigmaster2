import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, MessageSquare, Bell, User, LogOut, Menu, X, Sparkles, Code2, Palette } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-bottom border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">G</div>
              <span className="text-2xl font-bold text-primary tracking-tight hidden sm:block">GigMaster</span>
            </Link>
            
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-96">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="What service are you looking for today?" 
                className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/explore" className="text-slate-600 hover:text-primary font-medium">Explore</Link>
            <div className="relative group">
              <button className="text-slate-600 hover:text-primary font-medium flex items-center gap-1">
                Tools <Menu className="w-4 h-4" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 hidden group-hover:block">
                <Link to="/ai-tutoring" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Tutoring
                </Link>
                <Link to="/web-dev-tools" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-500" /> Web Dev Tools
                </Link>
                <Link to="/logo-designer" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-orange-500" /> Logo Designer
                </Link>
              </div>
            </div>
            {user ? (
              <>
                <Link 
                  to={user.role === 'seller' ? "/buyer-dashboard" : "/seller-dashboard"} 
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  {user.role === 'seller' ? 'Switch to Buying' : 'Switch to Selling'}
                </Link>
                <Link to="/messages" className="text-slate-600 hover:text-primary"><MessageSquare className="w-6 h-6" /></Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 focus:outline-none">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                      {user.avatar ? <img src={user.avatar} alt={user.name} /> : <User className="w-5 h-5 text-slate-500" />}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 hidden group-hover:block">
                    <Link to={user.role === 'seller' ? "/seller-dashboard" : "/buyer-dashboard"} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Dashboard</Link>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-600 hover:text-primary font-medium">Sign In</Link>
                <Link to="/signup" className="btn-primary">Join</Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4">
          <Link to="/explore" className="block text-slate-600 font-medium">Explore</Link>
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4">Tools</div>
            <Link to="/ai-tutoring" className="flex items-center gap-3 px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary" /> AI Tutoring
            </Link>
            <Link to="/web-dev-tools" className="flex items-center gap-3 px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">
              <Code2 className="w-5 h-5 text-emerald-500" /> Web Dev Tools
            </Link>
            <Link to="/logo-designer" className="flex items-center gap-3 px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">
              <Palette className="w-5 h-5 text-orange-500" /> Logo Designer
            </Link>
          </div>
          {!user ? (
            <>
              <Link to="/login" className="block text-slate-600 font-medium">Sign In</Link>
              <Link to="/signup" className="block btn-primary text-center">Join</Link>
            </>
          ) : (
            <>
              <Link 
                to={user.role === 'seller' ? "/buyer-dashboard" : "/seller-dashboard"} 
                className="block px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold text-center"
              >
                {user.role === 'seller' ? 'Switch to Buying' : 'Switch to Selling'}
              </Link>
              <Link to={user.role === 'seller' ? "/seller-dashboard" : "/buyer-dashboard"} className="block text-slate-600 font-medium">Dashboard</Link>
              <button onClick={logout} className="block text-red-600 font-medium">Sign Out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
