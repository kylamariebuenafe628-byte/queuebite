import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';

export default function Header() {
  const { cartCount } = useCart();

  return (
    <header className="bg-blue-700 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <Link to="/" className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
        🍔 QueueBite
      </Link>
      
      <div className="flex items-center gap-4">
        <Link to="/track" className="font-bold text-sm md:text-base hover:text-blue-200 transition-colors hidden sm:block">
          Track Order
        </Link>
        <Link 
          to="/cart" 
          className="bg-white text-blue-700 px-5 py-2 rounded-xl font-extrabold flex items-center gap-2 shadow-md hover:bg-gray-50 transition-transform active:scale-95"
        >
          <span>🛒</span> Cart ({cartCount})
        </Link>
      </div>
    </header>
  );
}