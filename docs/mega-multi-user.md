# Configuration MEGA Multi-Utilisateur

Cette fonctionnalité permet à chaque utilisateur de configurer ses propres identifiants MEGA de manière sécurisée et isolée.

## Vue d'ensemble

### Problème résolu
Avant cette implémentation, tous les utilisateurs partageaient la même configuration MEGA globale. Maintenant, chaque utilisateur peut utiliser son propre compte MEGA.

### Avantages
- **Isolation** : Chaque utilisateur accède uniquement à ses propres fichiers MEGA
- **Sécurité** : Les identifiants sont chiffrés avec AES-256-GCM
- **Flexibilité** : Support de multiples comptes MEGA
- **Confidentialité** : Aucun partage d'identifiants entre utilisateurs

## Architecture

### Base de données
```sql
-- Nouvelle table UserMegaConfig
model UserMegaConfig {
  id                String   @id @default(cuid())
  userId            String   @unique
  encryptedEmail    String
  encryptedPassword String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Services

#### 1. EncryptionService
- **Localisation** : `netlify/files.core/src/services/encryptionService.ts`
- **Fonction** : Chiffrement/déchiffrement AES-256-GCM
- **Sécurité** : Clé dérivée de `ENCRYPTION_KEY` + sel aléatoire

```typescript
// Utilisation
const encryptionService = new EncryptionService();
const encrypted = encryptionService.encrypt('mot-de-passe');
const decrypted = encryptionService.decrypt(encrypted);
```

#### 2. UserMegaConfigService
- **Localisation** : `netlify/files.core/src/services/userMegaConfigService.ts`
- **Fonction** : CRUD pour les configurations MEGA par utilisateur
- **Méthodes** :
  - `createUserMegaConfig(userId, config)`
  - `getUserMegaConfig(userId)`
  - `getUserMegaCredentials(userId)` - retourne les identifiants déchiffrés
  - `updateUserMegaConfig(userId, config)`
  - `deleteUserMegaConfig(userId)`

#### 3. MegaStorage (modifié)
- **Localisation** : `netlify/files.core/src/services/megaStorage.ts`
- **Changements** : Toutes les méthodes acceptent maintenant un `userId`
- **Fonctionnement** : Récupère automatiquement les identifiants de l'utilisateur

```typescript
// Avant
await megaStorageService.uploadFile(name, mimeType, buffer);

// Après
await megaStorageService.uploadFile(name, mimeType, buffer, folderId, userId);
```

### API

#### Endpoint : `/.netlify/functions/user-mega-config`

**GET** - Récupérer la configuration
```bash
curl -H "Authorization: Bearer $TOKEN" \
     "/.netlify/functions/user-mega-config"
```

**POST** - Créer une configuration
```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email": "user@mega.nz", "password": "password"}' \
     "/.netlify/functions/user-mega-config"
```

**PUT** - Mettre à jour une configuration
```bash
curl -X PUT \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email": "new@mega.nz", "password": "newpassword"}' \
     "/.netlify/functions/user-mega-config"
```

**DELETE** - Supprimer une configuration
```bash
curl -X DELETE \
     -H "Authorization: Bearer $TOKEN" \
     "/.netlify/functions/user-mega-config"
```

**GET** avec `?action=test` - Tester la connexion
```bash
curl -H "Authorization: Bearer $TOKEN" \
     "/.netlify/functions/user-mega-config?action=test"
```

### Interface utilisateur

#### Composant : MegaConfigurationSettings
- **Localisation** : `src/components/MegaConfigurationSettings.tsx`
- **Intégration** : Onglet "MEGA" dans la page Profil
- **Fonctionnalités** :
  - Formulaire de configuration
  - Test de connexion
  - Masquage/affichage du mot de passe
  - Suppression de configuration
  - Notifications utilisateur

## Migration

### Étapes de migration appliquées

1. **Base de données**
   ```bash
   npx prisma migrate dev --name add_user_mega_config
   ```

2. **Services backend**
   - Création d'`EncryptionService`
   - Création d'`UserMegaConfigService`
   - Modification de `MegaStorage` pour support multi-utilisateur
   - Mise à jour de `DocumentService` et `BackupService`

3. **API**
   - Création de l'endpoint `user-mega-config.mts`

4. **Frontend**
   - Création du composant `MegaConfigurationSettings`
   - Intégration dans `ProfilePage`
   - Ajout du hook `useToast` (compatible avec le système existant)

## Configuration requise

### Variables d'environnement
```bash
# Clé de chiffrement pour les identifiants MEGA
ENCRYPTION_KEY=your-secret-encryption-key-32-chars

# Variables Prisma existantes
DATABASE_URL=postgresql://...
```

### Prérequis
- PostgreSQL avec schéma migré
- Variables d'environnement configurées
- Accounts MEGA valides pour les utilisateurs

## Tests

### Tests automatisés

1. **Test des services**
   ```bash
   node scripts/test-user-mega.js
   ```

2. **Test de l'API**
   ```bash
   node scripts/test-api-mega.js
   ```

### Tests manuels

1. **Interface utilisateur**
   - Naviguer vers Profil > MEGA
   - Créer une configuration
   - Tester la connexion
   - Modifier la configuration
   - Supprimer la configuration

2. **Isolation multi-utilisateur**
   - Créer deux comptes utilisateur
   - Configurer différents comptes MEGA
   - Vérifier l'isolation des fichiers

## Sécurité

### Chiffrement
- **Algorithme** : AES-256-GCM
- **Clé** : Dérivée de `ENCRYPTION_KEY` + sel unique par utilisateur
- **IV** : Aléatoire pour chaque chiffrement
- **Intégrité** : Tag d'authentification GCM

### Stockage
- Identifiants jamais stockés en clair
- Clés de dérivation uniques par utilisateur
- Suppression en cascade lors de suppression d'utilisateur

### Transmission
- HTTPS uniquement en production
- Tokens JWT pour l'authentification
- Pas d'exposition des identifiants dans les logs

## Monitoring

### Logs
```javascript
// Logs de configuration MEGA
console.log('🔐 Configuration MEGA créée pour utilisateur:', userId);
console.log('🔄 Configuration MEGA mise à jour pour utilisateur:', userId);
console.log('🗑️ Configuration MEGA supprimée pour utilisateur:', userId);
```

### Métriques
- Nombre de configurations MEGA actives
- Taux de réussite des tests de connexion
- Erreurs de chiffrement/déchiffrement

## Dépannage

### Erreurs communes

1. **"ENCRYPTION_KEY not configured"**
   - Vérifier la variable d'environnement `ENCRYPTION_KEY`
   - S'assurer qu'elle fait au moins 32 caractères

2. **"Failed to decrypt credentials"**
   - Vérifier que `ENCRYPTION_KEY` n'a pas changé
   - Supprimer et recréer la configuration si nécessaire

3. **"MEGA login failed"**
   - Vérifier les identifiants MEGA
   - Tester manuellement sur mega.nz

4. **"User not found"**
   - Vérifier l'authentification JWT
   - S'assurer que l'utilisateur existe

### Debugging

```bash
# Activer les logs détaillés
DEBUG=mega:* npm run dev

# Vérifier le statut des migrations
npx prisma migrate status

# Tester la connectivité base de données
npx prisma db seed --preview-feature
```

## Roadmap

### Fonctionnalités futures
- [ ] Import/export de configurations
- [ ] Support de clés API MEGA
- [ ] Partage temporaire entre utilisateurs
- [ ] Backup automatique des configurations
- [ ] Interface d'administration
- [ ] Audit des accès MEGA

### Améliorations
- [ ] Cache des connexions MEGA
- [ ] Compression des fichiers
- [ ] Synchronisation incrémentale
- [ ] Notification d'expiration de session
