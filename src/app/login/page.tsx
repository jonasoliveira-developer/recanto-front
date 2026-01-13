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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-blue-400">
      <form onSubmit={aoEnviar} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-blue-800 mb-4 text-center">Login</h1>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => definirEmail(e.target.value)}
          className="rounded border px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => definirSenha(e.target.value)}
          className="rounded border px-3 py-2"
          required
        />
        {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          disabled={carregando}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
