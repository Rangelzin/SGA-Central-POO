"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StudentForm } from "@/features/students/student-form";
import { useCreateStudent } from "@/features/students/hooks";
import type { StudentFormValues } from "@/features/students/schemas";
import { stripCpf } from "@/lib/utils";

export default function NewStudentPage() {
  const router = useRouter();
  const createStudent = useCreateStudent();

  async function handleSubmit(values: StudentFormValues) {
    await createStudent.mutateAsync({ ...values, cpf: stripCpf(values.cpf) });
    router.push("/admin/students");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo aluno"
        description="A matrícula é gerada automaticamente após o cadastro."
      />
      <StudentForm
        onSubmit={handleSubmit}
        isPending={createStudent.isPending}
        requirePassword
      />
    </div>
  );
}
