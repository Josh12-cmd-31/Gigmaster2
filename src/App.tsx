import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ExplorePage from './pages/ExplorePage';
import GigDetailsPage from './pages/GigDetailsPage';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import CreateGigPage from './pages/CreateGigPage';
import MessagePage from './pages/MessagePage';
import SellerProfilePage from './pages/SellerProfilePage';
import AdminPanel from './pages/AdminPanel';
import CategoriesPage from './pages/CategoriesPage';
import SellerGuidelinesPage from './pages/SellerGuidelinesPage';
import AiTutoringPage from './pages/AiTutoringPage';
import WebDevToolsPage from './pages/WebDevToolsPage';
import LogoDesignerPage from './pages/LogoDesignerPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/gig/:id" element={<GigDetailsPage />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
              <Route path="/create-gig" element={<CreateGigPage />} />
              <Route path="/messages" element={<MessagePage />} />
              <Route path="/profile/:id" element={<SellerProfilePage />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/seller-guidelines" element={<SellerGuidelinesPage />} />
              <Route path="/ai-tutoring" element={<AiTutoringPage />} />
              <Route path="/web-dev-tools" element={<WebDevToolsPage />} />
              <Route path="/logo-designer" element={<LogoDesignerPage />} />
            </Routes>
          </main>
          <footer className="bg-slate-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-4 gap-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">G</div>
                    <span className="text-xl font-bold tracking-tight">GigMaster</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Connecting talented freelancers with businesses worldwide. Where skills meet opportunity.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Categories</h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li>Graphics & Design</li>
                    <li>Digital Marketing</li>
                    <li>Writing & Translation</li>
                    <li>Programming & Tech</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Support</h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li>Help & Support</li>
                    <li>Trust & Safety</li>
                    <li>Selling on GigMaster</li>
                    <li>Buying on GigMaster</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Community</h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li>Events</li>
                    <li>Blog</li>
                    <li>Forum</li>
                    <li>Affiliates</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:row justify-between items-center gap-4">
                <p className="text-slate-500 text-sm">© 2026 GigMaster Inc. All rights reserved.</p>
                <div className="flex gap-6 text-slate-500 text-sm">
                  <span>Privacy Policy</span>
                  <span>Terms of Service</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
