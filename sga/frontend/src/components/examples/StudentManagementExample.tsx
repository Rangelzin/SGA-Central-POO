"use client";

import { useCallback, useEffect, useState } from "react";
import { studentService } from "@/lib/api/services";
import type { Student } from "@/types/domain";
import type { Page, StudentInput } from "@/types/api";
import { getApiMessage, getApiFieldErrors } from "@/lib/api/client";

interface StudentFormData {
  name: string;
  cpf: string;
  email: string;
  birthDate: string;
  courseId: string;
}

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    cpf: "",
    email: "",
    birthDate: "",
    courseId: "",
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response: Page<Student> = await studentService.list({
        page: 0,
        size: 20,
      });
      setStudents(response.content);
    } catch (err) {
      setError(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setError("");

    try {
      setLoading(true);
      const input: StudentInput = {
        name: formData.name,
        cpf: formData.cpf,
        email: formData.email,
        birthDate: formData.birthDate,
        courseId: formData.courseId,
      };

      await studentService.create(input);

      setFormData({
        name: "",
        cpf: "",
        email: "",
        birthDate: "",
        courseId: "",
      });

      await fetchStudents();
    } catch (err) {
      const message = getApiMessage(err);
      const errors = getApiFieldErrors(err);

      if (errors.length > 0) {
        const errorMap = errors.reduce(
          (acc, { field, message }) => {
            acc[field] = message;
            return acc;
          },
          {} as Record<string, string>
        );
        setFieldErrors(errorMap);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este aluno?")) return;

    try {
      setLoading(true);
      await studentService.delete(id);
      await fetchStudents();
    } catch (err) {
      setError(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-bold">Criar Novo Aluno</h2>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full rounded border px-3 py-2 ${
                fieldErrors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full rounded border px-3 py-2 ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">CPF</label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) =>
                setFormData({ ...formData, cpf: e.target.value })
              }
              className={`w-full rounded border px-3 py-2 ${
                fieldErrors.cpf ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.cpf && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.cpf}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Data de Nascimento</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              className={`w-full rounded border px-3 py-2 ${
                fieldErrors.birthDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.birthDate && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.birthDate}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Criar Aluno"}
          </button>
        </form>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-bold">Alunos Cadastrados</h2>

        {loading && !students.length && <div>Carregando...</div>}

        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="border p-2 text-left">Nome</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">CPF</th>
                  <th className="border p-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.uuid} className="border-b hover:bg-gray-50">
                    <td className="border p-2">{student.name}</td>
                    <td className="border p-2">{student.email}</td>
                    <td className="border p-2">{student.cpf}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleDeleteStudent(student.uuid)}
                        disabled={loading}
                        className="rounded bg-red-600 px-3 py-1 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-600">Nenhum aluno cadastrado</div>
        )}
      </div>
    </div>
  );
}
