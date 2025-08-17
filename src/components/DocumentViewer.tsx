import React, { useState, useEffect } from 'react';
import { X, Download, Edit, Trash2, Heart, Tag, Calendar, HardDrive } from 'lucide-react';
import type { Document } from '../types';
import { fileUtils, documentService, handleApiError } from '../services/api';
import toast from 'react-hot-toast';

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  onToggleFavorite: (document: Document) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (document && isOpen) {
      loadDownloadUrl();
    }
    return () => {
      if (downloadUrl && downloadUrl.startsWith('blob:')) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [document?.id, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDownloadUrl = async () => {
    if (!document) return;

    setIsLoading(true);
    try {
      const { url } = await documentService.getDocumentUrl(document.id);
      setDownloadUrl(url);
    } catch (error) {
      toast.error('Erreur lors du chargement du document: ' + handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document || !downloadUrl) return;

    try {
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      toast.success('Téléchargement démarré');
    } catch (error) {
      toast.error('Erreur lors du téléchargement: ' + handleApiError(error));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canPreview = (doc: Document) => {
    return fileUtils.isImageFile(doc.type) || fileUtils.isPdfFile(doc.type);
  };

  if (!isOpen || !document) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl h-5/6 max-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {fileUtils.getFileIcon(document.type)}
            </div>
            <div>
              <h3 className="text-lg font-bold line-clamp-1">{document.name}</h3>
              <p className="text-sm text-base-content/60">
                {fileUtils.formatFileSize(document.size)} • {document.type.toUpperCase()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className={`btn btn-ghost btn-sm ${document.isFavorite ? 'text-red-500' : 'text-base-content/40'}`}
              onClick={() => onToggleFavorite(document)}
            >
              <Heart className={`w-4 h-4 ${document.isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                •••
              </div>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <button onClick={() => onEdit(document)}>
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                </li>
                <li>
                  <button onClick={handleDownload} disabled={!downloadUrl}>
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                </li>
                <li>
                  <button onClick={() => onDelete(document)} className="text-error">
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </li>
              </ul>
            </div>
            
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="card bg-base-200 h-full">
              <div className="card-body p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : downloadUrl && canPreview(document) ? (
                  <div className="document-preview h-full flex items-center justify-center">
                    {fileUtils.isImageFile(document.type) ? (
                      <img
                        src={downloadUrl}
                        alt={document.name}
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    ) : fileUtils.isPdfFile(document.type) ? (
                      <iframe
                        src={downloadUrl}
                        className="w-full h-full border-0 rounded"
                        title={document.name}
                      />
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-base-content/60">
                    <div className="text-6xl mb-4">
                      {fileUtils.getFileIcon(document.type)}
                    </div>
                    <p className="text-lg font-medium mb-2">Aperçu non disponible</p>
                    <p className="text-sm">
                      {canPreview(document) 
                        ? 'Chargement en cours...' 
                        : 'Ce type de fichier ne peut pas être prévisualisé'}
                    </p>
                    {downloadUrl && (
                      <button
                        className="btn btn-primary btn-sm mt-4"
                        onClick={handleDownload}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger pour voir
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            {/* Description */}
            {document.description && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                    {document.description}
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            {document.tags.length > 0 && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {document.tags.map((tag) => (
                      <span key={tag} className="badge badge-primary badge-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <h4 className="font-medium mb-3">Détails</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-base-content/60" />
                    <span className="text-base-content/60">Taille:</span>
                    <span>{fileUtils.formatFileSize(document.size)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-base-content/60" />
                    <span className="text-base-content/60">Catégorie:</span>
                    <span className="badge badge-outline badge-sm">
                      {document.category || 'Non définie'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-base-content/60" />
                    <span className="text-base-content/60">Créé le:</span>
                    <span>{formatDate(document.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-base-content/60" />
                    <span className="text-base-content/60">Modifié le:</span>
                    <span>{formatDate(document.modifiedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <h4 className="font-medium mb-3">Actions</h4>
                <div className="space-y-2">
                  <button
                    className="btn btn-outline btn-sm w-full"
                    onClick={() => onEdit(document)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </button>
                  
                  <button
                    className="btn btn-outline btn-sm w-full"
                    onClick={handleDownload}
                    disabled={!downloadUrl}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </button>
                  
                  <button
                    className="btn btn-error btn-outline btn-sm w-full"
                    onClick={() => onDelete(document)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>
  );
};

export default DocumentViewer;
