import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import Header from '../components/Header';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [orderType, setOrderType] = useState('Dine-in');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [gcashRef, setGcashRef] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-2xl mx-auto p-6 mt-12 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
          <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700">Return to Menu</Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !contactNumber.trim()) { 
      setError('Please fill in name and contact number.'); 
      return; 
    }
    if (paymentMethod === 'GCash' && !gcashRef.trim()) {
      setError('Please enter your GCash Reference Number.');
      return;
    }
    
    setIsSubmitting(true);
    const orderNumber = `QB-${Math.floor(1000 + Math.random() * 9000)}`;
    const maxPrepTime = Math.max(...cart.map(item => item.est_time || 10));
    const finalEstTime = `${maxPrepTime} mins`;

    try {
      const { error: dbError } = await supabase.from('orders').insert([{
        reference_number: orderNumber, 
        customer_name: customerName, 
        customer_contact: contactNumber,
        order_type: orderType,
        payment_method: paymentMethod,
        gcash_ref: paymentMethod === 'GCash' ? gcashRef : null,
        special_instructions: notes,
        estimated_time: finalEstTime,
        status: 'pending', 
        total_amount: cartTotal
      }]);
      
      if (dbError) throw dbError;

      if (email.trim()) {
        try {
          await emailjs.send(
            'service_afdfxg3', 
            'template_mf7f237', 
            { to_email: email, customer_name: customerName, reference_number: orderNumber, total_amount: cartTotal.toFixed(2) },
            'g7traGYWy4N1OwzQw'
          );
        } catch (emailErr) {
          console.log("Email failed to send, but order was placed.", emailErr);
        }
      }
      
      clearCart();
      toast.success('Order placed successfully!', { icon: '🎉', duration: 4000 });
      navigate('/confirmation', { state: { orderNumber, customerName, orderType, total: cartTotal, estTime: finalEstTime } });
    } catch (err) {
      setError(`Failed to place order: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-300">
      <Header />
      <main className="max-w-4xl mx-auto p-6 mt-8">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
          Checkout
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Customer Details</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold">{error}</div>}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Juan Dela Cruz" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contact Number</label>
                <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="e.g. 09123456789" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email (Optional - For Receipt)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@email.com" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Special Instructions</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. No onions, extra rice..." rows="2" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white"></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer border border-gray-200 dark:border-gray-600 rounded-xl p-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                    <input type="radio" name="payment" value="Cash" checked={paymentMethod === 'Cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-bold">💵 Cash</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer border border-gray-200 dark:border-gray-600 rounded-xl p-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                    <input type="radio" name="payment" value="GCash" checked={paymentMethod === 'GCash'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-bold">📱 GCash</span>
                  </label>
                </div>

                {paymentMethod === 'GCash' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 mt-2">GCash Reference No.</label>
                    <input type="text" value={gcashRef} onChange={(e) => setGcashRef(e.target.value)} placeholder="e.g. 1234 567 890123" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white" />
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Order Type</label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer border border-gray-200 dark:border-gray-600 rounded-xl p-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                    <input type="radio" name="orderType" value="Dine-in" checked={orderType === 'Dine-in'} onChange={(e) => setOrderType(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-bold">Dine-in</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer border border-gray-200 dark:border-gray-600 rounded-xl p-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                    <input type="radio" name="orderType" value="Takeout" checked={orderType === 'Takeout'} onChange={(e) => setOrderType(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-bold">Takeout</span>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-xl font-extrabold text-white text-lg transition-all shadow-md active:scale-95 mt-4 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isSubmitting ? 'Placing Order...' : `Place Order (₱${cartTotal.toFixed(2)})`}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm items-center">
                  <span className="text-gray-600 dark:text-gray-400 font-medium"><span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs mr-2">{item.quantity}x</span> {item.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white">₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between font-extrabold text-xl text-gray-900 dark:text-white">
              <span>Total</span><span className="text-blue-600 dark:text-blue-400">₱{cartTotal.toFixed(2)}</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}