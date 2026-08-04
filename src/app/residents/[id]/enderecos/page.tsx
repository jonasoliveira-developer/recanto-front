"use client";

import Link from "next/link";
import { useResidenteFicha } from "@/context/ResidenteFichaContext";

export default function FichaEnderecosPage() {
  const { id, enderecos } = useResidenteFicha();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[var(--rc-primary-strong)]">
          Endereços do residente
        </h2>
        <Link
          href={`/enderecos?residentId=${id}`}
          className="text-sm font-semibold text-[var(--rc-primary)] hover:underline"
        >
          Abrir módulo completo
        </Link>
      </div>
      {enderecos.length === 0 ? (
        <div className="surface-card p-6 text-center text-[var(--rc-muted)]">
          Nenhum endereço cadastrado.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {enderecos.map((e) => (
            <li key={e.id} className="surface-card p-4">
              <p className="font-semibold text-[var(--rc-primary-strong)]">
                {e.adress || "—"}
              </p>
              <p className="text-sm text-[var(--rc-muted)]">{e.personName}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
