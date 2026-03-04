import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, ShoppingBag, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, these would be admin-only endpoints
    Promise.all([
      fetch('/api/gigs').then(res => res.json()),
      // Mocking users list as we don't have a public endpoint for it
      Promise.resolve([
        { id: 1, name: 'Admin User', email: 'admin@gigmaster.com', role: 'admin' },
        { id: 2, name: 'John Seller', email: 'john@example.com', role: 'seller' },
        { id: 3, name: 'Jane Buyer', email: 'jane@example.com', role: 'buyer' },
      ])
    ]).then(([gigsData, usersData]) => {
      setGigs(gigsData);
      setUsers(usersData as any);
      setIsLoading(false);
    });
  }, []);

  if (user?.role !== 'admin' && user?.email !== 'admin@gigmaster.com') {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Access Denied. Admin only.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-500">Platform moderation and management</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">User Management</h2>
              <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500">{users.length} Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u: any) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'seller' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                          <CheckCircle className="w-3 h-3" /> Active
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Gig Moderation</h2>
              <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500">{gigs.length} Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Gig Title</th>
                    <th className="px-6 py-4">Seller</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gigs.map((g: any) => (
                    <tr key={g.id}>
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">{g.title}</td>
                      <td className="px-6 py-4 text-slate-600">{g.seller_name}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">{g.category}</td>
                      <td className="px-6 py-4 flex gap-3">
                        <button className="text-emerald-500 hover:underline text-xs font-bold">Approve</button>
                        <button className="text-red-500 hover:underline text-xs font-bold">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card p-6 bg-slate-900 text-white">
            <h2 className="text-xl font-bold mb-6">Platform Stats</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <span className="text-slate-400">Total Volume</span>
                </div>
                <span className="font-bold">$45,200</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-slate-400">Active Disputes</span>
                </div>
                <span className="font-bold">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
