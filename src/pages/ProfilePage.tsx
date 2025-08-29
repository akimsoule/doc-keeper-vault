import { useState } from 'react';
import { User, Shield, Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
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
    addToast({ message: 'Profil mis à jour avec succès !', type: 'success' });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      addToast({ message: 'Les mots de passe ne correspondent pas', type: 'error' });
      return;
    }
    
    // TODO: Implémenter le changement de mot de passe
    addToast({ message: 'Mot de passe mis à jour avec succès !', type: 'success' });
    setProfileForm(prev => ({ 
      ...prev, 
      currentPassword: '', 
      newPassword: '', 
      confirmPassword: '' 
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'help', label: 'Aide', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-base-200 p-6 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="avatar">
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
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
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
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-base-content">Sécurité du compte</h2>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Mot de passe actuel</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Nouveau mot de passe</span>
                      </label>
                      <input
                        type="password"
                        className="input input-bordered"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Confirmer le nouveau mot de passe</span>
                      </label>
                      <input
                        type="password"
                        className="input input-bordered"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary">
                      Changer le mot de passe
                    </button>
                  </div>
                </form>

                <div className="divider"></div>

                <div className="space-y-4">
                  <h3 className="font-medium text-base-content">Sessions actives</h3>
                  <div className="bg-base-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Session actuelle</p>
                        <p className="text-sm text-base-content/60">Dernière activité: Maintenant</p>
                      </div>
                      <span className="badge badge-success">Actif</span>
                    </div>
                  </div>
                </div>
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
