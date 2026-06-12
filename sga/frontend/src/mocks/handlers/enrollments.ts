import { http, HttpResponse } from "msw";
import type {
  AssessmentInput,
  AttendanceInput,
  EnrollmentInput,
  GradeInput,
} from "@/types/api";
import type { Assessment } from "@/types/domain";
import {
  classes,
  computeStatus,
  enrollments,
  nextUuid,
  serializeClass,
  serializeEnrollment,
  students,
  weightedAverage,
} from "@/mocks/data/db";
import {
  API_BASE,
  getCurrentUser,
  jsonError,
  networkDelay,
  notFound,
  unauthorized,
} from "@/mocks/handlers/utils";

function recalc(enrollment: (typeof enrollments)[number]) {
  if (enrollment.assessments.length > 0) {
    enrollment.grade = weightedAverage(enrollment.assessments);
  }
  enrollment.status = computeStatus(enrollment.grade, enrollment.attendance);
}

export const enrollmentHandlers = [
  // RF-04: matricular (valida vaga + duplicidade → 409)
  http.post(`${API_BASE}/enrollments`, async ({ request }) => {
    await networkDelay();
    const user = getCurrentUser(request);
    if (!user) return unauthorized();

    const input = (await request.json()) as EnrollmentInput;
    const studentId = input.studentId === "me" ? user.uuid : input.studentId;

    const student = students.find((s) => s.uuid === studentId);
    if (!student) return notFound("Aluno");

    const classRecord = classes.find((c) => c.uuid === input.classId);
    if (!classRecord) return notFound("Turma");

    if (serializeClass(classRecord).availableSeats <= 0) {
      return jsonError(409, "Turma sem vagas disponíveis.");
    }

    const duplicated = enrollments.some((e) => {
      if (e.studentId !== student.uuid || e.status === "CANCELLED") return false;
      const enrolledClass = classes.find((c) => c.uuid === e.classId);
      return (
        enrolledClass?.subject.uuid === classRecord.subject.uuid &&
        enrolledClass?.term === classRecord.term
      );
    });
    if (duplicated) {
      return jsonError(409, "Aluno já matriculado nesta disciplina neste período.");
    }

    const enrollment = {
      uuid: nextUuid("enrollment"),
      studentId: student.uuid,
      classId: classRecord.uuid,
      grade: null,
      attendance: null,
      status: "ENROLLED" as const,
      assessments: [] as Assessment[],
    };
    enrollments.push(enrollment);
    return HttpResponse.json(serializeEnrollment(enrollment), { status: 201 });
  }),

  // RF-04: cancelar matrícula (libera a vaga)
  http.delete(`${API_BASE}/enrollments/:id`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const enrollment = enrollments.find((e) => e.uuid === params.id);
    if (!enrollment) return notFound("Matrícula");

    if (enrollment.status === "APPROVED" || enrollment.status === "FAILED") {
      return jsonError(409, "Matrícula já concluída não pode ser cancelada.");
    }
    enrollment.status = "CANCELLED";
    return new HttpResponse(null, { status: 204 });
  }),

  // RF-05: nota consolidada
  http.put(`${API_BASE}/enrollments/:id/grade`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const enrollment = enrollments.find((e) => e.uuid === params.id);
    if (!enrollment) return notFound("Matrícula");

    const { grade } = (await request.json()) as GradeInput;
    if (typeof grade !== "number" || Number.isNaN(grade) || grade < 0 || grade > 10) {
      return jsonError(400, "Dados inválidos.", [
        { field: "grade", message: "Nota deve estar entre 0 e 10." },
      ]);
    }
    enrollment.grade = Math.round(grade * 10) / 10;
    enrollment.status = computeStatus(enrollment.grade, enrollment.attendance);
    return HttpResponse.json(serializeEnrollment(enrollment));
  }),

  // RF-05: frequência
  http.put(`${API_BASE}/enrollments/:id/attendance`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const enrollment = enrollments.find((e) => e.uuid === params.id);
    if (!enrollment) return notFound("Matrícula");

    const { attendance } = (await request.json()) as AttendanceInput;
    if (
      typeof attendance !== "number" ||
      Number.isNaN(attendance) ||
      attendance < 0 ||
      attendance > 100
    ) {
      return jsonError(400, "Dados inválidos.", [
        { field: "attendance", message: "Frequência deve estar entre 0 e 100." },
      ]);
    }
    enrollment.attendance = Math.round(attendance);
    enrollment.status = computeStatus(enrollment.grade, enrollment.attendance);
    return HttpResponse.json(serializeEnrollment(enrollment));
  }),

  // RF-05: avaliações parciais com peso
  http.post(`${API_BASE}/enrollments/:id/assessments`, async ({ request, params }) => {
    await networkDelay();
    if (!getCurrentUser(request)) return unauthorized();

    const enrollment = enrollments.find((e) => e.uuid === params.id);
    if (!enrollment) return notFound("Matrícula");

    const input = (await request.json()) as AssessmentInput;
    const errors = validateAssessment(input);
    if (errors.length > 0) return jsonError(400, "Dados inválidos.", errors);

    const assessment: Assessment = { uuid: nextUuid("assessment"), ...input };
    enrollment.assessments.push(assessment);
    recalc(enrollment);
    return HttpResponse.json(serializeEnrollment(enrollment), { status: 201 });
  }),

  http.put(
    `${API_BASE}/enrollments/:id/assessments/:assessmentId`,
    async ({ request, params }) => {
      await networkDelay();
      if (!getCurrentUser(request)) return unauthorized();

      const enrollment = enrollments.find((e) => e.uuid === params.id);
      if (!enrollment) return notFound("Matrícula");

      const assessment = enrollment.assessments.find(
        (a) => a.uuid === params.assessmentId,
      );
      if (!assessment) return notFound("Avaliação");

      const input = (await request.json()) as AssessmentInput;
      const errors = validateAssessment(input);
      if (errors.length > 0) return jsonError(400, "Dados inválidos.", errors);

      Object.assign(assessment, input);
      recalc(enrollment);
      return HttpResponse.json(serializeEnrollment(enrollment));
    },
  ),

  http.delete(
    `${API_BASE}/enrollments/:id/assessments/:assessmentId`,
    async ({ request, params }) => {
      await networkDelay();
      if (!getCurrentUser(request)) return unauthorized();

      const enrollment = enrollments.find((e) => e.uuid === params.id);
      if (!enrollment) return notFound("Matrícula");

      const index = enrollment.assessments.findIndex(
        (a) => a.uuid === params.assessmentId,
      );
      if (index === -1) return notFound("Avaliação");

      enrollment.assessments.splice(index, 1);
      recalc(enrollment);
      return HttpResponse.json(serializeEnrollment(enrollment));
    },
  ),
];

function validateAssessment(
  input: Partial<AssessmentInput>,
): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  if (!input.description?.trim()) {
    errors.push({ field: "description", message: "Descrição é obrigatória." });
  }
  if (
    typeof input.grade !== "number" ||
    Number.isNaN(input.grade) ||
    input.grade < 0 ||
    input.grade > 10
  ) {
    errors.push({ field: "grade", message: "Nota deve estar entre 0 e 10." });
  }
  if (typeof input.weight !== "number" || Number.isNaN(input.weight) || input.weight <= 0) {
    errors.push({ field: "weight", message: "Peso deve ser maior que zero." });
  }
  if (!input.date) errors.push({ field: "date", message: "Data é obrigatória." });
  return errors;
}
