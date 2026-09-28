/**
 * Análise (somente leitura) — não apaga nada.
 *
 * Uso:
 *   TOKEN=<jwt> node scripts/analisar-agosto-05092026.mjs
 */

const API = process.env.API_URL || "https://recanto-backend-production.up.railway.app";
const TOKEN = process.env.TOKEN;
const TITULO = "Agosto 05/09/2026";

function normalizarDataIso(data) {
  if (!data) return null;
  const bruto = String(data).trim().split("T")[0];
  const barra = bruto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (barra) return `${barra[3]}-${barra[2]}-${barra[1]}`;
  const hifen = bruto.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (hifen) return `${hifen[3]}-${hifen[2]}-${hifen[1]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(bruto)) return bruto;
  return bruto;
}

async function main() {
  if (!TOKEN) {
    console.error("Defina TOKEN=<jwt>");
    process.exit(1);
  }

  const res = await fetch(`${API}/payments`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    console.error("Falha GET /payments:", res.status, await res.text());
    process.exit(1);
  }

  const pagamentos = await res.json();
  if (!Array.isArray(pagamentos)) {
    console.error("Resposta inesperada:", typeof pagamentos);
    process.exit(1);
  }

  const tituloExato = pagamentos.filter(
    (p) => String(p.title || "").trim() === TITULO
  );
  const tituloParecido = pagamentos.filter((p) => {
    const t = String(p.title || "").toLowerCase();
    return t.includes("agosto") && (t.includes("05/09/2026") || t.includes("05-09-2026"));
  });

  const porTitulo = {};
  for (const p of pagamentos) {
    const t = String(p.title || "(sem título)").trim() || "(sem título)";
    porTitulo[t] = (porTitulo[t] || 0) + 1;
  }
  const topTitulos = Object.entries(porTitulo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  console.log("=== Análise GET /payments ===");
  console.log(`Total de pagamentos na API: ${pagamentos.length}`);
  console.log(`Com título EXATO "${TITULO}": ${tituloExato.length}`);
  console.log(`Com título parecido (Agosto + 05/09/2026): ${tituloParecido.length}`);
  console.log("");
  console.log("Top títulos (até 15):");
  for (const [t, n] of topTitulos) {
    console.log(`  ${n}\t${t}`);
  }

  if (tituloExato.length) {
    console.log("");
    console.log("Amostra dos que ainda existem com título exato (até 10):");
    for (const p of tituloExato.slice(0, 10)) {
      console.log(
        `  #${p.id} | cash=${p.cash} | date=${normalizarDataIso(p.datePayment)} | person=${p.personName || p.person}`
      );
    }
  } else {
    console.log("");
    console.log(
      `CONCLUSÃO: não restou nenhum pagamento com título exato "${TITULO}".`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
