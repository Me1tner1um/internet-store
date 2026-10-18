import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, Mail, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isKafka = toast.type === 'kafka';
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              isKafka
                ? 'bg-purple-950/90 border-purple-500/50 text-purple-100 shadow-purple-500/10'
                : isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-500/10'
                : isError
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-500/10'
                : 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-black/40'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isKafka && <Mail className="w-5 h-5 text-purple-400 animate-pulse" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {!isKafka && !isSuccess && !isError && <Info className="w-5 h-5 text-sky-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
                {isKafka && (
                  <span className="text-[10px] font-mono uppercase bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded border border-purple-400/40">
                    Kafka Consumer
                  </span>
                )}
              </div>
              {toast.message && (
                <p className="text-xs mt-1 text-slate-300 break-words leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

