import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Pages
import Login from './components/Login';
import Signup from './components/Signup';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import DashboardDocuments from './pages/DashboardDocuments';
import DashboardSearch from './pages/DashboardSearch';
import DashboardFavorites from './pages/DashboardFavorites';
import DashboardActivity from './pages/DashboardActivity';
import DashboardAdmin from './pages/DashboardAdmin';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          state.isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />
      <Route 
        path="/signup" 
        element={
          state.isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="documents" element={<DashboardDocuments />} />
        <Route path="search" element={<DashboardSearch />} />
        <Route path="favorites" element={<DashboardFavorites />} />
        <Route path="activity" element={<DashboardActivity />} />
        <Route path="admin" element={<DashboardAdmin />} />
      </Route>
      <Route 
        path="/" 
        element={
          <Navigate to={state.isAuthenticated ? "/dashboard" : "/login"} replace />
        } 
      />
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'react-hot-toast',
              style: {
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                style: {
                  background: '#10b981',
                  color: '#ffffff',
                  border: '1px solid #059669',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                  color: '#ffffff',
                  border: '1px solid #dc2626',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#ef4444',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
