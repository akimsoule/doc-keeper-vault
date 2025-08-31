/**
 * Gestionnaire centralisé des tokens d'authentification
 * Permet de synchroniser le token entre tous les services API
 */

class TokenManager {
  private static instance: TokenManager;
  private token: string | null = null;
  private services: Array<{ setToken: (token: string) => void; clearToken: () => void }> = [];

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Enregistrer un service pour recevoir les mises à jour de token
  registerService(service: { setToken: (token: string) => void; clearToken: () => void }) {
    this.services.push(service);
    // Appliquer le token actuel si disponible
    if (this.token) {
      service.setToken(this.token);
    }
  }

  // Définir le token pour tous les services
  setToken(token: string) {
    this.token = token;
    this.services.forEach(service => service.setToken(token));
  }

  // Supprimer le token de tous les services
  clearToken() {
    this.token = null;
    this.services.forEach(service => service.clearToken());
  }

  // Obtenir le token actuel
  getToken(): string | null {
    return this.token;
  }
}

export const tokenManager = TokenManager.getInstance();
