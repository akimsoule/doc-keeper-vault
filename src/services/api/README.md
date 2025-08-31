# Architecture API Services - Documentation

## Vue d'ensemble

L'`apiService` a été refactorisé en une architecture modulaire pour améliorer la maintenabilité, la lisibilité et la réutilisabilité du code.

## Structure modulaire

### Services spécialisés

#### 1. **BaseApiService** (`api/baseService.ts`)
- Service de base pour tous les autres services
- Contient la logique commune : headers, gestion d'erreurs, authentification
- Toutes les autres services étendent cette classe

#### 2. **AuthService** (`api/authService.ts`)
- Gestion de l'authentification
- Méthodes : `login()`, `register()`, `refreshToken()`, `verifyToken()`

#### 3. **DocumentService** (`api/documentService.ts`)
- CRUD complet pour les documents
- Upload, téléchargement, synchronisation MEGA
- Gestion du cache des documents

#### 4. **FolderService** (`api/folderService.ts`)
- Gestion des dossiers hiérarchiques
- Navigation, création, déplacement de documents
- Gestion des chemins de dossiers

#### 5. **SearchService** (`api/searchService.ts`)
- Recherche simple et avancée
- Statistiques globales et utilisateur
- Activités récentes

#### 6. **TagFileService** (`api/tagFileService.ts`)
- Gestion des tags
- Téléchargement de fichiers avec cache
- Statistiques par tag

#### 7. **UserService** (`api/userService.ts`)
- Gestion du profil utilisateur
- Préférences utilisateur
- Suppression de compte

#### 8. **BackupMegaService** (`api/backupMegaService.ts`)
- Gestion des sauvegardes
- Configuration MEGA par utilisateur
- Test de connexion MEGA

### Service principal (`apiService.ts`)

Le service principal combine tous les services spécialisés et maintient une compatibilité avec l'ancienne API :

```typescript
// Utilisation modulaire (recommandée pour les nouveaux développements)
apiService.documents.getDocuments()
apiService.auth.login(email, password)
apiService.folders.createFolder(data)
apiService.backupMega.getMegaConfig()

// Utilisation compatible (pour la transition)
apiService.getDocuments()
apiService.login(email, password)
apiService.createFolder(data)
apiService.getMegaConfig()
```

## Avantages de cette architecture

### ✅ **Séparation des responsabilités**
- Chaque service a une responsabilité claire et définie
- Plus facile de localiser et modifier une fonctionnalité spécifique

### ✅ **Maintenabilité**
- Code plus court et plus lisible dans chaque fichier
- Moins de conflits lors du développement en équipe
- Tests unitaires plus faciles à écrire

### ✅ **Réutilisabilité**
- Services peuvent être utilisés indépendamment
- Possibilité d'importer seulement les services nécessaires

### ✅ **Extensibilité**
- Facile d'ajouter de nouveaux services
- Possibilité de personnaliser chaque service individuellement

### ✅ **Gestion du cache optimisée**
- Cache spécialisé par type de données
- Invalidation ciblée du cache

## Migration depuis l'ancien apiService

### Étapes de migration

1. **Remplacement automatique** : L'ancien apiService est conservé dans `apiService.old.ts`
2. **Compatibilité** : Toutes les méthodes existantes continuent de fonctionner
3. **Migration progressive** : Vous pouvez migrer vers la nouvelle API module par module

### Guide de migration

```typescript
// AVANT (ancien apiService)
import { apiService } from '../services/apiService';
const documents = await apiService.getDocuments();
const config = await apiService.getMegaConfig();

// APRÈS (nouveau apiService - compatible)
import { apiService } from '../services/apiService';
const documents = await apiService.getDocuments(); // Toujours compatible
const config = await apiService.getMegaConfig(); // Toujours compatible

// RECOMMANDÉ (nouvelle approche modulaire)
import { apiService } from '../services/apiService';
const documents = await apiService.documents.getDocuments();
const config = await apiService.backupMega.getMegaConfig();

// USAGE AVANCÉ (import direct des services)
import { DocumentService, BackupMegaService } from '../services/api';
const docService = new DocumentService();
const backupService = new BackupMegaService();
```

## Gestion des tokens

Le token d'authentification est automatiquement propagé à tous les services :

```typescript
apiService.setToken(token); // Tous les services reçoivent le token
apiService.clearToken();    // Tous les services perdent le token
```

## Performance et cache

- Chaque service gère son propre cache de manière optimisée
- Invalidation intelligente du cache lors des modifications
- Réduction de la duplication des données en cache

## Tests

Chaque service peut être testé indépendamment :

```typescript
// Test d'un service spécifique
import { DocumentService } from '../services/api/documentService';

const docService = new DocumentService();
docService.setToken('test-token');
// Tests unitaires...
```

## Compatibilité

- ✅ **100% compatible** avec l'existant
- ✅ Toutes les méthodes fonctionnent comme avant
- ✅ Aucune modification requise dans le code existant
- ✅ Migration progressive possible

---

*Cette nouvelle architecture prépare le code pour une évolutivité future tout en maintenant la stabilité de l'existant.*
