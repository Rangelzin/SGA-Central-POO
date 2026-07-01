import { api } from "@/lib/api/client";
import type { Page, SubjectInput, ListQuery } from "@/types/api";
import type { Subject } from "@/types/domain";
import { mapPage, mapSubject } from "@/lib/api/services/mappers";

class SubjectService {
  private readonly basePath = "/disciplinas";

  private async enrichResponsibleTeacher(subject: Subject): Promise<Subject> {
    try {
      const { data } = await api.get(`${this.basePath}/${subject.uuid}/turmas`);
      const classes = Array.isArray(data) ? data : [];

      const classWithTeacher = classes.find((classItem) => classItem?.professor);
      const professor = classWithTeacher?.professor;

      if (!professor?.id || !professor?.nome) {
        return subject;
      }

      return {
        ...subject,
        active: subject.active || Boolean(professor?.id),
        responsibleTeacher: {
          uuid: String(professor.id),
          name: String(professor.nome),
        },
      };
    } catch {
      return subject;
    }
  }

  private async resolveDepartmentId(
    input: SubjectInput,
    currentSubjectId?: string,
  ): Promise<string> {
    if (input.responsibleTeacherId) {
      const { data } = await api.get(`/professores/${input.responsibleTeacherId}`);
      const departmentId = data?.departamento?.id;
      if (departmentId !== undefined && departmentId !== null) {
        return String(departmentId);
      }
    }

    if (currentSubjectId) {
      const { data } = await api.get(`${this.basePath}/${currentSubjectId}`);
      const departmentId = data?.departamento?.id;
      if (departmentId !== undefined && departmentId !== null) {
        return String(departmentId);
      }
    }

    throw new Error(
      "Não foi possível identificar o departamento da disciplina. Selecione um professor responsável.",
    );
  }

  async list(query?: ListQuery & { nome?: string }): Promise<Page<Subject>> {
    const params = new URLSearchParams();
    if (query?.nome) params.append("nome", query.nome);
    if (query?.page !== undefined) params.append("page", String(query.page));
    if (query?.size !== undefined) params.append("size", String(query.size));

    const { data } = await api.get(
      `${this.basePath}${params.toString() ? `?${params}` : ""}`
    );

    const page = mapPage(data, mapSubject);
    const enrichedContent = await Promise.all(
      page.content.map((subject) => this.enrichResponsibleTeacher(subject)),
    );

    return { ...page, content: enrichedContent };
  }

  async get(id: string): Promise<Subject> {
    const { data } = await api.get(`${this.basePath}/${id}`);
    const mapped = mapSubject(data);
    return this.enrichResponsibleTeacher(mapped);
  }

  async create(input: SubjectInput): Promise<Subject> {
    const departmentId = await this.resolveDepartmentId(input);

    const payload = {
      codigo: input.code,
      nome: input.name,
      tipo:
        input.type === "MANDATORY"
          ? "OBRIGATORIA"
          : input.type === "ELECTIVE"
            ? "OPTATIVA"
            : "NUCLEO_LIVRE",
      cargaHoraria: input.workload,
      ementa: input.syllabus,
      preRequisito: input.prerequisite,
      departamento: { id: departmentId },
    };

    const { data } = await api.post(this.basePath, payload);
    const mapped = mapSubject(data);
    return this.enrichResponsibleTeacher(mapped);
  }

  async update(id: string, input: SubjectInput): Promise<Subject> {
    const departmentId = await this.resolveDepartmentId(input, id);

    const payload = {
      codigo: input.code,
      nome: input.name,
      tipo:
        input.type === "MANDATORY"
          ? "OBRIGATORIA"
          : input.type === "ELECTIVE"
            ? "OPTATIVA"
            : "NUCLEO_LIVRE",
      cargaHoraria: input.workload,
      ementa: input.syllabus,
      preRequisito: input.prerequisite,
      departamento: { id: departmentId },
    };

    const { data } = await api.put(`${this.basePath}/${id}`, payload);
    const mapped = mapSubject(data);
    return this.enrichResponsibleTeacher(mapped);
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async activate(id: string): Promise<Subject> {
    const { data } = await api.put(`${this.basePath}/${id}/ativar`);
    const mapped = mapSubject(data);
    return this.enrichResponsibleTeacher(mapped);
  }
}

export const subjectService = new SubjectService();
