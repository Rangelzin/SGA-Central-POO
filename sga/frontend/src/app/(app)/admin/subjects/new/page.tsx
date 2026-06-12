"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SubjectForm } from "@/features/subjects/subject-form";
import { useCreateSubject } from "@/features/subjects/hooks";
import type { SubjectFormValues } from "@/features/subjects/schemas";

export default function NewSubjectPage() {
  const router = useRouter();
  const createSubject = useCreateSubject();

  async function handleSubmit(values: SubjectFormValues) {
    await createSubject.mutateAsync(values);
    router.push("/admin/subjects");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova disciplina"
        description="A disciplina nasce inativa; ative-a após definir o professor responsável."
      />
      <SubjectForm onSubmit={handleSubmit} isPending={createSubject.isPending} />
    </div>
  );
}
