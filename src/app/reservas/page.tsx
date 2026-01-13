"use client";
import { useEffect, useState } from "react";
import { listarReservas } from "../../services/reservasApi";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";


export default function Reservas() {
  const [reservas, definirReservas] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    async function carregarReservas() {
      definirCarregando(true);
      try {
        if (!token) {
          definirReservas([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarReservas(token);
        definirReservas(dados);
      } catch {
        definirReservas([]);
      }
      definirCarregando(false);
    }
    carregarReservas();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-300 p-4 font-sans">
      <header className="mb-6 flex flex-col items-center sm:flex-row sm:justify-between">
        <h1 className="text-2xl font-bold text-purple-900">Reservas</h1>
        <button
          className="mt-2 rounded-lg bg-purple-600 px-4 py-2 text-white shadow hover:bg-purple-700 sm:mt-0"
          onClick={() => definirModalAberto(true)}
        >
          Nova reserva
        </button>
      </header>
      <section className="rounded-lg bg-white p-4 shadow-md">
        {carregando ? (
          <p className="text-center text-purple-700">Carregando...</p>
        ) : reservas.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma reserva encontrada.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {reservas.map((reserva) => (
              <li key={reserva.id} className="rounded border p-4 shadow hover:shadow-lg">
                <h2 className="text-lg font-semibold text-purple-800">{reserva.localReservation}</h2>
                <p className="text-sm text-gray-600">Data: {reserva.reserveDate}</p>
                <p className="text-sm text-gray-600">Autoridade: {reserva.reservationAuthorite}</p>
                <button className="mt-2 rounded bg-purple-500 px-3 py-1 text-white hover:bg-purple-700">Editar</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar reserva">
        {/* Formulário de cadastro aqui */}
        <form className="flex flex-col gap-3">
          <input className="rounded border px-3 py-2" placeholder="Local da reserva" />
          <input className="rounded border px-3 py-2" placeholder="Data da reserva" type="datetime-local" />
          <input className="rounded border px-3 py-2" placeholder="Autoridade" />
          <input className="rounded border px-3 py-2" placeholder="Nome da pessoa" />
          <input className="rounded border px-3 py-2" placeholder="Horário" type="time" />
          <button type="submit" className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
