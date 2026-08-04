"use client";

import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { listarPagamentos } from "@/services/pagamentosApi";
import { chavePagamentos } from "@/lib/swrKeys";

export type Pagamento = {
  id: number;
  title?: string;
  person?: number | string;
  personName?: string;
  adress?: string;
  cash?: number | string;
  situation?: number | string;
  datePayment?: string;
  finishPayment?: string;
  dueDate?: string;
  modePayment?: number | string;
  obs?: string;
  discount?: number | string;
};

export function usePagamentos() {
  const { token } = useAuth();
  const chave = chavePagamentos(token);
  const { data, error, isLoading, isValidating, mutate } = useSWR<Pagamento[]>(
    chave,
    () => listarPagamentos(token!),
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  return {
    pagamentos: data ?? [],
    erro: error,
    carregando: isLoading,
    validando: isValidating,
    recarregar: mutate,
  };
}
