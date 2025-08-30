import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading = false,
  className = ""
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex items-center justify-center gap-2 mt-6 ${className}`}>
      <div className="join">
        {/* Bouton précédent */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="join-item btn btn-sm"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numéros de page */}
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span 
                key={`dots-${index}`} 
                className="join-item btn btn-sm btn-disabled"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              disabled={isLoading}
              className={`join-item btn btn-sm ${
                currentPage === pageNumber ? 'btn-active btn-primary' : ''
              }`}
              aria-label={`Page ${pageNumber}`}
              aria-current={currentPage === pageNumber ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Bouton suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="join-item btn btn-sm"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Informations de pagination */}
      <div className="text-sm text-base-content/60 ml-4">
        Page {currentPage} sur {totalPages}
      </div>
    </div>
  );
};
