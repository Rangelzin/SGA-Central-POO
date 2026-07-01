"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subjectService } from "@/lib/api/services";
import { getApiMessage } from "@/lib/api/client";
import type { ListQuery, SubjectInput } from "@/types/api";

export const subjectKeys = {
  all: ["subjects"] as const,
  list: (query: ListQuery) => [...subjectKeys.all, "list", query] as const,
  detail: (id: string) => [...subjectKeys.all, "detail", id] as const,
};

export function useSubjects(query: ListQuery) {
  return useQuery({
    queryKey: subjectKeys.list(query),
    queryFn: () => subjectService.list(query),
  });
}

export function useSubject(id: string | undefined) {
  return useQuery({
    queryKey: subjectKeys.detail(id ?? ""),
    queryFn: () => subjectService.get(id!),
    enabled: Boolean(id),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectInput) => subjectService.create(input),
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
    mutationFn: (input: SubjectInput) => subjectService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success("Disciplina atualizada com sucesso.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useActivateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subjectService.activate(id),
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
    mutationFn: (id: string) => subjectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success("Disciplina removida.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}
