import api from "./api";

export async function autenticarUsuario(email: string, senha: string) {
  const resposta = await api.post("/login", { email, password: senha });
  return resposta.data;
}
