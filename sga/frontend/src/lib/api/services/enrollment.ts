import { api } from "@/lib/api/client";
import type {
  Page,
  EnrollmentInput,
  GradeInput,
  AttendanceInput,
  ListQuery,
} from "@/types/api";
import type { Enrollment } from "@/types/domain";

class EnrollmentService {
  private readonly basePath = "/matriculas";

  async list(query?: ListQuery): Promise<Page<Enrollment>> {
    const params = new URLSearchParams();
    if (query?.page !== undefined) params.append("page", String(query.page));
    if (query?.size !== undefined) params.append("size", String(query.size));

    const { data } = await api.get<Page<Enrollment>>(
      `${this.basePath}${params.toString() ? `?${params}` : ""}`
    );
    return data;
  }

  async get(id: string): Promise<Enrollment> {
    const { data } = await api.get<Enrollment>(`${this.basePath}/${id}`);
    return data;
  }

  async create(input: EnrollmentInput): Promise<Enrollment> {
    const { data } = await api.post<Enrollment>(this.basePath, input);
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async updateGrade(
    enrollmentId: string,
    input: GradeInput
  ): Promise<Enrollment> {
    const { data } = await api.post<Enrollment>("/avaliacoes/nota", {
      matriculadoId: enrollmentId,
      nota: input.grade,
    });
    return data;
  }

  async updateAttendance(
    enrollmentId: string,
    input: AttendanceInput
  ): Promise<Enrollment> {
    const { data } = await api.post<Enrollment>("/avaliacoes/frequencia", {
      matriculadoId: enrollmentId,
      frequencia: input.attendance,
    });
    return data;
  }
}

export const enrollmentService = new EnrollmentService();
