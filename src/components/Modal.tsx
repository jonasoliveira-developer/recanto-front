import React from "react";

interface ModalProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: React.ReactNode;
}

export function Modal({ aberto, aoFechar, titulo, children }: ModalProps) {
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/60 backdrop-blur">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-0 mx-2 max-h-[90vh] flex flex-col relative justify-center">
        <button
          onClick={aoFechar}
          className="absolute top-2 right-4 mb-4 text-4xl text-gray-400 hover:text-gray-700 font-extrabold z-10 w-12 h-12 flex items-center justify-center transition-all"
          aria-label="Fechar modal"
        >×</button>
        <div className="px-8 pt-16 pb-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
