import { useState } from 'react';

// Hook pour la navigation par gestes plus avancée
export const useSwipeNavigation = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const goToNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    setTotalPages,
    goToNext,
    goToPrevious,
    goToPage,
    canGoNext: currentPage < totalPages - 1,
    canGoPrevious: currentPage > 0,
  };
};
