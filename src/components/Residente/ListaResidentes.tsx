"use client";

import Link from "next/link";
import {
  FiBell,
  FiDollarSign,
  FiEdit2,
  FiMapPin,
  FiTrash2,
} from "react-icons/fi";
import type { Residente } from "@/hooks/useResidentes";
import CardResidenteListagem from "./CardResidenteListagem";
import { Paginacao } from "@/components/Paginacao";

type Props = {
  residentes: Residente[];
  carregando?: boolean;
  paginaAtual: number;
  totalPaginas: number;
  aoMudarPagina: (p: number) => void;
  onEditar?: (r: Residente) => void;
  onExcluir?: (r: Residente) => void;
};

export default function ListaResidentes({
  residentes,
  carregando,
  paginaAtual,
  totalPaginas,
  aoMudarPagina,
  onEditar,
  onExcluir,
}: Props) {
  if (carregando) {
    return (
      <div className="surface-card flex flex-col items-center justify-center gap-3 p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--rc-border)] border-t-[var(--rc-primary)]" />
        <p className="splash-aguardando text-sm font-semibold text-[var(--rc-muted)]">
          Carregando residentes…
        </p>
      </div>
    );
  }

  if (residentes.length === 0) {
    return (
      <div className="surface-card p-8 text-center text-[var(--rc-muted)]">
        Nenhum residente encontrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile: cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {residentes.map((r) => (
          <CardResidenteListagem
            key={r.id}
            residente={r}
            onEditar={onEditar}
            onExcluir={onExcluir}
          />
        ))}
      </div>

      {/* Desktop: lista/tabela */}
      <div className="surface-card hidden overflow-hidden md:block">
        <div className="grid grid-cols-[1.4fr_1.4fr_1fr_1fr_1.6fr] border-b border-[var(--rc-border)] bg-[var(--rc-surface-soft)] px-4 py-2.5 text-sm font-bold text-[var(--rc-primary-strong)]">
          <div>Nome</div>
          <div>E-mail</div>
          <div>CPF</div>
          <div>Telefone</div>
          <div className="text-center">Ações</div>
        </div>
        {residentes.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-[1.4fr_1.4fr_1fr_1fr_1.6fr] items-center border-b border-[var(--rc-border)] px-4 py-3 text-sm last:border-b-0 hover:bg-[var(--rc-surface-soft)]/60"
          >
            <Link
              href={`/residents/${r.id}`}
              className="truncate font-semibold text-[var(--rc-primary-strong)] hover:underline"
            >
              {r.name}
            </Link>
            <div className="truncate text-[var(--rc-muted)]">{r.email}</div>
            <div>{r.cpf || "—"}</div>
            <div>{r.phoneNumber || "—"}</div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <Link
                href={`/residents/${r.id}/pagamentos`}
                className="rounded-md border border-[var(--rc-border)] p-1.5 text-[var(--rc-primary)]"
                title="Pagamentos"
              >
                <FiDollarSign size={14} />
              </Link>
              <Link
                href={`/residents/${r.id}/enderecos`}
                className="rounded-md border border-[var(--rc-border)] p-1.5 text-[var(--rc-primary)]"
                title="Endereços"
              >
                <FiMapPin size={14} />
              </Link>
              <Link
                href={`/residents/${r.id}/avisos`}
                className="rounded-md border border-[var(--rc-border)] p-1.5 text-[var(--rc-primary)]"
                title="Avisos"
              >
                <FiBell size={14} />
              </Link>
              {onEditar ? (
                <button
                  type="button"
                  className="rounded-md border border-[var(--rc-border)] p-1.5 text-[var(--rc-primary)]"
                  onClick={() => onEditar(r)}
                  title="Editar"
                >
                  <FiEdit2 size={14} />
                </button>
              ) : null}
              {onExcluir ? (
                <button
                  type="button"
                  className="rounded-md border border-[var(--rc-border)] p-1.5 text-[var(--rc-danger)]"
                  onClick={() => onExcluir(r)}
                  title="Excluir"
                >
                  <FiTrash2 size={14} />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Paginacao
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        aoMudar={aoMudarPagina}
      />
    </div>
  );
}
