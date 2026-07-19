import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import VendorDashboard from './pages/VendorDashboard';
import FarmerDashboard from './pages/FarmerDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container mt-4 pb-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders/:id" element={<OrderTracking />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          </Routes>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{ style: { fontFamily: 'Outfit, sans-serif', borderRadius: '12px' } }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
