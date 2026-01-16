import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { usuario, logout, estaAutenticado } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="w-full bg-[#DDA329] text-[#69553B] shadow px-4 sm:px-8 py-2 border-b-4 border-[#69553B] relative">
      <div className="hidden sm:flex w-full items-center justify-between gap-4 py-2">
        {/* Esquerda: Logo */}
        <div className="flex items-center justify-start min-w-[110px]">
          <img src="/96X96PX.svg" alt="Logo" className="h-24 w-auto" />
        </div>
        {/* Centro: Nome da associação e links */}
        <div className="flex flex-col items-center flex-1">
          <div className="font-extrabold text-xl tracking-widest text-[#69553B] text-center leading-tight">
            Associação Comunitária
            <br />
            Dos Moradores Do Loteamento Recanto De Itapuã
          </div>
          <nav className="flex flex-wrap gap-4 items-center justify-center mt-2">
            {estaAutenticado && usuario && (
              <>
                <Link href="/residents" className="text-[#4B2E09] hover:underline hover:text-white transition-colors">Residentes</Link>
                <Link href="/funcionarios" className="text-[#4B2E09] hover:underline hover:text-white transition-colors">Funcionários</Link>
                <Link href="/ocorrencias" className="text-[#4B2E09] hover:underline hover:text-white transition-colors">Ocorrências</Link>
                <Link href="/pagamentos" className="text-[#4B2E09] hover:underline hover:text-white transition-colors">Pagamentos</Link>
                <Link href="/avisos" className="text-[#4B2E09] hover:underline hover:text-white transition-colors">Avisos</Link>
                <Link href="/enderecos" className="text-[#4B2E09] hover:underline hover:text-white transition-colors">Endereços</Link>
              </>
            )}
          </nav>
        </div>
        {/* Direita: Usuário e botão */}
        <div className="flex flex-col items-end min-w-[180px]">
          {estaAutenticado && usuario ? (
            <>
              <span className="text-lg text-[#69553B] font-extrabold mb-1">{usuario.email}</span>
              <button onClick={logout} className="bg-[#69553B] text-[#FFF] px-8 py-1 rounded hover:bg-[#F5E9DD] hover:text-[#4B2E09] transition-colors">Sair</button>
            </>
          ) : (
            <Link href="/login" className="bg-[#FFF] text-[#69553B] px-3 py-1 rounded border border-[#69553B] hover:bg-[#C3B4A8] hover:text-[#69553B] transition-colors">Entrar</Link>
          )}
        </div>
      </div>
      {/* Login/Logout removido do header principal, agora apenas no menu lateral hamburger */}
      {/* Hamburger menu para mobile */}
      <div className="sm:hidden flex justify-end w-full pr-2 mt-2">
        <button
          aria-label="Abrir menu"
          className="text-2xl p-2 rounded focus:outline-none"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          <span className="block w-6 h-6">
            <span className="block w-full h-1 bg-[#69553B] mb-1 rounded"></span>
            <span className="block w-full h-1 bg-[#69553B] mb-1 rounded"></span>
            <span className="block w-full h-1 bg-[#69553B] rounded"></span>
          </span>
        </button>
      </div>
      {/* Menu lateral mobile */}
      {menuAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50" onClick={() => setMenuAberto(false)}>
          <div className="absolute top-0 right-0 w-64 h-full bg-[#DDA329] shadow-lg flex flex-col p-6 gap-4">
            <button
              aria-label="Fechar menu"
              className="self-end text-2xl mb-4"
              onClick={() => setMenuAberto(false)}
            >×</button>
            {/* Nome do usuário no topo do menu */}
            {estaAutenticado && usuario && (
              <span className="text-lg text-[#69553B] font-extrabold mb-2">{usuario.email}</span>
            )}
            {estaAutenticado && usuario && (
              <>
                <Link href="/residents" className="text-[#4B2E09] hover:underline hover:text-white transition-colors" onClick={() => setMenuAberto(false)}>Residentes</Link>
                <Link href="/funcionarios" className="text-[#4B2E09] hover:underline hover:text-white transition-colors" onClick={() => setMenuAberto(false)}>Funcionários</Link>
                <Link href="/ocorrencias" className="text-[#4B2E09] hover:underline hover:text-white transition-colors" onClick={() => setMenuAberto(false)}>Ocorrências</Link>
                {/* <Link href="/reservas" className="text-[#4B2E09] hover:underline hover:text-white transition-colors" onClick={() => setMenuAberto(false)}>Reservas</Link> */}
                <Link href="/pagamentos" className="text-[#4B2E09] hover:underline hover:text-white transition-colors" onClick={() => setMenuAberto(false)}>Pagamentos</Link>
                <Link href="/avisos" className="text-[#4B2E09] hover:underline hover:text-white transition-colors" onClick={() => setMenuAberto(false)}>Avisos</Link>
                <Link href="/enderecos" className="text-[#4B2E09] hover:underline hover:text-white transition-colors" onClick={() => setMenuAberto(false)}>Endereços</Link>
                {/* <Link href="/portaria" className="text-[#4B2E09] hover:underline hover:text-white transition-colors" onClick={() => setMenuAberto(false)}>Portaria</Link> */}
              </>
            )}
            <div className="mt-4 border-t border-[#C3B4A8] pt-4 flex flex-col items-start gap-2">
              {estaAutenticado && usuario ? (
                <button onClick={() => { logout(); setMenuAberto(false); }} className="bg-[#69553B] text-[#FFF] px-8 py-1 rounded hover:bg-[#C3B4A8] hover:text-[#69553B] transition-colors">Sair</button>
              ) : (
                <Link href="/login" className="bg-[#FFF] text-[#69553B] px-3 py-1 rounded border border-[#69553B] hover:bg-[#C3B4A8] hover:text-[#69553B] transition-colors" onClick={() => setMenuAberto(false)}>Entrar</Link>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Navegação tradicional para desktop: links à esquerda, usuário à direita */}
      {/* Removido bloco antigo de navegação desktop */}
    </header>
  );
}
