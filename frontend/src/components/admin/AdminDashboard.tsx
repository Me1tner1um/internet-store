import React, { useState, useEffect } from 'react';
import type { Order, OrderStatus, Product } from '../../types';
import { productApi, orderApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { OrderStatusBadge, Badge } from '../ui/Badge';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../../services/mockData';
import { Shield, Plus, Edit2, Trash2, Package, RefreshCw, X } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Add / Edit Product modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Laptops');
  const [formPrice, setFormPrice] = useState('999.00');
  const [formStock, setFormStock] = useState('10');
  const [formDescription, setFormDescription] = useState('');

  const { isAdmin, isBackendOnline } = useAuth();
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      if (isBackendOnline) {
        const prodRes = await productApi.getAll({ size: 100 });
        setProducts(prodRes.content || []);
        // Note: in order-service, admin endpoint for all orders or user orders
        try {
          const ordRes = await orderApi.getMyOrders(0, 50);
          setOrders(ordRes.content || []);
        } catch {
          setOrders(INITIAL_ORDERS);
        }
      } else {
        setProducts(INITIAL_PRODUCTS);
        setOrders(INITIAL_ORDERS);
      }
    } catch {
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isBackendOnline]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Доступ ограничен (403 Forbidden)</h2>
        <p className="text-xs text-slate-500 mt-2">
          Данная панель доступна только пользователям с ролью <code>ROLE_ADMIN</code>. Войдите как администратор (кнопка в шапке).
        </p>
      </div>
    );
  }

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Laptops');
    setFormPrice('999.00');
    setFormStock('10');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price.toString());
    setFormStock(p.stock.toString());
    setFormDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      category: formCategory,
      price: parseFloat(formPrice) || 0,
      stock: parseInt(formStock, 10) || 0,
      description: formDescription,
    };

    try {
      if (editingProduct) {
        if (isBackendOnline) {
          const updated = await productApi.update(editingProduct.id, payload);
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
        } else {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
          );
        }
        showToast({
          type: 'success',
          title: 'Товар обновлён',
          message: `Изменения для «${payload.name}» успешно сохранены.`,
        });
      } else {
        if (isBackendOnline) {
          const created = await productApi.create(payload);
          setProducts((prev) => [created, ...prev]);
        } else {
          const mockCreated: Product = {
            id: crypto.randomUUID(),
            ...payload,
            createdAt: new Date().toISOString(),
          };
          setProducts((prev) => [mockCreated, ...prev]);
        }
        showToast({
          type: 'success',
          title: 'Товар добавлен',
          message: `Товар «${payload.name}» опубликован в product-service.`,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Ошибка сохранения товара',
        message: err.message,
      });
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Удалить товар «${name}»?`)) return;
    try {
      if (isBackendOnline) {
        await productApi.delete(id);
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast({
        type: 'info',
        title: 'Товар удалён',
        message: `Товар «${name}» удалён из базы данных.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Ошибка удаления',
        message: err.message,
      });
    }
  };

  const handleChangeOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      if (isBackendOnline) {
        await orderApi.updateStatus(orderId, newStatus);
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast({
        type: 'success',
        title: 'Статус заказа изменён',
        message: `Заказ #${orderId.slice(0, 8)} переведён в статус ${newStatus}.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Ошибка смены статуса',
        message: err.message,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Панель администратора
            </h1>
            <Badge variant="purple">ROLE_ADMIN</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Управление каталогом товаров (product-service) и смена статусов заказов (order-service).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-300 dark:border-slate-700"
            title="Обновить данные"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {activeTab === 'products' && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить товар</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 my-6 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Каталог товаров ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Управление заказами ({orders.length})</span>
        </button>
      </div>

      {/* Products Tab Content */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Товар</th>
                  <th className="py-3 px-4">Категория</th>
                  <th className="py-3 px-4">Цена</th>
                  <th className="py-3 px-4">Остаток (Stock)</th>
                  <th className="py-3 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{p.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="purple">{p.category}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {p.stock <= 0 ? (
                        <Badge variant="danger">0 шт</Badge>
                      ) : p.stock <= 3 ? (
                        <Badge variant="warning">{p.stock} шт (мало)</Badge>
                      ) : (
                        <Badge variant="success">{p.stock} шт</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">ID Заказа</th>
                  <th className="py-3 px-4">Дата</th>
                  <th className="py-3 px-4">Сумма</th>
                  <th className="py-3 px-4">Текущий статус</th>
                  <th className="py-3 px-4 text-right">Изменить статус (PATCH)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      #{o.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      ${o.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleChangeOrderStatus(o.id, e.target.value as OrderStatus)}
                        className="text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg py-1 px-2 font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Название товара
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="MacBook Pro, Клавиатура..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Категория
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Monitors">Monitors</option>
                    <option value="Audio">Audio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Цена ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Количество на складе (Stock)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Описание характеристик
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Процессор, память, матрица..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  {editingProduct ? 'Сохранить изменения' : 'Создать товар'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
