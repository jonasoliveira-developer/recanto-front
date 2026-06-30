
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { estaAutenticado } = useAuth();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    setVerificando(false);
    if (estaAutenticado) {
      router.replace("/avisos");
    }
  }, [estaAutenticado, router]);

  if (verificando) {
    return (
      <div className="page-shell flex items-center justify-center">
        <p className="text-base font-semibold text-[var(--rc-muted)]">Carregando...</p>
      </div>
    );
  }

  if (estaAutenticado) {
    return (
      <div className="page-shell flex items-center justify-center">
        <p className="text-base font-semibold text-[var(--rc-muted)]">Redirecionando para avisos...</p>
      </div>
    );
  }

  return (
    <div className="page-shell flex items-center justify-center py-8">
      <section className="surface-card w-full max-w-2xl px-6 py-8 text-center sm:px-10 sm:py-10">
        <h1 className="mb-3 text-3xl font-extrabold text-[var(--rc-primary-strong)] sm:text-4xl">Bem-vindo ao Recanto</h1>
        <p className="text-base text-[var(--rc-muted)] sm:text-lg">Voce nao esta autenticado. Faca login para acessar o sistema.</p>
      </section>
    </div>
  );
}

