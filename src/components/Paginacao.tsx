import React from "react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  aoMudar: (novaPagina: number) => void;
}

export function Paginacao({ paginaAtual, totalPaginas, aoMudar }: PaginacaoProps) {
  if (totalPaginas <= 1) return null;

  // Lógica para mostrar no máximo 5 páginas, com reticências
  const paginas: (number | string)[] = [];
  const maxPaginasVisiveis = 5;
  let start = Math.max(1, paginaAtual - 2);
  let end = Math.min(totalPaginas, paginaAtual + 2);

  if (paginaAtual <= 3) {
    start = 1;
    end = Math.min(totalPaginas, maxPaginasVisiveis);
  } else if (paginaAtual >= totalPaginas - 2) {
    start = Math.max(1, totalPaginas - maxPaginasVisiveis + 1);
    end = totalPaginas;
  }

  // Primeira página
  if (start > 1) {
    paginas.push(1);
    if (start > 2) paginas.push('...');
  }

  // Páginas do range
  for (let i = start; i <= end; i++) {
    paginas.push(i);
  }

  // Última página
  if (end < totalPaginas) {
    if (end < totalPaginas - 1) paginas.push('...');
    paginas.push(totalPaginas);
  }

  return (
    <>
      <nav className="flex justify-center mt-6">
        <ul className="inline-flex items-center gap-1 bg-white rounded-xl px-2 py-1">
          <li>
            <button
              className="px-3 py-2 rounded-l-lg bg-gray-100 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-40 text-blue-700 font-bold cursor-pointer"
              onClick={() => aoMudar(Math.max(1, paginaAtual - 10))}
              disabled={paginaAtual === 1}
              aria-label="Página anterior"
            >
              &lt;
            </button>
          </li>
          {paginas.map((pagina, idx) => (
            typeof pagina === 'number' ? (
              <li key={pagina}>
                <button
                  className={`px-3 py-2 mx-0.5 rounded-lg font-semibold transition-colors duration-150 cursor-pointer
                    ${pagina === paginaAtual
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "bg-gray-100 text-blue-700 hover:bg-blue-50 hover:text-blue-900"}
                  `}
                  onClick={() => {
                    aoMudar(pagina);
                  }}
                  disabled={pagina === paginaAtual}
                  aria-current={pagina === paginaAtual ? "page" : undefined}
                >
                  {pagina}
                </button>
              </li>
            ) : (
              <li key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400 select-none text-lg">...</li>
            )
          ))}
          <li>
            <button
              className="px-3 py-2 rounded-r-lg bg-gray-100 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-40 text-blue-700 font-bold cursor-pointer"
              onClick={() => aoMudar(Math.min(totalPaginas, paginaAtual + 10))}
              disabled={paginaAtual === totalPaginas}
              aria-label="Próxima página"
            >
              &gt;
            </button>
          </li>
        </ul>
      </nav>
      {/* ToastContainer removido, toasts só para requisições */}
    </>
  );
}
