import React from 'react';
import { Monitor, Moon, Sun, Grid, List, RotateCcw, Settings } from 'lucide-react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useTheme, Theme } from '../hooks/useTheme';

export const UserPreferencesSettings: React.FC = () => {
  const { preferences, updatePreference, resetPreferences } = useUserPreferences();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as Theme);
    updatePreference('theme', newTheme);
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes vos préférences ?')) {
      resetPreferences();
    }
  };

  return (
    <div className="space-y-8">
      {/* Thème */}
      <div className="bg-base-200 p-6 rounded-lg">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-base-content flex items-center gap-2 mb-2">
            <Monitor className="w-5 h-5" />
            Apparence
          </h3>
          <p className="text-base-content/60 text-sm">Personnalisez l'interface utilisateur</p>
        </div>
        
        <div className="space-y-6">
          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text font-medium text-base-content">Thème</span>
            </label>
            <div className="text-xs text-base-content/60 mb-2">Thème préféré</div>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`btn btn-sm md:flex-1 gap-2 ${theme === 'light' ? 'btn-primary' : 'btn-outline hover:btn-primary/20'}`}
              >
                <Sun className="w-4 h-4" />
                Clair
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`btn btn-sm md:flex-1 gap-2 ${theme === 'dark' ? 'btn-primary' : 'btn-outline hover:btn-primary/20'}`}
              >
                <Moon className="w-4 h-4" />
                Sombre
              </button>
              <button
                onClick={() => handleThemeChange('auto')}
                className={`btn btn-sm md:flex-1 gap-2 ${theme === 'auto' as string ? 'btn-primary' : 'btn-outline hover:btn-primary/20'}`}
              >
                <Monitor className="w-4 h-4" />
                Auto
              </button>
            </div>
          </div>
          
          <div className="bg-base-100 p-4 rounded-lg border border-base-300">
            <div className="form-control">
              <label className="label cursor-pointer justify-start space-x-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={preferences.compactMode}
                  onChange={(e) => updatePreference('compactMode', e.target.checked)}
                />
                <div>
                  <div className="label-text font-medium text-base-content">Mode compact</div>
                  <div className="label-text-alt text-base-content/60 text-xs">
                    Affichage dense
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage */}
      <div className="bg-base-200 p-6 rounded-lg">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-base-content flex items-center gap-2 mb-2">
            <Grid className="w-5 h-5" />
            Affichage des documents
          </h3>
          <p className="text-base-content/60 text-sm">Organisation de vos documents</p>
        </div>
        
        <div className="space-y-6">
          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text font-medium text-base-content">Mode d'affichage</span>
            </label>
            <div className="text-xs text-base-content/60 mb-2">Visualisation</div>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => updatePreference('viewMode', 'grid')}
                className={`btn btn-sm md:flex-1 gap-2 ${preferences.viewMode === 'grid' ? 'btn-primary' : 'btn-outline hover:btn-primary/20'}`}
              >
                <Grid className="w-4 h-4" />
                Grille
              </button>
              <button
                onClick={() => updatePreference('viewMode', 'list')}
                className={`btn btn-sm md:flex-1 gap-2 ${preferences.viewMode === 'list' ? 'btn-primary' : 'btn-outline hover:btn-primary/20'}`}
              >
                <List className="w-4 h-4" />
                Liste
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-medium text-base-content">Documents par page</span>
              </label>
              <div className="text-xs text-base-content/60 mb-2">Éléments par page</div>
              <select
                className="select select-bordered w-full focus:select-primary transition-colors"
                value={preferences.itemsPerPage}
                onChange={(e) => updatePreference('itemsPerPage', parseInt(e.target.value))}
              >
                <option value={5}>5 documents</option>
                <option value={10}>10 documents</option>
                <option value={20}>20 documents</option>
                <option value={50}>50 documents</option>
                <option value={100}>100 documents</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-medium text-base-content">Tri par défaut</span>
              </label>
              <div className="text-xs text-base-content/60 mb-2">Critère de tri</div>
              <select
                className="select select-bordered w-full focus:select-primary transition-colors"
                value={preferences.sortBy}
                onChange={(e) => updatePreference('sortBy', e.target.value as 'name' | 'date' | 'size' | 'type')}
              >
                <option value="name">Par nom</option>
                <option value="date">Par date</option>
                <option value="size">Par taille</option>
                <option value="type">Par type</option>
              </select>
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text font-medium text-base-content">Ordre de tri</span>
            </label>
            <div className="text-xs text-base-content/60 mb-2">Direction du tri</div>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => updatePreference('sortOrder', 'asc')}
                className={`btn btn-sm md:flex-1 ${preferences.sortOrder === 'asc' ? 'btn-primary' : 'btn-outline hover:btn-primary/20'}`}
              >
                ↑ Croissant
              </button>
              <button
                onClick={() => updatePreference('sortOrder', 'desc')}
                className={`btn btn-sm md:flex-1 ${preferences.sortOrder === 'desc' ? 'btn-primary' : 'btn-outline hover:btn-primary/20'}`}
              >
                ↓ Décroissant
              </button>
            </div>
          </div>

          <div className="bg-base-100 p-4 rounded-lg border border-base-300">
            <div className="form-control">
              <label className="label cursor-pointer justify-start space-x-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={preferences.showFilters}
                  onChange={(e) => updatePreference('showFilters', e.target.checked)}
                />
                <div>
                  <div className="label-text font-medium text-base-content">Filtres par défaut</div>
                  <div className="label-text-alt text-base-content/60 text-xs">
                    Panneau affiché automatiquement
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Comportement */}
      <div className="bg-base-200 p-6 rounded-lg">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-base-content flex items-center gap-2 mb-2">
            <Settings className="w-5 h-5" />
            Comportement
          </h3>
          <p className="text-base-content/60 text-sm">Comportement automatique</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-base-100 p-4 rounded-lg border border-base-300">
            <div className="form-control">
              <label className="label cursor-pointer justify-start space-x-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={preferences.autoRefresh}
                  onChange={(e) => updatePreference('autoRefresh', e.target.checked)}
                />
                <div>
                  <div className="label-text font-medium text-base-content">Actualisation automatique</div>
                  <div className="label-text-alt text-base-content/60 text-xs">
                    Mise à jour automatique
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-medium text-base-content">Intervalle d'actualisation</span>
              </label>
              <div className="text-xs text-base-content/60 mb-2">Fréquence</div>
              <select
                className="select select-bordered w-full focus:select-primary transition-colors"
                value={preferences.refreshInterval}
                onChange={(e) => updatePreference('refreshInterval', parseInt(e.target.value))}
                disabled={!preferences.autoRefresh}
              >
                <option value={30}>Toutes les 30 secondes</option>
                <option value={60}>Toutes les minutes</option>
                <option value={300}>Toutes les 5 minutes</option>
                <option value={600}>Toutes les 10 minutes</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-medium text-base-content">Catégorie par défaut</span>
              </label>
              <div className="text-xs text-base-content/60 mb-2">Filtre initial</div>
              <select
                className="select select-bordered w-full focus:select-primary transition-colors"
                value={preferences.defaultCategory}
                onChange={(e) => updatePreference('defaultCategory', e.target.value)}
              >
                <option value="">📁 Toutes</option>
                <option value="document">📄 Documents</option>
                <option value="image">🖼️ Images</option>
                <option value="spreadsheet">📊 Tableurs</option>
                <option value="presentation">📺 Présentations</option>
                <option value="archive">📦 Archives</option>
                <option value="audio">🎵 Audio</option>
                <option value="video">🎬 Vidéos</option>
                <option value="other">📂 Autres</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-base-200 p-6 rounded-lg border-l-4 border-l-warning">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-base-content mb-2">Actions</h3>
          <p className="text-base-content/60 text-sm">Actions de gestion des préférences</p>
        </div>
        
        <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-base-content mb-1">Réinitialiser les préférences</h4>
              <p className="text-sm text-base-content/60 mb-4">
                Cette action restaurera toutes les préférences à leurs valeurs par défaut. 
                Cette action est irréversible.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleReset}
            className="btn btn-outline btn-error gap-2 w-full md:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser toutes les préférences
          </button>
        </div>
      </div>
    </div>
  );
};
