// Toast container component
import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastLevel = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  level: ToastLevel;
}

// Module-level toast state
const subscribers: Array<(toasts: Toast[]) => void> = [];
let _toasts: Toast[] = [];
let _id = 0;

export function showToast(message: string, level: ToastLevel = 'info', duration = 3500) {
  const id = `t-${++_id}`;
  _toasts = [..._toasts, { id, message, level }];
  subscribers.forEach((s) => s(_toasts));
  setTimeout(() => {
    _toasts = _toasts.filter((t) => t.id !== id);
    subscribers.forEach((s) => s(_toasts));
  }, duration);
}

const ICONS: Record<ToastLevel, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    subscribers.push(setToasts);
    return () => {
      const i = subscribers.indexOf(setToasts);
      if (i >= 0) subscribers.splice(i, 1);
    };
  }, []);

  function dismiss(id: string) {
    _toasts = _toasts.filter((t) => t.id !== id);
    subscribers.forEach((s) => s(_toasts));
  }

  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.level];
        return (
          <div key={toast.id} className={`toast ${toast.level}`} role="status">
            <Icon size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              className="btn btn-ghost btn-icon sm"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
