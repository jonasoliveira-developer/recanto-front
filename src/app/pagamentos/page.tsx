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
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-pink-900 mb-6">Pagamentos</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <input
            type="text"
            value={busca}
            onChange={aoBuscar}
            placeholder="Buscar por título, situação ou pessoa"
            className="rounded border px-3 py-2 w-full md:max-w-full md:flex-1"
          />
          <button
            className="rounded-lg bg-pink-600 px-4 py-2 text-white shadow hover:bg-pink-700 cursor-pointer md:ml-2"
            onClick={() => definirModalAberto(true)}
          >
            Novo pagamento
          </button>
        </div>
      </header>
      <section className="rounded-lg bg-white p-4">
        {carregando ? (
          <p className="text-center text-pink-700">Carregando...</p>
        ) : pagamentosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum pagamento encontrado.</p>
        ) : (
          <>
            {/* Tabela em tela grande, cards em tela pequena */}
            <div className="hidden md:block">
              <table className="min-w-full border rounded-lg overflow-hidden">
                <thead className="bg-pink-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Título</th>
                    <th className="px-4 py-2 text-left">Situação</th>
                    <th className="px-4 py-2 text-left">Valor</th>
                    <th className="px-4 py-2 text-left">Pessoa</th>
                    <th className="px-4 py-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentosPaginados.map((pagamento) => (
                    <tr key={pagamento.id} className="border-b transition-colors duration-200 hover:bg-pink-50 cursor-pointer">
                      <td className="px-4 py-2 font-bold text-pink-800">{pagamento.title}</td>
                      <td className="px-4 py-2">{pagamento.situation}</td>
                      <td className="px-4 py-2">R$ {pagamento.cash}</td>
                      <td className="px-4 py-2">{pagamento.personName}</td>
                      <td className="px-4 py-2">
                        <button className="rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-700 cursor-pointer mr-2">Editar</button>
                        <button className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-800 cursor-pointer">Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="flex flex-col gap-4 md:hidden">
              {pagamentosPaginados.map((pagamento) => (
                <li key={pagamento.id} className="rounded border p-4 shadow hover:shadow-lg transition-colors duration-200 hover:bg-pink-50 cursor-pointer">
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500 font-semibold">Título</span>
                    <span className="block text-base text-pink-800 font-bold">{pagamento.title}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500 font-semibold">Situação</span>
                    <span className="block text-base text-gray-700">{pagamento.situation}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500 font-semibold">Valor</span>
                    <span className="block text-base text-gray-700">R$ {pagamento.cash}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500 font-semibold">Pessoa</span>
                    <span className="block text-base text-gray-700">{pagamento.personName}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-700 cursor-pointer mr-2">Editar</button>
                    <button className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-800 cursor-pointer">Excluir</button>
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
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar pagamento">
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
