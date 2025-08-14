import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "@/types";
import {
  login as loginService,
  signup as signupService,
  setAuthToken,
  clearAuthToken,
} from "@/services/authService";
import { useErrorHandler } from "@/lib/errorHandler";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError, showSuccess } = useErrorHandler();

  useEffect(() => {
    // Vérifier si un token existe au démarrage
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { token, user: loggedUser } = await loginService(email, password);
      
      try {
        setAuthToken(token);
        localStorage.setItem("user_data", JSON.stringify(loggedUser));
        setUser(loggedUser);
        showSuccess("Connexion réussie", `Bienvenue ${loggedUser.name} !`);
        return true;
      } catch (storageError) {
        console.error("Erreur lors de la sauvegarde des données:", storageError);
        // En cas d'erreur de stockage, on nettoie tout
        clearAuthToken();
        localStorage.removeItem("user_data");
        showError(storageError, "Erreur lors de la sauvegarde de la session");
        throw storageError;
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      showError(error, "Échec de la connexion");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem("user_data");
    setUser(null);
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { token, user: newUser } = await signupService(email, password, name);
      setAuthToken(token);
      localStorage.setItem("user_data", JSON.stringify(newUser));
      setUser(newUser);
      showSuccess("Inscription réussie", `Bienvenue ${newUser.name} !`);
      return true;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      showError(error, "Échec de l'inscription");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
