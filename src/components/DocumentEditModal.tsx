import React, { useState, useEffect } from 'react';
import { X, Save, Tag as TagIcon } from 'lucide-react';
import type { Document } from '../types';
import { CATEGORIES } from '../types';

interface DocumentEditModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Document>) => Promise<void>;
}

const DocumentEditModal: React.FC<DocumentEditModalProps> = ({
  document,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (document && isOpen) {
      setFormData({
        name: document.name,
        category: document.category,
        description: document.description || '',
        tags: [...document.tags],
      });
      setTagInput('');
    }
  }, [document, isOpen]);

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
    if (!document) return;

    setIsLoading(true);
    try {
      await onSave(document.id, {
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
        tags: formData.tags,
      });
      onClose();
    } catch {
      // Error is handled by parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Modifier le document</h3>
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              placeholder="Description du document..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Tags */}
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                Tags
              </span>
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
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={addTag}
                className="btn btn-outline"
                disabled={!tagInput.trim() || isLoading}
              >
                Ajouter
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <div key={tag} className="badge badge-primary gap-2">
                    {tag}
                    {!isLoading && (
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleClose} disabled={isLoading}>close</button>
      </form>
    </div>
  );
};

export default DocumentEditModal;
