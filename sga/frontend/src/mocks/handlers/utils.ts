import { HttpResponse, delay } from "msw";
import type { ApiError, Page } from "@/types/api";
import type { Person } from "@/types/domain";
import { findUserByUuid } from "@/mocks/data/db";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

/** Latência artificial p/ exercitar skeletons (seção 6.4). */
export function networkDelay() {
  return delay(250);
}

export function jsonError(
  status: number,
  message: string,
  errors?: { field: string; message: string }[],
) {
  const body: ApiError = {
    status,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
  return HttpResponse.json(body, { status });
}

export function unauthorized() {
  return jsonError(401, "Não autenticado.");
}

export function notFound(resource: string) {
  return jsonError(404, `${resource} não encontrado(a).`);
}

/** Tokens mock no formato "mock-token-{uuid}". */
export function tokenFor(person: Person): string {
  return `mock-token-${person.uuid}`;
}

export function getCurrentUser(request: Request): Person | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer mock-token-")) return null;
  const uuid = header.replace("Bearer mock-token-", "");
  return findUserByUuid(uuid) ?? null;
}

/** Lê ?page&size da URL e devolve a página no envelope da seção 8.1. */
export function paginate<T>(items: T[], url: URL): Page<T> {
  const page = Math.max(Number(url.searchParams.get("page") ?? 0), 0);
  const size = Math.min(Math.max(Number(url.searchParams.get("size") ?? 10), 1), 100);
  const totalElements = items.length;
  const totalPages = Math.max(Math.ceil(totalElements / size), 1);
  return {
    content: items.slice(page * size, page * size + size),
    page,
    size,
    totalElements,
    totalPages,
  };
}

export function matchesSearch(search: string | null, ...fields: string[]): boolean {
  if (!search) return true;
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => field.toLowerCase().includes(needle));
}
