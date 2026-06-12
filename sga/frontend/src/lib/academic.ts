import {
  MIN_ATTENDANCE,
  PASSING_GRADE,
  type Assessment,
  type EnrollmentStatus,
} from "@/types/domain";

/**
 * Regra RF-05 espelhada na UI para feedback em tempo real.
 * A decisão final é sempre do backend.
 */
export function computeEnrollmentStatus(
  grade: number | null,
  attendance: number | null,
): EnrollmentStatus {
  if (grade === null && attendance === null) return "ENROLLED";
  if (grade === null || attendance === null) return "IN_PROGRESS";
  return grade >= PASSING_GRADE && attendance >= MIN_ATTENDANCE
    ? "APPROVED"
    : "FAILED";
}

/** Média ponderada das avaliações (calcularMedia), 1 casa decimal. */
export function weightedAverage(
  assessments: Pick<Assessment, "grade" | "weight">[],
): number | null {
  const totalWeight = assessments.reduce((sum, a) => sum + a.weight, 0);
  if (totalWeight === 0) return null;
  const sum = assessments.reduce((acc, a) => acc + a.grade * a.weight, 0);
  return Math.round((sum / totalWeight) * 10) / 10;
}
