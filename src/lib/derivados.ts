import { filtrarPorSituacao } from "./filtros";

export type PagamentoResumo = {
  cash?: number | string | null;
  situation?: number | string | null;
};

export function calcularKpiFinanceiro(pagamentos: PagamentoResumo[]) {
  const recebidos = filtrarPorSituacao(pagamentos, "1");
  const abertos = filtrarPorSituacao(pagamentos, "0");
  const totalRecebido = recebidos.reduce((acc, p) => acc + Number(p.cash || 0), 0);
  const totalAberto = abertos.reduce((acc, p) => acc + Number(p.cash || 0), 0);
  const total = pagamentos.reduce((acc, p) => acc + Number(p.cash || 0), 0);
  return {
    totalRecebido,
    totalAberto,
    total,
    qtdFechados: recebidos.length,
    qtdAbertos: abertos.length,
    qtdTotal: pagamentos.length,
  };
}

export function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
