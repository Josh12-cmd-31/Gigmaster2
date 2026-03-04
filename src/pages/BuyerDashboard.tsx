import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, MessageSquare, Clock, Star, ArrowRight } from 'lucide-react';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/orders/buyer/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setIsLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
          <Link to="/seller-dashboard" className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all">
            Switch to Selling
          </Link>
        </div>
        <p className="text-slate-500">Manage your orders and track your projects</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">My Active Orders</h2>
              <Link to="/explore" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                Find more services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {orders.length > 0 ? (
                orders.map((order: any) => (
                  <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-4">
                      <div className="w-20 h-16 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={`https://picsum.photos/seed/${order.gig_id}/200/150`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 line-clamp-1">{order.gig_title}</h3>
                        <p className="text-sm text-slate-500">Seller: <span className="font-bold text-slate-700">{order.seller_name}</span></p>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider pt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 3 days left</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${order.amount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {order.status}
                      </span>
                      <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center space-y-4">
                  <div className="text-5xl">📦</div>
                  <h3 className="text-lg font-bold text-slate-900">No active orders</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">You haven't placed any orders yet. Explore our marketplace to find the perfect service.</p>
                  <Link to="/explore" className="btn-primary inline-block">Explore Services</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Links</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-slate-700">Saved Gigs</span>
                </div>
                <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-400 border border-slate-100">0</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-bold text-slate-700">Messages</span>
                </div>
                <span className="bg-primary text-white px-2 py-1 rounded-lg text-xs font-bold">New</span>
              </button>
            </div>
          </div>

          <div className="card p-8 bg-gradient-to-br from-primary to-blue-900 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Start selling on GigMaster</h3>
              <p className="text-blue-100 text-sm mb-8">Turn your skills into a thriving business. Join thousands of freelancers earning today.</p>
              <Link to="/signup?role=seller" className="btn-secondary w-full inline-block text-center">Become a Seller</Link>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
