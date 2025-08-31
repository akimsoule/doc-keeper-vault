#!/bin/bash

# Script de vérification de la conformité aux thèmes DaisyUI
echo "🎨 Vérification de la conformité aux thèmes DaisyUI..."

# Patterns à rechercher (non conformes)
declare -a old_patterns=(
    "text-gray-900 dark:text-white"
    "text-gray-500 dark:text-gray-400"
    "text-gray-600 dark:text-gray-400"
    "bg-white dark:bg-gray-800"
    "border-gray-200 dark:border-gray-700"
    "border-gray-300 dark:border-gray-600"
    "hover:bg-gray-100 dark:hover:bg-gray-700"
    "bg-blue-600.*text-white"
    "text-blue-600"
)

# Patterns conformes DaisyUI
declare -a new_patterns=(
    "text-base-content"
    "text-base-content/60"
    "text-base-content/70"
    "bg-base-100"
    "border-base-300"
    "border-base-content/20"
    "btn btn-ghost"
    "btn btn-primary"
    "btn-outline"
)

echo "❌ Patterns non conformes trouvés :"
found_issues=false

for pattern in "${old_patterns[@]}"; do
    matches=$(grep -r --include="*.tsx" --include="*.ts" "$pattern" src/components/ src/pages/ 2>/dev/null || true)
    if [[ -n "$matches" ]]; then
        echo "  🔸 $pattern :"
        echo "$matches" | head -3 | sed 's/^/    /'
        found_issues=true
    fi
done

if [[ "$found_issues" = false ]]; then
    echo "  ✅ Aucun pattern non conforme trouvé !"
fi

echo ""
echo "✅ Patterns conformes trouvés :"
for pattern in "${new_patterns[@]}"; do
    count=$(grep -r --include="*.tsx" --include="*.ts" "$pattern" src/components/ src/pages/ 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$count" -gt 0 ]]; then
        echo "  ✓ $pattern : $count occurrences"
    fi
done

echo ""
echo "🎯 Recommandations :"
echo "  • Utilisez text-base-content au lieu de text-gray-900 dark:text-white"
echo "  • Utilisez text-base-content/60 pour le texte secondaire"
echo "  • Utilisez bg-base-100 pour les arrière-plans"
echo "  • Utilisez btn btn-primary/secondary/outline pour les boutons"
echo "  • Utilisez card bg-base-100 pour les cartes"
echo "  • Utilisez border-base-300 pour les bordures"

echo ""
echo "✨ Vérification terminée !"
