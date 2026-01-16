"use client";
import { useEffect, useState } from "react";
import { listarOcorrencias, removerOcorrencia, criarOcorrencia, atualizarOcorrencia } from "../../services/ocorrenciasApi";
import { useAuth, UserRole, hasRole } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";
import { Paginacao } from "../../components/Paginacao";


export default function Ocorrencias() {
  const [ocorrencias, definirOcorrencias] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [busca, definirBusca] = useState("");
  const [paginaAtual, definirPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const { usuario, token } = useAuth();
  // Formulário de criação/edição
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [situacao, setSituacao] = useState("");
  const [editando, setEditando] = useState<any | null>(null);
  // Busca o id do usuário logado do localStorage
  const usuarioId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
  const usuarioNome = typeof window !== "undefined" ? localStorage.getItem("user") : null;

  useEffect(() => {
    async function carregarOcorrencias() {
      definirCarregando(true);
      try {
        if (!token) {
          definirOcorrencias([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarOcorrencias(token);
        definirOcorrencias(dados);
      } catch {
        definirOcorrencias([]);
      }
      definirCarregando(false);
    }
    carregarOcorrencias();
  }, [token]);

  // Filtragem por busca
    const ocorrenciasFiltradas = ocorrencias.filter((ocorrencia) => {
      const termo = busca.toLowerCase();
      return (
        (typeof ocorrencia.title === 'string' && ocorrencia.title.toLowerCase().includes(termo)) ||
        (typeof ocorrencia.description === 'string' && ocorrencia.description.toLowerCase().includes(termo)) ||
        (typeof ocorrencia.situation === 'string' && ocorrencia.situation.toLowerCase().includes(termo))
      );
    });

  // Paginação
  const totalPaginas = Math.ceil(ocorrenciasFiltradas.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const ocorrenciasPaginadas = ocorrenciasFiltradas.slice(inicio, fim);

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
        <h1 className="text-4xl font-bold text-yellow-900 my-10 text-center w-full">Ocorrências</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 max-w-4xl w-full mx-auto">
          <input
            type="text"
            value={busca}
            onChange={aoBuscar}
            placeholder="Buscar por título, descrição ou situação"
            className="rounded border px-3 py-2 w-full md:max-w-full md:flex-1 min-w-0"
            style={{ minWidth: 0 }}
          />
          <button
            className="rounded-lg bg-yellow-600 px-4 py-2 text-white shadow hover:bg-yellow-700 md:ml-2 w-full md:w-auto"
            style={{ minWidth: '140px' }}
            onClick={() => definirModalAberto(true)}
          >
            Nova ocorrência
          </button>
        </div>
      </header>
      <section className="rounded-lg bg-white p-4">
        {carregando ? (
          <p className="text-center text-yellow-700">Carregando...</p>
        ) : ocorrenciasFiltradas.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma ocorrência encontrada.</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-1 max-w-4xl w-full mx-auto">
              {ocorrenciasPaginadas.map((ocorrencia) => (
                <li key={ocorrencia.id} className="rounded border p-6 shadow hover:shadow-lg transition-colors duration-200 hover:bg-yellow-50 cursor-pointer w-full h-full min-h-[260px] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    {ocorrencia.situation === 'ABERTO' || ocorrencia.situation === 0 ? (
                      <span className="text-xs font-bold uppercase tracking-wider text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                        Aberto
                      </span>
                    ) : ocorrencia.situation === 'FECHADO' || ocorrencia.situation === 1 ? (
                      <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-1 rounded">
                        Fechado
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">
                        {ocorrencia.situation}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-yellow-900 mb-4">{ocorrencia.title}</h2>
                  <p className="text-base text-gray-700 mb-8">{ocorrencia.description}</p>
                  <div className="flex justify-end gap-4 mt-4">
                    {(hasRole(usuario, UserRole.ADMIN) || (usuario && (usuario.email === ocorrencia.personName || usuario.email === ocorrencia.authorEmail))) && (
                      <>
                        <button
                          className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-700"
                          onClick={() => {
                            setEditando(ocorrencia);
                            setTitulo(ocorrencia.title || "");
                            setDescricao(ocorrencia.description || "");
                            setSituacao(ocorrencia.situation || "");
                            definirModalAberto(true);
                          }}
                        >Editar</button>
                        <button
                          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-800"
                          onClick={async () => {
                            if (window.confirm("Tem certeza que deseja excluir esta ocorrência?")) {
                              try {
                                await removerOcorrencia(ocorrencia.id, token || "");
                                definirOcorrencias((prev: any[]) => prev.filter(o => o.id !== ocorrencia.id));
                              } catch (erro) {
                                alert("Erro ao excluir ocorrência!");
                              }
                            }
                          }}
                        >Excluir</button>
                      </>
                    )}
                  </div>
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
      <Modal aberto={modalAberto} aoFechar={() => {definirModalAberto(false); setEditando(null); setTitulo(""); setDescricao(""); setSituacao("");}} titulo={editando ? "Editar ocorrência" : "Cadastrar ocorrência"}>
        <form className="flex flex-col gap-3" onSubmit={async (e) => {
          e.preventDefault();
          if (!token || !usuarioId) return;
          // Converte situação para número
          const situationValue = situacao === 'ABERTO' ? 0 : situacao === 'FECHADO' ? 1 : situacao;
          if (editando) {
            // Atualizar ocorrência
            const occurrence = {
              id: editando.id,
              title: titulo,
              description: descricao,
              situation: situationValue,
              person: usuarioId,
              personName: usuarioNome,
              openDate: editando.openDate,
              finishDate: editando.finishDate
            };
            try {
              await atualizarOcorrencia(editando.id, occurrence, token);
              definirModalAberto(false);
              setEditando(null);
              setTitulo("");
              setDescricao("");
              setSituacao("");
              // Atualiza lista após editar
              const dados = await listarOcorrencias(token);
              definirOcorrencias(dados);
              alert("Ocorrência atualizada com sucesso!");
            } catch (erro) {
              alert("Erro ao atualizar ocorrência!");
            }
          } else {
            // Criar ocorrência
            const occurrence = {
              title: titulo,
              description: descricao,
              situation: situationValue,
              person: { id: usuarioId }
            };
            try {
              await criarOcorrencia(occurrence, token);
              definirModalAberto(false);
              setTitulo("");
              setDescricao("");
              setSituacao("");
              // Atualiza lista após criar
              const dados = await listarOcorrencias(token);
              definirOcorrencias(dados);
              alert("Ocorrência criada com sucesso!");
            } catch (erro) {
              alert("Erro ao criar ocorrência!");
            }
          }
        }}>
          <input className="rounded border px-3 py-2" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} />
          <input className="rounded border px-3 py-2" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} />
          <select className="rounded border px-3 py-2" value={situacao} onChange={e => setSituacao(e.target.value)} required>
            <option value="">Selecione a situação</option>
            <option value="ABERTO">Aberto</option>
            <option value="FECHADO">Fechado</option>
          </select>
          <button type="submit" className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700">{editando ? "Atualizar" : "Criar"}</button>
        </form>
      </Modal>
    </div>
  );
}
