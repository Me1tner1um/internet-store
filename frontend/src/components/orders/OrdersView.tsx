import React, { useState, useEffect } from 'react';
import type { Order, OrderStatus } from '../../types';
import { orderApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { OrderStatusBadge } from '../ui/Badge';
import { INITIAL_ORDERS } from '../../services/mockData';
import { Package, Clock, XCircle, RefreshCw, ShoppingBag, Box } from 'lucide-react';

export const OrdersView: React.FC<{ onNavigateToShop: () => void }> = ({ onNavigateToShop }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { isAuthenticated, isBackendOnline, user } = useAuth();
  const { showToast } = useToast();

  const loadOrders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isBackendOnline) {
        const page = await orderApi.getMyOrders(0, 50);
        setOrders(page.content || []);
      } else {
        // Mock fallback
        setOrders(INITIAL_ORDERS);
      }
    } catch (err: any) {
      // If server unreachable, fallback to initial orders
      setOrders(INITIAL_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [isAuthenticated, isBackendOnline]);

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      if (isBackendOnline) {
        await orderApi.cancel(orderId);
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' as OrderStatus } : o))
      );
      showToast({
        type: 'info',
        title: 'Заказ отменён',
        message: `Заказ #${orderId.slice(0, 8)} переведён в статус CANCELLED.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Не удалось отменить заказ',
        message: err.message,
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <Package className="w-16 h-16 text-slate-400 mx-auto mb-4 stroke-1" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Авторизуйтесь для просмотра заказов</h2>
        <p className="text-xs text-slate-500 mt-2">
          Заказы привязаны к вашему UUID в базе данных <code>order-service</code>.
        </p>
      </div>
    );
  }

  const getTimelineStep = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      default: return 1;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Package className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>История моих заказов</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Пользователь: <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.username}</span> (ID: {user?.userId})
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Загрузка заказов из order-service (:8083)...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">У вас пока нет оформленных заказов</h3>
          <p className="text-xs text-slate-500 mt-1">Выберите товары в каталоге и оформите первый заказ.</p>
          <button
            onClick={onNavigateToShop}
            className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            В каталог товаров
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {orders.map((order) => {
            const step = getTimelineStep(order.status);
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          #{order.id.slice(0, 8)}...
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Сумма</div>
                      <div className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        ${order.total.toFixed(2)}
                      </div>
                    </div>

                    {order.status === 'PENDING' && (
                      <button
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancel(order.id)}
                        className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Отменить</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Timeline */}
                {!isCancelled ? (
                  <div className="py-5 px-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs relative">
                      {/* Connecting Line */}
                      <div className="absolute top-3.5 left-[12.5%] right-[12.5%] h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
                      <div
                        className="absolute top-3.5 left-[12.5%] h-0.5 bg-indigo-600 transition-all duration-500 -z-0"
                        style={{ width: `${Math.max(0, (step - 1) * 33.3)}%` }}
                      />

                      {/* Step 1: PENDING */}
                      <div className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            step >= 1
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          1
                        </div>
                        <span className="mt-2 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Принят
                        </span>
                      </div>

                      {/* Step 2: CONFIRMED */}
                      <div className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            step >= 2
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          2
                        </div>
                        <span className="mt-2 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Подтверждён
                        </span>
                      </div>

                      {/* Step 3: SHIPPED */}
                      <div className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            step >= 3
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          3
                        </div>
                        <span className="mt-2 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          В пути
                        </span>
                      </div>

                      {/* Step 4: DELIVERED */}
                      <div className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            step >= 4
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          4
                        </div>
                        <span className="mt-2 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Доставлен
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="my-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Заказ был отменён пользователем или системой.</span>
                  </div>
                )}

                {/* Items in this order */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
                    Состав заказа (Snapshot цен):
                  </div>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between text-xs py-1 text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.productName || `Товар (UUID: ${item.productId.slice(0, 8)}...)`}
                          </span>
                          <span className="text-slate-400 font-mono">× {item.quantity} шт</span>
                        </div>
                        <div className="font-mono font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400">1 позиция (snapshot сохранён в order_items)</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
