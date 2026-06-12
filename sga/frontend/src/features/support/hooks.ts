"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Course, Department } from "@/types/domain";

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => api.get<Course[]>("/courses").then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get<Department[]>("/departments").then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}
