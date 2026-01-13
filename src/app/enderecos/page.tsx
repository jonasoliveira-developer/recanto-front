"use client";
import { useEffect, useState } from "react";
import { listarEnderecos } from "../../services/enderecosApi";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";

export default function Enderecos() {
  const [enderecos, definirEnderecos] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    async function carregarEnderecos() {
      definirCarregando(true);
      try {
        if (!token) {
          definirEnderecos([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarEnderecos(token);
        definirEnderecos(dados);
      } catch {
        definirEnderecos([]);
      }
      definirCarregando(false);
    }
    carregarEnderecos();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-teal-300 p-4 font-sans">
      <header className="mb-6 flex flex-col items-center sm:flex-row sm:justify-between">
        <h1 className="text-2xl font-bold text-teal-900">Endereços</h1>
        <button
          className="mt-2 rounded-lg bg-teal-600 px-4 py-2 text-white shadow hover:bg-teal-700 sm:mt-0"
          onClick={() => definirModalAberto(true)}
        >
          Novo endereço
        </button>
      </header>
      <section className="rounded-lg bg-white p-4 shadow-md">
        {carregando ? (
          <p className="text-center text-teal-700">Carregando...</p>
        ) : enderecos.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum endereço encontrado.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {enderecos.map((endereco) => (
              <li key={endereco.id} className="rounded border p-4 shadow hover:shadow-lg">
                <h2 className="text-lg font-semibold text-teal-800">{endereco.adress}</h2>
                <p className="text-sm text-gray-600">Pessoa: {endereco.personName}</p>
                <button className="mt-2 rounded bg-teal-500 px-3 py-1 text-white hover:bg-teal-700">Editar</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar endereço">
        {/* Formulário de cadastro aqui */}
        <form className="flex flex-col gap-3">
          <input className="rounded border px-3 py-2" placeholder="Endereço" />
          <input className="rounded border px-3 py-2" placeholder="Nome da pessoa" />
          <button type="submit" className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
