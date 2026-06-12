"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ClassForm } from "@/features/classes/class-form";
import { useCreateClass } from "@/features/classes/hooks";
import type { ClassFormValues } from "@/features/classes/schemas";

export default function NewClassPage() {
  const router = useRouter();
  const createClass = useCreateClass();

  async function handleSubmit(values: ClassFormValues) {
    await createClass.mutateAsync(values);
    router.push("/admin/classes");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova turma"
        description="Oferte uma disciplina em um período letivo."
      />
      <ClassForm onSubmit={handleSubmit} isPending={createClass.isPending} />
    </div>
  );
}
