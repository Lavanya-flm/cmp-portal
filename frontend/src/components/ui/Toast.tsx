import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import type { Toast } from '../../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle size={16} className="text-green-500 shrink-0" />,
  error:   <XCircle    size={16} className="text-red-500 shrink-0" />,
  info:    <Info       size={16} className="text-blue-500 shrink-0" />,
};

const styles = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error:   'border-red-200 bg-red-50 text-red-800',
  info:    'border-blue-200 bg-blue-50 text-blue-800',
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            'flex items-start gap-3 rounded-xl border px-4 py-3',
            'shadow-lg shadow-black/5 animate-in slide-in-from-bottom-4',
            styles[toast.type],
          ].join(' ')}
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            type="button"
            onClick={() => onRemove(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
