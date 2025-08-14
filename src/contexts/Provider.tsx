import { AuthProvider } from "./AuthProvider";
import { DocumentProvider } from "./DocumentProvider";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AuthProvider>
      <DocumentProvider>
        {children}
      </DocumentProvider>
    </AuthProvider>
  );
};

// Ré-exporter les providers individuels pour la flexibilité
export { AuthProvider } from "./AuthProvider";
export { DocumentProvider } from "./DocumentProvider";
