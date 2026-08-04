"use client";

export interface SplashMarcaAppProps {
  titulo?: string;
  subtitulo?: string;
  ariaLabel?: string;
  rodape?: string;
}

export default function SplashMarcaApp({
  titulo = "Recanto",
  subtitulo = "Associação Comunitária dos Moradores do Loteamento Recanto de Itapuã",
  ariaLabel = "Carregando Recanto",
  rodape,
}: SplashMarcaAppProps = {}) {
  const ano = new Date().getFullYear();
  const rodapeFinal = rodape ?? `© ${ano} Recanto — gestão do condomínio`;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
      style={{
        background:
          "linear-gradient(160deg, #4e392a 0%, #6b4f3a 40%, #8b6a52 100%)",
      }}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="flex max-w-sm flex-col items-center text-center animate-[splash-fade-in_0.35s_ease-out]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/96X96PX.svg"
          alt=""
          className="mb-5 h-20 w-20 rounded-2xl border-2 border-white/30 bg-white/95 p-2 shadow-lg"
        />
        <p className="splash-nome-app text-3xl font-bold tracking-tight sm:text-4xl">
          {titulo}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/90 sm:text-base">
          {subtitulo}
        </p>
        <p className="splash-aguardando mt-3 text-xs font-semibold uppercase tracking-widest text-white/70">
          Aguardando dados…
        </p>
        <div
          className="mt-8 h-8 w-8 rounded-full border-2 border-white/40 border-t-white animate-spin"
          aria-hidden
        />
      </div>
      <p className="absolute bottom-8 left-0 right-0 text-center text-xs text-white/70">
        {rodapeFinal}
      </p>
    </div>
  );
}
