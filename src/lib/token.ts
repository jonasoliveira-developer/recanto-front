import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  exp?: number;
};

export function tokenEstaExpirado(token: string | null | undefined): boolean {
  if (!token) return true;
  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now() + 10_000;
  } catch {
    return true;
  }
}

/** ms até expirar; null se sem exp; 0 se já expirou/inválido */
export function msAteExpirar(token: string): number | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (!payload.exp) return null;
    return Math.max(0, payload.exp * 1000 - Date.now());
  } catch {
    return 0;
  }
}

export function limparSessaoLocal() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("id");
  localStorage.removeItem("user");
  localStorage.removeItem("roles");
}

export const EVENTO_SESSAO_EXPIRADA = "recanto:sessao-expirada";

export function emitirSessaoExpirada() {
  if (typeof window === "undefined") return;
  limparSessaoLocal();
  window.dispatchEvent(new CustomEvent(EVENTO_SESSAO_EXPIRADA));
  if (!window.location.pathname.startsWith("/login")) {
    window.location.replace("/login");
  }
}
