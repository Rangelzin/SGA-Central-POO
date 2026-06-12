"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { LoadingState } from "@/components/shared/loading-state";
import type { Role } from "@/types/domain";

/**
 * Guard de subárvore por perfil: quem não tem a role é levado de volta
 * ao próprio dashboard (seção 10 do plano).
 */
export function RoleLayout({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, hasRole, isLoading } = useAuth();
  const allowed = hasRole(...roles);

  useEffect(() => {
    if (!isLoading && user && !allowed) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, allowed, router]);

  if (!allowed) return <LoadingState />;
  return <>{children}</>;
}
