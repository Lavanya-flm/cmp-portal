import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppRouter } from './routes';

// ─── React Query client ───────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Re-fetch on window focus only in production
      refetchOnWindowFocus: import.meta.env.PROD,
      // Show stale data for 1 minute before background re-fetch
      staleTime: 60 * 1000,
      // Retry once on failure (not for 4xx errors — handled in services)
      retry: (failureCount, error) => {
        // Don't retry on client errors (4xx)
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
    },
    mutations: {
      // No automatic retry on mutations
      retry: false,
    },
  },
});

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Router provider — contains all page routes and auth guards */}
      <AppRouter />

      {/* React Query Devtools — only rendered in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
