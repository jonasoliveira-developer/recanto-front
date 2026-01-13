"use client";
import { useEffect, useState } from "react";
import { listarOcorrencias } from "../../services/ocorrenciasApi";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";


export default function Ocorrencias() {
  const [ocorrencias, definirOcorrencias] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    async function carregarOcorrencias() {
      definirCarregando(true);
      try {
        if (!token) {
          definirOcorrencias([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarOcorrencias(token);
        definirOcorrencias(dados);
      } catch {
        definirOcorrencias([]);
      }
      definirCarregando(false);
    }
    carregarOcorrencias();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-300 p-4 font-sans">
      <header className="mb-6 flex flex-col items-center sm:flex-row sm:justify-between">
        <h1 className="text-2xl font-bold text-yellow-900">Ocorrências</h1>
        <button
          className="mt-2 rounded-lg bg-yellow-600 px-4 py-2 text-white shadow hover:bg-yellow-700 sm:mt-0"
          onClick={() => definirModalAberto(true)}
        >
          Nova ocorrência
        </button>
      </header>
      <section className="rounded-lg bg-white p-4 shadow-md">
        {carregando ? (
          <p className="text-center text-yellow-700">Carregando...</p>
        ) : ocorrencias.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma ocorrência encontrada.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {ocorrencias.map((ocorrencia) => (
              <li key={ocorrencia.id} className="rounded border p-4 shadow hover:shadow-lg">
                <h2 className="text-lg font-semibold text-yellow-800">{ocorrencia.title}</h2>
                <p className="text-sm text-gray-600">{ocorrencia.description}</p>
                <p className="text-sm text-gray-600">Situação: {ocorrencia.situation}</p>
                <button className="mt-2 rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-700">Editar</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar ocorrência">
        {/* Formulário de cadastro aqui */}
        <form className="flex flex-col gap-3">
          <input className="rounded border px-3 py-2" placeholder="Título" />
          <input className="rounded border px-3 py-2" placeholder="Descrição" />
          <input className="rounded border px-3 py-2" placeholder="Situação" />
          <input className="rounded border px-3 py-2" placeholder="Data de abertura" type="datetime-local" />
          <input className="rounded border px-3 py-2" placeholder="Nome da pessoa" />
          <button type="submit" className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
