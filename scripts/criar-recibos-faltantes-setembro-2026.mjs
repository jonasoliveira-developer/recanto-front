/**
 * Completa um lote de recibos que foi criado pela metade.
 *
 * Esperado: 1 recibo por endereço de cada residente (mesma regra do "Criar para todos"),
 * e 1 recibo sem endereço para residente sem endereço.
 * Faltantes = esperado − recibos já existentes com o título (comparando residente + endereço).
 *
 * Nunca apaga nem altera recibos existentes. Os novos nascem Aberto, com obs e modo de
 * pagamento do lote, e valor igual ao do mesmo residente/endereço no título de referência.
 *
 * Uso:
 *   TOKEN=<jwt> node scripts/criar-recibos-faltantes-setembro-2026.mjs            (simulação)
 *   TOKEN=<jwt> node scripts/criar-recibos-faltantes-setembro-2026.mjs --executar (cria)
 *   Opcionais: --titulo="Setembro 05/10/2026" --referencia="Agosto 05/09/2026"
 */

const API = process.env.API_URL || "https://recanto-backend-production.up.railway.app";
const TOKEN = process.env.TOKEN;
const EXECUTAR = process.argv.includes("--executar");

function arg(nome, padrao) {
  const bruto = process.argv.find((a) => a.startsWith(`--${nome}=`));
  return bruto ? bruto.slice(nome.length + 3).trim() : padrao;
}

const TITULO = arg("titulo", "Setembro 05/10/2026");
const REFERENCIA = arg("referencia", "Agosto 05/09/2026");
const SITUACAO_ABERTO = 0;
const VALOR_PADRAO = 190;

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const chave = (pessoa, endereco) => `${pessoa}|${normalizarTexto(endereco)}`;

function maisFrequente(valores, padrao) {
  const cont = new Map();
  for (const v of valores) cont.set(v, (cont.get(v) || 0) + 1);
  let melhor = padrao;
  let max = 0;
  for (const [v, c] of cont) if (c > max) [melhor, max] = [v, c];
  return melhor;
}

async function get(caminho) {
  const res = await fetch(`${API}${caminho}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`GET ${caminho} → ${res.status} ${await res.text()}`);
  const dados = await res.json();
  if (!Array.isArray(dados)) throw new Error(`GET ${caminho}: resposta não é lista`);
  return dados;
}

async function criarPagamento(payload) {
  const res = await fetch(`${API}/payments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /payments → ${res.status} ${await res.text()}`);
}

async function main() {
  if (!TOKEN) {
    console.error("Defina TOKEN=<jwt>");
    process.exit(1);
  }

  const [pagamentos, enderecos, residentes] = await Promise.all([
    get("/payments"),
    get("/adress"),
    get("/residents"),
  ]);

  const doTitulo = pagamentos.filter((p) => String(p.title || "").trim() === TITULO);
  const daReferencia = pagamentos.filter((p) => String(p.title || "").trim() === REFERENCIA);

  const enderecosPorPessoa = new Map();
  for (const e of enderecos) {
    if (e.person === undefined || e.person === null || e.person === "") continue;
    const k = String(e.person);
    if (!enderecosPorPessoa.has(k)) enderecosPorPessoa.set(k, []);
    enderecosPorPessoa.get(k).push(e);
  }

  const existentes = new Map();
  for (const p of doTitulo) {
    const k = chave(p.person, p.adress);
    existentes.set(k, (existentes.get(k) || 0) + 1);
  }

  const valorReferencia = new Map();
  const valorReferenciaPessoa = new Map();
  for (const p of daReferencia) {
    valorReferencia.set(chave(p.person, p.adress), Number(p.cash));
    valorReferenciaPessoa.set(String(p.person), Number(p.cash));
  }

  const obsLote = maisFrequente(doTitulo.map((p) => p.obs ?? ""), "");
  const modoLote = maisFrequente(doTitulo.map((p) => p.modePayment ?? null), null);

  const aCriar = [];
  let esperado = 0;
  for (const residente of residentes) {
    const lista = enderecosPorPessoa.get(String(residente.id)) ?? [];
    const alvos = lista.length ? lista.map((e) => e.adress || "") : [""];
    for (const endereco of alvos) {
      esperado++;
      const k = chave(residente.id, endereco);
      const qtd = existentes.get(k) || 0;
      if (qtd > 0) {
        existentes.set(k, qtd - 1);
        continue;
      }
      const cash =
        valorReferencia.get(k) ?? valorReferenciaPessoa.get(String(residente.id)) ?? VALOR_PADRAO;
      aCriar.push({
        nome: residente.name || `#${residente.id}`,
        payload: {
          title: TITULO,
          situation: SITUACAO_ABERTO,
          modePayment: modoLote,
          cash,
          person: residente.id,
          adress: endereco,
          obs: obsLote,
        },
      });
    }
  }

  const sobrando = [...existentes.entries()].filter(([, q]) => q > 0);
  const residentesAfetados = new Set(aCriar.map((i) => i.payload.person)).size;

  console.log(`=== ${EXECUTAR ? "EXECUÇÃO" : "SIMULAÇÃO (nada será criado)"} ===`);
  console.log(`Título: "${TITULO}" | referência de valor: "${REFERENCIA}"`);
  console.log(`Residentes: ${residentes.length} | Endereços: ${enderecos.length}`);
  console.log(`Esperado: ${esperado} | Existentes: ${doTitulo.length} | Referência: ${daReferencia.length}`);
  console.log(`A criar: ${aCriar.length} recibo(s) para ${residentesAfetados} residente(s)`);
  console.log(`Obs do lote: "${obsLote}" | modePayment: ${modoLote} | situação: Aberto`);
  const porValor = {};
  for (const i of aCriar) porValor[i.payload.cash] = (porValor[i.payload.cash] || 0) + 1;
  console.log(`Valores: ${JSON.stringify(porValor)}`);

  for (const i of aCriar) {
    console.log(`  + ${i.nome} | ${i.payload.adress || "(sem endereço)"} | R$ ${i.payload.cash}`);
  }

  if (sobrando.length) {
    console.log("");
    console.log("Existentes que não batem com endereço atual (não serão alterados):");
    for (const [k, q] of sobrando) console.log(`  ? ${k} (x${q})`);
  }

  if (!EXECUTAR) {
    console.log("");
    console.log("Simulação concluída. Para criar, rode novamente com --executar.");
    return;
  }

  let criados = 0;
  let erros = 0;
  for (const item of aCriar) {
    try {
      await criarPagamento(item.payload);
      criados++;
    } catch (err) {
      erros++;
      console.error(`  ! Falha para ${item.nome} (${item.payload.adress}): ${err.message}`);
    }
  }
  console.log("");
  console.log(`Criados: ${criados} | Erros: ${erros}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
