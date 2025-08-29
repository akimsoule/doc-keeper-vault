import { Link } from 'react-router-dom';
import { Files, LogIn, UserPlus } from 'lucide-react';

export const HomePage = () => {
  return (
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
            <Link
              to="/login"
              className="btn btn-primary btn-lg gap-2"
            >
              <LogIn className="w-5 h-5" />
              Se connecter
            </Link>
            <Link
              to="/register"
              className="btn btn-outline btn-lg gap-2"
            >
              <UserPlus className="w-5 h-5" />
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
