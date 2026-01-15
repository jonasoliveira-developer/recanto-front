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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-0 mx-2 max-h-[90vh] flex flex-col">
        <div className="overflow-y-auto px-8 pb-8 pt-8 flex-1">{children}</div>
        <div className="flex justify-end px-8 pb-6 pt-2">
          <button onClick={aoFechar} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
      </div>
    </div>
  );
}
