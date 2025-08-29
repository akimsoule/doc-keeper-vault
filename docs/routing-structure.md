# Structure de Routing de Doc Keeper Vault

## Routes Publiques

### `/` - Page d'accueil
- **Composant**: `HomePage`
- **Description**: Page d'accueil publique avec présentation de l'application
- **Fonctionnalités**:
  - Présentation de l'application
  - Liens vers login/register
  - Interface de landing page attractive

### `/login` - Connexion
- **Composant**: `LoginPage`
- **Description**: Page de connexion utilisateur
- **Fonctionnalités**:
  - Formulaire de connexion (email/mot de passe)
  - Redirection vers `/dashboard` après connexion réussie
  - Lien vers la page d'inscription
  - Gestion des erreurs de connexion

### `/register` - Inscription
- **Composant**: `RegisterPage`
- **Description**: Page d'inscription de nouveaux utilisateurs
- **Fonctionnalités**:
  - Formulaire d'inscription (nom, email, mot de passe)
  - Redirection vers `/dashboard` après inscription réussie
  - Lien vers la page de connexion
  - Validation des données et gestion des erreurs

## Routes Protégées

Toutes les routes protégées utilisent le composant `ProtectedRoute` qui :
- Vérifie l'authentification de l'utilisateur
- Redirige vers `/login` si non authentifié
- Affiche un loader pendant la vérification
- Enregistre la route demandée pour redirection après connexion

### `/dashboard` - Tableau de bord principal
- **Composant**: `DashboardPage`
- **Layout**: `Layout`
- **Description**: Interface principale de gestion des documents
- **Fonctionnalités**:
  - Affichage des statistiques utilisateur
  - Liste des documents avec recherche et filtres
  - Upload de nouveaux documents
  - Gestion des documents (modifier, supprimer, favoris)
  - Vue grille et liste
  - Catégorisation et tagging

### `/profile` - Profil utilisateur
- **Composant**: `ProfilePage`
- **Layout**: `Layout`
- **Description**: Gestion du profil utilisateur et paramètres
- **Fonctionnalités**:
  - **Onglet Profil**: Modification des informations personnelles
  - **Onglet Sécurité**: Changement de mot de passe, gestion des sessions
  - **Onglet Notifications**: Préférences de notifications
  - **Onglet Aide**: Documentation, support, FAQ

## Structure des Composants

### `Layout`
- **Props**: `{ children: React.ReactNode }`
- **Description**: Layout partagé pour les pages protégées
- **Fonctionnalités**:
  - Header avec navigation et menu utilisateur
  - Logo et titre de l'application
  - Menu dropdown utilisateur (Profil, Paramètres, Déconnexion)
  - Sélecteur de thème
  - Footer avec informations sur l'application

### `ProtectedRoute`
- **Props**: `{ children: React.ReactNode }`
- **Description**: HOC pour protéger les routes privées
- **Fonctionnalités**:
  - Vérification de l'état d'authentification
  - Redirection automatique vers `/login`
  - Préservation de la route demandée (state.from)
  - Affichage de loader pendant la vérification

## Navigation

### Navigation Publique
- Header simplifié avec liens Login/Register
- Sélecteur de thème disponible

### Navigation Authentifiée
- Header complet avec :
  - Logo et titre cliquables (retour dashboard)
  - Menu utilisateur dropdown :
    - Profil → `/profile`
    - Paramètres → `/settings` (à implémenter)
    - Déconnexion → logout + redirection `/`
  - Notifications (à implémenter)
  - Sélecteur de thème

## Redirections

### Après Connexion/Inscription
- Si `location.state.from` existe → redirection vers la page demandée
- Sinon → redirection vers `/dashboard`

### Après Déconnexion
- Redirection vers `/`
- Nettoyage du token d'authentification

### Routes Non Trouvées
- `path="*"` → redirection vers `HomePage`

## Hooks Utilisés

### `useAuth`
- Gestion de l'état d'authentification
- Actions : login, register, logout
- État : user, isAuthenticated, loading

### `useToast`
- Notifications toast pour feedback utilisateur
- Types : success, error, info, warning

## États de Chargement

### Vérification d'Authentification
- Loader affiché pendant la vérification initiale
- Message "Vérification de la connexion..."

### Navigation
- Hot reload avec Vite pour développement
- Navigation instantanée côté client

## Sécurité

### Protection des Routes
- Toutes les routes sensibles protégées par `ProtectedRoute`
- Vérification token côté client
- Redirection automatique si non authentifié

### Gestion des Sessions
- Token stocké localement
- Vérification de validité automatique
- Nettoyage lors de la déconnexion

## Extensions Futures

### Routes à Ajouter
- `/settings` - Paramètres avancés
- `/documents/:id` - Vue détaillée d'un document
- `/shared` - Documents partagés
- `/trash` - Corbeille
- `/admin` - Interface d'administration (si rôles)

### Fonctionnalités
- Navigation breadcrumb
- Historique de navigation
- Favoris/bookmarks de routes
- Routes dynamiques avec paramètres
