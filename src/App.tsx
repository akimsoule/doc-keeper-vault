import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider, DocumentProvider } from "./contexts/Provider";
import { useAuth } from "./contexts/UseContext";

const queryClient = new QueryClient();

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <DocumentProvider>{children}</DocumentProvider> : <>{children}</>;
};

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="*" element={<LoginForm />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AuthWrapper>
          <AppContent />
        </AuthWrapper>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
