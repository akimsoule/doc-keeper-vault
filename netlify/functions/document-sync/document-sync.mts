import 'dotenv/config';
import { Handler } from '@netlify/functions';
import { withAuth, AuthContext, errorResponse, successResponse } from '../utils/middleware';
import { documentService, megaStorageService, logService } from '../../doc.core/beans';
import prisma from '../../doc.core/services/database';

/**
 * Interface représentant un fichier MEGA
 */
interface MegaFile {
  nodeId?: string;
  name?: string;
  size?: number;
  parent?: any;
  directory?: boolean;
  [key: string]: unknown;
}

/**
 * Fonction qui synchronise les fichiers ajoutés directement dans MEGA avec la base de données
 */
const handler: Handler = withAuth(async (event, context) => {
  const ownerId = (context as AuthContext).userId as string;
  
  if (!ownerId) {
    return errorResponse(401, 'Non autorisé');
  }

  try {
    // Définir l'utilisateur courant pour MEGA
    megaStorageService.setCurrentUser(ownerId);
    
    // Récupérer la liste des fichiers dans MEGA
    const megaFiles = await getMegaFiles(megaStorageService);
    if (!megaFiles || megaFiles.length === 0) {
      return successResponse({
        message: 'Aucun fichier trouvé dans MEGA',
        syncedFiles: 0
      });
    }

    // Récupérer tous les documents de l'utilisateur dans la base de données
    const dbDocuments = await prisma.document.findMany({
      where: { ownerId },
      select: { id: true, fileId: true, name: true }
    });

    // Identifier les fichiers à synchroniser (présents dans MEGA mais pas dans la base de données)
    const knownFileIds = new Set(dbDocuments.map(doc => doc.fileId));
    const filesToSync = megaFiles.filter((file: MegaFile) => !knownFileIds.has(file.nodeId || ''));
    
    if (filesToSync.length === 0) {
      return successResponse({
        message: 'Tous les fichiers sont déjà synchronisés',
        syncedFiles: 0
      });
    }

    // Synchroniser chaque fichier
    let syncCount = 0;
    for (const file of filesToSync) {
      if (!file.nodeId || file.directory) continue;
      
      try {
        // Créer le document dans la base de données
        const document = await prisma.document.create({
          data: {
            name: file.name || `Document sans nom (${new Date().toLocaleString()})`,
            type: detectFileType(file.name || ''),
            category: 'Non classé',
            size: file.size || 0,
            description: `Document importé automatiquement depuis MEGA le ${new Date().toLocaleString()}`,
            tags: ['import-auto', 'mega-sync'],
            fileId: file.nodeId,
            ownerId: ownerId,
          }
        });

        // Créer le log d'activité
        await logService.log({
          action: "DOCUMENT_SYNC" as any, // Cast temporaire jusqu'à ce que le type soit propagé
          entity: "DOCUMENT",
          entityId: document.id,
          userId: ownerId,
          documentId: document.id,
          details: `Document synchronisé depuis MEGA: ${document.name}`,
        });

        syncCount++;
      } catch (error) {
        console.error(`Erreur lors de la synchronisation du fichier ${file.name}:`, error);
        // Continuer avec le fichier suivant
      }
    }

    return successResponse({
      message: `${syncCount} fichier(s) synchronisé(s) depuis MEGA`,
      syncedFiles: syncCount
    });

  } catch (err: unknown) {
    console.error('Erreur lors de la synchronisation des documents:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    return errorResponse(500, errorMessage);
  }
});

/**
 * Récupère la liste des fichiers depuis MEGA
 */
async function getMegaFiles(megaStorageService: any): Promise<MegaFile[]> {
  try {
    const storage = await megaStorageService.getStorage();
    if (!storage) return [];
    
    // Convertir la structure de données MEGA en tableau
    const files: MegaFile[] = [];
    for (const file of storage) {
      if (file) {
        files.push(file as MegaFile);
      }
    }
    
    return files;
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers MEGA:', error);
    return [];
  }
}

/**
 * Détecte le type de fichier en fonction de l'extension
 */
function detectFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (!ext) return 'document';
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
      return 'image';
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'document';
    case 'xls':
    case 'xlsx':
    case 'csv':
      return 'spreadsheet';
    case 'txt':
    case 'md':
      return 'texte';
    default:
      return 'document';
  }
}

export { handler };
