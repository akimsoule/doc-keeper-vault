const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateCategorToTags() {
  try {
    console.log('🚀 Migration des catégories vers les tags...');
    
    // Récupérer tous les documents avec leurs catégories
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        category: true,
        tags: true
      }
    });
    
    console.log(`📄 ${documents.length} documents trouvés`);
    
    for (const doc of documents) {
      let newTags = [];
      
      // Parser les tags existants
      if (doc.tags && doc.tags.trim()) {
        try {
          // Essayer de parser comme JSON d'abord (au cas où)
          if (doc.tags.startsWith('[')) {
            const parsed = JSON.parse(doc.tags);
            newTags = Array.isArray(parsed) ? parsed.flat() : [];
          } else {
            // Sinon, traiter comme chaîne séparée par des virgules
            newTags = doc.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          }
        } catch {
          // En cas d'erreur, traiter comme chaîne normale
          newTags = doc.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      }
      
      // Ajouter la catégorie comme tag si elle n'existe pas déjà
      if (doc.category && doc.category.trim() && !newTags.includes(doc.category)) {
        newTags.push(doc.category);
      }
      
      // Ajouter le tag "Archive" si le document est archivé
      const docDetails = await prisma.document.findUnique({
        where: { id: doc.id },
        select: { archived: true }
      });
      
      if (docDetails.archived && !newTags.includes('Archive')) {
        newTags.push('Archive');
      }
      
      // Mettre à jour les tags
      const tagsString = newTags.join(',');
      await prisma.document.update({
        where: { id: doc.id },
        data: { tags: tagsString }
      });
      
      console.log(`✅ Document ${doc.id}: "${doc.category}" → tags: [${newTags.join(', ')}]`);
    }
    
    console.log('✨ Migration terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCategorToTags();
