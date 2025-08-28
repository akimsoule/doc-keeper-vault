import React from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Download,
  Share2,
  Star,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Document } from '../types';

interface DocumentCardProps {
  document: Document;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  viewMode: 'grid' | 'list';
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('zip') || type.includes('rar')) return Archive;
  return FileText;
};

const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onToggleFavorite,
  onDelete,
  viewMode,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const FileIcon = getFileIcon(document.type);

  if (viewMode === 'list') {
    return (
      <div 
        className="group bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-200 hover:bg-white"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex-shrink-0">
              <FileIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{document.name}</h3>
              <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500">
                <span>{formatFileSize(document.size)}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{formatDate(document.uploadDate)}</span>
                <span className="hidden md:inline">•</span>
                <span className="capitalize hidden md:inline">{document.category}</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              {document.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md whitespace-nowrap">
                  {tag}
                </span>
              ))}
              {document.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{document.tags.length - 2}</span>
              )}
            </div>
          </div>
          <div className={`flex items-center gap-1 sm:gap-2 transition-opacity duration-200 flex-shrink-0 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}>
            <button
              onClick={() => onToggleFavorite(document.id)}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                document.favorite
                  ? 'text-yellow-500 hover:bg-yellow-50'
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${document.favorite ? 'fill-current' : ''}`} />
            </button>
            <button className="hidden sm:block p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200">
              <Download className="w-4 h-4" />
            </button>
            <button className="hidden sm:block p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(document.id)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:bg-white hover:-translate-y-1"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl">
          <FileIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
        </div>
        <div className={`flex items-center gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}>
          <button
            onClick={() => onToggleFavorite(document.id)}
            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
              document.favorite
                ? 'text-yellow-500 hover:bg-yellow-50'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${document.favorite ? 'fill-current' : ''}`} />
          </button>
          <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
            <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {document.name}
        </h3>
        
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <span>{formatFileSize(document.size)}</span>
          <span className="hidden sm:inline">{formatDate(document.uploadDate)}</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {document.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md whitespace-nowrap">
              {tag}
            </span>
          ))}
          {document.tags.length > 2 && (
            <span className="text-xs text-gray-400">+{document.tags.length - 2}</span>
          )}
        </div>
        
        <div className={`flex justify-between items-center transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}>
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200">
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => onDelete(document.id)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
          <span className="text-xs text-gray-400 capitalize hidden sm:inline">{document.category}</span>
        </div>
      </div>
    </div>
  );
};