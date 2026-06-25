"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiMessage } from "@/lib/api/client";
import type { ClassInput, ClassQuery, ClassReport, Page } from "@/types/api";
import type { Class, Enrollment } from "@/types/domain";

export const classKeys = {
  all: ["classes"] as const,
  list: (query: ClassQuery) => [...classKeys.all, "list", query] as const,
  detail: (id: string) => [...classKeys.all, "detail", id] as const,
  enrollments: (id: string) => [...classKeys.all, "enrollments", id] as const,
  report: (id: string) => [...classKeys.all, "report", id] as const,
};

export function useClasses(query: ClassQuery) {
  return useQuery({
    queryKey: classKeys.list(query),
    queryFn: () =>
      api.get<Page<Class>>("/turmas", { params: query }).then((r) => r.data),
  });
}

export function useClass(id: string | undefined) {
  return useQuery({
    queryKey: classKeys.detail(id ?? ""),
    queryFn: () => api.get<Class>(`/turmas/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useClassEnrollments(id: string | undefined) {
  return useQuery({
    queryKey: classKeys.enrollments(id ?? ""),
    queryFn: () =>
      api.get<Enrollment[]>(`/turmas/${id}/alunos`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useClassReport(id: string | undefined) {
  return useQuery({
    queryKey: classKeys.report(id ?? ""),
    queryFn: () => api.get<ClassReport>(`/turmas/${id}/relatorio`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClassInput) =>
      api.post<Class>("/turmas", input).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Turma criada com sucesso.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useUpdateClass(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClassInput) =>
      api.put<Class>(`/turmas/${id}`, input).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Turma atualizada com sucesso.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/turmas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Turma removida.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}
