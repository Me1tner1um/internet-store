import React, { useState, useEffect } from 'react';
import { traceBus } from '../../services/traceBus';
import type { TraceEvent } from '../../types';
import { Activity, ChevronDown, ChevronUp, Trash2, Cpu, CheckCircle2, XCircle } from 'lucide-react';

export const DevInspector: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<TraceEvent[]>(() => traceBus.getHistory());
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = traceBus.subscribe((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
      setExpandedEventId(newEvent.id);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 left-0 md:left-auto md:right-6 md:bottom-6 md:w-[680px] max-h-[85vh] bg-slate-950/95 text-slate-100 border border-slate-800 rounded-t-2xl md:rounded-2xl shadow-2xl backdrop-blur-xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
      {/* Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white tracking-wide">
                Microservices Architecture Trace
              </h3>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">Слепок межсервисных вызовов (Gateway → Feign → Kafka)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <button
              onClick={() => {
                traceBus.clear();
                setEvents([]);
              }}
              title="Очистить историю"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Скрыть
          </button>
        </div>
      </div>

      {/* Services Topology Bar */}
      <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-800 text-[11px] grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
        <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="text-slate-300 font-semibold">Gateway</div>
            <div className="text-[9px] text-slate-500">:8080</div>
          </div>
        </div>
        <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-sky-400" />
          <div>
            <div className="text-slate-300 font-semibold">Auth</div>
            <div className="text-[9px] text-slate-500">:8081 | :5432</div>
          </div>
        </div>
        <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <div>
            <div className="text-slate-300 font-semibold">Product</div>
            <div className="text-[9px] text-slate-500">:8082 | :5433</div>
          </div>
        </div>
        <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div>
            <div className="text-slate-300 font-semibold">Order</div>
            <div className="text-[9px] text-slate-500">:8083 | :5434</div>
          </div>
        </div>
        <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <div>
            <div className="text-slate-300 font-semibold">Kafka Notify</div>
            <div className="text-[9px] text-slate-500">:8084 | :9092</div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[50vh]">
        {events.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs flex flex-col items-center gap-2">
            <Cpu className="w-8 h-8 opacity-40 text-slate-400" />
            <p>Нет зарегистрированных событий.</p>
            <p className="text-[11px] text-slate-600">
              Попробуйте войти в аккаунт, добавить товар в админке или оформить заказ!
            </p>
          </div>
        ) : (
          events.map((event) => {
            const isExpanded = expandedEventId === event.id;

            return (
              <div
                key={event.id}
                className={`rounded-xl border transition-all ${
                  event.success
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    : 'bg-rose-950/20 border-rose-900/60 hover:border-rose-800'
                }`}
              >
                {/* Event Summary Row */}
                <div
                  onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                  className="p-3 cursor-pointer flex items-center justify-between gap-3 select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {event.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                          {event.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                          {event.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {event.flowDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {event.steps.length} шагов
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Steps Details */}
                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/50 space-y-2">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 pt-1">
                      Межсервисная трассировка:
                    </div>
                    <div className="relative pl-4 space-y-2.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                      {event.steps.map((step, idx) => {
                        const typeBadgeColor = {
                          http: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                          feign: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                          kafka: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                          db: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                        }[step.type];

                        return (
                          <div key={idx} className="relative flex items-start gap-2.5 text-xs">
                            <div
                              className={`w-3 h-3 rounded-full mt-0.5 -ml-[19px] border-2 border-slate-950 ${
                                step.status === 'success'
                                  ? 'bg-emerald-400'
                                  : step.status === 'error'
                                  ? 'bg-rose-500'
                                  : 'bg-amber-400 animate-pulse'
                              }`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-200">{step.service}</span>
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${typeBadgeColor}`}
                                >
                                  {step.type.toUpperCase()}
                                </span>
                                {step.latencyMs && (
                                  <span className="text-[10px] text-slate-500 font-mono ml-auto">
                                    ~{step.latencyMs}ms
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                {step.action}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
