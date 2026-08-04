"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import { TabPrimaria, tabEstaAtiva } from "@/lib/navegacaoTabBar";

interface BottomTabBarProps {
  tabs: TabPrimaria[];
  onAbrirMais: () => void;
  maisAberto?: boolean;
}

export default function BottomTabBar({
  tabs,
  onAbrirMais,
  maisAberto = false,
}: BottomTabBarProps) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      role="navigation"
      aria-label="Navegação principal"
      data-chrome="navegacao-mobile"
      className="fixed inset-x-0 bottom-0 z-[var(--z-chrome)] chrome-glass-bottom safe-bottom md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 min-h-[var(--app-tab-bar-height)]">
        {tabs.map((tab) => {
          const ativo = tabEstaAtiva(pathname, tab.href);
          const Icone = tab.icone;
          const rotulo = tab.labelCurto ?? tab.label;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 transition-colors ${
                ativo
                  ? "text-[var(--color-tab-active)]"
                  : "text-[var(--color-tab-inactive)]"
              }`}
              aria-current={ativo ? "page" : undefined}
            >
              {ativo ? (
                <span
                  aria-hidden
                  className="absolute top-1.5 h-1 w-5 rounded-full bg-[var(--rc-primary)]"
                />
              ) : null}
              <Icone size={22} strokeWidth={ativo ? 2.5 : 2} aria-hidden />
              <span className="max-w-full truncate text-[11px] font-semibold leading-none tracking-tight">
                {rotulo}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onAbrirMais}
          aria-expanded={maisAberto}
          aria-label="Abrir menu completo"
          className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 transition-colors ${
            maisAberto
              ? "text-[var(--color-tab-active)]"
              : "text-[var(--color-tab-inactive)]"
          }`}
        >
          {maisAberto ? (
            <span
              aria-hidden
              className="absolute top-1.5 h-1 w-5 rounded-full bg-[var(--rc-primary)]"
            />
          ) : null}
          <FiMenu size={22} strokeWidth={maisAberto ? 2.5 : 2} aria-hidden />
          <span className="text-[11px] font-semibold leading-none tracking-tight">
            Mais
          </span>
        </button>
      </div>
    </nav>
  );
}
