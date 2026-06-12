import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStudents } from "@/features/students/hooks";
import { TOKEN_STORAGE_KEY } from "@/lib/api/client";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// Valida a camada de dados ponta a ponta: hook → axios → interceptor → MSW
describe("useStudents", () => {
  beforeEach(() => {
    // interceptor de request injeta o Bearer a partir do localStorage
    window.localStorage.setItem(TOKEN_STORAGE_KEY, "mock-token-admin-1");
  });

  it("busca a página de alunos do mock e devolve o envelope paginado", async () => {
    const { result } = renderHook(() => useStudents({ page: 0, size: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const page = result.current.data!;
    expect(page.totalElements).toBe(15); // seed tem 15 alunos
    expect(page.content).toHaveLength(10);
    expect(page.totalPages).toBe(2);
    expect(page.content[0]).toHaveProperty("enrollmentCode");
  });

  it("aplica a busca por nome via parâmetro search", async () => {
    const { result } = renderHook(
      () => useStudents({ page: 0, size: 10, search: "Bruno" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const page = result.current.data!;
    expect(page.totalElements).toBeGreaterThanOrEqual(1);
    expect(
      page.content.every((student) =>
        student.name.toLowerCase().includes("bruno"),
      ),
    ).toBe(true);
  });
});
