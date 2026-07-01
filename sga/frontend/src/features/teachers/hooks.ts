"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teacherService } from "@/lib/api/services";
import { getApiMessage } from "@/lib/api/client";
import type { ListQuery, TeacherInput } from "@/types/api";

export const teacherKeys = {
  all: ["teachers"] as const,
  list: (query: ListQuery) => [...teacherKeys.all, "list", query] as const,
  detail: (id: string) => [...teacherKeys.all, "detail", id] as const,
};

export function useTeachers(query: ListQuery) {
  return useQuery({
    queryKey: teacherKeys.list(query),
    queryFn: () => teacherService.list(query),
  });
}

export function useTeacher(id: string | undefined) {
  return useQuery({
    queryKey: teacherKeys.detail(id ?? ""),
    queryFn: () => teacherService.get(id!),
    enabled: Boolean(id),
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TeacherInput) => teacherService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all });
      toast.success("Professor criado com sucesso.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useUpdateTeacher(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TeacherInput) => teacherService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all });
      toast.success("Professor atualizado com sucesso.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teacherService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all });
      toast.success("Professor removido.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}
