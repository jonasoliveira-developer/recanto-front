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
    <div className="page-shell">
      <header className="page-header">
        <h1 className="page-title">Reservas</h1>
        <button
          className="btn btn-primary"
          onClick={() => definirModalAberto(true)}
        >
          Nova reserva
        </button>
      </header>
      <section className="surface-card p-4">
        {carregando ? (
          <p className="text-center text-[var(--rc-muted)]">Carregando...</p>
        ) : reservas.length === 0 ? (
          <p className="text-center text-[var(--rc-muted)]">Nenhuma reserva encontrada.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {reservas.map((reserva) => (
              <li key={reserva.id} className="surface-card p-4">
                <h2 className="text-lg font-semibold text-[var(--rc-primary-strong)]">{reserva.localReservation}</h2>
                <p className="text-sm text-[var(--rc-muted)]">Data: {reserva.reserveDate}</p>
                <p className="text-sm text-[var(--rc-muted)]">Autoridade: {reserva.reservationAuthorite}</p>
                <button className="btn btn-secondary mt-2 !min-h-[36px] px-3 py-1 text-sm">Editar</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar reserva">
        {/* Formulário de cadastro aqui */}
        <form className="flex flex-col gap-3">
          <input className="input-base" placeholder="Local da reserva" />
          <input className="input-base" placeholder="Data da reserva" type="datetime-local" />
          <input className="input-base" placeholder="Autoridade" />
          <input className="input-base" placeholder="Nome da pessoa" />
          <input className="input-base" placeholder="Horario" type="time" />
          <button type="submit" className="btn btn-primary">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
