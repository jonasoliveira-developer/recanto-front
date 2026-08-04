"use client";

import Link from "next/link";
import { useResidenteFicha } from "@/context/ResidenteFichaContext";
import { formatarMoeda } from "@/lib/derivados";

export default function FichaPagamentosPage() {
  const { id, pagamentos } = useResidenteFicha();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[var(--rc-primary-strong)]">
          Pagamentos do residente
        </h2>
        <Link
          href={`/pagamentos?residentId=${id}`}
          className="text-sm font-semibold text-[var(--rc-primary)] hover:underline"
        >
          Abrir módulo completo
        </Link>
      </div>
      {pagamentos.length === 0 ? (
        <div className="surface-card p-6 text-center text-[var(--rc-muted)]">
          Nenhum pagamento para este residente.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {pagamentos.map((p) => (
            <li key={p.id} className="surface-card flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--rc-primary-strong)]">{p.title}</p>
                <p className="text-sm text-[var(--rc-muted)]">
                  {String(p.datePayment || "").split("T")[0]} ·{" "}
                  {String(p.situation) === "1" ? "Pago" : "Em aberto"}
                </p>
                <p className="text-xs text-[var(--rc-muted)]">{p.adress || "—"}</p>
              </div>
              <p className="text-lg font-bold">{formatarMoeda(Number(p.cash || 0))}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
