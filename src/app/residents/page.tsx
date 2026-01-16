"use client";
import { useEffect, useState } from "react";
import { listarResidentes, atualizarResidente, removerResidente } from "../../services/recantoApi";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/Modal";
import { Paginacao } from "../../components/Paginacao";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResidentsPage() {
	const [residentes, definirResidentes] = useState<any[]>([]);
	const [modalAberto, definirModalAberto] = useState(false);
	const [editando, setEditando] = useState<any | null>(null);
	const [carregando, definirCarregando] = useState(false);
	const [busca, definirBusca] = useState("");
	const [paginaAtual, definirPaginaAtual] = useState(1);
	const itensPorPagina = 6;
	const { token } = useAuth();

	// Estados do formulário do modal
	const [nome, setNome] = useState("");
	const [cpf, setCpf] = useState("");
	const [email, setEmail] = useState("");
	const [telefone, setTelefone] = useState("");
	const [senha, setSenha] = useState("");
	const [perfis, setPerfis] = useState<number[]>([2]);

	async function carregarResidentes() {
		definirCarregando(true);
		try {
			if (!token) {
				definirResidentes([]);
				definirCarregando(false);
				return;
			}
			const dados = await listarResidentes(token);
			definirResidentes(dados);
		} catch {
			definirResidentes([]);
		}
		definirCarregando(false);
	}

	useEffect(() => {
		carregarResidentes();
	}, [token]);

	// Filtragem por busca
	const residentesFiltrados = residentes.filter((residente) => {
		const termo = busca.toLowerCase();
		return (
			residente.name?.toLowerCase().includes(termo) ||
			residente.email?.toLowerCase().includes(termo) ||
			residente.cpf?.toLowerCase().includes(termo) ||
			residente.phoneNumber?.toLowerCase().includes(termo)
		);
	});

	// Paginação
	const totalPaginas = Math.ceil(residentesFiltrados.length / itensPorPagina);
	const inicio = (paginaAtual - 1) * itensPorPagina;
	const fim = inicio + itensPorPagina;
	const residentesPaginados = residentesFiltrados.slice(inicio, fim);

	function aoMudarPagina(novaPagina: number) {
		definirPaginaAtual(novaPagina);
	}

	function aoBuscar(e: React.ChangeEvent<HTMLInputElement>) {
		definirBusca(e.target.value);
		definirPaginaAtual(1);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!token) return;
		const dados: any = {
			name: nome,
			cpf,
			email,
			password: senha || (editando?.password ?? ""),
			profiles: perfis,
			dateCriation: new Date().toLocaleDateString('pt-BR')
		};
		if (telefone) dados.phoneNumber = telefone;
		try {
			if (editando) {
				await atualizarResidente(editando.id, dados, token);
				toast.success("Residente atualizado com sucesso!");
			} else {
				const resposta = await (await import("../../services/recantoApi")).criarResidente(dados, token);
				toast.success("Residente cadastrado com sucesso!");
			}
			definirModalAberto(false);
			setNome(""); setCpf(""); setEmail(""); setTelefone(""); setSenha(""); setPerfis([2]); setEditando(null);
			await carregarResidentes();
		} catch (erro: any) {
			toast.error("Erro ao salvar residente! " + (erro?.response?.data?.message || ""));
			console.error("Erro ao salvar residente:", erro);
		}
	}

	return (
		<div className="min-h-screen bg-white p-4 font-sans">
			<header className="mb-6">
				<h1 className="text-2xl font-extrabold text-[#69553B] mb-6 tracking-wider">Residentes</h1>
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
					<input
						type="text"
						value={busca}
						onChange={aoBuscar}
						placeholder="Buscar por nome, e-mail, CPF ou telefone"
						className="rounded border border-[#C3B4A8] px-3 py-2 w-full md:max-w-full md:flex-1 focus:ring-2 focus:ring-[#DDA329]"
					/>
					<button
						className="rounded bg-[#DDA329] px-6 py-2 text-[#69553B] font-bold hover:bg-[#69553B] hover:text-[#FFF] border border-[#69553B] cursor-pointer md:ml-2 transition-colors"
						onClick={() => definirModalAberto(true)}
					>
						Novo residente
					</button>
				</div>
			</header>
			<section className="bg-white p-4">
				{carregando ? (
					<p className="text-center text-gray-500">Carregando...</p>
				) : residentesFiltrados.length === 0 ? (
					<p className="text-center text-gray-500">Nenhum residente encontrado.</p>
				) : (
					<table className="min-w-full border-t border-b border-[#C3B4A8]">
						<thead>
							<tr>
								<th className="px-4 py-2 text-left">Nome</th>
								<th className="px-4 py-2 text-left">E-mail</th>
								<th className="px-4 py-2 text-left">CPF</th>
								<th className="px-4 py-2 text-left">Telefone</th>
								<th className="px-4 py-2 text-left">Ações</th>
							</tr>
						</thead>
						<tbody>
							{residentesPaginados.map((residente) => (
								<tr key={residente.id} className="border-b border-[#C3B4A8]">
									<td className="px-4 py-2">{residente.name}</td>
									<td className="px-4 py-2">{residente.email}</td>
									<td className="px-4 py-2">{residente.cpf}</td>
									<td className="px-4 py-2">{residente.phoneNumber}</td>
									<td className="px-4 py-2">
										<button
											className="rounded bg-[#C3B4A8] px-3 py-1 text-[#69553B] hover:bg-[#DDA329] hover:text-[#69553B] border border-[#69553B] cursor-pointer mr-2 transition-colors"
											onClick={() => {
												setEditando(residente);
												setNome(residente.name || "");
												setCpf(residente.cpf || "");
												setEmail(residente.email || "");
												setTelefone(residente.phoneNumber || "");
												setSenha("");
												const perfisInt = Array.isArray(residente.profiles)
													? residente.profiles.map((p: any) => typeof p === 'string' ? (p === 'RESIDENT' ? 2 : p === 'ADMIN' ? 0 : p === 'EMPLOYEE' ? 1 : 2) : p)
													: [2];
												setPerfis(perfisInt);
												definirModalAberto(true);
											}}
										>Editar</button>
										<button
											className="rounded bg-[#69553B] px-3 py-1 text-[#FFF] hover:bg-[#DDA329] hover:text-[#69553B] border border-[#69553B] cursor-pointer transition-colors"
											onClick={async () => {
												if (window.confirm("Tem certeza que deseja excluir este residente?")) {
													try {
														await removerResidente(residente.id, token);
														toast.success("Residente excluído com sucesso!");
														await carregarResidentes();
													} catch (erro: any) {
														toast.error("Erro ao excluir residente! " + (erro?.response?.data?.message || ""));
													}
												}
											}}
										>Excluir</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</section>
			<Paginacao
				paginaAtual={paginaAtual}
				totalPaginas={totalPaginas}
				aoMudar={aoMudarPagina}
			/>
			<Modal
				aberto={modalAberto}
				aoFechar={() => {definirModalAberto(false); setEditando(null);}}
				titulo={editando ? "Editar residente" : "Cadastrar residente"}
			>
				<form className="flex flex-col gap-3" onSubmit={handleSubmit}>
					<input className="rounded border px-3 py-2" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} required />
					<input className="rounded border px-3 py-2" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} required />
					<input className="rounded border px-3 py-2" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
					<input className="rounded border px-3 py-2" placeholder="Telefone (opcional)" value={telefone} onChange={e => setTelefone(e.target.value)} />
					<input className="rounded border px-3 py-2" placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} />
					<div className="flex gap-4 items-center">
						<label className="flex items-center gap-1">
							<input type="checkbox" name="perfil" value={0} checked={perfis.includes(0)} onChange={e => {
								if (e.target.checked) setPerfis([...perfis, 0]);
								else setPerfis(perfis.filter(p => p !== 0));
							}} /> ADM
						</label>
						<label className="flex items-center gap-1">
							<input type="checkbox" name="perfil" value={1} checked={perfis.includes(1)} onChange={e => {
								if (e.target.checked) setPerfis([...perfis, 1]);
								else setPerfis(perfis.filter(p => p !== 1));
							}} /> Funcionário
						</label>
						<label className="flex items-center gap-1">
							<input type="checkbox" name="perfil" value={2} checked={perfis.includes(2)} onChange={e => {
								if (e.target.checked) setPerfis([...perfis, 2]);
								else setPerfis(perfis.filter(p => p !== 2));
							}} /> Residente
						</label>
					</div>
					<button type="submit" className="rounded bg-[#DDA329] px-4 py-2 text-[#69553B] font-bold hover:bg-[#69553B] hover:text-[#FFF] border border-[#69553B] cursor-pointer">Salvar</button>
				</form>
				<ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
			</Modal>
		</div>
	);
}
