import { useState, useMemo } from 'react';
import { Files, Bell, Settings, User } from 'lucide-react';
import './App.css';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { DocumentCard } from './components/DocumentCard';
import { UploadArea } from './components/UploadArea';
import { ViewControls } from './components/ViewControls';
import { Stats } from './components/Stats';
import { ThemeSelector } from './components/ThemeSelector';
import { mockDocuments, categories } from './data/mockData';
import { Document, ViewMode } from './types';

function App() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === '' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchTerm, selectedCategory]);

  const stats = useMemo(() => {
    return {
      totalDocuments: documents.length,
      totalSize: documents.reduce((sum, doc) => sum + doc.size, 0),
      favoriteCount: documents.filter(doc => doc.favorite).length,
      sharedCount: documents.filter(doc => doc.shared).length,
    };
  }, [documents]);

  const handleToggleFavorite = (id: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id ? { ...doc, favorite: !doc.favorite } : doc
      )
    );
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleFileUpload = (files: FileList) => {
    const newDocuments: Document[] = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      category: 'autres',
      tags: ['nouveau'],
      uploadDate: new Date(),
      lastModified: new Date(),
      favorite: false,
      shared: false,
    }));
    setDocuments(prev => [...prev, ...newDocuments]);
  };

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
            <button className="btn btn-ghost btn-sm btn-square">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="btn btn-ghost btn-sm btn-square hidden sm:flex">
              <Settings className="w-5 h-5" />
            </button>
            <ThemeSelector />
            <div className="divider divider-horizontal hidden sm:block"></div>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost gap-1 sm:gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm font-medium hidden sm:inline">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats */}
        <Stats {...stats} />

        {/* Upload Area */}
        <UploadArea onFileUpload={handleFileUpload} />

        {/* Search and Filters */}
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
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

        {/* Documents Grid */}
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
                <div className="flex mb-4">
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
                  }}
                  className="btn btn-primary"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

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