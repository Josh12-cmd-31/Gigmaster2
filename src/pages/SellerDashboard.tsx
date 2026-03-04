import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Plus, DollarSign, TrendingUp, Users, Star, Clock } from 'lucide-react';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/orders/seller/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setIsLoading(false);
        });
    }
  }, [user]);

  const stats = [
    { label: 'Total Earnings', value: '$1,240.00', icon: <DollarSign className="text-emerald-600" />, bg: 'bg-emerald-100' },
    { label: 'Active Orders', value: orders.filter((o: any) => o.status === 'pending').length, icon: <ShoppingBag className="text-blue-600" />, bg: 'bg-blue-100' },
    { label: 'Total Sales', value: orders.length, icon: <TrendingUp className="text-purple-600" />, bg: 'bg-purple-100' },
    { label: 'Avg. Rating', value: '4.9', icon: <Star className="text-amber-600" />, bg: 'bg-amber-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Seller Dashboard</h1>
            <Link to="/buyer-dashboard" className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all">
              Switch to Buying
            </Link>
          </div>
          <p className="text-slate-500">Manage your gigs and track your earnings</p>
        </div>
        <Link to="/create-gig" className="btn-secondary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create New Gig
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map(stat => (
          <div key={stat.label} className="card p-6 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500">{stat.label}</div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Active Orders</h2>
              <Link to="/orders" className="text-primary text-sm font-bold hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Buyer</th>
                    <th className="px-6 py-4">Gig</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length > 0 ? (
                    orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{order.buyer_name}</td>
                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{order.gig_title}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">${order.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No orders yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-bold text-slate-700">Manage Profile</span>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span className="font-bold text-slate-700">Delivery Settings</span>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-secondary" />
              </button>
            </div>
          </div>

          <div className="card p-6 bg-primary text-white">
            <h2 className="text-xl font-bold mb-2">Grow your business</h2>
            <p className="text-blue-100 text-sm mb-6">Learn how to optimize your gigs and increase your sales with our expert guides.</p>
            <Link to="/seller-guidelines" className="w-full py-3 bg-white text-primary rounded-xl font-bold hover:bg-blue-50 transition-colors inline-block text-center">
              Read Seller Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
