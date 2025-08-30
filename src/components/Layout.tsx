import { Link, useNavigate } from 'react-router-dom';
import { Files, Bell, User, LogOut, UserPlus, BarChart3 } from 'lucide-react';
import { ThemeSelector } from '../components/ThemeSelector';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addToast({ message: 'Déconnexion réussie', type: 'success' });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300/50 sticky top-0 z-50 flex-shrink-0">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="navbar-start">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3">
              <div className="bg-primary text-primary-content rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <Files className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-base-content">DocuManager</h1>
                <p className="text-xs text-base-content/60 hidden md:block">Gestion documentaire moderne</p>
              </div>
              <h1 className="text-lg font-bold text-base-content sm:hidden">DocuManager</h1>
            </Link>
          </div>
          
          <div className="navbar-end">
            <div className="flex items-center gap-1 sm:gap-2">
              {isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard/stats" 
                    className="btn btn-ghost btn-sm btn-square"
                    title="Statistiques"
                  >
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                  <button className="btn btn-ghost btn-sm btn-square">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    <li><Link to="/dashboard/profile"><User className="w-4 h-4" />Profil</Link></li>
                    <li><Link to="/dashboard/stats"><BarChart3 className="w-4 h-4" />Statistiques</Link></li>
                    <li><button onClick={handleLogout}><LogOut className="w-4 h-4" />Déconnexion</button></li>
                  </ul>
                </div>
              ) : (
                <div className="flex gap-1">
                  <Link
                    to="/login"
                    className="btn btn-ghost btn-sm gap-1"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Connexion</span>
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary btn-sm gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Inscription</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-4 sm:p-6 bg-base-200/60 backdrop-blur-sm border-t border-base-300/50 text-base-content flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <p className="text-xs sm:text-sm text-base-content/60 text-center sm:text-left">
              © 2024 DocuManager. Gestion documentaire moderne et sécurisée.
            </p>
            <div className="flex items-center gap-2 sm:gap-4 text-xs text-base-content/40">
              <span>Version 1.0.0</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Dernière mise à jour: 29 août 2025</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
