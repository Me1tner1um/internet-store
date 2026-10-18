import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, Lock, User, Mail, Shield, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register, loginAsDemoUser, loginAsDemoAdmin } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginMode) {
        await login(username, password);
        showToast({
          type: 'success',
          title: 'Успешный вход',
          message: `Добро пожаловать, ${username}!`,
        });
      } else {
        await register(username, email, password);
        showToast({
          type: 'success',
          title: 'Регистрация успешна',
          message: `Аккаунт ${username} создан. Добро пожаловать!`,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при аутентификации');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'user' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      if (role === 'admin') {
        await loginAsDemoAdmin();
        showToast({
          type: 'success',
          title: 'Вход выполнен: Администратор',
          message: 'Доступны права ROLE_ADMIN (создание товаров, смена статусов заказов)',
        });
      } else {
        await loginAsDemoUser();
        showToast({
          type: 'success',
          title: 'Вход выполнен: Покупатель',
          message: 'Аккаунт testuser (ROLE_USER)',
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {isLoginMode ? 'Вход в аккаунт' : 'Регистрация нового пользователя'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            JWT-аутентификация через <code>auth-service:8081</code>
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Демо-аккаунты в 1 клик для рекрутера:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('user')}
              className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-lg text-slate-800 dark:text-slate-200 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-sky-500" />
              <span>Покупатель (User)</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('admin')}
              className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-lg text-slate-800 dark:text-slate-200 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Админ (Admin)</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Имя пользователя (username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="например: ivan или testuser"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {!isLoginMode && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ivan@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Пароль
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-sm rounded-lg transition-colors shadow-sm mt-2"
          >
            {loading ? 'Обработка запроса...' : isLoginMode ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          {isLoginMode ? (
            <span>
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => setIsLoginMode(false)}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Зарегистрироваться
              </button>
            </span>
          ) : (
            <span>
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => setIsLoginMode(true)}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Войти
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

