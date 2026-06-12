"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { ClassForm } from "@/features/classes/class-form";
import { useClass, useUpdateClass } from "@/features/classes/hooks";
import type { ClassFormValues } from "@/features/classes/schemas";

export default function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const classQuery = useClass(id);
  const updateClass = useUpdateClass(id);

  async function handleSubmit(values: ClassFormValues) {
    await updateClass.mutateAsync(values);
    router.push("/admin/classes");
  }

  if (classQuery.isLoading) return <LoadingState />;
  if (classQuery.isError || !classQuery.data) {
    return (
      <ErrorState message="Turma não encontrada." onRetry={() => classQuery.refetch()} />
    );
  }

  const classItem = classQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${classItem.code} — ${classItem.subject.name}`}
        description={`${classItem.term} · Vagas: ${classItem.availableSeats}/${classItem.capacity}`}
        action={
          <Button asChild variant="outline">
            <Link href={`/admin/classes/${classItem.uuid}/report`}>
              <BarChart3 className="size-4" aria-hidden />
              Relatório
            </Link>
          </Button>
        }
      />
      <ClassForm
        classItem={classItem}
        onSubmit={handleSubmit}
        isPending={updateClass.isPending}
      />
    </div>
  );
}
