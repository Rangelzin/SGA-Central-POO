import { api } from "@/lib/api/client";
import type { Page, StudentInput, ListQuery } from "@/types/api";
import type { Student } from "@/types/domain";
import { mapPage, mapStudent } from "@/lib/api/services/mappers";

class StudentService {
  private readonly basePath = "/alunos";

  async list(query?: ListQuery & { nome?: string }): Promise<Page<Student>> {
    const params = new URLSearchParams();
    if (query?.nome) params.append("nome", query.nome);
    if (query?.page !== undefined) params.append("page", String(query.page));
    if (query?.size !== undefined) params.append("size", String(query.size));

    const { data } = await api.get(
      `${this.basePath}${params.toString() ? `?${params}` : ""}`
    );
    return mapPage(data, mapStudent);
  }

  async get(id: string): Promise<Student> {
    const { data } = await api.get(`${this.basePath}/${id}`);
    return mapStudent(data);
  }

  async create(input: StudentInput): Promise<Student> {
    const payload = {
      nome: input.name,
      email: input.email,
      cpf: input.cpf,
      dataNascimento: input.birthDate,
      departamento: { id: input.courseId },
    };

    const { data } = await api.post(this.basePath, payload);
    return mapStudent(data);
  }

  async update(id: string, input: StudentInput): Promise<Student> {
    const payload = {
      nome: input.name,
      email: input.email,
      cpf: input.cpf,
      dataNascimento: input.birthDate,
      departamento: { id: input.courseId },
    };

    const { data } = await api.put(`${this.basePath}/${id}`, payload);
    return mapStudent(data);
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }
}

export const studentService = new StudentService();
