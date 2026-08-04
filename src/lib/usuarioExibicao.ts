/** Nome amigável a partir do que a auth guarda em `usuario.email` (na prática o nome do login). */
export function nomeExibicaoUsuario(usuario: { email?: string } | null | undefined): string {
  const raw = (usuario?.email || "").trim();
  if (!raw) return "usuário";
  const base = raw.includes("@") ? raw.split("@")[0] : raw;
  const limpo = base.replace(/[._-]+/g, " ").trim();
  if (!limpo) return "usuário";
  return limpo
    .split(/\s+/)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
    .join(" ");
}
