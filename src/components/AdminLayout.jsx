import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Kitchen Display', path: '/admin/orders', icon: '🍳' },
    { name: 'Manage Menu', path: '/admin/menu', icon: '🍔' },
    { name: 'Sales Reports', path: '/admin/reports', icon: '📈' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-20">
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <h1 className="text-2xl font-extrabold tracking-wider text-blue-400">QueueBite<span className="text-white">POS</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path; 
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span> {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl font-bold transition-all">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <header className="bg-white h-20 flex items-center px-8 shadow-sm justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-extrabold text-gray-800">{title}</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-500">Admin User</span>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-extrabold shadow-sm">A</div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}