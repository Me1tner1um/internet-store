import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  onOpenAuth: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenAuth }) => {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, clearCart, totalAmount, totalCount, isCheckingOut, checkout } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      showToast({
        type: 'info',
        title: 'Требуется авторизация',
        message: 'Войдите в систему или выберите демо-аккаунт для оформления заказа.',
      });
      onOpenAuth();
      return;
    }

    try {
      const orders = await checkout();
      showToast({
        type: 'success',
        title: 'Заказ успешно создан!',
        message: `Создано заказов: ${orders.length}. Межсервисный вызов Feign и событие Kafka выполнены.`,
      });

      // Also trigger a notification-service consumer simulation toast
      showToast({
        type: 'kafka',
        title: 'Notification Service',
        message: `Kafka Consumer получил событие OrderCreatedEvent. Email подтверждения отправлен на ${user?.email || 'клиенту'}.`,
        duration: 6000,
      });

      closeCart();
    } catch (err: any) {
      const isOutOfStock = err.status === 409 || err.message?.toLowerCase().includes('складе') || err.message?.includes('409');
      showToast({
        type: 'error',
        title: isOutOfStock ? '409 Conflict — Недостаточно на складе' : 'Ошибка оформления заказа',
        message: err.message,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Корзина товаров</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {totalCount} {totalCount === 1 ? 'позиция' : 'позиций'}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-3 opacity-30" />
                <p className="text-sm font-medium">Ваша корзина пуста</p>
                <p className="text-xs text-slate-400 mt-1">Добавьте товары из каталога, чтобы сделать заказ</p>
                <button
                  onClick={closeCart}
                  className="mt-5 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Перейти в каталог
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3"
                >
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center flex-shrink-0 text-xl font-bold text-slate-300">
                    {product.category === 'Laptops' ? '💻' : product.category === 'Monitors' ? '🖥️' : product.category === 'Audio' ? '🎧' : '⌨️'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {product.name}
                    </h4>
                    <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Остаток на складе: {product.stock} шт
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 min-w-[28px] text-center">
                          {quantity}
                        </span>
                        <button
                          disabled={quantity >= product.stock}
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
                  <span>Позиций в заказе</span>
                  <span>{totalCount} шт</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-1">
                  <span>Итого к оплате</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-900/60 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Резерв остатка через OpenFeign + публикация события в Kafka топик</span>
              </div>

              <button
                disabled={isCheckingOut}
                onClick={handleCheckout}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <span>Межсервисная оркестрация...</span>
                ) : (
                  <>
                    <span>Оформить заказ</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Очистить корзину
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
