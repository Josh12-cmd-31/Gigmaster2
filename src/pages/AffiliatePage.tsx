import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  DollarSign, 
  Link as LinkIcon, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  History, 
  Clock,
  ShieldCheck,
  Zap,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { safeFetch } from '../utils/api';

interface Referral {
  id: number;
  name: string;
  created_at: string;
}

interface AffiliateStats {
  referral_code: string;
  balance: number;
  is_premium: number;
  total_referrals: number;
  referrals: Referral[];
}

interface Withdrawal {
  id: number;
  amount: number;
  status: string;
  processing_days: number;
  created_at: string;
}

export default function AffiliatePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [statsData, withdrawalsData] = await Promise.all([
        safeFetch(`/api/affiliate/stats/${user.id}`),
        safeFetch(`/api/affiliate/withdrawals/${user.id}`)
      ]);
      setStats(statsData);
      setWithdrawals(withdrawalsData);
    } catch (err) {
      console.error('Error fetching affiliate data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!stats) return;
    const link = `${window.location.origin}/signup?ref=${stats.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !withdrawAmount) return;

    setIsWithdrawing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await safeFetch('/api/affiliate/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: parseFloat(withdrawAmount)
        })
      });
      setSuccess(result.message);
      setWithdrawAmount('');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    try {
      await safeFetch('/api/users/upgrade-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      fetchData();
      window.location.reload(); // Refresh to update user context
    } catch (err) {
      console.error('Upgrade error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user?.is_premium) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center space-y-8 border border-slate-100">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Crown className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-900">Affiliate Marketing is for Premium Users</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Upgrade to GigMaster Premium to unlock our affiliate program and start earning $30 for every user you invite.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
              <Zap className="w-8 h-8 text-primary" />
              <h3 className="font-bold text-slate-900">Earn $30/Invite</h3>
              <p className="text-sm text-slate-600">Get paid for every successful referral you bring to the platform.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
              <Clock className="w-8 h-8 text-primary" />
              <h3 className="font-bold text-slate-900">Fast Withdrawals</h3>
              <p className="text-sm text-slate-600">Premium users enjoy 1-day processing for all withdrawal requests.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h3 className="font-bold text-slate-900">Lower Limits</h3>
              <p className="text-sm text-slate-600">Withdraw your earnings starting from just $50 instead of $100.</p>
            </div>
          </div>

          <button 
            onClick={handleUpgrade}
            className="btn-primary px-12 py-4 text-xl rounded-2xl shadow-lg shadow-primary/20"
          >
            Upgrade to Premium Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Affiliate Dashboard
          </h1>
          <p className="text-slate-500">Invite friends and earn $30 for each successful signup</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-full flex items-center gap-2 border border-primary/20">
          <Crown className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">Premium Member</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4"
        >
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Available Balance</p>
            <h2 className="text-4xl font-bold text-slate-900">${stats?.balance.toFixed(2)}</h2>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Referrals</p>
            <h2 className="text-4xl font-bold text-slate-900">{stats?.total_referrals}</h2>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Earnings</p>
            <h2 className="text-4xl font-bold text-slate-900">$0.00</h2>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Referral Link Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              Your Referral Link
            </h3>
            <p className="text-slate-600">Share this link with your network. When they sign up, you'll receive $30 in your balance.</p>
            
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex-grow px-4 font-mono text-sm text-slate-600 overflow-hidden truncate">
                {window.location.origin}/signup?ref={stats?.referral_code}
              </div>
              <button 
                onClick={copyReferralLink}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  copied ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-blue-700'
                }`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Referrals List */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Recent Referrals</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {stats?.referrals.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  No referrals yet. Start sharing your link to earn!
                </div>
              ) : (
                stats?.referrals.map((ref) => (
                  <div key={ref.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                        {ref.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{ref.name}</div>
                        <div className="text-xs text-slate-500">Joined {new Date(ref.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-green-600 font-bold flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      +$30.00
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Withdraw Funds
            </h3>
            
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary shrink-0" />
              <div className="text-sm text-slate-600">
                <p className="font-bold text-primary mb-1">Premium Benefit</p>
                Minimum withdrawal: <strong>$50</strong><br />
                Processing time: <strong>1 Day</strong>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {success}
                </div>
              )}

              <button 
                type="submit"
                disabled={isWithdrawing || !withdrawAmount}
                className="w-full btn-primary py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {isWithdrawing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Request Withdrawal</>
                )}
              </button>
            </form>
          </div>

          {/* Withdrawal History */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Withdrawals
            </h3>
            
            <div className="space-y-4">
              {withdrawals.length === 0 ? (
                <p className="text-center text-slate-400 py-4">No withdrawal history</p>
              ) : (
                withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <div className="font-bold text-slate-900">${w.amount.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        {new Date(w.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {w.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
