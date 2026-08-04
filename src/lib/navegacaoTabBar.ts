import type { IconType } from "react-icons";
import { FiBell, FiDollarSign, FiHome, FiUsers } from "react-icons/fi";
import { LINKS_MENU_MAIS, type LinkNavegacao } from "./navegacaoLinks";

export interface TabPrimaria {
  label: string;
  labelCurto?: string;
  href: string;
  icone: IconType;
}

export const HREFS_TABS_PRIMARIAS = [
  "/inicio",
  "/residents",
  "/pagamentos",
  "/avisos",
] as const;

export function montarTabsPrimarias(): TabPrimaria[] {
  return [
    { label: "Início", href: "/inicio", icone: FiHome },
    { label: "Residentes", labelCurto: "Residentes", href: "/residents", icone: FiUsers },
    { label: "Pagamentos", labelCurto: "Pagos", href: "/pagamentos", icone: FiDollarSign },
    { label: "Avisos", href: "/avisos", icone: FiBell },
  ];
}

export function montarItensMenuMais(): LinkNavegacao[] {
  return LINKS_MENU_MAIS;
}

export function tabEstaAtiva(pathname: string, href: string): boolean {
  if (!pathname) return false;
  if (href === "/inicio") {
    return pathname === "/" || pathname === "/inicio" || pathname.startsWith("/inicio/");
  }
  if (href === "/residents") {
    return pathname === "/residents" || pathname.startsWith("/residents/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
