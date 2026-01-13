
"use client";
import { useEffect, useState } from "react";
import { listarResidentes } from "../services/recantoApi";
import { useAuth } from "../context/AuthContext";
import { Modal } from "../components/Modal";

export default function Home() {
  const [residentes, definirResidentes] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    async function carregarResidentes() {
      definirCarregando(true);
      try {
        if (!token) {
          definirResidentes([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarResidentes(token);
        definirResidentes(dados);
      } catch {
        definirResidentes([]);
      }
      definirCarregando(false);
    }
    carregarResidentes();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4 font-sans">
      <header className="mb-6 flex flex-col items-center sm:flex-row sm:justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Residentes</h1>
        <button
          className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 sm:mt-0"
          onClick={() => definirModalAberto(true)}
        >
          Novo residente
        </button>
      </header>
      <section className="rounded-lg bg-white p-4 shadow-md">
        {carregando ? (
          <p className="text-center text-blue-700">Carregando...</p>
        ) : residentes.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum residente encontrado.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {residentes.map((residente) => (
              <li key={residente.id} className="rounded border p-4 shadow hover:shadow-lg">
                <h2 className="text-lg font-semibold text-blue-800">{residente.name}</h2>
                <p className="text-sm text-gray-600">{residente.email}</p>
                <p className="text-sm text-gray-600">{residente.cpf}</p>
                <p className="text-sm text-gray-600">{residente.phoneNumber}</p>
                <button className="mt-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-700">Editar</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar residente">
        {/* Formulário de cadastro aqui */}
        <form className="flex flex-col gap-3">
          <input className="rounded border px-3 py-2" placeholder="Nome completo" />
          <input className="rounded border px-3 py-2" placeholder="CPF" />
          <input className="rounded border px-3 py-2" placeholder="E-mail" />
          <input className="rounded border px-3 py-2" placeholder="Telefone" />
          <input className="rounded border px-3 py-2" placeholder="Endereço" />
          <input className="rounded border px-3 py-2" placeholder="Senha" type="password" />
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
