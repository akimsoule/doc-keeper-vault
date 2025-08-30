// Migration script: Convert archived property to tag
const { PrismaClient } = require('@prisma/client');

async function migrateArchivedToTag() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Migration des documents archivés vers le tag "archived"...');
    
    // Récupérer tous les documents archivés
    const archivedDocuments = await prisma.document.findMany({
      where: {
        archived: true
      }
    });
    
    console.log(`📄 ${archivedDocuments.length} documents archivés trouvés`);
    
    let migrated = 0;
    
    for (const doc of archivedDocuments) {
      // Ajouter le tag "archived" s'il n'existe pas déjà
      let currentTags = doc.tags || '';
      const tagsArray = currentTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      if (!tagsArray.includes('archived')) {
        tagsArray.push('archived');
        const newTags = tagsArray.join(',');
        
        await prisma.document.update({
          where: { id: doc.id },
          data: {
            tags: newTags
          }
        });
        
        console.log(`✅ Document ${doc.id}: "${doc.name}" → tags: [${newTags}]`);
        migrated++;
      } else {
        console.log(`⏭️ Document ${doc.id}: "${doc.name}" → déjà le tag "archived"`);
      }
    }
    
    console.log(`✨ Migration terminée ! ${migrated} documents mis à jour`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
if (require.main === module) {
  migrateArchivedToTag()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrateArchivedToTag };
