import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      addToast({ message: 'Veuillez remplir tous les champs', type: 'error' });
      return;
    }

    const success = await login(email, password);
    if (success) {
      addToast({ message: 'Connexion réussie !', type: 'success' });
      navigate('/dashboard');
    } else {
      addToast({ message: 'Email ou mot de passe incorrect', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200/50">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="btn btn-ghost btn-sm btn-square">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-bold text-base-content">Connexion</h2>
              <p className="text-base-content/60">Accédez à votre espace documentaire</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="votre@email.com"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={loading}
              >
                {loading && <span className="loading loading-spinner loading-sm"></span>}
                <LogIn className="w-4 h-4" />
                Se connecter
              </button>
            </div>
          </form>

          <div className="divider">ou</div>
          
          <div className="text-center">
            <p className="text-sm text-base-content/60">
              Pas encore de compte ?{' '}
              <Link to="/register" className="link link-primary">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
