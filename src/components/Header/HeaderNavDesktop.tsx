"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import { montarItensMenuMais, montarTabsPrimarias, tabEstaAtiva } from "@/lib/navegacaoTabBar";
import MenuMaisDrawer from "@/components/AppShell/MenuMaisDrawer";
import { useAuth } from "@/context/AuthContext";

export default function HeaderNavDesktop() {
  const pathname = usePathname() ?? "";
  const { logout } = useAuth();
  const [menuMaisAberto, setMenuMaisAberto] = useState(false);
  const tabs = montarTabsPrimarias();
  const linksMais = montarItensMenuMais();

  return (
    <>
      <nav
        className="hidden items-center gap-0.5 md:flex"
        aria-label="Navegação principal"
        data-chrome="nav-desktop"
      >
        {tabs.map((tab) => {
          const ativo = tabEstaAtiva(pathname, tab.href);
          const Icone = tab.icone;
          const rotulo = tab.labelCurto ?? tab.label;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex min-w-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 transition-colors ${
                ativo
                  ? "bg-[var(--rc-primary-strong)] text-white"
                  : "text-[var(--rc-primary-strong)]/80 hover:bg-white/25 hover:text-[var(--rc-primary-strong)]"
              }`}
              aria-current={ativo ? "page" : undefined}
              title={tab.label}
            >
              <Icone size={20} strokeWidth={ativo ? 2.5 : 2} aria-hidden />
              <span className="text-[12px] font-semibold leading-none tracking-tight">
                {rotulo}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMenuMaisAberto((v) => !v)}
          aria-expanded={menuMaisAberto}
          aria-label="Abrir menu Mais"
          title="Mais"
          className={`inline-flex min-w-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 transition-colors ${
            menuMaisAberto
              ? "bg-[var(--rc-primary-strong)] text-white"
              : "text-[var(--rc-primary-strong)]/80 hover:bg-white/25"
          }`}
        >
          <FiMenu size={20} strokeWidth={menuMaisAberto ? 2.5 : 2} aria-hidden />
          <span className="text-[12px] font-semibold leading-none tracking-tight">
            Mais
          </span>
        </button>
      </nav>

      <MenuMaisDrawer
        links={linksMais}
        aberto={menuMaisAberto}
        onFechar={() => setMenuMaisAberto(false)}
        onSair={logout}
      />
    </>
  );
}
