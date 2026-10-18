import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CatalogView } from './components/catalog/CatalogView';
import { OrdersView } from './components/orders/OrdersView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { DevInspector } from './components/dev/DevInspector';
import { ToastContainer } from './components/ui/ToastContainer';
import { checkGatewayHealth } from './services/api';
import { WifiOff } from 'lucide-react';

const MainContent: React.FC = () => {
  const [activeView, setActiveView] = useState<'catalog' | 'orders' | 'admin'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDevOpen, setIsDevOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const { isBackendOnline, setIsBackendOnline } = useAuth();

  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Initial gateway health check
  useEffect(() => {
    const testHealth = async () => {
      const online = await checkGatewayHealth();
      setIsBackendOnline(online);
    };
    testHealth();
  }, [setIsBackendOnline]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Backend connection banner if running in offline demo mode */}
      {!isBackendOnline && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-800 dark:text-amber-300 py-1.5 px-4 text-xs flex items-center justify-center gap-2 font-mono">
          <WifiOff className="w-3.5 h-3.5 text-amber-500" />
          <span>
            API Gateway (:8080) не обнаружен. Включен <strong>автономный офлайн демо-режим</strong> (тестовые данные + симуляция Kafka/Feign).
          </span>
          <button
            onClick={async () => {
              const online = await checkGatewayHealth();
              setIsBackendOnline(online);
            }}
            className="underline hover:text-amber-400 ml-1"
          >
            Проверить снова
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAuth={() => setIsAuthOpen(true)}
        isDevOpen={isDevOpen}
        setIsDevOpen={setIsDevOpen}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* View router */}
      <main className="flex-1">
        {activeView === 'catalog' && <CatalogView searchQuery={searchQuery} />}
        {activeView === 'orders' && <OrdersView onNavigateToShop={() => setActiveView('catalog')} />}
        {activeView === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartDrawer onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Auth Modal (Login / Register) */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Architecture Trace Drawer (Live Kafka / Feign / Gateway logs) */}
      <DevInspector isOpen={isDevOpen} onClose={() => setIsDevOpen(false)} />

      {/* Floating Modern Toasts (Sonner style + Kafka notifications) */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <MainContent />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
