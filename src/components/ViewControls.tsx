import React from 'react';
import { Grid, List, Calendar, BarChart3 } from 'lucide-react';
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
      
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="btn btn-ghost btn-sm btn-square">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button className="btn btn-ghost btn-sm btn-square">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};