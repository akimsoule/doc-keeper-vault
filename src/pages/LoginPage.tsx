import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, isAuthenticated } = useAuth();
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
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const success = await login(email, password);
    if (success) {
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } else {
      toast.error('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200/50 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-8">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/" className="btn btn-ghost btn-sm btn-square">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1 text-center">
              <h2 className="text-3xl font-bold text-base-content mb-2">Connexion</h2>
              <p className="text-base-content/60 text-sm">Accédez à votre espace documentaire</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-medium text-base-content">Email</span>
              </label>
              <input
                type="email"
                placeholder="votre@email.com"
                className="input input-bordered w-full focus:input-primary transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-medium text-base-content">Mot de passe</span>
              </label>
              <input
                type="password"
                placeholder="Mot de passe"
                className="input input-bordered w-full focus:input-primary transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-control w-full mt-8">
              <button
                type="submit"
                className="btn btn-primary w-full gap-2 h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading && <span className="loading loading-spinner loading-sm"></span>}
                <LogIn className="w-5 h-5" />
                Se connecter
              </button>
            </div>
          </form>

          <div className="divider my-6 text-base-content/40">ou</div>
          
          <div className="text-center">
            <p className="text-sm text-base-content/60">
              Pas encore de compte ?{' '}
              <Link to="/register" className="link link-primary font-semibold hover:link-hover">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
