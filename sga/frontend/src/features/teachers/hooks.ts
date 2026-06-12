"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiMessage } from "@/lib/api/client";
import type { ListQuery, Page, TeacherInput } from "@/types/api";
import type { Teacher } from "@/types/domain";

export const teacherKeys = {
  all: ["teachers"] as const,
  list: (query: ListQuery) => [...teacherKeys.all, "list", query] as const,
  detail: (id: string) => [...teacherKeys.all, "detail", id] as const,
};

export function useTeachers(query: ListQuery) {
  return useQuery({
    queryKey: teacherKeys.list(query),
    queryFn: () =>
      api.get<Page<Teacher>>("/teachers", { params: query }).then((r) => r.data),
  });
}

export function useTeacher(id: string | undefined) {
  return useQuery({
    queryKey: teacherKeys.detail(id ?? ""),
    queryFn: () => api.get<Teacher>(`/teachers/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TeacherInput) =>
      api.post<Teacher>("/teachers", input).then((r) => r.data),
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
    mutationFn: (input: TeacherInput) =>
      api.put<Teacher>(`/teachers/${id}`, input).then((r) => r.data),
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
    mutationFn: (id: string) => api.delete(`/teachers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all });
      toast.success("Professor removido.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}
