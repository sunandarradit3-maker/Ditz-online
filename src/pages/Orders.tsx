import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { Order } from '../types';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Orders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center p-6">
        <p className="text-gray-500 text-lg">Please log in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 max-w-3xl mx-auto">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">You haven't made any purchases yet.</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors font-medium"
          >
            <span>Start Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="border-b border-gray-100 bg-gray-50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium mb-1">Order Placed</p>
                    <p className="font-semibold text-gray-900">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium mb-1">Total</p>
                    <p className="font-semibold text-gray-900">
                      ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium mb-1">Order #</p>
                    <p className="font-mono text-gray-900">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </span>
                  <Link 
                    to={`/orders/${order.id}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-grow">
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
