import { Notification, NotificationCounts, NotificationService } from "@/types/notifications";

// Mock storage - in production this would be replaced with actual API calls
class MockNotificationService implements NotificationService {
  private notifications: Notification[] = [];
  private storageKey = 'skillexchange_notifications';

  constructor() {
    this.loadFromStorage();
    this.generateMockNotifications();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.notifications = JSON.parse(stored).map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt)
      }));
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
  }

  private generateMockNotifications() {
    // Only generate initial notifications if storage is empty
    if (this.notifications.length === 0) {
      // We'll generate notifications when a user first logs in
      // This will be handled in the createDemoNotifications method
    }
  }

  // Public method to create demo notifications for a specific user
  createDemoNotifications(userId: string) {
    // Check if user already has notifications
    const existingUserNotifications = this.notifications.filter(n => n.userId === userId);
    if (existingUserNotifications.length > 0) {
      return; // User already has notifications
    }

    const mockNotifications: Omit<Notification, 'id' | 'createdAt'>[] = [
      {
        userId: userId,
        title: 'Welcome to SkillExchange!',
        message: 'Complete your profile to start connecting with other learners',
        isRead: false,
        type: 'system_announcement',
        actionUrl: '/profile',
        metadata: { type: 'welcome' }
      },
      {
        userId: userId,
        title: 'New Invitation Received',
        message: 'Someone wants to learn JavaScript from you',
        isRead: false,
        type: 'invitation_received',
        actionUrl: '/dashboard/invites',
        metadata: { skill: 'JavaScript' }
      },
      {
        userId: userId,
        title: 'Learning Match Found',
        message: 'Found 3 new users who can teach Spanish in your area',
        isRead: false,
        type: 'learning_match',
        actionUrl: '/search?skill=Spanish',
        metadata: { skill: 'Spanish', matches: 3 }
      },
      {
        userId: userId,
        title: 'New Message',
        message: 'Hey! When can we start the JavaScript lessons?',
        isRead: false,
        type: 'new_message',
        actionUrl: '/messages'
      } as any,
      {
        userId: userId,
        title: 'Profile Viewed',
        message: 'Someone viewed your profile today',
        isRead: true,
        type: 'profile_viewed',
        actionUrl: '/profile',
        metadata: { viewCount: 5 }
      }
    ];

    mockNotifications.forEach(notification => {
      this.createNotification(notification);
    });
  }

  async getNotifications(userId: string, type?: 'general' | 'chat'): Promise<Notification[]> {
    // Create demo notifications for new users
    this.createDemoNotifications(userId);
    
    let filtered = this.notifications.filter(n => n.userId === userId);
    
    if (type === 'general') {
      filtered = filtered.filter(n => !['new_message', 'new_chat'].includes(n.type));
    } else if (type === 'chat') {
      filtered = filtered.filter(n => ['new_message', 'new_chat'].includes(n.type));
    }
    
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveToStorage();
    }
  }

  async markAllAsRead(userId: string, type?: 'general' | 'chat'): Promise<void> {
    this.notifications.forEach(notification => {
      if (notification.userId === userId) {
        if (!type || 
            (type === 'general' && !['new_message', 'new_chat'].includes(notification.type)) ||
            (type === 'chat' && ['new_message', 'new_chat'].includes(notification.type))) {
          notification.isRead = true;
        }
      }
    });
    this.saveToStorage();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveToStorage();
  }

  async clearAll(userId: string, type?: 'general' | 'chat'): Promise<void> {
    this.notifications = this.notifications.filter(notification => {
      if (notification.userId !== userId) return true;
      
      if (!type) return false;
      if (type === 'general' && ['new_message', 'new_chat'].includes(notification.type)) return true;
      if (type === 'chat' && !['new_message', 'new_chat'].includes(notification.type)) return true;
      
      return false;
    });
    this.saveToStorage();
  }

  async getUnreadCount(userId: string): Promise<NotificationCounts> {
    const userNotifications = this.notifications.filter(n => n.userId === userId && !n.isRead);
    
    const general = userNotifications.filter(n => !['new_message', 'new_chat'].includes(n.type)).length;
    const chat = userNotifications.filter(n => ['new_message', 'new_chat'].includes(n.type)).length;
    
    return {
      general,
      chat,
      total: general + chat
    };
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    } as Notification;
    
    this.notifications.push(newNotification);
    this.saveToStorage();
    
    return newNotification;
  }

  // Simulate real-time updates by occasionally adding new notifications
  simulateRealTimeUpdates(userId: string) {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const mockMessages = [
          'New learning match found!',
          'Someone viewed your profile',
          'You have a new message',
          'Weekly challenge completed'
        ];
        
        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        
        this.createNotification({
          userId,
          title: 'New Update',
          message: randomMessage,
          isRead: false,
          type: Math.random() < 0.3 ? 'new_message' : 'system_announcement',
          ...(Math.random() < 0.3 && {
            chatId: 'chat-random',
            senderId: 'user-random',
            senderName: 'Random User'
          })
        } as any);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }
}

export const notificationService = new MockNotificationService();