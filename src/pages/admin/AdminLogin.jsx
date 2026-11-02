import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { 
      setError(authError.message); 
      setIsLoading(false); 
    } else { 
      navigate('/admin'); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-600 to-blue-900 flex items-center justify-center p-6 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, type: "spring" }} 
        className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">QueueBite<span className="text-blue-600">POS</span></h1>
          <p className="text-gray-500 text-sm font-medium">Sign in to manage the system</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-5 text-center border border-red-100"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@queuebite.com" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-gray-50 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-gray-50 text-sm" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading} 
            className={`w-full py-3 rounded-xl font-extrabold text-white text-md transition-all shadow-md active:scale-95 mt-2 ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}