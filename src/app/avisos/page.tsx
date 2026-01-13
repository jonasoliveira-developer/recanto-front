"use client";
import { useEffect, useState } from "react";
import { listarAvisos } from "../../services/avisosApi";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";


export default function Avisos() {
  const [avisos, definirAvisos] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    async function carregarAvisos() {
      definirCarregando(true);
      try {
        if (!token) {
          definirAvisos([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarAvisos(token);
        definirAvisos(dados);
      } catch {
        definirAvisos([]);
      }
      definirCarregando(false);
    }
    carregarAvisos();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-300 p-4 font-sans">
      <header className="mb-6 flex flex-col items-center sm:flex-row sm:justify-between">
        <h1 className="text-2xl font-bold text-orange-900">Avisos</h1>
        <button
          className="mt-2 rounded-lg bg-orange-600 px-4 py-2 text-white shadow hover:bg-orange-700 sm:mt-0"
          onClick={() => definirModalAberto(true)}
        >
          Novo aviso
        </button>
      </header>
      <section className="rounded-lg bg-white p-4 shadow-md">
        {carregando ? (
          <p className="text-center text-orange-700">Carregando...</p>
        ) : avisos.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum aviso encontrado.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {avisos.map((aviso) => (
              <li key={aviso.id} className="rounded border p-4 shadow hover:shadow-lg">
                <h2 className="text-lg font-semibold text-orange-800">{aviso.title}</h2>
                <p className="text-sm text-gray-600">{aviso.description}</p>
                <p className="text-sm text-gray-600">Autor: {aviso.personName}</p>
                <button className="mt-2 rounded bg-orange-500 px-3 py-1 text-white hover:bg-orange-700">Editar</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar aviso">
        {/* Formulário de cadastro aqui */}
        <form className="flex flex-col gap-3">
          <input className="rounded border px-3 py-2" placeholder="Título" />
          <input className="rounded border px-3 py-2" placeholder="Descrição" />
          <input className="rounded border px-3 py-2" placeholder="Autor" />
          <input className="rounded border px-3 py-2" placeholder="Data de abertura" type="date" />
          <button type="submit" className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
