export type Role = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  createdAt: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: number;
}
