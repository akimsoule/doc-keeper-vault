import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNavigation from '../components/MobileNavigation';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Déterminer l'onglet actif basé sur l'URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'home';
    if (path.startsWith('/dashboard/documents')) return 'documents';
    if (path.startsWith('/dashboard/search')) return 'search';
    if (path.startsWith('/dashboard/favorites')) return 'favorites';
    if (path.startsWith('/dashboard/activity')) return 'activity';
    if (path.startsWith('/dashboard/admin')) return 'admin';
    return 'home';
  };

  const activeTab = getActiveTab();

  // Initialiser le thème
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleToggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'home':
        navigate('/dashboard');
        break;
      case 'documents':
        navigate('/dashboard/documents');
        break;
      case 'search':
        navigate('/dashboard/search');
        break;
      case 'favorites':
        navigate('/dashboard/favorites');
        break;
      case 'activity':
        navigate('/dashboard/activity');
        break;
      case 'admin':
        navigate('/dashboard/admin');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-20 md:pb-0">
      <Navbar onToggleTheme={handleToggleTheme} isDarkMode={isDarkMode} />
      
      {/* Navigation de bureau - cachée sur mobile */}
      <div className="hidden md:block">
        <div className="navbar bg-base-100 border-t border-base-300">
          <div className="navbar-start">
            <div className="tabs tabs-boxed">
              <button
                className={`tab ${activeTab === 'home' ? 'tab-active' : ''}`}
                onClick={() => handleTabChange('home')}
              >
                Accueil
              </button>
              <button
                className={`tab ${activeTab === 'documents' ? 'tab-active' : ''}`}
                onClick={() => handleTabChange('documents')}
              >
                Documents
              </button>
              <button
                className={`tab ${activeTab === 'search' ? 'tab-active' : ''}`}
                onClick={() => handleTabChange('search')}
              >
                Recherche
              </button>
              <button
                className={`tab ${activeTab === 'favorites' ? 'tab-active' : ''}`}
                onClick={() => handleTabChange('favorites')}
              >
                Favoris
              </button>
              <button
                className={`tab ${activeTab === 'activity' ? 'tab-active' : ''}`}
                onClick={() => handleTabChange('activity')}
              >
                Activité
              </button>
              <button
                className={`tab ${activeTab === 'admin' ? 'tab-active' : ''}`}
                onClick={() => handleTabChange('admin')}
              >
                Administration
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>

      {/* Navigation mobile */}
      <MobileNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
    </div>
  );
};

export default DashboardLayout;
