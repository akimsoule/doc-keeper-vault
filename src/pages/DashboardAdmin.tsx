import React from 'react';
import { CacheManager, MegaConfigManager } from '../components';

const DashboardAdmin: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="mt-2 text-gray-600">
          Gestion du cache et des performances de l'application
        </p>
      </div>

      {/* Gestionnaire de cache */}
      <CacheManager />

      {/* Configuration MEGA */}
      <MegaConfigManager />

      {/* Informations sur les performances */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Informations de performance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Avantages du cache
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Réduction des temps de chargement</li>
              <li>• Moins de requêtes serveur</li>
              <li>• Meilleure expérience utilisateur</li>
              <li>• Optimisation de la bande passante</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Configuration du cache
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Documents: 3 minutes TTL</li>
              <li>• Tags: 15 minutes TTL</li>
              <li>• URLs: 60 minutes TTL</li>
              <li>• Logs: 1 minute TTL</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 Conseil d'optimisation
          </h4>
          <p className="text-sm text-blue-800">
            Le cache se vide automatiquement lors des opérations de modification 
            (création, mise à jour, suppression de documents) pour garantir la 
            cohérence des données.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
