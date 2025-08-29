import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
}

interface NotificationSettings {
  enabled: boolean;
  showToasts: boolean;
  showPersistent: boolean;
  autoCloseDelay: number; // en millisecondes
  maxNotifications: number;
  soundEnabled: boolean;
}

interface UseNotificationsOptions {
  maxNotifications?: number;
  autoCloseDelay?: number;
  persistNotifications?: boolean;
}

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  showToasts: true,
  showPersistent: true,
  autoCloseDelay: 5000,
  maxNotifications: 50,
  soundEnabled: false,
};

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsResult => {
  const { maxNotifications = 50, persistNotifications = true } = options;

  const [notifications, setNotifications] = useLocalStorage<Notification[]>(
    persistNotifications ? 'notifications' : 'session-notifications',
    []
  );
  const [settings, setSettings] = useLocalStorage<NotificationSettings>('notification-settings', defaultSettings);
  const [, setToastTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  const generateId = useCallback(() => {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );

    // Nettoyer le timer si il existe
    setToastTimers(prev => {
      const timer = prev.get(id);
      if (timer) {
        clearTimeout(timer);
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      }
      return prev;
    });
  }, [setNotifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!settings.enabled) return;

    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Limiter le nombre de notifications
      return updated.slice(0, maxNotifications);
    });

    // Auto-fermeture pour les toasts non persistants
    if (settings.showToasts && !notification.persistent && settings.autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        markAsRead(newNotification.id);
      }, settings.autoCloseDelay);

      setToastTimers(prev => new Map(prev.set(newNotification.id, timer)));
    }

    // Son de notification
    if (settings.soundEnabled) {
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignorer les erreurs de lecture audio (permissions)
        });
      } catch {
        // Ignorer les erreurs d'audio
      }
    }
  }, [settings, maxNotifications, generateId, setNotifications, markAsRead]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Nettoyer tous les timers
    setToastTimers(prev => {
      prev.forEach(timer => clearTimeout(timer));
      return new Map();
    });
  }, [setNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));

    // Nettoyer le timer
    setToastTimers(prev => {
      const timer = prev.get(id);
      if (timer) {
        clearTimeout(timer);
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      }
      return prev;
    });
  }, [setNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    
    // Nettoyer tous les timers
    setToastTimers(prev => {
      prev.forEach(timer => clearTimeout(timer));
      return new Map();
    });
  }, [setNotifications]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, [setSettings]);

  // Nettoyer les timers au démontage
  useEffect(() => {
    return () => {
      setToastTimers(prev => {
        prev.forEach(timer => clearTimeout(timer));
        return prev;
      });
    };
  }, []);

  // Nettoyer les anciennes notifications (plus de 30 jours) au montage seulement
  useEffect(() => {
    const cleanOldNotifications = () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      setNotifications(prev =>
        prev.filter(notification => 
          notification.persistent || new Date(notification.timestamp) > thirtyDaysAgo
        )
      );
    };

    cleanOldNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Volontairement limité au montage pour éviter les boucles infinies

  return {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings,
    resetSettings,
  };
};
