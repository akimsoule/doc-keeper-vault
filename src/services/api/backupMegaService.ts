import { BaseApiService } from './baseService';

interface BackupStatus {
  lastBackup: string;
  backupCount: number;
  nextScheduled: string;
  status: "idle" | "running" | "completed" | "error";
}

interface Backup {
  id: string;
  type: "full" | "incremental" | "documents-only";
  createdAt: string;
  size: number;
  description?: string;
  status: "completed" | "failed";
}

/**
 * Service de sauvegarde et configuration MEGA
 * Sauvegardes, restauration, configuration MEGA par utilisateur
 */
export class BackupMegaService extends BaseApiService {

  // === SAUVEGARDE ===

  async getBackupStatus() {
    const response = await fetch(`${this.baseUrl}/backup/status`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<BackupStatus>(response);
  }

  async createBackup(
    type: "full" | "incremental" | "documents-only" = "full",
    description?: string
  ) {
    const response = await fetch(`${this.baseUrl}/backup/create`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ type, description }),
    });

    return this.handleResponse<{
      message: string;
      backup: Backup;
    }>(response);
  }

  async restoreBackup(backupId: string, replaceExisting: boolean = false) {
    const response = await fetch(`${this.baseUrl}/backup/restore`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ backupId, replaceExisting }),
    });

    return this.handleResponse<{
      message: string;
      result: {
        documentsRestored: number;
        usersRestored: number;
        success: boolean;
      };
    }>(response);
  }

  // === CONFIGURATION MEGA ===

  async getMegaConfig(): Promise<{ id: string; email: string; hasCredentials: boolean }> {
    const response = await fetch(`${this.baseUrl}/user-mega-config`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ id: string; email: string; hasCredentials: boolean }>(response);
  }

  async saveMegaConfig(config: { email: string; password: string }, isUpdate: boolean = false): Promise<{ id: string; email: string; hasCredentials: boolean }> {
    const response = await fetch(`${this.baseUrl}/user-mega-config`, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });

    return this.handleResponse<{ id: string; email: string; hasCredentials: boolean }>(response);
  }

  async testMegaConnection(): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${this.baseUrl}/user-mega-config?action=test`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ success: boolean; error?: string }>(response);
  }

  async deleteMegaConfig(): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/user-mega-config`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ success: boolean }>(response);
  }
}
