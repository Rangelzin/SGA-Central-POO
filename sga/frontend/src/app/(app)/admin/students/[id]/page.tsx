"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { StudentForm } from "@/features/students/student-form";
import { useStudent, useUpdateStudent } from "@/features/students/hooks";
import type { StudentFormValues } from "@/features/students/schemas";
import { stripCpf } from "@/lib/utils";

export default function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const student = useStudent(id);
  const updateStudent = useUpdateStudent(id);

  async function handleSubmit(values: StudentFormValues) {
    await updateStudent.mutateAsync({ ...values, cpf: stripCpf(values.cpf) });
    router.push("/admin/students");
  }

  if (student.isLoading) return <LoadingState />;
  if (student.isError || !student.data) {
    return <ErrorState message="Aluno não encontrado." onRetry={() => student.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={student.data.name}
        description={`Matrícula ${student.data.enrollmentCode}`}
      />
      <StudentForm
        student={student.data}
        onSubmit={handleSubmit}
        isPending={updateStudent.isPending}
      />
    </div>
  );
}
