import { useState, useMemo } from 'react';
import { Files, Moon, Sun, Bell, Settings, User } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { DocumentCard } from './components/DocumentCard';
import { UploadArea } from './components/UploadArea';
import { ViewControls } from './components/ViewControls';
import { Stats } from './components/Stats';
import { mockDocuments, categories } from './data/mockData';
import { Document, ViewMode } from './types';

function App() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [darkMode, setDarkMode] = useState(false);

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
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20'
    }`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl">
                <Files className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">DocuManager</h1>
                <p className="text-xs text-gray-500 hidden md:block">Gestion documentaire moderne</p>
              </div>
              <h1 className="text-lg font-bold text-gray-900 sm:hidden">DocuManager</h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-3">
              <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hidden sm:block">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              <div className="w-px h-4 sm:h-6 bg-gray-300 hidden sm:block"></div>
              <button className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm font-medium hidden sm:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
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
          <div className="text-center py-16">
            <div className="p-6 bg-gray-50 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Files className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun document trouvé
            </h3>
            <p className="text-gray-500 mb-6">
              Essayez de modifier vos critères de recherche ou ajoutez des documents.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 sm:mt-16 bg-white/60 backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              © 2024 DocuManager. Gestion documentaire moderne et sécurisée.
            </p>
            <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-400">
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