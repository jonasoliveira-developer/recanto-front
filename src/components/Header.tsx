import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { usuario, logout, estaAutenticado } = useAuth();

  return (
    <header className="w-full bg-blue-700 text-white shadow flex flex-col sm:flex-row items-center justify-between px-6 py-4">
      <nav className="flex flex-wrap gap-4 items-center">
        <Link href="/" className="font-bold text-lg hover:underline">Início</Link>
        <Link href="/funcionarios" className="hover:underline">Funcionários</Link>
        <Link href="/ocorrencias" className="hover:underline">Ocorrências</Link>
        {/* <Link href="/reservas" className="hover:underline">Reservas</Link> */}
        <Link href="/pagamentos" className="hover:underline">Pagamentos</Link>
        <Link href="/avisos" className="hover:underline">Avisos</Link>
        <Link href="/enderecos" className="hover:underline">Endereços</Link>
        <Link href="/portaria" className="hover:underline">Portaria</Link>
      </nav>
      <div className="mt-2 sm:mt-0 flex items-center gap-4">
        {estaAutenticado && usuario ? (
          <>
            <span className="text-sm">{usuario.email}</span>
            <button onClick={logout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Sair</button>
          </>
        ) : (
          <Link href="/login" className="bg-white text-blue-700 px-3 py-1 rounded hover:bg-blue-100">Entrar</Link>
        )}
      </div>
    </header>
  );
}
