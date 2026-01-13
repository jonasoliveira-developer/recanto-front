import api from "./api";

export async function autenticarUsuario(email: string, senha: string) {
  const resposta = await api.post("/login", { email, password: senha });
  return resposta.data;
}

export async function listarResidentes(token: string) {
  const resposta = await api.get("/residents", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function buscarResidentePorId(id: number, token: string) {
  const resposta = await api.get(`/residents/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function criarResidente(dados: any, token: string) {
  const resposta = await api.post("/residents", dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function atualizarResidente(id: number, dados: any, token: string) {
  const resposta = await api.put(`/residents/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

export async function removerResidente(id: number, token: string) {
  const resposta = await api.delete(`/residents/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resposta.data;
}

// ...implemente funções para employees, occurrences, reservations, payments, annoucements, adress, providers seguindo o mesmo padrão
