import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/UseContext';
import { useErrorHandler } from '@/lib/errorHandler';
import { Link, useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const { showError, showSuccess } = useErrorHandler();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!email.trim()) {
      showError("L'adresse email est requise", "Validation échouée");
      return;
    }
    
    if (!password) {
      showError("Le mot de passe est requis", "Validation échouée");
      return;
    }
    
    try {
      const success = await login(email, password);
      if (success) {
        // Rediriger vers le dashboard après connexion
        navigate('/');
      } else {
        // Le provider a déjà affiché une erreur si nécessaire
      }
    } catch (err) {
      console.error('Erreur lors du submit de connexion:', err);
      showError(err, 'Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent p-3 sm:p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            DocManager
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Connectez-vous pour accéder à vos documents
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 text-base sm:text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 text-base sm:text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 p-4 sm:p-6">
            <Button 
              type="submit" 
              className="w-full text-base sm:text-sm h-11 sm:h-10" 
              variant="gradient"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="text-xs sm:text-sm text-center">
              Pas encore de compte ?{" "}
              <Link to="/signup" className="text-primary hover:text-primary-glow font-medium">
                Créer un compte
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};