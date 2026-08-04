"use client";

import Link from "next/link";
import { useResidenteFicha } from "@/context/ResidenteFichaContext";

export default function FichaAvisosPage() {
  const { id, avisos } = useResidenteFicha();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[var(--rc-primary-strong)]">
          Avisos do residente
        </h2>
        <Link
          href={`/avisos?residentId=${id}`}
          className="text-sm font-semibold text-[var(--rc-primary)] hover:underline"
        >
          Abrir módulo completo
        </Link>
      </div>
      {avisos.length === 0 ? (
        <div className="surface-card p-6 text-center text-[var(--rc-muted)]">
          Nenhum aviso vinculado.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {avisos.map((a) => (
            <li key={a.id} className="surface-card p-4">
              <p className="font-semibold text-[var(--rc-primary-strong)]">
                {a.title}
              </p>
              <p className="mt-1 text-sm text-[var(--rc-muted)]">
                {a.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
