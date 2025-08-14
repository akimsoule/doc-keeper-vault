import { PrismaClient } from '@prisma/client';
import { MegaStorageService } from '../netlify/doc.core/services/megaStorage.js';

const prisma = new PrismaClient();
const megaStorageService = new MegaStorageService();

/**
 * Script de migration pour déplacer les fichiers existants vers les dossiers utilisateur
 * ⚠️ SCRIPT OBSOLÈTE : Le système de dossiers utilisateur a été retiré
 * Ce script est conservé pour référence historique mais ne doit plus être utilisé
 */
export async function migrateFilesToUserFolders() {
  console.log('🚀 Début de la migration des fichiers vers les dossiers utilisateur...');
  
  try {
    // Récupérer tous les documents avec leurs propriétaires
    const documents = await prisma.document.findMany({
      include: { 
        owner: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`📄 ${documents.length} documents trouvés à migrer`);

    let successCount = 0;
    let errorCount = 0;

    for (const doc of documents) {
      try {
        console.log(`📤 Migration de "${doc.name}" pour ${doc.owner.email}...`);
        
        // Télécharger le fichier existant (sans vérification pour éviter les erreurs de clé)
        const fileContent = await megaStorageService.downloadFileUnsafe(doc.fileId);
        
        // Déterminer le type MIME basé sur le nom du fichier
        const fileExtension = doc.name.split('.').pop()?.toLowerCase() || '';
        const mimeType = megaStorageService.getMimeType(fileExtension);
        
        // Re-uploader dans le dossier utilisateur
        const newFileId = await megaStorageService.uploadFile(
          doc.name,
          mimeType,
          fileContent,
          doc.ownerId
        );
        
        // Mettre à jour la base de données
        await prisma.document.update({
          where: { id: doc.id },
          data: { fileId: newFileId }
        });
        
        // Supprimer l'ancien fichier (avec gestion d'erreur pour éviter d'interrompre la migration)
        try {
          await megaStorageService.deleteFile(doc.fileId);
        } catch (deleteError) {
          console.warn(`⚠️ Impossible de supprimer l'ancien fichier ${doc.fileId}:`, deleteError);
        }
        
        successCount++;
        console.log(`✅ "${doc.name}" migré avec succès (${successCount}/${documents.length})`);
        
        // Petite pause pour éviter de surcharger MEGA
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur lors de la migration de "${doc.name}":`, error);
        
        // Continuer avec le document suivant même en cas d'erreur
        continue;
      }
    }

    console.log(`\n🎉 Migration terminée !`);
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log(`\n⚠️ ${errorCount} document(s) n'ont pas pu être migrés. Vérifiez les logs ci-dessus.`);
    }

  } catch (error) {
    console.error('💥 Erreur critique lors de la migration:', error);
    throw error;
  } finally {
    await megaStorageService.disconnect();
    await prisma.$disconnect();
  }
}

/**
 * Script pour vérifier l'état de la migration
 */
export async function checkMigrationStatus() {
  console.log('🔍 Vérification de l\'état de la migration...');
  
  try {
    const documents = await prisma.document.findMany({
      include: { 
        owner: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    console.log(`📊 Analyse de ${documents.length} documents`);
    
    // Grouper par utilisateur
    const userStats = new Map<string, {
      email: string;
      count: number;
      files: string[];
    }>();

    for (const doc of documents) {
      const userId = doc.ownerId;
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          email: doc.owner.email,
          count: 0,
          files: []
        });
      }
      
      const stats = userStats.get(userId)!;
      stats.count++;
      stats.files.push(doc.name);
    }

    console.log('\n📈 Répartition par utilisateur:');
    userStats.forEach((stats, userId) => {
      console.log(`  👤 ${stats.email} (${userId}): ${stats.count} fichier(s)`);
      stats.files.forEach(fileName => {
        console.log(`    📄 ${fileName}`);
      });
    });

    // Vérifier les dossiers MEGA - FONCTIONNALITÉ SUPPRIMÉE
    console.log('\n⚠️ Vérification des dossiers MEGA désactivée (système de dossiers utilisateur retiré)');
    
    /*
    // CODE OBSOLÈTE - conservé pour référence
    const verificationPromises = Array.from(userStats.entries()).map(async ([userId, stats]) => {
      try {
        const userFiles = await megaStorageService.listUserFiles(userId);
        console.log(`  📁 user_${userId}: ${userFiles.length} fichier(s) dans MEGA`);
        
        if (userFiles.length !== stats.count) {
          console.warn(`    ⚠️ Incohérence: ${stats.count} en DB vs ${userFiles.length} dans MEGA`);
        }
      } catch (error) {
        console.error(`    ❌ Erreur lors de la vérification du dossier user_${userId}:`, error);
      }
    });
    
    await Promise.all(verificationPromises);
    */

  } catch (error) {
    console.error('💥 Erreur lors de la vérification:', error);
    throw error;
  } finally {
    await megaStorageService.disconnect();
    await prisma.$disconnect();
  }
}

// Script exécutable
const isMainModule = process.argv[1] === new URL(import.meta.url).pathname;

if (isMainModule) {
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      migrateFilesToUserFolders()
        .then(() => console.log('Migration terminée'))
        .catch(error => {
          console.error('Erreur de migration:', error);
          process.exit(1);
        });
      break;
      
    case 'check':
      checkMigrationStatus()
        .then(() => console.log('Vérification terminée'))
        .catch(error => {
          console.error('Erreur de vérification:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npm run tsx -- z_script/migrate-mega-folders.ts migrate');
      console.log('  npm run tsx -- z_script/migrate-mega-folders.ts check');
      break;
  }
}
