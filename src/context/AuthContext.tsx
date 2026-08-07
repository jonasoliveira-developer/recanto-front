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
import {
  EVENTO_SESSAO_EXPIRADA,
  limparSessaoLocal,
  msAteExpirar,
  tokenEstaExpirado,
} from "@/lib/token";

interface Usuario {
  email: string;
  perfil?: string;
  id?: string | number;
  roles?: string | string[];
}

interface AuthContextProps {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  estaAutenticado: boolean;
  carregandoAuth: boolean;
  temPermissaoEfetiva: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, definirUsuario] = useState<Usuario | null>(null);
  const [token, definirToken] = useState<string | null>(null);
  const [carregandoAuth, definirCarregandoAuth] = useState(true);
  const router = useRouter();

  function temPermissaoEfetiva(role: UserRole) {
    if (!usuario) return false;
    return hasRole(usuario, role);
  }

  function limparEstadoAuth() {
    limparSessaoLocal();
    definirToken(null);
    definirUsuario(null);
  }

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    const idSalvo = localStorage.getItem("id");
    const userSalvo = localStorage.getItem("user");
    const rolesSalvo = localStorage.getItem("roles");

    if (tokenSalvo && !tokenEstaExpirado(tokenSalvo)) {
      definirToken(tokenSalvo);
      if (userSalvo) {
        definirUsuario({
          email: userSalvo,
          id: idSalvo ?? undefined,
          roles: rolesSalvo ?? undefined,
        });
      } else {
        definirUsuario(null);
      }
    } else if (tokenSalvo) {
      limparSessaoLocal();
    }

    definirCarregandoAuth(false);
  }, []);

  useEffect(() => {
    function aoSessaoExpirada() {
      definirToken(null);
      definirUsuario(null);
    }
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoSessaoExpirada);
    return () =>
      window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoSessaoExpirada);
  }, []);

  // Se o token expirar com a aba aberta, força logout
  useEffect(() => {
    if (!token) return;
    if (tokenEstaExpirado(token)) {
      limparEstadoAuth();
      router.replace("/login");
      return;
    }

    const ms = msAteExpirar(token);
    if (ms === null) return;
    if (ms <= 0) {
      limparEstadoAuth();
      router.replace("/login");
      return;
    }

    const id = window.setTimeout(() => {
      limparEstadoAuth();
      router.replace("/login");
    }, Math.min(ms + 500, 2_147_483_647));
    return () => window.clearTimeout(id);
  }, [token, router]);

  async function login(email: string, senha: string) {
    const tokenRecebido = await autenticarUsuario(email, senha);
    if (tokenEstaExpirado(tokenRecebido)) {
      limparSessaoLocal();
      throw new Error("Token inválido ou já expirado.");
    }
    definirToken(tokenRecebido);
    const id = localStorage.getItem("id");
    const user = localStorage.getItem("user");
    const roles = localStorage.getItem("roles");
    if (user) {
      definirUsuario({ email: user, id: id ?? undefined, roles: roles ?? undefined });
    } else {
      definirUsuario(null);
    }
    router.push("/inicio");
  }

  function logout() {
    limparEstadoAuth();
    router.push("/login");
  }

  const estaAutenticado = !!token && !tokenEstaExpirado(token);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        estaAutenticado,
        carregandoAuth,
        temPermissaoEfetiva,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
