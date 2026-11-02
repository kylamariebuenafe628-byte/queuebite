import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import AdminLayout from '../../components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('kds-orders-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
      .order('queue_number', { ascending: true });
    
    if (!error) setOrders(data || []);
    setIsLoading(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    
    if (error) {
      toast.error('Failed to update status.');
      fetchOrders();
    } else {
      toast.success(`Order marked as ${newStatus.toUpperCase()}`, {
        icon: newStatus === 'preparing' ? '🍳' : newStatus === 'ready' ? '🔔' : '✅',
      });
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const OrderCard = ({ order, currentColumn }) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-extrabold text-lg px-3 py-1 rounded-lg">
            #{order.queue_number || '---'}
          </div>
          <div className="bg-gray-100 text-gray-800 font-extrabold text-sm px-3 py-1 rounded-lg">
            {order.reference_number}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-500 uppercase">{order.order_type}</p>
          <p className="text-sm font-extrabold text-gray-900">{order.customer_name}</p>
          <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1">{order.payment_method || 'Cash'}</p>
        </div>
      </div>
      
      {order.payment_method === 'GCash' && order.gcash_ref && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl mb-3">
          <p className="text-xs font-extrabold text-blue-800 uppercase mb-1">GCash Ref No:</p>
          <p className="text-sm font-bold text-blue-900 tracking-widest">{order.gcash_ref}</p>
        </div>
      )}

      {order.special_instructions && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-4">
          <p className="text-xs font-extrabold text-yellow-800 uppercase mb-1">Note:</p>
          <p className="text-sm font-bold text-yellow-900">{order.special_instructions}</p>
        </div>
      )}

      <div className="space-y-2 mb-4">
        {order.items && order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
            <span className="font-bold text-gray-800 text-sm"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs mr-2">{item.quantity}x</span> {item.name}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-auto">
        {currentColumn === 'confirmed' && (
          <button onClick={() => handleUpdateStatus(order.id, 'preparing')} className="w-full bg-blue-600 text-white py-3 rounded-xl font-extrabold hover:bg-blue-700 transition-colors shadow-sm">Start Cooking</button>
        )}
        {currentColumn === 'preparing' && (
          <button onClick={() => handleUpdateStatus(order.id, 'ready')} className="w-full bg-green-500 text-white py-3 rounded-xl font-extrabold hover:bg-green-600 transition-colors shadow-sm">Mark as Ready</button>
        )}
        {currentColumn === 'ready' && (
          <button onClick={() => handleUpdateStatus(order.id, 'completed')} className="w-full bg-gray-800 text-white py-3 rounded-xl font-extrabold hover:bg-gray-900 transition-colors shadow-sm">Complete Order</button>
        )}
      </div>
    </motion.div>
  );

  return (
    <AdminLayout title="Kitchen Display System (KDS)">
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse text-xl">Loading kitchen queue...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-yellow-50 rounded-3xl p-4 border border-yellow-200">
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-lg font-extrabold text-yellow-800">Pending</h2>
              <span className="bg-yellow-200 text-yellow-800 font-extrabold px-3 py-1 rounded-full">{pendingOrders.length}</span>
            </div>
            <div className="min-h-[500px]">
              <AnimatePresence>{pendingOrders.map(order => <OrderCard key={order.id} order={order} currentColumn="pending" />)}</AnimatePresence>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-3xl p-4 border border-purple-200">
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-lg font-extrabold text-purple-800">Confirmed</h2>
              <span className="bg-purple-200 text-purple-800 font-extrabold px-3 py-1 rounded-full">{confirmedOrders.length}</span>
            </div>
            <div className="min-h-[500px]">
              <AnimatePresence>{confirmedOrders.map(order => <OrderCard key={order.id} order={order} currentColumn="confirmed" />)}</AnimatePresence>
            </div>
          </div>

          <div className="bg-blue-50 rounded-3xl p-4 border border-blue-200">
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-lg font-extrabold text-blue-800">Cooking</h2>
              <span className="bg-blue-200 text-blue-800 font-extrabold px-3 py-1 rounded-full">{preparingOrders.length}</span>
            </div>
            <div className="min-h-[500px]">
              <AnimatePresence>{preparingOrders.map(order => <OrderCard key={order.id} order={order} currentColumn="preparing" />)}</AnimatePresence>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-3xl p-4 border border-green-200">
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-lg font-extrabold text-green-800">Ready</h2>
              <span className="bg-green-200 text-green-800 font-extrabold px-3 py-1 rounded-full">{readyOrders.length}</span>
            </div>
            <div className="min-h-[500px]">
              <AnimatePresence>{readyOrders.map(order => <OrderCard key={order.id} order={order} currentColumn="ready" />)}</AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}