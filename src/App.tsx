import { useState, useMemo, useEffect, useCallback } from 'react';
import { Files, Bell, Settings, User, LogIn, UserPlus, LogOut } from 'lucide-react';
import './App.css';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { DocumentCard } from './components/DocumentCard';
import { UploadArea } from './components/UploadArea';
import { ViewControls } from './components/ViewControls';
import { Stats } from './components/Stats';
import { ThemeSelector } from './components/ThemeSelector';
import { categories } from './data/mockData';
import { ViewMode } from './types';
import { useDocuments } from './hooks/useDocuments';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';

function App() {
  // État d'authentification
  const { user, isAuthenticated, loading: authLoading, login, register, logout } = useAuth();
  
  // État de l'application
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    documentId: string;
    documentName: string;
  }>({
    show: false,
    documentId: '',
    documentName: '',
  });

  // Hook des documents
  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
    total,
    uploadDocument,
    updateDocument,
    deleteDocument,
    searchDocuments,
    loadDocuments,
    clearError: clearDocumentsError,
  } = useDocuments({
    autoLoad: isAuthenticated,
    searchQuery: searchTerm,
    category: selectedCategory,
  });

  // Hook des toasts
  const { addToast } = useToast();

  // Fonction helper pour les toasts
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    addToast({ message, type });
  }, [addToast]);

  // Documents filtrés
  const filteredDocuments = useMemo(() => {
    if (!isAuthenticated) return [];
    
    return documents.filter((doc) => {
      const matchesSearch = searchTerm === '' || 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === '' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchTerm, selectedCategory, isAuthenticated]);

  // Statistiques
  const stats = useMemo(() => {
    if (!isAuthenticated) {
      return {
        totalDocuments: 0,
        totalSize: 0,
        favoriteCount: 0,
        sharedCount: 0,
      };
    }
    
    return {
      totalDocuments: total || documents.length,
      totalSize: documents.reduce((sum, doc) => sum + doc.size, 0),
      favoriteCount: documents.filter(doc => doc.favorite).length,
      sharedCount: documents.filter(doc => doc.shared).length,
    };
  }, [documents, total, isAuthenticated]);

  // Gestion des erreurs
  useEffect(() => {
    if (documentsError) {
      showToast(documentsError, 'error');
      clearDocumentsError();
    }
  }, [documentsError, showToast, clearDocumentsError]);

  // Handlers d'authentification
  const handleLogin = async () => {
    if (!authForm.email || !authForm.password) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    const success = await login(authForm.email, authForm.password);
    if (success) {
      showToast('Connexion réussie !', 'success');
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', name: '' });
    }
  };

  const handleRegister = async () => {
    if (!authForm.email || !authForm.password || !authForm.name) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    const success = await register(authForm.email, authForm.name, authForm.password);
    if (success) {
      showToast('Inscription réussie !', 'success');
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', name: '' });
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Déconnexion réussie', 'success');
  };

  // Handlers des documents
  const handleToggleFavorite = async (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (!document) return;

    const success = await updateDocument(id, {
      isFavorite: !document.favorite,
    });

    if (success) {
      showToast(
        document.favorite ? 'Document retiré des favoris' : 'Document ajouté aux favoris',
        'success'
      );
    }
  };

  const handleDeleteDocument = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (!document) return;

    setConfirmDelete({
      show: true,
      documentId: id,
      documentName: document.name,
    });
  };

  const confirmDeleteDocument = async () => {
    const success = await deleteDocument(confirmDelete.documentId);
    
    if (success) {
      showToast('Document supprimé avec succès', 'success');
    }
    
    setConfirmDelete({
      show: false,
      documentId: '',
      documentName: '',
    });
  };

  const handleFileUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      // Déterminer la catégorie en fonction du type de fichier
      let category = 'autres';
      if (file.type.startsWith('image/')) category = 'images';
      else if (file.type.includes('pdf')) category = 'pdf';
      else if (file.type.includes('word') || file.type.includes('document')) category = 'documents';
      else if (file.type.includes('sheet') || file.type.includes('excel')) category = 'tableaux';

      return uploadDocument(file, {
        category,
        tags: ['nouveau'],
      });
    });

    try {
      await Promise.all(uploadPromises);
      showToast(`${files.length} fichier(s) uploadé(s) avec succès`, 'success');
    } catch {
      showToast('Erreur lors de l\'upload des fichiers', 'error');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (query && query.length > 2) {
      await searchDocuments(query);
    } else if (query === '') {
      await loadDocuments();
    }
  };

  // Écran de chargement de l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300/50 sticky top-0 z-50">
        <div className="navbar-start">
          <div className="flex items-center gap-3">
            <div className="flex">
              <div className="bg-primary text-primary-content rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <Files className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-base-content">DocuManager</h1>
              <p className="text-xs text-base-content/60 hidden md:block">Gestion documentaire moderne</p>
            </div>
            <h1 className="text-lg font-bold text-base-content sm:hidden">DocuManager</h1>
          </div>
        </div>
        
        <div className="navbar-end">
          <div className="flex items-center gap-1 sm:gap-2">
            {isAuthenticated && (
              <>
                <button className="btn btn-ghost btn-sm btn-square">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="btn btn-ghost btn-sm btn-square hidden sm:flex">
                  <Settings className="w-5 h-5" />
                </button>
              </>
            )}
            <ThemeSelector />
            <div className="divider divider-horizontal hidden sm:block"></div>
            
            {isAuthenticated ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost gap-1 sm:gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><button onClick={handleLogout}><LogOut className="w-4 h-4" />Déconnexion</button></li>
                </ul>
              </div>
            ) : (
              <div className="flex gap-1">
                <button
                  className="btn btn-ghost btn-sm gap-1"
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Connexion</span>
                </button>
                <button
                  className="btn btn-primary btn-sm gap-1"
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Inscription</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {!isAuthenticated ? (
          /* Page d'accueil pour utilisateurs non connectés */
          <div className="hero min-h-96">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <div className="flex justify-center mb-6">
                  <div className="bg-primary text-primary-content rounded-full w-24 h-24 flex items-center justify-center">
                    <Files className="w-12 h-12" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-base-content mb-4">
                  Bienvenue sur DocuManager
                </h1>
                <p className="text-lg text-base-content/70 mb-8">
                  Gérez vos documents de manière moderne et sécurisée. 
                  Connectez-vous pour accéder à vos fichiers.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    className="btn btn-primary btn-lg gap-2"
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                  >
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </button>
                  <button
                    className="btn btn-outline btn-lg gap-2"
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthModal(true);
                    }}
                  >
                    <UserPlus className="w-5 h-5" />
                    S'inscrire
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Interface principale pour utilisateurs connectés */
          <>
            {/* Stats */}
            <Stats {...stats} />

            {/* Upload Area */}
            <UploadArea onFileUpload={handleFileUpload} />

            {/* Search and Filters */}
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={(term) => {
                setSearchTerm(term);
                handleSearch(term);
              }}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />

            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              showFilters={showFilters}
            />

            {/* View Controls */}
            <ViewControls
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalDocuments={filteredDocuments.length}
            />

            {/* Loading State */}
            {documentsLoading && (
              <div className="flex justify-center py-12">
                <div className="loading loading-spinner loading-lg text-primary"></div>
              </div>
            )}

            {/* Documents Grid */}
            {!documentsLoading && (
              <>
                {filteredDocuments.length > 0 ? (
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                      : 'space-y-3'
                  }`}>
                    {filteredDocuments.map((document) => (
                      <DocumentCard
                        key={document.id}
                        document={document}
                        onToggleFavorite={handleToggleFavorite}
                        onDelete={handleDeleteDocument}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="hero min-h-96">
                    <div className="hero-content text-center">
                      <div>
                        <div className="flex justify-center mb-4">
                          <div className="bg-base-200 text-base-content/40 rounded-full w-24 h-24 flex items-center justify-center">
                            <Files className="w-8 h-8" />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-base-content mb-2">
                          Aucun document trouvé
                        </h3>
                        <p className="text-base-content/60 mb-6">
                          Essayez de modifier vos critères de recherche ou ajoutez des documents.
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('');
                            loadDocuments();
                          }}
                          className="btn btn-primary"
                        >
                          Réinitialiser les filtres
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Modal d'authentification */}
      {showAuthModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {authMode === 'login' ? 'Connexion' : 'Inscription'}
            </h3>
            
            <div className="space-y-4">
              {authMode === 'register' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nom</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    className="input input-bordered"
                    value={authForm.name}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              )}
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="input input-bordered"
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Mot de passe</span>
                </label>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  className="input input-bordered"
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={authMode === 'login' ? handleLogin : handleRegister}
                disabled={authLoading}
              >
                {authLoading && <span className="loading loading-spinner loading-sm"></span>}
                {authMode === 'login' ? 'Se connecter' : 'S\'inscrire'}
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthForm({ email: '', password: '', name: '' });
                }}
              >
                Annuler
              </button>
            </div>
            
            <div className="divider">ou</div>
            
            <div className="text-center">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              >
                {authMode === 'login' 
                  ? 'Pas encore de compte ? S\'inscrire' 
                  : 'Déjà un compte ? Se connecter'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {confirmDelete.show && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmer la suppression</h3>
            <p className="py-4">
              Êtes-vous sûr de vouloir supprimer le document <strong>{confirmDelete.documentName}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={confirmDeleteDocument}
                disabled={documentsLoading}
              >
                {documentsLoading && <span className="loading loading-spinner loading-sm"></span>}
                Supprimer
              </button>
              <button
                className="btn"
                onClick={() => setConfirmDelete({ show: false, documentId: '', documentName: '' })}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer footer-center p-4 sm:p-6 bg-base-200/60 backdrop-blur-sm border-t border-base-300/50 text-base-content">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <p className="text-xs sm:text-sm text-base-content/60 text-center sm:text-left">
              © 2024 DocuManager. Gestion documentaire moderne et sécurisée.
            </p>
            <div className="flex items-center gap-2 sm:gap-4 text-xs text-base-content/40">
              <span>Version 1.0.0</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Dernière mise à jour: 15 Jan 2024</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;