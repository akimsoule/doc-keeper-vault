import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.MEGA_ENCRYPTION_KEY || 'default-secret-key-change-in-production';

/**
 * Service de chiffrement pour les mots de passe MEGA
 */
export class EncryptionService {
  
  /**
   * Génère une clé de chiffrement à partir d'une chaîne secrète
   */
  private getKey(): Buffer {
    return crypto.scryptSync(SECRET_KEY, 'salt', 32);
  }

  /**
   * Chiffre un texte
   * @param text - Texte à chiffrer
   * @returns Texte chiffré avec IV encodé en base64
   */
  encrypt(text: string): string {
    const key = this.getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combiner IV, authTag et texte chiffré
    const combined = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    return Buffer.from(combined).toString('base64');
  }

  /**
   * Déchiffre un texte
   * @param encryptedText - Texte chiffré encodé en base64
   * @returns Texte déchiffré
   */
  decrypt(encryptedText: string): string {
    try {
      const key = this.getKey();
      const combined = Buffer.from(encryptedText, 'base64').toString('utf8');
      const [ivHex, authTagHex, encrypted] = combined.split(':');
      
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch {
      throw new Error('Erreur lors du déchiffrement');
    }
  }
}

export const encryptionService = new EncryptionService();
