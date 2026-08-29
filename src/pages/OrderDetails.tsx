import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { Order } from '../types';
import { format } from 'date-fns';
import { Printer, ArrowLeft, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order || (user?.role !== 'admin' && user?.id !== order.userId)) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
        <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or you don't have access.</p>
        <Link to="/orders" className="text-indigo-600 hover:underline">Return to Orders</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:py-0 print:px-0">
      
      {/* Controls - Hidden on Print */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link to="/orders" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Orders</span>
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
        >
          <Printer className="h-4 w-4" />
          <span>Print Invoice</span>
        </button>
      </div>

      {/* Invoice Document */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12 border-b border-gray-100 pb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg print:bg-gray-900">
                <ShieldCheck className="text-white h-6 w-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-gray-900">DigiStore</span>
            </div>
            <p className="text-gray-500 text-sm">Professional Digital Services</p>
            <p className="text-gray-500 text-sm">contact@digistore.test</p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium text-gray-700">Order ID:</span> {order.id.toUpperCase()}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium text-gray-700">Date:</span> {format(new Date(order.createdAt), 'MMMM d, yyyy')}
            </p>
            <div className="mt-4 inline-flex items-center space-x-1">
              {order.status === 'confirmed' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-bold text-green-600 uppercase tracking-wide">Paid & Confirmed</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-bold text-yellow-600 uppercase tracking-wide">Pending Confirmation</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Billed To</h3>
          <p className="text-lg font-bold text-gray-900">{order.userName}</p>
          <p className="text-gray-600">{order.userEmail}</p>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900 text-gray-900">
                <th className="py-3 text-sm font-bold uppercase">Description</th>
                <th className="py-3 text-sm font-bold uppercase text-center">Qty</th>
                <th className="py-3 text-sm font-bold uppercase text-right">Price</th>
                <th className="py-3 text-sm font-bold uppercase text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                  </td>
                  <td className="py-4 text-center font-medium text-gray-900">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-600">
                    ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 text-right font-bold text-gray-900">
                    ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
          <p>Thank you for doing business with DigiStore.</p>
          <p className="mt-1">If you have any questions, please contact support.</p>
        </div>

      </div>
    </div>
  );
}
