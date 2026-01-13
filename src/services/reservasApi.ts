import api from "./api";

export async function listarReservas(token: string) {
  const resposta = await api.get("/reservations", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function buscarReservaPorId(id: number, token: string) {
  const resposta = await api.get(`/reservations/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function criarReserva(dados: any, token: string) {
  const resposta = await api.post("/reservations", dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function atualizarReserva(id: number, dados: any, token: string) {
  const resposta = await api.put(`/reservations/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function removerReserva(id: number, token: string) {
  const resposta = await api.delete(`/reservations/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}
