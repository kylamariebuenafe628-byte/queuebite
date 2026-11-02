import { useLocation, Link, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import { motion } from 'framer-motion';

export default function OrderConfirmation() {
  const location = useLocation();
  const orderDetails = location.state;
  if (!orderDetails) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 text-center max-w-lg w-full">
          
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </motion.div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 mb-8 font-medium">Thank you, {orderDetails.customerName}. We are preparing your food.</p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4 border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <span className="text-gray-500 font-bold text-sm uppercase">Reference</span>
              <span className="font-extrabold text-2xl text-blue-600 tracking-wider">{orderDetails.orderNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Order Type</span>
              <span className="font-bold text-gray-900">{orderDetails.orderType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Est. Wait Time</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{orderDetails.estTime || '15 mins'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total Paid</span>
              <span className="font-bold text-gray-900">₱{orderDetails.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/track" state={{ orderNumber: orderDetails.orderNumber }} className="w-full px-6 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md">
              Track My Order
            </Link>
            <Link to="/" className="w-full px-6 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
              Order Again
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}