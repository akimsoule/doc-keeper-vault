import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/api';
import { tokenManager } from '../services/tokenManager';

const authService = new AuthService();
// Enregistrer le service auprès du gestionnaire de tokens
tokenManager.registerService(authService);

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

const TOKEN_KEY = 'doc-keeper-token';

export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    tokenManager.clearToken();
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      
      // Stocker le token
      localStorage.setItem(TOKEN_KEY, response.token);
      tokenManager.setToken(response.token);
      setUser(response.user);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, name: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(email, name, password);
      
      // Stocker le token
      localStorage.setItem(TOKEN_KEY, response.token);
      tokenManager.setToken(response.token);
      setUser(response.user);
      setUser(response.user);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authService.refreshToken();
      
      // Mettre à jour le token
      localStorage.setItem(TOKEN_KEY, response.token);
      setUser(response.user);
      
      return true;
    } catch {
      // En cas d'erreur, déconnecter l'utilisateur
      logout();
      return false;
    }
  }, [logout]);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      setLoading(false);
      return false;
    }
    
    try {
      // Configurer le token dans tous les services via le gestionnaire central
      tokenManager.setToken(token);
      
      // Vérifier le token
      const response = await authService.verifyToken();
      
      if (response.valid) {
        setUser(response.user);
        return true;
      } else {
        logout();
        return false;
      }
    } catch {
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Vérifier le token au chargement
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    // Actions
    login,
    register,
    logout,
    refreshToken,
    clearError,
  };
};
