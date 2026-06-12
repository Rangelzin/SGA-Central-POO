"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { AppShell } from "@/components/shared/app-shell";
import { LoadingState } from "@/components/shared/loading-state";

/** Route guard do grupo autenticado (RNF-02). */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <LoadingState className="min-h-screen" />;
  }

  return <AppShell>{children}</AppShell>;
}
