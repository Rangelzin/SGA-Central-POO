import { describe, expect, it } from "vitest";

const BASE = "http://localhost/api";
const ADMIN_TOKEN = "mock-token-admin-1";

function enroll(body: unknown, token: string | null = ADMIN_TOKEN) {
  return fetch(`${BASE}/enrollments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

// RF-04 — regras de matrícula (espelham a seção 8/9 do plano)
describe("POST /enrollments", () => {
  it("retorna 401 sem autenticação", async () => {
    const response = await enroll({ studentId: "student-3", classId: "class-4" }, null);
    expect(response.status).toBe(401);
  });

  it("retorna 409 quando a turma está sem vagas", async () => {
    // class-1 tem capacidade 5 e 5 matrículas ativas no seed
    const response = await enroll({ studentId: "student-6", classId: "class-1" });
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.message).toMatch(/sem vagas/i);
  });

  it("retorna 409 quando o aluno já está na mesma disciplina no período", async () => {
    // student-6 já está em class-2 (CC101, 2026.1) no seed
    const response = await enroll({ studentId: "student-6", classId: "class-2" });
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.message).toMatch(/já matriculado/i);
  });

  it("matricula com sucesso quando há vaga e não há duplicidade", async () => {
    // student-3 não cursa Cálculo (subject-5); class-4 tem vagas
    const response = await enroll({ studentId: "student-3", classId: "class-4" });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.status).toBe("ENROLLED");
    expect(body.student.uuid).toBe("student-3");
    expect(body.class.uuid).toBe("class-4");
  });
});
