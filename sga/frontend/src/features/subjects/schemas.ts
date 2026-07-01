import { z } from "zod";

export const subjectTypeOptions = [
  { value: "MANDATORY", label: "Obrigatória" },
  { value: "ELECTIVE", label: "Eletiva" },
  { value: "FREE", label: "Livre" },
] as const;

export const subjectTypeLabels: Record<string, string> = {
  MANDATORY: "Obrigatória",
  ELECTIVE: "Eletiva",
  FREE: "Livre",
};

export const subjectSchema = z.object({
  code: z.string().min(2, "Informe o código (ex.: CC101)."),
  name: z.string().min(3, "Informe o nome da disciplina."),
  syllabus: z.string().min(3, "Descreva a ementa."),
  workload: z
    .number("Informe a carga horária.")
    .int("Use horas inteiras.")
    .positive("Carga horária deve ser maior que zero."),
  type: z.enum(["MANDATORY", "ELECTIVE", "FREE"], "Selecione o tipo."),
  prerequisite: z.string().optional(),
  responsibleTeacherId: z.string().optional(),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
