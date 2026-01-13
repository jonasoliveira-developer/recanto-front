"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

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
    const idSalvo = localStorage.getItem("id");
    const userSalvo = localStorage.getItem("user");
    const rolesSalvo = localStorage.getItem("roles");
    if (tokenSalvo) {
      definirToken(tokenSalvo);
      // Monta objeto usuário a partir dos dados salvos
      if (userSalvo) {
        definirUsuario({ email: userSalvo, id: idSalvo, roles: rolesSalvo });
      } else {
        definirUsuario(null);
      }
    }
  }, []);

  async function login(email: string, senha: string) {
    const tokenRecebido = await autenticarUsuario(email, senha);
    definirToken(tokenRecebido);
    // Pega dados do localStorage
    const id = localStorage.getItem("id");
    const user = localStorage.getItem("user");
    const roles = localStorage.getItem("roles");
    if (user) {
      definirUsuario({ email: user, id, roles });
    } else {
      definirUsuario(null);
    }
    router.push("/");
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
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
