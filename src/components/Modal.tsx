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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{titulo}</h2>
          <button onClick={aoFechar} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
