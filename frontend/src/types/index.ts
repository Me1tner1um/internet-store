export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

export interface User {
  userId: string;
  username: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN' | string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  username: string;
  email: string;
  role: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TraceStep {
  service: 'Client' | 'API Gateway' | 'Auth Service' | 'Product Service' | 'Order Service' | 'Notification Service' | 'PostgreSQL';
  action: string;
  type: 'http' | 'feign' | 'kafka' | 'db';
  status: 'pending' | 'success' | 'error';
  latencyMs?: number;
}

export interface TraceEvent {
  id: string;
  timestamp: string;
  title: string;
  flowDescription: string;
  steps: TraceStep[];
  success: boolean;
}

