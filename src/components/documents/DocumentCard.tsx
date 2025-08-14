import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Document } from "@/types";
import {
  Heart,
  MoreVertical,
  Download,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocuments } from "@/contexts/UseContext";
import { useToast } from "@/hooks/use-toast";
import { DocumentViewer } from "./DocumentViewer";
import { DocumentPreview } from "./DocumentPreview";

interface DocumentCardProps {
  document: Document;
}

const getCategoryColor = (category: string) => {
  const colors = {
    pdf: "destructive",
    image: "success", 
    document: "primary",
    spreadsheet: "warning",
    presentation: "secondary",
    archive: "muted",
  };
  return colors[category as keyof typeof colors] || "secondary";
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const truncateText = (text: string, maxLength: number = 30) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const { toggleFavorite, deleteDocument } = useDocuments();
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleFavoriteToggle = () => {
    toggleFavorite(document.id);
  };

  const { toast } = useToast();

  const handleView = () => {
    setIsViewerOpen(!isViewerOpen);
  };

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await deleteDocument(document.id);
        toast({
          title: "Document supprimé",
          description: `Le document "${truncateText(document.name, 50)}" a été supprimé avec succès`,
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors de la suppression du document",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
          onClick={handleView}>
      
      {/* Header avec statut et actions */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary" 
              className="text-xs"
            >
              {document.category}
            </Badge>
            {document.isFavorite && (
              <Heart className="h-4 w-4 text-red-500 fill-current" />
            )}
          </div>
          
          {/* Actions - toujours visibles sur mobile */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFavoriteToggle();
              }}
              className={`h-6 w-6 p-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ${
                document.isFavorite ? "text-red-500" : "text-muted-foreground"
              }`}
            >
              <Heart
                className={`h-3 w-3 ${
                  document.isFavorite ? "fill-current" : ""
                }`}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="h-4 w-4 mr-2" />
                  Visualiser
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Icône du document - style skeleton avec aspect-square */}
          <div className="aspect-square rounded-lg bg-muted/30 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 overflow-hidden">
            <div
              className={`w-full h-full rounded-lg bg-${getCategoryColor(
                document.category
              )}/10 text-${getCategoryColor(document.category)} flex items-center justify-center`}
            >
              <DocumentPreview document={document} size="small" showPreview={true} />
            </div>
          </div>
          
          {/* Informations du document */}
          <div className="space-y-2">
            <h3
              className="text-sm font-medium truncate"
              title={document.name}
            >
              {truncateText(document.name, 30)}
            </h3>
            
            {/* Métadonnées */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(document.size)}</span>
              {document.createdAt && (
                <span className="truncate ml-2">
                  {new Date(document.createdAt).toLocaleDateString("fr-FR", { 
                    day: '2-digit', 
                    month: '2-digit',
                    year: '2-digit'
                  })}
                </span>
              )}
            </div>
            
            {/* Description */}
            {document.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {document.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Tags en bas */}
        {document.tags.length > 0 && (
          <div className="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {document.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0"
              >
                {tag}
              </Badge>
            ))}
            {document.tags.length > 2 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0"
              >
                +{document.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <DocumentViewer
        document={document}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </Card>
  );
};
