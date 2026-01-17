import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export function useRequireAuth() {
  const { estaAutenticado } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!estaAutenticado) {
      router.replace("/login");
    }
  }, [estaAutenticado, router]);
}
