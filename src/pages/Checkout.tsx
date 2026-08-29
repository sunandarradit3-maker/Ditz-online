import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Checkout() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      alert('Please sign in to checkout');
      return;
    }

    setIsProcessing(true);
    try {
      const newOrder = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        items,
        totalAmount: total,
        status: 'pending',
        createdAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, 'orders'), newOrder);
      clearCart();
      navigate(`/orders/${docRef.id}`);
    } catch (error) {
      console.error('Error processing checkout:', error);
      alert('Failed to process order.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any services or products to your cart yet.</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors font-medium"
          >
            <span>Start Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-24 h-24 rounded-xl object-cover bg-gray-50" />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-1">{item.description}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-l-lg transition-colors"
                    >-</button>
                    <span className="px-3 py-1 font-medium text-gray-900 border-x border-gray-200 min-w-[2.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-r-lg transition-colors"
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="text-xl font-bold text-gray-900 sm:text-right">
                ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-900 text-white rounded-2xl p-6 md:p-8 sticky top-24 shadow-xl">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="border-t border-gray-700 pt-4 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {!user && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6 text-sm text-indigo-200">
                You need to sign in before you can complete this purchase.
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isProcessing || !user}
              className="w-full flex justify-center items-center py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Place Order (No API Gateway)'
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
