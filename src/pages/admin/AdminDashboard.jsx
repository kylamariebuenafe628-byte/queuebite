import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import AdminLayout from '../../components/AdminLayout';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from('orders').select('total_amount, status');
      if (data) {
        const pending = data.filter(o => o.status === 'pending').length;
        const revenue = data.reduce((sum, o) => sum + Number(o.total_amount), 0);
        setStats({ totalOrders: data.length, pending, revenue });
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: '🛍️', color: 'text-gray-900', bg: 'bg-gray-100' },
          { label: 'Pending Queue', value: stats.pending, icon: '⏳', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Revenue', value: `₱${stats.revenue.toFixed(2)}`, icon: '💰', color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`w-14 h-14 ${stat.bg} rounded-full flex items-center justify-center text-2xl`}>{stat.icon}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Link to="/admin/orders" className="block bg-blue-600 text-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden group h-full">
            <h3 className="text-2xl font-bold mb-2 relative z-10">Manage Orders &rarr;</h3>
            <p className="text-blue-100 relative z-10 font-medium">View live incoming orders, update their status, and manage the queue efficiently.</p>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform"></div>
          </Link>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Link to="/admin/menu" className="block bg-gray-900 text-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden group h-full">
            <h3 className="text-2xl font-bold mb-2 relative z-10">Manage Menu &rarr;</h3>
            <p className="text-gray-400 relative z-10 font-medium">Add new food items, change prices, or toggle stock availability instantly.</p>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform"></div>
          </Link>
        </motion.div>
      </div>
    </AdminLayout>
  );
}