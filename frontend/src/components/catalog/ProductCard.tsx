import React from 'react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Badge } from '../ui/Badge';
import { ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const categoryEmoji = {
    Laptops: '💻',
    Monitors: '🖥️',
    Audio: '🎧',
    Accessories: '⌨️',
  }[product.category] || '📦';

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 flex flex-col">
      {/* Top Graphic Header */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-indigo-50/50 dark:from-slate-800/60 dark:to-slate-900 flex items-center justify-center overflow-hidden">
        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="purple">{product.category || 'Tech'}</Badge>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <Badge variant="danger">Нет в наличии (0)</Badge>
          ) : isLowStock ? (
            <Badge variant="warning" className="animate-pulse">
              Осталось: {product.stock} шт!
            </Badge>
          ) : (
            <Badge variant="success">В наличии: {product.stock} шт</Badge>
          )}
        </div>

        {/* Product Visual Icon / Art */}
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md select-none">
          {categoryEmoji}
        </div>

        {/* Hover Quick View Trigger */}
        <button
          onClick={() => onSelect(product)}
          className="absolute inset-0 bg-black/30 dark:bg-black/50 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold"
        >
          <Eye className="w-4 h-4" />
          <span>Быстрый просмотр</span>
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h3
          onClick={() => onSelect(product)}
          className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
        >
          {product.name}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed flex-1">
          {product.description || 'Описание характеристик устройства.'}
        </p>

        {/* Price & Action */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Цена</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              ${product.price.toFixed(2)}
            </div>
          </div>

          <button
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40'
            }`}
          >
            {isOutOfStock ? (
              <span>Закончился</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>В корзину</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
