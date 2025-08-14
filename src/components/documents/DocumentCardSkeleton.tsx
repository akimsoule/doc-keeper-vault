import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

interface DocumentCardSkeletonProps {
  status?: 'uploading' | 'processing' | 'success' | 'error';
  progress?: number;
  documentName?: string;
  variant?: 'card' | 'row';
}

export const DocumentCardSkeleton: React.FC<DocumentCardSkeletonProps> = ({ 
  status = 'uploading', 
  progress = 0,
  documentName = 'Nouveau document',
  variant = 'card'
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: Upload,
          text: 'Upload en cours...',
          color: 'bg-blue-500',
          badge: 'Envoi'
        };
      case 'processing':
        return {
          icon: Upload,
          text: 'Traitement...',
          color: 'bg-yellow-500',
          badge: 'Traitement'
        };
      case 'success':
        return {
          icon: CheckCircle,
          text: 'Ajouté avec succès',
          color: 'bg-green-500',
          badge: 'Terminé'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Erreur lors de l\'ajout',
          color: 'bg-red-500',
          badge: 'Erreur'
        };
      default:
        return {
          icon: Upload,
          text: 'Chargement...',
          color: 'bg-gray-500',
          badge: 'Chargement'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Variante 'row' pour affichage liste (table-like)
  if (variant === 'row') {
    return (
      <div className="group flex flex-col sm:grid sm:grid-cols-[40px_1fr_80px_160px_120px] items-center gap-4 px-3 py-3 bg-card rounded-md">
        <div className="flex items-center w-full sm:justify-start">
          <div className="w-4 h-4 rounded bg-muted/30 animate-pulse" />
        </div>

        <div className="flex items-center w-full space-x-3">
          <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-muted/30 flex items-center justify-center animate-pulse">
            <Icon className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-muted/30 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-3 bg-muted/20 rounded w-1/2 text-xs animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-center w-full text-center">
          <div className="w-4 h-4 rounded bg-muted/20 animate-pulse" />
        </div>

        <div className="w-full text-left text-sm text-muted-foreground">
          <div className="h-4 bg-muted/20 rounded w-32 animate-pulse" />
        </div>

        <div className="w-full text-right text-sm text-muted-foreground flex items-center justify-end space-x-3">
          <div className="hidden sm:block text-xs text-muted-foreground mr-2">
            <div className="h-3 bg-muted/20 rounded w-20 animate-pulse" />
          </div>
          <div className="h-4 bg-muted/20 rounded w-12 animate-pulse" />
          <div className="ml-2 w-4 h-4 rounded bg-muted/20 animate-pulse" />
        </div>
      </div>
    );
  }

  // Variante 'card' par défaut
  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/25">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Icon 
                className={`w-4 h-4 ${
                  status === 'uploading' || status === 'processing' 
                    ? 'animate-pulse' 
                    : ''
                }`} 
              />
              {(status === 'uploading' || status === 'processing') && (
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              )}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {config.text}
            </span>
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs"
          >
            {config.badge}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Simulation de l'image/icône du document */}
          <div className="aspect-square rounded-lg bg-muted animate-pulse flex items-center justify-center">
            <Icon className="w-8 h-8 text-muted-foreground/50" />
          </div>
          
          {/* Nom du document */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground truncate">
              {documentName}
            </h3>
            
            {/* Barre de progression */}
            {(status === 'uploading' || status === 'processing') && (
              <div className="space-y-1">
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${config.color}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {progress}%
                </p>
              </div>
            )}
            
            {/* Métadonnées simulées */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="bg-muted rounded px-1 animate-pulse">•••</span>
              <span className="bg-muted rounded px-1 animate-pulse">•••</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Overlay pour indiquer l'état temporaire */}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] pointer-events-none" />
    </Card>
  );
};
