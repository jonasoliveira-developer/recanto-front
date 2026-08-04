"use client";

import { usePathname } from "next/navigation";
import HeaderApp from "@/components/Header/HeaderApp";
import AppMobileTabBar from "@/components/AppShell/AppMobileTabBar";
import PrefetchGate from "@/components/AppShell/PrefetchGate";
import SplashMarcaApp from "@/components/ui/SplashMarcaApp";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rotaPublica, rotaSemChrome } from "@/lib/navegacaoLinks";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { estaAutenticado, carregandoAuth } = useAuth();
  const semChrome = rotaSemChrome(pathname);
  const publica = rotaPublica(pathname);

  if (carregandoAuth) {
    return <SplashMarcaApp subtitulo="Restaurando sua sessão…" />;
  }

  if (semChrome || (publica && !estaAutenticado)) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-7xl px-3 py-4 sm:px-5 md:px-8">
        {children}
      </main>
    );
  }

  return <AppShellAutenticado>{children}</AppShellAutenticado>;
}

function AppShellAutenticado({ children }: { children: React.ReactNode }) {
  const { estaAutenticado } = useAuth();
  useRequireAuth();

  if (!estaAutenticado) {
    return <SplashMarcaApp subtitulo="Redirecionando para o login…" />;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden md:h-auto md:min-h-dvh md:overflow-visible">
      <HeaderApp />
      <main
        data-app-scroll
        className="mx-auto min-h-0 w-full max-w-7xl flex-1 overflow-y-auto overscroll-y-contain px-3 pb-app-chrome pt-4 sm:px-5 md:overflow-visible md:px-8 md:pb-8"
      >
        <PrefetchGate>{children}</PrefetchGate>
      </main>
      <AppMobileTabBar />
    </div>
  );
}
