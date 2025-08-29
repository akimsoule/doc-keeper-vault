# Fonctions Netlify - Doc Keeper Vault

Ce dossier contient les fonctions Netlify pour l'API backend de Doc Keeper Vault, une application de gestion documentaire sécurisée.

## 🚀 Fonctions disponibles

### 🔐 Authentification (`/auth`)
- **POST `/auth/login`** - Connexion utilisateur
- **POST `/auth/register`** - Inscription utilisateur  
- **POST `/auth/refresh`** - Rafraîchissement du token JWT
- **POST `/auth/verify`** - Vérification du token JWT

### 📄 Documents (`/documents`)
- **GET `/documents`** - Liste des documents (avec filtres)
- **GET `/documents/{id}`** - Récupérer un document spécifique
- **POST `/documents`** - Créer/uploader un nouveau document
- **PUT `/documents/{id}`** - Mettre à jour un document
- **DELETE `/documents/{id}`** - Supprimer un document

### 🔍 Recherche et Statistiques (`/search`)
- **GET `/search/search?q={query}`** - Recherche simple
- **POST `/search/advanced-search`** - Recherche avancée
- **GET `/search/stats`** - Statistiques globales
- **GET `/search/user-stats`** - Statistiques utilisateur

### 🏷️ Tags (`/tags`)
- **GET `/tags`** - Liste de tous les tags
- **GET `/tags?popular=true`** - Tags populaires
- **GET `/tags/{name}`** - Statistiques d'un tag spécifique
- **DELETE `/tags/{name}`** - Supprimer un tag d'un document

### 📁 Fichiers (`/files`)
- **GET `/files/{documentId}`** - URL de téléchargement temporaire
- **GET `/files/{documentId}?type=base64`** - Fichier en base64

### 👤 Utilisateurs (`/users`)
- **GET `/users/profile`** - Profil utilisateur
- **PUT `/users/profile`** - Mettre à jour le profil
- **GET `/users/preferences`** - Préférences utilisateur
- **PUT `/users/preferences`** - Mettre à jour les préférences
- **DELETE `/users/account`** - Supprimer le compte

### 💾 Sauvegarde (`/backup`)
- **GET `/backup/status`** - Statut des sauvegardes
- **POST `/backup/create`** - Créer une sauvegarde
- **POST `/backup/restore`** - Restaurer une sauvegarde

## 🔧 Configuration

### Variables d'environnement requises

```env
# JWT
JWT_SECRET=your-super-secret-jwt-key

# Base de données
DATABASE_URL=your-database-connection-string

# MEGA Storage
MEGA_EMAIL=your-mega-email@example.com
MEGA_PASSWORD=your-mega-password
```

### Installation

```bash
cd netlify
npm install
```

## 🛡️ Sécurité

### Authentification JWT
Toutes les routes (sauf GET publiques et auth) nécessitent un token JWT dans l'en-tête :
```
Authorization: Bearer <your-jwt-token>
```

### CORS
Les fonctions supportent CORS pour les requêtes cross-origin avec les domaines autorisés.

### Validation des données
- Validation des entrées utilisateur
- Sanitisation des paramètres de requête
- Vérification des permissions d'accès aux documents

## 📊 Exemples d'utilisation

### Connexion
```javascript
const response = await fetch('/.netlify/functions/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token, user } = await response.json();
```

### Upload de document
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('name', 'Mon document');
formData.append('category', 'important');
formData.append('tags', 'pdf,contract');

const response = await fetch('/.netlify/functions/documents', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Recherche
```javascript
const response = await fetch('/.netlify/functions/search/search?q=contrat&category=legal', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { results } = await response.json();
```

## 🏗️ Architecture

### Services utilisés
- **DocumentService** - Gestion des documents
- **UserService** - Gestion des utilisateurs
- **SearchService** - Recherche et indexation
- **TagService** - Gestion des tags
- **StatsService** - Statistiques et analytics
- **BackupService** - Sauvegarde et restauration
- **MegaStorageService** - Stockage des fichiers
- **LogService** - Journalisation

### Base de données
Utilise Prisma ORM avec SQLite pour le développement et PostgreSQL pour la production.

### Stockage des fichiers
Les fichiers sont stockés sur MEGA.nz via l'API MegaJS pour une solution gratuite et sécurisée.

## 🐛 Gestion des erreurs

Les fonctions retournent des codes d'erreur HTTP appropriés :
- **400** - Requête invalide
- **401** - Non authentifié
- **403** - Accès refusé
- **404** - Ressource non trouvée
- **500** - Erreur serveur

Format de réponse d'erreur :
```json
{
  "error": "Message d'erreur",
  "details": "Détails supplémentaires (optionnel)"
}
```

## 📝 Logs

Toutes les opérations importantes sont loggées via le LogService pour audit et debugging.

## 🚀 Déploiement

Les fonctions sont automatiquement déployées sur Netlify lors du push sur la branche principale.

Pour tester localement :
```bash
netlify dev
```
