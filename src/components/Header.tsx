import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { usuario, logout, estaAutenticado } = useAuth();

  return (
    <header className="w-full bg-[#DDA329] text-[#69553B] shadow px-4 sm:px-8 py-2 border-b-4 border-[#69553B]">
      <div className="flex flex-col items-center justify-center w-full">
        {/* Nome completo centralizado, responsivo */}
        <span className="font-extrabold text-lg sm:text-2xl tracking-widest text-[#69553B] text-center">
          <span className="block sm:hidden">L.C.V</span>
          <span className="hidden sm:block">Associação Comunitária Dos Moradores Do Loteamento Recanto De Itapuã</span>
        </span>
      </div>
      {/* Navegação centralizada */}
      <nav className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center mt-1">
        <Link href="/residents" className="text-[#69553B] hover:underline hover:text-white transition-colors">Residentes</Link>
        <Link href="/funcionarios" className="text-[#69553B] hover:underline hover:text-white transition-colors">Funcionários</Link>
        <Link href="/ocorrencias" className="text-[#69553B] hover:underline hover:text-white transition-colors">Ocorrências</Link>
        {/* <Link href="/reservas" className="text-[#69553B] hover:underline hover:text-white transition-colors">Reservas</Link> */}
        <Link href="/pagamentos" className="text-[#69553B] hover:underline hover:text-white transition-colors">Pagamentos</Link>
        <Link href="/avisos" className="text-[#69553B] hover:underline hover:text-white transition-colors">Avisos</Link>
        <Link href="/enderecos" className="text-[#69553B] hover:underline hover:text-white transition-colors">Endereços</Link>
        <Link href="/portaria" className="text-[#69553B] hover:underline hover:text-white transition-colors">Portaria</Link>
      </nav>
      {/* Login/Logout alinhado à direita em desktop, centralizado em mobile */}
      <div className="mt-1 flex items-center gap-4 justify-center sm:justify-end w-full">
        {estaAutenticado && usuario ? (
          <>
            <span className="text-sm text-[#69553B]">{usuario.email}</span>
            <button onClick={logout} className="bg-[#69553B] text-[#FFF] px-3 py-1 rounded hover:bg-[#C3B4A8] hover:text-[#69553B] transition-colors">Sair</button>
          </>
        ) : (
          <Link href="/login" className="bg-[#FFF] text-[#69553B] px-3 py-1 rounded border border-[#69553B] hover:bg-[#C3B4A8] hover:text-[#69553B] transition-colors">Entrar</Link>
        )}
      </div>
    </header>
  );
}
