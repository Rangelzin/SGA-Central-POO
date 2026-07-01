import { api } from "@/lib/api/client";
import type { AssessmentInput } from "@/types/api";
import type { Assessment } from "@/types/domain";

class AssessmentService {
  private readonly basePath = "/avaliacoes";

  async get(id: string): Promise<Assessment> {
    const { data } = await api.get<Assessment>(`${this.basePath}/${id}`);
    return data;
  }

  async create(input: AssessmentInput): Promise<Assessment> {
    const { data } = await api.post<Assessment>(this.basePath, input);
    return data;
  }

  async update(id: string, input: AssessmentInput): Promise<Assessment> {
    const { data } = await api.put<Assessment>(`${this.basePath}/${id}`, input);
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }
}

export const assessmentService = new AssessmentService();
