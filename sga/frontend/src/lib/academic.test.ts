import { describe, expect, it } from "vitest";
import { computeEnrollmentStatus, weightedAverage } from "@/lib/academic";

// RF-05: situação = APROVADO se média >= 6.0 E frequência >= 75%
describe("computeEnrollmentStatus", () => {
  it("retorna ENROLLED quando ainda não há nota nem frequência", () => {
    expect(computeEnrollmentStatus(null, null)).toBe("ENROLLED");
  });

  it("retorna IN_PROGRESS quando só um dos dois foi lançado", () => {
    expect(computeEnrollmentStatus(8, null)).toBe("IN_PROGRESS");
    expect(computeEnrollmentStatus(null, 90)).toBe("IN_PROGRESS");
  });

  it("aprova exatamente no limite (6.0 e 75%)", () => {
    expect(computeEnrollmentStatus(6.0, 75)).toBe("APPROVED");
  });

  it("reprova por nota abaixo de 6.0", () => {
    expect(computeEnrollmentStatus(5.9, 100)).toBe("FAILED");
  });

  it("reprova por frequência abaixo de 75%", () => {
    expect(computeEnrollmentStatus(10, 74)).toBe("FAILED");
  });

  it("aprova com nota e frequência altas", () => {
    expect(computeEnrollmentStatus(8.5, 92)).toBe("APPROVED");
  });
});

describe("weightedAverage", () => {
  it("retorna null quando não há avaliações", () => {
    expect(weightedAverage([])).toBeNull();
  });

  it("calcula a média ponderada pelos pesos", () => {
    // (8*4 + 9*6) / 10 = 8.6
    expect(
      weightedAverage([
        { grade: 8, weight: 4 },
        { grade: 9, weight: 6 },
      ]),
    ).toBe(8.6);
  });

  it("arredonda para uma casa decimal", () => {
    // (7*1 + 8*1) / 2 = 7.5
    expect(
      weightedAverage([
        { grade: 7, weight: 1 },
        { grade: 8, weight: 1 },
      ]),
    ).toBe(7.5);
  });

  it("respeita pesos diferentes (prova vale mais que trabalho)", () => {
    // (10*7 + 5*3) / 10 = 8.5
    expect(
      weightedAverage([
        { grade: 10, weight: 7 },
        { grade: 5, weight: 3 },
      ]),
    ).toBe(8.5);
  });
});
