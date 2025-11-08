import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for showing toast notifications
 * Works with Socket.IO events to display real-time updates
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  // Remove a notification
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Add a new notification
  const showNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: notification.type || 'info', // 'success', 'error', 'warning', 'info'
      message: notification.message,
      duration: notification.duration || 3000,
      sound: notification.sound || false,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Optional: Play sound for urgent notifications
    if (newNotification.sound && typeof Audio !== 'undefined') {
      try {
        // You can add a sound file here
        // const audio = new Audio('/notification.mp3');
        // audio.play();
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    }

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  }, [removeNotification]);

  return {
    notifications,
    showNotification,
    removeNotification,
  };
}

/**
 * NotificationContainer Component
 * Displays toast notifications in top-right corner
 */
export function NotificationContainer({ notifications, removeNotification, darkMode }) {
  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
      }}
    >
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}

/**
 * Individual toast notification
 */
function NotificationToast({ notification, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation before removal
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, notification.duration - 300);

    return () => clearTimeout(timer);
  }, [notification.duration]);

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          icon: '✅',
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          icon: '🚨',
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          icon: '⚠️',
        };
      case 'info':
      default:
        return {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          icon: 'ℹ️',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div
      style={{
        background: typeStyles.background,
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        animation: isExiting
          ? 'slideOut 300ms ease-out forwards'
          : 'slideIn 300ms ease-out',
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      <span style={{ fontSize: '24px' }}>{typeStyles.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
          {notification.message}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '6px',
          color: 'white',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        ✕
      </button>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default useNotifications;
