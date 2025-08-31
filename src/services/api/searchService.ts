import { BaseApiService } from './baseService';
import { Document, Activity } from '../../types';
import { cacheService } from '../cacheService';

// Document du backend (avec isFavorite)
interface BackendDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  tags: string;
  ownerId: string;
  isFavorite: boolean;
  archived?: boolean;
  archivedAt?: string;
  createdAt: string;
  modifiedAt: string;
  description?: string;
  hash: string;
  fileId: string;
  folderId?: string; // ID du dossier parent
}

// Adaptateur pour convertir les documents du backend vers l'interface frontend
const adaptBackendDocument = (backendDoc: BackendDocument): Document => ({
  id: backendDoc.id,
  name: backendDoc.name,
  type: backendDoc.type,
  size: backendDoc.size,
  tags: backendDoc.tags
    ? backendDoc.tags.split(",").filter((tag) => tag.trim())
    : [],
  uploadDate: new Date(backendDoc.createdAt),
  lastModified: new Date(backendDoc.modifiedAt),
  url: `/.netlify/functions/documents/${backendDoc.id}/download`,
  favorite: backendDoc.isFavorite,
  shared: false, // TODO: implémenter le partage dans le backend
  thumbnail: undefined, // TODO: implémenter les thumbnails
  folderId: backendDoc.folderId || undefined, // Mapper le folderId
});

interface SearchResult {
  query: string;
  results: BackendDocument[];
  total: number;
  searchTime: number;
}

interface AdvancedSearchResult {
  query: string;
  filters: Record<string, unknown>;
  results: BackendDocument[];
  total: number;
  searchTime: number;
}

interface Stats {
  totalDocuments: number;
  totalSize: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  recentActivity: Array<{
    type: string;
    document: string;
    date: string;
  }>;
}

// Fonction pour générer des activités simulées (fallback)
const generateSimulatedActivities = (limit: number): Activity[] => {
  const types: Activity['type'][] = ['upload', 'update', 'delete', 'view', 'download', 'sync'];
  const documentNames = [
    'Rapport_financier_Q4.pdf',
    'Présentation_client.pptx',
    'Facture_2024_001.pdf',
    'Contrat_prestation.docx',
    'Budget_prévisionnel.xlsx',
    'Photo_équipe.jpg',
    'Manuel_utilisateur.pdf',
    'Sauvegarde_données.zip'
  ];

  return Array.from({ length: Math.min(limit, 10) }, (_, index) => ({
    id: `simulated-${index}`,
    type: types[Math.floor(Math.random() * types.length)],
    documentName: documentNames[Math.floor(Math.random() * documentNames.length)],
    documentId: `doc-${index}`,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    details: 'Activité simulée (endpoint backend non disponible)'
  }));
};

/**
 * Service de recherche et statistiques
 * Recherche simple, avancée, statistiques, activités récentes
 */
export class SearchService extends BaseApiService {

  async search(
    query: string,
    params?: {
      limit?: number;
      type?: string;
      category?: string;
      tag?: string;
    }
  ) {
    const searchParams = new URLSearchParams();
    searchParams.append("q", query);

    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.type) searchParams.append("type", params.type);
    if (params?.category) searchParams.append("category", params.category);
    if (params?.tag) searchParams.append("tag", params.tag);

    const response = await fetch(
      `${this.baseUrl}/search/search?${searchParams}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<SearchResult>(response).then((result) => ({
      ...result,
      results: result.results.map(adaptBackendDocument),
    }));
  }

  async advancedSearch(criteria: {
    query?: string;
    type?: string;
    category?: string;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
    minSize?: number;
    maxSize?: number;
    limit?: number;
  }) {
    const response = await fetch(`${this.baseUrl}/search/advanced-search`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(criteria),
    });

    return this.handleResponse<AdvancedSearchResult>(response).then(
      (result) => ({
        ...result,
        results: result.results.map(adaptBackendDocument),
      })
    );
  }

  async getStats() {
    // Créer une clé de cache
    const cacheKey = cacheService.generateKey('getStats');
    
    // Vérifier le cache
    const cached = cacheService.get<Stats>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.baseUrl}/search/stats`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<Stats>(response);
    
    // Mettre en cache le résultat
    cacheService.set(cacheKey, result, cacheService.TTL.stats);
    
    return result;
  }

  async getUserStats() {
    // Créer une clé de cache
    const cacheKey = cacheService.generateKey('getUserStats');
    
    // Vérifier le cache
    const cached = cacheService.get<Stats>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.baseUrl}/search/user-stats`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<Stats>(response);
    
    // Mettre en cache le résultat
    cacheService.set(cacheKey, result, cacheService.TTL.userStats);
    
    return result;
  }

  async getRecentActivities(limit = 10): Promise<Activity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search/recent-activities?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Les données du backend ont un format différent, nous devons les adapter
      const backendActivities = await this.handleResponse<Array<{
        id: string;
        type: string;
        document: string;
        documentId: string;
        userId: string;
        date: string;
        details?: {
          action?: string;
          entity?: string;
          additionalDetails?: string;
          documentDetails?: Record<string, unknown>;
        };
      }>>(response);

      // Adapter les données du backend vers notre format Activity
      const activities: Activity[] = backendActivities.map(activity => ({
        id: activity.id,
        type: activity.type as Activity['type'],
        documentName: activity.document,
        documentId: activity.documentId,
        timestamp: activity.date,
        details: activity.details?.additionalDetails || ''
      }));

      return activities;
    } catch (error) {
      console.warn('Endpoint des activités récentes non disponible, utilisation des données simulées', error);
      // Fallback vers des activités simulées si l'endpoint n'est pas disponible
      return generateSimulatedActivities(limit);
    }
  }
}
