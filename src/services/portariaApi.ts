import api from "./api";

export async function listarPortaria(token: string) {
  const resposta = await api.get("/providers", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function buscarPortariaPorId(id: number, token: string) {
  const resposta = await api.get(`/providers/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function criarPortaria(dados: any, token: string) {
  const resposta = await api.post("/providers", dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function atualizarPortaria(id: number, dados: any, token: string) {
  const resposta = await api.put(`/providers/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function removerPortaria(id: number, token: string) {
  const resposta = await api.delete(`/providers/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}
