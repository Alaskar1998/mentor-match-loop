import { Notification, NotificationCounts, NotificationService, ChatNotification } from "@/types/notifications";
import { supabase } from "@/integrations/supabase/client";

// Real notification service using Supabase
class RealNotificationService implements NotificationService {
  async getNotifications(userId: string, type?: 'general' | 'chat'): Promise<Notification[]> {
    try {
      console.log('🔍 Fetching notifications for user:', userId, 'type:', type);
      
      let query = (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (type === 'general') {
        query = query.not('type', 'in', '(new_message,new_chat)');
      } else if (type === 'chat') {
        query = query.in('type', ['new_message', 'new_chat']);
      }

      const { data, error } = await query;

      console.log('📧 Notifications query result:', { data, error, count: data?.length || 0 });

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        // Return empty array instead of throwing
        return [];
      }

      const notifications = data?.map((notification: any) => ({
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        isRead: notification.is_read,
        type: notification.type,
        actionUrl: notification.action_url,
        metadata: notification.metadata,
        createdAt: new Date(notification.created_at),
        chatId: notification.chat_id,
        senderId: notification.sender_id,
        senderName: notification.sender_name
      })) || [];

      console.log('✅ Processed notifications:', notifications.length, notifications);
      return notifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      console.error('❌ Catch block error details:', JSON.stringify(error, null, 2));
      // Return empty array instead of throwing
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead(userId: string, type?: 'general' | 'chat'): Promise<void> {
    try {
      let query = (supabase as any)
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      if (type === 'general') {
        query = query.not('type', 'in', '(new_message,new_chat)');
      } else if (type === 'chat') {
        query = query.in('type', ['new_message', 'new_chat']);
      }

      const { error } = await query;

      if (error) {
        console.error('Error marking all notifications as read:', error);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async clearAll(userId: string, type?: 'general' | 'chat'): Promise<void> {
    try {
      let query = (supabase as any)
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (type === 'general') {
        query = query.not('type', 'in', '(new_message,new_chat)');
      } else if (type === 'chat') {
        query = query.in('type', ['new_message', 'new_chat']);
      }

      const { error } = await query;

      if (error) {
        console.error('Error clearing notifications:', error);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  async getUnreadCount(userId: string): Promise<NotificationCounts> {
    try {
      const { data: generalData, error: generalError } = await (supabase as any)
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('is_read', false)
        .not('type', 'in', '(new_message,new_chat)');

      const { data: chatData, error: chatError } = await (supabase as any)
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('is_read', false)
        .in('type', ['new_message', 'new_chat']);

      if (generalError || chatError) {
        console.error('Error fetching unread counts:', { generalError, chatError });
        // Return zero counts instead of throwing
        return { general: 0, chat: 0, total: 0 };
      }

      const general = generalData?.length || 0;
      const chat = chatData?.length || 0;

      return {
        general,
        chat,
        total: general + chat
      };
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      // Return zero counts instead of throwing
      return { general: 0, chat: 0, total: 0 };
    }
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    try {
      console.log('📝 Creating notification:', notification);
      
      const notificationData: any = {
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        is_read: notification.isRead,
        type: notification.type,
        action_url: notification.actionUrl,
        metadata: notification.metadata
      };

      // Add chat-specific fields if this is a chat notification
      if (notification.type === 'new_message' || notification.type === 'new_chat') {
        const chatNotification = notification as ChatNotification;
        notificationData.chat_id = chatNotification.chatId;
        notificationData.sender_id = chatNotification.senderId;
        notificationData.sender_name = chatNotification.senderName;
      }

      console.log('💾 Inserting notification data:', notificationData);

      const { data, error } = await (supabase as any)
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      console.log('📧 Notification creation result:', { data, error });

      if (error) {
        console.error('❌ Error creating notification:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      const createdNotification = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        message: data.message,
        isRead: data.is_read,
        type: data.type,
        actionUrl: data.action_url,
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
        chatId: data.chat_id,
        senderId: data.sender_id,
        senderName: data.sender_name
      };

      console.log('✅ Notification created successfully:', createdNotification);
      return createdNotification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      console.error('❌ Catch block error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }
}

export const notificationService = new RealNotificationService();