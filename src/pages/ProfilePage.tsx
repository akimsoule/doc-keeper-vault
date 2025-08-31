import { useState, useEffect } from 'react';
import { User, Shield, Bell, HelpCircle, Settings, Cloud } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { UserPreferencesSettings } from '../components/UserPreferencesSettings';
import MegaConfigurationSettings from '../components/MegaConfigurationSettings';

export const ProfilePage = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la mise à jour du profil
    toast.success('Profil mis à jour avec succès !');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    // TODO: Implémenter le changement de mot de passe
    toast.success('Mot de passe mis à jour avec succès !');
    setProfileForm(prev => ({ 
      ...prev, 
      currentPassword: '', 
      newPassword: '', 
      confirmPassword: '' 
    }));
  };

  // Écouter les événements d'ouverture des préférences depuis le Layout
  useEffect(() => {
    const handleOpenPreferences = () => {
      setActiveTab('preferences');
    };

    window.addEventListener('openPreferences', handleOpenPreferences);
    
    return () => {
      window.removeEventListener('openPreferences', handleOpenPreferences);
    };
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'mega', label: 'MEGA', icon: Cloud },
    { id: 'preferences', label: 'Préférences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'help', label: 'Aide', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-base-200 p-6 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-base-content">{user?.name}</h1>
              <p className="text-base-content/60">{user?.email}</p>
              <p className="text-sm text-base-content/40">
                Membre depuis {new Date(user?.createdAt || '').toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-base-100 rounded-lg overflow-hidden shadow-sm">
          <div className="border-b border-base-300">
            <div 
              className="overflow-x-auto px-3 md:px-6" 
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <nav className="flex space-x-2 md:space-x-6 min-w-max" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 md:px-3 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden md:inline">{tab.label}</span>
                      <span className="md:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-6">
            {/* Onglet Profil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-base-content">Informations du profil</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Nom complet</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary">
                      Sauvegarder les modifications
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Onglet Sécurité */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-base-content mb-2">Sécurité du compte</h2>
                  <p className="text-base-content/60 text-sm">Gérez votre mot de passe et la sécurité de votre compte</p>
                </div>
                
                <div className="bg-base-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-base-content mb-4">Changer le mot de passe</h3>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="form-control w-full">
                      <label className="label pb-2">
                        <span className="label-text font-medium text-base-content">Mot de passe actuel</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Saisissez votre mot de passe actuel"
                        className="input input-bordered w-full focus:input-primary transition-colors"
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control w-full">
                        <label className="label pb-2">
                          <span className="label-text font-medium text-base-content">Nouveau mot de passe</span>
                        </label>
                        <input
                          type="password"
                          placeholder="Nouveau mot de passe"
                          className="input input-bordered w-full focus:input-primary transition-colors"
                          value={profileForm.newPassword}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                      </div>

                      <div className="form-control w-full">
                        <label className="label pb-2">
                          <span className="label-text font-medium text-base-content">Confirmer le nouveau mot de passe</span>
                        </label>
                        <input
                          type="password"
                          placeholder="Confirmez votre nouveau mot de passe"
                          className="input input-bordered w-full focus:input-primary transition-colors"
                          value={profileForm.confirmPassword}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button type="submit" className="btn btn-primary gap-2 h-12 px-6">
                        <Shield className="w-4 h-4" />
                        Changer le mot de passe
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-base-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-base-content mb-4">Sessions actives</h3>
                  <p className="text-base-content/60 text-sm mb-6">Gérez vos sessions de connexion actives</p>
                  
                  <div className="space-y-4">
                    <div className="bg-base-100 p-4 rounded-lg border border-success/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-success rounded-full"></div>
                          <div>
                            <p className="font-medium text-base-content">Session actuelle</p>
                            <p className="text-sm text-base-content/60">Dernière activité: Maintenant</p>
                            <p className="text-xs text-base-content/40">IP: 192.168.1.1 • Chrome sur macOS</p>
                          </div>
                        </div>
                        <span className="badge badge-success">Actif</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button className="btn btn-outline btn-error btn-sm gap-2">
                        <Shield className="w-4 h-4" />
                        Déconnecter toutes les autres sessions
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-base-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-base-content mb-4">Authentification à deux facteurs</h3>
                  <p className="text-base-content/60 text-sm mb-6">Renforcez la sécurité de votre compte avec l'authentification à deux facteurs</p>
                  
                  <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-8 h-8 text-base-content/60" />
                      <div>
                        <p className="font-medium text-base-content">Authentification à deux facteurs</p>
                        <p className="text-sm text-base-content/60">Non configurée</p>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm gap-2">
                      <Shield className="w-4 h-4" />
                      Configurer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet MEGA */}
            {activeTab === 'mega' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-base-content">Configuration MEGA</h2>
                <MegaConfigurationSettings />
              </div>
            )}

            {/* Onglet Préférences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <UserPreferencesSettings />
              </div>
            )}

            {/* Onglet Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-base-content">Préférences de notification</h2>
                
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="cursor-pointer label justify-start space-x-3">
                      <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
                      <div>
                        <div className="label-text font-medium">Notifications par email</div>
                        <div className="label-text-alt text-base-content/60">
                          Recevoir des notifications par email pour les documents partagés
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="cursor-pointer label justify-start space-x-3">
                      <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
                      <div>
                        <div className="label-text font-medium">Notifications de sécurité</div>
                        <div className="label-text-alt text-base-content/60">
                          Recevoir des alertes pour les activités de sécurité suspectes
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="cursor-pointer label justify-start space-x-3">
                      <input type="checkbox" className="checkbox checkbox-primary" />
                      <div>
                        <div className="label-text font-medium">Notifications marketing</div>
                        <div className="label-text-alt text-base-content/60">
                          Recevoir des informations sur les nouvelles fonctionnalités
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Aide */}
            {activeTab === 'help' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-base-content">Centre d'aide</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="card-title text-base">Documentation</h3>
                      <p className="text-sm text-base-content/60">
                        Consultez notre guide d'utilisation complet
                      </p>
                      <div className="card-actions justify-end">
                        <button className="btn btn-sm btn-primary">Consulter</button>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="card-title text-base">Support technique</h3>
                      <p className="text-sm text-base-content/60">
                        Contactez notre équipe de support
                      </p>
                      <div className="card-actions justify-end">
                        <button className="btn btn-sm btn-primary">Contacter</button>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="card-title text-base">FAQ</h3>
                      <p className="text-sm text-base-content/60">
                        Questions fréquemment posées
                      </p>
                      <div className="card-actions justify-end">
                        <button className="btn btn-sm btn-primary">Voir la FAQ</button>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="card-title text-base">Commentaires</h3>
                      <p className="text-sm text-base-content/60">
                        Partagez vos suggestions d'amélioration
                      </p>
                      <div className="card-actions justify-end">
                        <button className="btn btn-sm btn-primary">Envoyer</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
