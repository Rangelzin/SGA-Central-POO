"use client";

import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";

/** Layout autenticado: sidebar + header + conteúdo (RF-08/RF-09). */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-60">
        <Header />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
