import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export function useRequireAuth() {
  const { estaAutenticado, carregandoAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (carregandoAuth) return;
    if (!estaAutenticado) {
      router.replace("/login");
    }
  }, [estaAutenticado, carregandoAuth, router]);
}
