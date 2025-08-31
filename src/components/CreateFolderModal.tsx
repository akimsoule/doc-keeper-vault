import React, { useState, useEffect } from 'react';
import { X, Folder } from 'lucide-react';
import { Folder as FolderType } from '../types';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    color?: string;
    parentId?: string;
  }) => Promise<void>;
  parentFolder?: FolderType | null;
  folderToEdit?: FolderType | null;
  title?: string;
}

const DEFAULT_COLORS = [
  '#3B82F6', // Bleu
  '#EF4444', // Rouge
  '#10B981', // Vert
  '#F59E0B', // Orange
  '#8B5CF6', // Violet
  '#EC4899', // Rose
  '#6B7280', // Gris
  '#059669', // Emerald
  '#DC2626', // Rouge foncé
  '#7C3AED', // Violet foncé
];

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentFolder,
  folderToEdit,
  title,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!folderToEdit;
  const modalTitle = title || (isEditing ? 'Modifier le dossier' : 'Créer un nouveau dossier');

  // Initialiser les valeurs lors de l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      if (folderToEdit) {
        setName(folderToEdit.name);
        setDescription(folderToEdit.description || '');
        setSelectedColor(folderToEdit.color || DEFAULT_COLORS[0]);
      } else {
        setName('');
        setDescription('');
        setSelectedColor(DEFAULT_COLORS[0]);
      }
      setError(null);
    }
  }, [isOpen, folderToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Le nom du dossier est requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        parentId: parentFolder?.id,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {modalTitle}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Parent folder info */}
          {parentFolder && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Créer dans : <span className="font-medium text-gray-900 dark:text-white">{parentFolder.name}</span>
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Name field */}
          <div className="mb-4">
            <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du dossier *
            </label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nom du dossier"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Description field */}
          <div className="mb-4">
            <label htmlFor="folder-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optionnelle)
            </label>
            <textarea
              id="folder-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Description du dossier"
              disabled={loading}
            />
          </div>

          {/* Color picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Couleur du dossier
            </label>
            <div className="flex items-center gap-2">
              {/* Preview */}
              <div
                className="p-2 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                <Folder
                  className="h-6 w-6"
                  style={{ color: selectedColor }}
                />
              </div>
              
              {/* Color options */}
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-gray-900 dark:border-white scale-110'
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'En cours...' : (isEditing ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
