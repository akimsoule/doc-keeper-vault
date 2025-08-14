import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Document } from "@/types";
import { FileText, Image, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/lib/errorHandler";
import { serviceGetDocumentUrl } from "@/services/documentService";
import mammoth from "mammoth";

interface DocumentFullPreviewProps {
  document: Document;
  onPreviewLoad?: (url: string | null) => void;
  onDocxContent?: (content: string | null) => void;
}

export const DocumentFullPreview: React.FC<DocumentFullPreviewProps> = ({
  document,
  onPreviewLoad,
  onDocxContent,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [docxContent, setDocxContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedDocumentId, setLoadedDocumentId] = useState<string | null>(null);
  const { toast } = useToast();
  const { showError } = useErrorHandler();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Mémoriser l'ID du document pour éviter les re-renders inutiles
  const documentId = useMemo(() => document?.id, [document?.id]);
  const documentName = useMemo(() => document?.name, [document?.name]);
  const documentType = useMemo(() => document?.type, [document?.type]);

  const loadDocumentUrl = useCallback(async () => {
    if (!document || !isMountedRef.current || !documentId) return;

    // Éviter de recharger le même document
    if (loadedDocumentId === documentId && previewUrl) {
      console.log("Document déjà chargé, pas de rechargement nécessaire");
      return;
    }

    try {
      setIsLoading(true);
      
      const fileExtension = documentName?.split(".").pop()?.toLowerCase();
      const isImageFile = ["jpg", "jpeg", "png", "gif", "webp", "ico"].includes(
        fileExtension || ""
      );
      const isPreviewable =
        fileExtension === "docx" ||
        fileExtension === "pdf" ||
        isImageFile ||
        ["image", "pdf", "document"].includes(documentType || "");
      const format = isPreviewable ? "base64" : "url";

      console.log("DocumentFullPreview Debug:", {
        fileName: documentName,
        fileExtension,
        documentType: documentType,
        isImageFile,
        isPreviewable,
        format,
        documentId,
        loadedDocumentId,
      });

      // Utiliser le service avec cache au lieu de fetch direct
      const data = await serviceGetDocumentUrl(documentId, format);
      const url = data.url;

      if (!isMountedRef.current) return;

      setPreviewUrl(url);
      setLoadedDocumentId(documentId);
      onPreviewLoad?.(url);

      // Si c'est un fichier DOCX, on le convertit en HTML
      if (fileExtension === "docx" && url) {
        try {
          const base64Content = url.split(";base64,")[1];
          const arrayBuffer = Uint8Array.from(atob(base64Content), (c) =>
            c.charCodeAt(0)
          ).buffer;

          const result = await mammoth.convertToHtml({ arrayBuffer });

          if (!isMountedRef.current) return;

          setDocxContent(result.value);
          onDocxContent?.(result.value);
        } catch (error) {
          console.error("Erreur lors de la conversion du fichier DOCX:", error);
          if (isMountedRef.current) {
            showError(error, "Impossible de convertir le fichier DOCX");
          }
        }
      }
    } catch (error) {
      console.error("Erreur chargement document:", error);
      if (isMountedRef.current) {
        showError(error, "Impossible de charger l'aperçu du document");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, documentName, documentType, loadedDocumentId, previewUrl]);

  useEffect(() => {
    console.log("useEffect triggered:", { documentId, loadedDocumentId });

    // Réinitialiser l'état si le document change
    if (documentId && documentId !== loadedDocumentId) {
      console.log("Nouveau document détecté, réinitialisation...");
      setPreviewUrl(null);
      setDocxContent(null);
      setLoadedDocumentId(null);
    }

    if (documentId && documentId !== loadedDocumentId) {
      console.log("Chargement du document...");
      loadDocumentUrl();
    }
  }, [documentId, loadedDocumentId, loadDocumentUrl]);
  const renderPreview = () => {
    const fileExtension = document.name.split(".").pop()?.toLowerCase();

    console.log("renderFullPreview Debug:", {
      fileName: document.name,
      fileExtension,
      previewUrl: previewUrl ? "URL disponible" : "Pas d'URL",
      isLoading,
    });

    switch (fileExtension) {
      case "docx":
        return previewUrl ? (
          <div className="w-full h-full flex justify-center items-start">
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-full min-h-[200px] sm:min-h-[500px]">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-gray-900" />
              </div>
            ) : docxContent ? (
              <div
                className="w-full h-full min-h-[50vh] sm:min-h-[70vh] overflow-y-auto p-3 sm:p-8 bg-white rounded-lg shadow-sm border max-w-4xl"
                dangerouslySetInnerHTML={{ __html: docxContent }}
                style={{
                  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                  lineHeight: "1.6",
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] sm:min-h-[500px] bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Erreur lors de la conversion du document
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] sm:min-h-[500px] bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
            <p className="text-gray-600">Chargement du document...</p>
          </div>
        );

      case "pdf":
        return previewUrl ? (
          <div className="w-full h-full flex justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-full min-h-[200px] sm:min-h-[500px]">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-gray-900" />
              </div>
            ) : (
              <embed
                src={previewUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                className="rounded-lg min-h-[70vh]"
                style={{ minHeight: "70vh" }}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] sm:min-h-[500px] bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
            <p className="text-gray-600">Chargement du PDF...</p>
          </div>
        );

      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
      case "ico":
        console.log(
          "Image case triggered for:",
          fileExtension,
          "previewUrl:",
          previewUrl
        );
        return previewUrl ? (
          <div className="w-full h-full flex justify-center items-center bg-gray-50 rounded-lg p-2">
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-full min-h-[200px] sm:min-h-[500px]">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-gray-900" />
              </div>
            ) : (
              <img
                src={previewUrl}
                alt={document.name}
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{
                  maxHeight: window.innerWidth < 1024 ? "50vh" : "80vh",
                  maxWidth: "100%",
                }}
                onError={() => {
                  toast({
                    title: "Erreur",
                    description: "Impossible de charger l'aperçu de l'image",
                    variant: "destructive",
                  });
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] sm:min-h-[500px] bg-gray-50 rounded-lg">
            <Image className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
            <p className="text-gray-600">Aperçu image non disponible</p>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] sm:min-h-[500px] bg-gray-50 rounded-lg">
            <File className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mt-4">Aperçu non disponible</p>
            <p className="text-xs sm:text-sm text-gray-500 text-center mt-2 max-w-md px-4">
              Ce type de fichier ne peut pas être prévisualisé dans le
              navigateur. Téléchargez le fichier pour le consulter.
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-gray-900 mb-4" />
        <p className="text-gray-600 text-sm sm:text-base">
          Chargement de l'aperçu...
        </p>
      </div>
    );
  }

  return renderPreview();
};
