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
  if (Array.isArray(usuario.roles)) {
    return usuario.roles.map(String).includes(roleStr);
  }
  // roles pode ser string separada por vírgula
  return String(usuario.roles).split(",").includes(roleStr);
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
  podeGerenciarPermissoesLocais: boolean;
  modoSuperacessoLocalAtivo: boolean;
  alternarSuperacessoLocal: () => void;
  temPermissaoEfetiva: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, definirUsuario] = useState<Usuario | null>(null);
  const [token, definirToken] = useState<string | null>(null);
  const [modoSuperacessoLocalAtivo, definirModoSuperacessoLocalAtivo] = useState(false);
  const router = useRouter();

  const CHAVE_TOGGLE_LOCAL = "auth_toggle_superlocal";

  function ambienteLocalElegivelToggle() {
    if (typeof window === "undefined") return false;

    const hostname = window.location.hostname;
    const ehLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    if (!ehLocalhost) return false;

    const flagPublica = process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH_TOGGLE;
    if (flagPublica === "false") return false;

    return true;
  }

  function lerEstadoToggleLocal() {
    if (!ambienteLocalElegivelToggle()) return false;
    return localStorage.getItem(CHAVE_TOGGLE_LOCAL) === "1";
  }

  function salvarEstadoToggleLocal(ativo: boolean) {
    if (typeof window === "undefined") return;
    if (!ambienteLocalElegivelToggle()) {
      localStorage.removeItem(CHAVE_TOGGLE_LOCAL);
      return;
    }
    localStorage.setItem(CHAVE_TOGGLE_LOCAL, ativo ? "1" : "0");
  }

  function alternarSuperacessoLocal() {
    if (!ambienteLocalElegivelToggle()) {
      definirModoSuperacessoLocalAtivo(false);
      return;
    }
    const proximo = !modoSuperacessoLocalAtivo;
    definirModoSuperacessoLocalAtivo(proximo);
    salvarEstadoToggleLocal(proximo);
  }

  function temPermissaoEfetiva(role: UserRole) {
    if (modoSuperacessoLocalAtivo) return true;
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

    if (ambienteLocalElegivelToggle()) {
      definirModoSuperacessoLocalAtivo(lerEstadoToggleLocal());
    } else {
      definirModoSuperacessoLocalAtivo(false);
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
    localStorage.removeItem(CHAVE_TOGGLE_LOCAL);
    definirToken(null);
    definirUsuario(null);
    definirModoSuperacessoLocalAtivo(false);
    router.push("/login");
  }

  const estaAutenticado = !!token;
  const podeGerenciarPermissoesLocais = ambienteLocalElegivelToggle();

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        estaAutenticado,
        podeGerenciarPermissoesLocais,
        modoSuperacessoLocalAtivo,
        alternarSuperacessoLocal,
        temPermissaoEfetiva
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
