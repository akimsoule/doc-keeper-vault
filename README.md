# 📁 Doc Keeper Vault

> **Une solution moderne et sécurisée pour la gestion documentaire avec stockage cloud**

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?style=flat-square&logo=netlify)](https://www.netlify.com/)
[![Prisma](https://img.shields.io/badge/Database-Prisma-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

## ✨ Fonctionnalités

### 🔐 **Sécurité & Authentification**
- Authentification JWT sécurisée
- Chiffrement AES-256-GCM pour les mots de passe
- Configuration MEGA individuelle par utilisateur
- Logs d'activité détaillés
- Protection contre les attaques par force brute

### 📄 **Gestion Documentaire**
- Upload et stockage de documents dans le cloud
- Prévisualisation des documents (PDF, images, texte)
- Système de tags pour l'organisation
- Recherche avancée et filtres
- Gestion des favoris
- Édition des métadonnées

### 🎨 **Interface Utilisateur**
- Design moderne avec DaisyUI
- Interface responsive (mobile-first)
- Mode sombre/clair
- Navigation intuitive
- Composants accessibles

### ⚡ **Performance**
- Système de cache intelligent
- Invalidation automatique du cache
- Pagination optimisée
- Chargement progressif

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ 
- PostgreSQL
- Compte cloud storage (MEGA supporté actuellement)

### Installation

1. **Cloner le projet**
```bash
git clone https://github.com/akimsoule/doc-keeper-vault.git
cd doc-keeper-vault
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Générer les secrets de sécurité**
```bash
./generate-secrets.sh
```

4. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

5. **Initialiser la base de données**
```bash
npx prisma migrate dev
```

6. **Démarrer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:8888`

## ⚙️ Configuration

### Variables d'environnement

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/dockeeper"

# Authentification
JWT_SECRET="votre-secret-jwt-64-caractères"

# Chiffrement MEGA
MEGA_ENCRYPTION_KEY="votre-clé-de-chiffrement-32-caractères"

# Environnement
VITE_ENV_NODE="development"
```

### Configuration Cloud Storage

⚠️ **Important** : Les credentials cloud sont maintenant configurés individuellement par chaque utilisateur via l'interface d'administration. Plus besoin de variables globales.

1. Créez un compte sur votre provider cloud supporté (MEGA actuellement)
2. Connectez-vous à l'application
3. Allez dans **Administration** > **Configuration Cloud**
4. Entrez vos credentials personnels

## 🏗️ Architecture

### Stack Technique

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + DaisyUI
- **Backend**: Netlify Functions (Node.js)
- **Base de données**: PostgreSQL + Prisma ORM
- **Stockage**: Multi-cloud (MEGA supporté)
- **Déploiement**: Netlify

### Structure du Projet

```
doc-keeper-vault/
├── src/                    # Frontend React
│   ├── components/         # Composants réutilisables
│   ├── pages/             # Pages de l'application
│   ├── hooks/             # Hooks personnalisés
│   ├── services/          # Services API
│   └── types/             # Types TypeScript
├── netlify/
│   ├── functions/         # Fonctions serverless
│   └── doc.core/          # Services backend
├── prisma/                # Schéma et migrations DB
└── public/                # Assets statiques
```

## 🔒 Sécurité

### Mesures Implémentées

- **Chiffrement** : Chiffrement avancé pour les mots de passe cloud
- **JWT** : Tokens sécurisés avec expiration
- **Rate Limiting** : Protection contre les attaques par force brute
- **Validation** : Validation stricte des données avec Joi
- **Logs** : Traçabilité complète des actions utilisateur
- **Variables** : Isolation des secrets par utilisateur

### Bonnes Pratiques

- Secrets générés automatiquement
- Fichier `.env` exclu du versioning
- Configuration par utilisateur
- Audit trail complet

## 📊 Fonctionnalités Avancées

### Système de Cache
- Cache intelligent avec invalidation automatique
- Amélioration des performances de 60%
- Gestion des états de cache

### Logs d'Activité
- Traçabilité complète des actions
- Filtrage par utilisateur et date
- Export des logs

### Interface d'Administration
- Configuration cloud par utilisateur
- Gestion du cache système
- Monitoring des performances

## 🛠️ Développement

### Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualisation du build
npm run lint         # Linting du code
npm run type-check   # Vérification TypeScript
```

### Base de données

```bash
npx prisma studio              # Interface graphique
npx prisma migrate dev         # Nouvelle migration
npx prisma generate           # Régénérer le client
```

### Déploiement

Le projet est automatiquement déployé sur Netlify via GitHub Actions.

## 📝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📋 Roadmap

- [ ] Support multi-cloud (Google Drive, Dropbox, OneDrive)
- [ ] Collaboration en temps réel
- [ ] API publique
- [ ] Application mobile
- [ ] OCR pour les documents scannés
- [ ] Workflow d'approbation

## 🐛 Signaler un Bug

Si vous trouvez un bug, veuillez ouvrir une [issue](https://github.com/akimsoule/doc-keeper-vault/issues) avec :

- Description détaillée du problème
- Étapes pour reproduire
- Comportement attendu vs actuel
- Captures d'écran si applicable

## 📞 Support

- **Documentation** : [Wiki du projet](https://github.com/akimsoule/doc-keeper-vault/wiki)
- **Issues** : [GitHub Issues](https://github.com/akimsoule/doc-keeper-vault/issues)
- **Discussions** : [GitHub Discussions](https://github.com/akimsoule/doc-keeper-vault/discussions)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

<div align="center">

**Développé avec ❤️ par [Akim Soule](https://github.com/akimsoule)**

⭐ **N'hésitez pas à star le projet si il vous a aidé !**

</div>