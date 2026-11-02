import { Routes, Route } from 'react-router-dom'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import TrackOrder from './pages/TrackOrder'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMenu from './pages/admin/AdminMenu'
import AdminOrders from './pages/admin/AdminOrders'
import AdminReports from './pages/admin/AdminReports'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/confirmation" element={<OrderConfirmation />} />
      <Route path="/track" element={<TrackOrder />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/menu" element={<ProtectedRoute><AdminMenu /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
    </Routes>
  )
}