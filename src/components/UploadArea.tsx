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
    <>
      {/* Zone d'upload complète pour les grands écrans */}
      <div className="mb-6 sm:mb-8 hidden lg:block">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-primary/10 scale-105'
              : 'border-base-300 hover:border-primary/60 hover:bg-primary/5'
          }`}
        >
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className={`flex transition-all duration-200 ${
              isDragging ? 'bg-primary text-primary-content' : 'bg-primary/10 text-primary'
            }`}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-base-content mb-2">
                Glissez-déposez vos fichiers ici
              </h3>
              <p className="text-sm sm:text-base text-base-content/60 mb-4">
                ou cliquez pour sélectionner des fichiers
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary w-full sm:w-auto gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter des fichiers
                </button>
                
                <button className="btn btn-outline w-full sm:w-auto gap-2">
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

      {/* Bouton simple pour les moyens écrans (tablettes) */}
      <div className="mb-6 hidden md:block lg:hidden">
        <div className="flex justify-end">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter des fichiers
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Bouton flottant pour les petits écrans (mobile) */}
      <div className="block md:hidden">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-primary btn-circle fixed bottom-6 right-6 z-40 shadow-lg hover:shadow-xl transition-all duration-200 w-14 h-14"
          title="Ajouter des fichiers"
        >
          <Plus className="w-6 h-6" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </>
  );
};