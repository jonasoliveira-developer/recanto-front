"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");
  const [erro, definirErro] = useState("");
  const [carregando, definirCarregando] = useState(false);
  const { login } = useAuth();

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    definirCarregando(true);
    definirErro("");
    try {
      await login(email, senha);
    } catch {
      definirErro("Credenciais inválidas. Tente novamente.");
    }
    definirCarregando(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5E9DD] to-[#DDA329]">
      <form onSubmit={aoEnviar} className="bg-[#FFF8F0] rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col gap-4 border border-[#C3B4A8]">
        <div className="flex flex-row items-center justify-center mb-8 gap-4">
          <img src="/96X96PX.svg" alt="Logo" className="w-32 h-32" />
          <h1 className="text-3xl font-extrabold text-[#4B2E09] text-left">Login</h1>
        </div>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => definirEmail(e.target.value)}
          className="rounded border border-[#C3B4A8] px-3 py-2 bg-[#FFF] text-[#4B2E09] focus:border-[#DDA329]"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => definirSenha(e.target.value)}
          className="rounded border border-[#C3B4A8] px-3 py-2 bg-[#FFF] text-[#4B2E09] focus:border-[#DDA329]"
          required
        />
        {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
        <button
          type="submit"
          className="rounded bg-[#DDA329] px-6 py-2 text-[#4B2E09] font-bold hover:bg-[#C3B4A8] hover:text-[#69553B] transition-colors"
          disabled={carregando}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
