import { api } from "@/lib/api/client";
import type { Page, TeacherInput, ListQuery } from "@/types/api";
import type { Teacher, Class } from "@/types/domain";
import { mapClass, mapPage, mapTeacher } from "@/lib/api/services/mappers";

class TeacherService {
  private readonly basePath = "/professores";

  async list(query?: ListQuery & { nome?: string }): Promise<Page<Teacher>> {
    const params = new URLSearchParams();
    if (query?.nome) params.append("nome", query.nome);
    if (query?.page !== undefined) params.append("page", String(query.page));
    if (query?.size !== undefined) params.append("size", String(query.size));

    const { data } = await api.get(
      `${this.basePath}${params.toString() ? `?${params}` : ""}`
    );
    return mapPage(data, mapTeacher);
  }

  async get(id: string): Promise<Teacher> {
    const { data } = await api.get(`${this.basePath}/${id}`);
    return mapTeacher(data);
  }

  async create(input: TeacherInput): Promise<Teacher> {
    const payload = {
      nome: input.name,
      email: input.email,
      cpf: input.cpf,
      dataNascimento: input.birthDate,
      titulacao: input.title,
      departamento: { id: input.departmentId },
    };

    const { data } = await api.post(this.basePath, payload);
    return mapTeacher(data);
  }

  async update(id: string, input: TeacherInput): Promise<Teacher> {
    const payload = {
      nome: input.name,
      email: input.email,
      cpf: input.cpf,
      dataNascimento: input.birthDate,
      titulacao: input.title,
      departamento: { id: input.departmentId },
    };

    const { data } = await api.put(`${this.basePath}/${id}`, payload);
    return mapTeacher(data);
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async getClasses(id: string): Promise<Class[]> {
    const { data } = await api.get(`${this.basePath}/${id}/turmas`);
    return Array.isArray(data) ? data.map(mapClass) : [];
  }
}

export const teacherService = new TeacherService();
