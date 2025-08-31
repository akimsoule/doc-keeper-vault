import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { FolderPath } from '../types';

interface BreadcrumbNavigationProps {
  path: FolderPath[];
  onNavigate: (folderId: string | null) => void;
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  path,
  onNavigate,
  className = '',
}) => {
  return (
    <nav
      className={`flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}
      aria-label="Navigation du dossier"
    >
      {/* Racine */}
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>Racine</span>
      </button>

      {/* Séparateur et chemin */}
      {path.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <button
            onClick={() => onNavigate(folder.id)}
            className={`px-2 py-1 rounded-md transition-colors ${
              index === path.length - 1
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {folder.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};
