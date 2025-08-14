import { useDocuments } from '@/contexts/UseContext';
import { FileX } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { DocumentPagination } from './DocumentPagination';
import { DocumentCardSkeleton } from './DocumentCardSkeleton';

export const DocumentGrid = () => {
  const { filteredDocuments = [], isLoading = false, isCreatingDocument = false } = useDocuments() || {};

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <DocumentCardSkeleton
              key={i}
              status="uploading"
              progress={Math.random() * 60 + 20} // Progress aléatoire entre 20 et 80
              documentName="Chargement..."
            />
          ))}
        </div>
      </div>
    );
  }

  if (filteredDocuments.length === 0 && !isCreatingDocument) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
        <FileX className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
          Aucun document trouvé
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          Ajoutez des documents ou modifiez vos filtres de recherche
        </p>
      </div>
    );
  }

  // Séparer les documents temporaires des documents réels
  const temporaryDocuments = filteredDocuments.filter((doc) => doc.isTemporary);
  const realDocuments = filteredDocuments.filter((doc) => !doc.isTemporary);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Afficher d'abord les documents temporaires avec skeleton */}
        {temporaryDocuments.map((document) => (
          <DocumentCardSkeleton
            key={document.id}
            status="processing"
            progress={75}
            documentName={document.name}
          />
        ))}
        
        {/* Puis afficher les documents réels */}
        {realDocuments.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>
      <DocumentPagination />
    </div>
  );
};