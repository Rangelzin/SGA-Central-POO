import { api } from "@/lib/api/client";
import type { Page, TeacherInput, ListQuery } from "@/types/api";
import type { Teacher, Class } from "@/types/domain";

class TeacherService {
  private readonly basePath = "/professores";

  async list(query?: ListQuery & { nome?: string }): Promise<Page<Teacher>> {
    const params = new URLSearchParams();
    if (query?.nome) params.append("nome", query.nome);
    if (query?.page !== undefined) params.append("page", String(query.page));
    if (query?.size !== undefined) params.append("size", String(query.size));

    const { data } = await api.get<Page<Teacher>>(
      `${this.basePath}${params.toString() ? `?${params}` : ""}`
    );
    return data;
  }

  async get(id: string): Promise<Teacher> {
    const { data } = await api.get<Teacher>(`${this.basePath}/${id}`);
    return data;
  }

  async create(input: TeacherInput): Promise<Teacher> {
    const { data } = await api.post<Teacher>(this.basePath, input);
    return data;
  }

  async update(id: string, input: TeacherInput): Promise<Teacher> {
    const { data } = await api.put<Teacher>(`${this.basePath}/${id}`, input);
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async getClasses(id: string): Promise<Class[]> {
    const { data } = await api.get<Class[]>(`${this.basePath}/${id}/turmas`);
    return data;
  }
}

export const teacherService = new TeacherService();
