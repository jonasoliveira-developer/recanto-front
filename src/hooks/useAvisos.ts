"use client";

import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { listarAvisos } from "@/services/avisosApi";
import { chaveAvisos } from "@/lib/swrKeys";

export type Aviso = {
  id: number;
  title?: string;
  description?: string;
  person?: number | string;
  personName?: string;
  [key: string]: unknown;
};

export function useAvisos() {
  const { token } = useAuth();
  const chave = chaveAvisos(token);
  const { data, error, isLoading, isValidating, mutate } = useSWR<Aviso[]>(
    chave,
    () => listarAvisos(token!),
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  return {
    avisos: data ?? [],
    erro: error,
    carregando: isLoading,
    validando: isValidating,
    recarregar: mutate,
  };
}
