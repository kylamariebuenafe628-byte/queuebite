import { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import Header from '../components/Header';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Menu() {
  const { addToCart } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    fetchMenu();
    const subscription = supabase
      .channel('public:items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchMenu();
      })
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, []);

  const fetchMenu = async () => {
    setIsLoading(true);
    const { data: itemsData, error: itemsError } = await supabase.from('items').select(`*, categories (name)`); 

    if (!itemsError && itemsData) {
      const availableItems = itemsData.filter(item => item.is_available === true);
      setMenuItems(availableItems);
      const uniqueCategories = ['All', ...new Set(availableItems.map(item => item.categories?.name).filter(Boolean))];
      setCategories(uniqueCategories);
    }
    setIsLoading(false);
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`, { icon: '🍔', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
  };

  const filteredMenu = activeCategory === 'All' ? menuItems : menuItems.filter(item => item.categories?.name === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header />
      
      <div className="bg-blue-700 text-white pt-20 pb-28 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Order ahead. <br /> Skip the line.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-blue-100 text-lg md:text-xl max-w-xl font-medium">
            Pre-order your favorite meals and pick them up without waiting. Fast, fresh, and hassle-free.
          </motion.p>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 right-40 w-72 h-72 rounded-full bg-blue-500 opacity-40 blur-3xl"></div>
      </div>

      <main className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-2 mb-10 overflow-x-auto p-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100">
          {categories.map((category) => (
            <button 
              key={category} 
              onClick={() => setActiveCategory(category)} 
              className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeCategory === category 
                  ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                  : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500 font-bold animate-pulse text-lg">Loading delicious food...</div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMenu.map((item) => (
              <motion.div 
                key={item.id} 
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} 
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
              >
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  <img src={item.image_url || 'https://placehold.co/600x400/e0e7ff/1e3a8a?text=Food'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm">
                    {item.categories?.name || 'Food'}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-1 leading-tight">{item.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price</span>
                      <span className="text-2xl font-extrabold text-blue-600">₱{Number(item.price).toFixed(2)}</span>
                    </div>
                    <button onClick={() => handleAddToCart(item)} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-sm active:scale-95 flex items-center gap-2">
                      Add <span className="text-lg leading-none">+</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}