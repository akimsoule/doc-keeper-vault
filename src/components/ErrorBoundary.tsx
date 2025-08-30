import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
          <div className="card w-full max-w-lg bg-base-100 shadow-xl border border-error/20">
            <div className="card-body text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-error" />
                </div>
              </div>
              
              <h2 className="card-title justify-center text-error mb-2">
                Oups ! Une erreur s'est produite
              </h2>
              
              <p className="text-base-content/70 mb-6">
                Nous sommes désolés, quelque chose s'est mal passé. 
                L'équipe technique a été notifiée de ce problème.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="alert alert-error text-left mb-6">
                  <div className="flex-col">
                    <div className="font-mono text-sm break-all">
                      <strong>Erreur :</strong> {this.state.error.message}
                    </div>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer">Stack trace</summary>
                        <pre className="mt-2 text-xs overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              <div className="card-actions justify-center flex-col sm:flex-row gap-3">
                <button 
                  onClick={this.handleReset} 
                  className="btn btn-primary btn-outline"
                  aria-label="Réessayer"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </button>
                <button 
                  onClick={this.handleRefresh} 
                  className="btn btn-secondary btn-outline"
                  aria-label="Actualiser la page"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualiser
                </button>
                <button 
                  onClick={this.handleGoHome} 
                  className="btn btn-outline"
                  aria-label="Retourner au tableau de bord"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </button>
              </div>

              <div className="mt-6 text-xs text-base-content/50">
                Si le problème persiste, contactez le support technique
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Composant d'erreur simple pour les cas moins critiques
export const ErrorMessage: React.FC<{
  error: string | Error;
  onRetry?: () => void;
  className?: string;
}> = ({ error, onRetry, className = '' }) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`alert alert-error ${className}`}>
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Erreur</h3>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="btn btn-sm btn-ghost btn-square"
            aria-label="Réessayer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
