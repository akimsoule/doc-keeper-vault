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
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-base-content">
            {modalTitle}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent folder info */}
          {parentFolder && (
            <div className="alert alert-info">
              <p className="text-sm">
                Créer dans : <span className="font-medium">{parentFolder.name}</span>
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="alert alert-error">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Name field */}
          <div className="form-control">
            <label className="label" htmlFor="folder-name">
              <span className="label-text">Nom du dossier *</span>
            </label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Nom du dossier"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Description field */}
          <div className="form-control">
            <label className="label" htmlFor="folder-description">
              <span className="label-text">Description (optionnelle)</span>
            </label>
            <textarea
              id="folder-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="textarea textarea-bordered w-full"
              placeholder="Description du dossier"
              disabled={loading}
            />
          </div>

          {/* Color picker */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Couleur du dossier</span>
            </label>
            <div className="flex items-center gap-3">
              {/* Preview */}
              <div
                className="p-2 rounded-lg border-2 border-base-300"
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
                        ? 'border-base-content scale-110'
                        : 'border-base-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn btn-ghost"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {isEditing ? 'Modification...' : 'Création...'}
                </>
              ) : (
                isEditing ? 'Modifier' : 'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  );
};
