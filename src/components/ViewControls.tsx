import React from 'react';
import { Grid, List } from 'lucide-react';
import { ViewMode } from '../types';

interface ViewControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  totalDocuments: number;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  viewMode,
  setViewMode,
  totalDocuments,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-base-content">
          Documents ({totalDocuments})
        </h2>
        <div className="btn-group">
          <button
            onClick={() => setViewMode('grid')}
            className={`btn btn-sm ${
              viewMode === 'grid'
                ? 'btn-active btn-primary'
                : 'btn-outline'
            }`}
          >
            <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`btn btn-sm ${
              viewMode === 'list'
                ? 'btn-active btn-primary'
                : 'btn-outline'
            }`}
          >
            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      
    </div>
  );
};