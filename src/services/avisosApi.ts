import api from "./api";

export async function listarAvisos(token: string) {
  const resposta = await api.get("/annoucements", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function buscarAvisoPorId(id: number, token: string) {
  const resposta = await api.get(`/annoucements/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}


export async function criarAviso(dados: Record<string, unknown>, token: string) {
  const resposta = await api.post("/annoucements", dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}


export async function atualizarAviso(id: number, dados: Record<string, unknown>, token: string) {
  const resposta = await api.put(`/annoucements/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function removerAviso(id: number, token: string) {
  const resposta = await api.delete(`/annoucements/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}
