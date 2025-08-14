import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Document } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ExternalLink,
  FileText,
  Image,
  File,
  Loader2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentFullPreview } from "./DocumentFullPreview";
import { useErrorHandler } from "@/lib/errorHandler";

import { useEffect } from "react";

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getFileIcon = (type: string) => {
  const icons = {
    pdf: FileText,
    image: Image,
    document: File,
  };
  const Icon = icons[type as keyof typeof icons] || File;
  return <Icon className="w-6 h-6" />;
};

const truncateText = (text: string, maxLength: number = 40) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  console.log("isOpen:", isOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { showError, showSuccess } = useErrorHandler();

  // Gérer la fermeture avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handlePreviewLoad = useCallback((url: string | null) => {
    setPreviewUrl(url);
  }, []);

  const handleDownload = async () => {
    try {
      setIsLoading(true);

      if (previewUrl) {
        // Si c'est une URL MEGA, on la télécharge directement
        if (!previewUrl.startsWith("data:")) {
          window.open(previewUrl, "_blank");
          return;
        }

        // Sinon, on convertit le base64 en Blob
        const base64Response = await fetch(previewUrl);
        const blob = await base64Response.blob();

        // Créer une URL temporaire pour le téléchargement
        const blobUrl = window.URL.createObjectURL(blob);
        const link = window.document.createElement("a");
        link.href = blobUrl;
        link.download = document!.name;
        link.click();

        // Nettoyer l'URL temporaire
        window.URL.revokeObjectURL(blobUrl);

        showSuccess("Téléchargement démarré", `Le téléchargement de "${truncateText(
          document!.name,
          50
        )}" a commencé`);
      } else {
        showError("Aucune donnée disponible pour le téléchargement", "Erreur de téléchargement");
      }
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      showError(error, "Impossible de télécharger le document");
    } finally {
      setIsLoading(false);
    }
  };

  if (!document || !isOpen) return null;

  return createPortal(
    <div>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div 
          className="bg-white rounded-lg w-full h-full max-w-[98vw] max-h-[98vh] sm:max-w-[95vw] sm:max-h-[95vh] overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-3 py-3 sm:px-6 sm:py-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {getFileIcon(document.type)}
                <h2 className="text-sm sm:text-lg font-semibold truncate" title={document.name}>
                  {truncateText(document.name, window.innerWidth < 640 ? 30 : 80)}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-1 overflow-hidden flex-col lg:flex-row h-full">
              {/* Zone d'aperçu principale - prend la majorité de l'espace */}
              <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden min-h-0">
                <div className="flex-1 p-3 sm:p-6 overflow-auto">
                  <DocumentFullPreview 
                    document={document} 
                    onPreviewLoad={handlePreviewLoad}
                  />
                </div>
              </div>

              {/* Panneau latéral avec les informations, scrollable */}
              <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l h-auto lg:h-full overflow-y-auto max-h-[40vh] lg:max-h-none">
                <div className="p-3 sm:p-4 space-y-3">
                  {/* Informations du document */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                      Informations
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-medium text-gray-700">Taille</p>
                        <p className="text-gray-600">{formatFileSize(document.size)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Type</p>
                        <p className="text-gray-600">{document.type}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Créé le</p>
                        <p className="text-gray-600">
                          {document.createdAt
                            ? new Date(document.createdAt).toLocaleDateString("fr-FR")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Catégorie</p>
                        <p className="text-gray-600">{document.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {document.description && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                        Description
                      </h3>
                      <p className="text-xs text-gray-600 p-2 bg-gray-50 rounded leading-relaxed">
                        {document.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {document.tags && document.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {document.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-2 py-0.5 h-auto"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2 pt-3 border-t">
                    <Button
                      onClick={handleDownload}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Télécharger
                    </Button>

                    {document.url && !document.url.startsWith("data:image") && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          const tab = window.open();
                          if (tab) {
                            tab.document.write(`
                <html>
                  <head>
                  <title>${document.name}</title>
                  </head>
                  <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">
                  ${
                    document.url.startsWith("data:application/pdf")
                      ? `<embed src="${document.url}" type="application/pdf" width="100%" height="100%" />`
                      : `<img src="${document.url}" style="max-width:100%;max-height:100vh;object-fit:contain;" />`
                  }
                  </body>
                </html>
                `);
                            tab.document.close();
                          }
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ouvrir dans un nouvel onglet
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    window.document.body
  );
};
