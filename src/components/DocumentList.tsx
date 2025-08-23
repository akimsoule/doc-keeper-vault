import React, { useState } from 'react';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Heart,
  Download,
  FileText,
  Image,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Document, SearchParams } from '../types';
import { fileUtils } from '../services/api';
import { CATEGORIES, SORT_OPTIONS } from '../types';

interface DocumentListProps {
  documents: Document[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchParams: SearchParams;
  onSearchChange: (params: SearchParams) => void;
  onView: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  onToggleFavorite: (document: Document) => void;
  onDownload: (document: Document) => void;
  onSyncMegaFiles?: () => void; // Nouvelle propriété pour synchroniser les fichiers MEGA
  isLoading: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  totalCount,
  currentPage,
  totalPages,
  searchParams,
  onSearchChange,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  onDownload,
  onSyncMegaFiles,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (search: string) => {
    onSearchChange({ ...searchParams, search, page: 1 });
  };

  const handleSortChange = (sortBy: string) => {
    const sortOrder = searchParams.sortBy === sortBy && searchParams.sortOrder === 'desc' ? 'asc' : 'desc';
    onSearchChange({ ...searchParams, sortBy, sortOrder, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    onSearchChange({ ...searchParams, [key]: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    onSearchChange({ ...searchParams, page });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'image':
        return <Image className="w-6 h-6 text-green-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-6 h-6 text-blue-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderLoadingSkeleton = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <div className="loading-shimmer h-6 w-6 rounded mb-3"></div>
                <div className="loading-shimmer h-4 w-3/4 rounded mb-2"></div>
                <div className="loading-shimmer h-3 w-1/2 rounded mb-1"></div>
                <div className="loading-shimmer h-3 w-2/3 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center gap-4">
                  <div className="loading-shimmer h-6 w-6 rounded"></div>
                  <div className="flex-1">
                    <div className="loading-shimmer h-4 w-3/4 rounded mb-2"></div>
                    <div className="loading-shimmer h-3 w-1/2 rounded"></div>
                  </div>
                  <div className="loading-shimmer h-8 w-32 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête et contrôles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mes Documents</h2>
          <p className="text-base-content/60">
            {totalCount} document{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Rechercher dans vos documents..."
                  className="input input-bordered w-full pl-10"
                  value={searchParams.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>

            {/* Boutons d'actions */}
            <div className="flex gap-2">
              <button
                className={`btn btn-outline btn-sm ${showFilters ? 'btn-active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
              <button
                className="btn btn-outline btn-sm btn-primary"
                onClick={() => onSyncMegaFiles?.()}
                title="Synchroniser les fichiers ajoutés directement dans MEGA"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                </svg>
                Synchroniser
              </button>
            </div>
          </div>

          {/* Filtres détaillés */}
          {showFilters && (
            <div className="divider m-0"></div>
          )}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={searchParams.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="pdf">PDF</option>
                  <option value="image">Images</option>
                  <option value="document">Documents</option>
                  <option value="spreadsheet">Feuilles de calcul</option>
                  <option value="other">Autres</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Catégorie</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={searchParams.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  <option value={CATEGORIES.PERSONAL}>Personnel</option>
                  <option value={CATEGORIES.WORK}>Professionnel</option>
                  <option value={CATEGORIES.LEGAL}>Juridique</option>
                  <option value={CATEGORIES.MEDICAL}>Médical</option>
                  <option value={CATEGORIES.FINANCIAL}>Financier</option>
                  <option value={CATEGORIES.OTHER}>Autre</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Trier par</span>
                </label>
                <div className="join">
                  <select
                    className="select select-bordered select-sm join-item flex-1"
                    value={searchParams.sortBy || SORT_OPTIONS.CREATED_AT}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value={SORT_OPTIONS.CREATED_AT}>Date de création</option>
                    <option value={SORT_OPTIONS.MODIFIED_AT}>Date de modification</option>
                    <option value={SORT_OPTIONS.NAME}>Nom</option>
                    <option value={SORT_OPTIONS.SIZE}>Taille</option>
                    <option value={SORT_OPTIONS.TYPE}>Type</option>
                  </select>
                  <button
                    className="btn btn-outline btn-sm join-item"
                    onClick={() => handleSortChange(searchParams.sortBy || SORT_OPTIONS.CREATED_AT)}
                  >
                    {searchParams.sortOrder === 'asc' ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des documents */}
      {isLoading ? (
        renderLoadingSkeleton()
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun document trouvé</h3>
          <p className="text-base-content/60">
            {searchParams.search
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par télécharger votre premier document'}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between mb-3">
                      {getFileIcon(doc.type)}
                      <button
                        className={`btn btn-ghost btn-xs ${doc.isFavorite ? 'text-red-500' : 'text-base-content/40'}`}
                        onClick={() => onToggleFavorite(doc)}
                      >
                        <Heart className={`w-4 h-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <h3 className="font-medium text-sm line-clamp-2 mb-2" title={doc.name}>
                      {doc.name}
                    </h3>

                    <div className="space-y-1 text-xs text-base-content/60">
                      <p>Taille: {fileUtils.formatFileSize(doc.size)}</p>
                      <p>Modifié: {formatDate(doc.modifiedAt)}</p>
                      {doc.category && (
                        <span className="badge badge-outline badge-xs">{doc.category}</span>
                      )}
                    </div>

                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="badge badge-primary badge-xs">
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 2 && (
                          <span className="text-xs text-base-content/60">
                            +{doc.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="card-actions justify-end mt-3">
                      <div className="join">
                        <button
                          className="btn btn-ghost btn-xs join-item"
                          onClick={() => onView(doc)}
                          title="Voir"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs join-item"
                          onClick={() => onEdit(doc)}
                          title="Modifier"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs join-item"
                          onClick={() => onDownload(doc)}
                          title="Télécharger"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs join-item text-error"
                          onClick={() => onDelete(doc)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <div className="flex items-center gap-4">
                      {getFileIcon(doc.type)}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{doc.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-base-content/60">
                          <span>{fileUtils.formatFileSize(doc.size)}</span>
                          <span>{formatDate(doc.modifiedAt)}</span>
                          {doc.category && (
                            <span className="badge badge-outline badge-sm">{doc.category}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className={`btn btn-ghost btn-sm ${doc.isFavorite ? 'text-red-500' : 'text-base-content/40'}`}
                          onClick={() => onToggleFavorite(doc)}
                        >
                          <Heart className={`w-4 h-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        
                        <div className="join">
                          <button
                            className="btn btn-ghost btn-sm join-item"
                            onClick={() => onView(doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm join-item"
                            onClick={() => onEdit(doc)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm join-item"
                            onClick={() => onDownload(doc)}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm join-item text-error"
                            onClick={() => onDelete(doc)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.map((tag) => (
                          <span key={tag} className="badge badge-primary badge-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <button className="join-item btn btn-sm btn-disabled">...</button>
                      )}
                      <button
                        className={`join-item btn btn-sm ${page === currentPage ? 'btn-active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))
                }
                
                <button
                  className="join-item btn btn-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentList;
