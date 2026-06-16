import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!message || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 text-red-400 hover:text-red-600 transition-colors focus:outline-none"
        aria-label="Dismiss error"
      >
        <X size={14} />
      </button>
    </div>
  );
}
