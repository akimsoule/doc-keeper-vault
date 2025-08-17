
import prisma from "./database";
import { LogService } from "./logService";
import * as megaStorage from "./megaStorage";
import fs from "fs";
import path from "path";
import { MegaStorageService } from "./megaStorage";
import { Prisma } from "@prisma/client";

export interface CreateDocumentData {
  name: string;
  type: string;
  category: string;
  description?: string;
  tags?: string; // Tags séparés par des virgules
  ownerId?: string;
  ownerEmail?: string;
  filePath?: string;
  file?: {
    name: string; // Nom du fichier
    buffer: Buffer; // Contenu du fichier
    mimeType: string; // Type MIME du fichier
  };
}

export interface UpdateDocumentData {
  name?: string;
  type?: string;
  category?: string;
  description?: string;
  tags?: string; // Tags séparés par des virgules
  isFavorite?: boolean;
}

export class DocumentService {
  private megaStorageService: megaStorage.MegaStorageService;
  private logService: LogService;

  constructor(megaStorageService: MegaStorageService, logService: LogService) {
    this.megaStorageService = megaStorageService;
    this.logService = logService;
  }

  async createDocument(data: CreateDocumentData) {
    // D'abord, résoudre l'ID utilisateur si nécessaire (sans transaction)
    let ownerId = data.ownerId;
    if (!ownerId && data.ownerEmail) {
      const user = await prisma.user.findUnique({
        where: { email: data.ownerEmail },
      });
      if (!user) {
        throw new Error(
          `Aucun utilisateur trouvé avec l'email: ${data.ownerEmail}`
        );
      }
      ownerId = user.id;
    }
    if (!ownerId) {
      throw new Error("ownerId ou ownerEmail requis pour créer un document");
    }

    // Upload du fichier vers MEGA
    let fileId = "";
    let fileSize = 0;

    if (data.filePath) {
      const resolvedPath = path.resolve(data.filePath);
      const name = path.basename(resolvedPath);
      const mimeType = this.megaStorageService.getMimeType(
        name.split(".").pop() || ""
      );
      const fileBuffer = fs.readFileSync(resolvedPath);
      fileId = await this.megaStorageService.uploadFile(
        name,
        mimeType,
        fileBuffer,
        ownerId
      );
      fileSize = fileBuffer.length;
    } else if (data.file) {
      fileId = await this.megaStorageService.uploadFile(
        data.file.name,
        data.file.mimeType,
        data.file.buffer,
        ownerId
      );
      fileSize = data.file.buffer.length;
    }

    // Ensuite, créer le document dans la base de données
    const document = await prisma.document.create({
      data: {
        name: data.name,
        type: data.type,
        category: data.category,
        size: fileSize,
        description: data.description,
        tags: data.tags
          ? (Array.isArray(data.tags)
              ? data.tags
              : data.tags.split(",").map((tag) => tag.trim()).filter(Boolean))
          : [],
        fileId,
        ownerId: ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Créer le log de façon séparée
    await this.logService.log({
      action: "DOCUMENT_CREATE",
      entity: "DOCUMENT",
      entityId: document.id,
      userId: ownerId,
      documentId: document.id,
      details: `Document créé: ${document.name} (${document.type})`,
    });

    return document;
  }

  async getDocumentById(id: string) {
    return prisma.document.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getUserDocumentById(id: string, ownerId: string) {
    return prisma.document.findFirst({
      where: { id, ownerId },
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        description: true,
        tags: true,
        size: true,
        fileId: true,
        createdAt: true,
        modifiedAt: true,
        isFavorite: true
      }
    });
  }

  async getDocumentByNameAndOwner(name: string, ownerEmail: string) {
    return prisma.document.findFirst({
      where: {
        name: name,
        owner: {
          email: ownerEmail,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getDocumentByIdPrefix(idPrefix: string) {
    // Rechercher le premier document dont l'ID commence par le préfixe donné
    const documents = await prisma.document.findMany({
      where: {
        id: {
          startsWith: idPrefix,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 1, // Ne prendre que le premier résultat
    });

    return documents.length > 0 ? documents[0] : null;
  }

  async getAllDocuments(
    skip = 0,
    take = 20,
    filters?: {
      type?: string;
      category?: string;
      ownerId?: string;
      tags?: string[];
      search?: string;
    }
  ) {
    const where: Prisma.DocumentWhereInput = {};

    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;
    if (filters?.ownerId) where.ownerId = filters.ownerId;
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.document.findMany({
      where,
      skip,
      take,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getUserDocuments(ownerId: string, skip = 0, take = 20) {
    return prisma.document.findMany({
      where: { ownerId },
      skip,
      take,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getFavoriteDocuments(ownerId: string) {
    return prisma.document.findMany({
      where: {
        ownerId,
        isFavorite: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateDocument(id: string, data: UpdateDocumentData, userId: string) {
    const document = await prisma.document.update({
      where: { id },
      data: {
        ...data,
        tags: data.tags
          ? Array.isArray(data.tags)
            ? data.tags
            : data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : undefined,
        modifiedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Créer le log de façon séparée
    await this.logService.log({
      action: "DOCUMENT_UPDATE",
      entity: "DOCUMENT",
      entityId: id,
      userId,
      documentId: id,
      details: `Document mis à jour: ${document.name}`,
    });

    return document;
  }

  async updateUserDocument(id: string, ownerId: string, data: UpdateDocumentData & {
    file?: {
      name: string;
      buffer: Buffer;
      mimeType: string;
    };
  }) {
    // D'abord, récupérer les informations du document sans transaction
    const existing = await prisma.document.findFirst({ 
      where: { id, ownerId },
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        description: true,
        tags: true,
        fileId: true,
        size: true
      }
    });

    if (!existing) {
      throw new Error('Document non trouvé');
    }

    let newFileId = existing.fileId;
    let newSize = existing.size;

    // Gérer le fichier si un nouveau fichier est fourni
    if (data.file) {
      try {
        // Uploader le nouveau fichier d'abord
        newFileId = await this.megaStorageService.uploadFile(
          data.file.name,
          data.file.mimeType,
          data.file.buffer,
          ownerId
        );
        newSize = data.file.buffer.length;

        // Supprimer l'ancien fichier après le succès de l'upload
        if (existing.fileId) {
          try {
            await this.megaStorageService.deleteFile(existing.fileId);
          } catch (deleteError) {
            console.error('Erreur lors de la suppression de l\'ancien fichier:', deleteError);
            // Ne pas faire échouer l'opération si la suppression échoue
          }
        }
      } catch (uploadError) {
        console.error('Erreur lors de l\'upload du nouveau fichier:', uploadError);
        throw new Error('Erreur lors de l\'upload du fichier');
      }
    }

    // Ensuite, mettre à jour le document
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        name: data.name || existing.name,
        type: data.type || existing.type,
        category: data.category || existing.category,
        description: data.description !== undefined ? data.description : existing.description,
        tags: data.tags
          ? (Array.isArray(data.tags)
              ? data.tags
              : data.tags.split(",").map((tag) => tag.trim()).filter(Boolean))
          : [],
        isFavorite: data.isFavorite !== undefined ? data.isFavorite : undefined,
        fileId: newFileId,
        size: newSize,
        modifiedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        description: true,
        tags: true,
        size: true,
        fileId: true,
        createdAt: true,
        modifiedAt: true,
        isFavorite: true
      }
    });

    // Créer le log de façon séparée
    await this.logService.log({
      action: "DOCUMENT_UPDATE",
      entity: "DOCUMENT",
      entityId: id,
      userId: ownerId,
      documentId: id,
      details: `Document mis à jour: ${updatedDocument.name}${data.file ? ' (avec nouveau fichier)' : ''}`,
    });

    return updatedDocument;
  }

  async toggleFavorite(id: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error("Document non trouvé");
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        isFavorite: !document.isFavorite,
        modifiedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Créer le log de façon séparée
    await this.logService.log({
      action: updated.isFavorite ? "DOCUMENT_FAVORITE" : "DOCUMENT_UNFAVORITE",
      entity: "DOCUMENT",
      entityId: id,
      userId,
      documentId: id,
      details: `Document ${
        updated.isFavorite ? "ajouté aux" : "retiré des"
      } favoris: ${updated.name}`,
    });

    return updated;
  }

  async deleteDocument(id: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error("Document non trouvé");
    }

    // Enregistrer le log AVANT la suppression
    await this.logService.log({
      action: "DOCUMENT_DELETE",
      entity: "DOCUMENT",
      entityId: id,
      userId,
      documentId: id,
      details: `Document supprimé: ${document.name}`,
    });

    // Suppression du document dans la base de données
    await prisma.document.delete({
      where: { id },
    });

    // Suppression du fichier sur MEGA
    if (document.fileId) {
      try {
        await this.megaStorageService.deleteFile(document.fileId);
      } catch (error) {
        console.error("Erreur lors de la suppression du fichier MEGA:", error);
      }
    }

    return { message: "Document supprimé avec succès" };
  }

  async deleteUserDocument(id: string, ownerId: string) {
    // Vérifier que le document existe et appartient à l'utilisateur
    const document = await prisma.document.findFirst({
      where: { id, ownerId },
      select: {
        id: true,
        name: true,
        fileId: true
      }
    });

    if (!document) {
      throw new Error("Document non trouvé");
    }

    // Enregistrer le log AVANT la suppression
    await this.logService.log({
      action: "DOCUMENT_DELETE",
      entity: "DOCUMENT",
      entityId: id,
      userId: ownerId,
      documentId: id,
      details: `Document supprimé: ${document.name}`,
    });

    // Suppression du document dans la base de données
    await prisma.document.delete({
      where: { id },
    });

    // Suppression du fichier sur MEGA
    if (document.fileId) {
      try {
        await this.megaStorageService.deleteFile(document.fileId);
      } catch (error) {
        console.error("Erreur lors de la suppression du fichier MEGA:", error);
      }
    }

    return { 
      message: "Document supprimé avec succès",
      documentId: id,
      documentName: document.name
    };
  }

  async downloadDocument(id: string, userId: string) {
    // D'abord, récupérer le document sans transaction pour éviter les timeouts
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error("Document non trouvé");
    }

    if (!document.fileId) {
      throw new Error("Aucun fichier associé à ce document");
    }

    // Télécharger le fichier depuis MEGA
    const fileBuffer = await this.megaStorageService.downloadFile(
      document.fileId
    );

    // Créer le log
    await this.logService.log({
      action: "DOCUMENT_DOWNLOAD",
      entity: "DOCUMENT",
      entityId: id,
      userId,
      documentId: id,
      details: `Document téléchargé: ${document.name}`,
    });

    return {
      buffer: fileBuffer,
      filename: document.name,
      mimeType: this.getMimeTypeFromExtension(document.type),
    };
  }

  async getDocumentUrl(id: string, userId: string) {
    // D'abord, récupérer le document sans transaction pour éviter les timeouts
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error("Document non trouvé");
    }

    if (!document.fileId) {
      throw new Error("Aucun fichier associé à ce document");
    }

    try {
      // Obtenir l'URL depuis MEGA (service externe) - hors transaction
      const url = await this.megaStorageService.getFileUrl(document.fileId);

      // Créer le log
      await this.logService.log({
        action: "DOCUMENT_DOWNLOAD",
        entity: "DOCUMENT",
        entityId: id,
        userId,
        documentId: id,
        details: `URL temporaire générée pour: ${document.name}`,
      });

      return { url, expiresIn: "1 heure" };
    } catch (megaError) {
      console.error(`Erreur MEGA pour le fichier ${document.fileId}:`, megaError);
      
      // Log de l'erreur
      await this.logService.log({
        action: "DOCUMENT_ERROR",
        entity: "DOCUMENT",
        entityId: id,
        userId,
        documentId: id,
        details: `Erreur lors de la récupération du fichier ${document.name}: ${megaError.message}`,
      });

      // Retourner une erreur plus spécifique
      throw new Error(`Fichier non disponible sur le stockage distant: ${megaError.message}`);
    }
  }

  async getUserDocumentUrl(id: string, ownerId: string) {
    // D'abord, récupérer le document sans transaction pour éviter les timeouts
    const document = await prisma.document.findFirst({
      where: { id, ownerId },
      select: {
        id: true,
        name: true,
        type: true,
        fileId: true
      }
    });

    if (!document) {
      throw new Error("Document non trouvé");
    }

    if (!document.fileId) {
      throw new Error("Aucun fichier associé à ce document");
    }

    try {
      // Obtenir l'URL depuis MEGA (service externe) - hors transaction
      const url = await this.megaStorageService.getBase64FileUrl(document.fileId);

      // Créer le log
      await this.logService.log({
        action: "DOCUMENT_DOWNLOAD",
        entity: "DOCUMENT",
        entityId: id,
        userId: ownerId,
        documentId: id,
        details: `URL base64 générée pour: ${document.name}`,
      });

      return { url, type: document.type };
    } catch (megaError) {
      console.error(`Erreur MEGA pour le fichier ${document.fileId}:`, megaError);
      
      // Log de l'erreur
      await this.logService.log({
        action: "DOCUMENT_ERROR",
        entity: "DOCUMENT",
        entityId: id,
        userId: ownerId,
        documentId: id,
        details: `Erreur lors de la récupération du fichier ${document.name}: ${megaError.message}`,
      });

      // Retourner une erreur plus spécifique
      throw new Error(`Fichier non disponible sur le stockage distant: ${megaError.message}`);
    }
  }

  async getDocumentStats() {
    const stats = await prisma.document.groupBy({
      by: ["type", "category"],
      _count: {
        id: true,
      },
      _sum: {
        size: true,
      },
    });

    const totalDocuments = await prisma.document.count();
    const totalSize = await prisma.document.aggregate({
      _sum: { size: true },
    });

    return {
      totalDocuments,
      totalSize: totalSize._sum.size || 0,
      byTypeAndCategory: stats,
    };
  }

  async searchUserDocuments(ownerId: string, options: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      type = '',
      category = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const pageNum = Math.max(page, 1);
    const sizeNum = Math.max(pageSize, 1);

    // Validation du champ de tri
    const allowedSortFields = ['name', 'createdAt', 'modifiedAt', 'type', 'category', 'size'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    // Construction de la clause where
    const where: Prisma.DocumentWhereInput = {
      ownerId,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      } : {}),
      ...(type ? { type } : {}),
      ...(category ? { category } : {})
    };

    // Count total avec filtres
    const total = await prisma.document.count({ where });

    // Récupération des documents avec pagination et tri
    const documents = await prisma.document.findMany({
      where,
      skip: (pageNum - 1) * sizeNum,
      take: sizeNum,
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        description: true,
        tags: true,
        size: true,
        fileId: true,
        createdAt: true,
        modifiedAt: true,
        isFavorite: true
      },
      orderBy: { [validSortBy]: validSortOrder }
    });

    const totalPages = Math.ceil(total / sizeNum);

    return {
      documents,
      pagination: {
        page: pageNum,
        pageSize: sizeNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      filters: {
        search,
        type,
        category
      },
      sorting: {
        field: validSortBy,
        order: validSortOrder
      }
    };
  }

  private getMimeTypeFromExtension(type: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
    };

    return mimeTypes[type.toLowerCase()] || "application/octet-stream";
  }
}
