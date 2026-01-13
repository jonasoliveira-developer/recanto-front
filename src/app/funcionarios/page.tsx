"use client";
import { useEffect, useState } from "react";
import { listarFuncionarios } from "../../services/funcionariosApi";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";


export default function Funcionarios() {
  const [funcionarios, definirFuncionarios] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    async function carregarFuncionarios() {
      definirCarregando(true);
      try {
        if (!token) {
          definirFuncionarios([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarFuncionarios(token);
        definirFuncionarios(dados);
      } catch {
        definirFuncionarios([]);
      }
      definirCarregando(false);
    }
    carregarFuncionarios();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 p-4 font-sans">
      <header className="mb-6 flex flex-col items-center sm:flex-row sm:justify-between">
        <h1 className="text-2xl font-bold text-green-900">Funcionários</h1>
        <button
          className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700 sm:mt-0"
          onClick={() => definirModalAberto(true)}
        >
          Novo funcionário
        </button>
      </header>
      <section className="rounded-lg bg-white p-4 shadow-md">
        {carregando ? (
          <p className="text-center text-green-700">Carregando...</p>
        ) : funcionarios.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum funcionário encontrado.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {funcionarios.map((funcionario) => (
              <li key={funcionario.id} className="rounded border p-4 shadow hover:shadow-lg">
                <h2 className="text-lg font-semibold text-green-800">{funcionario.name}</h2>
                <p className="text-sm text-gray-600">{funcionario.email}</p>
                <p className="text-sm text-gray-600">{funcionario.cpf}</p>
                <button className="mt-2 rounded bg-green-500 px-3 py-1 text-white hover:bg-green-700">Editar</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar funcionário">
        {/* Formulário de cadastro aqui */}
        <form className="flex flex-col gap-3">
          <input className="rounded border px-3 py-2" placeholder="Nome completo" />
          <input className="rounded border px-3 py-2" placeholder="CPF" />
          <input className="rounded border px-3 py-2" placeholder="E-mail" />
          <input className="rounded border px-3 py-2" placeholder="Senha" type="password" />
          <button type="submit" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
