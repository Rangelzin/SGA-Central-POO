import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/shared/status-badge";

// Convenção visual de domínio (seção 6.5): status → rótulo em PT-BR
describe("StatusBadge", () => {
  it("rotula APPROVED como Aprovado", () => {
    render(<StatusBadge status="APPROVED" />);
    expect(screen.getByText("Aprovado")).toBeInTheDocument();
  });

  it("rotula FAILED como Reprovado", () => {
    render(<StatusBadge status="FAILED" />);
    expect(screen.getByText("Reprovado")).toBeInTheDocument();
  });

  it("rotula IN_PROGRESS como Em andamento", () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText("Em andamento")).toBeInTheDocument();
  });
});
