import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, FileText, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/UseContext';
import { useErrorHandler } from '@/lib/errorHandler';
import { Link } from 'react-router-dom';

export const SignUpForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();
  const { showError, showSuccess } = useErrorHandler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations côté client
    if (!name.trim()) {
      showError("Le nom est requis", "Validation échouée");
      return;
    }
    
    if (!email.trim()) {
      showError("L'adresse email est requise", "Validation échouée");
      return;
    }
    
    if (password !== confirmPassword) {
      showError("Les mots de passe ne correspondent pas", "Validation échouée");
      return;
    }

    if (password.length < 8) {
      showError("Le mot de passe doit contenir au moins 8 caractères", "Validation échouée");
      return;
    }
    
    const success = await signup(name, email, password);
    
    // Les messages de succès/erreur sont maintenant gérés dans le Provider
    // via le hook useErrorHandler
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent p-3 sm:p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Créer un compte
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Inscrivez-vous pour commencer à gérer vos documents
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 text-base sm:text-sm"
              />
            </div>

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
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Le mot de passe doit contenir au moins 8 caractères
            </p>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full" 
              variant="gradient"
              disabled={isLoading}
            >
              {isLoading ? "Création du compte..." : "Créer un compte"}
            </Button>

            <div className="text-sm text-center">
              <Link 
                to="/login"
                className="text-primary hover:text-primary-glow flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
