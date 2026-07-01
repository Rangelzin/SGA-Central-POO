"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { classService } from "@/lib/api/services";
import { getApiMessage } from "@/lib/api/client";
import type { ClassInput, ClassQuery } from "@/types/api";

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
    queryFn: () => classService.list(query),
  });
}

export function useClassesWithOptions(
  query: ClassQuery,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: classKeys.list(query),
    queryFn: () => classService.list(query),
    enabled: options?.enabled ?? true,
  });
}

export function useClass(id: string | undefined) {
  return useQuery({
    queryKey: classKeys.detail(id ?? ""),
    queryFn: () => classService.get(id!),
    enabled: Boolean(id),
  });
}

export function useClassEnrollments(id: string | undefined) {
  return useQuery({
    queryKey: classKeys.enrollments(id ?? ""),
    queryFn: () => classService.getEnrollments(id!),
    enabled: Boolean(id),
  });
}

export function useClassReport(id: string | undefined) {
  return useQuery({
    queryKey: classKeys.report(id ?? ""),
    queryFn: () => classService.getReport(id!),
    enabled: Boolean(id),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClassInput) => classService.create(input),
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
    mutationFn: (input: ClassInput) => classService.update(id, input),
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
    mutationFn: (id: string) => classService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Turma removida.");
    },
    onError: (error) => toast.error(getApiMessage(error)),
  });
}
