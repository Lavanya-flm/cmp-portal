import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF9F1]">
      <div className="flex flex-col items-center gap-4">
        {/* Logo mark */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-200">
          <svg
            viewBox="0 0 24 24"
            fill="white"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
          </svg>
        </div>

        <Loader2
          className="animate-spin text-amber-500"
          size={28}
          strokeWidth={2.5}
        />

        <p className="text-sm font-medium text-gray-500">{message}</p>
      </div>
    </div>
  );
}
