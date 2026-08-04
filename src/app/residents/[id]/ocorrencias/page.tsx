"use client";

import Link from "next/link";
import { useResidenteFicha } from "@/context/ResidenteFichaContext";

export default function FichaOcorrenciasPage() {
  const { id, ocorrencias } = useResidenteFicha();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[var(--rc-primary-strong)]">
          Ocorrências do residente
        </h2>
        <Link
          href={`/ocorrencias?residentId=${id}`}
          className="text-sm font-semibold text-[var(--rc-primary)] hover:underline"
        >
          Abrir módulo completo
        </Link>
      </div>
      {ocorrencias.length === 0 ? (
        <div className="surface-card p-6 text-center text-[var(--rc-muted)]">
          Nenhuma ocorrência vinculada.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {ocorrencias.map((o) => (
            <li key={o.id} className="surface-card p-4">
              <p className="font-semibold text-[var(--rc-primary-strong)]">
                {o.title}
              </p>
              <p className="mt-1 text-sm text-[var(--rc-muted)]">
                {o.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
