/**
 * Service de cache en mémoire avec TTL (Time To Live)
 * Utilisé pour optimiser les performances des appels API
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut

  // Configuration des TTL par type d'appel (en millisecondes)
  public readonly TTL = {
    documents: 2 * 60 * 1000,      // 2 minutes pour les documents
    document: 5 * 60 * 1000,       // 5 minutes pour un document individuel
    stats: 10 * 60 * 1000,         // 10 minutes pour les stats
    userStats: 10 * 60 * 1000,     // 10 minutes pour les stats utilisateur
    tags: 15 * 60 * 1000,          // 15 minutes pour les tags
    tagStats: 10 * 60 * 1000,      // 10 minutes pour les stats de tags
    profile: 30 * 60 * 1000,       // 30 minutes pour le profil
    preferences: 30 * 60 * 1000,   // 30 minutes pour les préférences
    downloadFile: 60 * 60 * 1000,  // 1 heure pour les fichiers téléchargés
    search: 5 * 60 * 1000,         // 5 minutes pour les recherches
  } as const;

  /**
   * Génère une clé de cache basée sur la méthode et ses paramètres
   */
  generateKey(method: string, params?: Record<string, unknown>): string {
    return `${method}:${JSON.stringify(params || {})}`;
  }

  /**
   * Récupère une valeur du cache si elle est valide
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Stocke une valeur dans le cache avec un TTL
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalide une ou plusieurs entrées du cache
   * @param pattern - Pattern pour filtrer les clés à supprimer (optionnel)
   */
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalide spécifiquement une clé exacte
   */
  invalidateKey(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Nettoie automatiquement les entrées expirées
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Obtient des informations sur l'état du cache
   */
  getInfo(): {
    size: number;
    keys: string[];
    totalMemoryUsage: number;
    expiredCount: number;
  } {
    const now = Date.now();
    let expiredCount = 0;
    let totalMemoryUsage = 0;

    for (const [key, entry] of this.cache.entries()) {
      // Estimation approximative de l'usage mémoire
      totalMemoryUsage += key.length * 2; // Chaîne UTF-16
      totalMemoryUsage += JSON.stringify(entry.data).length * 2;
      totalMemoryUsage += 16; // timestamp + ttl (2 numbers * 8 bytes)

      if (now > entry.timestamp + entry.ttl) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalMemoryUsage,
      expiredCount,
    };
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Vérifie si une clé existe dans le cache (même expirée)
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Obtient la taille actuelle du cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Démarre un nettoyage automatique périodique
   */
  startAutoCleanup(intervalMs: number = 10 * 60 * 1000): () => void {
    const intervalId = setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0) {
        console.debug(`Cache auto-cleanup: ${cleaned} entrées expirées supprimées`);
      }
    }, intervalMs);

    // Retourne une fonction pour arrêter le nettoyage
    return () => clearInterval(intervalId);
  }
}

// Instance singleton du service de cache
export const cacheService = new CacheService();
export default cacheService;
