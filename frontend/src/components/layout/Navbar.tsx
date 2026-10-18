import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Activity, Shield, LogOut, Sun, Moon, Cpu, Search, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeView: 'catalog' | 'orders' | 'admin';
  setActiveView: (view: 'catalog' | 'orders' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAuth: () => void;
  isDevOpen: boolean;
  setIsDevOpen: (open: boolean) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  isDevOpen,
  setIsDevOpen,
  isDark,
  setIsDark,
}) => {
  const { user, isAuthenticated, isAdmin, logout, loginAsDemoUser, loginAsDemoAdmin } = useAuth();
  const { totalCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveView('catalog')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                MICROSHOP
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Spring Cloud &bull; Kafka &bull; Feign
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveView('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'catalog'
                  ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Каталог
            </button>
            <button
              onClick={() => setActiveView('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'orders'
                  ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Заказы
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveView('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeView === 'admin'
                    ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                <span>Админка</span>
              </button>
            )}
          </nav>
        </div>

        {/* Center Search Input (Desktop) */}
        {activeView === 'catalog' && (
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию или категории..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Architecture Live Trace Button (Portfolio Feature!) */}
          <button
            onClick={() => setIsDevOpen(!isDevOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm ${
              isDevOpen
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-indigo-500'
            }`}
            title="Инспектор вызовов микросервисов"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline font-mono">Trace Live</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Сменить тему"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            className="relative p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Открыть корзину"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                {totalCount}
              </span>
            )}
          </button>

          {/* Auth State / Profile */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {user?.username}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {user?.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Выйти из аккаунта"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Войти
              </button>

              {/* Fast 1-click presets dropdown / buttons */}
              <button
                onClick={() => loginAsDemoUser()}
                title="Быстрый вход как Покупатель"
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Demo User</span>
              </button>
              <button
                onClick={() => loginAsDemoAdmin()}
                title="Быстрый вход как Администратор"
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Shield className="w-3 h-3 text-indigo-500" />
                <span>Demo Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
