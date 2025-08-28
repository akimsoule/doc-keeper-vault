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
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Documents ({totalDocuments})
        </h2>
        <div className="flex items-center gap-1 sm:gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};