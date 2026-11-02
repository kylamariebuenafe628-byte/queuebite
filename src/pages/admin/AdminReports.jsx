import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import AdminLayout from '../../components/AdminLayout';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminReports() {
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
        const salesByDate = {};
        data.forEach(order => {
          const date = new Date(order.created_at).toLocaleDateString();
          if (!salesByDate[date]) salesByDate[date] = 0;
          salesByDate[date] += Number(order.total_amount);
        });
        const formattedChartData = Object.keys(salesByDate).map(date => ({
          date: date,
          sales: salesByDate[date]
        })).reverse();
        setChartData(formattedChartData);
      }
      setIsLoading(false);
    };
    fetchReportData();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

  return (
    <AdminLayout title="Sales Analytics & Reports">
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse text-xl">Generating Reports...</div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total Completed Sales</p>
              <p className="text-4xl font-extrabold text-green-600">₱{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total Transactions</p>
              <p className="text-4xl font-extrabold text-gray-900">{orders.length}</p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-900 mb-6">Revenue Trend</h3>
            <div className="h-72 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fontWeight: 'bold'}} tickLine={false} axisLine={{stroke: '#cbd5e1'}} />
                    <YAxis tick={{fontSize: 12, fontWeight: 'bold'}} tickLine={false} axisLine={{stroke: '#cbd5e1'}} tickFormatter={(value) => `₱${value}`} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 font-bold">No completed sales data yet.</div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-extrabold text-gray-900">Recent Completed Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4 border-b border-gray-200">Ref Number</th>
                    <th className="p-4 border-b border-gray-200">Customer</th>
                    <th className="p-4 border-b border-gray-200">Amount</th>
                    <th className="p-4 border-b border-gray-200">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-blue-50 transition-colors even:bg-gray-50">
                      <td className="p-4 font-extrabold text-blue-600 border-r border-gray-100">{order.reference_number}</td>
                      <td className="p-4 font-bold text-gray-800 border-r border-gray-100">{order.customer_name}</td>
                      <td className="p-4 font-bold text-green-600 border-r border-gray-100">₱{Number(order.total_amount).toFixed(2)}</td>
                      <td className="p-4 text-sm font-medium text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}