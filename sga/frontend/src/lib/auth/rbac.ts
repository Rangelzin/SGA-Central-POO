import type { Role } from "@/types/domain";

/**
 * RBAC de UX (RNF-02 / seção 10): mapa role → permissões usado para
 * filtrar a sidebar, esconder ações e guardar rotas.
 * A autorização real é responsabilidade do backend.
 */
export type Permission =
  | "dashboard:view"
  | "students:manage"
  | "teachers:manage"
  | "subjects:manage"
  | "classes:manage"
  | "grades:manage"
  | "reports:view"
  | "enrollment:self"
  | "grades:self"
  | "transcript:self";

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    "dashboard:view",
    "students:manage",
    "teachers:manage",
    "subjects:manage",
    "classes:manage",
    "reports:view",
  ],
  TEACHER: ["dashboard:view", "grades:manage", "reports:view"],
  STUDENT: ["dashboard:view", "enrollment:self", "grades:self", "transcript:self"],
};

export function permissionsFor(role: Role): Permission[] {
  return rolePermissions[role];
}

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role].includes(permission);
}

export const roleLabels: Record<Role, string> = {
  ADMIN: "Administrador",
  TEACHER: "Professor",
  STUDENT: "Aluno",
};

/** Rota inicial após o login (todos os perfis abrem no dashboard por role). */
export function homeRouteFor(_role: Role): string {
  return "/dashboard";
}
