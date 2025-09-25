import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import React from "react";
import { AuthProvider } from "./auth-context";

export { QueryClient } from "@tanstack/react-query";


export const queryClient = new QueryClient();

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;