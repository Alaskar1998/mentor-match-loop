export interface BaseNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  type: NotificationType;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface GeneralNotification extends BaseNotification {
  type: 'invitation_received' | 'invitation_accepted' | 'invitation_declined' | 'learning_match' | 'system_announcement' | 'giveaway' | 'exchange_completed' | 'profile_viewed';
}

export interface ChatNotification extends BaseNotification {
  type: 'new_message' | 'new_chat';
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
}

export type NotificationType = GeneralNotification['type'] | ChatNotification['type'];
export type Notification = GeneralNotification | ChatNotification;

export interface NotificationCounts {
  general: number;
  chat: number;
  total: number;
}

export interface NotificationService {
  getNotifications: (userId: string, type?: 'general' | 'chat') => Promise<Notification[]>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string, type?: 'general' | 'chat') => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: (userId: string, type?: 'general' | 'chat') => Promise<void>;
  getUnreadCount: (userId: string) => Promise<NotificationCounts>;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<Notification>;
}