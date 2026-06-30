"use client";
import { useEffect, useState } from "react";
import { listarPortaria } from "../../services/portariaApi";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";
import { Paginacao } from "../../components/Paginacao";


export default function Portaria() {
  const [registros, definirRegistros] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [busca, definirBusca] = useState("");
  const [paginaAtual, definirPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const { token } = useAuth();

  useEffect(() => {
    async function carregarRegistros() {
      definirCarregando(true);
      try {
        if (!token) {
          definirRegistros([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarPortaria(token);
        definirRegistros(dados);
      } catch {
        definirRegistros([]);
      }
      definirCarregando(false);
    }
    carregarRegistros();
  }, [token]);

  // Filtragem por busca
  const registrosFiltrados = registros.filter((registro) => {
    const termo = busca.toLowerCase();
    return (
      registro.title?.toLowerCase().includes(termo) ||
      registro.name?.toLowerCase().includes(termo) ||
      registro.situation?.toLowerCase().includes(termo)
    );
  });

  // Paginação
  const totalPaginas = Math.ceil(registrosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const registrosPaginados = registrosFiltrados.slice(inicio, fim);

  function aoMudarPagina(novaPagina: number) {
    definirPaginaAtual(novaPagina);
  }

  function aoBuscar(e: React.ChangeEvent<HTMLInputElement>) {
    definirBusca(e.target.value);
    definirPaginaAtual(1);
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="page-title">Portaria</h1>
        <button
          className="btn btn-primary"
          onClick={() => definirModalAberto(true)}
        >
          Novo registro
        </button>
      </header>
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          value={busca}
          onChange={aoBuscar}
          placeholder="Buscar por título, visitante ou situação"
          className="input-base w-full max-w-xs"
        />
      </div>
      <section className="surface-card p-4">
        {carregando ? (
          <p className="text-center text-[var(--rc-muted)]">Carregando...</p>
        ) : registrosFiltrados.length === 0 ? (
          <p className="text-center text-[var(--rc-muted)]">Nenhum registro encontrado.</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {registrosPaginados.map((registro) => (
                <li key={registro.id} className="surface-card p-4">
                  <h2 className="text-lg font-semibold text-[var(--rc-primary-strong)]">{registro.title}</h2>
                  <p className="text-sm text-[var(--rc-muted)]">Visitante: {registro.name}</p>
                  <p className="text-sm text-[var(--rc-muted)]">Situacao: {registro.situation}</p>
                  <button className="btn btn-secondary mt-2 !min-h-[36px] px-3 py-1 text-sm">Editar</button>
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
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar registro de portaria">
        {/* Formulário de cadastro aqui */}
        <form className="flex flex-col gap-3">
          <input className="input-base" placeholder="Titulo" />
          <input className="input-base" placeholder="Nome do visitante" />
          <input className="input-base" placeholder="Documento" />
          <input className="input-base" placeholder="Carro" />
          <input className="input-base" placeholder="Descricao" />
          <input className="input-base" placeholder="Situacao" />
          <input className="input-base" placeholder="Nome do responsavel" />
          <input className="input-base" placeholder="Data de entrada" type="datetime-local" />
          <input className="input-base" placeholder="Data de saida" type="datetime-local" />
          <button type="submit" className="btn btn-primary">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
