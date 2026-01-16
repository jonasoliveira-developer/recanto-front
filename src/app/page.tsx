
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { estaAutenticado } = useAuth();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    setVerificando(false);
    if (estaAutenticado) {
      router.replace("/avisos");
    }
  }, [estaAutenticado, router]);

  if (verificando) {
    return <div>Carregando...</div>;
  }

  if (estaAutenticado) {
    return <div>Redirecionando para avisos...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <h1>Bem-vindo ao sistema Recanto!</h1>
      <p>Você não está autenticado. Faça login para acessar o sistema.</p>
    </div>
  );
}

