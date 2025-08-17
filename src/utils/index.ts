// Utilitaires pour l'application

/**
 * Formate une date pour l'affichage
 */
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Date(dateString).toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
};

/**
 * Formate une taille de fichier en octets en format lisible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Tronque un texte à la longueur spécifiée
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Vérifie si une URL est une URL de blob
 */
export const isBlobUrl = (url: string): boolean => {
  return url.startsWith('blob:');
};

/**
 * Nettoie une URL de blob
 */
export const cleanupBlobUrl = (url: string): void => {
  if (isBlobUrl(url)) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Génère un ID unique
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Vérifie si un fichier est une image
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? imageExtensions.includes(extension) : false;
};

/**
 * Vérifie si un fichier est un PDF
 */
export const isPdfFile = (filename: string): boolean => {
  return filename.toLowerCase().endsWith('.pdf');
};

/**
 * Obtient l'icône emoji pour un type de fichier
 */
export const getFileIcon = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
    case 'bmp':
      return '🖼️';
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return '📝';
    case 'xls':
    case 'xlsx':
    case 'csv':
      return '📊';
    case 'zip':
    case 'rar':
    case '7z':
      return '📦';
    case 'mp3':
    case 'wav':
    case 'flac':
      return '🎵';
    case 'mp4':
    case 'avi':
    case 'mkv':
      return '🎬';
    default:
      return '📎';
  }
};

/**
 * Détermine le type MIME d'un fichier selon son extension
 */
export const getMimeType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'csv': 'text/csv',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
  };
  
  return extension ? mimeTypes[extension] || 'application/octet-stream' : 'application/octet-stream';
};

/**
 * Valide une adresse email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un mot de passe (au moins 6 caractères)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Échappe les caractères HTML
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Retourne une couleur de badge en fonction de la catégorie
 */
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    personnel: 'badge-primary',
    professionnel: 'badge-secondary',
    juridique: 'badge-accent',
    médical: 'badge-error',
    financier: 'badge-warning',
    autre: 'badge-neutral',
  };
  
  return colors[category.toLowerCase()] || 'badge-neutral';
};

/**
 * Debounce une fonction
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
