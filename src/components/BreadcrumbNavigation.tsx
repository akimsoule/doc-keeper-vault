import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { FolderPath } from '../types';

interface BreadcrumbNavigationProps {
  path: FolderPath[];
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  path,
  className = '',
}) => {
  return (
    <div className={`breadcrumbs text-sm text-base-content/60 min-w-0 ${className}`}>
      <ul className="flex-wrap">
        {/* Racine */}
        <li>
          <Link
            to="/dashboard"
            className="btn btn-ghost btn-xs gap-1 normal-case text-base-content/60 hover:text-base-content"
          >
            <Home className="h-3 w-3" />
            <span className="hidden sm:inline">Racine</span>
          </Link>
        </li>

        {/* Chemin */}
        {path.map((folder, index) => (
          <li key={folder.id}>
            <Link
              to={`/dashboard/folder/${folder.id}`}
              className={`btn btn-ghost btn-xs normal-case truncate max-w-[120px] sm:max-w-none ${
                index === path.length - 1
                  ? 'text-primary font-medium'
                  : 'text-base-content/60 hover:text-base-content'
              }`}
              title={folder.name}
            >
              {folder.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
