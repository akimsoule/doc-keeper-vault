import React, { useState } from 'react';
import { Bell, X, Check, Settings, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications, Notification } from '../hooks/useNotifications';

interface NotificationCenterProps {
  className?: string;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="w-5 h-5 text-error" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    case 'success':
      return <CheckCircle className="w-5 h-5 text-success" />;
    case 'info':
    default:
      return <Info className="w-5 h-5 text-info" />;
  }
};

const getNotificationBadgeColor = (type: Notification['type']) => {
  switch (type) {
    case 'error':
      return 'badge-error';
    case 'warning':
      return 'badge-warning';
    case 'success':
      return 'badge-success';
    case 'info':
    default:
      return 'badge-info';
  }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    notifications,
    unreadCount,
    settings,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings,
    resetSettings,
  } = useNotifications();

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div className={`card bg-base-100 shadow-sm border-l-4 ${
      notification.read ? 'opacity-60' : ''
    } ${
      notification.type === 'error' ? 'border-l-error' :
      notification.type === 'warning' ? 'border-l-warning' :
      notification.type === 'success' ? 'border-l-success' :
      'border-l-info'
    }`}>
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {getNotificationIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                )}
              </div>
              {notification.message && (
                <p className="text-xs text-base-content/70 mb-2">{notification.message}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-base-content/50">
                  {formatTime(notification.timestamp)}
                </span>
                <div className={`badge badge-xs ${getNotificationBadgeColor(notification.type)}`}>
                  {notification.type}
                </div>
              </div>
              
              {/* Actions de la notification */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`btn btn-xs ${
                        action.style === 'primary' ? 'btn-primary' :
                        action.style === 'danger' ? 'btn-error' :
                        'btn-outline'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {!notification.read && (
              <button
                onClick={() => markAsRead(notification.id)}
                className="btn btn-ghost btn-xs"
                title="Marquer comme lu"
              >
                <Check className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => removeNotification(notification.id)}
              className="btn btn-ghost btn-xs text-error"
              title="Supprimer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de notification */}
      <div className="indicator">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-ghost btn-circle"
        >
          <Bell className="w-5 h-5" />
        </button>
        {unreadCount > 0 && (
          <span className="badge badge-primary badge-sm indicator-item">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {/* Panel de notifications */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] bg-base-100 rounded-lg shadow-xl border border-base-300 z-50 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-base-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="badge badge-primary badge-sm">{unreadCount}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="btn btn-ghost btn-xs"
                    title="Paramètres"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  {notifications.length > 0 && (
                    <>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="btn btn-ghost btn-xs"
                          title="Tout marquer comme lu"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={clearAll}
                        className="btn btn-ghost btn-xs text-error"
                        title="Tout supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Paramètres */}
            {showSettings && (
              <div className="p-4 border-b border-base-300 bg-base-50">
                <h4 className="font-medium mb-3">Paramètres des notifications</h4>
                <div className="space-y-2">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={settings.enabled}
                        onChange={(e) => updateSettings({ enabled: e.target.checked })}
                      />
                      <span className="label-text text-sm">Activer les notifications</span>
                    </label>
                  </div>
                  
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={settings.showToasts}
                        onChange={(e) => updateSettings({ showToasts: e.target.checked })}
                      />
                      <span className="label-text text-sm">Afficher les toasts</span>
                    </label>
                  </div>
                  
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={settings.soundEnabled}
                        onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                      />
                      <span className="label-text text-sm">Son des notifications</span>
                    </label>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={resetSettings}
                      className="btn btn-ghost btn-xs"
                    >
                      Réinitialiser
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="btn btn-primary btn-xs"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Contenu des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                  <p className="text-base-content/60">Aucune notification</p>
                </div>
              ) : (
                <div className="p-2">
                  {/* Notifications non lues */}
                  {unreadNotifications.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-base-content/70 mb-2 px-2">
                        Non lues ({unreadNotifications.length})
                      </h4>
                      <div className="space-y-2">
                        {unreadNotifications.map((notification) => (
                          <NotificationItem key={notification.id} notification={notification} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Notifications lues */}
                  {readNotifications.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-base-content/70 mb-2 px-2">
                        Lues ({readNotifications.length})
                      </h4>
                      <div className="space-y-2">
                        {readNotifications.slice(0, 10).map((notification) => (
                          <NotificationItem key={notification.id} notification={notification} />
                        ))}
                      </div>
                      {readNotifications.length > 10 && (
                        <p className="text-xs text-center text-base-content/50 mt-2">
                          ... et {readNotifications.length - 10} autres
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
