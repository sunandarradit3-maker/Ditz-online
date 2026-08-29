import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';
import { auth, googleProvider, signInWithPopup, signOut } from './lib/firebase';
import { ShoppingCart, LogIn, LogOut, Package, ShieldCheck, User as UserIcon } from 'lucide-react';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';

function Navbar() {
  const { user, setUser, checkUserRole } = useAuthStore();
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await checkUserRole(result.user.uid, result.user.email || '', result.user.displayName || '');
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheck className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">DigiStore</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/checkout" className="relative group">
              <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
              </div>
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                  My Orders
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    title="Log out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const { setUser, checkUserRole, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        await checkUserRole(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || '');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, checkUserRole, setLoading]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
