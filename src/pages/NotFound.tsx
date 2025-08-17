import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileText } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <FileText className="w-24 h-24 mx-auto text-base-content/20" />
        </div>
        
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page non trouvée</h2>
        <p className="text-base-content/60 mb-8 max-w-md">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <Link to="/dashboard" className="btn btn-primary">
          <Home className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
