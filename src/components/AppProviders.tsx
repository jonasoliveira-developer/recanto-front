"use client";

import { SWRConfig } from "swr";
import { AuthProvider } from "@/context/AuthContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        dedupingInterval: 5000,
        shouldRetryOnError: false,
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </SWRConfig>
  );
}
