import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, ShoppingBag, AlertCircle, CheckCircle, Trash2, Clock, DollarSign, XCircle } from 'lucide-react';
import { safeFetch } from '../utils/api';

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'gigs' | 'withdrawals'>('users');

  const fetchData = async () => {
    if (!user?.firebase_uid) return;
    setIsLoading(true);
    try {
      const headers = { 'x-admin-uid': user.firebase_uid };
      const [usersRes, gigsRes, withdrawalsRes] = await Promise.all([
        safeFetch('/api/admin/users', { headers }),
        safeFetch('/api/gigs'),
        safeFetch('/api/admin/withdrawals', { headers })
      ]);
      setUsers(usersRes);
      setGigs(gigsRes);
      setWithdrawals(withdrawalsRes);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const handleUserDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await safeFetch(`/api/admin/users/${id}`, { 
      method: 'DELETE',
      headers: { 'x-admin-uid': user?.firebase_uid || '' }
    });
    fetchData();
  };

  const handleGigStatus = async (id: number, status: string) => {
    await safeFetch(`/api/admin/gigs/${id}/status`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-uid': user?.firebase_uid || ''
      },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const handleWithdrawalStatus = async (id: number, status: string) => {
    await safeFetch(`/api/admin/withdrawals/${id}/status`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-uid': user?.firebase_uid || ''
      },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-500">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-slate-500">Platform moderation and management</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['users', 'gigs', 'withdrawals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'users' && (
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
                      <th className="px-6 py-4">Balance</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u: any) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                {u.name}
                                {u.is_premium === 1 && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">PRO</span>}
                              </div>
                              <div className="text-xs text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'seller' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">
                          ${u.balance?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleUserDelete(u.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'gigs' && (
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
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gigs.map((g: any) => (
                      <tr key={g.id}>
                        <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">{g.title}</td>
                        <td className="px-6 py-4 text-slate-600">{g.seller_name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            g.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-3">
                          <button 
                            onClick={() => handleGigStatus(g.id, 'published')}
                            className="text-emerald-500 hover:underline text-xs font-bold"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleGigStatus(g.id, 'rejected')}
                            className="text-red-500 hover:underline text-xs font-bold"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="card">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Withdrawal Requests</h2>
                <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500">{withdrawals.length} Total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {withdrawals.map((w: any) => (
                      <tr key={w.id}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{w.user_name}</div>
                          <div className="text-xs text-slate-400">{w.user_email}</div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">${w.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            w.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                            w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-3">
                          {w.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleWithdrawalStatus(w.id, 'completed')}
                                className="text-emerald-500 hover:underline text-xs font-bold"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleWithdrawalStatus(w.id, 'rejected')}
                                className="text-red-500 hover:underline text-xs font-bold"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="card p-6 bg-slate-900 text-white">
            <h2 className="text-xl font-bold mb-6">Platform Stats</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-400">Total Users</span>
                </div>
                <span className="font-bold">{users.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <span className="text-slate-400">Total Gigs</span>
                </div>
                <span className="font-bold">{gigs.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <span className="text-slate-400">Pending Payouts</span>
                </div>
                <span className="font-bold">
                  ${withdrawals.filter(w => w.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="text-slate-400">Avg. Payout Time</span>
                  </div>
                  <span className="font-bold">1.2 Days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> System Alerts
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">
                <span className="font-bold">Withdrawal Spike:</span> 12 new requests in the last hour.
              </div>
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800">
                <span className="font-bold">Database Backup:</span> Last backup failed 2 hours ago.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
