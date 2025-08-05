import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Notification, NotificationCounts } from '@/types/notifications';
import { notificationService } from '@/services/notificationService';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useOptimizedPolling } from './useOptimizedPolling';
import { logger } from '@/utils/logger';

interface NotificationContextType {
  generalNotifications: Notification[];
  chatNotifications: Notification[];
  notifications: Notification[]; // Combined notifications for convenience
  unreadCounts: NotificationCounts;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (type?: 'general' | 'chat') => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: (type?: 'general' | 'chat') => Promise<void>;
  refreshNotifications: () => Promise<void>;
  createNotification: (
    notification: Omit<Notification, 'id' | 'createdAt'>
  ) => Promise<Notification>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [generalNotifications, setGeneralNotifications] = useState<
    Notification[]
  >([]);
  const [chatNotifications, setChatNotifications] = useState<Notification[]>(
    []
  );
  const [unreadCounts, setUnreadCounts] = useState<NotificationCounts>({
    general: 0,
    chat: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        logger.debug('🔄 Loading notifications for user:', user.id);
      }

      const [generalNotificationsData, chatNotificationsData] =
        await Promise.all([
          notificationService.getNotifications(user.id, 'general'),
          notificationService.getNotifications(user.id, 'chat'),
        ]);

      setGeneralNotifications(generalNotificationsData);
      setChatNotifications(chatNotificationsData);

      // Calculate unread counts
      const generalUnread = generalNotificationsData.filter(
        n => !n.isRead
      ).length;
      const chatUnread = chatNotificationsData.filter(n => !n.isRead).length;

      setUnreadCounts({
        general: generalUnread,
        chat: chatUnread,
        total: generalUnread + chatUnread,
      });

      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Notification results:', {
          general: generalNotificationsData.length,
          chat: chatNotificationsData.length,
          counts: {
            general: generalUnread,
            chat: chatUnread,
            total: generalUnread + chatUnread,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications(); // Refresh to update counts
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async (type?: 'general' | 'chat') => {
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id, type);
      await loadNotifications();

      toast({
        title: 'Notifications marked as read',
        description: type
          ? `All ${type} notifications marked as read`
          : 'All notifications marked as read',
      });
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await loadNotifications();
    } catch (error) {
      logger.error('Failed to delete notification:', error);
    }
  };

  const clearAll = async (type?: 'general' | 'chat') => {
    if (!user) return;

    try {
      await notificationService.clearAll(user.id, type);
      await loadNotifications();

      toast({
        title: 'Notifications cleared',
        description: type
          ? `All ${type} notifications cleared`
          : 'All notifications cleared',
      });
    } catch (error) {
      logger.error('Failed to clear notifications:', error);
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const createNotification = async (
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<Notification> => {
    try {
      const createdNotification =
        await notificationService.createNotification(notification);
      await loadNotifications(); // Refresh to update counts
      return createdNotification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  };

  // Optimized polling for notifications
  const { isActive: isPollingNotifications } = useOptimizedPolling(
    async () => {
      // Only poll if user exists and we're not already loading
      if (!user?.id || isLoading) {
        return;
      }
      await loadNotifications();
    },
    {
      interval: 60000, // Increased interval to 1 minute to reduce frequency
      enabled: !!user?.id && !isLoading,
      maxRetries: 3,
    }
  );

  // Load notifications when user changes
  useEffect(() => {
    let isMounted = true;

    const loadNotificationsIfMounted = async () => {
      if (!user || !isMounted) return;

      try {
        setIsLoading(true);

        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          logger.debug('🔄 Loading notifications for user:', user.id);
        }

        const [generalNotificationsData, chatNotificationsData] =
          await Promise.all([
            notificationService.getNotifications(user.id, 'general'),
            notificationService.getNotifications(user.id, 'chat'),
          ]);

        if (!isMounted) return;

        setGeneralNotifications(generalNotificationsData);
        setChatNotifications(chatNotificationsData);

        // Calculate unread counts
        const generalUnread = generalNotificationsData.filter(
          n => !n.isRead
        ).length;
        const chatUnread = chatNotificationsData.filter(n => !n.isRead).length;

        setUnreadCounts({
          general: generalUnread,
          chat: chatUnread,
          total: generalUnread + chatUnread,
        });

        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Notification results:', {
            general: generalNotificationsData.length,
            chat: chatNotificationsData.length,
            counts: {
              general: generalUnread,
              chat: chatUnread,
              total: generalUnread + chatUnread,
            },
          });
        }
      } catch (error) {
        if (isMounted) {
          logger.error('Failed to load notifications:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      loadNotificationsIfMounted();
    } else {
      setGeneralNotifications([]);
      setChatNotifications([]);
      setUnreadCounts({ general: 0, chat: 0, total: 0 });
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Only depend on user ID to prevent unnecessary re-runs

  return (
    <NotificationContext.Provider
      value={{
        generalNotifications,
        chatNotifications,
        notifications: [...generalNotifications, ...chatNotifications], // Combine for convenience
        unreadCounts,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refreshNotifications,
        createNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
