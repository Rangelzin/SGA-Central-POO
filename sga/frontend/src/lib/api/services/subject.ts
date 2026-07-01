import { api } from "@/lib/api/client";
import type { Page, SubjectInput, ListQuery } from "@/types/api";
import type { Subject } from "@/types/domain";

class SubjectService {
  private readonly basePath = "/disciplinas";

  async list(query?: ListQuery & { nome?: string }): Promise<Page<Subject>> {
    const params = new URLSearchParams();
    if (query?.nome) params.append("nome", query.nome);
    if (query?.page !== undefined) params.append("page", String(query.page));
    if (query?.size !== undefined) params.append("size", String(query.size));

    const { data } = await api.get<Page<Subject>>(
      `${this.basePath}${params.toString() ? `?${params}` : ""}`
    );
    return data;
  }

  async get(id: string): Promise<Subject> {
    const { data } = await api.get<Subject>(`${this.basePath}/${id}`);
    return data;
  }

  async create(input: SubjectInput): Promise<Subject> {
    const { data } = await api.post<Subject>(this.basePath, input);
    return data;
  }

  async update(id: string, input: SubjectInput): Promise<Subject> {
    const { data } = await api.put<Subject>(`${this.basePath}/${id}`, input);
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async activate(id: string): Promise<Subject> {
    const { data } = await api.post<Subject>(`${this.basePath}/${id}/ativar`);
    return data;
  }
}

export const subjectService = new SubjectService();
