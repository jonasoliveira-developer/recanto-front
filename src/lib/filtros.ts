export type ItemComPessoa = {
  person?: number | string | null;
  personName?: string | null;
  [key: string]: unknown;
};

export function normalizarId(valor: unknown): string | null {
  if (valor == null || valor === "") return null;
  return String(valor);
}

export function filtrarPorResidente<T extends ItemComPessoa>(
  lista: T[],
  residentId: number | string | null | undefined
): T[] {
  const alvo = normalizarId(residentId);
  if (!alvo) return lista;
  return lista.filter((item) => normalizarId(item.person) === alvo);
}

export function filtrarPorBusca<T extends Record<string, unknown>>(
  lista: T[],
  termo: string,
  campos: (keyof T | string)[]
): T[] {
  const q = termo.trim().toLowerCase();
  if (!q) return lista;
  return lista.filter((item) =>
    campos.some((campo) => {
      const valor = item[campo as keyof T];
      return valor != null && String(valor).toLowerCase().includes(q);
    })
  );
}

export function parseDataPagamento(data: unknown): Date | null {
  if (!data || typeof data !== "string") return null;
  const dataStr = data.split("T")[0];
  let ano: string | undefined;
  let mes: string | undefined;
  let dia: string | undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
    [ano, mes, dia] = dataStr.split("-");
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(dataStr)) {
    [dia, mes, ano] = dataStr.split("-");
  }
  if (!ano || !mes || !dia) return null;
  return new Date(Number(ano), Number(mes) - 1, Number(dia), 12, 0, 0, 0);
}

export function filtrarPagamentosPorPeriodo<T extends { datePayment?: unknown }>(
  lista: T[],
  mesInicial: string,
  anoInicial: string,
  mesFinal: string,
  anoFinal: string
): T[] {
  const dataInicio = new Date(Number(anoInicial), Number(mesInicial) - 1, 1, 0, 0, 0, 0);
  const dataFim = new Date(Number(anoFinal), Number(mesFinal), 0, 23, 59, 59, 999);
  return lista.filter((pagamento) => {
    const dataPag = parseDataPagamento(pagamento.datePayment);
    if (!dataPag) return false;
    return dataPag >= dataInicio && dataPag <= dataFim;
  });
}

export function filtrarPorSituacao<T extends { situation?: unknown }>(
  lista: T[],
  situacao: string
): T[] {
  if (situacao === "" || situacao == null) return lista;
  return lista.filter((item) => String(item.situation) === String(situacao));
}

export function paginarLista<T>(lista: T[], paginaAtual: number, itensPorPagina: number) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / itensPorPagina) || 1);
  const pagina = Math.min(Math.max(1, paginaAtual), totalPaginas);
  const inicio = (pagina - 1) * itensPorPagina;
  return {
    itens: lista.slice(inicio, inicio + itensPorPagina),
    totalPaginas: lista.length === 0 ? 0 : totalPaginas,
    pagina,
  };
}

/** Endereço incompleto se for só número / muito curto (ex.: "114"). */
export function enderecoPareceIncompleto(adress: unknown): boolean {
  if (adress == null) return true;
  const texto = String(adress).trim();
  if (!texto) return true;
  if (/^\d+$/.test(texto)) return true;
  if (texto.length < 5) return true;
  return false;
}

export function resolverEnderecoCanonico(
  pagamento: { adress?: unknown; person?: unknown },
  enderecos: { id?: unknown; person?: unknown; adress?: unknown }[]
): string {
  const atual = pagamento.adress != null ? String(pagamento.adress).trim() : "";
  if (!enderecoPareceIncompleto(atual)) return atual;

  const personId = normalizarId(pagamento.person);
  if (!personId) return atual || "-";

  const doResidente = enderecos.filter(
    (e) => normalizarId(e.person) === personId && !enderecoPareceIncompleto(e.adress)
  );
  if (doResidente.length === 0) return atual || "-";
  return String(doResidente[0].adress).trim();
}
