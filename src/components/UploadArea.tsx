import React from 'react';
import { Upload, Plus, FolderPlus } from 'lucide-react';

interface UploadAreaProps {
  onFileUpload: (files: FileList) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  };

  return (
    <div className="mb-6 sm:mb-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 scale-105'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
        }`}
      >
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className={`p-4 sm:p-6 rounded-full transition-all duration-200 ${
            isDragging ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500'
          }`}>
            <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Glissez-déposez vos fichiers ici
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              ou cliquez pour sélectionner des fichiers
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                Ajouter des fichiers
              </button>
              
              <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base">
                <FolderPlus className="w-4 h-4" />
                Créer un dossier
              </button>
            </div>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};