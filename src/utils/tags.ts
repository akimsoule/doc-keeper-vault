/**
 * Utilitaires pour les tags
 */

import { Document } from '../types';

export interface TagWithStats {
  name: string;
  count: number;
  color?: string;
}

/**
 * Vérifie si un document est archivé (contient le tag "archived")
 */
export const isDocumentArchived = (document: Document): boolean => {
  return document.tags.includes('archived');
};

/**
 * Ajoute le tag "archived" à un document
 */
export const addArchivedTag = (tags: string[]): string[] => {
  if (!tags.includes('archived')) {
    return [...tags, 'archived'];
  }
  return tags;
};

/**
 * Supprime le tag "archived" d'un document
 */
export const removeArchivedTag = (tags: string[]): string[] => {
  return tags.filter(tag => tag !== 'archived');
};

export const getTagColor = (tag: string): string => {
  const colors: { [key: string]: string } = {
    'archive': '#9CA3AF',
    'archived': '#9CA3AF',
    'travail': '#3B82F6',
    'personnel': '#10B981',
    'important': '#EF4444',
    'finance': '#F59E0B',
    'santé': '#8B5CF6',
    'administration': '#6B7280',
    'projet': '#06B6D4',
    'formation': '#84CC16',
    'juridique': '#F97316',
    'pdf': '#DC2626',
    'images': '#7C3AED',
    'documents': '#059669',
    'tableaux': '#EA580C',
    'autres': '#6B7280'
  };
  return colors[tag.toLowerCase()] || '#6B7280';
};

export const parseTagsString = (tagsString: string | null | undefined): string[] => {
  if (!tagsString || !tagsString.trim()) return [];
  
  try {
    // Essayer de parser comme JSON d'abord (compatibilité avec l'ancien format)
    if (tagsString.startsWith('[')) {
      const parsed = JSON.parse(tagsString);
      return Array.isArray(parsed) ? parsed.flat().filter(Boolean) : [];
    }
  } catch {
    // Ignorer les erreurs de parsing JSON
  }
  
  // Parser comme chaîne séparée par des virgules
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag && tag !== 'nouveau');
};

export const formatTagsForStorage = (tags: string[]): string => {
  return tags.filter(Boolean).join(',');
};

export const validateTag = (tag: string): boolean => {
  return tag.trim().length > 0 && tag.length <= 50 && !/[<>"'&]/.test(tag);
};

export const normalizeTag = (tag: string): string => {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
};
