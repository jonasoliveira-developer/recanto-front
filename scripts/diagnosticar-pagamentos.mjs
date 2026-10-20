/**
 * Diagnóstico (somente leitura) de GET /payments — não altera nada.
 *
 * Mostra: formatos de datePayment, distribuição por ano (data x título),
 * registros invisíveis para o filtro de período da tela, divergências
 * entre ano do título e ano da data, e buracos de ID (possíveis exclusões).
 *
 * Uso:
 *   TOKEN=<jwt> node scripts/diagnosticar-pagamentos.mjs
 *   Opcional: --ano=2024 (amostra detalhada do ano)
 */

const API = process.env.API_URL || "https://recanto-backend-production.up.railway.app";
const TOKEN = process.env.TOKEN;
const ANO_FOCO = (process.argv.find((a) => a.startsWith("--ano=")) || "--ano=2024").slice(6);

function classificarFormato(valor) {
  if (valor === null || valor === undefined || valor === "") return "vazio";
  if (Array.isArray(valor)) return "array";
  if (typeof valor === "number") return "numero";
  const s = String(valor).trim();
  const base = s.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(base)) return s.includes("T") ? "iso-datetime" : "yyyy-MM-dd";
  if (/^\d{2}-\d{2}-\d{4}$/.test(base)) return "dd-MM-yyyy";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(base)) return "dd/MM/yyyy";
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(base)) return "yyyy/MM/dd";
  if (/^\d{4}-\d{2}-\d{2} /.test(s)) return "yyyy-MM-dd HH:mm";
  return "outro";
}

/** Mesma regra de src/lib/filtros.ts → parseDataPagamento */
function parseComoATela(data) {
  if (!data || typeof data !== "string") return null;
  const dataStr = data.split("T")[0];
  let ano, mes, dia;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) [ano, mes, dia] = dataStr.split("-");
  else if (/^\d{2}-\d{2}-\d{4}$/.test(dataStr)) [dia, mes, ano] = dataStr.split("-");
  if (!ano || !mes || !dia) return null;
  return new Date(Number(ano), Number(mes) - 1, Number(dia), 12);
}

function extrairAno(valor) {
  if (valor === null || valor === undefined) return null;
  if (Array.isArray(valor)) return valor[0] ? String(valor[0]) : null;
  if (typeof valor === "number") return String(new Date(valor).getFullYear());
  const m = String(valor).match(/(19|20)\d{2}/);
  return m ? m[0] : null;
}

function anoDoTitulo(titulo) {
  const m = String(titulo || "").match(/(?:^|\D)((?:19|20)\d{2})(?:\D|$)/);
  return m ? m[1] : null;
}

function contar(mapa, chave) {
  mapa.set(chave, (mapa.get(chave) || 0) + 1);
}

function imprimirMapa(titulo, mapa) {
  console.log(titulo);
  const linhas = [...mapa.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  for (const [k, v] of linhas) console.log(`  ${k}\t${v}`);
  console.log("");
}

async function main() {
  if (!TOKEN) {
    console.error("Defina TOKEN=<jwt>");
    process.exit(1);
  }

  const res = await fetch(`${API}/payments`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) {
    console.error("Falha GET /payments:", res.status, await res.text());
    process.exit(1);
  }
  const corpo = await res.json();
  if (!Array.isArray(corpo)) {
    console.error("Resposta não é lista (possível paginação no backend). Chaves:", Object.keys(corpo));
    process.exit(1);
  }
  const pagamentos = corpo;

  console.log(`=== Diagnóstico GET /payments ===`);
  console.log(`Total retornado pela API: ${pagamentos.length}`);
  console.log(`Campos do 1º registro: ${Object.keys(pagamentos[0] || {}).join(", ")}`);
  console.log("");

  const formatos = new Map();
  const exemploFormato = new Map();
  const porAnoData = new Map();
  const porAnoTitulo = new Map();
  const situacoes = new Map();
  const invisiveis = [];
  const divergentes = [];

  for (const p of pagamentos) {
    const fmt = classificarFormato(p.datePayment);
    contar(formatos, fmt);
    if (!exemploFormato.has(fmt)) exemploFormato.set(fmt, JSON.stringify(p.datePayment));
    contar(porAnoData, extrairAno(p.datePayment) || "(sem data)");
    contar(porAnoTitulo, anoDoTitulo(p.title) || "(sem ano no título)");
    contar(situacoes, `${typeof p.situation}:${JSON.stringify(p.situation)}`);

    if (!parseComoATela(p.datePayment)) invisiveis.push(p);

    const aData = extrairAno(p.datePayment);
    const aTitulo = anoDoTitulo(p.title);
    if (aData && aTitulo && aData !== aTitulo) divergentes.push(p);
  }

  imprimirMapa("Formatos de datePayment:", formatos);
  console.log("Exemplo por formato:");
  for (const [k, v] of exemploFormato) console.log(`  ${k}\t${v}`);
  console.log("");
  imprimirMapa("Quantidade por ANO de datePayment (o que o filtro da tela usa):", porAnoData);
  imprimirMapa("Quantidade por ANO escrito no TÍTULO:", porAnoTitulo);
  imprimirMapa("Valores de situation (tipo:valor):", situacoes);

  console.log(`INVISÍVEIS na tela (datePayment não reconhecido pelo filtro de período): ${invisiveis.length}`);
  for (const p of invisiveis.slice(0, 20)) {
    console.log(`  #${p.id} | ${p.title} | datePayment=${JSON.stringify(p.datePayment)} | ${p.personName || p.person}`);
  }
  console.log("");

  console.log(`Ano do TÍTULO diferente do ano de datePayment: ${divergentes.length}`);
  const resumoDiv = new Map();
  for (const p of divergentes) contar(resumoDiv, `título ${anoDoTitulo(p.title)} → data ${extrairAno(p.datePayment)}`);
  for (const [k, v] of resumoDiv) console.log(`  ${k}\t${v}`);
  console.log("");

  const comAnoFoco = pagamentos.filter(
    (p) => extrairAno(p.datePayment) === ANO_FOCO || anoDoTitulo(p.title) === ANO_FOCO
  );
  console.log(`Registros ligados a ${ANO_FOCO} (pela data ou pelo título): ${comAnoFoco.length}`);
  const titulosFoco = new Map();
  for (const p of comAnoFoco) contar(titulosFoco, `${String(p.title || "").trim()} | data ${extrairAno(p.datePayment) || "-"}`);
  for (const [k, v] of [...titulosFoco.entries()].sort()) console.log(`  ${v}\t${k}`);
  console.log("");

  const ids = pagamentos.map((p) => Number(p.id)).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (ids.length === pagamentos.length && ids.length > 1) {
    const porId = new Map(pagamentos.map((p) => [Number(p.id), p]));
    const buracos = [];
    for (let i = 1; i < ids.length; i++) {
      const faltam = ids[i] - ids[i - 1] - 1;
      if (faltam > 0) buracos.push({ de: ids[i - 1], ate: ids[i], faltam });
    }
    const totalFaltando = buracos.reduce((s, b) => s + b.faltam, 0);
    console.log(`IDs: ${ids[0]}..${ids[ids.length - 1]} | ausentes (excluídos ou nunca usados): ${totalFaltando}`);
    console.log("Maiores buracos de ID (com datas vizinhas):");
    for (const b of buracos.sort((x, y) => y.faltam - x.faltam).slice(0, 15)) {
      const antes = porId.get(b.de);
      const depois = porId.get(b.ate);
      console.log(
        `  faltam ${b.faltam} entre #${b.de} (${JSON.stringify(antes?.datePayment)} "${antes?.title}") e #${b.ate} (${JSON.stringify(depois?.datePayment)} "${depois?.title}")`
      );
    }
  } else {
    console.log("IDs não numéricos — análise de buracos de ID ignorada.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
