"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Course, Department } from "@/types/domain";

type ApiPage<T> = { content?: T[] };

type ApiDepartment = {
  id?: string;
  uuid?: string;
  nome?: string;
  name?: string;
};

function toDepartment(dep: ApiDepartment): Department | null {
  const uuid = dep.uuid ?? dep.id ?? "";
  const name = dep.name ?? dep.nome ?? "";

  if (!uuid || !name) return null;

  return {
    uuid,
    name,
    acronym: name,
  };
}

async function loadDepartments(): Promise<Department[]> {
  const [studentsRes, teachersRes] = await Promise.all([
    api.get<ApiPage<{ departamento?: ApiDepartment }>>("/alunos?page=0&size=200"),
    api.get<ApiPage<{ departamento?: ApiDepartment }>>("/professores?page=0&size=200"),
  ]);

  const merged = [
    ...(studentsRes.data.content ?? []).map((item) => item.departamento),
    ...(teachersRes.data.content ?? []).map((item) => item.departamento),
  ];

  const dedup = new Map<string, Department>();

  for (const raw of merged) {
    if (!raw) continue;
    const mapped = toDepartment(raw);
    if (!mapped) continue;
    dedup.set(mapped.uuid, mapped);
  }

  return Array.from(dedup.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const departments = await loadDepartments();
      return departments.map(
        (dep) =>
          ({
            uuid: dep.uuid,
            name: dep.name,
            acronym: dep.acronym,
          }) as Course,
      );
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: loadDepartments,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
