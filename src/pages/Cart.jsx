import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import Header from '../components/Header';
import { motion } from 'framer-motion';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6 mt-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-extrabold text-gray-900 mb-8">
          Your Cart
        </motion.h1>

        {cart.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
            <p className="text-gray-500 text-lg mb-6">Your cart is currently empty.</p>
            <Link to="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
              Browse Menu
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
              className="lg:col-span-2 space-y-4"
            >
              {cart.map((item) => (
                <motion.div 
                  key={item.id} 
                  variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
                >
                  <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="text-blue-600 font-bold mb-3">₱{Number(item.price).toFixed(2)}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-4 py-1.5 text-gray-600 hover:bg-gray-200 font-bold transition-colors">-</button>
                        <span className="px-4 py-1.5 font-bold text-gray-900 bg-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-4 py-1.5 text-gray-600 hover:bg-gray-200 font-bold transition-colors">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm hover:underline font-bold ml-2">Remove</button>
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-gray-900 text-lg">₱{(item.price * item.quantity).toFixed(2)}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit sticky top-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="flex justify-between mb-3 text-gray-600 font-medium"><span>Subtotal</span><span>₱{cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between mb-6 text-gray-600 font-medium"><span>Taxes & Fees</span><span>₱0.00</span></div>
              <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between font-extrabold text-2xl text-gray-900">
                <span>Total</span><span className="text-blue-600">₱{cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => navigate('/checkout')} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md active:scale-95">
                Proceed to Checkout
              </button>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}