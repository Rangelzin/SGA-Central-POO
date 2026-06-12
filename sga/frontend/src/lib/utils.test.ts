import { describe, expect, it } from "vitest";
import {
  formatAttendance,
  formatCpf,
  formatGrade,
  getInitials,
  stripCpf,
} from "@/lib/utils";

describe("formatCpf", () => {
  it("aplica a máscara 000.000.000-00", () => {
    expect(formatCpf("12345678901")).toBe("123.456.789-01");
  });

  it("formata parcialmente enquanto o usuário digita", () => {
    expect(formatCpf("123456")).toBe("123.456");
  });

  it("ignora caracteres não numéricos e limita a 11 dígitos", () => {
    expect(formatCpf("123.456.789-0190")).toBe("123.456.789-01");
  });
});

describe("stripCpf", () => {
  it("remove tudo que não é dígito", () => {
    expect(stripCpf("123.456.789-01")).toBe("12345678901");
  });
});

describe("formatGrade", () => {
  it("formata com uma casa decimal e vírgula", () => {
    expect(formatGrade(7.5)).toBe("7,5");
  });

  it("mostra travessão quando não há nota", () => {
    expect(formatGrade(null)).toBe("—");
  });
});

describe("formatAttendance", () => {
  it("adiciona o símbolo de porcentagem", () => {
    expect(formatAttendance(87.5)).toBe("87,5%");
  });

  it("mostra travessão quando não há frequência", () => {
    expect(formatAttendance(null)).toBe("—");
  });
});

describe("getInitials", () => {
  it("usa a primeira e a última palavra do nome", () => {
    expect(getInitials("Bruno Ferreira Silva")).toBe("BS");
  });

  it("funciona com um único nome", () => {
    expect(getInitials("Ana")).toBe("A");
  });
});
