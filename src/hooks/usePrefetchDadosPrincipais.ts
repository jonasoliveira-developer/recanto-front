"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useResidentes } from "./useResidentes";
import { usePagamentos } from "./usePagamentos";
import { useEnderecos } from "./useEnderecos";
import { useAvisos } from "./useAvisos";

const TIMEOUT_MS = 7000;

/**
 * Aquece o cache SWR dos dados principais. Retorna pronto quando
 * residentes+pagamentos carregaram ou timeout.
 */
export function usePrefetchDadosPrincipais() {
  const { estaAutenticado, token } = useAuth();
  const { carregando: carregandoResidentes } = useResidentes();
  const { carregando: carregandoPagamentos } = usePagamentos();
  const { carregando: carregandoEnderecos } = useEnderecos();
  const { carregando: carregandoAvisos } = useAvisos();
  const [timeoutEsgotado, setTimeoutEsgotado] = useState(false);
  const iniciado = useRef(false);

  useEffect(() => {
    if (!estaAutenticado || !token) return;
    if (iniciado.current) return;
    iniciado.current = true;
    const id = window.setTimeout(() => setTimeoutEsgotado(true), TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [estaAutenticado, token]);

  const aindaCarregando =
    carregandoResidentes ||
    carregandoPagamentos ||
    carregandoEnderecos ||
    carregandoAvisos;

  const pronto = !estaAutenticado || timeoutEsgotado || !aindaCarregando;

  return { pronto, aindaCarregando };
}
