"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useResidentes, type Residente } from "@/hooks/useResidentes";
import { useAuth } from "@/context/AuthContext";
import { filtrarPorBusca, paginarLista } from "@/lib/filtros";
import ListaResidentes from "@/components/Residente/ListaResidentes";
import ModalResidenteForm from "@/components/Residente/ModalResidenteForm";
import { removerResidente } from "@/services/recantoApi";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";

function ResidentsPageClient() {
  const searchParams = useSearchParams();
  const qInicial = searchParams.get("q") || "";
  const { token } = useAuth();
  const { residentes, carregando, recarregar } = useResidentes();
  const [busca, setBusca] = useState(qInicial);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Residente | null>(null);
  const itensPorPagina = 10;

  useEffect(() => {
    setBusca(qInicial);
    setPaginaAtual(1);
  }, [qInicial]);

  const filtrados = useMemo(
    () =>
      filtrarPorBusca(residentes, busca, [
        "name",
        "email",
        "cpf",
        "phoneNumber",
      ]),
    [residentes, busca]
  );

  const { itens, totalPaginas } = paginarLista(
    filtrados,
    paginaAtual,
    itensPorPagina
  );

  async function excluir(r: Residente) {
    if (!token) return;
    if (!window.confirm(`Excluir residente ${r.name}?`)) return;
    try {
      await removerResidente(r.id, token);
      toast.success("Residente excluído!");
      await recarregar();
    } catch {
      toast.error("Erro ao excluir residente.");
    }
  }

  return (
    <div className="page-shell flex flex-col gap-4">
      <header className="page-header">
        <h1 className="page-title">Residentes</h1>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            className="input-base flex-1"
            placeholder="Buscar por nome, e-mail, CPF ou telefone"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
          />
          <button
            type="button"
            className="btn btn-primary inline-flex gap-2"
            onClick={() => {
              setEditando(null);
              setModalAberto(true);
            }}
          >
            <FiPlus size={18} />
            Novo residente
          </button>
        </div>
      </header>

      <ListaResidentes
        residentes={itens}
        carregando={carregando}
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        aoMudarPagina={setPaginaAtual}
        onEditar={(r) => {
          setEditando(r);
          setModalAberto(true);
        }}
        onExcluir={excluir}
      />

      <ModalResidenteForm
        aberto={modalAberto}
        aoFechar={() => {
          setModalAberto(false);
          setEditando(null);
        }}
        editando={editando}
        onSalvo={async () => {
          await recarregar();
        }}
      />
    </div>
  );
}

export default function ResidentsPage() {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-center text-[var(--rc-muted)]">Carregando…</p>
      }
    >
      <ResidentsPageClient />
    </Suspense>
  );
}
