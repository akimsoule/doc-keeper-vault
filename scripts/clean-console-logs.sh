#!/bin/bash

# Script de nettoyage des console.log de développement
# Garde seulement les console.error et console.warn pour la gestion d'erreurs

echo "🧹 Nettoyage des console.log de développement..."

# Fichiers à nettoyer
declare -a files=(
    "netlify/files.core/src/services/megaStorage.ts"
    "netlify/files.core/src/services/documentService.ts"
)

for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "  🔧 Nettoyage de $file..."
        
        # Supprimer les console.log avec emojis de développement (garder les erreurs/warn)
        sed -i '' '/console\.log.*📁\|console\.log.*✅\|console\.log.*🗑️\|console\.log.*🔄\|console\.log.*🔍\|console\.log.*📄\|console\.log.*✨\|console\.log.*🎉\|console\.log.*⬇️\|console\.log.*📋/d' "$file"
        
        # Supprimer les console.log isolés simples (pas d'erreur)
        sed -i '' '/^\s*console\.log([^;]*);$/d' "$file"
    else
        echo "  ⚠️ Fichier non trouvé : $file"
    fi
done

echo "✅ Nettoyage terminé !"
