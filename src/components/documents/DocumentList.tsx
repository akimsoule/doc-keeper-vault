import React, { useState, useEffect, useRef } from 'react';
import { useDocuments } from '@/contexts/UseContext';
import { DocumentCardSkeleton } from './DocumentCardSkeleton';
import { FileX, Heart, MoreHorizontal, Eye, Download, Edit, Trash2 } from 'lucide-react';
import { DocumentPreview } from './DocumentPreview';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { serviceGetDocumentUrl } from '@/services/documentService';
import { DocumentViewer } from './DocumentViewer';
import { Document } from '@/types';

export const DocumentList = () => {
  const {
    filteredDocuments = [],
    isLoading = false,
    isCreatingDocument = false,
    toggleFavorite,
    deleteDocument,
    refreshDocuments,
  } = useDocuments() || {};

  const { toast } = useToast();
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Selection multiple
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // indeterminate state for select-all checkbox
    if (!selectAllRef.current) return;
    const total = filteredDocuments.filter(d => !d.isTemporary).length;
    selectAllRef.current.indeterminate = selectedIds.size > 0 && selectedIds.size < total;
  }, [selectedIds, filteredDocuments]);

  const handleView = (doc: Document) => {
    setViewerDocument(doc);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setViewerDocument(null);
  };

  const handleDownload = async (doc: Document) => {
    try {
      const data = await serviceGetDocumentUrl(doc.id, 'url');
      if (data?.url) {
        const success = await downloadFromUrl(data.url, doc.name);
        if (success) {
          toast({ title: 'Téléchargement démarré', description: `Téléchargement de ${doc.name}` });
        } else {
          toast({ title: 'Erreur', description: `Impossible de télécharger ${doc.name} (CORS ou URL inaccessible)`, variant: 'destructive' });
        }
      } else {
        toast({ title: 'Erreur', description: "Impossible d'obtenir l'URL du document", variant: 'destructive' });
      }
    } catch (err) {
      console.error('Erreur download:', err);
      toast({ title: 'Erreur', description: 'Échec du téléchargement', variant: 'destructive' });
    }
  };

  const handleEdit = (doc: Document) => {
    toast({ title: 'Modifier', description: 'Édition non implémentée', variant: 'default' });
  };

  const handleDelete = async (doc: Document) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await deleteDocument(doc.id);
        toast({ title: 'Document supprimé', description: `Le document ${doc.name} a été supprimé` });
        if (refreshDocuments) await refreshDocuments();
      } catch (err) {
        console.error('Erreur suppression:', err);
        toast({ title: 'Erreur', description: 'Impossible de supprimer le document', variant: 'destructive' });
      }
    }
  };

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectAll = () => {
    const ids = filteredDocuments.filter(d => !d.isTemporary).map(d => d.id);
    setSelectedIds(new Set(ids));
  };

  const deselectAll = () => setSelectedIds(new Set());

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) selectAll();
    else deselectAll();
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Supprimer ${ids.length} document(s) sélectionné(s) ?`)) return;

    try {
      // Supprimer séquentiellement pour une meilleure UX et gestion d'erreurs
      for (const id of ids) {
        await deleteDocument(id);
      }
      toast({ title: 'Suppression', description: `${ids.length} document(s) supprimé(s)` });
      clearSelection();
      if (refreshDocuments) await refreshDocuments();
    } catch (err) {
      console.error('Erreur suppression groupée:', err);
      toast({ title: 'Erreur', description: 'Échec lors de la suppression de certains documents', variant: 'destructive' });
    }
  };

  const handleDownloadSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    // Télécharger les fichiers séquentiellement (moins risqué côté navigateur et réseau)
    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      try {
        const data = await serviceGetDocumentUrl(id, 'url');
        if (data?.url) {
          const doc = filteredDocuments.find(d => d.id === id);
          const filename = doc ? doc.name : `file-${id}`;
          const ok = await downloadFromUrl(data.url, filename);
          if (ok) successCount++; else failCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error('Erreur download pour id', id, err);
        failCount++;
      }
    }

    toast({ title: 'Téléchargement', description: `${successCount} fichier(s) téléchargé(s), ${failCount} échec(s)` });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* header skeleton (visible sur sm+) */}
        <div className="hidden sm:grid grid-cols-[40px_1fr_80px_160px_120px] items-center gap-4 px-3 py-2 text-xs text-muted-foreground border-b">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-muted/40" />
          </div>
          <div className="font-medium">Nom</div>
          <div className="text-center">Favori</div>
          <div className="text-left">Date d'ajout</div>
          <div className="text-right">Taille</div>
        </div>

        {/* Skeleton rows using DocumentCardSkeleton variant='row' */}
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <DocumentCardSkeleton variant="row" status="uploading" progress={Math.floor(Math.random() * 60) + 20} />
            </div>
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

  const temporaryDocuments = filteredDocuments.filter((doc) => doc.isTemporary);
  const realDocuments = filteredDocuments.filter((doc) => !doc.isTemporary);
  const totalReal = realDocuments.length;
  const selectedCount = selectedIds.size;
  const isAllSelected = selectedCount > 0 && selectedCount === totalReal;

  return (
    <div className="space-y-4">
      {/* Group actions when selection exists */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-2 p-2 bg-surface rounded-md">
          <div className="text-sm text-muted-foreground">{selectedCount} sélectionné(s)</div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadSelected} className="btn btn-ghost">Télécharger</button>
            <button onClick={handleDeleteSelected} className="btn btn-destructive">Supprimer</button>
            <button onClick={clearSelection} className="btn btn-outline">Annuler</button>
          </div>
        </div>
      )}

      {/* En-tête des colonnes */}
      <div className="hidden sm:grid grid-cols-[40px_1fr_80px_160px_120px] items-center gap-4 px-3 py-2 text-xs text-muted-foreground border-b">
        <div className="flex items-center">
          <input
            ref={selectAllRef}
            type="checkbox"
            className="form-checkbox"
            checked={isAllSelected}
            onChange={(e) => handleToggleSelectAll(e.target.checked)}
          />
        </div>
        <div className="font-medium">Nom</div>
        <div className="text-center">Favori</div>
        <div className="text-left">Date d'ajout</div>
        <div className="text-right">Taille</div>
      </div>

      {/* Documents temporaires (skeletons) */}
      <div className="space-y-2">
        {temporaryDocuments.map((document) => (
          <div key={document.id}>
            <DocumentCardSkeleton
              variant="row"
              status="processing"
              progress={75}
              documentName={document.name}
            />
          </div>
        ))}

        {/* Lignes réelles */}
        {realDocuments.map((document) => (
          <div
            key={document.id}
            className="group flex flex-col sm:grid sm:grid-cols-[40px_1fr_80px_160px_120px] items-center gap-4 px-3 py-3 bg-card rounded-md hover:shadow-sm transition-shadow duration-150"
            style={{ animation: 'fadeInUp 300ms ease both' }}
            onClick={() => handleView(document)}
          >
            <div className="flex items-center w-full sm:justify-start">
              <input
                type="checkbox"
                className="form-checkbox mr-2"
                checked={selectedIds.has(document.id)}
                onChange={(e) => { e.stopPropagation(); toggleSelect(document.id); }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="flex items-center w-full space-x-3">
              <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-muted/30 flex items-center justify-center">
                <DocumentPreview document={document} size="small" showPreview={true} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" title={document.name}>{document.name}</div>
                {document.description && (
                  <div className="text-xs text-muted-foreground truncate">{document.description}</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center w-full text-center">
              <button
                onClick={(e) => { e.stopPropagation(); if (toggleFavorite) { toggleFavorite(document.id); } }}
                className="text-muted-foreground group-hover:text-destructive transition-colors"
                aria-label="Toggle favorite"
              >
                <Heart className={`w-4 h-4 ${document.isFavorite ? 'text-red-500' : ''}`} />
              </button>
            </div>

            <div className="w-full text-left text-sm text-muted-foreground">
              {document.createdAt ? new Date(document.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
            </div>

            <div className="w-full text-right text-sm text-muted-foreground flex items-center justify-end space-x-3">
              <div className="hidden sm:block text-xs text-muted-foreground mr-2">
                {document.type}
              </div>
              <div className="text-sm">{formatFileSize(document.size)}</div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    aria-label="Actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(document); }}>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualiser
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(document); }}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(document); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(document); }} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <DocumentViewer
        document={viewerDocument}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />
    </div>
  );
};

const formatFileSize = (bytes: number) => {
  if (!bytes && bytes !== 0) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/* Guarded animation injection (déjà ajouté ailleurs, mais on s'assure qu'elle existe) */
if (typeof document !== 'undefined' && !document.getElementById('doc-fadein-style')) {
  const style = document.createElement('style');
  style.id = 'doc-fadein-style';
  style.innerHTML = `@keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`;
  document.head.appendChild(style);
}

// Helper pour forcer le téléchargement d'une URL (data: ou distante)
async function downloadFromUrl(url: string, filename: string): Promise<boolean> {
  try {
    if (url.startsWith('data:')) {
      // data URL -> blob
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => { try { window.URL.revokeObjectURL(blobUrl); } catch (e) { console.debug('revoke failed', e); } }, 60_000);
      return true;
    }

    // Essayer de récupérer le fichier en blob (nécessite CORS côté serveur)
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error('Network response not ok');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => { try { window.URL.revokeObjectURL(blobUrl); } catch (e) { console.debug('revoke failed', e); } }, 60_000);
      return true;
    } catch (err) {
      console.debug('fetch-as-blob failed, attempting anchor fallback', err);
      // Fallback: proposer le téléchargement via ancre (peut être ignoré si cross-origin)
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return true;
      } catch (e) {
        console.debug('anchor download failed', e);
        return false;
      }
    }
  } catch (e) {
    console.error('downloadFromUrl error', e);
    return false;
  }
}
