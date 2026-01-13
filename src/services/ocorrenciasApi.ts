import api from "./api";

export async function listarOcorrencias(token: string) {
  const resposta = await api.get("/occurrences", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function buscarOcorrenciaPorId(id: number, token: string) {
  const resposta = await api.get(`/occurrences/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function criarOcorrencia(dados: any, token: string) {
  const resposta = await api.post("/occurrences", dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function atualizarOcorrencia(id: number, dados: any, token: string) {
  const resposta = await api.put(`/occurrences/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function removerOcorrencia(id: number, token: string) {
  const resposta = await api.delete(`/occurrences/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}
