"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiLogOut, FiMapPin, FiAlertCircle, FiUserCheck } from "react-icons/fi";
import type { LinkNavegacao } from "@/lib/navegacaoLinks";
import { tabEstaAtiva } from "@/lib/navegacaoTabBar";

interface MenuMaisDrawerProps {
  links: LinkNavegacao[];
  aberto: boolean;
  onFechar: () => void;
  onSair?: () => void;
}

function iconeParaHref(href: string) {
  if (href.includes("funcionarios")) return FiUserCheck;
  if (href.includes("ocorrencias")) return FiAlertCircle;
  if (href.includes("enderecos")) return FiMapPin;
  return FiUserCheck;
}

export default function MenuMaisDrawer({
  links,
  aberto,
  onFechar,
  onSair,
}: MenuMaisDrawerProps) {
  const pathname = usePathname();
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [aberto, onFechar]);

  const pathnameInicial = useRef(pathname);
  useEffect(() => {
    if (pathnameInicial.current === pathname) return;
    pathnameInicial.current = pathname;
    onFechar();
  }, [pathname, onFechar]);

  if (!aberto || !montado) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-x-0 top-16 z-[100] cursor-default bg-black/40"
        style={{ bottom: "var(--app-chrome-bottom)" }}
        onClick={onFechar}
        aria-label="Fechar menu"
      />
      <div
        className="fixed right-0 top-16 z-[110] w-72 overflow-y-auto border-l border-[var(--rc-border)] bg-white shadow-xl"
        style={{ bottom: "var(--app-chrome-bottom)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Menu completo"
      >
        <nav className="flex flex-col pb-4 pt-2">
          {links.map((link) => {
            const estaAtivo = tabEstaAtiva(pathname ?? "", link.href);
            const Icone = iconeParaHref(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onFechar}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-colors ${
                  estaAtivo
                    ? "bg-[var(--rc-surface-soft)] text-[var(--rc-primary-strong)]"
                    : "text-[var(--rc-primary)] hover:bg-[var(--rc-surface-soft)]"
                }`}
              >
                <Icone size={18} aria-hidden />
                {link.label}
              </Link>
            );
          })}
          {onSair ? (
            <button
              type="button"
              onClick={() => {
                onFechar();
                onSair();
              }}
              className="mt-1 flex w-full items-center gap-3 border-t border-[var(--rc-border)] px-5 py-3.5 text-left text-sm font-semibold text-[var(--rc-danger)] hover:bg-red-50"
            >
              <FiLogOut size={18} aria-hidden />
              Sair
            </button>
          ) : null}
        </nav>
      </div>
    </>,
    document.body
  );
}
