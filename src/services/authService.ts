import { User } from '@/types';

const API_ROOT = '/api';

export interface AuthResponse {
  token: string;
  user: User;
}

// Fonction utilitaire pour gérer les réponses API
async function handleAuthResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'Erreur inconnue';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || 'Erreur inconnue';
    } catch {
      // Si on ne peut pas parser le JSON, utiliser le status text
      errorMessage = response.statusText || 'Erreur inconnue';
    }
    
    const error = {
      status: response.status,
      error: errorMessage,
      message: errorMessage
    };
    throw error;
  }
  
  return response.json();
}

export async function signup(email: string, password: string, name: string): Promise<AuthResponse> {
  const response = await fetch(`${API_ROOT}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  
  return handleAuthResponse<AuthResponse>(response);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_ROOT}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  return handleAuthResponse<AuthResponse>(response);
}

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token');
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}
