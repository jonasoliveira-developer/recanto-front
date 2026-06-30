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
    <div className="page-shell flex items-center justify-center bg-[radial-gradient(circle_at_15%_20%,#f2dfc8_0%,#f7f3ee_40%,#f7f3ee_100%)] px-3 py-8">
      <form onSubmit={aoEnviar} className="surface-card w-full max-w-md p-6 sm:p-8 flex flex-col gap-4">
        <div className="mb-5 flex flex-col items-center justify-center gap-4">
          <img src="/96X96PX.svg" alt="Logo" className="h-24 w-24 rounded-xl border border-[var(--rc-border)] bg-white p-2 shadow-sm" />
          <h1 className="text-3xl font-extrabold text-[var(--rc-primary-strong)] text-center">Entrar</h1>
          <p className="text-sm text-[var(--rc-muted)] text-center">Acesse sua conta para continuar no sistema</p>
        </div>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => definirEmail(e.target.value)}
          className="input-base"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => definirSenha(e.target.value)}
          className="input-base"
          required
        />
        {erro ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{erro}</p> : null}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={carregando}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
