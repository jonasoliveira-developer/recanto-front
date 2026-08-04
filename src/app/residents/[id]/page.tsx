"use client";

import Link from "next/link";
import { useResidenteFicha } from "@/context/ResidenteFichaContext";
import { formatarMoeda, calcularKpiFinanceiro } from "@/lib/derivados";
import {
  FiBell,
  FiDollarSign,
  FiMapPin,
  FiAlertCircle,
  FiUser,
} from "react-icons/fi";

export default function FichaResumoPage() {
  const { id, residente, pagamentos, enderecos, avisos, ocorrencias } =
    useResidenteFicha();
  const kpi = calcularKpiFinanceiro(pagamentos);

  if (!residente) return null;

  const atalhos = [
    {
      href: `/residents/${id}/pagamentos`,
      label: "Pagamentos",
      valor: String(pagamentos.length),
      icone: FiDollarSign,
      detalhe: formatarMoeda(kpi.totalAberto) + " em aberto",
    },
    {
      href: `/residents/${id}/enderecos`,
      label: "Endereços",
      valor: String(enderecos.length),
      icone: FiMapPin,
      detalhe: enderecos[0]?.adress || "Sem endereço",
    },
    {
      href: `/residents/${id}/avisos`,
      label: "Avisos",
      valor: String(avisos.length),
      icone: FiBell,
      detalhe: avisos[0]?.title || "Nenhum aviso",
    },
    {
      href: `/residents/${id}/ocorrencias`,
      label: "Ocorrências",
      valor: String(ocorrencias.length),
      icone: FiAlertCircle,
      detalhe: ocorrencias[0]?.title || "Nenhuma ocorrência",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <section className="surface-card p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-[var(--rc-primary)]">
          <FiUser size={18} />
          <h2 className="font-bold">Dados principais</h2>
        </div>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold text-[var(--rc-muted)]">CPF</dt>
            <dd>{residente.cpf || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-[var(--rc-muted)]">
              Telefone
            </dt>
            <dd>{residente.phoneNumber || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-[var(--rc-muted)]">
              E-mail
            </dt>
            <dd>{residente.email || "—"}</dd>
          </div>
        </dl>
        <Link
          href={`/residents/${id}/dados`}
          className="btn btn-secondary mt-4 inline-flex"
        >
          Editar dados
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {atalhos.map((a) => {
          const Icone = a.icone;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="surface-card flex flex-col gap-1 p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-bold text-[var(--rc-primary-strong)]">
                  <Icone size={16} />
                  {a.label}
                </span>
                <span className="text-xl font-extrabold text-[var(--rc-primary)]">
                  {a.valor}
                </span>
              </div>
              <p className="truncate text-sm text-[var(--rc-muted)]">
                {a.detalhe}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="surface-card p-4">
        <h2 className="mb-3 font-bold text-[var(--rc-primary-strong)]">
          Últimos pagamentos
        </h2>
        {pagamentos.length === 0 ? (
          <p className="text-sm text-[var(--rc-muted)]">Nenhum pagamento.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pagamentos.slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 border-b border-[var(--rc-border)] pb-2 text-sm last:border-0"
              >
                <span className="truncate font-medium">{p.title}</span>
                <span className="shrink-0 font-semibold">
                  {formatarMoeda(Number(p.cash || 0))}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/pagamentos?residentId=${id}`}
          className="mt-3 inline-block text-sm font-semibold text-[var(--rc-primary)] hover:underline"
        >
          Ver todos no módulo →
        </Link>
      </section>
    </div>
  );
}
