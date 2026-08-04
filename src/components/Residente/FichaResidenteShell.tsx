"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useResidenteFicha } from "@/context/ResidenteFichaContext";

const SECOES = [
  { href: "", label: "Resumo" },
  { href: "/dados", label: "Dados" },
  { href: "/pagamentos", label: "Pagamentos" },
  { href: "/enderecos", label: "Endereços" },
  { href: "/avisos", label: "Avisos" },
  { href: "/ocorrencias", label: "Ocorrências" },
] as const;

export default function FichaResidenteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { residente, carregando, id } = useResidenteFicha();
  const pathname = usePathname() ?? "";
  const base = `/residents/${id}`;

  if (carregando && !residente) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--rc-border)] border-t-[var(--rc-primary)]" />
        <p className="splash-aguardando text-sm text-[var(--rc-muted)]">
          Carregando ficha…
        </p>
      </div>
    );
  }

  if (!residente) {
    return (
      <div className="surface-card p-8 text-center">
        <p className="mb-4 text-[var(--rc-muted)]">Residente não encontrado.</p>
        <Link href="/inicio" className="btn btn-primary">
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell flex flex-col gap-4">
      <header className="surface-card p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--rc-muted)]">
              Ficha 360
            </p>
            <h1 className="text-2xl font-extrabold text-[var(--rc-primary-strong)]">
              {residente.name}
            </h1>
            <p className="text-sm text-[var(--rc-muted)]">{residente.email}</p>
          </div>
          <Link href="/inicio" className="btn btn-secondary self-start sm:self-auto">
            Voltar
          </Link>
        </div>
        <nav
          className="-mx-1 mt-4 flex gap-1 overflow-x-auto px-1 pb-1"
          aria-label="Seções da ficha"
        >
          {SECOES.map((sec) => {
            const href = `${base}${sec.href}`;
            const ativo =
              sec.href === ""
                ? pathname === base || pathname === `${base}/`
                : pathname.startsWith(href);
            return (
              <Link
                key={sec.href || "resumo"}
                href={href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  ativo
                    ? "bg-[var(--rc-primary)] text-white"
                    : "text-[var(--rc-primary)] hover:bg-[var(--rc-surface-soft)]"
                }`}
              >
                {sec.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
