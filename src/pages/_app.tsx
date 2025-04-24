import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/lib/useSupabaseAuth";
import "../global.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: any) {
  const { user, loading } = useSupabaseAuth();

  // If authentication is still loading, you can show a loading spinner or message
  if (loading) return <div>Loading...</div>;

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
