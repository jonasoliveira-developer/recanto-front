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

type Props = {
  residente: Residente;
  onEditar?: (r: Residente) => void;
  onExcluir?: (r: Residente) => void;
  compacto?: boolean;
};

export default function CardResidenteListagem({
  residente,
  onEditar,
  onExcluir,
  compacto = false,
}: Props) {
  const id = residente.id;

  return (
    <article className="surface-card flex flex-col gap-3 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/residents/${id}`} className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-[var(--rc-primary-strong)]">
            {residente.name || "Sem nome"}
          </h3>
          <p className="mt-0.5 truncate text-sm text-[var(--rc-muted)]">
            {residente.email}
          </p>
        </Link>
        <div className="flex shrink-0 gap-1">
          {onEditar ? (
            <button
              type="button"
              className="rounded-lg border border-[var(--rc-border)] p-2 text-[var(--rc-primary)] hover:bg-[var(--rc-surface-soft)]"
              aria-label="Editar"
              onClick={() => onEditar(residente)}
            >
              <FiEdit2 size={16} />
            </button>
          ) : null}
          {onExcluir ? (
            <button
              type="button"
              className="rounded-lg border border-[var(--rc-border)] p-2 text-[var(--rc-danger)] hover:bg-red-50"
              aria-label="Excluir"
              onClick={() => onExcluir(residente)}
            >
              <FiTrash2 size={16} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-[var(--foreground)]">
        <div>
          <span className="text-xs font-semibold text-[var(--rc-muted)]">CPF</span>
          <p>{residente.cpf || "—"}</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-[var(--rc-muted)]">Telefone</span>
          <p>{residente.phoneNumber || "—"}</p>
        </div>
      </div>

      {!compacto ? (
        <div className="flex flex-wrap gap-2 border-t border-[var(--rc-border)] pt-3">
          <Link
            href={`/residents/${id}/pagamentos`}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--rc-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--rc-primary)]"
          >
            <FiDollarSign size={14} /> Pagamentos
          </Link>
          <Link
            href={`/residents/${id}/enderecos`}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--rc-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--rc-primary)]"
          >
            <FiMapPin size={14} /> Endereços
          </Link>
          <Link
            href={`/residents/${id}/avisos`}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--rc-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--rc-primary)]"
          >
            <FiBell size={14} /> Avisos
          </Link>
        </div>
      ) : null}
    </article>
  );
}
