import React, { useState, useEffect, useMemo } from 'react';
import type { Product } from '../../types';
import { productApi } from '../../services/api';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { INITIAL_PRODUCTS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { Filter, ArrowUpDown, RefreshCw, Cpu, CheckCircle2 } from 'lucide-react';

interface CatalogViewProps {
  searchQuery: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ searchQuery }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { isBackendOnline } = useAuth();

  const loadProducts = async () => {
    setLoading(true);
    try {
      if (isBackendOnline) {
        const res = await productApi.getAll({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          size: 50,
        });
        setProducts(res.content && res.content.length > 0 ? res.content : INITIAL_PRODUCTS);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
    } catch {
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, isBackendOnline]);

  const categories = ['All', 'Laptops', 'Accessories', 'Monitors', 'Audio'];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // In-stock filter
    if (onlyInStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, searchQuery, selectedCategory, onlyInStock, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero / Portfolio Banner */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-10 shadow-2xl border border-indigo-700/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>Microservices Architecture Demo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Каталог оборудования и компонентов
          </h1>
          <p className="text-sm text-indigo-200/90 leading-relaxed">
            Витрина интернет-магазина, работающая поверх 4 независимых бизнес-сервисов и API Gateway с валидацией JWT, синхронным OpenFeign и шиной Apache Kafka.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Database per Service</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>OpenFeign Stock Sync</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kafka Event-Driven</span>
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'All' ? 'Все товары' : cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters */}
        <div className="flex items-center gap-3 self-end md:self-auto text-xs">
          {/* Only in stock toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>Только в наличии</span>
          </label>

          {/* Sort Select */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-xs focus:outline-none cursor-pointer"
            >
              <option value="default">По умолчанию</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
            </select>
          </div>

          {/* Reload button */}
          <button
            onClick={loadProducts}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Обновить каталог"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Запрос к product-service (:8082)...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
          <Filter className="w-10 h-10 stroke-1 opacity-40 mb-1" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Товары не найдены</h3>
          <p className="text-xs text-slate-500">Попробуйте изменить поисковый запрос или фильтры.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
