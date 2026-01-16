/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

// Função para autenticar usuário e extrair dados do header Authorization
export async function autenticarUsuario(email: string, senha: string) {
  const resposta = await api.post("/login", { email, password: senha });
  // Log completo da resposta
  console.log("Resposta completa do login:", resposta);
  console.log("Headers:", resposta.headers);
  // O backend retorna os dados no header Authorization, separados por espaço
  const authorization = resposta.headers["authorization"] || resposta.headers["Authorization"];
  console.log("Header Authorization:", authorization);
  if (!authorization) throw new Error("Header Authorization não encontrado na resposta da API");

  // Exemplo: Bearer <token> <id> <nome> [ROLE_ADMIN, ROLE_RESIDENT]
  // tokenParts: [0]=Bearer, [1]=token, [2]=id, [3]=nome, [4]=[ROLE_ADMIN,, [5]=ROLE_RESIDENT]
  // Junta tudo após o nome para roles
  const tokenParts = authorization.split(" ");
  const token = tokenParts[1]?.trim();
  const id = tokenParts[2]?.trim();
  const user = tokenParts[3]?.trim();
  // Junta tudo após o nome para roles (pode haver espaços nas roles)
  let rolesRaw = tokenParts.slice(4).join(" ").trim();
  // Limpa colchetes e espaços, divide por vírgula
  let rolesArr: string[] = [];
  if (rolesRaw.startsWith("[")) {
    rolesRaw = rolesRaw.replace("[", "").replace("]", "").trim();
    rolesArr = rolesRaw.split(",").map(function(r: any) { return (r as string).trim(); }).filter(Boolean);
  } else if (rolesRaw) {
    rolesArr = rolesRaw.split(",").map(function(r: any) { return (r as string).trim(); }).filter(Boolean);
  }
  // Salva como string separada por vírgula
  const roles = rolesArr.join(",");

  console.log("token:", token);
  console.log("id:", id);
  console.log("user:", user);
  console.log("roles:", roles);

  if (id) localStorage.setItem("id", id);
  if (user) localStorage.setItem("user", user);
  if (roles) localStorage.setItem("roles", roles);
  if (token) localStorage.setItem("token", token);

  return token;
}
