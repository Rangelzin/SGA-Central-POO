import type { ClassReport, Page, Transcript } from "@/types/api";
import type {
  Class,
  Enrollment,
  EnrollmentStatus,
  Student,
  Subject,
  SubjectType,
  Teacher,
} from "@/types/domain";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function mapSubjectType(raw: unknown): SubjectType {
  const value = toStringValue(raw);
  if (value === "OBRIGATORIA" || value === "MANDATORY") return "MANDATORY";
  if (value === "OPTATIVA" || value === "ELECTIVE") return "ELECTIVE";
  return "FREE";
}

function mapEnrollmentStatus(raw: unknown): EnrollmentStatus {
  const value = toStringValue(raw);
  if (value === "ATIVA") return "IN_PROGRESS";
  if (value === "APROVADO") return "APPROVED";
  if (value === "REPROVADO") return "FAILED";
  if (value === "TRANCADA" || value === "CANCELADA") return "CANCELLED";
  if (value === "ENROLLED" || value === "IN_PROGRESS" || value === "APPROVED" || value === "FAILED" || value === "CANCELLED") {
    return value;
  }
  return "ENROLLED";
}

function extractTermFromCode(code: string): string {
  const match = code.match(/\d{4}\.[12]/);
  return match?.[0] ?? "";
}

function inferTermFromStartDate(startDate: string): string {
  const match = startDate.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (!match) return "";

  const year = match[1];
  const month = Number(match[2]);
  const semester = month >= 7 ? 2 : 1;

  return `${year}.${semester}`;
}

export function mapPage<T>(input: unknown, mapper: (item: unknown) => T): Page<T> {
  const data = asRecord(input);
  const content = Array.isArray(data.content) ? data.content : [];

  return {
    content: content.map(mapper),
    page: toNumberValue(data.number ?? data.page, 0),
    size: toNumberValue(data.size, content.length),
    totalElements: toNumberValue(data.totalElements, content.length),
    totalPages: toNumberValue(data.totalPages, 1),
  };
}

export function mapStudent(input: unknown): Student {
  const data = asRecord(input);
  const courseRaw = asRecord(data.course ?? data.departamento);

  return {
    uuid: toStringValue(data.uuid ?? data.id),
    name: toStringValue(data.name ?? data.nome),
    email: toStringValue(data.email),
    role: "STUDENT",
    enrollmentCode: toStringValue(data.enrollmentCode ?? data.matricula),
    cpf: toStringValue(data.cpf),
    birthDate: toStringValue(data.birthDate ?? data.dataNascimento),
    course: {
      uuid: toStringValue(courseRaw.uuid ?? courseRaw.id),
      name: toStringValue(courseRaw.name ?? courseRaw.nome),
    },
  } as Student;
}

export function mapTeacher(input: unknown): Teacher {
  const data = asRecord(input);
  const departmentRaw = asRecord(data.department ?? data.departamento);

  return {
    uuid: toStringValue(data.uuid ?? data.id),
    name: toStringValue(data.name ?? data.nome),
    email: toStringValue(data.email),
    role: "TEACHER",
    enrollmentCode: toStringValue(data.enrollmentCode ?? data.matricula),
    cpf: toStringValue(data.cpf),
    birthDate: toStringValue(data.birthDate ?? data.dataNascimento),
    title: toStringValue(data.title ?? data.titulacao),
    department: {
      uuid: toStringValue(departmentRaw.uuid ?? departmentRaw.id),
      name: toStringValue(departmentRaw.name ?? departmentRaw.nome),
    },
  } as Teacher;
}

export function mapSubject(input: unknown): Subject {
  const data = asRecord(input);

  return {
    uuid: toStringValue(data.uuid ?? data.id),
    code: toStringValue(data.code ?? data.codigo),
    name: toStringValue(data.name ?? data.nome ?? data.codigo),
    syllabus: toStringValue(data.syllabus ?? data.ementa),
    workload: toNumberValue(data.workload ?? data.cargaHoraria),
    type: mapSubjectType(data.type ?? data.tipo),
    prerequisite: toStringValue(data.prerequisite ?? data.preRequisito),
    responsibleTeacher: null,
    active: Boolean(data.active ?? data.ativo),
  };
}

export function mapClass(input: unknown): Class {
  const data = asRecord(input);
  const subjectRaw = asRecord(data.subject ?? data.disciplina);
  const teacherRaw = asRecord(data.teacher ?? data.professor);

  const code = toStringValue(data.code ?? data.codigo);
  const startDate = toStringValue(data.startDate ?? data.dataIn);
  const termFromCode = extractTermFromCode(code);
  const termFromDate = inferTermFromStartDate(startDate);
  const capacity = Math.max(0, toNumberValue(data.capacity ?? data.capacidade));
  const enrolledCount = Math.max(
    0,
    toNumberValue(data.enrolledCount ?? data.matriculasAtivas),
  );

  return {
    uuid: toStringValue(data.uuid ?? data.id),
    code,
    subject: {
      uuid: toStringValue(subjectRaw.uuid ?? subjectRaw.id),
      code: toStringValue(subjectRaw.code ?? subjectRaw.codigo),
      name: toStringValue(subjectRaw.name ?? subjectRaw.nome ?? subjectRaw.codigo),
      workload: toNumberValue(subjectRaw.workload ?? subjectRaw.cargaHoraria),
    },
    teacher: {
      uuid: toStringValue(teacherRaw.uuid ?? teacherRaw.id),
      name: toStringValue(teacherRaw.name ?? teacherRaw.nome),
    },
    term: toStringValue(data.term, termFromCode || termFromDate),
    schedule: toStringValue(data.schedule ?? data.horario),
    location: toStringValue(data.location ?? data.localidade),
    startDate,
    endDate: toStringValue(data.endDate ?? data.dataOut),
    capacity,
    enrolledCount,
    availableSeats: Math.max(0, capacity - enrolledCount),
  };
}

export function mapEnrollment(input: unknown): Enrollment {
  const data = asRecord(input);
  const studentRaw = asRecord(data.student ?? data.aluno);
  const classRaw = asRecord(data.class ?? data.turma);

  return {
    uuid: toStringValue(data.uuid ?? data.id),
    student: {
      uuid: toStringValue(studentRaw.uuid ?? studentRaw.id),
      name: toStringValue(studentRaw.name ?? studentRaw.nome),
      enrollmentCode: toStringValue(
        studentRaw.enrollmentCode ?? studentRaw.matricula,
      ),
    },
    class: {
      uuid: toStringValue(classRaw.uuid ?? classRaw.id),
      code: toStringValue(classRaw.code ?? classRaw.codigo),
      term: toStringValue(classRaw.term),
      schedule: toStringValue(classRaw.schedule ?? classRaw.horario),
    },
    grade:
      data.grade === null || data.nota === null
        ? null
        : toNumberValue(data.grade ?? data.nota),
    attendance:
      data.attendance === null || data.frequencia === null
        ? null
        : toNumberValue(data.attendance ?? data.frequencia),
    status: mapEnrollmentStatus(data.status),
    assessments: [],
  };
}

export function mapTranscript(input: unknown): Transcript {
  const list = Array.isArray(input) ? input : [];
  const rows = list.map((item) => {
    const itemRaw = asRecord(item);
    const classRaw = asRecord(itemRaw.class ?? itemRaw.turma);
    const subjectRaw = asRecord(classRaw.subject ?? classRaw.disciplina);

    const classCode = toStringValue(classRaw.code ?? classRaw.codigo);
    const startDate = toStringValue(classRaw.startDate ?? classRaw.dataIn);
    const termFromCode = extractTermFromCode(classCode);
    const termFromDate = inferTermFromStartDate(startDate);

    const enrollment = mapEnrollment(item);

    return {
      subject: {
        uuid: toStringValue(subjectRaw.uuid ?? subjectRaw.id, enrollment.class.uuid),
        code: toStringValue(subjectRaw.code ?? subjectRaw.codigo, enrollment.class.code),
        name: toStringValue(subjectRaw.name ?? subjectRaw.nome ?? subjectRaw.codigo, enrollment.class.code),
        workload: toNumberValue(subjectRaw.workload ?? subjectRaw.cargaHoraria, 0),
      },
      class: {
        ...enrollment.class,
        term: toStringValue(classRaw.term, enrollment.class.term || termFromCode || termFromDate),
      },
      grade: enrollment.grade,
      attendance: enrollment.attendance,
      status: enrollment.status,
    };
  });

  const student = rows.length
    ? mapEnrollment(list[0]).student
    : { uuid: "", name: "", enrollmentCode: "" };

  const approvedRows = rows.filter((row) => row.status === "APPROVED");
  const validGrades = rows
    .map((row) => row.grade)
    .filter((grade): grade is number => grade !== null);

  return {
    student,
    rows,
    completedWorkload: approvedRows.reduce(
      (sum, row) => sum + row.subject.workload,
      0,
    ),
    overallAverage:
      validGrades.length > 0
        ? validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length
        : null,
  };
}

export function mapClassReport(input: unknown, classItem?: Class): ClassReport {
  const data = asRecord(input);
  const summary = asRecord(data.resumo);
  const enrollments = Array.isArray(data.matriculas) ? data.matriculas : [];

  const rows = enrollments.map((item) => {
    const enrollment = mapEnrollment(item);
    return {
      student: enrollment.student,
      grade: enrollment.grade,
      attendance: enrollment.attendance,
      status: enrollment.status,
    };
  });

  const averageGrade =
    rows
      .filter((row) => row.grade !== null)
      .reduce((sum, row, _, list) => sum + (row.grade ?? 0) / list.length, 0) || 0;

  return {
    class: classItem
      ? {
          uuid: classItem.uuid,
          code: classItem.code,
          term: classItem.term,
          schedule: classItem.schedule,
        }
      : {
          uuid: toStringValue(data.turmaId),
          code: "",
          term: "",
          schedule: "",
        },
    studentsCount: toNumberValue(summary.total, rows.length),
    averageGrade,
    approvedCount: toNumberValue(summary.aprovados),
    failedCount: toNumberValue(summary.reprovados),
    rows,
  };
}
