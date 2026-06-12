export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export type EnrollmentStatus =
  | "ENROLLED"
  | "IN_PROGRESS"
  | "APPROVED"
  | "FAILED"
  | "CANCELLED";

export type AssessmentType = "EXAM" | "ASSIGNMENT" | "PROJECT" | "OTHER";
export type SubjectType = "MANDATORY" | "ELECTIVE" | "FREE";

// Pessoa (abstrata) — campos comuns
export interface Person {
  uuid: string;
  name: string;
  email: string;
  role: Role;
  enrollmentCode: string;
  cpf: string;
  birthDate: string; // ISO date
}

// Aluno (RF-01)
export interface Student extends Person {
  role: "STUDENT";
  course: CourseRef;
}

// Professor (RF-02)
export interface Teacher extends Person {
  role: "TEACHER";
  title: string;
  department: DepartmentRef;
}

// Administrador (Secretaria)
export interface Admin extends Person {
  role: "ADMIN";
}

// Disciplina (RF-03)
export interface Subject {
  uuid: string;
  code: string;
  name: string;
  syllabus: string;
  workload: number; // horas
  type: SubjectType;
  prerequisite?: string;
  responsibleTeacher: TeacherRef | null; // >= 1 para ativar (RF-03)
  active: boolean;
}

// Turma (oferta de uma disciplina)
export interface Class {
  uuid: string;
  code: string;
  subject: SubjectRef;
  teacher: TeacherRef;
  term: string; // ex.: "2026.1"
  schedule: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolledCount: number;
  availableSeats: number;
}

// Matrícula (vínculo Aluno ↔ Turma) — RF-04/05
export interface Enrollment {
  uuid: string;
  student: StudentRef;
  class: ClassRef;
  grade: number | null;
  attendance: number | null; // %
  status: EnrollmentStatus;
  assessments: Assessment[];
}

// Avaliação parcial
export interface Assessment {
  uuid: string;
  description: string;
  type: AssessmentType;
  grade: number;
  weight: number;
  date: string;
}

// Suporte
export interface Course {
  uuid: string;
  acronym: string;
  name: string;
}

export interface Department {
  uuid: string;
  acronym: string;
  name: string;
}

// "Ref" = forma resumida embutida em outras entidades
export type CourseRef = Pick<Course, "uuid" | "name">;
export type DepartmentRef = Pick<Department, "uuid" | "name">;
export type SubjectRef = Pick<Subject, "uuid" | "code" | "name" | "workload">;
export type TeacherRef = Pick<Teacher, "uuid" | "name">;
export type StudentRef = Pick<Student, "uuid" | "name" | "enrollmentCode">;
export type ClassRef = Pick<Class, "uuid" | "code" | "term" | "schedule">;

// Regra RF-05: aprovação exige média >= 6.0 e frequência >= 75%
export const PASSING_GRADE = 6.0;
export const MIN_ATTENDANCE = 75;
