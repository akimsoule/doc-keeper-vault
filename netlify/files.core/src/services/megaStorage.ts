import { Storage, verify } from 'megajs';

/**
 * Service de gestion des fichiers sur MEGA
 */
export class MegaStorageService {
  private storage: Storage | undefined;
  private email = process.env.MEGA_EMAIL!;
  private password = process.env.MEGA_PASSWORD!;

  /**
   * Initialise la connexion MEGA
   */
  private async getStorage(): Promise<Storage> {
    if (!this.storage) {
      if (!this.email || !this.password) {
        throw new Error('Identifiants MEGA requis');
      }
      this.storage = await new Storage({ 
        email: this.email, 
        password: this.password 
      }).ready;
    }
    return this.storage;
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
   * Upload d'un fichier
   * @param name - Nom du fichier
   * @param mimeType - Type MIME du fichier
   * @param buffer - Contenu du fichier
   * @param folderId - ID du dossier de destination (optionnel)
   * @returns ID du fichier uploadé
   */
  async uploadFile(
    name: string,
    mimeType: string,
    buffer: Buffer,
    folderId?: string
  ): Promise<string> {
    const storage = await this.getStorage();
    const folder = folderId
      ? storage.find(file => file.nodeId === folderId) || storage.root
      : storage.root;

    return new Promise((resolve, reject) => {
      const uploadStream = folder.upload({ name, size: buffer.length }, buffer);
      uploadStream.on('complete', (file: { nodeId: string }) => {
        resolve(file.nodeId);
      });
      uploadStream.on('error', reject);
    });
  }

  /**
   * Suppression d'un fichier
   * @param fileId - ID du fichier à supprimer
   * @param folderId - ID du dossier où chercher (optionnel, si non fourni cherche dans tout le compte)
   */
  async deleteFile(fileId: string, folderId?: string): Promise<void> {
    const storage = await this.getStorage();
    console.log(`🔍 Recherche du fichier avec ID: ${fileId}`);
    
    let searchFiles: Array<{ nodeId: string; name?: string; delete?: () => Promise<void> }>;
    
    if (folderId) {
      // Chercher uniquement dans le dossier spécifié
      const folder = storage.find(f => f.nodeId === folderId);
      if (!folder) {
        throw new Error(`Dossier avec ID ${folderId} non trouvé`);
      }
      searchFiles = Object.values(folder.children || {}).filter(child => child.nodeId !== undefined) as Array<{ nodeId: string; name?: string; delete?: () => Promise<void> }>;
      console.log(`📁 Recherche dans le dossier spécifique: ${searchFiles.length} fichiers`);
    } else {
      // Chercher dans tout le storage
      searchFiles = Object.values(storage.files).filter(f => f.nodeId !== undefined) as Array<{ nodeId: string; name?: string; delete?: () => Promise<void> }>;
      console.log(`📁 ${searchFiles.length} fichiers totaux dans le storage`);
    }
    
    const file = searchFiles.find(f => f.nodeId === fileId);
    if (!file) {
      console.log(`❌ Fichier ${fileId} non trouvé`);
      console.log(`🔍 Fichiers disponibles:`);
      searchFiles.slice(0, 5).forEach(f => {
        console.log(`   - ${f.name} (ID: ${f.nodeId})`);
      });
      if (searchFiles.length > 5) {
        console.log(`   ... et ${searchFiles.length - 5} autres fichiers`);
      }
      throw new Error('Fichier non trouvé');
    }
    
    console.log(`✅ Fichier trouvé: ${file.name} (ID: ${file.nodeId})`);
    if (typeof file.delete === 'function') {
      await file.delete();
      console.log(`🗑️ Fichier supprimé avec succès`);
    } else {
      throw new Error('La méthode de suppression du fichier est indisponible');
    }
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

    const parent = oldFile.parent || storage.root;
    await oldFile.delete();

    return new Promise((resolve, reject) => {
      const uploadStream = parent.upload({ name, size: buffer.length }, buffer);
      uploadStream.on('complete', (file: { nodeId: string }) => {
        resolve(file.nodeId);
      });
      uploadStream.on('error', reject);
    });
  }

  /**
   * Récupère tous les fichiers de MEGA avec leur contenu.
   * @param folderId - ID du dossier à scanner (optionnel, par défaut le dossier racine)
   * @returns Un tableau d'objets contenant les informations et le buffer de chaque fichier.
   */
  async getAllFilesWithContent(folderId?: string): Promise<{ fileId: string; name: string; buffer: Buffer }[]> {
    const storage = await this.getStorage();
    
    let targetFolder;
    if (folderId) {
      targetFolder = storage.find(f => f.nodeId === folderId);
      if (!targetFolder) {
        throw new Error(`Dossier avec l'ID ${folderId} non trouvé`);
      }
    } else {
      targetFolder = storage.root;
    }
    
    const files = Object.values(storage.files).filter(file => 
      file.parent === targetFolder && !file.directory
    );
    
    console.log(`📁 Scanning ${folderId ? 'dossier spécifique' : 'dossier racine'}: ${files.length} fichiers trouvés`);
    
    const filesWithContent: { fileId: string; name: string; buffer: Buffer }[] = [];

    for (const file of files) {
      if (!file.nodeId || !file.name) continue; // Ignorer les fichiers sans ID ou nom

      try {
        console.log(`   ⬇️ Téléchargement: ${file.name}...`);
        const buffer = await file.downloadBuffer({});
        filesWithContent.push({
          fileId: file.nodeId,
          name: file.name,
          buffer: buffer,
        });
        console.log(`   ✅ ${file.name} téléchargé (${buffer.length} bytes)`);
      } catch (error) {
        console.error(`   ❌ Erreur lors du téléchargement du fichier ${file.name} (${file.nodeId}):`, error);
        // Continuer avec les autres fichiers même si un échoue
      }
    }

    return filesWithContent;
  }

  /**
   * Crée un dossier sur MEGA
   * @param name - Nom du dossier
   * @param parentFolderId - ID du dossier parent (optionnel, par défaut le dossier racine)
   * @returns ID du dossier créé
   */
  async createFolder(name: string, parentFolderId?: string): Promise<string> {
    const storage = await this.getStorage();
    const parentFolder = parentFolderId 
      ? storage.find(f => f.nodeId === parentFolderId) || storage.root
      : storage.root;

    const folder = await parentFolder.mkdir(name);
    if (!folder.nodeId) {
      throw new Error('Impossible de créer le dossier');
    }
    return folder.nodeId;
  }
}
