import React from 'react';
import { Settings, Monitor, Moon, Sun, Grid, List, RotateCcw } from 'lucide-react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useTheme } from '../hooks/useTheme';

interface UserPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { preferences, updatePreference, resetPreferences } = useUserPreferences();
  const { theme, setSpecificTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setSpecificTheme(newTheme);
    updatePreference('theme', newTheme);
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes vos préférences ?')) {
      resetPreferences();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-base-100 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Préférences utilisateur</h2>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          </div>

          {/* Contenu */}
          <div className="space-y-6">
            {/* Thème */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Apparence
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Thème</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        <Sun className="w-4 h-4 mr-2" />
                        Clair
                      </button>
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        <Moon className="w-4 h-4 mr-2" />
                        Sombre
                      </button>
                      <button
                        onClick={() => handleThemeChange('auto')}
                        className={`btn btn-sm ${theme === 'auto' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        <Monitor className="w-4 h-4 mr-2" />
                        Auto
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Mode compact</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={preferences.compactMode}
                        onChange={(e) => updatePreference('compactMode', e.target.checked)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Affichage */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <Grid className="w-5 h-5" />
                  Affichage des documents
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Mode d'affichage</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updatePreference('viewMode', 'grid')}
                        className={`btn btn-sm ${preferences.viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        <Grid className="w-4 h-4 mr-2" />
                        Grille
                      </button>
                      <button
                        onClick={() => updatePreference('viewMode', 'list')}
                        className={`btn btn-sm ${preferences.viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        <List className="w-4 h-4 mr-2" />
                        Liste
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Documents par page</span>
                    </label>
                    <select
                      className="select select-bordered w-full max-w-xs"
                      value={preferences.itemsPerPage}
                      onChange={(e) => updatePreference('itemsPerPage', parseInt(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Tri par défaut</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="select select-bordered flex-1"
                        value={preferences.sortBy}
                        onChange={(e) => updatePreference('sortBy', e.target.value as 'name' | 'date' | 'size' | 'type')}
                      >
                        <option value="name">Nom</option>
                        <option value="date">Date</option>
                        <option value="size">Taille</option>
                        <option value="type">Type</option>
                      </select>
                      <select
                        className="select select-bordered"
                        value={preferences.sortOrder}
                        onChange={(e) => updatePreference('sortOrder', e.target.value as 'asc' | 'desc')}
                      >
                        <option value="asc">Croissant</option>
                        <option value="desc">Décroissant</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Afficher les filtres par défaut</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={preferences.showFilters}
                        onChange={(e) => updatePreference('showFilters', e.target.checked)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actualisation automatique */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Actualisation automatique</h3>
                
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Actualisation automatique</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={preferences.autoRefresh}
                        onChange={(e) => updatePreference('autoRefresh', e.target.checked)}
                      />
                    </label>
                  </div>
                  
                  {preferences.autoRefresh && (
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Intervalle (secondes)</span>
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        step="10"
                        className="input input-bordered w-full max-w-xs"
                        value={preferences.refreshInterval}
                        onChange={(e) => updatePreference('refreshInterval', parseInt(e.target.value) || 30)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-8 pt-6 border-t border-base-300">
            <button
              onClick={handleReset}
              className="btn btn-outline btn-error"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser
            </button>
            
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
