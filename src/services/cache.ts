/**
 * Service de cache pour optimiser les requêtes API
 * Gère le cache en mémoire avec TTL et invalidation intelligente
 */

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live en millisecondes
  key: string;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enableLogging: boolean;
}

export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes par défaut
      maxSize: 100, // 100 entrées maximum
      enableLogging: process.env.NODE_ENV === 'development',
      ...config,
    };
  }

  /**
   * Génère une clé de cache à partir des paramètres
   */
  private generateKey(base: string, params?: Record<string, unknown>): string {
    if (!params) return base;
    
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            result[key] = value.sort().join(',');
          } else {
            result[key] = String(value);
          }
        }
        return result;
      }, {} as Record<string, string>);

    const paramString = Object.keys(sortedParams).length > 0 
      ? JSON.stringify(sortedParams) 
      : '';
    
    return `${base}:${paramString}`;
  }

  /**
   * Vérifie si une entrée de cache est encore valide
   */
  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        this.cache.delete(key);
        if (this.config.enableLogging) {
          console.log(`[Cache] Suppression de l'entrée expirée: ${key}`);
        }
      }
    }
  }

  /**
   * Applique la limite de taille du cache (LRU)
   */
  private enforceSizeLimit(): void {
    if (this.cache.size <= this.config.maxSize) return;

    // Convertir en tableau et trier par timestamp (plus ancien en premier)
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Supprimer les entrées les plus anciennes
    const toDelete = entries.slice(0, this.cache.size - this.config.maxSize);
    toDelete.forEach(([key]) => {
      this.cache.delete(key);
      if (this.config.enableLogging) {
        console.log(`[Cache] Suppression LRU: ${key}`);
      }
    });
  }  /**
   * Récupère une valeur du cache
   */
  get<T>(base: string, params?: Record<string, unknown>): T | null {
    this.cleanup();
    
    const key = this.generateKey(base, params);
    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.config.enableLogging) {
        console.log(`[Cache] MISS: ${key}`);
      }
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      if (this.config.enableLogging) {
        console.log(`[Cache] EXPIRED: ${key}`);
      }
      return null;
    }

    if (this.config.enableLogging) {
      console.log(`[Cache] HIT: ${key}`);
    }

    // Mettre à jour le timestamp pour LRU
    entry.timestamp = Date.now();
    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(base: string, data: T, params?: Record<string, unknown>, ttl?: number): void {
    const key = this.generateKey(base, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key,
    };

    this.cache.set(key, entry);
    
    if (this.config.enableLogging) {
      console.log(`[Cache] SET: ${key} (TTL: ${entry.ttl}ms)`);
    }

    this.enforceSizeLimit();
  }

  /**
   * Invalide une ou plusieurs entrées du cache
   */
  invalidate(pattern: string | RegExp): number {
    let deleted = 0;
    
    if (typeof pattern === 'string') {
      // Invalidation exacte
      if (this.cache.has(pattern)) {
        this.cache.delete(pattern);
        deleted = 1;
        if (this.config.enableLogging) {
          console.log(`[Cache] INVALIDATE: ${pattern}`);
        }
      }
      
      // Invalidation par préfixe
      for (const key of this.cache.keys()) {
        if (key.startsWith(pattern)) {
          this.cache.delete(key);
          deleted++;
          if (this.config.enableLogging) {
            console.log(`[Cache] INVALIDATE: ${key}`);
          }
        }
      }
    } else {
      // Invalidation par regex
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
          deleted++;
          if (this.config.enableLogging) {
            console.log(`[Cache] INVALIDATE: ${key}`);
          }
        }
      }
    }

    return deleted;
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    if (this.config.enableLogging) {
      console.log(`[Cache] CLEAR: ${size} entrées supprimées`);
    }
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    defaultTTL: number;
    entries: Array<{ key: string; age: number; ttl: number; valid: boolean }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl,
      valid: this.isValid(entry),
    }));

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      defaultTTL: this.config.defaultTTL,
      entries,
    };
  }

  /**
   * Wrapper pour les requêtes avec cache automatique
   */
  async withCache<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    params?: Record<string, unknown>,
    ttl?: number
  ): Promise<T> {
    // Essayer de récupérer depuis le cache
    const cached = this.get<T>(cacheKey, params);
    if (cached !== null) {
      return cached;
    }

    // Récupérer les données
    const data = await fetcher();
    
    // Mettre en cache
    this.set(cacheKey, data, params, ttl);
    
    return data;
  }
}

// Instance globale du service de cache
export const cacheService = new CacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 200,
  enableLogging: process.env.NODE_ENV === 'development',
});

// Constantes pour les clés de cache
export const CACHE_KEYS = {
  DOCUMENTS: 'documents',
  DOCUMENT: 'document',
  DOCUMENT_URL: 'document_url',
  TAGS: 'tags',
  ACTIVITY_LOGS: 'activity_logs',
  USER: 'user',
} as const;

// TTL spécifiques par type de données
export const CACHE_TTL = {
  DOCUMENTS: 3 * 60 * 1000,      // 3 minutes - données qui changent souvent
  DOCUMENT: 10 * 60 * 1000,      // 10 minutes - métadonnées moins volatiles
  DOCUMENT_URL: 60 * 60 * 1000,  // 1 heure - URLs signées
  TAGS: 15 * 60 * 1000,          // 15 minutes - changent peu souvent
  ACTIVITY_LOGS: 1 * 60 * 1000,  // 1 minute - données en temps quasi réel
  USER: 30 * 60 * 1000,          // 30 minutes - profil utilisateur
} as const;
