"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { autenticarUsuario } from "../services/authApi";

interface Usuario {
  email: string;
  perfil?: string;
  [chave: string]: any;
}

interface AuthContextProps {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  estaAutenticado: boolean;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, definirUsuario] = useState<Usuario | null>(null);
  const [token, definirToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    if (tokenSalvo) {
      definirToken(tokenSalvo);
      try {
        const dados: Usuario = jwtDecode(tokenSalvo);
        if (dados && typeof dados === "object" && dados.email) {
          definirUsuario(dados);
        } else {
          definirUsuario(null);
        }
      } catch (erro) {
        console.error("Token JWT inválido:", erro);
        definirUsuario(null);
      }
    }
  }, []);

  async function login(email: string, senha: string) {
    const tokenRecebido = await autenticarUsuario(email, senha);
    localStorage.setItem("token", tokenRecebido);
    definirToken(tokenRecebido);
    try {
      const dados: Usuario = jwtDecode(tokenRecebido);
      definirUsuario(dados);
    } catch {
      definirUsuario(null);
    }
    router.push("/");
  }

  function logout() {
    localStorage.removeItem("token");
    definirToken(null);
    definirUsuario(null);
    router.push("/login");
  }

  const estaAutenticado = !!token;

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, estaAutenticado }}>
      {children}
    </AuthContext.Provider>
  );
}
