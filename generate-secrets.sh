#!/bin/bash

# Script de génération de secrets sécurisés pour Doc Keeper Vault

echo "🔐 Génération des secrets de sécurité pour Doc Keeper Vault"
echo "============================================================="

# Générer un secret JWT fort
echo ""
echo "1. Secret JWT (à ajouter dans JWT_SECRET):"
openssl rand -hex 64

# Générer une clé de chiffrement pour le stockage cloud
echo ""
echo "2. Clé de chiffrement Cloud Storage (à ajouter dans CLOUD_ENCRYPTION_KEY):"
openssl rand -hex 32

# Générer un secret pour les sessions
echo ""
echo "3. Secret de session (optionnel):"
openssl rand -hex 32

echo ""
echo "✅ Secrets générés avec succès!"
echo ""
echo "📋 Instructions:"
echo "1. Copiez les secrets générés dans votre fichier .env"
echo "2. Assurez-vous que le fichier .env n'est PAS dans le contrôle de version"
echo "3. Configurez les variables d'environnement sur votre plateforme de déploiement"
echo "4. Pour la production, utilisez CLOUD_ENCRYPTION_KEY au lieu d'ENCRYPTION_KEY"
echo ""
echo "⚠️  IMPORTANT: Gardez ces secrets en sécurité et ne les partagez jamais!"
echo "⚠️  NOTE: Chaque utilisateur configurera ses propres credentials cloud dans l'interface d'administration"
