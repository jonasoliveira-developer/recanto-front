
"use client";
import { useEffect, useState } from "react";
import { FaRegFileAlt, FaPrint } from "react-icons/fa";
import { jsPDF } from "jspdf";
import dayjs from "dayjs";
import { listarPagamentos, criarPagamento, atualizarPagamento, removerPagamento } from "../../services/pagamentosApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth, UserRole, hasRole } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";
import { Paginacao } from "../../components/Paginacao";

export default function Pagamentos() {
  // Contexto de autenticação
  const { usuario, token } = useAuth ? useAuth() : { usuario: null, token: null };

  // Estados principais
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>("");
  const [situacaoFiltro, setSituacaoFiltro] = useState<string>("");
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const itensPorPagina = 10;
  const [modalAberto, definirModalAberto] = useState<boolean>(false);
  const [editando, setEditando] = useState<any>(null);
  const [modalRecibosAberto, setModalRecibosAberto] = useState<boolean>(false);
  const [reciboAberto, setReciboAberto] = useState<boolean>(false);
  const [pagamentoRecibo, setPagamentoRecibo] = useState<any>(null);
  // Para formulário do modal
  const [titulo, setTitulo] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [situacao, setSituacao] = useState("");
  const [modoPagamento, setModoPagamento] = useState("");
  const [valor, setValor] = useState("");
  const [desconto, setDesconto] = useState("");
  const [finalizado, setFinalizado] = useState(false);
  const [obs, setObs] = useState("");
  const [pessoa, setPessoa] = useState("");
  const [nomePessoa, setNomePessoa] = useState("");
  const [endereco, setEndereco] = useState("");
  // Opções de situação para o select
  const opcoesSituacao = [
    { codigo: "0", nome: "Aberto" },
    { codigo: "1", nome: "Fechado" },
  ];

  // Estados para selects dinâmicos
  const [residentes, setResidentes] = useState<any[]>([]);
  const [enderecos, setEnderecos] = useState<any[]>([]);

  // Carregar residentes e endereços ao abrir modal
  useEffect(() => {
    if (modalAberto) {
      async function fetchData() {
        try {
          if (token) {
            const listaResidentes = await (await import('../../services/recantoApi')).listarResidentes(token);
            setResidentes(listaResidentes || []);
            const listaEnderecos = await (await import('../../services/enderecosApi')).listarEnderecos(token);
            setEnderecos(listaEnderecos || []);
          }
        } catch (e) {
          toast.error('Erro ao carregar residentes ou endereços!');
        }
      }
      fetchData();
    }
  }, [modalAberto, token]);
            // Função para gerar PDF do DRE
            function gerarPdfDRE() {
              const doc = new jsPDF({ unit: 'mm', format: 'a4' });
              const pageWidth = 210;
              const marginX = 10;
              let y = 15;
              const itensPorPagina = 25;
              // Cabeçalho
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(13);
              doc.text('Associação Comunitária', pageWidth / 2, y, { align: 'center' });
              y += 7;
              doc.text('Dos Moradores Do Loteamento Recanto De Itapuã', pageWidth / 2, y, { align: 'center' });
              y += 8;
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(11);
              doc.text('Demonstrativo de Resultados (DRE)', pageWidth / 2, y, { align: 'center' });
              y += 7;
              doc.setFontSize(9);
              doc.text(`Período: ${formatarDataBarra(mesInicial + '-' + anoInicial)} a ${formatarDataBarra(mesFinal + '-' + anoFinal)}`, marginX, y);
              doc.text(`Emitido em: ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth - marginX, y, { align: 'right' });
              y += 7;
              // Resumo
              doc.setFontSize(10);
              doc.text(`Total de pagamentos: ${qtdTotal}`, marginX, y);
              doc.text(`Fechados: ${qtdFechados} (R$ ${totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`, marginX + 60, y);
              doc.text(`Abertos: ${qtdAbertos} (R$ ${totalAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`, marginX + 120, y);
              y += 8;
              doc.text(`Total geral: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, marginX, y);
              y += 10;
              // Tabela desenhada com linhas verticais e horizontais, agora paginada
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(9);
              const headers = ['Título', 'Situação', 'Valor', 'Data Pagamento', 'Pessoa'];
              const colWidths = [50, 28, 22, 28, 72];
              const colCount = headers.length;
              const rowHeight = 8;
              let totalRows = pagamentosFiltrados.length;
              let pageRows = itensPorPagina;
              let currentRow = 0;
              while (currentRow < totalRows) {
                // Cabeçalho da tabela
                let x = marginX;
                let tableY = y;
                for (let i = 0; i < colCount; i++) {
                  doc.text(headers[i], x + 2, tableY + 5, { align: 'left' });
                  x += colWidths[i];
                }
                // Linhas verticais do cabeçalho
                x = marginX;
                for (let i = 0; i <= colCount; i++) {
                  let colX = x;
                  doc.setDrawColor(180);
                  doc.setLineWidth(0.2);
                  doc.line(colX, tableY, colX, tableY + rowHeight * Math.min(pageRows, totalRows - currentRow) + rowHeight);
                  x += (i < colCount ? colWidths[i] : 0);
                }
                // Linhas horizontais do cabeçalho
                doc.setDrawColor(120);
                doc.setLineWidth(0.4);
                doc.line(marginX, tableY, pageWidth - marginX, tableY);
                doc.line(marginX, tableY + rowHeight, pageWidth - marginX, tableY + rowHeight);
                // Linhas de dados
                doc.setFont('helvetica', 'normal');
                for (let i = 0; i < Math.min(pageRows, totalRows - currentRow); i++) {
                  let p = pagamentosFiltrados[currentRow + i];
                  let rowY = tableY + rowHeight * (i + 1);
                  x = marginX;
                  doc.setFontSize(9);
                  doc.text(String(p.title || '-'), x + 2, rowY + 5, { maxWidth: colWidths[0] - 4 });
                  x += colWidths[0];
                  doc.text(situationReturn(p.situation), x + 2, rowY + 5);
                  x += colWidths[1];
                  doc.setFontSize(8);
                  doc.text('R$ ' + Number(p.cash).toLocaleString('pt-BR', { minimumFractionDigits: 2 }), x + 2, rowY + 5);
                  x += colWidths[2];
                  doc.setFontSize(9);
                  doc.text(formatarDataBarra(p.datePayment), x + 2, rowY + 5);
                  x += colWidths[3];
                  doc.text(String(p.personName || '-'), x + 2, rowY + 5, { maxWidth: colWidths[4] - 4 });
                  // Linha horizontal inferior da linha
                  doc.setDrawColor(220);
                  doc.setLineWidth(0.2);
                  doc.line(marginX, rowY + rowHeight, pageWidth - marginX, rowY + rowHeight);
                }
                y = tableY + rowHeight * (Math.min(pageRows, totalRows - currentRow) + 1);
                currentRow += pageRows;
                if (currentRow < totalRows) {
                  doc.addPage();
                  y = 15;
                  // Redesenhar cabeçalho do documento
                  doc.setFont('helvetica', 'bold');
                  doc.setFontSize(13);
                  doc.text('Associação Comunitária', pageWidth / 2, y, { align: 'center' });
                  y += 7;
                  doc.text('Dos Moradores Do Loteamento Recanto De Itapuã', pageWidth / 2, y, { align: 'center' });
                  y += 8;
                  doc.setFont('helvetica', 'normal');
                  doc.setFontSize(11);
                  doc.text('Demonstrativo de Resultados (DRE)', pageWidth / 2, y, { align: 'center' });
                  y += 7;
                  doc.setFontSize(9);
                  doc.text(`Período: ${formatarDataBarra(mesInicial + '-' + anoInicial)} a ${formatarDataBarra(mesFinal + '-' + anoFinal)}`, marginX, y);
                  doc.text(`Emitido em: ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth - marginX, y, { align: 'right' });
                  y += 7;
                  doc.setFontSize(10);
                  doc.text(`Total de pagamentos: ${qtdTotal}`, marginX, y);
                  doc.text(`Fechados: ${qtdFechados} (R$ ${totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`, marginX + 60, y);
                  doc.text(`Abertos: ${qtdAbertos} (R$ ${totalAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`, marginX + 120, y);
                  y += 8;
                  doc.text(`Total geral: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, marginX, y);
                  y += 10;
                }
              }
              // Rodapé
              doc.setFontSize(8);
              doc.setTextColor(120);
              doc.text('Documento gerado automaticamente pelo sistema Recanto de Itapuã.', pageWidth / 2, 295, { align: 'center' });
              doc.setTextColor(0);
              window.open(doc.output('bloburl'), '_blank');
            }
          // Estado para modal DRE
          const [modalDREAberto, setModalDREAberto] = useState(false);
        // Filtros de data inicial/final (mês/ano)
        const meses = [
          { value: '01', label: 'Janeiro' },
          { value: '02', label: 'Fevereiro' },
          { value: '03', label: 'Março' },
          { value: '04', label: 'Abril' },
          { value: '05', label: 'Maio' },
          { value: '06', label: 'Junho' },
          { value: '07', label: 'Julho' },
          { value: '08', label: 'Agosto' },
          { value: '09', label: 'Setembro' },
          { value: '10', label: 'Outubro' },
          { value: '11', label: 'Novembro' },
          { value: '12', label: 'Dezembro' },
        ];
        const anoAtual = new Date().getFullYear();
        const anos = Array.from({ length: 11 }, (_, i) => anoAtual - 5 + i);
        // Estado dos selects de filtro
        const [mesInicial, setMesInicial] = useState(() => String(new Date().getMonth() + 1).padStart(2, '0'));
        const [anoInicial, setAnoInicial] = useState(() => String(anoAtual));
        // Data final: 1 mês depois do mês atual
        const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
        const [mesFinal, setMesFinal] = useState(() => String(nextMonth.getMonth() + 1).padStart(2, '0'));
        const [anoFinal, setAnoFinal] = useState(() => String(nextMonth.getFullYear()));

      // ...já declarado no início do componente...

      // Carregar pagamentos (mock inicial)
      async function carregarPagamentos() {
        setCarregando(true);
        try {
            const lista = await listarPagamentos(token || "");
          setPagamentos(lista || []);
        } catch (e) {
          toast.error("Erro ao carregar pagamentos!");
        } finally {
          setCarregando(false);
        }
      }

      useEffect(() => {
        carregarPagamentos();
      }, []);

      // Abrir modal novo
      function abrirModalNovo() {
        setEditando(null);
        definirModalAberto(true);
        setTitulo("");
        setDataPagamento("");
        setSituacao("");
        setModoPagamento("");
        setValor("");
        setDesconto("");
        setFinalizado(false);
        setObs("");
        setPessoa("");
        setNomePessoa("");
        setEndereco("");
      }

      // Abrir modal editar
      function abrirModalEditar(pagamento: any) {
        setEditando(pagamento);
        definirModalAberto(true);
        setTitulo(pagamento.title || "");
        setDataPagamento(pagamento.datePayment || "");
        setSituacao(String(pagamento.situation ?? ""));
        setModoPagamento(pagamento.modePayment || "");
        setValor(pagamento.cash || "");
        setDesconto(pagamento.discount || "");
        setFinalizado(pagamento.situation === 1);
        setObs(pagamento.obs || "");
        setPessoa(pagamento.personId || "");
        setNomePessoa(pagamento.personName || "");
        setEndereco(pagamento.adress || "");
      }

      // Abrir recibo
      function abrirRecibo(pagamento: any) {
        setPagamentoRecibo(pagamento);
        setReciboAberto(true);
      }

      // Funções auxiliares para exibição
      function modePaymentReturn(mode: any) {
        if (mode === undefined || mode === null) return '-';
        if (typeof mode === 'string') return mode;
        if (mode === 0) return 'Dinheiro';
        if (mode === 1) return 'Pix';
        if (mode === 2) return 'Cartão';
        return String(mode);
      }
      function situationReturn(sit: any) {
        if (sit === 0) return 'Aberto';
        if (sit === 1) return 'Fechado';
        return String(sit ?? '-');
      }

      // Handler do submit do formulário
      async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
          const id = localStorage.getItem("id");
          const userName = localStorage.getItem("user");
          // Garantir formato dd-MM-yyyy para o backend Java
          function formatarParaDDMMYYYY(data: string) {
            if (!data) return '';
            if (data.includes('-')) {
              // yyyy-MM-dd → dd-MM-yyyy
              const [ano, mes, dia] = data.split('-');
              return `${dia.padStart(2, '0')}-${mes.padStart(2, '0')}-${ano}`;
            }
            if (data.includes('/')) {
              // dd/MM/yyyy → dd-MM-yyyy
              const [dia, mes, ano] = data.split('/');
              return `${dia.padStart(2, '0')}-${mes.padStart(2, '0')}-${ano}`;
            }
            return data;
          }
          let dataFormatada = formatarParaDDMMYYYY(dataPagamento);
          // Enviar enums como inteiros conforme backend Java
          const payload = {
            title: titulo,
            datePayment: dataFormatada,
            situation: situacao !== '' ? parseInt(situacao, 10) : null,
            modePayment: modoPagamento !== '' ? parseInt(modoPagamento, 10) : null,
            cash: valor,
            discount: desconto,
            obs,
            person: pessoa ? parseInt(pessoa, 10) : null,
            finishPayment: null
          };
          if (editando) {
            await atualizarPagamento(editando.id, payload, token || "");
            toast.success("Pagamento atualizado!");
          } else {
            await criarPagamento(payload, token || "");
            toast.success("Pagamento criado!");
          }
          definirModalAberto(false);
          setEditando(null);
          carregarPagamentos();
        } catch (erro: any) {
          toast.error("Erro ao salvar pagamento! " + (erro?.response?.data?.message || ""));
        }
      }

      // Funções placeholder para PDF (não implementadas)
      function gerarPdfRelatorioDRE() {
        setModalDREAberto(true);
      }
        // ...existing code...


      function gerarPdfRecibosLote() {
        if (!pagamentos.length) {
          toast.info("Nenhum pagamento para recibo.");
          return;
        }
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const reciboWidth = 190;
        const reciboHeight = 90;
        const espacamento = 8; // Espaço entre recibos
        const localPosX = 10;
        const marginY = 10;
        const recibosPorFolha = 3;
        pagamentos.forEach((recibo, idx) => {
          const posY = marginY + (idx % recibosPorFolha) * (reciboHeight + espacamento);
          // Nova página a cada 3 recibos
          if (idx > 0 && idx % recibosPorFolha === 0) doc.addPage();
          doc.setLineDashPattern([2, 2], 0);
          doc.setDrawColor(120);
          doc.roundedRect(localPosX, posY, reciboWidth, reciboHeight, 4, 4, 'S');
          doc.setLineDashPattern([], 0);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('Associação Comunitária Dos Moradores Do Loteamento Recanto De Itapuã', localPosX + reciboWidth / 2, posY + 8, { align: 'center' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          let y = posY + 16;
          const addField = (label: string, value: string) => {
            doc.text(label + ':', localPosX + 8, y, { baseline: 'top' });
            const labelWidth = doc.getTextWidth(label + ':');
            const space1mm = 2.83;
            doc.text(String(value), localPosX + 8 + labelWidth + space1mm, y, { baseline: 'top' });
            y += 7;
          };
          addField('TÍTULO', recibo.title || '-');
          if (recibo.dueDate) addField('VENCIMENTO', formatarDataBarra(recibo.dueDate));
          addField('VALOR', 'R$ ' + Number(recibo.cash).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
          addField('TIPO PAGAMENTO', modePaymentReturn(recibo.modePayment));
          addField('DATA ABERTURA', formatarDataBarra(recibo.datePayment));
          addField('SITUAÇÃO', situationReturn(recibo.situation));
          addField('DATA FECHAMENTO', formatarDataBarra(recibo.finishPayment));
          addField('NOME', recibo.personName || '-');
          addField('ENDEREÇO', recibo.adress || '-');
          if (recibo.obs) addField('OBSERVAÇÕES', String(recibo.obs));
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 200);
          doc.text('https://recantodeitapua.com.br', localPosX + 8, posY + reciboHeight - 7);
          doc.setTextColor(120);
          doc.setFontSize(7);
          doc.text('ID: ' + recibo.id, localPosX + reciboWidth - 40, posY + reciboHeight - 7);
          doc.setFontSize(10);
          doc.setTextColor(0);
        });
        window.open(doc.output('bloburl'), '_blank');
      }
    // ...estados principais já declarados acima...

    // Funções auxiliares para paginação e busca
    const definirBusca = setBusca;
    const definirPaginaAtual = setPaginaAtual;
  // Função para trocar '-' por '/' em datas
  function formatarDataBarra(data: string | undefined) {
    if (!data) return '-';
    return String(data).replace(/-/g, '/');
  }

  // ...restante do código da função Pagamentos...

  // Filtragem por data de abertura (datePayment)
  function parseDataInicio(mes: string, ano: string) {
    // Retorna Date do primeiro dia do mês
    return new Date(Number(ano), Number(mes) - 1, 1, 0, 0, 0, 0);
  }
  function parseDataFim(mes: string, ano: string) {
    // Retorna Date do último dia do mês
    return new Date(Number(ano), Number(mes), 0, 23, 59, 59, 999);
  }
  function parseDataPagamento(data: string) {
    // data no formato dd-MM-yyyy
    if (!data || typeof data !== 'string') return null;
    const partes = data.split('-');
    if (partes.length !== 3) return null;
    return new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]), 12, 0, 0, 0);
  }
  const dataInicioFiltro = parseDataInicio(mesInicial, anoInicial);
  const dataFimFiltro = parseDataFim(mesFinal, anoFinal);
  const pagamentosFiltrados = pagamentos.filter((pagamento) => {
    const dataPag = parseDataPagamento(pagamento.datePayment);
    if (!dataPag) return false;
    if (dataPag < dataInicioFiltro || dataPag > dataFimFiltro) return false;
    // Filtro de busca e situação
    const termo = busca.toLowerCase();
    const textoOk =
      !termo ||
      pagamento.title?.toLowerCase().includes(termo) ||
      pagamento.personName?.toLowerCase().includes(termo);
    let situacaoOk = true;
    if (situacaoFiltro === '0') {
      situacaoOk = String(pagamento.situation) === '0';
    } else if (situacaoFiltro === '1') {
      situacaoOk = String(pagamento.situation) === '1';
    }
    return textoOk && situacaoOk;
  });

  // Cálculo do demonstrativo DRE (deve vir após pagamentosFiltrados)
  const totalRecebido = pagamentosFiltrados.filter(p => p.situation === 1).reduce((acc, p) => acc + Number(p.cash || 0), 0);
  const totalAberto = pagamentosFiltrados.filter(p => p.situation === 0).reduce((acc, p) => acc + Number(p.cash || 0), 0);
  const total = pagamentosFiltrados.reduce((acc, p) => acc + Number(p.cash || 0), 0);
  const qtdFechados = pagamentosFiltrados.filter(p => p.situation === 1).length;
  const qtdAbertos = pagamentosFiltrados.filter(p => p.situation === 0).length;
  const qtdTotal = pagamentosFiltrados.length;

  // Paginação
  const totalPaginas = Math.ceil(pagamentosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const pagamentosPaginados = pagamentosFiltrados.slice(inicio, fim);

  function aoMudarPagina(novaPagina: number) {
    definirPaginaAtual(novaPagina);
  }

  function aoBuscar(e: React.ChangeEvent<HTMLInputElement>) {
    definirBusca(e.target.value);
    definirPaginaAtual(1);
  }

  return (
    <div className="min-h-screen bg-[#FFF] p-4 font-sans">
      <header className="mb-6">
        {/* Removido bloco de associação em duas linhas */}
        <h1 className="text-2xl font-extrabold text-[#69553B] mb-6 tracking-wider">Pagamentos</h1>
        <section className="rounded-lg bg-pink-100 p-4 mb-4 border border-[#C3B4A8]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            {/* Filtros de data inicial/final */}
            <div className="flex flex-col gap-2 w-full order-1 md:order-0">
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex flex-col flex-1 w-full">
                  <label className="text-xs text-gray-600 mb-1">Data Inicial</label>
                  <div className="flex flex-row gap-2 w-full">
                    <select value={mesInicial} onChange={e => setMesInicial(e.target.value)} className="rounded border px-4 py-3 text-lg w-1/2 bg-white">
                      {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select value={anoInicial} onChange={e => setAnoInicial(e.target.value)} className="rounded border px-4 py-3 text-lg w-1/2 bg-white">
                      {anos.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <span className="mx-1 mb-3 hidden sm:inline self-end">até</span>
                <div className="flex flex-col flex-1 w-full">
                  <label className="text-xs text-gray-600 mb-1">Data Final</label>
                  <div className="flex flex-row gap-2 w-full">
                    <select value={mesFinal} onChange={e => setMesFinal(e.target.value)} className="rounded border px-4 py-3 text-lg w-1/2 bg-white">
                      {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select value={anoFinal} onChange={e => setAnoFinal(e.target.value)} className="rounded border px-4 py-3 text-lg w-1/2 bg-white">
                      {anos.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-row gap-2 flex-wrap items-end">
                  <button
                    className="rounded-lg bg-[#DDA329] px-6 py-2 text-[#69553B] font-bold shadow hover:bg-[#C3B4A8] hover:text-[#69553B] border border-[#69553B] cursor-pointer w-full sm:w-auto mb-2 sm:mb-0 transition-colors"
                    onClick={abrirModalNovo}
                  >
                    Novo
                  </button>
                  <button
                    className="rounded-lg bg-[#69553B] px-4 py-2 text-[#FFF] font-bold shadow hover:bg-[#DDA329] hover:text-[#69553B] border border-[#69553B] cursor-pointer flex items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0 transition-colors"
                    onClick={() => setModalRecibosAberto(true)}
                    title="Gerar recibos em lote"
                  >
                    <FaRegFileAlt /> Recibos
                  </button>
                  <button
                    className="rounded-lg bg-[#C3B4A8] px-6 py-2 text-[#69553B] font-bold shadow hover:bg-[#DDA329] hover:text-[#69553B] border border-[#69553B] cursor-pointer flex items-center gap-2 w-full sm:w-auto transition-colors"
                    onClick={gerarPdfRelatorioDRE}
                    title="Relatório DRE"
                  >
                    <span style={{fontSize: '1.2em'}}>📊</span> DRE
                  </button>
                </div>
              </div>
              <div className="flex flex-row gap-2 flex-wrap items-end mt-2">
                <input
                  type="text"
                  value={busca}
                  onChange={aoBuscar}
                  placeholder="Buscar por título ou pessoa"
                  className="rounded border border-[#C3B4A8] px-3 py-2 grow min-w-0 focus:ring-2 focus:ring-[#DDA329] bg-white"
                />
                <select
                  value={situacaoFiltro}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === "") {
                      setSituacaoFiltro("");
                    } else {
                      setSituacaoFiltro(value);
                    }
                    definirPaginaAtual(1);
                  }}
                  className="rounded border border-[#C3B4A8] px-3 py-2 w-36 shrink-0 focus:ring-2 focus:ring-[#DDA329] bg-white"
                >
                  <option value="">Todos</option>
                  <option value="0">Aberto</option>
                  <option value="1">Fechado</option>
                </select>
              </div>
            </div>
          </div>
        </section>
            {/* Modal de recibos em lote */}
            <Modal aberto={modalRecibosAberto} aoFechar={() => setModalRecibosAberto(false)} titulo="Recibos em lote" >
              <div className="max-h-[90vh] w-full max-w-5xl mx-auto flex flex-col bg-[#FFF] p-6 overflow-auto border border-[#C3B4A8]">
                <div className="flex flex-row gap-2 items-center justify-end mb-4">
                  <button
                    className="flex items-center gap-2 bg-[#69553B] hover:bg-[#DDA329] text-[#FFF] hover:text-[#69553B] px-4 py-2 rounded shadow h-10 border border-[#69553B] font-bold transition-colors"
                    onClick={gerarPdfRecibosLote}
                  >
                    <FaPrint /> Imprimir recibos
                  </button>
                </div>
                <div className="space-y-6 flex-1">
                  {pagamentosFiltrados.length === 0 && (
                    <div className="text-center text-gray-500">Nenhum pagamento encontrado.</div>
                  )}
                  {pagamentosFiltrados.map((recibo, idx) => (
                    <div key={recibo.id || idx} className="border rounded p-4 bg-gray-50">
                      <div className="font-bold text-pink-800 mb-2">Recibo #{recibo.id}</div>
                      <div><b>TÍTULO:</b> {recibo.title || '-'}</div>
                      <div><b>VALOR:</b> {recibo.cash !== undefined ? 'R$ ' + Number(recibo.cash).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}</div>
                      <div><b>TIPO PAGAMENTO:</b> {modePaymentReturn(recibo.modePayment)}</div>
                      <div><b>DATA PAGAMENTO:</b> {formatarDataBarra(recibo.datePayment)}</div>
                      <div><b>DATA FECHAMENTO:</b> {formatarDataBarra(recibo.finishPayment)}</div>
                      <div><b>SITUAÇÃO:</b> {situationReturn(recibo.situation)}</div>
                      <div><b>NOME:</b> {recibo.personName || '-'}</div>
                      <div><b>ENDEREÇO:</b> {recibo.adress || '-'}</div>
                      <div><b>OBSERVAÇÕES:</b> {recibo.obs || '-'}</div>
                      <div className="text-xs text-gray-400 mt-2">ID: {recibo.id}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Modal>
      </header>
      <section className="rounded-lg bg-white p-4">
        {carregando ? (
          <p className="text-center text-pink-700">Carregando...</p>
        ) : pagamentosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum pagamento encontrado.</p>
        ) : (
          <>
            {/* Tabela em tela grande, cards em tela pequena */}
            <div className="hidden md:flex justify-center w-full">
              <div className="w-full mx-auto">
                <table className="min-w-175 w-full border rounded-lg overflow-hidden">
                  <thead className="bg-pink-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Título</th>
                      <th className="px-4 py-2 text-center">Situação</th>
                      <th className="px-4 py-2 text-right">Valor</th>
                      <th className="px-4 py-2 text-left">Pessoa</th>
                      <th className="px-4 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagamentosPaginados.map((pagamento) => {
                      // Todos podem ver todos os pagamentos
                      return (
                        <tr key={pagamento.id} className="border-b transition-colors duration-200 hover:bg-[#FFF7E6] cursor-pointer">
                          <td className="px-4 py-2 font-bold text-[#69553B] text-left">{pagamento.title}</td>
                          <td className="px-4 py-2 text-center">{
                            pagamento.situation === 0 ? 'Aberto' : pagamento.situation === 1 ? 'Fechado' : pagamento.situation
                          }</td>
                          <td className="px-4 py-2 text-right">R$ {pagamento.cash}</td>
                          <td className="px-4 py-2 text-left">{pagamento.personName}</td>
                          <td className="px-4 py-2 flex gap-2 items-center justify-center">
                            <button
                              className="rounded bg-[#C3B4A8] px-2 py-1 text-[#69553B] hover:bg-[#DDA329] hover:text-[#69553B] mr-2 border border-[#69553B] transition-colors"
                              title="Imprimir recibo"
                              onClick={() => abrirRecibo(pagamento)}
                            >
                              <FaRegFileAlt />
                            </button>
                            <>
                              <button
                                className="rounded bg-[#DDA329] px-3 py-1 text-[#69553B] font-bold hover:bg-[#C3B4A8] hover:text-[#69553B] cursor-pointer mr-2 border border-[#69553B] transition-colors"
                                onClick={() => abrirModalEditar(pagamento)}
                              >Editar</button>
                              <button
                                className="rounded bg-[#69553B] px-3 py-1 text-[#FFF] font-bold hover:bg-[#C3B4A8] hover:text-[#69553B] cursor-pointer border border-[#69553B] transition-colors"
                                onClick={async () => {
                                  if (window.confirm("Tem certeza que deseja excluir este pagamento?")) {
                                    try {
                                      if (!token) {
                                        toast.error("Token de autenticação não encontrado.");
                                        return;
                                      }
                                      await removerPagamento(pagamento.id, token || "");
                                      toast.success("Pagamento excluído com sucesso!");
                                      await carregarPagamentos();
                                    } catch (erro: any) {
                                      toast.error("Erro ao excluir pagamento! " + (erro?.response?.data?.message || ""));
                                    }
                                  }
                                }}
                              >Excluir</button>
                            </>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <ul className="flex flex-col gap-4 md:hidden">
              {pagamentosPaginados.map((pagamento) => {
                // Todos podem ver todos os pagamentos
                return (
                  <li key={pagamento.id} className="rounded border border-[#C3B4A8] p-4 shadow hover:shadow-lg transition-colors duration-200 hover:bg-[#FFF7E6] cursor-pointer">
                    <div className="mb-2">
                      <span className="block text-xs text-gray-500 font-semibold">Título</span>
                      <span className="block text-base text-[#69553B] font-bold">{pagamento.title}</span>
                    </div>
                    <div className="mb-2">
                      <span className="block text-xs text-gray-500 font-semibold">Situação</span>
                      <span className="block text-base text-gray-700">{
                        pagamento.situation === 0 ? 'Aberto' : pagamento.situation === 1 ? 'Fechado' : pagamento.situation
                      }</span>
                    </div>
                    <div className="mb-2">
                      <span className="block text-xs text-gray-500 font-semibold">Valor</span>
                      <span className="block text-base text-gray-700">R$ {pagamento.cash}</span>
                    </div>
                    <div className="mb-2">
                      <span className="block text-xs text-gray-500 font-semibold">Pessoa</span>
                      <span className="block text-base text-gray-700">{pagamento.personName}</span>
                    </div>
                    <div className="flex gap-2 mt-2 items-center">
                      <button
                        className="rounded bg-[#C3B4A8] px-2 py-1 text-[#69553B] hover:bg-[#DDA329] hover:text-[#69553B] mr-2 border border-[#69553B] transition-colors"
                        title="Visualizar recibo"
                        onClick={() => abrirRecibo(pagamento)}
                      >
                        <FaRegFileAlt />
                      </button>
                      <>
                        <button
                          className="rounded bg-[#DDA329] px-3 py-1 text-[#69553B] font-bold hover:bg-[#C3B4A8] hover:text-[#69553B] cursor-pointer mr-2 border border-[#69553B] transition-colors"
                          onClick={() => abrirModalEditar(pagamento)}
                        >Editar</button>
                        <button
                          className="rounded bg-[#69553B] px-3 py-1 text-[#FFF] font-bold hover:bg-[#C3B4A8] hover:text-[#69553B] cursor-pointer border border-[#69553B] transition-colors"
                          onClick={async () => {
                            if (window.confirm("Tem certeza que deseja excluir este pagamento?")) {
                              try {
                                if (!token) {
                                  toast.error("Token de autenticação não encontrado.");
                                  return;
                                }
                                await removerPagamento(pagamento.id, token || "");
                                toast.success("Pagamento excluído com sucesso!");
                                await carregarPagamentos();
                              } catch (erro: any) {
                                toast.error("Erro ao excluir pagamento! " + (erro?.response?.data?.message || ""));
                              }
                            }
                          }}
                        >Excluir</button>
                      </>
                    </div>
                  </li>
                );
              })}
            </ul>
            {/* Modal de Recibo individual - global, fora do .map() */}
            <Modal aberto={reciboAberto} aoFechar={() => setReciboAberto(false)} titulo="Associação Comunitária Dos Moradores Do Loteamento Recanto De Itapuã - Recibo">
              {pagamentoRecibo && <>
                {(() => { console.log('Recibo selecionado:', pagamentoRecibo); return null; })()}
                <div className="flex flex-col gap-2 text-base">
                  <button
                    className="self-end mb-2 px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 print:hidden"
                    title="Imprimir recibo"
                    onClick={() => {
                      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
                      const reciboWidth = 190;
                      const reciboHeight = 90;
                      const localPosX = 10;
                      const localPosY = 10;
                      doc.setLineDashPattern([2, 2], 0);
                      doc.setDrawColor(120);
                      doc.roundedRect(localPosX, localPosY, reciboWidth, reciboHeight, 4, 4, 'S');
                      doc.setLineDashPattern([], 0);
                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(11);
                      doc.text('Associação Comunitária Dos Moradores Do Loteamento Recanto De Itapuã', localPosX + reciboWidth / 2, localPosY + 8, { align: 'center' });
                      doc.setFont('helvetica', 'normal');
                      doc.setFontSize(10);
                      let y = localPosY + 16;
                      const addField = (label: string, value: string) => {
                        doc.text(label + ':', localPosX + 8, y, { baseline: 'top' });
                        const labelWidth = doc.getTextWidth(label + ':');
                        const space1mm = 2.83;
                        doc.text(String(value), localPosX + 8 + labelWidth + space1mm, y, { baseline: 'top' });
                        y += 7;
                      };
                      addField('TÍTULO', pagamentoRecibo.title || '-');
                      if (pagamentoRecibo.dueDate) addField('VENCIMENTO', formatarDataBarra(pagamentoRecibo.dueDate));
                      addField('VALOR', 'R$ ' + Number(pagamentoRecibo.cash).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
                      addField('TIPO PAGAMENTO', modePaymentReturn(pagamentoRecibo.modePayment));
                      addField('DATA ABERTURA', formatarDataBarra(pagamentoRecibo.datePayment));
                      addField('SITUAÇÃO', situationReturn(pagamentoRecibo.situation));
                      addField('DATA FECHAMENTO', formatarDataBarra(pagamentoRecibo.finishPayment));
                      addField('NOME', pagamentoRecibo.personName || '-');
                      addField('ENDEREÇO', pagamentoRecibo.adress || '-');
                      if (pagamentoRecibo.obs) addField('OBSERVAÇÕES', String(pagamentoRecibo.obs));
                      doc.setFontSize(8);
                      doc.setTextColor(80, 80, 200);
                      doc.text('https://recantodeitapua.com.br', localPosX + 8, localPosY + reciboHeight - 7);
                      doc.setTextColor(120);
                      doc.setFontSize(7);
                      doc.text('ID: ' + pagamentoRecibo.id, localPosX + reciboWidth - 40, localPosY + reciboHeight - 7);
                      doc.setFontSize(10);
                      doc.setTextColor(0);
                      window.open(doc.output('bloburl'), '_blank');
                    }}
                  >Imprimir</button>
                  <div><b>TÍTULO:</b> {pagamentoRecibo.title || '-'}</div>
                  <div><b>VALOR:</b> {pagamentoRecibo.cash !== undefined ? 'R$ ' + Number(pagamentoRecibo.cash).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}</div>
                  <div><b>TIPO PAGAMENTO:</b> {modePaymentReturn(pagamentoRecibo.modePayment)}</div>
                  <div><b>DATA PAGAMENTO:</b> {formatarDataBarra(pagamentoRecibo.datePayment)}</div>
                  <div><b>DATA FECHAMENTO:</b> {formatarDataBarra(pagamentoRecibo.finishPayment)}</div>
                  <div><b>SITUAÇÃO:</b> {situationReturn(pagamentoRecibo.situation)}</div>
                  <div><b>NOME:</b> {pagamentoRecibo.personName || '-'}</div>
                  <div><b>ENDEREÇO:</b> {pagamentoRecibo.adress || '-'}</div>
                  <div><b>OBSERVAÇÕES:</b> {pagamentoRecibo.obs || '-'}</div>
                  <div className="text-xs text-gray-400 mt-2">ID: {pagamentoRecibo.id}</div>
                </div>
              </>}
            </Modal>
        {/* Modal de Recibo global */}
            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              aoMudar={aoMudarPagina}
            />
          </>
        )}
      </section>
      <Modal aberto={modalAberto} aoFechar={() => {definirModalAberto(false); setEditando(null);}} titulo={editando ? "Editar pagamento" : "Cadastrar pagamento"}>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input className="rounded border px-3 py-2 text-base sm:text-lg sm:px-4 sm:py-3 bg-white" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} required />
          <input className="rounded border px-3 py-2 text-base sm:text-lg sm:px-4 sm:py-3 bg-white" placeholder="Data do pagamento" type="date" value={dataPagamento} onChange={e => setDataPagamento(e.target.value)} required />
          <select
            className="rounded border px-3 py-2 text-base sm:text-lg sm:px-4 sm:py-3 bg-white"
            value={situacao}
            onChange={e => setSituacao(e.target.value)}
            required
          >
            <option value="">Selecione a situação</option>
            {opcoesSituacao.map(opt => (
              <option key={opt.codigo} value={opt.codigo}>{opt.nome}</option>
            ))}
          </select>
          <select
            className="rounded border px-3 py-2 text-base sm:text-lg sm:px-4 sm:py-3 bg-white"
            value={modoPagamento}
            onChange={e => setModoPagamento(e.target.value)}
            required
          >
            <option value="">Selecione o método de pagamento</option>
            <option value="0">Dinheiro</option>
            <option value="1">Pix</option>
            <option value="2">Cartão</option>
          </select>
          <input className="rounded border px-3 py-2 text-base sm:text-lg sm:px-4 sm:py-3 bg-white" placeholder="Valor" type="number" value={valor} onChange={e => setValor(e.target.value)} required />
          <input className="rounded border px-3 py-2 text-base sm:text-lg sm:px-4 sm:py-3 bg-white" placeholder="Desconto" type="number" value={desconto} onChange={e => setDesconto(e.target.value)} />
          <label className="flex items-center gap-2 text-base sm:text-lg">
            <input type="checkbox" checked={finalizado} onChange={e => setFinalizado(e.target.checked)} className="bg-white" /> Finalizado
          </label>
          <input className="rounded border px-3 py-2 text-base sm:text-lg sm:px-4 sm:py-3 bg-white" placeholder="Observações" value={obs} onChange={e => setObs(e.target.value)} />
          <select
            className="rounded border px-3 py-2 text-base sm:text-lg sm:px-4 sm:py-3 bg-white"
            value={nomePessoa}
            onChange={e => {
              setNomePessoa(e.target.value);
              const residente = residentes.find(r => r.name === e.target.value);
              setPessoa(residente ? residente.id : '');
            }}
            required
          >
            <option value="">Selecione o residente</option>
            {residentes.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
          <select
            className="rounded border px-3 py-2 text-base sm:text-lg sm:px-4 sm:py-3 bg-white"
            value={endereco}
            onChange={e => setEndereco(e.target.value)}
            required
          >
            <option value="">Selecione o endereço</option>
            {enderecos.map(e => (
              <option key={e.id} value={e.adress}>{e.adress}</option>
            ))}
          </select>
          <button type="submit" className="rounded bg-pink-600 px-4 py-2 text-white hover:bg-pink-700 cursor-pointer text-base sm:text-lg">Salvar</button>
        </form>
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </Modal>
      {/* Modal DRE - demonstrativo de resultados do exercício */}
      <Modal aberto={modalDREAberto} aoFechar={() => setModalDREAberto(false)} titulo="Demonstrativo de Resultados (DRE)">
        <div className="max-w-5xl mx-auto p-8 bg-white print:p-4 rounded shadow print:shadow-none border print:border-0">
          <div className="flex justify-end mb-4 print:hidden">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2"
              onClick={gerarPdfDRE}
              title="Imprimir demonstrativo em PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2h-2m-6 0v4m0 0h4m-4 0H8" /></svg>
              Imprimir PDF
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-base">
            <div className="bg-pink-50 rounded p-3 text-center border">
              <div className="text-xs text-gray-500">Total de pagamentos</div>
              <div className="font-bold text-lg">{qtdTotal}</div>
            </div>
            <div className="bg-green-50 rounded p-3 text-center border">
              <div className="text-xs text-gray-500">Pagamentos fechados</div>
              <div className="font-bold text-lg">{qtdFechados}</div>
              <div className="text-xs text-gray-600">R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-yellow-50 rounded p-3 text-center border">
              <div className="text-xs text-gray-500">Pagamentos abertos</div>
              <div className="font-bold text-lg">{qtdAbertos}</div>
              <div className="text-xs text-gray-600">R$ {totalAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-blue-50 rounded p-3 text-center border">
              <div className="text-xs text-gray-500">Total geral</div>
              <div className="font-bold text-lg">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          <h3 className="text-md font-semibold mb-4 text-pink-800 border-b pb-2">Pagamentos detalhados</h3>
          {/* Tabela em telas md+, cards em telas pequenas */}
          <div className="hidden md:block">
            <table className="min-w-full text-xs print:text-xs border-t border-b mb-2">
              <thead className="bg-pink-100">
                <tr>
                  <th className="px-4 py-3 border text-left">Título</th>
                  <th className="px-4 py-3 border text-center">Situação</th>
                  <th className="px-4 py-3 border text-right">Valor</th>
                  <th className="px-4 py-3 border text-center">Data Pagamento</th>
                  <th className="px-4 py-3 border text-left">Pessoa</th>
                </tr>
              </thead>
              <tbody>
                {pagamentosFiltrados.map((p, idx) => (
                  <>
                    <tr key={p.id} className="align-middle">
                      <td className="px-4 py-3 border text-left whitespace-nowrap">{p.title}</td>
                      <td className="px-4 py-3 border text-center whitespace-nowrap">{situationReturn(p.situation)}</td>
                      <td className="px-4 py-3 border text-right whitespace-nowrap">R$ {Number(p.cash).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 border text-center whitespace-nowrap">{formatarDataBarra(p.datePayment)}</td>
                      <td className="px-4 py-3 border text-left whitespace-nowrap text-[10px] text-gray-700">{p.personName}</td>
                    </tr>
                    <tr key={p.id + '-line'}>
                      <td colSpan={5} className="border-b-2 border-gray-200"></td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-4 md:hidden">
            {pagamentosFiltrados.map((p) => (
              <div key={p.id} className="border rounded-lg p-4 shadow bg-pink-50">
                <div className="font-bold text-pink-900 text-base mb-1">{p.title}</div>
                <div className="text-xs text-gray-700 mb-1"><span className="font-semibold">Situação:</span> {situationReturn(p.situation)}</div>
                <div className="text-xs text-gray-700 mb-1"><span className="font-semibold">Valor:</span> R$ {Number(p.cash).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <div className="text-xs text-gray-700 mb-1"><span className="font-semibold">Data Pagamento:</span> {formatarDataBarra(p.datePayment)}</div>
                <div className="text-xs text-gray-700"><span className="font-semibold">Pessoa:</span> <span className="text-[10px]">{p.personName}</span></div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-4">Documento gerado automaticamente pelo sistema Recanto de Itapuã.</div>
        </div>
      </Modal>
    </div>
  );
}
