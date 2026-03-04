import { motion } from 'motion/react';
import { ShieldCheck, Star, Clock, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

export default function SellerGuidelinesPage() {
  const guidelines = [
    {
      title: 'Maintain High Quality',
      icon: <Star className="w-6 h-6 text-amber-500" />,
      desc: 'Deliver work that exceeds expectations. Quality is the most important factor for long-term success on GigMaster.'
    },
    {
      title: 'On-Time Delivery',
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      desc: 'Always respect the deadlines you set. If you need more time, communicate with the buyer as early as possible.'
    },
    {
      title: 'Clear Communication',
      icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
      desc: 'Respond to messages promptly and professionally. Clear expectations prevent disputes and lead to better reviews.'
    },
    {
      title: 'Platform Safety',
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
      desc: 'Keep all communications and payments within GigMaster. This protects you and ensures you get paid for your work.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Seller Success Guidelines</h1>
        <p className="text-slate-500 text-lg">Everything you need to know to thrive as a freelancer on GigMaster.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {guidelines.map((item, idx) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="card p-8 space-y-4"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
              {item.icon}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
            <p className="text-slate-600 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="card p-8 bg-slate-900 text-white space-y-8">
        <div className="flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          <h2 className="text-2xl font-bold">Prohibited Actions</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <div className="mt-1"><CheckCircle className="w-4 h-4 text-red-500" /></div>
            <p className="text-slate-300 text-sm">Sharing personal contact information (email, phone, etc.) before an order is placed.</p>
          </div>
          <div className="flex gap-3">
            <div className="mt-1"><CheckCircle className="w-4 h-4 text-red-500" /></div>
            <p className="text-slate-300 text-sm">Requesting payment outside of the GigMaster platform.</p>
          </div>
          <div className="flex gap-3">
            <div className="mt-1"><CheckCircle className="w-4 h-4 text-red-500" /></div>
            <p className="text-slate-300 text-sm">Delivering low-quality or plagiarized work.</p>
          </div>
          <div className="flex gap-3">
            <div className="mt-1"><CheckCircle className="w-4 h-4 text-red-500" /></div>
            <p className="text-slate-300 text-sm">Using multiple accounts to manipulate ratings or reviews.</p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-sm italic">Failure to follow these guidelines may result in account suspension or permanent ban.</p>
        </div>
      </div>
    </div>
  );
}
