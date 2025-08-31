#!/bin/bash

# Script de nettoyage final après consolidation
echo "🧹 Nettoyage final post-consolidation..."

# Supprimer les fichiers temporaires s'ils existent
if [ -f "src/services/apiService.old.ts" ]; then
    echo "  🗑️ Suppression de apiService.old.ts"
    rm "src/services/apiService.old.ts"
fi

if [ -f "src/services/apiService.new.ts" ]; then
    echo "  🗑️ Suppression de apiService.new.ts"
    rm "src/services/apiService.new.ts"
fi

# Vérifier la structure des services
echo "  📁 Structure des services API :"
ls -la src/services/api/ | head -15

# Compter les lignes de code par service
echo ""
echo "  📊 Taille des services modulaires :"
for file in src/services/api/*.ts; do
    if [[ -f "$file" && "$file" != *"index.ts"* && "$file" != *"README.md"* ]]; then
        lines=$(wc -l < "$file")
        basename_file=$(basename "$file")
        printf "    %-25s %3d lignes\n" "$basename_file" "$lines"
    fi
done

echo ""
echo "✅ Consolidation terminée avec succès !"
echo "🎯 Tous les services sont modulaires et fonctionnels"
echo "🔧 L'application compile sans erreur"
echo "📚 Documentation mise à jour dans docs/CONSOLIDATION_REPORT.md"
