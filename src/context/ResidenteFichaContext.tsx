"use client";

import { createContext, useContext, useMemo } from "react";
import { useResidente, type Residente } from "@/hooks/useResidentes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useEnderecos } from "@/hooks/useEnderecos";
import { useAvisos } from "@/hooks/useAvisos";
import { useOcorrencias } from "@/hooks/useOcorrencias";
import { filtrarPorResidente } from "@/lib/filtros";

type Ctx = {
  id: string;
  residente: Residente | null;
  carregando: boolean;
  recarregar: () => void;
  pagamentos: ReturnType<typeof usePagamentos>["pagamentos"];
  enderecos: ReturnType<typeof useEnderecos>["enderecos"];
  avisos: ReturnType<typeof useAvisos>["avisos"];
  ocorrencias: ReturnType<typeof useOcorrencias>["ocorrencias"];
};

const ResidenteFichaContext = createContext<Ctx | null>(null);

export function useResidenteFicha() {
  const ctx = useContext(ResidenteFichaContext);
  if (!ctx) throw new Error("useResidenteFicha fora do provider");
  return ctx;
}

export function ResidenteFichaProvider({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { residente, carregando, recarregar } = useResidente(id);
  const { pagamentos } = usePagamentos();
  const { enderecos } = useEnderecos();
  const { avisos } = useAvisos();
  const { ocorrencias } = useOcorrencias();

  const value = useMemo<Ctx>(
    () => ({
      id,
      residente,
      carregando,
      recarregar: () => {
        void recarregar();
      },
      pagamentos: filtrarPorResidente(pagamentos, id),
      enderecos: filtrarPorResidente(enderecos, id),
      avisos: filtrarPorResidente(avisos, id),
      ocorrencias: filtrarPorResidente(ocorrencias, id),
    }),
    [
      id,
      residente,
      carregando,
      recarregar,
      pagamentos,
      enderecos,
      avisos,
      ocorrencias,
    ]
  );

  return (
    <ResidenteFichaContext.Provider value={value}>
      {children}
    </ResidenteFichaContext.Provider>
  );
}
