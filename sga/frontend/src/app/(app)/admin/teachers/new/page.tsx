"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { TeacherForm } from "@/features/teachers/teacher-form";
import { useCreateTeacher } from "@/features/teachers/hooks";
import type { TeacherFormValues } from "@/features/teachers/schemas";
import { stripCpf } from "@/lib/utils";

export default function NewTeacherPage() {
  const router = useRouter();
  const createTeacher = useCreateTeacher();

  async function handleSubmit(values: TeacherFormValues) {
    await createTeacher.mutateAsync({ ...values, cpf: stripCpf(values.cpf) });
    router.push("/admin/teachers");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Novo professor" description="Cadastre um novo docente." />
      <TeacherForm
        onSubmit={handleSubmit}
        isPending={createTeacher.isPending}
        requirePassword
      />
    </div>
  );
}
