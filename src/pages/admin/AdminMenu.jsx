import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import AdminLayout from '../../components/AdminLayout';
import { motion } from 'framer-motion';

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category_id: '', image_url: '', est_time: 10 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [itemsRes, categoriesRes] = await Promise.all([
      supabase.from('items').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*')
    ]);
    if (itemsRes.data) {
      const normalized = itemsRes.data.map(item => ({
        ...item,
        is_available: item.is_available === true || String(item.is_available).toLowerCase() === 'true'
      }));
      setItems(normalized);
    }
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setIsLoading(false);
  };

  const handleToggle = async (id, current) => {
    const newStatus = !current;
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_available: newStatus } : i));
    await supabase.from('items').update({ is_available: newStatus }).eq('id', id);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('items').insert([{
      ...formData, 
      price: parseFloat(formData.price), 
      est_time: parseInt(formData.est_time),
      is_available: true
    }]);
    if (!error) { setIsAdding(false); fetchData(); }
    else { alert(error.message); }
  };

  return (
    <AdminLayout title="Manage Menu">
      <div className="flex justify-end mb-6">
        <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-extrabold shadow-md hover:bg-blue-700 transition-colors active:scale-95">
          {isAdding ? 'Cancel' : '+ Add New Item'}
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input required placeholder="Item Name" className="border p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required type="number" step="0.01" placeholder="Price (₱)" className="border p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, price: e.target.value})} />
            <input required type="number" placeholder="Est. Prep Time (mins)" className="border p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, est_time: e.target.value})} defaultValue={10} />
            <input placeholder="Description" className="border p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, description: e.target.value})} />
            <select required className="border p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, category_id: e.target.value})}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Image URL (Optional)" className="border p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, image_url: e.target.value})} />
            <button type="submit" className="md:col-span-2 bg-green-600 text-white py-3 rounded-xl font-extrabold hover:bg-green-700 transition-colors">Save Item</button>
          </form>
        </motion.div>
      )}

      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse text-xl">Loading menu data...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="p-5">Item Name</th>
                <th className="p-5">Price</th>
                <th className="p-5">Prep Time</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-5 font-bold text-gray-900 flex items-center gap-4">
                    {item.image_url && <img src={item.image_url} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />}
                    {item.name}
                  </td>
                  <td className="p-5 font-bold text-blue-600">₱{Number(item.price).toFixed(2)}</td>
                  <td className="p-5 font-bold text-gray-700">{item.est_time || 10} mins</td>
                  <td className="p-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.is_available ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button onClick={() => handleToggle(item.id, item.is_available)} className={`text-sm font-extrabold px-4 py-2 rounded-lg transition-colors ${item.is_available ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {item.is_available ? 'Mark Out of Stock' : 'Mark Available'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}