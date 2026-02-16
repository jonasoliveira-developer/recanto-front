import api from "./api";

export async function listarEnderecos(token: string) {
  const resposta = await api.get("/adress", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function buscarEnderecoPorId(id: number, token: string) {
  const resposta = await api.get(`/adress/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}


export async function criarEndereco(dados: Record<string, unknown>, token: string) {
  const resposta = await api.post("/adress", dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}


export async function atualizarEndereco(id: number, dados: Record<string, unknown>, token: string) {
  const resposta = await api.put(`/adress/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function removerEndereco(id: number, token: string) {
  const resposta = await api.delete(`/adress/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}
