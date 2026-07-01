import { api } from "@/lib/api/client";
import type { Page, StudentInput, ListQuery } from "@/types/api";
import type { Student } from "@/types/domain";

class StudentService {
  private readonly basePath = "/alunos";

  async list(query?: ListQuery & { nome?: string }): Promise<Page<Student>> {
    const params = new URLSearchParams();
    if (query?.nome) params.append("nome", query.nome);
    if (query?.page !== undefined) params.append("page", String(query.page));
    if (query?.size !== undefined) params.append("size", String(query.size));

    const { data } = await api.get<Page<Student>>(
      `${this.basePath}${params.toString() ? `?${params}` : ""}`
    );
    return data;
  }

  async get(id: string): Promise<Student> {
    const { data } = await api.get<Student>(`${this.basePath}/${id}`);
    return data;
  }

  async create(input: StudentInput): Promise<Student> {
    const { data } = await api.post<Student>(this.basePath, input);
    return data;
  }

  async update(id: string, input: StudentInput): Promise<Student> {
    const { data } = await api.put<Student>(`${this.basePath}/${id}`, input);
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }
}

export const studentService = new StudentService();
