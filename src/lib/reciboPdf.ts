import type { jsPDF } from "jspdf";

export type ReciboPdfData = {
  id?: number;
  title?: string;
  dueDate?: string;
  cash?: number | string;
  modePayment?: number | string;
  datePayment?: string;
  situation?: number | string;
  finishPayment?: string;
  personName?: string;
  endereco: string;
  obs?: string;
};

export type ReciboPdfFormatters = {
  formatarDataBarra: (data: string | undefined) => string;
  modePaymentLabel: (mode: unknown) => string;
  situationLabel: (situation: unknown) => string;
};

const RECIBO_WIDTH = 190;
const RECIBO_HEIGHT = 90;
const PADDING_X = 8;
const LINE_HEIGHT = 5;
const OBS_LINE_HEIGHT = 4;
const OBS_FONT_SIZE = 8;
const DEFAULT_FONT_SIZE = 10;

export function desenharReciboPdf(
  doc: jsPDF,
  posX: number,
  posY: number,
  recibo: ReciboPdfData,
  formatters: ReciboPdfFormatters
) {
  const footerY = posY + RECIBO_HEIGHT - 7;
  const maxContentY = footerY - 2;
  const contentRight = posX + RECIBO_WIDTH - PADDING_X;

  doc.setLineDashPattern([2, 2], 0);
  doc.setDrawColor(120);
  doc.roundedRect(posX, posY, RECIBO_WIDTH, RECIBO_HEIGHT, 4, 4, "S");
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(
    "Associação Comunitária Dos Moradores Do Loteamento Recanto De Itapuã",
    posX + RECIBO_WIDTH / 2,
    posY + 8,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(DEFAULT_FONT_SIZE);

  let y = posY + 16;

  const addField = (
    label: string,
    value: string,
    opts?: { compact?: boolean }
  ) => {
    if (y >= maxContentY) return;

    const fontSize = opts?.compact ? OBS_FONT_SIZE : DEFAULT_FONT_SIZE;
    const lineHeight = opts?.compact ? OBS_LINE_HEIGHT : LINE_HEIGHT;
    doc.setFontSize(fontSize);

    doc.text(`${label}:`, posX + PADDING_X, y, { baseline: "top" });
    const labelWidth = doc.getTextWidth(`${label}:`);
    const valueX = posX + PADDING_X + labelWidth + 2.83;
    const maxWidth = Math.max(20, contentRight - valueX);
    const lines = doc.splitTextToSize(String(value), maxWidth) as string[];

    let drawnLines = 0;
    for (const line of lines) {
      if (y + drawnLines * lineHeight > maxContentY) break;
      doc.text(line, valueX, y + drawnLines * lineHeight, { baseline: "top" });
      drawnLines += 1;
    }

    y += Math.max(1, drawnLines) * lineHeight + (opts?.compact ? 0 : 1);
    doc.setFontSize(DEFAULT_FONT_SIZE);
  };

  addField("TÍTULO", recibo.title || "-");
  if (recibo.dueDate) {
    addField("VENCIMENTO", formatters.formatarDataBarra(recibo.dueDate));
  }
  addField(
    "VALOR",
    `R$ ${Number(recibo.cash).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
  );
  addField("TIPO PAGAMENTO", formatters.modePaymentLabel(recibo.modePayment));
  addField("DATA ABERTURA", formatters.formatarDataBarra(recibo.datePayment));
  addField("SITUAÇÃO", formatters.situationLabel(recibo.situation));
  addField("DATA FECHAMENTO", formatters.formatarDataBarra(recibo.finishPayment));
  addField("NOME", recibo.personName || "-");
  addField("ENDEREÇO", recibo.endereco);
  if (recibo.obs) {
    addField("OBSERVAÇÕES", recibo.obs, { compact: true });
  }

  doc.setFontSize(8);
  doc.setTextColor(80, 80, 200);
  doc.text("https://recantodeitapua.com.br", posX + PADDING_X, footerY);
  doc.setTextColor(120);
  doc.setFontSize(7);
  if (recibo.id !== undefined) {
    doc.text(`ID: ${recibo.id}`, posX + RECIBO_WIDTH - 40, footerY);
  }
  doc.setFontSize(DEFAULT_FONT_SIZE);
  doc.setTextColor(0);
}

export function abrirReciboPdf(doc: jsPDF) {
  window.open(doc.output("bloburl"), "_blank");
}
