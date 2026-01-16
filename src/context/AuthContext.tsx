"use client";
// Enum para roles
export enum UserRole {
  ADMIN = 0,
  EMPLOYEE = 1,
  RESIDENT = 2
}

export const ROLE_LABELS = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.EMPLOYEE]: "Funcionário",
  [UserRole.RESIDENT]: "Residente"
};

export function getRoleLabel(role: number | string) {
  if (role === 0 || role === "0") return ROLE_LABELS[UserRole.ADMIN];
  if (role === 1 || role === "1") return ROLE_LABELS[UserRole.EMPLOYEE];
  if (role === 2 || role === "2") return ROLE_LABELS[UserRole.RESIDENT];
  return "Desconhecido";
}

export function hasRole(usuario: any, role: UserRole) {
  if (!usuario || !usuario.roles) return false;
  if (Array.isArray(usuario.roles)) {
    return usuario.roles.includes(role) || usuario.roles.includes(String(role));
  }
  // roles pode ser string separada por vírgula
  return String(usuario.roles).split(",").includes(String(role));
}
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
