"use client";

import { useAuth } from "@/context/AuthContext";
import { usePrefetchDadosPrincipais } from "@/hooks/usePrefetchDadosPrincipais";
import SplashMarcaApp from "@/components/ui/SplashMarcaApp";

export default function PrefetchGate({ children }: { children: React.ReactNode }) {
  const { estaAutenticado, carregandoAuth } = useAuth();
  const { pronto } = usePrefetchDadosPrincipais();

  const sessaoEmCache =
    typeof window !== "undefined" && !!localStorage.getItem("token");

  const bloquear =
    estaAutenticado && !carregandoAuth && !pronto && !sessaoEmCache;

  return (
    <>
      {children}
      {bloquear ? <SplashMarcaApp /> : null}
    </>
  );
}
