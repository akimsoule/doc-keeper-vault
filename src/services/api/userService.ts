import { BaseApiService } from './baseService';
import { cacheService } from '../cacheService';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  viewMode: "grid" | "list";
  itemsPerPage: number;
  notifications: boolean;
}

/**
 * Service de gestion des utilisateurs
 * Profil, préférences, gestion du compte
 */
export class UserService extends BaseApiService {

  async getProfile() {
    // Créer une clé de cache
    const cacheKey = 'getProfile';
    
    // Vérifier le cache
    const cached = cacheService.get<User>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.baseUrl}/users/profile`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<User>(response);
    
    // Mettre en cache le résultat
    cacheService.set(cacheKey, result, cacheService.TTL.profile);
    
    return result;
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    password?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/users/profile`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<User>(response);
    
    // Invalider le cache du profil
    cacheService.invalidate('getProfile');
    
    return result;
  }

  async getPreferences() {
    const response = await fetch(`${this.baseUrl}/users/preferences`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<UserPreferences>(response);
  }

  async updatePreferences(preferences: UserPreferences) {
    const response = await fetch(`${this.baseUrl}/users/preferences`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(preferences),
    });

    return this.handleResponse<UserPreferences>(response);
  }

  async deleteAccount() {
    const response = await fetch(`${this.baseUrl}/users/account`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }
}
