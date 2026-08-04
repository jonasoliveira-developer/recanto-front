"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  removerOcorrencia,
  criarOcorrencia,
  atualizarOcorrencia,
} from "@/services/ocorrenciasApi";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/Modal";
import { Paginacao } from "@/components/Paginacao";
import { useOcorrencias } from "@/hooks/useOcorrencias";
import { filtrarPorBusca, filtrarPorResidente, paginarLista } from "@/lib/filtros";

function OcorrenciasClient() {
  const searchParams = useSearchParams();
  const residentIdFiltro = searchParams.get("residentId");
  const { ocorrencias, carregando, recarregar } = useOcorrencias();
  const [modalAberto, definirModalAberto] = useState(false);
  const [busca, definirBusca] = useState("");
  const [paginaAtual, definirPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const { token } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [situacao, setSituacao] = useState("");
  const [editando, setEditando] = useState<any | null>(null);
  const usuarioId =
    typeof window !== "undefined" ? localStorage.getItem("id") : null;
  const usuarioNome =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;

  const ocorrenciasFiltradas = useMemo(() => {
    let lista = filtrarPorResidente(ocorrencias, residentIdFiltro);
    return filtrarPorBusca(lista, busca, ["title", "description", "situation"]);
  }, [ocorrencias, busca, residentIdFiltro]);

  const { itens: ocorrenciasPaginadas, totalPaginas } = paginarLista(
    ocorrenciasFiltradas,
    paginaAtual,
    itensPorPagina
  );

  function aoMudarPagina(novaPagina: number) {
    definirPaginaAtual(novaPagina);
  }

  function aoBuscar(e: React.ChangeEvent<HTMLInputElement>) {
    definirBusca(e.target.value);
    definirPaginaAtual(1);
  }

  async function aoSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const person = residentIdFiltro
      ? Number(residentIdFiltro)
      : usuarioId
        ? Number(usuarioId)
        : undefined;
    const payload = {
      title: titulo,
      description: descricao,
      situation: situacao,
      person,
      personName: usuarioNome,
    };
    try {
      if (editando) {
        await atualizarOcorrencia(editando.id, payload, token);
      } else {
        await criarOcorrencia(payload, token);
      }
      await recarregar();
      definirModalAberto(false);
      setEditando(null);
      setTitulo("");
      setDescricao("");
      setSituacao("");
    } catch {
      alert("Erro ao salvar ocorrência");
    }
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="page-title text-center sm:text-left">Ocorrencias</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 max-w-4xl w-full mx-auto">
          <input
            type="text"
            value={busca}
            onChange={aoBuscar}
            placeholder="Buscar por título, descrição ou situação"
            className="input-base w-full md:max-w-full md:flex-1 min-w-0"
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditando(null);
              setTitulo("");
              setDescricao("");
              setSituacao("");
              definirModalAberto(true);
            }}
          >
            Nova ocorrencia
          </button>
        </div>
      </header>
      {residentIdFiltro ? (
        <p className="mb-3 rounded-lg border border-[var(--rc-border)] bg-[var(--rc-surface-soft)] px-3 py-2 text-sm text-[var(--rc-primary)]">
          Filtrando pelo residente #{residentIdFiltro}.{" "}
          <a href="/ocorrencias" className="font-bold underline">
            Limpar filtro
          </a>
        </p>
      ) : null}
      <section className="surface-card p-4">
        {carregando ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--rc-border)] border-t-[var(--rc-primary)]" />
            <p className="splash-aguardando text-sm text-[var(--rc-muted)]">
              Carregando…
            </p>
          </div>
        ) : ocorrenciasFiltradas.length === 0 ? (
          <p className="text-center text-[var(--rc-muted)]">
            Nenhuma ocorrencia encontrada.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {ocorrenciasPaginadas.map((o) => (
              <li key={o.id} className="surface-card p-4">
                <h2 className="font-semibold text-[var(--rc-primary-strong)]">
                  {o.title}
                </h2>
                <p className="text-sm text-[var(--rc-muted)]">{o.description}</p>
                <p className="text-xs text-[var(--rc-muted)]">
                  Situação: {String(o.situation ?? "—")}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    className="btn btn-secondary !min-h-[36px] px-3 py-1 text-sm"
                    onClick={() => {
                      setEditando(o);
                      setTitulo(o.title || "");
                      setDescricao(String(o.description || ""));
                      setSituacao(String(o.situation ?? ""));
                      definirModalAberto(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger !min-h-[36px] px-3 py-1 text-sm"
                    onClick={async () => {
                      if (!token) return;
                      if (!window.confirm("Excluir ocorrência?")) return;
                      await removerOcorrencia(o.id, token);
                      await recarregar();
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Paginacao
          paginaAtual={paginaAtual}
          totalPaginas={totalPaginas}
          aoMudar={aoMudarPagina}
        />
      </section>
      <Modal
        aberto={modalAberto}
        aoFechar={() => {
          definirModalAberto(false);
          setEditando(null);
        }}
        titulo={editando ? "Editar ocorrencia" : "Nova ocorrencia"}
      >
        <form className="flex flex-col gap-3" onSubmit={aoSalvar}>
          <input
            className="input-base"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
          <input
            className="input-base"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <input
            className="input-base"
            placeholder="Situação"
            value={situacao}
            onChange={(e) => setSituacao(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default function Ocorrencias() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-[var(--rc-muted)]">Carregando…</p>}>
      <OcorrenciasClient />
    </Suspense>
  );
}
