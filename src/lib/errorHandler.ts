import { useToast } from "@/hooks/use-toast";

// Types d'erreurs standardisés
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  FILE_UPLOAD = 'FILE_UPLOAD',
  UNKNOWN = 'UNKNOWN'
}

// Interface pour les erreurs API
export interface ApiError {
  status: number;
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}

// Messages d'erreur sécurisés pour l'utilisateur
export const ERROR_MESSAGES = {
  [ErrorType.NETWORK]: {
    title: "Problème de connexion",
    description: "Vérifiez votre connexion internet et réessayez."
  },
  [ErrorType.AUTHENTICATION]: {
    title: "Authentification requise",
    description: "Vous devez vous connecter pour accéder à cette fonctionnalité."
  },
  [ErrorType.AUTHORIZATION]: {
    title: "Accès refusé",
    description: "Vous n'avez pas les permissions nécessaires pour cette action."
  },
  [ErrorType.VALIDATION]: {
    title: "Données invalides",
    description: "Veuillez vérifier les informations saisies."
  },
  [ErrorType.SERVER]: {
    title: "Erreur serveur",
    description: "Une erreur interne s'est produite. Veuillez réessayer plus tard."
  },
  [ErrorType.NOT_FOUND]: {
    title: "Ressource introuvable",
    description: "L'élément demandé n'existe pas ou a été supprimé."
  },
  [ErrorType.RATE_LIMIT]: {
    title: "Trop de tentatives",
    description: "Vous avez fait trop de tentatives. Attendez quelques minutes."
  },
  [ErrorType.FILE_UPLOAD]: {
    title: "Erreur de téléchargement",
    description: "Le fichier n'a pas pu être téléchargé. Vérifiez sa taille et son format."
  },
  [ErrorType.UNKNOWN]: {
    title: "Erreur inattendue",
    description: "Une erreur inconnue s'est produite. Veuillez réessayer."
  }
};

// Classification des erreurs basée sur le code de statut HTTP
export function classifyError(status: number, errorMessage?: string): ErrorType {
  // Erreurs réseau
  if (status === 0 || !status) {
    return ErrorType.NETWORK;
  }
  
  // Erreurs client
  switch (status) {
    case 400:
      return ErrorType.VALIDATION;
    case 401:
      return ErrorType.AUTHENTICATION;
    case 403:
      return ErrorType.AUTHORIZATION;
    case 404:
      return ErrorType.NOT_FOUND;
    case 413:
      return ErrorType.FILE_UPLOAD;
    case 429:
      return ErrorType.RATE_LIMIT;
    case 422:
      return ErrorType.VALIDATION;
  }
  
  // Erreurs serveur
  if (status >= 500) {
    return ErrorType.SERVER;
  }
  
  // Classification basée sur le message d'erreur si disponible
  if (errorMessage) {
    const message = errorMessage.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK;
    }
    if (message.includes('unauthorized') || message.includes('token')) {
      return ErrorType.AUTHENTICATION;
    }
    if (message.includes('forbidden')) {
      return ErrorType.AUTHORIZATION;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    if (message.includes('file') || message.includes('upload')) {
      return ErrorType.FILE_UPLOAD;
    }
  }
  
  return ErrorType.UNKNOWN;
}

// Fonction principale de gestion des erreurs
export function handleApiError(error: unknown, customMessage?: string): {
  type: ErrorType;
  title: string;
  description: string;
  shouldLogout?: boolean;
} {
  let status: number = 0;
  let errorMessage: string = '';
  
  // Extraction des informations d'erreur avec type guards
  if (error && typeof error === 'object') {
    // Erreur de réponse HTTP (axios/fetch)
    if ('response' in error && error.response && typeof error.response === 'object') {
      const response = error.response as { status?: number; data?: { error?: string; message?: string } };
      status = response.status || 0;
      errorMessage = response.data?.error || response.data?.message || '';
    } 
    // Erreur API personnalisée
    else if ('status' in error && typeof error.status === 'number') {
      const apiError = error as { status: number; error?: string; message?: string };
      status = apiError.status;
      errorMessage = apiError.error || apiError.message || '';
    }
    // Erreur JavaScript standard
    else if ('message' in error && typeof error.message === 'string') {
      const jsError = error as Error;
      errorMessage = jsError.message;
      if (jsError.message.includes('NetworkError') || jsError.message.includes('Failed to fetch')) {
        status = 0; // Erreur réseau
      }
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  const errorType = classifyError(status, errorMessage);
  const errorConfig = ERROR_MESSAGES[errorType];
  
  // Messages personnalisés pour certains cas
  let finalDescription = customMessage || errorConfig.description;
  
  // Messages spécifiques basés sur le contenu de l'erreur (tout en restant sécurisé)
  if (errorType === ErrorType.VALIDATION && errorMessage) {
    if (errorMessage.toLowerCase().includes('email')) {
      finalDescription = "L'adresse email n'est pas valide.";
    } else if (errorMessage.toLowerCase().includes('password')) {
      finalDescription = "Le mot de passe ne respecte pas les critères requis.";
    } else if (errorMessage.toLowerCase().includes('file')) {
      finalDescription = "Le fichier n'est pas valide ou est trop volumineux.";
    }
  }
  
  // Déterminer si l'utilisateur doit être déconnecté
  const shouldLogout = errorType === ErrorType.AUTHENTICATION && status === 401;
  
  return {
    type: errorType,
    title: errorConfig.title,
    description: finalDescription,
    shouldLogout
  };
}

// Hook personnalisé pour la gestion centralisée des erreurs
export function useErrorHandler() {
  const { toast } = useToast();
  
  const showError = (error: unknown, customMessage?: string) => {
    const errorInfo = handleApiError(error, customMessage);
    
    toast({
      title: errorInfo.title,
      description: errorInfo.description,
      variant: "destructive",
    });
    
    // Déconnexion automatique si nécessaire
    if (errorInfo.shouldLogout) {
      // Nettoyer le token et rediriger vers la page de connexion
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    
    return errorInfo;
  };
  
  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
    });
  };
  
  return { showError, showSuccess };
}

// Fonction utilitaire pour les actions async avec gestion d'erreur
export async function withErrorHandling<T>(
  action: () => Promise<T>,
  errorHandler: (error: unknown) => void,
  customErrorMessage?: string
): Promise<T | null> {
  try {
    return await action();
  } catch (error) {
    console.error('Action failed:', error);
    errorHandler(error);
    return null;
  }
}
