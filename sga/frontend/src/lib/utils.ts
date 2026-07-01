import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata "12345678901" como "123.456.789-01". */
export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function stripCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/** Data ISO ("2026-03-01") → "01/03/2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

/** Nota 7.5 → "7,5"; null → "—". */
export function formatGrade(grade: number | null | undefined): string {
  if (grade === null || grade === undefined) return "—";
  return grade.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Frequência 87.5 → "87,5%"; null → "—". */
export function formatAttendance(attendance: number | null | undefined): string {
  if (attendance === null || attendance === undefined) return "—";
  return `${attendance.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export function getInitials(name: string | undefined | null): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Dispara o download de um arquivo de texto gerado no cliente (exports RF-06/RF-07). */
export function downloadTextFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
