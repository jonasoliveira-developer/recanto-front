"use client";
import { useEffect, useState } from "react";
import { FaRegFileAlt, FaPrint } from "react-icons/fa";
import { jsPDF } from "jspdf";
import dayjs from "dayjs";
import { listarPagamentos, criarPagamento, atualizarPagamento, removerPagamento } from "../../services/pagamentosApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";
import { Paginacao } from "../../components/Paginacao";

export default function Pagamentos() {
    // Função para gerar PDF em lote idêntico ao recibo individual (4 por folha A4)
    function gerarPdfRecibosLote(recibos: any[]) {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      // 3 recibos por página, centralizados verticalmente
      const pageHeight = 297;
      const reciboWidth = 180;
      const reciboHeight = 90;
      const marginX = 15;
      const gapY = 12;
      const totalRecibosPorPagina = 3;
      const blocoRecibosAltura = reciboHeight * totalRecibosPorPagina + gapY * (totalRecibosPorPagina - 1);
      recibos.forEach((recibo, idx) => {
        const localIdx = idx % totalRecibosPorPagina;
        if (idx > 0 && localIdx === 0) doc.addPage();
        // Centralizar verticalmente o bloco de 3 recibos
        const offsetY = (pageHeight - blocoRecibosAltura) / 2;
        const localPosX = marginX;
        const localPosY = offsetY + localIdx * (reciboHeight + gapY);
        // Borda pontilhada
        doc.setLineDashPattern([2, 2], 0);
        doc.setDrawColor(120);
        doc.roundedRect(localPosX, localPosY, reciboWidth, reciboHeight, 4, 4, 'S');
        doc.setLineDashPattern([], 0);
        // Título
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('RECIBO', localPosX + 5, localPosY + 10, { align: 'left' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        let y = localPosY + 18;
        const addField = (label: string, value: string) => {
          const labelX = localPosX + 5;
          doc.setFont('helvetica', 'bold');
          // Medir largura do label para posicionar valor logo após os dois pontos
          const labelWithColon = label.endsWith(':') ? label : label + ':';
          const labelWidth = doc.getTextWidth(labelWithColon);
          doc.text(labelWithColon, labelX, y, { align: 'left' });
          doc.setFont('helvetica', 'normal');
          // Espaço de 2mm após os dois pontos
          const valueX = labelX + labelWidth + 2;
          doc.text(String(value), valueX, y, { maxWidth: reciboWidth - (valueX - localPosX) - 5, align: 'left' });
          y += 7;
        };
        addField('TÍTULO:', recibo.title || '-');
        addField('VENCIMENTO:', recibo.dueDate ? (dayjs(recibo.dueDate).isValid() ? dayjs(recibo.dueDate).format('DD/MM/YYYY') : '-') : '-');
        addField('VALOR:', 'R$ ' + Number(recibo.cash).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
        addField('TIPO PAGAMENTO:', recibo.modePayment || '-');
        addField('DATA ABERTURA:', recibo.datePayment ? dayjs(recibo.datePayment).format('DD/MM/YYYY') : '-');
        let situacaoLabel = 'Aberto';
        if (recibo.situation === 1 || recibo.situation === '1' || recibo.situation === 'PAID') situacaoLabel = 'Pago';
        else if (recibo.situation === 0 || recibo.situation === '0' || recibo.situation === 'PENDING') situacaoLabel = 'Aberto';
        else if (recibo.situation === 2 || recibo.situation === '2' || recibo.situation === 'CANCELLED') situacaoLabel = 'Cancelado';
        addField('SITUAÇÃO:', situacaoLabel);
        addField('DATA FECHAMENTO:', recibo.finishPayment && recibo.dateClose ? dayjs(recibo.dateClose).format('DD/MM/YYYY') : '-');
        addField('NOME:', recibo.personName || '-');
        addField('ENDEREÇO:', recibo.adress || '-');
        if (recibo.obs) {
          doc.setFont('helvetica', 'bold');
          const obsLabel = 'OBSERVAÇÕES:';
          const obsLabelX = localPosX + 5;
          const obsLabelWidth = doc.getTextWidth(obsLabel);
          doc.text(obsLabel, obsLabelX, y, { align: 'left' });
          doc.setFont('helvetica', 'normal');
          // Espaço de 1mm após os dois pontos
          const obsValueX = obsLabelX + obsLabelWidth + 1;
          doc.text(String(recibo.obs), obsValueX, y, { maxWidth: reciboWidth - (obsValueX - localPosX) - 5, align: 'left' });
          y += 7;
        }
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 200);
        doc.text('https://recantodeitapua.com.br', localPosX + 5, localPosY + reciboHeight - 4, { align: 'left' });
        doc.setTextColor(120);
        doc.setFontSize(7);
        doc.text('ID: ' + recibo.id, localPosX + reciboWidth - 30, localPosY + reciboHeight - 4, { align: 'left' });
        doc.setFontSize(10);
        doc.setTextColor(0);
      });
      // Abrir visualização de impressão em vez de baixar
      window.open(doc.output('bloburl'), '_blank');
    }

  // Estado do modal de recibos em lote
  const [modalRecibosAberto, setModalRecibosAberto] = useState(false);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [situacaoRecibo, setSituacaoRecibo] = useState("");
  const [paginaRecibos, setPaginaRecibos] = useState(1);
  const itensPorPaginaRecibo = 16;
  // Filtro de situação: '' = todos, '0' = aberto, '1' = fechado
  const [situacaoFiltro, setSituacaoFiltro] = useState('');
  // Função para abrir o modal de recibo
  const [reciboAberto, setReciboAberto] = useState(false);
  const [pagamentoRecibo, setPagamentoRecibo] = useState<any | null>(null);
  function abrirRecibo(pagamento: any) {
    setPagamentoRecibo(pagamento);
    setReciboAberto(true);
  }
  // Mapeamento de códigos para nomes de situação
  const opcoesSituacao = [
    { codigo: "PAID", nome: "Pago" },
    { codigo: "PENDING", nome: "Pendente" },
    { codigo: "CANCELLED", nome: "Cancelado" },
  ];
  const [pagamentos, definirPagamentos] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [busca, definirBusca] = useState("");
  const [paginaAtual, definirPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const { token } = useAuth();
  // Estados do formulário/modal
  const [editando, setEditando] = useState<any | null>(null);
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

  async function carregarPagamentos() {
    definirCarregando(true);
    try {
      if (!token) {
        definirPagamentos([]);
        definirCarregando(false);
        return;
      }
      const dados = await listarPagamentos(token);
      definirPagamentos(dados);
    } catch {
      definirPagamentos([]);
    }
    definirCarregando(false);
  }

  useEffect(() => {
    carregarPagamentos();
  }, [token]);

  // CRUD Handlers
  function abrirModalNovo() {
    setEditando(null);
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
    definirModalAberto(true);
  }

  function abrirModalEditar(pagamento: any) {
    setEditando(pagamento);
    setTitulo(pagamento.title || "");
    setDataPagamento(pagamento.datePayment ? pagamento.datePayment.slice(0, 10) : "");
    // Corrige para garantir que situation seja string código
    let situacaoCodigo = pagamento.situation;
    if (typeof situacaoCodigo === 'number') {
      if (situacaoCodigo === 1) situacaoCodigo = "PAID";
      else if (situacaoCodigo === 2) situacaoCodigo = "PENDING";
      else if (situacaoCodigo === 3) situacaoCodigo = "CANCELLED";
      else situacaoCodigo = "";
    }
    setSituacao(situacaoCodigo || "");
    setModoPagamento(pagamento.modePayment || "");
    setValor(pagamento.cash || "");
    setDesconto(pagamento.discount || "");
    setFinalizado(!!pagamento.finishPayment);
    setObs(pagamento.obs || "");
    setPessoa(pagamento.person || "");
    setNomePessoa(pagamento.personName || "");
    setEndereco(pagamento.adress || "");
    definirModalAberto(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    // Garante que situation sempre seja string código
    let situacaoEnvio = situacao;
    if (typeof situacaoEnvio === 'number') {
      if (situacaoEnvio === 1) situacaoEnvio = "PAID";
      else if (situacaoEnvio === 2) situacaoEnvio = "PENDING";
      else if (situacaoEnvio === 3) situacaoEnvio = "CANCELLED";
      else situacaoEnvio = "";
    }
    const dados: any = {
      title: titulo,
      datePayment: dataPagamento,
      situation: situacaoEnvio,
      modePayment: modoPagamento,
      cash: Number(valor),
      discount: desconto ? Number(desconto) : 0,
      finishPayment: finalizado,
      obs,
      person: pessoa,
      personName: nomePessoa,
      adress: endereco,
    };
    try {
      if (editando) {
        await atualizarPagamento(editando.id, dados, token);
        toast.success("Pagamento atualizado com sucesso!");
      } else {
        await criarPagamento(dados, token);
        toast.success("Pagamento cadastrado com sucesso!");
      }
      definirModalAberto(false);
      setEditando(null);
      await carregarPagamentos();
    } catch (erro: any) {
      toast.error("Erro ao salvar pagamento! " + (erro?.response?.data?.message || ""));
    }
  }

  // Filtragem por busca e situação
  const pagamentosFiltrados = pagamentos.filter((pagamento) => {
    const termo = busca.toLowerCase();
    const textoOk =
      !termo ||
      pagamento.title?.toLowerCase().includes(termo) ||
      pagamento.personName?.toLowerCase().includes(termo);

    // Filtro de situação: '' = todos, '0' = aberto, '1' = fechado
    let situacaoOk = true;
    if (situacaoFiltro === '0') {
      situacaoOk = String(pagamento.situation) === '0';
    } else if (situacaoFiltro === '1') {
      situacaoOk = String(pagamento.situation) === '1';
    }

    return textoOk && situacaoOk;
  });

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
    <div className="min-h-screen bg-white p-4 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-pink-900 mb-6">Pagamentos</h1>
        <section className="rounded-lg bg-white p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex flex-row gap-2 w-full">
              <input
                type="text"
                value={busca}
                onChange={aoBuscar}
                placeholder="Buscar por título ou pessoa"
                className="rounded border px-3 py-2 flex-grow min-w-0"
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
                className="rounded border px-3 py-2 w-36 shrink-0"
              >
                <option value="">Todos</option>
                <option value="0">Aberto</option>
                <option value="1">Fechado</option>
              </select>
            </div>
            <div className="flex flex-row gap-2">
              <button
                className="rounded-lg bg-pink-600 px-4 py-2 text-white shadow hover:bg-pink-700 cursor-pointer"
                onClick={abrirModalNovo}
              >
                Novo
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 cursor-pointer flex items-center gap-2"
                onClick={() => setModalRecibosAberto(true)}
                title="Gerar recibos em lote"
              >
                <FaRegFileAlt /> Recibos
              </button>
            </div>
          </div>
        </section>
            {/* Modal de recibos em lote */}
            <Modal aberto={modalRecibosAberto} aoFechar={() => setModalRecibosAberto(false)} titulo="Recibos em lote">
              <div className="flex flex-col gap-6">
                {/* Cabeçalho de filtros */}
                {(() => {
                  // Filtro de recibos para o modal
                  let recibosFiltrados = pagamentos;
                  if (dataInicial) {
                    const [dia, mes, ano] = dataInicial.split("/");
                    const dataIni = dayjs(`${ano}-${mes}-${dia}`);
                    recibosFiltrados = recibosFiltrados.filter(r => r.datePayment && dayjs(r.datePayment).isAfter(dataIni.subtract(1, 'day')));
                  }
                  if (dataFinal) {
                    const [dia, mes, ano] = dataFinal.split("/");
                    const dataFim = dayjs(`${ano}-${mes}-${dia}`);
                    recibosFiltrados = recibosFiltrados.filter(r => r.datePayment && dayjs(r.datePayment).isBefore(dataFim.add(1, 'day')));
                  }
                  if (situacaoRecibo === '0') {
                    recibosFiltrados = recibosFiltrados.filter(r => String(r.situation) === '0');
                  } else if (situacaoRecibo === '1') {
                    recibosFiltrados = recibosFiltrados.filter(r => String(r.situation) === '1');
                  }
                  // Paginação
                  const totalPaginasRecibo = Math.ceil(recibosFiltrados.length / itensPorPaginaRecibo) || 1;
                  const inicioRecibo = (paginaRecibos - 1) * itensPorPaginaRecibo;
                  const fimRecibo = inicioRecibo + itensPorPaginaRecibo;
                  const recibosPaginados = recibosFiltrados.slice(inicioRecibo, fimRecibo);
                  return (
                    <>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch bg-gray-50 p-4 rounded-lg mb-4 w-full justify-between mt-0 pt-0">
                        {/* Botão de fechar no topo no mobile, ao lado dos filtros no desktop */}
                        <div className="flex flex-row w-full justify-end sm:hidden mb-2">
                          <button onClick={() => setModalRecibosAberto(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none px-2 pb-1">×</button>
                        </div>
                        <div className="flex flex-col sm:flex-row flex-1 gap-4">
                          <div className="flex flex-col flex-1 min-w-[120px]">
                            <label className="text-xs font-semibold mb-1">Data inicial</label>
                            <input
                              type="text"
                              placeholder="dd/MM/aaaa"
                              value={dataInicial}
                              onChange={e => setDataInicial(e.target.value)}
                              className="rounded border px-2 py-1 w-full"
                              maxLength={10}
                            />
                          </div>
                          <div className="flex flex-col flex-1 min-w-[120px]">
                            <label className="text-xs font-semibold mb-1">Data final</label>
                            <input
                              type="text"
                              placeholder="dd/MM/aaaa"
                              value={dataFinal}
                              onChange={e => setDataFinal(e.target.value)}
                              className="rounded border px-2 py-1 w-full"
                              maxLength={10}
                            />
                          </div>
                          <div className="flex flex-col flex-1 min-w-[120px]">
                            <label className="text-xs font-semibold mb-1">Situação</label>
                            <select
                              value={situacaoRecibo}
                              onChange={e => setSituacaoRecibo(e.target.value)}
                              className="rounded border px-2 py-1 w-full"
                            >
                              <option value="">Todos</option>
                              <option value="0">Aberto</option>
                              <option value="1">Fechado</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end mt-0">
                          {recibosPaginados.length > 0 && (
                            <button
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow h-10"
                              onClick={() => gerarPdfRecibosLote(recibosPaginados)}
                            >
                              <FaPrint /> Imprimir recibos
                            </button>
                          )}
                          {/* Botão de fechar só aparece aqui em telas médias+ */}
                          <button onClick={() => setModalRecibosAberto(false)} className="hidden sm:inline text-gray-500 hover:text-gray-700 text-2xl leading-none px-2 pb-1 h-10">×</button>
                        </div>
                      </div>
                      {/* ...botão de imprimir agora só no cabeçalho... */}
                      {/* Container dos recibos */}
                      <div className="flex flex-col gap-2 min-h-[200px]">
                        {recibosPaginados.length === 0 ? (
                          <div className="text-center text-gray-500">Nenhum recibo encontrado.</div>
                        ) : recibosPaginados.map((recibo) => {
                          // Formatação de datas
                          const dataAbertura = recibo.datePayment ? dayjs(recibo.datePayment).format('DD/MM/YYYY') : '';
                          const dataFechamento = recibo.finishPayment && recibo.dateClose ? dayjs(recibo.dateClose).format('DD/MM/YYYY') : '';
                          // Situação
                          let situacaoLabel = 'Aberto';
                          if (recibo.situation === 1 || recibo.situation === '1' || recibo.situation === 'PAID') situacaoLabel = 'Pago';
                          else if (recibo.situation === 0 || recibo.situation === '0' || recibo.situation === 'PENDING') situacaoLabel = 'Aberto';
                          else if (recibo.situation === 2 || recibo.situation === '2' || recibo.situation === 'CANCELLED') situacaoLabel = 'Cancelado';
                          return (
                            <div key={recibo.id} className="border rounded-lg shadow bg-white p-2 max-w-[420px] mx-auto relative print:border-black print:shadow-none text-[12px] leading-tight h-[250px] flex flex-col justify-between">
                              <div className="flex flex-col gap-[2px]">
                                <div className="text-center text-[14px] font-bold text-pink-900 mb-[3px] tracking-wide">RECIBO</div>
                                <div><span className="font-semibold">TÍTULO:</span> {recibo.title}</div>
                                {recibo.dueDate && <div><span className="font-semibold">VENCIMENTO:</span> {dayjs(recibo.dueDate).isValid() ? dayjs(recibo.dueDate).format('DD/MM/YYYY') : '-'}</div>}
                                <div><span className="font-semibold">VALOR:</span> R$ {Number(recibo.cash).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                                <div><span className="font-semibold">TIPO PAGAMENTO:</span> {recibo.modePayment || '-'}</div>
                                <div><span className="font-semibold">DATA ABERTURA:</span> {dataAbertura && dataAbertura !== 'Invalid Date' ? dataAbertura : '-'}</div>
                                <div><span className="font-semibold">SITUAÇÃO:</span> {situacaoLabel}</div>
                                <div><span className="font-semibold">DATA FECHAMENTO:</span> {dataFechamento && dataFechamento !== 'Invalid Date' ? dataFechamento : '-'}</div>
                                <div><span className="font-semibold">NOME:</span> {recibo.personName}</div>
                                <div><span className="font-semibold">ENDEREÇO:</span> {recibo.adress || '-'}</div>
                                {recibo.obs && (
                                  <div className="text-gray-700 mt-[2px]"><span className="font-semibold">OBSERVAÇÕES:</span> {recibo.obs}</div>
                                )}
                              </div>
                              <div className="flex justify-end mt-[3px]">
                                <span className="text-[10px] text-gray-400">ID: {recibo.id}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Paginação */}
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <button
                          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                          onClick={() => setPaginaRecibos(p => Math.max(1, p - 1))}
                          disabled={paginaRecibos === 1}
                        >Anterior</button>
                        <span className="text-sm">Página {paginaRecibos} de {totalPaginasRecibo}</span>
                        <button
                          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                          onClick={() => setPaginaRecibos(p => Math.min(totalPaginasRecibo, p + 1))}
                          disabled={paginaRecibos === totalPaginasRecibo}
                        >Próxima</button>
                      </div>
                    </>
                  );
                })()}
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
            <div className="hidden md:block">
              <table className="min-w-full border rounded-lg overflow-hidden">
                <thead className="bg-pink-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Título</th>
                    <th className="px-4 py-2 text-left">Situação</th>
                    <th className="px-4 py-2 text-left">Valor</th>
                    <th className="px-4 py-2 text-left">Pessoa</th>
                    <th className="px-4 py-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentosPaginados.map((pagamento) => (
                    <tr key={pagamento.id} className="border-b transition-colors duration-200 hover:bg-pink-50 cursor-pointer">
                      <td className="px-4 py-2 font-bold text-pink-800">{pagamento.title}</td>
                      <td className="px-4 py-2">{
                        pagamento.situation === 0 ? 'Aberto' : pagamento.situation === 1 ? 'Fechado' : pagamento.situation
                      }</td>
                      <td className="px-4 py-2">R$ {pagamento.cash}</td>
                      <td className="px-4 py-2">{pagamento.personName}</td>
                      <td className="px-4 py-2 flex gap-2 items-center">
                                                <button
                                                  className="rounded bg-gray-200 px-2 py-1 text-gray-700 hover:bg-gray-300 mr-2"
                                                  title="Imprimir recibo"
                                                  onClick={() => abrirRecibo(pagamento)}
                                                  >
                                                  <FaRegFileAlt />
                                                </button>
                        <button
                          className="rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-700 cursor-pointer mr-2"
                          onClick={() => abrirModalEditar(pagamento)}
                        >Editar</button>
                        <button
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-800 cursor-pointer"
                          onClick={async () => {
                            if (window.confirm("Tem certeza que deseja excluir este pagamento?")) {
                              try {
                                await removerPagamento(pagamento.id, token);
                                toast.success("Pagamento excluído com sucesso!");
                                await carregarPagamentos();
                              } catch (erro: any) {
                                toast.error("Erro ao excluir pagamento! " + (erro?.response?.data?.message || ""));
                              }
                            }
                          }}
                        >Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="flex flex-col gap-4 md:hidden">
              {pagamentosPaginados.map((pagamento) => (
                <li key={pagamento.id} className="rounded border p-4 shadow hover:shadow-lg transition-colors duration-200 hover:bg-pink-50 cursor-pointer">
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500 font-semibold">Título</span>
                    <span className="block text-base text-pink-800 font-bold">{pagamento.title}</span>
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
                      className="rounded bg-gray-200 px-2 py-1 text-gray-700 hover:bg-gray-300 mr-2"
                      title="Imprimir recibo"
                      onClick={() => abrirRecibo(pagamento)}
                      >
                        <FaRegFileAlt />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
        {/* Modal de Recibo global */}
        <Modal aberto={reciboAberto} aoFechar={() => setReciboAberto(false)} titulo={
          <div className="flex items-center gap-2">
            <span>RECIBO</span>
            <button
              className="ml-2 text-gray-600 hover:text-gray-900"
              title="Imprimir recibo"
              onClick={() => {
                const printContent = document.getElementById('recibo-print-content');
                if (printContent) {
                  const printWindow = window.open('', '', 'width=800,height=600');
                  if (printWindow) {
                    printWindow.document.write('<html><head><title>Recibo</title>');
                    printWindow.document.write(`
                      <style>
                        body { font-family: sans-serif; padding: 24px; background: #f5f5f5; }
                        .recibo-borda {
                          border: 2px dashed #888;
                          border-radius: 12px;
                          background: #fff;
                          max-width: 480px;
                          margin: 40px auto;
                          padding: 32px 28px;
                          box-shadow: 0 2px 12px #0001;
                        }
                        b { font-weight: bold; }
                        .site { color: #2563eb; font-size: 12px; margin-top: 12px; }
                      </style>
                    `);
                    printWindow.document.write('</head><body>');
                    printWindow.document.write(`<div class="recibo-borda">${printContent.innerHTML}</div>`);
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                  }
                }
              }}
            >
              <FaPrint />
            </button>
          </div>
        }>
          {pagamentoRecibo && (
            <div id="recibo-print-content" className="flex flex-col gap-2 text-base">
              <div><b>TÍTULO:</b> {pagamentoRecibo.title}</div>
              <div><b>VALOR:</b> R$ {Number(pagamentoRecibo.cash).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div><b>TIPO PAGAMENTO:</b> {pagamentoRecibo.modePayment}</div>
              <div><b>DATA ABERTURA:</b> {pagamentoRecibo.datePayment ? new Date(pagamentoRecibo.datePayment).toLocaleDateString('pt-BR') : ''}</div>
              <div><b>SITUAÇÃO:</b> {typeof pagamentoRecibo.situation === 'number'
                ? (pagamentoRecibo.situation === 1 ? 'Pago' : pagamentoRecibo.situation === 2 ? 'Pendente' : pagamentoRecibo.situation === 3 ? 'Cancelado' : pagamentoRecibo.situation)
                : (opcoesSituacao.find(opt => opt.codigo === pagamentoRecibo.situation)?.nome || pagamentoRecibo.situation)}
              </div>
              <div><b>DATA FECHAMENTO:</b> {pagamentoRecibo.finishPayment && pagamentoRecibo.datePayment ? new Date(pagamentoRecibo.datePayment).toLocaleDateString('pt-BR') : ''}</div>
              <div><b>NOME:</b> {pagamentoRecibo.personName}</div>
              <div><b>ENDEREÇO:</b> {pagamentoRecibo.adress}</div>
              <div><b>OBSERVAÇÕES:</b> {pagamentoRecibo.obs}</div>
              <div className="site mt-2 text-xs text-blue-700">https://recantodeitapua.com.br</div>
            </div>
          )}
        </Modal>
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
          <input className="rounded border px-3 py-2" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} required />
          <input className="rounded border px-3 py-2" placeholder="Data do pagamento" type="date" value={dataPagamento} onChange={e => setDataPagamento(e.target.value)} required />
          <select
            className="rounded border px-3 py-2"
            value={situacao}
            onChange={e => setSituacao(e.target.value)}
            required
          >
            <option value="">Selecione a situação</option>
            {opcoesSituacao.map(opt => (
              <option key={opt.codigo} value={opt.codigo}>{opt.nome}</option>
            ))}
          </select>
          <input className="rounded border px-3 py-2" placeholder="Modo de pagamento" value={modoPagamento} onChange={e => setModoPagamento(e.target.value)} required />
          <input className="rounded border px-3 py-2" placeholder="Valor" type="number" value={valor} onChange={e => setValor(e.target.value)} required />
          <input className="rounded border px-3 py-2" placeholder="Desconto" type="number" value={desconto} onChange={e => setDesconto(e.target.value)} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={finalizado} onChange={e => setFinalizado(e.target.checked)} /> Finalizado
          </label>
          <input className="rounded border px-3 py-2" placeholder="Observações" value={obs} onChange={e => setObs(e.target.value)} />
          <input className="rounded border px-3 py-2" placeholder="ID da pessoa" value={pessoa} onChange={e => setPessoa(e.target.value)} />
          <input className="rounded border px-3 py-2" placeholder="Nome da pessoa" value={nomePessoa} onChange={e => setNomePessoa(e.target.value)} />
          <input className="rounded border px-3 py-2" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} />
          <button type="submit" className="rounded bg-pink-600 px-4 py-2 text-white hover:bg-pink-700 cursor-pointer">Salvar</button>
        </form>
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </Modal>
    </div>
  );
}
