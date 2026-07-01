import { api } from "@/lib/api/client";
import type { Page, ClassInput, ClassQuery, ClassReport } from "@/types/api";
import type { Class, Enrollment } from "@/types/domain";
import {
  mapClass,
  mapClassReport,
  mapEnrollment,
  mapPage,
} from "@/lib/api/services/mappers";

class ClassService {
  private readonly basePath = "/turmas";

  private toNumberOrNull(value: unknown): number | null {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private async enrichWithSeats(classItem: Class): Promise<Class> {
    try {
      const { data } = await api.get(`${this.basePath}/${classItem.uuid}/vagas`);

      const capacityFromApi = this.toNumberOrNull(data?.capacidade);
      const enrolledFromApi = this.toNumberOrNull(data?.matriculasAtivas);
      const availableFromApi = this.toNumberOrNull(data?.vagasDisponiveis);

      const capacity = capacityFromApi ?? classItem.capacity;
      const enrolledCount = enrolledFromApi ?? classItem.enrolledCount;
      const availableSeats =
        availableFromApi ?? Math.max(0, capacity - enrolledCount);

      return {
        ...classItem,
        capacity,
        enrolledCount,
        availableSeats,
      };
    } catch {
      return classItem;
    }
  }

  async list(query?: ClassQuery): Promise<Page<Class>> {
    const params = new URLSearchParams();
    if (query?.page !== undefined) params.append("page", String(query.page));
    if (query?.size !== undefined) params.append("size", String(query.size));
    if (query?.search) params.append("nome", query.search);

    const { data } = await api.get(
      `${this.basePath}${params.toString() ? `?${params}` : ""}`
    );

    const page = mapPage(data, mapClass);
    const enrichedContent = await Promise.all(
      page.content.map((item) => this.enrichWithSeats(item)),
    );

    return { ...page, content: enrichedContent };
  }

  async get(id: string): Promise<Class> {
    const { data } = await api.get(`${this.basePath}/${id}`);
    return mapClass(data);
  }

  async create(input: ClassInput): Promise<Class> {
    const payload = {
      codigo: input.code,
      horario: input.schedule,
      localidade: input.location,
      capacidade: input.capacity,
      dataIn: input.startDate,
      dataOut: input.endDate,
      disciplina: { id: input.subjectId },
      professor: { id: input.teacherId },
    };

    const { data } = await api.post(this.basePath, payload);
    return mapClass(data);
  }

  async update(id: string, input: ClassInput): Promise<Class> {
    const payload = {
      codigo: input.code,
      horario: input.schedule,
      localidade: input.location,
      capacidade: input.capacity,
      dataIn: input.startDate,
      dataOut: input.endDate,
      disciplina: { id: input.subjectId },
      professor: { id: input.teacherId },
    };

    const { data } = await api.put(`${this.basePath}/${id}`, payload);
    return mapClass(data);
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async getEnrollments(id: string): Promise<Enrollment[]> {
    const { data } = await api.get(`/relatorios/turma/${id}`);
    const matriculas = Array.isArray(data?.matriculas) ? data.matriculas : [];
    return matriculas.map(mapEnrollment);
  }

  async getReport(id: string): Promise<ClassReport> {
    const classItem = await this.get(id);
    const { data } = await api.get(`/relatorios/turma/${id}`);
    return mapClassReport(data, classItem);
  }
}

export const classService = new ClassService();
