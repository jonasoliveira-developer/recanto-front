"use client";
import { useEffect, useState } from "react";
import { atualizarEndereco, buscarEnderecoPorId, criarEndereco, listarEnderecos } from "../../services/enderecosApi";
import { useAuth, UserRole } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";
import { Paginacao } from "../../components/Paginacao";
import { CustomSelect } from "../../components/CustomSelect";

export default function Enderecos() {
  const [enderecos, definirEnderecos] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [salvando, definirSalvando] = useState(false);
  const [busca, definirBusca] = useState("");
  const [mensagemErroFormulario, definirMensagemErroFormulario] = useState("");
  const [paginaAtual, definirPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const { token, logout, temPermissaoEfetiva } = useAuth();
  // Estados para formulário
  const [adress, setAdress] = useState("");
  const [person, setPerson] = useState("");
  const [personName, setPersonName] = useState("");
  const [editando, definirEditando] = useState<any | null>(null);
  const [residentes, setResidentes] = useState<any[]>([]);

  const podeEditarEndereco = temPermissaoEfetiva(UserRole.ADMIN) || temPermissaoEfetiva(UserRole.EMPLOYEE);

  function limparFormulario() {
    setAdress("");
    setPerson("");
    setPersonName("");
    definirMensagemErroFormulario("");
  }

  function fecharModal() {
    definirModalAberto(false);
    definirEditando(null);
    limparFormulario();
  }

  function abrirModalNovo() {
    definirEditando(null);
    limparFormulario();
    definirModalAberto(true);
  }

  async function abrirModalEditar(endereco: any) {
    if (!token) return;
    definirMensagemErroFormulario("");
    definirEditando(endereco);

    let enderecoCompleto = endereco;
    const faltamDadosEssenciais = !endereco?.adress || !endereco?.person;

    if (faltamDadosEssenciais && endereco?.id) {
      try {
        enderecoCompleto = await buscarEnderecoPorId(endereco.id, token);
      } catch {
        definirMensagemErroFormulario("Nao foi possivel carregar os dados completos do endereco para edicao.");
      }
    }

    setAdress(enderecoCompleto?.adress || "");
    setPerson(enderecoCompleto?.person ? String(enderecoCompleto.person) : "");
    setPersonName(enderecoCompleto?.personName || "");
    definirModalAberto(true);
  }

  async function salvarEndereco(e: React.FormEvent) {
    e.preventDefault();
    definirMensagemErroFormulario("");

    if (!token) {
      fecharModal();
      return;
    }

    if (!adress.trim() || !person) {
      definirMensagemErroFormulario("Preencha endereco e pessoa antes de salvar.");
      return;
    }

    const residenteSelecionado = residentes.find((residente) => String(residente.id) === String(person));
    const nomePessoa = residenteSelecionado?.name || personName || editando?.personName || "";
    const payload = {
      adress: adress.trim(),
      person: Number(person),
      personName: nomePessoa
    };

    definirSalvando(true);
    try {
      if (editando?.id) {
        const enderecoAtualizado = await atualizarEndereco(editando.id, payload, token);
        definirEnderecos((listaAtual) =>
          listaAtual.map((item) => (item.id === editando.id ? { ...item, ...enderecoAtualizado, ...payload } : item))
        );
      } else {
        await criarEndereco(payload, token);
        const dadosAtualizados = await listarEnderecos(token);
        definirEnderecos(dadosAtualizados);
      }

      fecharModal();
    } catch (erro: any) {
      const status = erro?.response?.status;

      if (status === 401) {
        logout();
        return;
      }

      if (status === 404) {
        definirMensagemErroFormulario("Endereco nao encontrado para atualizacao.");
        return;
      }

      if (status === 403) {
        definirMensagemErroFormulario(
          erro?.response?.data?.message || "Voce nao tem permissao para editar este endereco."
        );
        return;
      }

      if (status === 400) {
        const erros = erro?.response?.data?.errors;
        if (Array.isArray(erros) && erros.length > 0) {
          definirMensagemErroFormulario(erros.map((item: any) => item?.message).filter(Boolean).join(" | "));
          return;
        }
        definirMensagemErroFormulario(erro?.response?.data?.message || "Dados invalidos para salvar endereco.");
        return;
      }

      definirMensagemErroFormulario("Erro inesperado ao salvar endereco. Tente novamente.");
    } finally {
      definirSalvando(false);
    }
  }
  // Carregar residentes ao abrir modal
  useEffect(() => {
    if (modalAberto && token) {
      (async () => {
        try {
          const listaResidentes = await (await import("../../services/recantoApi")).listarResidentes(token);
          setResidentes(listaResidentes || []);
        } catch {
          setResidentes([]);
        }
      })();
    }
  }, [modalAberto, token]);
  const residentesOptions = residentes.map(r => ({ id: r.id, label: r.name }));

  useEffect(() => {
    async function carregarEnderecos() {
      definirCarregando(true);
      try {
        if (!token) {
          definirEnderecos([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarEnderecos(token);
        definirEnderecos(dados);
      } catch {
        definirEnderecos([]);
      }
      definirCarregando(false);
    }
    carregarEnderecos();
  }, [token]);

  // Filtragem por busca
  const enderecosFiltrados = enderecos.filter((endereco) => {
    const termo = busca.toLowerCase();
    return (
      endereco.adress?.toLowerCase().includes(termo) ||
      endereco.personName?.toLowerCase().includes(termo)
    );
  });

  // Paginação
  const totalPaginas = Math.ceil(enderecosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const enderecosPaginados = enderecosFiltrados.slice(inicio, fim);

  function aoMudarPagina(novaPagina: number) {
    definirPaginaAtual(novaPagina);
  }

  function aoBuscar(e: React.ChangeEvent<HTMLInputElement>) {
    definirBusca(e.target.value);
    definirPaginaAtual(1);
  }

  return (
    <div className="min-h-screen bg-white p-4 font-sans">
      <header className="mb-6 flex flex-col items-center sm:flex-row sm:justify-between">
        <h1 className="text-2xl font-bold text-teal-900">Endereços</h1>
        <button
          className="mt-2 rounded-lg bg-teal-600 px-4 py-2 text-white shadow hover:bg-teal-700 sm:mt-0"
          onClick={abrirModalNovo}
        >
          Novo endereço
        </button>
      </header>
      <div className="mb-4 flex justify-end">
          <input
          type="text"
          value={busca}
          onChange={aoBuscar}
          placeholder="Buscar por endereço ou pessoa"
          className="rounded border px-3 py-2 w-full max-w-xs placeholder:text-gray-800"
        />
      </div>
      <section className="rounded-lg bg-white p-4">
        {carregando ? (
          <p className="text-center text-teal-700">Carregando...</p>
        ) : enderecosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum endereço encontrado.</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {enderecosPaginados.map((endereco) => (
                <li key={endereco.id} className="rounded border p-4 shadow hover:shadow-lg">
                  <h2 className="text-lg font-semibold text-teal-800">{endereco.adress}</h2>
                  <p className="text-sm text-gray-600">Pessoa: {endereco.personName}</p>
                  {podeEditarEndereco ? (
                    <button
                      className="mt-2 rounded bg-teal-500 px-3 py-1 text-white hover:bg-teal-700"
                      onClick={() => abrirModalEditar(endereco)}
                    >
                      Editar
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              aoMudar={aoMudarPagina}
            />
          </>
        )}
      </section>
      <Modal aberto={modalAberto} aoFechar={fecharModal} titulo={editando ? "Editar endereço" : "Cadastrar endereço"}>
        <form className="flex flex-col gap-3" onSubmit={salvarEndereco}>
          {mensagemErroFormulario ? (
            <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {mensagemErroFormulario}
            </p>
          ) : null}
          <input className="rounded border px-3 py-2" placeholder="Endereço" value={adress} onChange={e => setAdress(e.target.value)} required />
          <div>
            <label className="block mb-1 text-sm text-gray-700">Selecione a pessoa</label>
            <CustomSelect
              options={residentesOptions}
              value={person}
              onChange={(novoValor) => {
                setPerson(novoValor);
                const residenteSelecionado = residentes.find((residente) => String(residente.id) === String(novoValor));
                setPersonName(residenteSelecionado?.name || "");
              }}
              placeholder="Buscar pessoa..."
            />
          </div>
          <button type="submit" disabled={salvando} className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
            {salvando ? "Salvando..." : editando ? "Atualizar" : "Salvar"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
