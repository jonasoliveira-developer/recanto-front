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

export function hasRole(usuario: { roles?: string | string[] }, role: UserRole) {
  if (!usuario || !usuario.roles) return false;

  const roleStr = String(role);
  const roleLabelMap: Record<UserRole, string> = {
    [UserRole.ADMIN]: "ROLE_ADMIN",
    [UserRole.EMPLOYEE]: "ROLE_EMPLOYEE",
    [UserRole.RESIDENT]: "ROLE_RESIDENT"
  };
  const roleAliasMap: Record<UserRole, string> = {
    [UserRole.ADMIN]: "ADMIN",
    [UserRole.EMPLOYEE]: "EMPLOYEE",
    [UserRole.RESIDENT]: "RESIDENT"
  };

  const roleLabel = roleLabelMap[role];
  const roleAlias = roleAliasMap[role];

  const roles = Array.isArray(usuario.roles)
    ? usuario.roles.map((item) => String(item))
    : String(usuario.roles).split(/[,;\s]+/g);

  const normalizar = (valor: string) =>
    String(valor)
      .trim()
      .replace(/[\[\]\"']/g, "")
      .toUpperCase();

  return roles.some((item) => {
    const atual = normalizar(item);
    return atual === roleStr || atual === roleLabel || atual === roleAlias;
  });
}
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

import { autenticarUsuario } from "../services/authApi";

interface Usuario {
  email: string;
  perfil?: string;
  id?: string | number;
  roles?: string | string[];
  // Adicione outros campos conforme necessário
}

interface AuthContextProps {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  estaAutenticado: boolean;
  temPermissaoEfetiva: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, definirUsuario] = useState<Usuario | null>(null);
  const [token, definirToken] = useState<string | null>(null);
  const router = useRouter();

  function temPermissaoEfetiva(role: UserRole) {
    if (!usuario) return false;
    return hasRole(usuario, role);
  }

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    const idSalvo = localStorage.getItem("id");
    const userSalvo = localStorage.getItem("user");
    const rolesSalvo = localStorage.getItem("roles");
    if (tokenSalvo) {
      // Use um microtask para evitar setState direto no efeito
      Promise.resolve().then(() => {
        definirToken(tokenSalvo);
        if (userSalvo) {
          definirUsuario({ email: userSalvo, id: idSalvo ?? undefined, roles: rolesSalvo ?? undefined });
        } else {
          definirUsuario(null);
        }
      });
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
      definirUsuario({ email: user, id: id ?? undefined, roles: roles ?? undefined });
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
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        estaAutenticado,
        temPermissaoEfetiva
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
