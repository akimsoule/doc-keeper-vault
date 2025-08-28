# Prompt GitHub Copilot – Dashboard mobile-first sécurisé avec UX améliorée et cache API

Génère un dashboard pour mon application avec **Vite + React + TypeScript** et **DaisyUI**.  
L’interface doit être **optimisée pour mobile (mobile-first)**, puis responsive pour tablette/desktop.  

## Contraintes de sécurité
- Intégrer une **authentification JWT sécurisée** (login, logout, récupération du token depuis le backend).  
- Ne pas stocker le token en clair dans `localStorage` → utiliser **httpOnly cookies** ou un contexte sécurisé.  
- Gérer le **rafraîchissement du token** si expiré.  
- N’afficher que les **messages pertinents** (erreurs d’authentification, succès, alertes de sécurité).  
- Ne jamais exposer de détails sensibles dans l’UI ou la console.  

## UI attendue (mobile-first)
- Utiliser **DaisyUI** pour les composants (navbar, drawer/sidebar, cards, alerts).  
- **Navigation mobile** :  
  - Navbar compacte en haut avec menu hamburger.  
  - Sidebar affichée comme un **drawer** qui s’ouvre depuis la gauche.  
- **Dashboard mobile** :  
  - Les cartes (stats, notifications) doivent s’empiler verticalement.  
  - Utiliser un **design simple et lisible sur petit écran** (taille de police adaptée, padding suffisant).  
- **Page Login** adaptée au mobile :  
  - Champs de formulaire bien espacés.  
  - Bouton de connexion large et accessible.  

## Workflow UX (expérience utilisateur)
1. **Connexion**  
   - L’utilisateur saisit son email + mot de passe.  
   - Afficher un **loader/spinner** pendant la vérification.  
   - En cas d’échec → afficher un **message clair** : *"Identifiants invalides, veuillez réessayer."*  
   - En cas de succès → **redirection automatique** vers le dashboard.  

2. **Navigation mobile**  
   - Navbar avec **menu hamburger** → ouvre le drawer/sidebar.  
   - Sections : *Dashboard*, *Profil*, *Paramètres*.  
   - La section active doit être **mise en évidence**.  

3. **Dashboard**  
   - Afficher des **cards verticales** avec animations légères (DaisyUI + transitions Tailwind).  
   - Exemple : *Utilisateurs actifs*, *Revenus*, *Dernières activités*.  
   - Ajouter une section "Notifications" affichant uniquement les messages pertinents.  

4. **Feedback utilisateur**  
   - Utiliser des **toasts DaisyUI** pour les confirmations (ex. : "Connexion réussie", "Déconnexion effectuée").  
   - Utiliser des **modals** pour les actions sensibles (ex. suppression de compte, logout).  

5. **Déconnexion**  
   - Bouton "Logout" clair dans le drawer.  
   - Demander une **confirmation via popup** avant de déconnecter.  
   - Rediriger vers la page Login avec un message *"Vous avez été déconnecté avec succès."*  

## Optimisation – Cache API
- Mettre en place un **cache local côté frontend** pour limiter les appels API.  
- Utiliser un **contexte global ou Zustand** pour stocker les données déjà chargées (ex. utilisateurs actifs, stats).  
- Définir une **durée d’expiration du cache** (ex. 5 minutes).  
- Si une donnée est présente en cache et valide → l’utiliser directement sans rappeler l’API.  
- Si la donnée est absente ou expirée → faire un nouvel appel API et mettre à jour le cache.  
- Optionnel : afficher un **spinner discret** pendant le rafraîchissement silencieux des données.  

## Architecture
- Utiliser **React Context API ou Zustand** pour la gestion globale de l’authentification et du cache.  
- Découper le code en composants lisibles et modulaires.  
- Respecter les bonnes pratiques de sécurité, de lisibilité, d’optimisation UX et **design mobile-first**.  
