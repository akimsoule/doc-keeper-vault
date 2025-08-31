import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { FolderPage } from './pages/FolderPage';
import { StatsPage } from './pages/StatsPage';
import { ProfilePage } from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Page d'accueil publique */}
          <Route path="/" element={<HomePage />} />
          
          {/* Pages d'authentification */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Pages protégées */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Route pour les dossiers */}
          <Route
            path="/dashboard/folder/:folderId"
            element={
              <ProtectedRoute>
                <Layout>
                  <FolderPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
        
          <Route
            path="/dashboard/stats"
            element={
              <ProtectedRoute>
                <Layout>
                  <StatsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        
        {/* Redirection par défaut pour les routes non trouvées */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;