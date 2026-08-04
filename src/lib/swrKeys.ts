export const chaveResidentes = (token: string | null) =>
  token ? (["residents", token] as const) : null;

export const chaveResidente = (token: string | null, id: number | string | null) =>
  token && id != null ? (["resident", token, String(id)] as const) : null;

export const chavePagamentos = (token: string | null) =>
  token ? (["payments", token] as const) : null;

export const chaveEnderecos = (token: string | null) =>
  token ? (["adress", token] as const) : null;

export const chaveAvisos = (token: string | null) =>
  token ? (["annoucements", token] as const) : null;

export const chaveOcorrencias = (token: string | null) =>
  token ? (["occurrences", token] as const) : null;

export const chaveFuncionarios = (token: string | null) =>
  token ? (["employees", token] as const) : null;
