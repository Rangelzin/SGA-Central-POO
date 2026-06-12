"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiMessage } from "@/lib/api/client";
import type { ListQuery, Page, SubjectInput } from "@/types/api";
import type { Subject } from "@/types/domain";

export const subjectKeys = {
  all: ["subjects"] as const,
  list: (query: ListQuery) => [...subjectKeys.all, "list", query] as const,
  detail: (id: string) => [...subjectKeys.all, "detail", id] as const,
};

export function useSubjects(query: ListQuery) {
  return useQuery({
    queryKey: subjectKeys.list(query),
    queryFn: () =>
      api.get<Page<Subject>>("/subjects", { params: query }).then((r) => r.data),
  });
}

export function useSubject(id: string | undefined) {
  return useQuery({
    queryKey: subjectKeys.detail(id ?? ""),
    queryFn: () => api.get<Subject>(`/subjects/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectInput) =>
      api.post<Subject>("/subjects", input).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success("Disciplina criada com sucesso.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useUpdateSubject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectInput) =>
      api.put<Subject>(`/subjects/${id}`, input).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success("Disciplina atualizada com sucesso.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

// RF-03: ativação exige professor responsável (validada no backend/mock)
export function useActivateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<Subject>(`/subjects/${id}/activate`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success("Disciplina ativada.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/subjects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success("Disciplina removida.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}
