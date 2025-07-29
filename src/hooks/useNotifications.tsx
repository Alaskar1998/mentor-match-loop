import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Notification, NotificationCounts } from "@/types/notifications";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface NotificationContextType {
  generalNotifications: Notification[];
  chatNotifications: Notification[];
  unreadCounts: NotificationCounts;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (type?: 'general' | 'chat') => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: (type?: 'general' | 'chat') => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [generalNotifications, setGeneralNotifications] = useState<Notification[]>([]);
  const [chatNotifications, setChatNotifications] = useState<Notification[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<NotificationCounts>({
    general: 0,
    chat: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    if (!user) {
      console.log('🚫 No user found, skipping notification load');
      return;
    }
    
    console.log('🔄 Loading notifications for user:', user.id);
    setIsLoading(true);
    try {
      const [general, chat, counts] = await Promise.all([
        notificationService.getNotifications(user.id, 'general'),
        notificationService.getNotifications(user.id, 'chat'),
        notificationService.getUnreadCount(user.id)
      ]);
      
      console.log('📊 Notification results:', {
        general: general.length,
        chat: chat.length,
        counts
      });
      
      setGeneralNotifications(general);
      setChatNotifications(chat);
      setUnreadCounts(counts);
    } catch (error) {
      console.error('❌ Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications(); // Refresh to update counts
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async (type?: 'general' | 'chat') => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.id, type);
      await loadNotifications();
      
      toast({
        title: "Notifications marked as read",
        description: type ? `All ${type} notifications marked as read` : "All notifications marked as read"
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAll = async (type?: 'general' | 'chat') => {
    if (!user) return;
    
    try {
      await notificationService.clearAll(user.id, type);
      await loadNotifications();
      
      toast({
        title: "Notifications cleared",
        description: type ? `All ${type} notifications cleared` : "All notifications cleared"
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Poll for updates every 10 seconds for more responsive notifications
      const pollInterval = setInterval(loadNotifications, 10000);
      
      return () => {
        clearInterval(pollInterval);
      };
    } else {
      setGeneralNotifications([]);
      setChatNotifications([]);
      setUnreadCounts({ general: 0, chat: 0, total: 0 });
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      generalNotifications,
      chatNotifications,
      unreadCounts,
      isLoading,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};