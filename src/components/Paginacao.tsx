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
      <nav className="mt-6 flex justify-center">
        <ul className="inline-flex items-center gap-1 rounded-xl border border-[var(--rc-border)] bg-[var(--rc-surface)] px-2 py-1 shadow-sm">
          <li>
            <button
              className="cursor-pointer rounded-l-lg px-3 py-2 font-bold text-[var(--rc-primary)] transition-colors duration-150 hover:bg-[var(--rc-surface-soft)] disabled:opacity-40"
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
                  className={`mx-0.5 cursor-pointer rounded-lg px-3 py-2 font-semibold transition-colors duration-150
                    ${pagina === paginaAtual
                      ? "scale-105 bg-[var(--rc-primary)] text-white shadow-md"
                      : "bg-[var(--rc-surface-soft)] text-[var(--rc-primary)] hover:bg-[#efe3d6] hover:text-[var(--rc-primary-strong)]"}
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
              <li key={`ellipsis-${idx}`} className="select-none px-2 py-1 text-lg text-[var(--rc-muted)]">...</li>
            )
          ))}
          <li>
            <button
              className="cursor-pointer rounded-r-lg px-3 py-2 font-bold text-[var(--rc-primary)] transition-colors duration-150 hover:bg-[var(--rc-surface-soft)] disabled:opacity-40"
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
