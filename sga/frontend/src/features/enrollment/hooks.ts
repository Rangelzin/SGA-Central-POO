"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiMessage } from "@/lib/api/client";
import type { EnrollmentInput } from "@/types/api";
import type { Enrollment } from "@/types/domain";
import { classKeys } from "@/features/classes/hooks";
import { studentKeys } from "@/features/students/hooks";

/** RF-04: matricular — o backend valida vaga e duplicidade (409). */
export function useEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EnrollmentInput) =>
      api.post<Enrollment>("/enrollments", input).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toast.success("Matrícula realizada com sucesso.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useCancelEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/enrollments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toast.success("Matrícula cancelada.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}
