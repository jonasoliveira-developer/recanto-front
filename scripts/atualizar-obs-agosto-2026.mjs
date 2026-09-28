/**
 * Script one-shot: padroniza título, observação e valor dos pagamentos
 * da campanha "Agosto 05/09/2026".
 *
 * Uso:
 *   TOKEN=<jwt> node scripts/atualizar-obs-agosto-2026.mjs
 *   TOKEN=<jwt> node scripts/atualizar-obs-agosto-2026.mjs --dry-run
 *
 * Pegue o TOKEN no Application → Local Storage → token (ou Authorization do DevTools).
 */

const API = process.env.API_URL || "https://recanto-backend-production.up.railway.app";
const TOKEN = process.env.TOKEN;
const DRY_RUN = process.argv.includes("--dry-run");

const TITULO = "Agosto 05/09/2026";
const OBS = "Taxa extra: R$ 60 em Set, Out e Nov (13º Funcionários).";
const VALOR = 190;

function normalizarDataIso(data) {
  if (!data) return null;
  const bruto = String(data).trim().split("T")[0];
  const barra = bruto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (barra) return `${barra[3]}-${barra[2]}-${barra[1]}`;
  const hifen = bruto.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (hifen) return `${hifen[3]}-${hifen[2]}-${hifen[1]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(bruto)) return bruto;
  return null;
}

function pertenceCampanha(p) {
  if (normalizarDataIso(p.datePayment) === "2026-09-05") return true;
  const titulo = String(p.title || "").toLowerCase();
  if (
    titulo.includes("agosto") &&
    (titulo.includes("05/09/2026") || titulo.includes("05-09-2026"))
  ) {
    return true;
  }
  const obs = String(p.obs || "").toLowerCase();
  if (titulo.includes("agosto") && (obs.includes("parcelas") || obs.includes("teremos") || obs.includes("taxa extra"))) {
    return true;
  }
  return false;
}

function precisaAtualizar(p) {
  if (!pertenceCampanha(p)) return false;
  return (
    String(p.title || "").trim() !== TITULO ||
    String(p.obs || "").trim() !== OBS ||
    Number(p.cash) !== VALOR
  );
}

async function main() {
  if (!TOKEN) {
    console.error("Defina TOKEN=<jwt> antes de rodar o script.");
    process.exit(1);
  }

  const listRes = await fetch(`${API}/payments`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!listRes.ok) {
    console.error("Falha ao listar pagamentos:", listRes.status, await listRes.text());
    process.exit(1);
  }

  const pagamentos = await listRes.json();
  const alvos = pagamentos.filter(precisaAtualizar);

  console.log(`Total na API: ${pagamentos.length}`);
  console.log(`A atualizar: ${alvos.length}`);
  if (!alvos.length) {
    console.log("Nada a fazer.");
    return;
  }

  for (const p of alvos) {
    const payload = {
      title: TITULO,
      situation: p.situation,
      modePayment:
        p.modePayment !== undefined && p.modePayment !== null
          ? Number(p.modePayment)
          : null,
      cash: VALOR,
      person: p.person,
      adress: p.adress,
      obs: OBS,
    };

    console.log(
      `#${p.id} | valor ${p.cash} → ${VALOR} | "${p.title}" | obs: "${String(p.obs || "").slice(0, 40)}…"`
    );

    if (DRY_RUN) continue;

    const putRes = await fetch(`${API}/payments/${p.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!putRes.ok) {
      console.error(`  ERRO id=${p.id}:`, putRes.status, await putRes.text());
      process.exit(1);
    }
  }

  console.log(DRY_RUN ? "Dry-run ok (nenhum PUT)." : `Atualizados: ${alvos.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
