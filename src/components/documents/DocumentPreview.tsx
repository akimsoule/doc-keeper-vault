import React, { useState, useEffect } from "react";
import { Document } from "@/types";
import { FileText, Image, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { serviceGetDocumentUrl } from "@/services/documentService";

interface DocumentPreviewProps {
  document: Document;
  size?: "small" | "large";
  showPreview?: boolean;
}

const getFileIcon = (type: string, size: string = "small") => {
  const icons = {
    pdf: FileText,
    image: Image,
    document: File,
  };
  const Icon = icons[type as keyof typeof icons] || File;
  const iconSize = size === "small" ? "w-8 h-8" : "w-12 h-12";
  return <Icon className={iconSize} />;
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  size = "small",
  showPreview = true,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!showPreview) return;

    const loadPreview = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const fileExtension = document.name.split(".").pop()?.toLowerCase();
        const isImageFile = ["jpg", "jpeg", "png", "gif", "webp", "ico"].includes(fileExtension || "");
        
        // Seulement charger la preview pour les images
        if (!isImageFile) {
          setIsLoading(false);
          return;
        }

        // Utiliser le service avec cache au lieu de fetch direct
        const data = await serviceGetDocumentUrl(document.id, "base64");
        setPreviewUrl(data.url);
      } catch (error) {
        console.error("Erreur preview:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [document.id, document.name, showPreview]);

  const fileExtension = document.name.split(".").pop()?.toLowerCase();
  const isImageFile = ["jpg", "jpeg", "png", "gif", "webp", "ico"].includes(fileExtension || "");

  // Si c'est une image et qu'on a la preview
  if (isImageFile && previewUrl && !hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
        <img
          src={previewUrl}
          alt={document.name}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Loading state pour les images
  if (isImageFile && isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
      </div>
    );
  }

  // Fallback vers l'icône
  return (
    <div className="w-full h-full flex items-center justify-center">
      {getFileIcon(document.type, size)}
    </div>
  );
};
