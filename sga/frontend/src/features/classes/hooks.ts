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
      api.get<Page<Class>>("/classes", { params: query }).then((r) => r.data),
  });
}

export function useClass(id: string | undefined) {
  return useQuery({
    queryKey: classKeys.detail(id ?? ""),
    queryFn: () => api.get<Class>(`/classes/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useClassEnrollments(id: string | undefined) {
  return useQuery({
    queryKey: classKeys.enrollments(id ?? ""),
    queryFn: () =>
      api.get<Enrollment[]>(`/classes/${id}/enrollments`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

// RF-07: relatório de desempenho da turma
export function useClassReport(id: string | undefined) {
  return useQuery({
    queryKey: classKeys.report(id ?? ""),
    queryFn: () => api.get<ClassReport>(`/classes/${id}/report`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClassInput) =>
      api.post<Class>("/classes", input).then((r) => r.data),
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
      api.put<Class>(`/classes/${id}`, input).then((r) => r.data),
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
    mutationFn: (id: string) => api.delete(`/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Turma removida.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}
