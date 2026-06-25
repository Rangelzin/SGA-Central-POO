"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiMessage } from "@/lib/api/client";
import type { AssessmentInput } from "@/types/api";
import type { Enrollment } from "@/types/domain";
import { classKeys } from "@/features/classes/hooks";

/**
 * RF-05: mutations de notas/frequência/avaliações. Todas invalidam a
 * turma (lista de matrículas + relatório) para o status recalcular.
 */
function useInvalidateClass(classId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: classKeys.enrollments(classId) });
    queryClient.invalidateQueries({ queryKey: classKeys.report(classId) });
  };
}

export function useSetGrade(classId: string) {
  const invalidate = useInvalidateClass(classId);
  return useMutation({
    mutationFn: ({ enrollmentId, grade }: { enrollmentId: string; grade: number }) =>
      api
        .put<Enrollment>(`/matriculados/${enrollmentId}/nota`, { nota: grade })
        .then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success("Nota salva.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useSetAttendance(classId: string) {
  const invalidate = useInvalidateClass(classId);
  return useMutation({
    mutationFn: ({
      enrollmentId,
      attendance,
    }: {
      enrollmentId: string;
      attendance: number;
    }) =>
      api
        .put<Enrollment>(`/matriculados/${enrollmentId}/frequencia`, { frequencia: attendance })
        .then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success("Frequência salva.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useAddAssessment(classId: string) {
  const invalidate = useInvalidateClass(classId);
  return useMutation({
    mutationFn: ({
      enrollmentId,
      input,
    }: {
      enrollmentId: string;
      input: AssessmentInput;
    }) =>
      api
        .post<Enrollment>(`/avaliacoes/matriculado/${enrollmentId}`, input)
        .then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success("Avaliação adicionada.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useUpdateAssessment(classId: string) {
  const invalidate = useInvalidateClass(classId);
  return useMutation({
    mutationFn: ({
      enrollmentId,
      assessmentId,
      input,
    }: {
      enrollmentId: string;
      assessmentId: string;
      input: AssessmentInput;
    }) =>
      api
        .put<Enrollment>(`/avaliacoes/${assessmentId}`, input)
        .then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success("Avaliação atualizada.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useDeleteAssessment(classId: string) {
  const invalidate = useInvalidateClass(classId);
  return useMutation({
    mutationFn: ({
      enrollmentId,
      assessmentId,
    }: {
      enrollmentId: string;
      assessmentId: string;
    }) =>
      api
        .delete(`/avaliacoes/${assessmentId}`)
        .then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success("Avaliação removida.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}
