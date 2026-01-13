"use client";
import { useEffect, useState } from "react";
import { listarPortaria } from "../../services/portariaApi";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";


export default function Portaria() {
  const [registros, definirRegistros] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-4 font-sans">
      <header className="mb-6 flex flex-col items-center sm:flex-row sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Portaria</h1>
        <button
          className="mt-2 rounded-lg bg-gray-600 px-4 py-2 text-white shadow hover:bg-gray-700 sm:mt-0"
          onClick={() => definirModalAberto(true)}
        >
          Novo registro
        </button>
      </header>
      <section className="rounded-lg bg-white p-4 shadow-md">
        {carregando ? (
          <p className="text-center text-gray-700">Carregando...</p>
        ) : registros.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum registro encontrado.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {registros.map((registro) => (
              <li key={registro.id} className="rounded border p-4 shadow hover:shadow-lg">
                <h2 className="text-lg font-semibold text-gray-800">{registro.title}</h2>
                <p className="text-sm text-gray-600">Visitante: {registro.name}</p>
                <p className="text-sm text-gray-600">Situação: {registro.situation}</p>
                <button className="mt-2 rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-700">Editar</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar registro de portaria">
        {/* Formulário de cadastro aqui */}
        <form className="flex flex-col gap-3">
          <input className="rounded border px-3 py-2" placeholder="Título" />
          <input className="rounded border px-3 py-2" placeholder="Nome do visitante" />
          <input className="rounded border px-3 py-2" placeholder="Documento" />
          <input className="rounded border px-3 py-2" placeholder="Carro" />
          <input className="rounded border px-3 py-2" placeholder="Descrição" />
          <input className="rounded border px-3 py-2" placeholder="Situação" />
          <input className="rounded border px-3 py-2" placeholder="Nome do responsável" />
          <input className="rounded border px-3 py-2" placeholder="Data de entrada" type="datetime-local" />
          <input className="rounded border px-3 py-2" placeholder="Data de saída" type="datetime-local" />
          <button type="submit" className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
