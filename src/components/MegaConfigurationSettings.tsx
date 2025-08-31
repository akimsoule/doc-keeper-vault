import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { BackupMegaService } from '../services/api';
import { tokenManager } from '../services/tokenManager';

const backupMegaService = new BackupMegaService();
// Enregistrer le service auprès du gestionnaire de tokens
tokenManager.registerService(backupMegaService);

interface MegaConfig {
  email: string;
  password: string;
}

interface MegaConfigResponse {
  id: string;
  email: string;
  hasCredentials: boolean;
}

const MegaConfigurationSettings: React.FC = () => {
  const { addNotification } = useNotifications();
  const [config, setConfig] = useState<MegaConfig>({ email: '', password: '' });
  const [currentConfig, setCurrentConfig] = useState<MegaConfigResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fonction pour obtenir le token
  const getToken = () => localStorage.getItem('doc-keeper-token');

  // Fonction pour afficher une notification
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    addNotification({
      type,
      title: message,
      persistent: false,
    });
  };

  // Charger la configuration existante
  const loadCurrentConfig = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const data = await backupMegaService.getMegaConfig();
      setCurrentConfig(data);
      if (data.email) {
        setConfig(prev => ({ ...prev, email: data.email }));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      if (errorMessage !== 'Erreur HTTP 404') {
        // 404 signifie qu'aucune config n'existe, c'est normal
        console.error('Erreur lors du chargement de la configuration MEGA:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentConfig();
  }, [loadCurrentConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.email || !config.password) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('Vous devez être connecté', 'error');
      return;
    }

    // Configurer le token dans apiService

    setSaving(true);
    try {
      const data = await backupMegaService.saveMegaConfig(
        {
          email: config.email,
          password: config.password,
        },
        !!currentConfig
      );

      setCurrentConfig(data);
      setConfig(prev => ({ ...prev, password: '' })); // Effacer le mot de passe pour la sécurité
      showToast(
        currentConfig ? 'Configuration MEGA mise à jour' : 'Configuration MEGA créée',
        'success'
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      console.error('Erreur lors de la sauvegarde:', error);
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!currentConfig?.hasCredentials) {
      showToast('Aucune configuration MEGA trouvée', 'error');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('Vous devez être connecté', 'error');
      return;
    }

    // Configurer le token dans apiService

    setLoading(true);
    try {
      const data = await backupMegaService.testMegaConnection();
      
      if (data.success) {
        showToast('Connexion MEGA réussie !', 'success');
      } else {
        showToast(data.error || 'Échec du test de connexion', 'error');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du test de connexion';
      console.error('Erreur lors du test:', error);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!currentConfig || !token) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer votre configuration MEGA ? Cette action est irréversible.')) {
      return;
    }

    // Configurer le token dans apiService

    setLoading(true);
    try {
      await backupMegaService.deleteMegaConfig();
      setCurrentConfig(null);
      setConfig({ email: '', password: '' });
      showToast('Configuration MEGA supprimée', 'success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      console.error('Erreur lors de la suppression:', error);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentConfig) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Configuration MEGA
        </h2>

        {currentConfig?.hasCredentials && (
          <div className="alert alert-success mb-4">
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-bold">Configuration active</div>
              <div className="text-sm">Email: {currentConfig.email}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Email MEGA</span>
            </label>
            <input
              type="email"
              placeholder="votre-email@example.com"
              className="input input-bordered w-full"
              value={config.email}
              onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Mot de passe MEGA</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Votre mot de passe MEGA"
                className="input input-bordered w-full pr-12"
                value={config.password}
                onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                required={!currentConfig?.hasCredentials}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
            {!currentConfig?.hasCredentials && (
              <label className="label">
                <span className="label-text-alt text-info">Le mot de passe sera chiffré et stocké de manière sécurisée</span>
              </label>
            )}
            {currentConfig?.hasCredentials && !config.password && (
              <label className="label">
                <span className="label-text-alt text-warning">Laissez vide pour conserver le mot de passe actuel</span>
              </label>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="flex gap-2 flex-1">
              {currentConfig?.hasCredentials && (
                <>
                  <button
                    type="button"
                    className={`btn btn-outline btn-sm ${loading ? 'loading' : ''}`}
                    onClick={handleTest}
                    disabled={loading || saving}
                  >
                    {loading ? '' : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Tester
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-error btn-sm"
                    onClick={handleDelete}
                    disabled={loading || saving}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </>
              )}
            </div>
            
            <button
              type="submit"
              className={`btn btn-primary ${saving ? 'loading' : ''} sm:min-w-[140px]`}
              disabled={loading || saving}
            >
              {saving ? '' : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {currentConfig?.hasCredentials ? 'Mettre à jour' : 'Sauvegarder'}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-base-200 rounded-lg">
          <h3 className="font-semibold mb-2">À propos de MEGA</h3>
          <p className="text-sm text-base-content/70 mb-2">
            MEGA est utilisé pour stocker vos documents de manière sécurisée dans le cloud. 
            Chaque utilisateur doit configurer ses propres identifiants MEGA.
          </p>
          <p className="text-sm text-base-content/70">
            Vos identifiants sont chiffrés et stockés de manière sécurisée. 
            Seul vous pouvez accéder à vos fichiers MEGA.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MegaConfigurationSettings;
