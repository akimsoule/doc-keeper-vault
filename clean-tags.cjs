const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanTags() {
  try {
    console.log('🧹 Nettoyage des tags...');
    
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        tags: true
      }
    });
    
    for (const doc of documents) {
      let cleanTags = [];
      
      if (doc.tags && doc.tags.trim()) {
        // Nettoyer les tags malformés
        let tagsString = doc.tags;
        
        // Supprimer les crochets et guillemets en trop
        tagsString = tagsString.replace(/\[\[|\]\]|\[|\]/g, '');
        tagsString = tagsString.replace(/"/g, '');
        
        // Séparer par virgules et nettoyer
        cleanTags = tagsString.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag && tag !== 'nouveau'); // Supprimer les tags vides et "nouveau" malformé
        
        // Ajouter "nouveau" si c'était présent
        if (doc.tags.includes('nouveau')) {
          cleanTags.push('nouveau');
        }
        
        // Supprimer les doublons
        cleanTags = [...new Set(cleanTags)];
      }
      
      const newTagsString = cleanTags.join(',');
      
      await prisma.document.update({
        where: { id: doc.id },
        data: { tags: newTagsString }
      });
      
      console.log(`✅ Document ${doc.id}: "${doc.tags}" → "${newTagsString}"`);
    }
    
    console.log('✨ Nettoyage terminé !');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTags();
