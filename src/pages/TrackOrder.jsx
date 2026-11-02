import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../CartContext';

export default function TrackOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [referenceNumber, setReferenceNumber] = useState(location.state?.orderNumber || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState('');

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setOrder(null);
    if (!referenceNumber.trim()) { setError('Please enter a reference number.'); return; }
    setIsLoading(true);

    const { data, error: dbError } = await supabase
      .from('orders')
      .select('*')
      .eq('reference_number', referenceNumber.trim().toUpperCase())
      .single(); 

    setIsLoading(false);
    if (dbError) { setError('No order found with that reference number.'); } 
    else if (data) { setOrder(data); }
  };

  const handleConfirmOrder = async () => {
    const { error: dbError } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', order.id);
      
    if (!dbError) {
      setOrder({ ...order, status: 'confirmed' });
      toast.success('Order confirmed! Proceeding to kitchen.', { icon: '✅' });
    } else {
      toast.error("Failed to confirm order.");
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    const { error: dbError } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
    if (!dbError) {
      setOrder({ ...order, status: 'cancelled' });
      toast.success('Order cancelled successfully.', { icon: '🗑️' });
    } else {
      toast.error("Failed to cancel order.");
    }
  };

  const handleOrderAgain = () => {
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        for(let i = 0; i < item.quantity; i++) {
          addToCart(item);
        }
      });
      navigate('/cart');
    }
  };

  useEffect(() => {
    if (!order) return;
    const channel = supabase
      .channel(`track-order-${order.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` }, (payload) => {
          setOrder((prevOrder) => ({ ...prevOrder, status: payload.new.status }));
          setUpdatedStatus(payload.new.status);
          setShowUpdateNotification(true);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [order?.id]);

  useEffect(() => {
    if (showUpdateNotification) {
      const timer = setTimeout(() => setShowUpdateNotification(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showUpdateNotification]);

  const getStatusTheme = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { text: 'text-yellow-800', bg: 'bg-yellow-100', border: 'border-yellow-300', stepColor: 'bg-yellow-500' };
      case 'confirmed': return { text: 'text-purple-800', bg: 'bg-purple-100', border: 'border-purple-300', stepColor: 'bg-purple-500' };
      case 'preparing': return { text: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-300', stepColor: 'bg-blue-600' };
      case 'ready': return { text: 'text-green-800', bg: 'bg-green-100', border: 'border-green-300', stepColor: 'bg-green-500' };
      case 'completed': return { text: 'text-gray-800', bg: 'bg-gray-100', border: 'border-gray-300', stepColor: 'bg-gray-500' };
      case 'cancelled': return { text: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300', stepColor: 'bg-red-500' };
      default: return { text: 'text-gray-800', bg: 'bg-gray-100', border: 'border-gray-300', stepColor: 'bg-gray-500' };
    }
  };

  const getStatusIndex = (status) => {
    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    return statuses.indexOf(status?.toLowerCase() || 'pending');
  };

  const theme = getStatusTheme(order?.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto p-6 mt-12 relative">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500 font-medium">Enter your reference number to see live updates.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="e.g. QB-1234" className="flex-1 border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800 uppercase tracking-widest" />
            <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-extrabold hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:bg-gray-400">
              {isLoading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </motion.div>

        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-5 rounded-2xl shadow-sm border border-red-100 text-center font-bold mb-8">{error}</motion.div>}

        {order && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
            <AnimatePresence>
              {showUpdateNotification && (
                <motion.div initial={{ opacity: 0, y: -50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }} className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl font-extrabold flex items-center gap-2 text-sm whitespace-nowrap">
                  <span>🔔</span> Status Updated to: {updatedStatus.toUpperCase()}
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`p-8 text-center border-b-4 transition-colors duration-500 ${theme.border} ${theme.bg}`}>
              <p className={`text-sm font-extrabold uppercase tracking-widest mb-2 ${theme.text}`}>Order Reference</p>
              <h2 className={`text-4xl font-extrabold tracking-wider ${theme.text}`}>{order.reference_number}</h2>
              
              <div className="mt-6 flex justify-center items-center gap-4">
                <div className="bg-white/70 px-6 py-3 rounded-2xl shadow-sm border border-white/50 backdrop-blur-sm">
                  <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Queue Number</p>
                  <p className="text-3xl font-extrabold text-gray-900">#{order.queue_number || '---'}</p>
                </div>
                <div className="bg-white/70 px-6 py-3 rounded-2xl shadow-sm border border-white/50 backdrop-blur-sm">
                  <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Est. Time</p>
                  <p className="text-xl font-extrabold text-gray-900 mt-1">{order.estimated_time || '15-20 mins'}</p>
                </div>
              </div>

              <div className={`inline-block mt-6 px-5 py-2 rounded-full font-extrabold shadow-sm bg-white/80 transition-colors duration-500 ${theme.text}`}>
                Status: {order.status.toUpperCase()}
              </div>
            </div>

            {order.status === 'pending' && (
              <div className="bg-yellow-50 border-b border-yellow-200 p-4 text-center">
                <p className="text-yellow-800 font-bold text-sm">
                  ⚠️ Your order is not yet confirmed. Please click "Confirm Order" below to proceed.
                </p>
              </div>
            )}

            {order.status !== 'cancelled' ? (
              <div className="p-8 border-b border-gray-100">
                <div className="flex justify-between relative">
                  <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 -z-10 -translate-y-1/2 rounded-full"></div>
                  <div className={`absolute top-1/2 left-0 h-1.5 ${theme.stepColor} -z-10 -translate-y-1/2 transition-all duration-1000 rounded-full`} style={{ width: `${(getStatusIndex(order.status) / 4) * 100}%` }}></div>
                  {['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'].map((step, index) => {
                    const isActive = index <= getStatusIndex(order.status);
                    return (
                      <div key={step} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 border-2 ${isActive ? `${theme.stepColor} border-white shadow-md text-white` : 'bg-white border-gray-200 text-gray-400'}`}>{index + 1}</div>
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center ${isActive ? theme.text : 'text-gray-400'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-red-50 text-red-600 text-center font-extrabold text-lg border-b border-red-100">This order has been cancelled.</div>
            )}

            <div className="p-8">
              <div className="flex justify-between items-center mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Customer</p>
                  <p className="font-extrabold text-gray-900 text-xl">{order.customer_name}</p>
                  <p className="text-sm text-gray-500 font-medium">{order.customer_contact}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Order Type</p>
                  <p className="font-extrabold text-gray-900 text-xl">{order.order_type}</p>
                </div>
              </div>

              <h3 className="font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-100 text-lg">Order Items</h3>
              <div className="space-y-4 mb-8">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm items-center">
                    <span className="text-gray-700 font-bold"><span className="bg-gray-100 px-2.5 py-1 rounded-lg text-xs mr-3 text-gray-600">{item.quantity}x</span> {item.name}</span>
                    <span className="font-extrabold text-gray-900 text-base">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-900 p-6 rounded-2xl flex justify-between items-center text-white shadow-inner mb-6">
                <span className="font-bold text-gray-300 uppercase tracking-wider">Total Amount</span>
                <span className="font-extrabold text-3xl text-white">₱{Number(order.total_amount).toFixed(2)}</span>
              </div>

              {order.status === 'pending' && (
                <div className="space-y-3">
                  <button onClick={handleConfirmOrder} className="w-full py-4 rounded-xl bg-blue-600 text-white font-extrabold text-lg hover:bg-blue-700 transition-colors shadow-md active:scale-95 flex justify-center items-center gap-2">
                    ✅ Confirm Order
                  </button>
                  <button onClick={handleCancelOrder} className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors">
                    Cancel Order
                  </button>
                </div>
              )}

              {order.status === 'completed' && (
                <button onClick={handleOrderAgain} className="w-full py-4 rounded-xl bg-blue-600 text-white font-extrabold text-lg hover:bg-blue-700 transition-colors shadow-md active:scale-95 flex justify-center items-center gap-2">
                  🔄 Order Again
                </button>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}