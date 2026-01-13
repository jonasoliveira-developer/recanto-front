import api from "./api";

// Função para autenticar usuário e extrair dados do header Authorization
export async function autenticarUsuario(email: string, senha: string) {
  const resposta = await api.post("/login", { email, password: senha });
  // O backend retorna os dados no header Authorization, separados por espaço ou vírgula
  const authorization = resposta.headers["authorization"] || resposta.headers["Authorization"];
  if (!authorization) throw new Error("Header Authorization não encontrado na resposta da API");

  // Exemplo esperado: "Bearer token id user roles"
  // Ou: "Bearer,token,id,user,roles" (ajuste conforme backend)
  // Aqui vamos dividir por espaço e vírgula e pegar os índices conforme padrão citado
  let tokenParts: string[] = [];
  if (authorization.includes(",")) {
    tokenParts = authorization.split(",");
  } else {
    tokenParts = authorization.split(" ");
  }

  // Ajuste os índices conforme o backend envia (exemplo: [0]=Bearer, [1]=token, [2]=id, [3]=user, [4]=roles)
  const token = tokenParts[1]?.trim();
  const id = tokenParts[2]?.trim();
  const user = tokenParts[3]?.trim();
  const roles = tokenParts[4]?.trim();

  if (id) localStorage.setItem("id", id);
  if (user) localStorage.setItem("user", user);
  if (roles) localStorage.setItem("roles", roles);
  if (token) localStorage.setItem("token", token);

  return token;
}
