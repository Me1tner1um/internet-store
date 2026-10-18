import type { AuthResponse, Order, OrderStatus, PageResponse, Product } from '../types';
import { traceBus } from './traceBus';

const API_BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Token storage
export const getAccessToken = (): string | null => localStorage.getItem('access_token');
export const setAccessToken = (token: string) => localStorage.setItem('access_token', token);
export const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // response is text or empty
    }

    const message = errorData?.message || errorData?.error || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// --- Auth API ---
export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const start = Date.now();
    try {
      const res = await request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setAccessToken(res.accessToken);
      localStorage.setItem('refresh_token', res.refreshToken);
      localStorage.setItem('user_info', JSON.stringify({
        userId: res.userId,
        username: res.username,
        email: res.email,
        role: res.role,
      }));

      traceBus.emit({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        title: `POST /api/auth/login [${res.username}]`,
        flowDescription: 'Client -> API Gateway (8080) -> Auth Service (8081) -> postgres-auth',
        steps: [
          { service: 'Client', action: 'Submit credentials', type: 'http', status: 'success' },
          { service: 'API Gateway', action: 'Route /api/auth/login (public path)', type: 'http', status: 'success' },
          { service: 'Auth Service', action: 'Verify bcrypt password & issue JWT', type: 'db', status: 'success', latencyMs: Date.now() - start },
        ],
        success: true,
      });

      return res;
    } catch (err: any) {
      traceBus.emit({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        title: `POST /api/auth/login FAILED`,
        flowDescription: 'Client -> API Gateway -> Auth Service (Invalid credentials)',
        steps: [
          { service: 'Client', action: 'Submit credentials', type: 'http', status: 'error' },
          { service: 'Auth Service', action: err.message, type: 'http', status: 'error' },
        ],
        success: false,
      });
      throw err;
    }
  },

  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    setAccessToken(res.accessToken);
    localStorage.setItem('refresh_token', res.refreshToken);
    localStorage.setItem('user_info', JSON.stringify({
      userId: res.userId,
      username: res.username,
      email: res.email,
      role: res.role,
    }));
    return res;
  },

  logout: () => {
    removeTokens();
  },
};

// --- Products API ---
export const productApi = {
  getAll: async (params?: { category?: string; page?: number; size?: number }): Promise<PageResponse<Product>> => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') {
      query.append('category', params.category);
    }
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<PageResponse<Product>>(`/api/products${qs}`);
  },

  getById: async (id: string): Promise<Product> => {
    return request<Product>(`/api/products/${id}`);
  },

  create: async (data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const res = await request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    traceBus.emit({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      title: `POST /api/products [${data.name}]`,
      flowDescription: 'Client -> Gateway (JWT: ROLE_ADMIN) -> Product Service (8082) -> postgres-product',
      steps: [
        { service: 'Client', action: 'Create Product Request with Bearer JWT', type: 'http', status: 'success' },
        { service: 'API Gateway', action: 'Validate Admin Role & Forward X-User-Role', type: 'http', status: 'success' },
        { service: 'Product Service', action: 'Insert into postgres-product', type: 'db', status: 'success' },
      ],
      success: true,
    });

    return res;
  },

  update: async (id: string, data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    return request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await request<void>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// --- Orders API (Core Microservice Orchestration Flow) ---
export const orderApi = {
  create: async (productId: string, quantity: number, productName?: string): Promise<Order> => {
    const start = Date.now();
    try {
      const res = await request<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });

      const latency = Date.now() - start;
      traceBus.emit({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        title: `POST /api/orders [${productName || res.id.slice(0, 8)}]`,
        flowDescription: 'Orchestration: Gateway -> Order-Service -> Feign to Product-Service -> Kafka Event -> Notification-Service',
        steps: [
          { service: 'API Gateway', action: 'JWT validation -> injected headers X-User-Id, X-User-Email', type: 'http', status: 'success', latencyMs: 15 },
          { service: 'Order Service', action: 'Received request. Initiating OpenFeign stock check...', type: 'http', status: 'success', latencyMs: 20 },
          { service: 'Product Service', action: `[SYNC OpenFeign] GET /api/products/${productId.slice(0, 6)}... & Stock Reserved (-${quantity})`, type: 'feign', status: 'success', latencyMs: Math.max(20, Math.floor(latency * 0.4)) },
          { service: 'Order Service', action: `Saved Order & OrderItem (snapshot price) into postgres-order`, type: 'db', status: 'success', latencyMs: 25 },
          { service: 'Order Service', action: 'Emitted OrderCreatedEvent to Kafka topic "order-events"', type: 'kafka', status: 'success', latencyMs: 12 },
          { service: 'Notification Service', action: '@KafkaListener received event -> Sent confirmation email to user', type: 'kafka', status: 'success', latencyMs: 18 },
        ],
        success: true,
      });

      return res;
    } catch (err: any) {
      const isOutOfStock = err.status === 409 || err.message?.toLowerCase().includes('stock');

      traceBus.emit({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        title: `POST /api/orders [${isOutOfStock ? 'OUT_OF_STOCK (409)' : 'FAILED'}]`,
        flowDescription: isOutOfStock
          ? 'OpenFeign stock check returned insufficient inventory -> Threw OutOfStockException'
          : `Order creation failed: ${err.message}`,
        steps: [
          { service: 'API Gateway', action: 'JWT validated -> routed to Order Service', type: 'http', status: 'success' },
          { service: 'Order Service', action: 'OpenFeign stock check executed', type: 'feign', status: isOutOfStock ? 'error' : 'error' },
          { service: 'Product Service', action: isOutOfStock ? '409 Conflict: Requested > Available stock' : err.message, type: 'feign', status: 'error' },
        ],
        success: false,
      });

      throw err;
    }
  },

  getMyOrders: async (page = 0, size = 20): Promise<PageResponse<Order>> => {
    return request<PageResponse<Order>>(`/api/orders?page=${page}&size=${size}`);
  },

  getById: async (id: string): Promise<Order> => {
    return request<Order>(`/api/orders/${id}`);
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const res = await request<Order>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    traceBus.emit({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      title: `PATCH /api/orders/${id.slice(0, 8)}/status -> ${status}`,
      flowDescription: 'Admin status update -> Order Service -> postgres-order',
      steps: [
        { service: 'API Gateway', action: 'JWT validated (ROLE_ADMIN)', type: 'http', status: 'success' },
        { service: 'Order Service', action: `Updated status to ${status}`, type: 'db', status: 'success' },
      ],
      success: true,
    });

    return res;
  },

  cancel: async (id: string): Promise<Order> => {
    return request<Order>(`/api/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Healthcheck helper to ping Gateway
export const checkGatewayHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/api/products?page=0&size=1`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.status < 500;
  } catch {
    return false;
  }
};

