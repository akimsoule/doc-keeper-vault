import { PrismaClient } from '@prisma/client';
import { encryptionService } from './encryptionService';

const prisma = new PrismaClient();

export interface MegaConfigData {
  email: string;
  password: string;
  isActive?: boolean;
}

/**
 * Service de gestion des configurations MEGA par utilisateur
 */
export class MegaConfigService {
  /**
   * Crée ou met à jour la configuration MEGA d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param configData - Données de configuration MEGA
   * @returns Configuration MEGA créée ou mise à jour
   */
  async setMegaConfig(userId: string, configData: MegaConfigData) {
    // Chiffrer le mot de passe avant de le stocker
    const encryptedPassword = encryptionService.encrypt(configData.password);

    const megaConfig = await prisma.megaConfig.upsert({
      where: { userId },
      update: {
        email: configData.email,
        password: encryptedPassword,
        isActive: configData.isActive ?? true,
        updatedAt: new Date()
      },
      create: {
        userId,
        email: configData.email,
        password: encryptedPassword,
        isActive: configData.isActive ?? true
      }
    });

    // Retourner sans le mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeConfig } = megaConfig;
    return safeConfig;
  }

  /**
   * Récupère la configuration MEGA d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Configuration MEGA (sans mot de passe) ou null
   */
  async getMegaConfig(userId: string) {
    const config = await prisma.megaConfig.findUnique({
      where: { userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return config;
  }

  /**
   * Récupère les identifiants MEGA déchiffrés pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Identifiants MEGA ou null
   */
  async getMegaCredentials(userId: string): Promise<{ email: string; password: string } | null> {
    const config = await prisma.megaConfig.findUnique({
      where: { 
        userId,
        isActive: true
      }
    });

    if (!config) {
      return null;
    }

    return {
      email: config.email,
      password: encryptionService.decrypt(config.password) // Déchiffrer le mot de passe
    };
  }

  /**
   * Supprime la configuration MEGA d'un utilisateur
   * @param userId - ID de l'utilisateur
   */
  async deleteMegaConfig(userId: string) {
    await prisma.megaConfig.delete({
      where: { userId }
    });
  }

  /**
   * Active ou désactive la configuration MEGA d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param isActive - Statut d'activation
   */
  async toggleMegaConfig(userId: string, isActive: boolean) {
    const config = await prisma.megaConfig.update({
      where: { userId },
      data: { isActive, updatedAt: new Date() },
      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return config;
  }

  /**
   * Teste la connexion MEGA avec les identifiants fournis
   * @param email - Email MEGA
   * @param password - Mot de passe MEGA
   * @returns True si la connexion réussit, false sinon
   */
  async testMegaConnection(email: string, password: string): Promise<boolean> {
    try {
      // Import dynamique pour éviter les problèmes de compilation
      const { Storage } = await import('megajs');
      
      // Tenter la connexion
      await new Storage({ email, password }).ready;
      return true;
    } catch (error) {
      console.error('Erreur lors du test de connexion MEGA:', error);
      return false;
    }
  }
}
