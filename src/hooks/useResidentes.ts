"use client";

import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { listarResidentes, buscarResidentePorId } from "@/services/recantoApi";
import { chaveResidentes, chaveResidente } from "@/lib/swrKeys";

export type Residente = {
  id: number;
  name?: string;
  email?: string;
  cpf?: string;
  phoneNumber?: string;
  password?: string;
  profiles?: (number | string)[];
  dateCriation?: string;
  [key: string]: unknown;
};

export function useResidentes() {
  const { token } = useAuth();
  const chave = chaveResidentes(token);
  const { data, error, isLoading, isValidating, mutate } = useSWR<Residente[]>(
    chave,
    () => listarResidentes(token!),
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  return {
    residentes: data ?? [],
    erro: error,
    carregando: isLoading,
    validando: isValidating,
    recarregar: mutate,
  };
}

export function useResidente(id: number | string | null) {
  const { token } = useAuth();
  const chave = chaveResidente(token, id);
  const { data, error, isLoading, mutate } = useSWR<Residente>(
    chave,
    () => buscarResidentePorId(Number(id), token!),
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  return {
    residente: data ?? null,
    erro: error,
    carregando: isLoading,
    recarregar: mutate,
  };
}
