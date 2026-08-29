import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, Layout, Code, Shield, Palette, Wrench } from 'lucide-react';
import { motion } from 'motion/react';

const CATEGORIES = [
  { id: 'all', name: 'All Services', icon: Layout },
  { id: 'web', name: 'Web Dev', icon: Code },
  { id: 'design', name: 'UI/UX Design', icon: Palette },
  { id: 'security', name: 'Cyber Security', icon: Shield },
  { id: 'tools', name: 'Tools', icon: Wrench },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4"
        >
          Elevate Your Digital Presence
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-600 mb-8"
        >
          Premium digital products, web development services, cybersecurity audits, and UI/UX design crafted for modern businesses.
        </motion.p>
      </div>

      {/* Category Filter */}
      <div className="flex overflow-x-auto pb-4 mb-10 hide-scrollbar space-x-2 sm:justify-center">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                isSelected 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Layout className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500">Check back later for new offerings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={product.id} 
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Layout className="h-12 w-12 opacity-50" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  {CATEGORIES.find(c => c.id === product.category)?.name || product.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{product.title}</h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-grow">{product.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => addItem(product)}
                    className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl transition-colors font-medium"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
