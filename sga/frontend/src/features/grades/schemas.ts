import { z } from "zod";

export const assessmentTypeOptions = [
  { value: "EXAM", label: "Prova" },
  { value: "ASSIGNMENT", label: "Trabalho" },
  { value: "PROJECT", label: "Projeto" },
  { value: "OTHER", label: "Outro" },
] as const;

export const assessmentTypeLabels: Record<string, string> = {
  EXAM: "Prova",
  ASSIGNMENT: "Trabalho",
  PROJECT: "Projeto",
  OTHER: "Outro",
};

export const assessmentSchema = z.object({
  description: z.string().min(2, "Informe a descrição."),
  type: z.enum(["EXAM", "ASSIGNMENT", "PROJECT", "OTHER"], "Selecione o tipo."),
  grade: z
    .number("Informe a nota.")
    .min(0, "Nota mínima é 0.")
    .max(10, "Nota máxima é 10."),
  weight: z.number("Informe o peso.").positive("Peso deve ser maior que zero."),
  date: z.string().min(1, "Informe a data."),
});

export type AssessmentFormValues = z.infer<typeof assessmentSchema>;
