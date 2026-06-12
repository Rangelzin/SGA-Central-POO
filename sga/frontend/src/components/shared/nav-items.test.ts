import { describe, expect, it } from "vitest";
import { navItemsFor } from "@/components/shared/nav-items";
import { hasPermission } from "@/lib/auth/rbac";

// Seção 10: a sidebar é derivada do mapa de permissões por perfil
describe("navItemsFor", () => {
  it("Admin vê os CRUDs mas não as telas self do aluno", () => {
    const labels = navItemsFor("ADMIN").map((item) => item.label);
    expect(labels).toContain("Alunos");
    expect(labels).toContain("Turmas");
    expect(labels).not.toContain("Matrícula");
  });

  it("Aluno vê suas telas mas não a gestão", () => {
    const labels = navItemsFor("STUDENT").map((item) => item.label);
    expect(labels).toContain("Matrícula");
    expect(labels).toContain("Histórico escolar");
    expect(labels).not.toContain("Alunos");
  });

  it("Professor vê suas turmas, não os CRUDs do admin", () => {
    const labels = navItemsFor("TEACHER").map((item) => item.label);
    expect(labels).toContain("Minhas turmas");
    expect(labels).not.toContain("Professores");
  });

  it("todos os perfis enxergam o Dashboard", () => {
    for (const role of ["ADMIN", "TEACHER", "STUDENT"] as const) {
      expect(navItemsFor(role).map((i) => i.label)).toContain("Dashboard");
    }
  });
});

describe("hasPermission", () => {
  it("respeita o mapa role → permissões", () => {
    expect(hasPermission("ADMIN", "students:manage")).toBe(true);
    expect(hasPermission("TEACHER", "students:manage")).toBe(false);
    expect(hasPermission("STUDENT", "grades:manage")).toBe(false);
  });

  it("nega quando não há role (não autenticado)", () => {
    expect(hasPermission(undefined, "dashboard:view")).toBe(false);
  });
});
