"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SplashMarcaApp from "@/components/ui/SplashMarcaApp";
import Link from "next/link";

export default function Home() {
  const { estaAutenticado, carregandoAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (carregandoAuth) return;
    if (estaAutenticado) {
      router.replace("/inicio");
    }
  }, [estaAutenticado, carregandoAuth, router]);

  if (carregandoAuth || estaAutenticado) {
    return <SplashMarcaApp subtitulo="Preparando sua visão 360…" />;
  }

  return (
    <div className="page-shell flex items-center justify-center py-8">
      <section className="surface-card w-full max-w-2xl px-6 py-8 text-center sm:px-10 sm:py-10">
        <h1 className="mb-3 text-3xl font-extrabold text-[var(--rc-primary-strong)] sm:text-4xl">
          Bem-vindo ao Recanto
        </h1>
        <p className="mb-6 text-base text-[var(--rc-muted)] sm:text-lg">
          Você não está autenticado. Faça login para acessar o sistema.
        </p>
        <Link href="/login" className="btn btn-primary">
          Entrar
        </Link>
      </section>
    </div>
  );
}
