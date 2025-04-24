import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/lib/useSupabaseAuth";
import "../global.css";
import { AppProps } from "next/app";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const { loading } = useSupabaseAuth();
  if (loading) return <div>Loading...</div>;

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
