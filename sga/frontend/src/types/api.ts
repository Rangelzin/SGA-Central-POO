import type {
  ClassRef,
  EnrollmentStatus,
  Person,
  StudentRef,
  SubjectRef,
  SubjectType,
} from "@/types/domain";

// Paginação (seção 8.1 do plano)
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Envelope de erro único da API
export interface ApiError {
  status: number;
  message: string;
  errors?: { field: string; message: string }[];
  timestamp: string;
}

// Auth (RNF-02)
export interface LoginInput {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  user: Person;
}

// Query genérica de listagem
export interface ListQuery {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}

// Alunos — RF-01
export interface StudentInput {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  senha?: string;
  courseId: string;
}

// Professores — RF-02
export interface TeacherInput {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  senha?: string;
  title: string;
  departmentId: string;
}

// Disciplinas — RF-03
export interface SubjectInput {
  code: string;
  name: string;
  syllabus: string;
  workload: number;
  type: SubjectType;
  prerequisite?: string;
  responsibleTeacherId?: string;
}

// Turmas
export interface ClassInput {
  code: string;
  subjectId: string;
  teacherId: string;
  term: string;
  schedule: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
}

export interface ClassQuery {
  term?: string;
  teacherId?: string;
  subjectId?: string;
  available?: boolean;
  page?: number;
  size?: number;
  search?: string;
}

// Matrícula — RF-04
export interface EnrollmentInput {
  alunoId: string;
  turmaId: string;
}

// Notas e frequência — RF-05
export interface GradeInput {
  grade: number;
}

export interface AttendanceInput {
  attendance: number;
}

export interface AssessmentInput {
  description: string;
  type: "EXAM" | "ASSIGNMENT" | "PROJECT" | "OTHER";
  grade: number;
  weight: number;
  date: string;
}

// Relatório de turma — RF-07
export interface ClassReport {
  class: ClassRef;
  studentsCount: number;
  averageGrade: number;
  approvedCount: number;
  failedCount: number;
  rows: {
    student: StudentRef;
    grade: number | null;
    attendance: number | null;
    status: EnrollmentStatus;
  }[];
}

// Histórico escolar — RF-06
export interface TranscriptRow {
  subject: SubjectRef;
  class: ClassRef;
  grade: number | null;
  attendance: number | null;
  status: EnrollmentStatus;
}

export interface Transcript {
  student: StudentRef;
  rows: TranscriptRow[];
  completedWorkload: number;
  overallAverage: number | null;
}
