"use client";

import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { listarOcorrencias } from "@/services/ocorrenciasApi";
import { chaveOcorrencias } from "@/lib/swrKeys";

export type Ocorrencia = {
  id: number;
  title?: string;
  description?: string;
  situation?: number | string;
  person?: number | string;
  personName?: string;
  [key: string]: unknown;
};

export function useOcorrencias() {
  const { token } = useAuth();
  const chave = chaveOcorrencias(token);
  const { data, error, isLoading, isValidating, mutate } = useSWR<Ocorrencia[]>(
    chave,
    () => listarOcorrencias(token!),
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  return {
    ocorrencias: data ?? [],
    erro: error,
    carregando: isLoading,
    validando: isValidating,
    recarregar: mutate,
  };
}
