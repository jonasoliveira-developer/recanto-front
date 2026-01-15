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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-0 mx-2 h-screen max-h-screen flex flex-col relative">
        <button
          onClick={aoFechar}
          className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700 font-bold z-10"
          aria-label="Fechar modal"
        >×</button>
        <div className="px-8 pt-8 pb-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
