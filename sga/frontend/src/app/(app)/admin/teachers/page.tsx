"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getTeacherColumns } from "@/features/teachers/columns";
import { useDeleteTeacher, useTeachers } from "@/features/teachers/hooks";
import { PAGE_SIZE } from "@/lib/constants";
import type { Teacher } from "@/types/domain";

export default function TeachersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const teachers = useTeachers({ page, size: PAGE_SIZE, search });
  const deleteTeacher = useDeleteTeacher();

  const columns = useMemo(
    () => getTeacherColumns({ onDelete: setTeacherToDelete }),
    [],
  );

  function handleConfirmDelete() {
    if (!teacherToDelete) return;
    deleteTeacher.mutate(teacherToDelete.uuid, {
      onSuccess: () => setTeacherToDelete(null),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Professores"
        description="Gerencie os professores cadastrados (RF-02)."
        action={
          <Button asChild>
            <Link href="/admin/teachers/new">
              <Plus className="size-4" aria-hidden />
              Novo professor
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={teachers.data?.content}
        isLoading={teachers.isLoading}
        isError={teachers.isError}
        onRetry={() => teachers.refetch()}
        page={page}
        totalPages={teachers.data?.totalPages ?? 0}
        totalElements={teachers.data?.totalElements ?? 0}
        onPageChange={setPage}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        searchPlaceholder="Buscar por nome ou e-mail"
        emptyTitle="Nenhum professor encontrado"
        emptyDescription={
          search
            ? "Ajuste a busca e tente novamente."
            : "Cadastre o primeiro professor para começar."
        }
        emptyAction={
          !search && (
            <Button asChild size="sm">
              <Link href="/admin/teachers/new">Novo professor</Link>
            </Button>
          )
        }
      />

      <ConfirmDialog
        open={Boolean(teacherToDelete)}
        onOpenChange={(open) => !open && setTeacherToDelete(null)}
        title="Remover professor"
        description={`Tem certeza que deseja remover ${teacherToDelete?.name}?`}
        isPending={deleteTeacher.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
