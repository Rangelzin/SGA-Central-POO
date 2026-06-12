"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiMessage } from "@/lib/api/client";
import type { ListQuery, Page, StudentInput, Transcript } from "@/types/api";
import type { Enrollment, Student } from "@/types/domain";

export const studentKeys = {
  all: ["students"] as const,
  list: (query: ListQuery) => [...studentKeys.all, "list", query] as const,
  detail: (id: string) => [...studentKeys.all, "detail", id] as const,
  transcript: (id: string) => [...studentKeys.all, "transcript", id] as const,
  enrollments: (id: string) => [...studentKeys.all, "enrollments", id] as const,
};

export function useStudents(query: ListQuery) {
  return useQuery({
    queryKey: studentKeys.list(query),
    queryFn: () =>
      api.get<Page<Student>>("/students", { params: query }).then((r) => r.data),
  });
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: studentKeys.detail(id ?? ""),
    queryFn: () => api.get<Student>(`/students/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useStudentTranscript(id: string | undefined) {
  return useQuery({
    queryKey: studentKeys.transcript(id ?? ""),
    queryFn: () => api.get<Transcript>(`/students/${id}/transcript`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useStudentEnrollments(id: string | undefined) {
  return useQuery({
    queryKey: studentKeys.enrollments(id ?? ""),
    queryFn: () =>
      api.get<Enrollment[]>(`/students/${id}/enrollments`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) =>
      api.post<Student>("/students", input).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toast.success("Aluno criado com sucesso.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useUpdateStudent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) =>
      api.put<Student>(`/students/${id}`, input).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toast.success("Aluno atualizado com sucesso.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toast.success("Aluno removido.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}
