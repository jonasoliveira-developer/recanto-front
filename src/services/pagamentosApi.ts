import api from "./api";

export async function listarPagamentos(token: string) {
  const resposta = await api.get("/payments", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function buscarPagamentoPorId(id: number, token: string) {
  const resposta = await api.get(`/payments/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function criarPagamento(dados: any, token: string) {
  const resposta = await api.post("/payments", dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function atualizarPagamento(id: number, dados: any, token: string) {
  const resposta = await api.put(`/payments/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function removerPagamento(id: number, token: string) {
  const resposta = await api.delete(`/payments/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}
