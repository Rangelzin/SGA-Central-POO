"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { homeRouteFor } from "@/lib/auth/rbac";
import { LoadingState } from "@/components/shared/loading-state";

export default function RootPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user) {
      router.replace(homeRouteFor(user.role));
    } else {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <LoadingState className="min-h-screen" />;
}
