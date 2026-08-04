"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { atualizarAviso, removerAviso, criarAviso } from "@/services/avisosApi";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/Modal";
import { Paginacao } from "@/components/Paginacao";
import { useAvisos } from "@/hooks/useAvisos";
import { filtrarPorBusca, filtrarPorResidente, paginarLista } from "@/lib/filtros";

function AvisosClient() {
  const searchParams = useSearchParams();
  const residentIdFiltro = searchParams.get("residentId");
  const { avisos, carregando, recarregar } = useAvisos();
  const [modalAberto, definirModalAberto] = useState(false);
  const [busca, definirBusca] = useState("");
  const [paginaAtual, definirPaginaAtual] = useState(1);
  const [editando, setEditando] = useState<any | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    personName: "",
    openDate: "",
  });
  const itensPorPagina = 10;
  const { token } = useAuth();

  const avisosFiltrados = useMemo(() => {
    let lista = filtrarPorResidente(avisos, residentIdFiltro);
    return filtrarPorBusca(lista, busca, ["title", "description", "personName"]);
  }, [avisos, busca, residentIdFiltro]);

  const { itens: avisosPaginados, totalPaginas } = paginarLista(
    avisosFiltrados,
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

  function abrirModalNovo() {
    setEditando(null);
    setForm({ title: "", description: "", personName: "", openDate: "" });
    definirModalAberto(true);
  }

  function formatarData(data: string) {
    if (!data) return "";
    const d = new Date(data);
    if (isNaN(d.getTime())) return data;
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  function abrirModalEditar(aviso: any) {
    setEditando(aviso);
    setForm({
      title: aviso.title || "",
      description: aviso.description || "",
      personName: aviso.personName || "",
      openDate: formatarData(aviso.openDate),
    });
    definirModalAberto(true);
  }

  function aoMudarForm(e: React.ChangeEvent<HTMLInputElement>) {
    const campo =
      e.target.placeholder === "Data de abertura"
        ? "openDate"
        : e.target.placeholder === "Título"
          ? "title"
          : e.target.placeholder === "Descrição"
            ? "description"
            : "personName";
    setForm({ ...form, [campo]: e.target.value });
  }

  async function aoExcluir(avisoId: number) {
    if (!token) return;
    await removerAviso(avisoId, token);
    await recarregar();
  }

  async function aoSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      definirModalAberto(false);
      setEditando(null);
      return;
    }
    const id = localStorage.getItem("id");
    const userName = localStorage.getItem("user");
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, "0");
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const ano = hoje.getFullYear();
    const dateOpen = `${dia}/${mes}/${ano}`;
    const payload = {
      ...form,
      person: residentIdFiltro
        ? Number(residentIdFiltro)
        : id
          ? Number(id)
          : undefined,
      personName: userName,
      dateOpen,
    };
    try {
      if (editando) {
        await atualizarAviso(editando.id, payload, token);
      } else {
        await criarAviso(payload, token);
      }
      await recarregar();
      definirModalAberto(false);
      setEditando(null);
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => alert(err.message));
      } else {
        alert(error?.response?.data?.message || "Erro ao salvar aviso");
      }
    }
  }

  return (
    <div className="page-shell">
      <header className="page-header w-full max-w-xl mx-auto">
        <h1 className="page-title w-full sm:w-auto text-center sm:text-left">
          Avisos
        </h1>
        <button
          className="btn btn-primary w-full sm:w-auto"
          onClick={abrirModalNovo}
        >
          Novo aviso
        </button>
      </header>
      {residentIdFiltro ? (
        <p className="mx-auto mb-3 max-w-xl rounded-lg border border-[var(--rc-border)] bg-[var(--rc-surface-soft)] px-3 py-2 text-sm text-[var(--rc-primary)]">
          Filtrando pelo residente #{residentIdFiltro}.{" "}
          <a href="/avisos" className="font-bold underline">
            Limpar filtro
          </a>
        </p>
      ) : null}
      <div className="mb-4 flex justify-end w-full max-w-xl mx-auto">
        <input
          type="text"
          value={busca}
          onChange={aoBuscar}
          placeholder="Buscar por título, descrição ou autor"
          className="input-base"
        />
      </div>
      <section className="surface-card p-4 w-full max-w-xl mx-auto">
        {carregando ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--rc-border)] border-t-[var(--rc-primary)]" />
            <p className="splash-aguardando text-sm text-[var(--rc-muted)]">
              Carregando…
            </p>
          </div>
        ) : avisosFiltrados.length === 0 ? (
          <p className="text-center text-[var(--rc-muted)]">
            Nenhum aviso encontrado.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-4 w-full">
              {avisosPaginados.map((aviso) => (
                <li key={aviso.id} className="surface-card p-4 w-full">
                  <h2 className="text-lg font-semibold text-[var(--rc-primary-strong)]">
                    {aviso.title}
                  </h2>
                  <p className="text-sm text-[var(--rc-muted)]">
                    {aviso.description}
                  </p>
                  <p className="text-sm text-[var(--rc-muted)]">
                    Autor: {aviso.personName}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="btn btn-secondary !min-h-[36px] px-3 py-1 text-sm"
                      onClick={() => abrirModalEditar(aviso)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger !min-h-[36px] px-3 py-1 text-sm"
                      onClick={() => aoExcluir(aviso.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              aoMudar={aoMudarPagina}
            />
          </>
        )}
      </section>
      <Modal
        aberto={modalAberto}
        aoFechar={() => {
          definirModalAberto(false);
          setEditando(null);
        }}
        titulo={editando ? "Editar aviso" : "Cadastrar aviso"}
      >
        <form className="flex flex-col gap-3" onSubmit={aoSalvar}>
          <input
            className="input-base"
            placeholder="Título"
            value={form.title}
            onChange={aoMudarForm}
          />
          <input
            className="input-base"
            placeholder="Descrição"
            value={form.description}
            onChange={aoMudarForm}
          />
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default function Avisos() {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-center text-[var(--rc-muted)]">Carregando…</p>
      }
    >
      <AvisosClient />
    </Suspense>
  );
}
