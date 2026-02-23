"use client";
import { useEffect, useState } from "react";
import { listarEnderecos } from "../../services/enderecosApi";
import { useAuth, UserRole, hasRole } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";
import { Paginacao } from "../../components/Paginacao";
import { CustomSelect } from "../../components/CustomSelect";

export default function Enderecos() {
  const [enderecos, definirEnderecos] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [busca, definirBusca] = useState("");
  const [paginaAtual, definirPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const { usuario, token } = useAuth();
  // Estados para formulário
  const [adress, setAdress] = useState("");
  const [person, setPerson] = useState("");
  const [personName, setPersonName] = useState("");
  const [residentes, setResidentes] = useState<any[]>([]);
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
          onClick={() => definirModalAberto(true)}
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
                  <button className="mt-2 rounded bg-teal-500 px-3 py-1 text-white hover:bg-teal-700">Editar</button>
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
      <Modal aberto={modalAberto} aoFechar={() => definirModalAberto(false)} titulo="Cadastrar endereço">
        <form className="flex flex-col gap-3" onSubmit={async e => {
          e.preventDefault();
          if (!adress || !person) return;
          // Busca nome do residente selecionado
          const selected = residentes.find(r => String(r.id) === String(person));
          setPersonName(selected?.name || "");
          // Chamar API para salvar
          try {
            const { criarEndereco } = await import("../../services/enderecosApi");
            await criarEndereco({ adress, person: person, personName: selected?.name || "" }, token || "");
            definirModalAberto(false);
            setAdress("");
            setPerson("");
            setPersonName("");
            // Recarregar endereços
            const dados = await listarEnderecos(token || "");
            definirEnderecos(dados);
          } catch {
            // erro
          }
        }}>
          <input className="rounded border px-3 py-2" placeholder="Endereço" value={adress} onChange={e => setAdress(e.target.value)} required />
          <div>
            <label className="block mb-1 text-sm text-gray-700">Selecione a pessoa</label>
            <CustomSelect
              options={residentesOptions}
              value={person}
              onChange={setPerson}
              placeholder="Buscar pessoa..."
            />
          </div>
          <button type="submit" className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
