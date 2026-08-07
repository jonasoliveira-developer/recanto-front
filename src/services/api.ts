import axios from "axios";
import { emitirSessaoExpirada, tokenEstaExpirado } from "@/lib/token";

const api = axios.create({
  baseURL: "https://recanto-backend-production.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        if (tokenEstaExpirado(token)) {
          emitirSessaoExpirada();
          return Promise.reject(new Error("Sessão expirada"));
        }
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      emitirSessaoExpirada();
      return Promise.reject(error);
    }

    if (status === 403) {
      const mensagemPadrao = "Voce nao tem permissao para executar esta acao.";
      const dadosResposta = error?.response?.data;

      if (!dadosResposta || typeof dadosResposta !== "object") {
        error.response = error.response || {};
        error.response.data = { message: mensagemPadrao };
      } else if (!dadosResposta.message) {
        dadosResposta.message = mensagemPadrao;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
