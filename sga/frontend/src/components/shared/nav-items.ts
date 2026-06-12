import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/domain";
import { hasPermission, type Permission } from "@/lib/auth/rbac";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}

/** Sidebar derivada do mapa de permissões do RBAC (seção 10 do plano). */
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
  { label: "Alunos", href: "/admin/students", icon: GraduationCap, permission: "students:manage" },
  { label: "Professores", href: "/admin/teachers", icon: Users, permission: "teachers:manage" },
  { label: "Disciplinas", href: "/admin/subjects", icon: BookOpen, permission: "subjects:manage" },
  { label: "Turmas", href: "/admin/classes", icon: CalendarDays, permission: "classes:manage" },
  { label: "Minhas turmas", href: "/teacher/classes", icon: BookOpen, permission: "grades:manage" },
  { label: "Matrícula", href: "/student/enrollment", icon: ClipboardList, permission: "enrollment:self" },
  { label: "Notas e frequência", href: "/student/grades", icon: FileText, permission: "grades:self" },
  { label: "Histórico escolar", href: "/student/transcript", icon: ScrollText, permission: "transcript:self" },
];

export function navItemsFor(role: Role): NavItem[] {
  return navItems.filter((item) => hasPermission(role, item.permission));
}
