// FIX: Use type assertion to access Vite env variables without global type declarations.
// A URL base da sua API backend, agora vinda de uma variável de ambiente
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "/api";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Função utilitária para fazer requisições à API.
 * Lida com a adição de headers, conversão do corpo para JSON e anexa o token de autenticação.
 */
export const api = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = "GET", body } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = localStorage.getItem("authToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Ocorreu um erro na requisição.");
    }

    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return Promise.resolve({} as T);
    }

    return response.json();
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};
