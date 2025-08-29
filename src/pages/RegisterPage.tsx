import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, loading, isAuthenticated } = useAuth();
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
    
    if (!name || !email || !password || !confirmPassword) {
      addToast({ message: 'Veuillez remplir tous les champs', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      addToast({ message: 'Les mots de passe ne correspondent pas', type: 'error' });
      return;
    }

    if (password.length < 6) {
      addToast({ message: 'Le mot de passe doit contenir au moins 6 caractères', type: 'error' });
      return;
    }

    const success = await register(email, name, password);
    if (success) {
      addToast({ message: 'Inscription réussie !', type: 'success' });
      navigate('/dashboard');
    } else {
      addToast({ message: 'Erreur lors de l\'inscription', type: 'error' });
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
              <h2 className="text-2xl font-bold text-base-content">Inscription</h2>
              <p className="text-base-content/60">Créez votre compte DocuManager</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nom complet</span>
              </label>
              <input
                type="text"
                placeholder="Votre nom"
                className="input input-bordered"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

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
                placeholder="Mot de passe (min. 6 caractères)"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirmer le mot de passe</span>
              </label>
              <input
                type="password"
                placeholder="Confirmez votre mot de passe"
                className="input input-bordered"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                <UserPlus className="w-4 h-4" />
                S'inscrire
              </button>
            </div>
          </form>

          <div className="divider">ou</div>
          
          <div className="text-center">
            <p className="text-sm text-base-content/60">
              Déjà un compte ?{' '}
              <Link to="/login" className="link link-primary">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
