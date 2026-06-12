"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { makeQueryClient } from "@/lib/api/query-client";
import { AuthProvider } from "@/lib/auth/auth-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const mocksEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true";

/**
 * Sobe o service worker do MSW antes de liberar a árvore — evita
 * que as primeiras queries escapem do mock. Import dinâmico para o
 * worker não entrar no bundle quando os mocks estão desligados.
 */
function useMockWorker(): boolean {
  const [ready, setReady] = useState(!mocksEnabled);

  useEffect(() => {
    if (!mocksEnabled) return;
    let cancelled = false;
    import("@/mocks/browser")
      .then(({ worker }) =>
        worker.start({ onUnhandledRequest: "bypass" }),
      )
      .then(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const mocksReady = useMockWorker();

  if (!mocksReady) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
