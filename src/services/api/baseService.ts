/**
 * Service de base pour tous les services API
 * Contient la logique commune d'authentification et de gestion des erreurs
 */
export class BaseApiService {
  protected baseUrl = "/api";
  protected token: string | null = null;

  // Configuration des headers avec authentification
  protected getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Configuration des headers pour multipart/form-data
  protected getFormHeaders(): HeadersInit {
    const headers: HeadersInit = {};

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Gestion des erreurs API
  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erreur réseau" }));
      throw new Error(error.error || `Erreur HTTP ${response.status}`);
    }
    return response.json();
  }

  // Définir le token d'authentification
  setToken(token: string) {
    this.token = token;
  }

  // Supprimer le token d'authentification
  clearToken() {
    this.token = null;
  }
}
