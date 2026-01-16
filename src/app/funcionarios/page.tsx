"use client";
import { useEffect, useState } from "react";
import { listarFuncionarios, removerFuncionario, atualizarFuncionario } from "../../services/funcionariosApi";
import { useAuth, UserRole, hasRole } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";
import { Paginacao } from "../../components/Paginacao";


export default function Funcionarios() {
  const [funcionarios, definirFuncionarios] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [carregando, definirCarregando] = useState(false);
  const [busca, definirBusca] = useState("");
  const [paginaAtual, definirPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const { usuario, token } = useAuth();
  // Estados do formulário
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    async function carregarFuncionarios() {
      definirCarregando(true);
      try {
        if (!token) {
          definirFuncionarios([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarFuncionarios(token);
        definirFuncionarios(dados);
      } catch {
        definirFuncionarios([]);
      }
      definirCarregando(false);
    }
    carregarFuncionarios();
  }, [token]);

  // Filtragem por busca
  const funcionariosFiltrados = funcionarios.filter((funcionario) => {
    const termo = busca.toLowerCase();
    return (
      funcionario.name?.toLowerCase().includes(termo) ||
      funcionario.email?.toLowerCase().includes(termo) ||
      funcionario.cpf?.toLowerCase().includes(termo)
    );
  });

  // Paginação
  const totalPaginas = Math.ceil(funcionariosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const funcionariosPaginados = funcionariosFiltrados.slice(inicio, fim);

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
        <h1 className="text-2xl font-extrabold text-[#69553B] mb-6 tracking-wider">Funcionários</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <input
            type="text"
            value={busca}
            onChange={aoBuscar}
            placeholder="Buscar por nome, e-mail ou CPF"
            className="rounded border border-[#C3B4A8] px-3 py-2 w-full md:max-w-full md:flex-1 focus:ring-2 focus:ring-[#DDA329]"
          />
          <button
            className="rounded-lg bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700 cursor-pointer md:ml-2 font-bold border border-green-700"
            onClick={() => definirModalAberto(true)}
          >
            Novo funcionário
          </button>
        </div>
      </header>
      <section className="rounded-lg bg-[#FFF] p-4 border border-[#C3B4A8]">
        {carregando ? (
          <p className="text-center text-green-700">Carregando...</p>
        ) : funcionariosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum funcionário encontrado.</p>
        ) : (
          <>
            {/* Tabela em tela grande, cards em tela pequena */}
            <div className="hidden md:block">
              <table className="min-w-full border rounded-lg overflow-hidden">
                <thead className="bg-[#FFF7E6]">
                  <tr>
                    <th className="px-4 py-2 text-left text-[#69553B]">Nome</th>
                    <th className="px-4 py-2 text-left text-[#69553B]">E-mail</th>
                    <th className="px-4 py-2 text-left text-[#69553B]">CPF</th>
                    <th className="px-4 py-2 text-left text-[#69553B]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionariosPaginados.map((funcionario) => (
                    <tr key={funcionario.id} className="border-b transition-colors duration-200 hover:bg-[#FFF7E6] cursor-pointer">
                      <td className="px-4 py-2 font-bold text-[#69553B]">{funcionario.name}</td>
                      <td className="px-4 py-2">{funcionario.email}</td>
                      <td className="px-4 py-2">{funcionario.cpf}</td>
                      <td className="px-4 py-2">
                        <>
                          <button
                            className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-700 cursor-pointer mr-2 font-bold border border-green-700"
                            onClick={() => {
                              setEditando(funcionario);
                              setNome(funcionario.name || "");
                              setCpf(funcionario.cpf || "");
                              setEmail(funcionario.email || "");
                              setSenha("");
                              definirModalAberto(true);
                            }}
                          >Editar</button>
                          <button
                            className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-800 cursor-pointer font-bold border border-red-800"
                            onClick={async () => {
                              if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
                                try {
                                  await removerFuncionario(funcionario.id, token || "");
                                  window.location.reload();
                                } catch (erro) {
                                  alert("Erro ao excluir funcionário!");
                                }
                              }
                            }}
                          >Excluir</button>
                        </>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="flex flex-col gap-4 md:hidden">
              {funcionariosPaginados.map((funcionario) => (
                <li key={funcionario.id} className="rounded border p-4 shadow hover:shadow-lg transition-colors duration-200 hover:bg-green-50 cursor-pointer">
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500 font-semibold">Nome</span>
                    <span className="block text-base text-green-800 font-bold">{funcionario.name}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500 font-semibold">E-mail</span>
                    <span className="block text-base text-gray-700">{funcionario.email}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500 font-semibold">CPF</span>
                    <span className="block text-base text-gray-700">{funcionario.cpf}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-700 cursor-pointer mr-2"
                      onClick={() => {
                        setEditando(funcionario);
                        setNome(funcionario.name || "");
                        setCpf(funcionario.cpf || "");
                        setEmail(funcionario.email || "");
                        setSenha("");
                        definirModalAberto(true);
                      }}
                    >Editar</button>
                    <button
                      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-800 cursor-pointer"
                      onClick={async () => {
                        if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
                          try {
                            await removerFuncionario(funcionario.id, token || "");
                            window.location.reload();
                          } catch (erro) {
                            alert("Erro ao excluir funcionário!");
                          }
                        }
                      }}
                    >Excluir</button>
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
      <Modal aberto={modalAberto} aoFechar={() => {definirModalAberto(false); setEditando(null); setNome(""); setCpf(""); setEmail(""); setSenha("");}} titulo={editando ? "Editar funcionário" : "Cadastrar funcionário"}>
        <form className="flex flex-col gap-3" onSubmit={async (e) => {
          e.preventDefault();
          if (!token) return;
          const dados: any = {
            name: nome,
            cpf,
            email,
            password: senha || (editando?.password ?? "")
          };
          try {
            if (editando) {
              await atualizarFuncionario(editando.id, dados, token);
              window.location.reload();
            } else {
              alert("Criação de funcionário não implementada.");
            }
          } catch (erro) {
            alert("Erro ao salvar funcionário!");
          }
        }}>
          <input className="rounded border px-3 py-2" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} />
          <input className="rounded border px-3 py-2" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} />
          <input className="rounded border px-3 py-2" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="rounded border px-3 py-2" placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} />
          <button type="submit" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
