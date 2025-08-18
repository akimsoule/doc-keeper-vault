import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Settings, Trash2, TestTube } from 'lucide-react';
import { megaConfigService } from '../services/api';
import type { MegaConfig, MegaConfigForm } from '../types';

export function MegaConfigManager() {
  const [config, setConfig] = useState<MegaConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MegaConfigForm>({
    email: '',
    password: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const currentConfig = await megaConfigService.getMegaConfig();
      console.log('Configuration MEGA chargée:', currentConfig);
      if (currentConfig && currentConfig.email) {
        setFormData({
          email: currentConfig.email,
          password: '',
          isActive: currentConfig.isActive
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement de la configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Veuillez saisir l\'email et le mot de passe' });
      return;
    }

    try {
      setTesting(true);
      const isValid = await megaConfigService.testMegaConnection(formData.email, formData.password);
      
      if (isValid) {
        setMessage({ type: 'success', text: 'Connexion MEGA réussie !' });
      } else {
        setMessage({ type: 'error', text: 'Impossible de se connecter avec ces identifiants' });
      }
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      setMessage({ type: 'error', text: 'Erreur lors du test de connexion' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }

    try {
      setLoading(true);
      const savedConfig = await megaConfigService.setMegaConfig(formData);
      setConfig(savedConfig);
      setIsEditing(false);
      setFormData({ ...formData, password: '' }); // Vider le mot de passe
      setMessage({ type: 'success', text: 'Configuration MEGA sauvegardée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde de la configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer la configuration MEGA ?')) {
      return;
    }

    try {
      setLoading(true);
      await megaConfigService.deleteMegaConfig();
      setConfig(null);
      setFormData({ email: '', password: '', isActive: true });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Configuration MEGA supprimée' });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression de la configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!config) {
      setMessage({ type: 'error', text: 'Aucune configuration trouvée' });
      return;
    }

    try {
      setLoading(true);
      const updatedConfig = await megaConfigService.toggleMegaConfig(!config.isActive);
      setConfig(updatedConfig);
      setFormData({ ...formData, isActive: updatedConfig.isActive });
      setMessage({ 
        type: 'success', 
        text: `Configuration ${updatedConfig.isActive ? 'activée' : 'désactivée'}` 
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      setMessage({ type: 'error', text: 'Erreur lors du changement de statut' });
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => setMessage(null);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration MEGA
        </h2>
        <p className="mt-2 text-gray-600">
          Configurez vos identifiants MEGA pour stocker vos documents
        </p>
      </div>
      
      <div className="space-y-6">
        {message && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'error' 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-green-50 border border-green-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm ${
                message.type === 'error' ? 'text-red-700' : 'text-green-700'
              }`}>
                {message.text}
              </p>
            </div>
            <button
              onClick={clearMessage}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}

        {config && !isEditing ? (
          // Affichage de la configuration existante
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{config.email}</div>
                <div className={`text-sm flex items-center gap-2 mt-1 ${
                  config.isActive ? 'text-green-600' : 'text-orange-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    config.isActive ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  {config.isActive ? 'Configuration active' : 'Configuration inactive'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Dernière mise à jour : {new Date(config.updatedAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.isActive}
                    onChange={handleToggleActive}
                    disabled={loading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">Actif</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={loading}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 transition-colors"
                    title="Supprimer la configuration"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : isEditing ? (
          // Formulaire de configuration (création ou modification)
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email MEGA
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe MEGA
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Votre mot de passe MEGA"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Option "Configuration active" uniquement lors de la modification d'une config existante */}
            {config && (
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    disabled={loading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Configuration active</span>
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleTestConnection}
                disabled={loading || testing || !formData.email || !formData.password}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <TestTube className="h-4 w-4" />
                {testing ? 'Test en cours...' : 'Tester la connexion'}
              </button>
              
              <button
                onClick={handleSave}
                disabled={loading || !formData.email || !formData.password}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sauvegarde...' : config ? 'Mettre à jour' : 'Créer la configuration'}
              </button>
              
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (config) {
                    setFormData({
                      email: config.email,
                      password: '',
                      isActive: config.isActive
                    });
                  } else {
                    setFormData({ email: '', password: '', isActive: true });
                  }
                  clearMessage();
                }}
                disabled={loading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : null}

        {!config && !isEditing && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune configuration MEGA
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Configurez vos identifiants MEGA pour commencer à stocker vos documents de manière sécurisée.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Configurer MEGA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
