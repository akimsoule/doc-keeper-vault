import { BaseApiService } from './baseService';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

/**
 * Service d'authentification
 * Gère la connexion, l'inscription et la vérification des tokens
 */
export class AuthService extends BaseApiService {
  
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const result = await this.handleResponse<LoginResponse>(response);

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async register(email: string, name: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, name, password }),
    });

    const result = await this.handleResponse<LoginResponse>(response);

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async refreshToken() {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<LoginResponse>(response);

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async verifyToken() {
    const response = await fetch(`${this.baseUrl}/auth/verify`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    return this.handleResponse<{
      valid: boolean;
      user: User;
    }>(response);
  }
}
