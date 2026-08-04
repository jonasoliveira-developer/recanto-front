"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useResidentes } from "@/hooks/useResidentes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useAvisos } from "@/hooks/useAvisos";
import { useOcorrencias } from "@/hooks/useOcorrencias";
import { calcularKpiFinanceiro, formatarMoeda } from "@/lib/derivados";
import { filtrarPagamentosPorPeriodo, filtrarPorSituacao } from "@/lib/filtros";
import { nomeExibicaoUsuario } from "@/lib/usuarioExibicao";
import ModalResidenteForm from "@/components/Residente/ModalResidenteForm";
import {
  FiAlertCircle,
  FiBell,
  FiDollarSign,
  FiPlus,
  FiUsers,
} from "react-icons/fi";

const MESES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function InicioPageClient() {
  const { usuario } = useAuth();
  const { residentes, carregando, recarregar } = useResidentes();
  const { pagamentos, carregando: carregandoPag } = usePagamentos();
  const { avisos, carregando: carregandoAvisos } = useAvisos();
  const { ocorrencias, carregando: carregandoOcorrencias } = useOcorrencias();
  const [modalAberto, setModalAberto] = useState(false);

  const nomeUsuario = nomeExibicaoUsuario(usuario);

  const hoje = useMemo(() => new Date(), []);
  const mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
  const anoAtual = String(hoje.getFullYear());
  const labelMes = `${MESES_PT[hoje.getMonth()]} de ${anoAtual}`;
  const dataHoje = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const pagamentosDoMes = useMemo(
    () =>
      filtrarPagamentosPorPeriodo(
        pagamentos,
        mesAtual,
        anoAtual,
        mesAtual,
        anoAtual
      ),
    [pagamentos, mesAtual, anoAtual]
  );

  const kpi = useMemo(
    () => calcularKpiFinanceiro(pagamentosDoMes),
    [pagamentosDoMes]
  );

  const abertosDoMes = useMemo(
    () => filtrarPorSituacao(pagamentosDoMes, "0"),
    [pagamentosDoMes]
  );

  const ocorrenciasAbertas = useMemo(
    () =>
      ocorrencias.filter((o) => {
        const s = String(o.situation ?? "").toLowerCase();
        return s === "0" || s === "aberto" || s === "aberta" || s === "";
      }),
    [ocorrencias]
  );

  const avisosRecentes = avisos.slice(0, 4);
  const abertosRecentes = abertosDoMes.slice(0, 5);

  return (
    <div className="page-shell flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--rc-primary-strong)] sm:text-3xl">
            Olá, {nomeUsuario}
          </h1>
          <p className="mt-1 capitalize text-sm text-[var(--rc-muted)]">
            {dataHoje}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary inline-flex gap-2"
            onClick={() => setModalAberto(true)}
          >
            <FiPlus size={18} />
            Adicionar residente
          </button>
          <Link href="/pagamentos" className="btn btn-secondary inline-flex gap-2">
            <FiDollarSign size={18} />
            Pagamentos
          </Link>
          <Link href="/avisos" className="btn btn-secondary inline-flex gap-2">
            <FiBell size={18} />
            Avisos
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/pagamentos"
          className="surface-card flex flex-col gap-2 p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[var(--rc-primary)]">
              <FiDollarSign size={22} />
              <h2 className="text-lg font-bold">Financeiro</h2>
            </div>
            <span className="rounded-full bg-[var(--rc-surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--rc-primary)]">
              {labelMes}
            </span>
          </div>
          {carregandoPag ? (
            <p className="splash-aguardando text-sm text-[var(--rc-muted)]">
              Carregando…
            </p>
          ) : (
            <>
              <p className="text-2xl font-extrabold text-[var(--rc-primary-strong)]">
                {formatarMoeda(kpi.totalRecebido)}
              </p>
              <p className="text-sm text-[var(--rc-muted)]">
                Recebido · {kpi.qtdAbertos} em aberto (
                {formatarMoeda(kpi.totalAberto)})
              </p>
            </>
          )}
        </Link>

        <Link
          href="/residents"
          className="surface-card flex flex-col gap-2 p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-[var(--rc-primary)]">
            <FiUsers size={22} />
            <h2 className="text-lg font-bold">Residentes</h2>
          </div>
          {carregando ? (
            <p className="splash-aguardando text-sm text-[var(--rc-muted)]">
              Carregando…
            </p>
          ) : (
            <>
              <p className="text-2xl font-extrabold text-[var(--rc-primary-strong)]">
                {residentes.length}
              </p>
              <p className="text-sm text-[var(--rc-muted)]">
                Cadastrados · abrir lista completa
              </p>
            </>
          )}
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/pagamentos"
          className="surface-card p-4 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--rc-muted)]">
            Em aberto no mês
          </p>
          <p className="mt-1 text-xl font-extrabold text-[var(--rc-warning)]">
            {carregandoPag ? "…" : kpi.qtdAbertos}
          </p>
          <p className="text-xs text-[var(--rc-muted)]">
            {formatarMoeda(kpi.totalAberto)}
          </p>
        </Link>

        <Link
          href="/ocorrencias"
          className="surface-card p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-1.5 text-[var(--rc-muted)]">
            <FiAlertCircle size={14} />
            <p className="text-xs font-semibold uppercase tracking-wide">
              Ocorrências
            </p>
          </div>
          <p className="mt-1 text-xl font-extrabold text-[var(--rc-primary-strong)]">
            {carregandoOcorrencias ? "…" : ocorrenciasAbertas.length}
          </p>
          <p className="text-xs text-[var(--rc-muted)]">
            {ocorrencias.length} no total
          </p>
        </Link>

        <Link
          href="/avisos"
          className="surface-card p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-1.5 text-[var(--rc-muted)]">
            <FiBell size={14} />
            <p className="text-xs font-semibold uppercase tracking-wide">Avisos</p>
          </div>
          <p className="mt-1 text-xl font-extrabold text-[var(--rc-primary-strong)]">
            {carregandoAvisos ? "…" : avisos.length}
          </p>
          <p className="text-xs text-[var(--rc-muted)]">Publicados</p>
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="surface-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-bold text-[var(--rc-primary-strong)]">
              Pagamentos em aberto
            </h2>
            <Link
              href="/pagamentos"
              className="text-sm font-semibold text-[var(--rc-primary)] hover:underline"
            >
              Ver todos
            </Link>
          </div>
          {carregandoPag ? (
            <p className="splash-aguardando text-sm text-[var(--rc-muted)]">
              Carregando…
            </p>
          ) : abertosRecentes.length === 0 ? (
            <p className="text-sm text-[var(--rc-muted)]">
              Nenhum pagamento em aberto neste mês.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {abertosRecentes.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 border-b border-[var(--rc-border)] pb-2 text-sm last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.title || "Sem título"}</p>
                    <p className="truncate text-xs text-[var(--rc-muted)]">
                      {p.personName || "—"}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-[var(--rc-warning)]">
                    {formatarMoeda(Number(p.cash || 0))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-bold text-[var(--rc-primary-strong)]">
              Últimos avisos
            </h2>
            <Link
              href="/avisos"
              className="text-sm font-semibold text-[var(--rc-primary)] hover:underline"
            >
              Ver todos
            </Link>
          </div>
          {carregandoAvisos ? (
            <p className="splash-aguardando text-sm text-[var(--rc-muted)]">
              Carregando…
            </p>
          ) : avisosRecentes.length === 0 ? (
            <p className="text-sm text-[var(--rc-muted)]">Nenhum aviso publicado.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {avisosRecentes.map((a) => (
                <li
                  key={a.id}
                  className="border-b border-[var(--rc-border)] pb-2 text-sm last:border-0 last:pb-0"
                >
                  <p className="font-medium">{a.title || "Sem título"}</p>
                  <p className="line-clamp-2 text-xs text-[var(--rc-muted)]">
                    {a.description || "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ModalResidenteForm
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        editando={null}
        onSalvo={async () => {
          await recarregar();
        }}
      />
    </div>
  );
}
