  // Filtro de situação: '' = todos, '0' = aberto, '1' = fechado

"use client";
import { FaRegFileAlt, FaPrint } from "react-icons/fa";
import { useEffect, useState } from "react";
import { listarPagamentos, criarPagamento, atualizarPagamento, removerPagamento } from "../../services/pagamentosApi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";
import { Paginacao } from "../../components/Paginacao";

export default function Pagamentos() {
      // Filtro de situação: '' = todos, '0' = aberto, '1' = fechado
      const [situacaoFiltro, setSituacaoFiltro] = useState('');
    // Função para abrir o modal de recibo
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

  // Estado do recibo
  const [reciboAberto, setReciboAberto] = useState(false);
  const [pagamentoRecibo, setPagamentoRecibo] = useState<any | null>(null);

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              value={busca}
              onChange={aoBuscar}
              placeholder="Buscar por título ou pessoa"
              className="rounded border px-3 py-2 w-full md:max-w-full md:flex-1"
            />
            <select
              value={situacaoFiltro}
              onChange={e => setSituacaoFiltro(e.target.value)}
              className="rounded border px-3 py-2 w-full md:w-auto"
            >
              <option value="">Todos</option>
              <option value="0">Aberto</option>
              <option value="1">Fechado</option>
            </select>
          </div>
          <button
            className="rounded-lg bg-pink-600 px-4 py-2 text-white shadow hover:bg-pink-700 cursor-pointer md:ml-2"
            onClick={abrirModalNovo}
          >
            Novo pagamento
          </button>
        </div>
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
