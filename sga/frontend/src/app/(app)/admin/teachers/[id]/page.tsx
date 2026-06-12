"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { TeacherForm } from "@/features/teachers/teacher-form";
import { useTeacher, useUpdateTeacher } from "@/features/teachers/hooks";
import type { TeacherFormValues } from "@/features/teachers/schemas";
import { stripCpf } from "@/lib/utils";

export default function EditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const teacher = useTeacher(id);
  const updateTeacher = useUpdateTeacher(id);

  async function handleSubmit(values: TeacherFormValues) {
    await updateTeacher.mutateAsync({ ...values, cpf: stripCpf(values.cpf) });
    router.push("/admin/teachers");
  }

  if (teacher.isLoading) return <LoadingState />;
  if (teacher.isError || !teacher.data) {
    return (
      <ErrorState message="Professor não encontrado." onRetry={() => teacher.refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={teacher.data.name}
        description={`${teacher.data.title} · ${teacher.data.department.name}`}
      />
      <TeacherForm
        teacher={teacher.data}
        onSubmit={handleSubmit}
        isPending={updateTeacher.isPending}
      />
    </div>
  );
}
