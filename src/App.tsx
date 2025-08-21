import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { Toaster } from "sonner";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppWrapper() {
  return (
    // <QueryClientProvider client={queryClient}>
    //   <Layout />
    // </QueryClientProvider>
    <QueryClientProvider client={queryClient}>
      <Layout />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

export default AppWrapper;
