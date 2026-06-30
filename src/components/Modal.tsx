import React from "react";

interface ModalProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: React.ReactNode;
}

export function Modal({ aberto, aoFechar, titulo, children }: ModalProps) {
  React.useEffect(() => {
    if (aberto) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [aberto]);
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/55 backdrop-blur-sm">
      <div className="relative mx-3 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-[var(--rc-border)] bg-[var(--rc-surface)] shadow-2xl">
        <button
          onClick={aoFechar}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full text-2xl font-bold text-[var(--rc-muted)] transition-colors hover:bg-[var(--rc-surface-soft)] hover:text-[var(--rc-primary-strong)]"
          aria-label="Fechar modal"
        >×</button>
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-14 sm:px-7 sm:pb-7">
          <h2 className="mb-5 text-2xl font-extrabold text-[var(--rc-primary-strong)]">{titulo}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}
