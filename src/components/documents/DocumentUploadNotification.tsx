import { useDocuments } from '@/contexts/UseContext';
import { CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const DocumentUploadNotification = () => {
  const { isCreatingDocument } = useDocuments();

  if (!isCreatingDocument) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="p-4 shadow-lg border-l-4 border-l-primary">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Upload className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                Ajout du document
              </h4>
              <Badge variant="secondary" className="text-xs">
                En cours
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Votre document est en cours d'ajout à la collection...
            </p>
            <div className="space-y-1">
              <Progress value={75} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                Traitement en cours...
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
