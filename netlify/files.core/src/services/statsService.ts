import prisma from './database';
import { LogService } from './logService';

export interface CategoryStat {
  name: string;
  count: number;
  totalSize: number;
  averageSize: number;
  lastDocumentDate?: Date;
}

export interface SystemStats {
  totalDocuments: number;
  totalSize: number;
  totalUsers: number;
  categoriesStats: CategoryStat[];
  typeStats: { type: string; count: number; totalSize: number }[];
  recentActivity: number; // Documents créés dans les 7 derniers jours
  favoriteDocuments: number;
  documentsWithTags: number;
}

export interface UserStats {
  userId: string;
  userName: string;
  userEmail: string;
  documentCount: number;
  totalSize: number;
  favoriteCount: number;
  categoriesUsed: string[];
  mostUsedType: string;
  lastActivity?: Date;
}

export interface TimeRangeStats {
  daily: { date: string; count: number; size: number }[];
  weekly: { week: string; count: number; size: number }[];
  monthly: { month: string; count: number; size: number }[];
}

export class StatsService {
  private logService: LogService;

  constructor(logService: LogService) {
    this.logService = logService;
  }

  /**
   * Obtient les statistiques générales du système
   */
  async getSystemStats(): Promise<SystemStats> {
    const [
      totalDocuments,
      totalSize,
      totalUsers,
      categoriesData,
      typesData,
      recentDocs,
      favoriteDocs,
      docsWithTags,
    ] = await Promise.all([
      prisma.document.count(),
      prisma.document.aggregate({ _sum: { size: true } }),
      prisma.user.count(),
      prisma.document.groupBy({
        by: ['category'],
        _count: { category: true },
        _sum: { size: true },
        _max: { createdAt: true },
      }),
      prisma.document.groupBy({
        by: ['type'],
        _count: { type: true },
        _sum: { size: true },
      }),
      prisma.document.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours
          },
        },
      }),
      prisma.document.count({ where: { isFavorite: true } }),
      prisma.document.count({ where: { tags: { not: '' } } }),
    ]);

    const categoriesStats: CategoryStat[] = categoriesData.map(cat => ({
      name: cat.category,
      count: cat._count.category,
      totalSize: cat._sum.size || 0,
      averageSize: (cat._sum.size || 0) / cat._count.category,
      lastDocumentDate: cat._max.createdAt || undefined,
    }));

    const typeStats = typesData.map(type => ({
      type: type.type,
      count: type._count.type,
      totalSize: type._sum.size || 0,
    }));

    return {
      totalDocuments,
      totalSize: totalSize._sum.size || 0,
      totalUsers,
      categoriesStats,
      typeStats,
      recentActivity: recentDocs,
      favoriteDocuments: favoriteDocs,
      documentsWithTags: docsWithTags,
    };
  }

  /**
   * Obtient les statistiques pour un utilisateur spécifique
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const [
      documents,
      favoriteCount,
      lastActivity,
    ] = await Promise.all([
      prisma.document.findMany({
        where: { ownerId: userId },
        select: { category: true, type: true, size: true },
      }),
      prisma.document.count({
        where: { ownerId: userId, isFavorite: true },
      }),
      prisma.document.findFirst({
        where: { ownerId: userId },
        orderBy: { modifiedAt: 'desc' },
        select: { modifiedAt: true },
      }),
    ]);

    const categoriesUsed = [...new Set(documents.map(doc => doc.category))];
    const typeCounts = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedType = Object.entries(typeCounts).reduce((a, b) => 
      typeCounts[a[0]] > typeCounts[b[0]] ? a : b
    )?.[0] || '';

    return {
      userId,
      userName: user.name,
      userEmail: user.email,
      documentCount: documents.length,
      totalSize: documents.reduce((sum, doc) => sum + doc.size, 0),
      favoriteCount,
      categoriesUsed,
      mostUsedType,
      lastActivity: lastActivity?.modifiedAt,
    };
  }

  /**
   * Obtient les statistiques sur une période donnée
   */
  async getTimeRangeStats(days: number = 30): Promise<TimeRangeStats> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const documents = await prisma.document.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        size: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Statistiques journalières
    const dailyStats = new Map<string, { count: number; size: number }>();
    const weeklyStats = new Map<string, { count: number; size: number }>();
    const monthlyStats = new Map<string, { count: number; size: number }>();

    documents.forEach(doc => {
      const date = doc.createdAt;
      const dayKey = date.toISOString().split('T')[0];
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Jour
      if (!dailyStats.has(dayKey)) {
        dailyStats.set(dayKey, { count: 0, size: 0 });
      }
      const dailyStat = dailyStats.get(dayKey)!;
      dailyStat.count++;
      dailyStat.size += doc.size;

      // Semaine
      if (!weeklyStats.has(weekKey)) {
        weeklyStats.set(weekKey, { count: 0, size: 0 });
      }
      const weeklyStat = weeklyStats.get(weekKey)!;
      weeklyStat.count++;
      weeklyStat.size += doc.size;

      // Mois
      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, { count: 0, size: 0 });
      }
      const monthlyStat = monthlyStats.get(monthKey)!;
      monthlyStat.count++;
      monthlyStat.size += doc.size;
    });

    return {
      daily: Array.from(dailyStats.entries()).map(([date, stats]) => ({
        date,
        count: stats.count,
        size: stats.size,
      })),
      weekly: Array.from(weeklyStats.entries()).map(([week, stats]) => ({
        week,
        count: stats.count,
        size: stats.size,
      })),
      monthly: Array.from(monthlyStats.entries()).map(([month, stats]) => ({
        month,
        count: stats.count,
        size: stats.size,
      })),
    };
  }

  /**
   * Obtient les statistiques des utilisateurs les plus actifs
   */
  async getTopUsers(limit: number = 10): Promise<UserStats[]> {
    const users = await prisma.user.findMany({
      include: {
        documents: {
          select: {
            size: true,
            category: true,
            type: true,
            isFavorite: true,
            modifiedAt: true,
          },
        },
      },
    });

    const userStats = users.map(user => {
      const docs = user.documents;
      const categoriesUsed = [...new Set(docs.map(doc => doc.category))];
      const typeCounts = docs.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostUsedType = Object.entries(typeCounts).reduce((a, b) => 
        typeCounts[a[0]] > typeCounts[b[0]] ? a : b
      )?.[0] || '';

      const lastActivity = docs.length > 0 
        ? new Date(Math.max(...docs.map(doc => doc.modifiedAt.getTime())))
        : undefined;

      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        documentCount: docs.length,
        totalSize: docs.reduce((sum, doc) => sum + doc.size, 0),
        favoriteCount: docs.filter(doc => doc.isFavorite).length,
        categoriesUsed,
        mostUsedType,
        lastActivity,
      };
    });

    return userStats
      .sort((a, b) => b.documentCount - a.documentCount)
      .slice(0, limit);
  }

  /**
   * Obtient les catégories les plus populaires
   */
  async getPopularCategories(limit: number = 10): Promise<CategoryStat[]> {
    const stats = await this.getSystemStats();
    return stats.categoriesStats
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Obtient les statistiques de stockage par type de fichier
   */
  async getStorageStatsByType() {
    const typeStats = await prisma.document.groupBy({
      by: ['type'],
      _count: { type: true },
      _sum: { size: true },
      _avg: { size: true },
      _max: { size: true },
      _min: { size: true },
    });

    return typeStats
      .map(stat => ({
        type: stat.type,
        count: stat._count.type,
        totalSize: stat._sum.size || 0,
        averageSize: stat._avg.size || 0,
        maxSize: stat._max.size || 0,
        minSize: stat._min.size || 0,
      }))
      .sort((a, b) => b.totalSize - a.totalSize);
  }

  /**
   * Génère un rapport complet pour l'administration
   */
  async generateAdminReport(userId: string) {
    const [
      systemStats,
      timeRangeStats,
      topUsers,
      storageStats,
      recentLogs,
    ] = await Promise.all([
      this.getSystemStats(),
      this.getTimeRangeStats(30),
      this.getTopUsers(5),
      this.getStorageStatsByType(),
      this.logService.getAllLogs(20),
    ]);

    await this.logService.log({
      action: 'SYSTEM_BACKUP', // Utilisation comme action de rapport
      entity: 'SYSTEM',
      entityId: 'admin-report',
      userId,
      details: 'Génération du rapport administrateur',
    });

    return {
      systemStats,
      timeRangeStats,
      topUsers,
      storageStats,
      recentActivity: recentLogs,
      generatedAt: new Date(),
      generatedBy: userId,
    };
  }

  /**
   * Obtient les documents les plus volumineux
   */
  async getLargestDocuments(limit: number = 10) {
    return prisma.document.findMany({
      orderBy: { size: 'desc' },
      take: limit,
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

  /**
   * Obtient les documents les plus récents
   */
  async getRecentDocuments(limit: number = 10) {
    return prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
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
}
