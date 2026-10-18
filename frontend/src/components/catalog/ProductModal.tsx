import React, { useState } from 'react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Badge } from '../ui/Badge';
import { X, ShoppingBag, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const maxQty = Math.max(1, product.stock);

  const handleAdd = () => {
    addToCart(product, quantity);
    onClose();
  };

  const categoryEmoji = {
    Laptops: '💻',
    Monitors: '🖥️',
    Audio: '🎧',
    Accessories: '⌨️',
  }[product.category] || '📦';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left Art Area */}
          <div className="h-64 bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-950 rounded-2xl flex flex-col items-center justify-center relative p-6 border border-slate-200/50 dark:border-slate-800">
            <span className="text-8xl drop-shadow-md select-none">{categoryEmoji}</span>
            <div className="mt-4 flex gap-2">
              <Badge variant="purple">{product.category}</Badge>
              {isOutOfStock ? (
                <Badge variant="danger">0 шт (Out of Stock)</Badge>
              ) : (
                <Badge variant="success">В наличии: {product.stock} шт</Badge>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-3">
              ID: {product.id.slice(0, 8)}...
            </div>
          </div>

          {/* Right Specs Area */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h2>

            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-2">
              ${product.price.toFixed(2)}
            </div>

            <div className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
              {product.description || 'Высокотехнологичный продукт с официальной гарантией и мгновенным подтверждением через API Gateway.'}
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Быстрая доставка</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Database Snapshot</span>
              </div>
            </div>

            {/* Quantity Selector & Action */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
              {!isOutOfStock && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Количество:</span>
                  <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-semibold font-mono text-slate-800 dark:text-slate-200">
                      {quantity}
                    </span>
                    <button
                      disabled={quantity >= maxQty}
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <button
                disabled={isOutOfStock}
                onClick={handleAdd}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Товар распродан' : `В корзину • $${(product.price * quantity).toFixed(2)}`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
