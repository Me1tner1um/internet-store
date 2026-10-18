import { Cpu, Server, Database, GitBranch } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md py-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <span>Микросервисный магазин</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Учебный и портфолио проект с реализацией Database per Service, синхронным OpenFeign и асинхронной шиной событий Apache Kafka.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">
              Бизнес-сервисы
            </h4>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li className="flex items-center gap-1.5 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>api-gateway :8080 (Reactive)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>auth-service :8081 (JWT)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>product-service :8082 (Catalog)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>order-service :8083 (Saga/Feign)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>notification-service :8084 (Kafka)</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">
              Инфраструктура
            </h4>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li className="flex items-center gap-1.5 text-slate-400">
                <Database className="w-3.5 h-3.5 text-sky-400" />
                <span>3x PostgreSQL 15 (auth/prod/order)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span>Apache Kafka 3.x + Zookeeper</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                <span>Docker Compose Orchestration</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">
              Стек фронтенда
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                React 19
              </span>
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                TypeScript
              </span>
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                Tailwind CSS
              </span>
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                Vite
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pt-2">
              Архитектура адаптирована под портфолио с живой трассировкой событий.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Microservices Shop &bull; Java / Spring Cloud / Kafka</span>
          <span className="font-mono text-emerald-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready for Production &amp; Portfolio Interviews</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
