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

const MESES_TITULO = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function anoPlausivel(ano: number) {
  return ano >= 2000 && ano <= 2100;
}

/**
 * Mês de competência a partir do título ("Agosto 05/09/2024" → ago/2024,
 * "Dezembro 05/01/25" → dez/2024). Sem nome de mês, usa o mês anterior ao
 * vencimento ("Taxa extra (1/3) 05/10/24" → set/2024). Com nome de mês e sem ano
 * ("Outubro Taxa Extra(2/3)"), o ano vem de `dataApoio`, recuando um ano se o mês do
 * título for posterior ao mês da data. Null se não der para inferir.
 */
export function extrairMesReferencia(titulo: unknown, dataApoio: Date | null = null): Date | null {
  if (!titulo) return null;
  const texto = String(titulo)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const indiceNome = MESES_TITULO.findIndex((mes) => new RegExp(`\\b${mes}\\b`).test(texto));
  const mesNome = indiceNome >= 0 ? indiceNome + 1 : null;

  let mesVenc: number | null = null;
  let anoVenc: number | null = null;
  const venc = texto.match(/\b\d{1,2}\/(\d{2})\/(\d{4}|\d{2})(?!\d)/);
  if (venc) {
    const mes = Number(venc[1]);
    const ano = venc[2].length === 2 ? 2000 + Number(venc[2]) : Number(venc[2]);
    if (mes >= 1 && mes <= 12 && anoPlausivel(ano)) {
      mesVenc = mes;
      anoVenc = ano;
    }
  }

  if (mesNome && mesVenc && anoVenc) {
    const ano = mesNome > mesVenc ? anoVenc - 1 : anoVenc;
    return new Date(ano, mesNome - 1, 1, 12);
  }
  if (mesNome) {
    const anoSolto = texto.match(/\b(20\d{2})\b/);
    if (anoSolto) return new Date(Number(anoSolto[1]), mesNome - 1, 1, 12);
    if (!dataApoio) return null;
    const ano = dataApoio.getFullYear() - (mesNome > dataApoio.getMonth() + 1 ? 1 : 0);
    return new Date(ano, mesNome - 1, 1, 12);
  }
  if (mesVenc && anoVenc) {
    return new Date(anoVenc, mesVenc - 2, 1, 12);
  }
  return null;
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

type PagamentoFiltravel = {
  id?: unknown;
  title?: unknown;
  datePayment?: unknown;
  personName?: unknown;
  adress?: unknown;
  obs?: unknown;
  cash?: unknown;
  situation?: unknown;
};

/** Mês de referência do título; sem ele, a data registrada no sistema. */
export function dataReferenciaPagamento(pagamento: PagamentoFiltravel): Date | null {
  const dataPagamento = parseDataPagamento(pagamento.datePayment);
  return extrairMesReferencia(pagamento.title, dataPagamento) ?? dataPagamento;
}

/** ano/mes vazios = todos. mes no formato "01".."12". */
export function filtrarPagamentosPorAnoMes<T extends PagamentoFiltravel>(
  lista: T[],
  ano: string,
  mes: string
): T[] {
  if (!ano && !mes) return lista;
  return lista.filter((pagamento) => {
    const data = dataReferenciaPagamento(pagamento);
    if (!data) return false;
    if (ano && data.getFullYear() !== Number(ano)) return false;
    if (mes && data.getMonth() + 1 !== Number(mes)) return false;
    return true;
  });
}

function normalizarBusca(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * LIKE '%termo%' em cada campo (título, pessoa, endereço, obs, id, valor, situação).
 * Sem diferenciar maiúsculas/acentos e com espaços repetidos tratados como um só,
 * porque os títulos antigos têm espaçamento irregular ("Agosto   05/09/2024").
 */
export function filtrarPagamentosPorTexto<T extends PagamentoFiltravel>(lista: T[], termo: string): T[] {
  const busca = normalizarBusca(termo);
  if (!busca) return lista;
  return lista.filter((pagamento) => {
    const situacao =
      String(pagamento.situation) === "1" ? "fechado pago" : String(pagamento.situation) === "0" ? "aberto" : "";
    return [
      pagamento.title,
      pagamento.personName,
      pagamento.adress,
      pagamento.obs,
      pagamento.id,
      pagamento.cash,
      situacao,
    ].some((campo) => normalizarBusca(campo).includes(busca));
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
