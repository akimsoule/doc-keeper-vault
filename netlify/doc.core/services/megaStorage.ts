import { Storage, verify } from 'megajs';
import { MegaConfigService } from './megaConfigService';

/**
 * Interface représentant un fichier MEGA après upload
 */
interface MegaFile {
  nodeId?: string;
  name?: string;
  size?: number;
  parent?: MegaFile;
  directory?: boolean;
  delete?: () => Promise<void>;
  [key: string]: unknown; // Pour les autres propriétés de l'API MEGA
}

/**
 * Service de gestion des fichiers sur MEGA
 */
export class MegaStorageService {
  private storage: Storage | undefined;
  private currentUserId: string | undefined;
  private megaConfigService: MegaConfigService;

  constructor() {
    this.megaConfigService = new MegaConfigService();
  }

  /**
   * Définit l'utilisateur courant pour utiliser sa configuration MEGA
   * @param userId - ID de l'utilisateur
   */
  setCurrentUser(userId: string): void {
    // Si on change d'utilisateur, fermer la connexion actuelle
    if (this.currentUserId !== userId && this.storage) {
      this.storage = undefined; // Forcer la reconnexion
    }
    this.currentUserId = userId;
  }

  /**
   * Initialise la connexion MEGA
   */
  private async getStorage(): Promise<Storage> {
    if (!this.storage) {
      // Vérifier qu'un utilisateur est défini
      if (!this.currentUserId) {
        throw new Error('Aucun utilisateur défini pour la connexion MEGA');
      }

      // Récupérer les identifiants MEGA de l'utilisateur
      const userCredentials = await this.megaConfigService.getMegaCredentials(this.currentUserId);
      if (!userCredentials) {
        throw new Error('Aucune configuration MEGA trouvée pour cet utilisateur. Veuillez configurer vos identifiants MEGA dans les paramètres.');
      }

      this.storage = await new Storage({ 
        email: userCredentials.email, 
        password: userCredentials.password 
      }).ready;
    }
    return this.storage;
  }

  /**
   * Nettoie le cache des dossiers utilisateur
   * Utile en cas de changement dans la structure MEGA
   */
  clearUserFoldersCache(): void {
    // Méthode conservée pour compatibilité mais ne fait plus rien
  }

  /**
   * Ferme la connexion MEGA
   * Utile pour s'assurer que les scripts se terminent proprement
   */
  async disconnect(): Promise<void> {
    if (this.storage) {
      try {
        // Fermer la connexion MEGA si elle existe
        await this.storage.close?.();
      } catch (error) {
        console.warn('Erreur lors de la fermeture de la connexion MEGA:', error);
      } finally {
        this.storage = undefined;
      }
    }
  }

  /**
   * Génère une URL de téléchargement temporaire pour un fichier
   * @param fileId - L'ID du fichier sur MEGA
   * @returns Une URL temporaire valide pendant 1 heure
   */
  async getFileUrl(fileId: string): Promise<string> {
    const storage = await this.getStorage();
    const file = storage.find(f => f.nodeId === fileId);
    if (!file) throw new Error('Fichier non trouvé');
    
    // Génère une URL temporaire valide pendant 1 heure
    return await file.link({
      // noExpire: false,
      // expiry: 3600 // 1 heure
    });
  }

  /**
   * Génère une URL data base64 pour un fichier
   * @param fileId - L'ID du fichier sur MEGA
   * @returns Une URL data en base64
   */
  async getBase64FileUrl(fileId: string): Promise<string> {
    const storage = await this.getStorage();
    const file = storage.find(f => f.nodeId === fileId);
    if (!file) throw new Error('Fichier non trouvé');

    // Déterminer le type MIME en fonction de l'extension du fichier
    const ext = file.name?.split('.').pop()?.toLowerCase();
    const mimeType = this.getMimeType(ext || '');

    // Télécharger et convertir le fichier en base64
    const data = await file.downloadBuffer({});
    const base64 = data.toString('base64');

    // Retourner l'URL data avec le type MIME approprié
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Détermine le type MIME en fonction de l'extension du fichier
   * @param ext - Extension du fichier
   * @returns Type MIME correspondant
   */
  getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Upload d'un fichier sur MEGA
   * @param name - Nom du fichier
   * @param mimeType - Type MIME du fichier
   * @param buffer - Contenu du fichier
   * @param userId - ID de l'utilisateur (paramètre conservé pour compatibilité mais non utilisé)
   * @param folderId - ID du dossier de destination (optionnel)
   * @returns ID du fichier uploadé
   */
  async uploadFile(
    name: string,
    mimeType: string,
    buffer: Buffer,
    userId?: string,
    folderId?: string
  ): Promise<string> {
    const storage = await this.getStorage();
    
    // Utiliser le folderId spécifié ou la racine par défaut
    const targetFolder = folderId
      ? storage.find(file => file.nodeId === folderId) || storage.root
      : storage.root;

    return new Promise((resolve, reject) => {
      const uploadStream = targetFolder.upload({ name, size: buffer.length }, buffer);
      uploadStream.on('complete', (file: MegaFile) => {
        resolve(file.nodeId || '');
      });
      uploadStream.on('error', reject);
    });
  }  /**
   * Suppression d'un fichier
   * @param fileId - ID du fichier à supprimer
   */
  async deleteFile(fileId: string): Promise<void> {
    const storage = await this.getStorage();
    const file = storage.find(f => f.nodeId === fileId);
    if (!file) throw new Error('Fichier non trouvé');
    await file.delete();
  }

  /**
   * Téléchargement d'un fichier
   * @param fileId - ID du fichier à télécharger
   * @returns Buffer contenant le fichier
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    const storage = await this.getStorage();
    const file = storage.find(f => f.nodeId === fileId);
    if (!file) throw new Error('Fichier non trouvé');

    const data = await file.downloadBuffer({});

    const result = await verify(data);
    if (!result) throw new Error('Fichier corrompu');

    return data;
  }

  /**
   * Téléchargement d'un fichier sans vérification (pour migration)
   * @param fileId - ID du fichier à télécharger
   * @returns Buffer contenant le fichier
   */
  async downloadFileUnsafe(fileId: string): Promise<Buffer> {
    const storage = await this.getStorage();
    const file = storage.find(f => f.nodeId === fileId);
    if (!file) throw new Error('Fichier non trouvé');

    // Télécharger sans vérification pour éviter les erreurs de clé
    const data = await file.downloadBuffer({});
    return data;
  }

  /**
   * Remplacement d'un fichier (mise à jour)
   * @param fileId - ID du fichier à remplacer
   * @param name - Nouveau nom du fichier
   * @param mimeType - Type MIME du nouveau fichier
   * @param buffer - Nouveau contenu du fichier
   * @returns ID du nouveau fichier
   */
  async updateFile(
    fileId: string,
    name: string,
    mimeType: string,
    buffer: Buffer
  ): Promise<string> {
    const storage = await this.getStorage();
    const oldFile = storage.find(f => f.nodeId === fileId);
    if (!oldFile) throw new Error('Fichier à mettre à jour non trouvé');

    // Garder le même dossier parent que l'ancien fichier
    const parent = oldFile.parent || storage.root;
    
    await oldFile.delete();

    return new Promise((resolve, reject) => {
      const uploadStream = parent.upload({ name, size: buffer.length }, buffer);
      uploadStream.on('complete', (file: MegaFile) => {
        resolve(file.nodeId || '');
      });
      uploadStream.on('error', reject);
    });
  }
}
