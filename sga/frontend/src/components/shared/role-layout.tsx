"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/use-auth";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
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
  const { user, hasRole, isLoading } = useAuth();
  const allowed = hasRole(...roles);

  if (isLoading) return <LoadingState />;

  if (user && !allowed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Acesso negado</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Seu perfil nao tem permissao para acessar esta area administrativa.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">Voltar ao dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!allowed) return <LoadingState />;

  return <>{children}</>;
}
