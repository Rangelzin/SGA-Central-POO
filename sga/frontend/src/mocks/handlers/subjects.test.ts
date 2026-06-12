import { describe, expect, it } from "vitest";

const BASE = "http://localhost/api";
const ADMIN_TOKEN = "mock-token-admin-1";

function authed(path: string, init: RequestInit = {}) {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      ...(init.headers ?? {}),
    },
  });
}

// RF-03 — disciplina só ativa com professor responsável
describe("POST /subjects/:id/activate", () => {
  it("retorna 400 ao ativar disciplina sem professor responsável", async () => {
    // subject-8 (IA) nasce sem professor e inativa no seed
    const response = await authed("/subjects/subject-8/activate", { method: "POST" });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toMatch(/professor responsável/i);
  });

  it("ativa a disciplina quando há professor responsável", async () => {
    const created = await authed("/subjects", {
      method: "POST",
      body: JSON.stringify({
        code: "TST101",
        name: "Disciplina de Teste",
        syllabus: "Ementa de teste para validação.",
        workload: 60,
        type: "ELECTIVE",
        responsibleTeacherId: "teacher-1",
      }),
    });
    expect(created.status).toBe(201);
    const subject = await created.json();
    expect(subject.active).toBe(false); // nasce inativa

    const activated = await authed(`/subjects/${subject.uuid}/activate`, {
      method: "POST",
    });
    expect(activated.status).toBe(200);
    const result = await activated.json();
    expect(result.active).toBe(true);
  });

  it("rejeita código de disciplina duplicado com 400", async () => {
    const response = await authed("/subjects", {
      method: "POST",
      body: JSON.stringify({
        code: "CC101", // já existe no seed
        name: "Conflito",
        syllabus: "Ementa qualquer para o teste.",
        workload: 60,
        type: "MANDATORY",
      }),
    });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errors?.[0]?.field).toBe("code");
  });
});
