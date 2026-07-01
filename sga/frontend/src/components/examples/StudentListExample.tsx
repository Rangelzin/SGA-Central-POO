"use client";

import { useEffect, useState } from "react";
import { studentService } from "@/lib/api/services";
import type { Student } from "@/types/domain";
import type { Page } from "@/types/api";
import { getApiMessage } from "@/lib/api/client";

export function StudentListExample() {
  const [students, setStudents] = useState<Page<Student> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await studentService.list({ page: 0, size: 20 });
        setStudents(data);
      } catch (err) {
        setError(getApiMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;

  return (
    <div>
      <h1>Alunos Cadastrados</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">Nome</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">CPF</th>
          </tr>
        </thead>
        <tbody>
          {students?.content.map((student) => (
            <tr key={student.uuid}>
              <td className="border p-2">{student.name}</td>
              <td className="border p-2">{student.email}</td>
              <td className="border p-2">{student.cpf}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-gray-600">
        Total: {students?.totalElements} | Página: {(students?.page ?? 0) + 1} de{" "}
        {students?.totalPages}
      </div>
    </div>
  );
}
