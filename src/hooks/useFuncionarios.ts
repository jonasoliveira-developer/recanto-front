"use client";

import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { listarFuncionarios } from "@/services/funcionariosApi";
import { chaveFuncionarios } from "@/lib/swrKeys";

export type Funcionario = {
  id: number;
  name?: string;
  email?: string;
  cpf?: string;
  [key: string]: unknown;
};

export function useFuncionarios() {
  const { token } = useAuth();
  const chave = chaveFuncionarios(token);
  const { data, error, isLoading, isValidating, mutate } = useSWR<Funcionario[]>(
    chave,
    () => listarFuncionarios(token!),
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  return {
    funcionarios: data ?? [],
    erro: error,
    carregando: isLoading,
    validando: isValidating,
    recarregar: mutate,
  };
}
