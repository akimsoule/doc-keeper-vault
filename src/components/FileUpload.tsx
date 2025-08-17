import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, Image, FileSpreadsheet } from 'lucide-react';
import type { DocumentUpload } from '../types';
import { fileUtils } from '../services/api';
import { CATEGORIES } from '../types';

interface FileUploadProps {
  onUpload: (upload: DocumentUpload) => Promise<void>;
  isUploading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isUploading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES.OTHER as string,
    description: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      name: file.name.split('.').slice(0, -1).join('.') || file.name,
    }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const type = fileUtils.getFileType(selectedFile.name);
    
    const upload: DocumentUpload = {
      file: selectedFile,
      name: formData.name,
      type,
      category: formData.category,
      description: formData.description || undefined,
      tags: formData.tags,
    };

    try {
      await onUpload(upload);
      // Reset form
      setSelectedFile(null);
      setFormData({
        name: '',
        category: CATEGORIES.OTHER as string,
        description: '',
        tags: [],
      });
      setTagInput('');
    } catch {
      // Error handled by parent component
    }
  };

  const getFileIcon = (file: File) => {
    const type = fileUtils.getFileType(file.name);
    switch (type) {
      case 'pdf':
        return <FileText className="w-12 h-12 text-red-500" />;
      case 'image':
        return <Image className="w-12 h-12 text-green-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-12 h-12 text-blue-500" />;
      default:
        return <FileText className="w-12 h-12 text-gray-500" />;
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          <Upload className="w-5 h-5" />
          Télécharger un document
        </h2>

        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors file-upload-area ${
              dragOver ? 'drag-over border-primary bg-primary/5' : 'border-base-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-base-content/40" />
            <p className="text-lg font-medium mb-2">
              Glissez-déposez votre fichier ici
            </p>
            <p className="text-base-content/60 mb-4">
              ou cliquez pour sélectionner un fichier
            </p>
            <input
              type="file"
              onChange={handleFileInputChange}
              className="file-input file-input-bordered file-input-primary w-full max-w-xs"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt,.xls,.xlsx,.csv"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fichier sélectionné */}
            <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
              {getFileIcon(selectedFile)}
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-base-content/60">
                  {fileUtils.formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nom du document */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nom du document</span>
              </label>
              <input
                type="text"
                placeholder="Nom du document"
                className="input input-bordered"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            {/* Catégorie */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Catégorie</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value={CATEGORIES.OTHER}>Autre</option>
                <option value={CATEGORIES.PERSONAL}>Personnel</option>
                <option value={CATEGORIES.WORK}>Professionnel</option>
                <option value={CATEGORIES.LEGAL}>Juridique</option>
                <option value={CATEGORIES.MEDICAL}>Médical</option>
                <option value={CATEGORIES.FINANCIAL}>Financier</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Description (optionnel)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Description du document..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Tags */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tags</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Ajouter un tag"
                  className="input input-bordered flex-1"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn btn-outline"
                  disabled={!tagInput.trim()}
                >
                  Ajouter
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <div key={tag} className="badge badge-primary gap-2">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="card-actions justify-end">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="btn btn-ghost"
                disabled={isUploading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUploading || !formData.name.trim()}
              >
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Téléchargement...
                  </>
                ) : (
                  'Télécharger'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
