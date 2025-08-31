// Test de vérification des événements tactiles sur mobile
// À exécuter dans la console du navigateur sur mobile

console.log('🔍 Test des événements tactiles sur FolderCard');

// Vérifier si nous sommes sur un appareil tactile
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
console.log('📱 Appareil tactile détecté:', isTouchDevice);

// Vérifier la media query hover
const hasHover = window.matchMedia('(hover: hover)').matches;
console.log('🖱️ Support hover détecté:', hasHover);

// Test des éléments FolderCard
const folderCards = document.querySelectorAll('.card.cursor-pointer');
console.log('📁 Nombre de FolderCard trouvées:', folderCards.length);

// Vérifier les gestionnaires d'événements
folderCards.forEach((card, index) => {
  const hasClickListener = card.onclick !== null;
  const hasDoubleClickListener = card.ondblclick !== null;
  
  console.log(`📄 FolderCard ${index + 1}:`, {
    hasClick: hasClickListener,
    hasDoubleClick: hasDoubleClickListener,
    className: card.className
  });
  
  // Vérifier le bouton menu
  const menuButton = card.querySelector('.btn-circle');
  if (menuButton) {
    const opacity = window.getComputedStyle(menuButton).opacity;
    console.log(`  🔘 Menu button opacity: ${opacity}`);
  }
});

// Tester l'ajout d'un event listener temporaire
if (folderCards.length > 0) {
  const firstCard = folderCards[0];
  const testClick = () => {
    console.log('✅ Test click fonctionnel sur FolderCard');
  };
  
  firstCard.addEventListener('click', testClick, { once: true });
  console.log('🧪 Event listener test ajouté à la première carte. Tapez dessus pour tester.');
}

// Instructions pour l'utilisateur
console.log(`
📝 Instructions de test:
1. Tapez sur une FolderCard
2. Vérifiez si elle s'ouvre
3. Tapez sur le bouton menu (⋮)
4. Vérifiez si le menu apparaît

🐛 Si rien ne se passe:
- Vérifiez la console pour les erreurs
- Vérifiez que les event listeners sont bien attachés
- Vérifiez les z-index et overlays qui pourraient bloquer les clics
`);
