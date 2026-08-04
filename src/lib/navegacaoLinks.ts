export interface LinkNavegacao {
  label: string;
  href: string;
}

export const LINKS_MENU_MAIS: LinkNavegacao[] = [
  { label: "Funcionários", href: "/funcionarios" },
  { label: "Ocorrências", href: "/ocorrencias" },
  { label: "Endereços", href: "/enderecos" },
];

export const ROTAS_SEM_CHROME = ["/login"];
export const ROTAS_PUBLICAS = ["/", "/login"];

export function rotaSemChrome(pathname: string | null): boolean {
  if (!pathname) return false;
  return ROTAS_SEM_CHROME.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );
}

export function rotaPublica(pathname: string | null): boolean {
  if (!pathname) return false;
  return ROTAS_PUBLICAS.some(
    (rota) => pathname === rota || (rota !== "/" && pathname.startsWith(`${rota}/`))
  );
}
