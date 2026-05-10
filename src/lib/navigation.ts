import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  HandCoins,
  House,
  ReceiptText,
  Settings,
  ShieldCheck,
  Star,
  UserRoundPlus,
  Users,
  UserSquare2,
  Waypoints,
} from "lucide-react";
import { Role } from "@prisma/client";

export const navigationItems: {
  href: string;
  label: string;
  icon: any;
  section: string | null;
  roles: Role[];
}[] = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: BarChart3,
    section: null,
    roles: [Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT, Role.TRAINER, Role.HR],
  },
  {
    href: "/dashboard/inscriptions",
    label: "Inscriptions",
    icon: UserRoundPlus,
    section: "Formation",
    roles: [Role.ADMIN, Role.MANAGER, Role.TRAINER, Role.HR],
  },
  {
    href: "/dashboard/apprenants",
    label: "Apprenants",
    icon: Users,
    section: "Formation",
    roles: [Role.ADMIN, Role.MANAGER, Role.TRAINER],
  },
  {
    href: "/dashboard/paiements",
    label: "Paiements",
    icon: ReceiptText,
    section: "Formation",
    roles: [Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT],
  },
  {
    href: "/dashboard/notes-evaluations",
    label: "Notes & Évaluations",
    icon: Star,
    section: "Formation",
    roles: [Role.ADMIN, Role.MANAGER, Role.TRAINER],
  },
  {
    href: "/dashboard/gestion-caisse",
    label: "Gestion Caisse",
    icon: HandCoins,
    section: "Formation",
    roles: [Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT],
  },
  {
    href: "/dashboard/documents",
    label: "Documents",
    icon: FileText,
    section: "Formation",
    roles: [Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT, Role.TRAINER],
  },
  {
    href: "/dashboard/services",
    label: "Services",
    icon: BriefcaseBusiness,
    section: "Services Ménagers",
    roles: [Role.ADMIN, Role.MANAGER, Role.HR],
  },
  {
    href: "/dashboard/employes",
    label: "Employés",
    icon: UserSquare2,
    section: "Services Ménagers",
    roles: [Role.ADMIN, Role.MANAGER, Role.HR],
  },
  {
    href: "/dashboard/foyers",
    label: "Foyers",
    icon: House,
    section: "Services Ménagers",
    roles: [Role.ADMIN, Role.MANAGER, Role.HR],
  },
  {
    href: "/dashboard/affectations",
    label: "Employés & Foyers",
    icon: Waypoints,
    section: "Services Ménagers",
    roles: [Role.ADMIN, Role.MANAGER, Role.HR],
  },
  {
    href: "/dashboard/certificats",
    label: "Certificats",
    icon: BadgeCheck,
    section: "Documents",
    roles: [Role.ADMIN, Role.MANAGER, Role.TRAINER],
  },
  {
    href: "/dashboard/formations",
    label: "Formations",
    icon: GraduationCap,
    section: "Documents",
    roles: [Role.ADMIN, Role.MANAGER, Role.TRAINER],
  },
  {
    href: "/dashboard/parametres",
    label: "Paramètres",
    icon: Settings,
    section: "Configuration",
    roles: [Role.ADMIN],
  },
  {
    href: "/dashboard/securite",
    label: "Utilisateurs & Roles",
    icon: ShieldCheck,
    section: "Configuration",
    roles: [Role.ADMIN],
  },
];
