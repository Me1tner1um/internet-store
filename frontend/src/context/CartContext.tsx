import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, Order } from '../types';
import { orderApi } from '../services/api';
import { useAuth } from './AuthContext';
import { traceBus } from '../services/traceBus';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalCount: number;
  isCheckingOut: boolean;
  checkout: () => Promise<Order[]>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('shopping_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { isAuthenticated, isBackendOnline, user } = useAuth();

  useEffect(() => {
    localStorage.setItem('shopping_cart', JSON.stringify(items));
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, Math.max(1, product.stock)) }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const max = item.product.stock > 0 ? item.product.stock : 99;
          return { ...item, quantity: Math.min(quantity, max) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const checkout = async (): Promise<Order[]> => {
    if (items.length === 0) return [];
    if (!isAuthenticated) {
      throw new Error('Для оформления заказа необходимо войти в систему');
    }

    setIsCheckingOut(true);
    const createdOrders: Order[] = [];

    try {
      if (isBackendOnline) {
        // Backend order-service accepts 1 item per order request { productId, quantity }
        for (const item of items) {
          const order = await orderApi.create(item.product.id, item.quantity, item.product.name);
          createdOrders.push(order);
        }
      } else {
        // Fallback demo simulation
        await new Promise((res) => setTimeout(res, 600));
        for (const item of items) {
          if (item.quantity > item.product.stock) {
            throw new Error(`Товар ${item.product.name} закончился на складе (409 Conflict)`);
          }
          const simulatedOrder: Order = {
            id: crypto.randomUUID(),
            userId: user?.userId || 'demo-user',
            status: 'PENDING',
            total: item.product.price * item.quantity,
            items: [
              {
                id: crypto.randomUUID(),
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
              },
            ],
            createdAt: new Date().toISOString(),
          };
          createdOrders.push(simulatedOrder);

          traceBus.emit({
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString(),
            title: `[DEMO] POST /api/orders (${item.product.name})`,
            flowDescription: 'Demo Mode: API Gateway -> Order Service -> Feign -> Kafka event simulated',
            steps: [
              { service: 'API Gateway', action: 'JWT validation OK -> X-User-Id header injected', type: 'http', status: 'success' },
              { service: 'Order Service', action: 'OpenFeign stock check passed', type: 'feign', status: 'success' },
              { service: 'Order Service', action: 'Saved order with status PENDING', type: 'db', status: 'success' },
              { service: 'Order Service', action: 'Published OrderCreatedEvent to Kafka', type: 'kafka', status: 'success' },
              { service: 'Notification Service', action: 'Consumed event & logged email confirmation', type: 'kafka', status: 'success' },
            ],
            success: true,
          });
        }
      }

      clearCart();
      return createdOrders;
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalCount,
        isCheckingOut,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
