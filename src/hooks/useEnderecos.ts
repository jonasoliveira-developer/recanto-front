"use client";

import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { listarEnderecos } from "@/services/enderecosApi";
import { chaveEnderecos } from "@/lib/swrKeys";

export type Endereco = {
  id: number;
  adress?: string;
  person?: number | string;
  personName?: string;
  [key: string]: unknown;
};

export function useEnderecos() {
  const { token } = useAuth();
  const chave = chaveEnderecos(token);
  const { data, error, isLoading, isValidating, mutate } = useSWR<Endereco[]>(
    chave,
    () => listarEnderecos(token!),
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  return {
    enderecos: data ?? [],
    erro: error,
    carregando: isLoading,
    validando: isValidating,
    recarregar: mutate,
  };
}
