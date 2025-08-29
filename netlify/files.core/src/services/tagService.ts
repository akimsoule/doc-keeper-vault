import prisma from './database';
import { LogService } from './logService';

export interface TagStats {
  tag: string;
  count: number;
  documents: {
    id: string;
    name: string;
    category: string;
    type: string;
  }[];
}

export interface TagAnalytics {
  totalTags: number;
  mostUsedTags: { tag: string; count: number }[];
  tagsByCategory: { category: string; tags: string[] }[];
  recentTags: string[];
}

export class TagService {
  private logService: LogService;

  constructor(logService: LogService) {
    this.logService = logService;
  }

  /**
   * Obtient tous les tags uniques utilisés dans les documents
   */
  async getAllTags(): Promise<string[]> {
    const documents = await prisma.document.findMany({
      select: { tags: true },
      where: {
        tags: {
          not: ''
        }
      }
    });

    const allTags = new Set<string>();
    
    documents.forEach(doc => {
      if (doc.tags) {
        const tags = doc.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        tags.forEach(tag => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  }

  /**
   * Obtient les statistiques pour chaque tag
   */
  async getTagStats(): Promise<TagStats[]> {
    const documents = await prisma.document.findMany({
      select: { 
        id: true, 
        name: true, 
        category: true, 
        type: true, 
        tags: true 
      },
      where: {
        tags: {
          not: ''
        }
      }
    });

    const tagMap = new Map<string, TagStats>();

    documents.forEach(doc => {
      if (doc.tags) {
        const tags = doc.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        tags.forEach(tag => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, {
              tag,
              count: 0,
              documents: []
            });
          }
          
          const tagStat = tagMap.get(tag)!;
          tagStat.count++;
          tagStat.documents.push({
            id: doc.id,
            name: doc.name,
            category: doc.category,
            type: doc.type
          });
        });
      }
    });

    return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Recherche des documents par tags
   */
  async searchDocumentsByTags(tags: string[], operator: 'AND' | 'OR' = 'OR') {
    if (tags.length === 0) {
      return [];
    }

    const documents = await prisma.document.findMany({
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

    return documents.filter(doc => {
      if (!doc.tags) return false;
      
      const docTags = doc.tags.split(',').map(tag => tag.trim().toLowerCase());
      const searchTags = tags.map(tag => tag.trim().toLowerCase());

      if (operator === 'AND') {
        return searchTags.every(searchTag => 
          docTags.some(docTag => docTag.includes(searchTag))
        );
      } else {
        return searchTags.some(searchTag => 
          docTags.some(docTag => docTag.includes(searchTag))
        );
      }
    });
  }

  /**
   * Obtient les tags les plus populaires
   */
  async getPopularTags(limit: number = 10): Promise<{ tag: string; count: number }[]> {
    const tagStats = await this.getTagStats();
    return tagStats.slice(0, limit).map(stat => ({
      tag: stat.tag,
      count: stat.count
    }));
  }

  /**
   * Obtient les tags associés à une catégorie
   */
  async getTagsByCategory(category: string): Promise<string[]> {
    const documents = await prisma.document.findMany({
      where: { 
        category,
        tags: {
          not: ''
        }
      },
      select: { tags: true }
    });

    const tags = new Set<string>();
    
    documents.forEach(doc => {
      if (doc.tags) {
        const docTags = doc.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        docTags.forEach(tag => tags.add(tag));
      }
    });

    return Array.from(tags).sort();
  }

  /**
   * Ajoute un tag à un document
   */
  async addTagToDocument(documentId: string, tag: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { tags: true, name: true }
    });

    if (!document) {
      throw new Error('Document non trouvé');
    }

    const currentTags = document.tags ? document.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const normalizedTag = tag.trim();
    
    if (!currentTags.includes(normalizedTag)) {
      currentTags.push(normalizedTag);
      
      const updatedDocument = await prisma.document.update({
        where: { id: documentId },
        data: {
          tags: currentTags.join(','),
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

      await this.logService.log({
        action: 'TAG_CREATE',
        entity: 'TAG',
        entityId: documentId,
        userId,
        documentId,
        details: `Tag "${normalizedTag}" ajouté au document: ${document.name}`,
      });

      return updatedDocument;
    }

    throw new Error('Ce tag existe déjà sur ce document');
  }

  /**
   * Supprime un tag d'un document
   */
  async removeTagFromDocument(documentId: string, tag: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { tags: true, name: true }
    });

    if (!document) {
      throw new Error('Document non trouvé');
    }

    const currentTags = document.tags ? document.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const normalizedTag = tag.trim();
    const updatedTags = currentTags.filter(t => t !== normalizedTag);

    if (currentTags.length !== updatedTags.length) {
      const updatedDocument = await prisma.document.update({
        where: { id: documentId },
        data: {
          tags: updatedTags.join(','),
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

      await this.logService.log({
        action: 'TAG_DELETE',
        entity: 'TAG',
        entityId: documentId,
        userId,
        documentId,
        details: `Tag "${normalizedTag}" supprimé du document: ${document.name}`,
      });

      return updatedDocument;
    }

    throw new Error('Ce tag n\'existe pas sur ce document');
  }

  /**
   * Remplace un tag par un autre dans tous les documents
   */
  async replaceTag(oldTag: string, newTag: string, userId: string) {
    const documents = await prisma.document.findMany({
      where: {
        tags: {
          contains: oldTag,
          mode: 'insensitive' as const
        }
      },
      select: { id: true, tags: true, name: true }
    });

    let updatedCount = 0;
    
    for (const doc of documents) {
      if (doc.tags) {
        const tags = doc.tags.split(',').map(t => t.trim()).filter(Boolean);
        const updatedTags = tags.map(tag => tag === oldTag.trim() ? newTag.trim() : tag);
        
        if (tags.join(',') !== updatedTags.join(',')) {
          await prisma.document.update({
            where: { id: doc.id },
            data: {
              tags: updatedTags.join(','),
              modifiedAt: new Date(),
            }
          });
          updatedCount++;
        }
      }
    }

    await this.logService.log({
      action: 'TAG_UPDATE',
      entity: 'TAG',
      entityId: 'bulk-update',
      userId,
      details: `Tag "${oldTag}" remplacé par "${newTag}" dans ${updatedCount} documents`,
    });

    return {
      updatedCount,
      oldTag,
      newTag,
    };
  }

  /**
   * Nettoie les tags orphelins et dupliqués
   */
  async cleanupTags(userId: string) {
    const documents = await prisma.document.findMany({
      where: {
        tags: {
          not: ''
        }
      },
      select: { id: true, tags: true }
    });

    let cleanedCount = 0;

    for (const doc of documents) {
      if (doc.tags) {
        const originalTags = doc.tags.split(',').map(t => t.trim()).filter(Boolean);
        const cleanedTags = [...new Set(originalTags.filter(tag => tag.length > 0))];
        
        if (originalTags.length !== cleanedTags.length || originalTags.join(',') !== cleanedTags.join(',')) {
          await prisma.document.update({
            where: { id: doc.id },
            data: {
              tags: cleanedTags.join(','),
              modifiedAt: new Date(),
            }
          });
          cleanedCount++;
        }
      }
    }

    await this.logService.log({
      action: 'TAG_UPDATE',
      entity: 'TAG',
      entityId: 'cleanup',
      userId,
      details: `Nettoyage des tags: ${cleanedCount} documents traités`,
    });

    return { cleanedCount };
  }

  /**
   * Obtient des analytics détaillées sur les tags
   */
  async getTagAnalytics(): Promise<TagAnalytics> {
    const tagStats = await this.getTagStats();
    const categories = await prisma.document.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    const tagsByCategory = await Promise.all(
      categories.map(async (cat) => ({
        category: cat.category,
        tags: await this.getTagsByCategory(cat.category)
      }))
    );

    // Tags récents (basés sur les documents récents)
    const recentDocuments = await prisma.document.findMany({
      where: {
        tags: { not: '' },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
        }
      },
      select: { tags: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const recentTagsSet = new Set<string>();
    recentDocuments.forEach(doc => {
      if (doc.tags) {
        const tags = doc.tags.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach(tag => recentTagsSet.add(tag));
      }
    });

    return {
      totalTags: tagStats.length,
      mostUsedTags: tagStats.slice(0, 10).map(stat => ({
        tag: stat.tag,
        count: stat.count
      })),
      tagsByCategory,
      recentTags: Array.from(recentTagsSet).slice(0, 20)
    };
  }
}
