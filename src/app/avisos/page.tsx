"use client";
import { useEffect, useState } from "react";
import { listarAvisos, atualizarAviso } from "../../services/avisosApi";
import { useAuth, UserRole, hasRole } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";
import { Paginacao } from "../../components/Paginacao";

export default function Avisos() {
  const [avisos, definirAvisos] = useState<any[]>([]);
  const [modalAberto, definirModalAberto] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [busca, definirBusca] = useState("");
  const [paginaAtual, definirPaginaAtual] = useState(1);
  const [editando, setEditando] = useState<any | null>(null);
  const [form, setForm] = useState({ title: "", description: "", personName: "", openDate: "" });
  const itensPorPagina = 10;
  const { usuario, token } = useAuth();

  useEffect(() => {
    async function carregarAvisos() {
      definirCarregando(true);
      try {
        if (!token) {
          definirAvisos([]);
          definirCarregando(false);
          return;
        }
        const dados = await listarAvisos(token);
        definirAvisos(dados);
      } catch {
        definirAvisos([]);
      }
      definirCarregando(false);
    }
    carregarAvisos();
  }, [token]);

  // Filtragem por busca
  const avisosFiltrados = avisos.filter((aviso) => {
    const termo = busca.toLowerCase();
    return (
      aviso.title?.toLowerCase().includes(termo) ||
      aviso.description?.toLowerCase().includes(termo) ||
      aviso.personName?.toLowerCase().includes(termo)
    );
  });

  // Paginação
  const totalPaginas = Math.ceil(avisosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const avisosPaginados = avisosFiltrados.slice(inicio, fim);

  function aoMudarPagina(novaPagina: number) {
    definirPaginaAtual(novaPagina);
  }

  function aoBuscar(e: React.ChangeEvent<HTMLInputElement>) {
    definirBusca(e.target.value);
    definirPaginaAtual(1);
  }

  function abrirModalNovo() {
    setEditando(null);
    setForm({ title: "", description: "", personName: "", openDate: "" });
    definirModalAberto(true);
  }

  function formatarData(data: string) {
    if (!data) return "";
    const d = new Date(data);
    if (isNaN(d.getTime())) return data;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  function abrirModalEditar(aviso: any) {
    setEditando(aviso);
    setForm({
      title: aviso.title || "",
      description: aviso.description || "",
      personName: aviso.personName || "",
      openDate: formatarData(aviso.openDate)
    });
    definirModalAberto(true);
  }

  function aoMudarForm(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.placeholder === "Data de abertura" ? "openDate" : e.target.placeholder === "Título" ? "title" : e.target.placeholder === "Descrição" ? "description" : "personName"]: e.target.value });
  }

  async function aoSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      definirModalAberto(false);
      setEditando(null);
      return;
    }
    if (editando) {
      // Editar aviso existente
      await atualizarAviso(editando.id, form, token);
      definirAvisos((avisos) => avisos.map(a => a.id === editando.id ? { ...a, ...form } : a));
      definirModalAberto(false);
      setEditando(null);
      return;
    }
    // Criar novo aviso (mantém lógica anterior)
    definirModalAberto(false);
    setEditando(null);
  }

  return (
    <div className="min-h-screen bg-white p-4 font-sans">
      <header className="mb-6 flex flex-col items-center sm:flex-row sm:justify-between gap-2 w-full max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-orange-900 w-full sm:w-auto text-center sm:text-left">Avisos</h1>
        <button
          className="w-full sm:w-auto mt-2 sm:mt-0 rounded-lg bg-orange-600 px-4 py-2 text-white shadow hover:bg-orange-700"
          style={{ minWidth: 0 }}
          onClick={abrirModalNovo}
        >
          Novo aviso
        </button>
      </header>
      <div className="mb-4 flex justify-end w-full max-w-xl mx-auto">
        <input
          type="text"
          value={busca}
          onChange={aoBuscar}
          placeholder="Buscar por título, descrição ou autor"
          className="rounded border px-3 py-2 w-full"
        />
      </div>
      <section className="rounded-lg bg-white p-4 w-full max-w-xl mx-auto">
        {carregando ? (
          <p className="text-center text-orange-700">Carregando...</p>
        ) : avisosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum aviso encontrado.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-4 w-full">
              {avisosPaginados.map((aviso) => (
                <li key={aviso.id} className="rounded border p-4 shadow hover:shadow-lg w-full">
                  <h2 className="text-lg font-semibold text-orange-800">{aviso.title}</h2>
                  <p className="text-sm text-gray-600">{aviso.description}</p>
                  <p className="text-sm text-gray-600">Autor: {aviso.personName}</p>
                  <button className="mt-2 rounded bg-orange-500 px-3 py-1 text-white hover:bg-orange-700" onClick={() => abrirModalEditar(aviso)}>Editar</button>
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
      <Modal aberto={modalAberto} aoFechar={() => { definirModalAberto(false); setEditando(null); }} titulo={editando ? "Editar aviso" : "Cadastrar aviso"}>
        <form className="flex flex-col gap-3" onSubmit={aoSalvar}>
          <input className="rounded border px-3 py-2 placeholder:text-gray-700" placeholder="Título" value={form.title} onChange={aoMudarForm} />
          <input className="rounded border px-3 py-2 placeholder:text-gray-700" placeholder="Descrição" value={form.description} onChange={aoMudarForm} />
          <input className="rounded border px-3 py-2 placeholder:text-gray-700" placeholder="Autor" value={form.personName} onChange={aoMudarForm} />
          <button type="submit" className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
