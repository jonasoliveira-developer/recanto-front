"use client";
import { useEffect, useState } from "react";
import { listarPagamentos } from "../../services/pagamentosApi";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";
import { Paginacao } from "../../components/Paginacao";

export default function Pagamentos() {
  const [pagamentos, definirPagamentos] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [busca, definirBusca] = useState("");
  const [paginaAtual, definirPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const { token } = useAuth();

  useEffect(() => {
    async function carregarPagamentos() {
      definirCarregando(true);
      try {
        if (!token) {
          definirPagamentos([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarPagamentos(token);
        definirPagamentos(dados);
      } catch {
        definirPagamentos([]);
      }
      definirCarregando(false);
    }
    carregarPagamentos();
  }, [token]);

  // Filtragem por busca
  const pagamentosFiltrados = pagamentos.filter((pagamento) => {
    const termo = busca.toLowerCase();
    return (
      pagamento.title?.toLowerCase().includes(termo) ||
      pagamento.situation?.toLowerCase().includes(termo) ||
      pagamento.personName?.toLowerCase().includes(termo)
    );
  });

  // Paginação
  const totalPaginas = Math.ceil(pagamentosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const pagamentosPaginados = pagamentosFiltrados.slice(inicio, fim);

  function aoMudarPagina(novaPagina: number) {
    definirPaginaAtual(novaPagina);
  }

  function aoBuscar(e: React.ChangeEvent<HTMLInputElement>) {
    definirBusca(e.target.value);
    definirPaginaAtual(1);
  }

  return (
    <div className="min-h-screen bg-white p-4 font-sans">
      <header className="mb-6 flex flex-col items-center sm:flex-row sm:justify-between">
        <h1 className="text-2xl font-bold text-pink-900">Pagamentos</h1>
        <button
          className="mt-2 rounded-lg bg-pink-600 px-4 py-2 text-white shadow hover:bg-pink-700 sm:mt-0"
          onClick={() => definirModalAberto(true)}
        >
          Novo pagamento
        </button>
      </header>
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          value={busca}
          onChange={aoBuscar}
          placeholder="Buscar por título, situação ou pessoa"
          className="rounded border px-3 py-2 w-full max-w-xs"
        />
      </div>
      <section className="rounded-lg bg-white p-4">
        {carregando ? (
          <p className="text-center text-pink-700">Carregando...</p>
        ) : pagamentosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum pagamento encontrado.</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {pagamentosPaginados.map((pagamento) => (
                <li key={pagamento.id} className="rounded border p-4 shadow hover:shadow-lg">
                  <h2 className="text-lg font-semibold text-pink-800">{pagamento.title}</h2>
                  <p className="text-sm text-gray-600">Situação: {pagamento.situation}</p>
                  <p className="text-sm text-gray-600">Valor: R$ {pagamento.cash}</p>
                  <button className="mt-2 rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-700">Editar</button>
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
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar pagamento">
        {/* Formulário de cadastro aqui */}
        <form className="flex flex-col gap-3">
          <input className="rounded border px-3 py-2" placeholder="Título" />
          <input className="rounded border px-3 py-2" placeholder="Data do pagamento" type="date" />
          <input className="rounded border px-3 py-2" placeholder="Situação" />
          <input className="rounded border px-3 py-2" placeholder="Modo de pagamento" />
          <input className="rounded border px-3 py-2" placeholder="Valor" type="number" />
          <input className="rounded border px-3 py-2" placeholder="Nome da pessoa" />
          <button type="submit" className="rounded bg-pink-600 px-4 py-2 text-white hover:bg-pink-700">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
