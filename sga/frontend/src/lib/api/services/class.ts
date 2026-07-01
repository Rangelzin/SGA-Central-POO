import { api } from "@/lib/api/client";
import type { Page, ClassInput, ClassQuery, ClassReport } from "@/types/api";
import type { Class, Enrollment } from "@/types/domain";

class ClassService {
  private readonly basePath = "/turmas";

  async list(query?: ClassQuery): Promise<Page<Class>> {
    const params = new URLSearchParams();
    if (query?.term) params.append("term", query.term);
    if (query?.teacherId) params.append("teacherId", query.teacherId);
    if (query?.subjectId) params.append("subjectId", query.subjectId);
    if (query?.available !== undefined)
      params.append("available", String(query.available));
    if (query?.page !== undefined) params.append("page", String(query.page));
    if (query?.size !== undefined) params.append("size", String(query.size));
    if (query?.search) params.append("search", query.search);

    const { data } = await api.get<Page<Class>>(
      `${this.basePath}${params.toString() ? `?${params}` : ""}`
    );
    return data;
  }

  async get(id: string): Promise<Class> {
    const { data } = await api.get<Class>(`${this.basePath}/${id}`);
    return data;
  }

  async create(input: ClassInput): Promise<Class> {
    const { data } = await api.post<Class>(this.basePath, input);
    return data;
  }

  async update(id: string, input: ClassInput): Promise<Class> {
    const { data } = await api.put<Class>(`${this.basePath}/${id}`, input);
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async getEnrollments(id: string): Promise<Enrollment[]> {
    const { data } = await api.get<Enrollment[]>(
      `${this.basePath}/${id}/alunos`
    );
    return data;
  }

  async getReport(id: string): Promise<ClassReport> {
    const { data } = await api.get<ClassReport>(
      `${this.basePath}/${id}/relatorio`
    );
    return data;
  }
}

export const classService = new ClassService();
