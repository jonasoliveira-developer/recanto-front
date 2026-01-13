import api from "./api";

export async function listarFuncionarios(token: string) {
  const resposta = await api.get("/employees", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function buscarFuncionarioPorId(id: number, token: string) {
  const resposta = await api.get(`/employees/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function criarFuncionario(dados: any, token: string) {
  const resposta = await api.post("/employees", dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function atualizarFuncionario(id: number, dados: any, token: string) {
  const resposta = await api.put(`/employees/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function removerFuncionario(id: number, token: string) {
  const resposta = await api.delete(`/employees/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}
