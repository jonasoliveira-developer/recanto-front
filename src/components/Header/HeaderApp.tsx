"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import HeaderNavDesktop from "./HeaderNavDesktop";

export default function HeaderApp() {
  const { estaAutenticado } = useAuth();

  if (!estaAutenticado) return null;

  return (
    <header className="sticky top-0 z-40 chrome-app-header safe-top">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-5 md:px-8">
        <Link
          href="/inicio"
          className="flex min-w-0 shrink-0 items-center gap-2"
          aria-label="Ir para início"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/96X96PX.svg"
            alt=""
            className="h-10 w-10 rounded-full border-2 border-[var(--rc-primary-strong)]/30 bg-white p-1"
          />
          <span className="truncate text-base font-extrabold text-[var(--rc-primary-strong)] sm:text-lg">
            Recanto
          </span>
        </Link>

        <HeaderNavDesktop />
      </div>
    </header>
  );
}
