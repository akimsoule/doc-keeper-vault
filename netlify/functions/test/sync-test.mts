import { Context } from '@netlify/functions';

// Test de l'endpoint de synchronisation MEGA
// Ce fichier peut être utilisé pour tester manuellement l'endpoint

const testSyncEndpoint = async () => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-app.netlify.app' 
    : 'http://localhost:8888';

  // Token JWT à remplacer par un vrai token pour les tests
  const testToken = 'your-test-jwt-token';

  try {
    console.log('🧪 Test de l\'endpoint de synchronisation MEGA...');
    
    const response = await fetch(`${baseUrl}/.netlify/functions/documents/sync-mega`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        folderId: undefined // Optionnel: ID du dossier MEGA
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Synchronisation réussie!');
      console.log(`📊 Résultats:
        - Nouveaux documents: ${result.syncedCount}
        - Documents mis à jour: ${result.updatedCount}
        - Message: ${result.message}
      `);
      
      if (result.newDocuments.length > 0) {
        console.log('📄 Nouveaux documents:');
        result.newDocuments.forEach((doc: any) => {
          console.log(`  - ${doc.name} (${doc.category}, ${doc.size} bytes)`);
        });
      }
      
      if (result.updatedDocuments.length > 0) {
        console.log('🔄 Documents mis à jour:');
        result.updatedDocuments.forEach((doc: any) => {
          console.log(`  - ${doc.name} (${doc.category}, ${doc.size} bytes)`);
        });
      }
    } else {
      console.error('❌ Erreur de synchronisation:', result.error || result.message);
    }

  } catch (error) {
    console.error('💥 Erreur réseau:', error);
  }
};

// Test de l'endpoint documents standard
const testDocumentsEndpoint = async () => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-app.netlify.app' 
    : 'http://localhost:8888';

  try {
    console.log('🧪 Test de l\'endpoint documents...');
    
    const response = await fetch(`${baseUrl}/.netlify/functions/documents`);
    const result = await response.json();

    if (response.ok) {
      console.log('✅ Récupération des documents réussie!');
      console.log(`📊 ${result.documents?.length || 0} documents trouvés`);
    } else {
      console.error('❌ Erreur:', result.error);
    }

  } catch (error) {
    console.error('💥 Erreur réseau:', error);
  }
};

// Fonction pour tester la fonctionnalité complète
const runTests = async () => {
  console.log('🚀 Démarrage des tests d\'API...\n');
  
  await testDocumentsEndpoint();
  console.log('\n---\n');
  await testSyncEndpoint();
  
  console.log('\n✨ Tests terminés!');
};

// Exporter les fonctions pour utilisation dans d'autres contextes
export { testSyncEndpoint, testDocumentsEndpoint, runTests };

// Si exécuté directement (pour tests en développement)
if (require.main === module) {
  runTests();
}
